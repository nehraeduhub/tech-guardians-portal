<?php
// Admin sign-in for the Manage page.
//   GET  auth.php?action=me              -> { admin, mustChange, totp }
//   POST auth.php?action=login           { username, password }  -> { admin } or { need2fa: true }
//   POST auth.php?action=login_2fa       { code }                -> { admin }
//   POST auth.php?action=logout
//   POST auth.php?action=change_password { current, next }
//   POST auth.php?action=totp_setup      -> { secret, uri }       (admin: start two-step sign-in)
//   POST auth.php?action=totp_enable     { code }                 (admin: confirm with a code from the app)
//   POST auth.php?action=totp_disable    { password, code }
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/totp-lib.php';

const TG_2FA_WINDOW = 300; // seconds to enter the code after the password

$action = $_GET['action'] ?? 'me';

function tg_admin_totp(): array
{
    $a = tg_read_json('admin.json', []);
    return ['on' => !empty($a['totp_on']) && !empty($a['totp_secret']), 'secret' => (string)($a['totp_secret'] ?? ''), 'last' => (int)($a['totp_last'] ?? 0)];
}

/** The admin is now signed in. */
function tg_admin_session(): void
{
    tg_start_session();
    session_regenerate_id(true);
    unset($_SESSION['tg_pre2fa'], $_SESSION['tg_2fa_tries']);
    $_SESSION['tg_admin'] = true;
    $_SESSION['tg_login'] = $_SESSION['tg_seen'] = time();
    $_SESSION['tg_fp'] = tg_session_fingerprint();
    tg_sec_log('admin_login_ok', 'admin signed in');
}

/** A wrong password or code: counted, logged and scored. */
function tg_admin_failed(string $type, string $detail): void
{
    $ip = tg_client_ip();
    $now = time();
    $recentAll = 0;
    tg_update_json('login-attempts.json', function ($all) use ($ip, $now, &$recentAll) {
        foreach ($all as $k => $times) {
            $all[$k] = array_values(array_filter((array)$times, fn($t) => $t > $now - TG_LOGIN_LOCKOUT_SECONDS));
            if (!$all[$k]) unset($all[$k]);
        }
        $all[$ip][] = $now;
        foreach ($all as $times) $recentAll += count(array_filter($times, fn($t) => $t > $now - 600));
        return $all;
    });
    tg_sec_log($type, $detail, 10);
    tg_sec_penalize($ip, 10, 'failed admin sign-in');
    // Many failures from many addresses: someone is spreading a guessing attack. Slow every attempt down.
    if ($recentAll > 30) { tg_sec_log('admin_bruteforce', "$recentAll failed admin sign-ins in 10 minutes from all addresses", 0); sleep(3); }
    usleep(300000);
}

if ($action === 'me') {
    $admin = tg_is_admin();
    tg_json(['admin' => $admin, 'mustChange' => $admin && tg_must_change_password(), 'totp' => $admin ? tg_admin_totp()['on'] : false]);
}

$body = tg_require_json_post();

if ($action === 'login') {
    if (!tg_sec_admin_ip_ok()) {
        tg_sec_log('admin_ip_denied', 'admin sign-in from a network that is not allowed', 10);
        tg_sec_penalize(tg_client_ip(), 10, 'admin sign-in from a blocked network');
        tg_error('Sign-in is not allowed from this network.', 403);
    }
    $ip = tg_client_ip();
    $now = time();
    $attempts = tg_read_json('login-attempts.json', []);
    $recent = array_values(array_filter($attempts[$ip] ?? [], fn($t) => $t > $now - TG_LOGIN_LOCKOUT_SECONDS));
    if (count($recent) >= TG_MAX_LOGIN_ATTEMPTS) {
        tg_sec_log('lockout', 'admin sign-in locked for this IP', 0);
        tg_error('Too many failed attempts. Try again in 15 minutes.', 429);
    }

    $username = trim((string)($body['username'] ?? ''));
    $password = (string)($body['password'] ?? '');
    // Both checks always run, so the answer time does not show which one was wrong.
    $userOk = hash_equals(strtolower(TG_ADMIN_USERNAME), strtolower($username));
    $passOk = password_verify($password, tg_admin_password_hash());
    if (!($userOk && $passOk)) {
        tg_admin_failed('admin_login_fail', 'wrong admin username or password');
        tg_error('Sign-in failed. Check your username and password.', 401);
    }

    tg_update_json('login-attempts.json', function ($all) use ($ip) { unset($all[$ip]); return $all; });
    if (tg_admin_totp()['on']) {
        tg_start_session();
        session_regenerate_id(true);
        $_SESSION = ['tg_pre2fa' => time(), 'tg_2fa_tries' => 0];
        tg_json(['need2fa' => true]);
    }
    tg_admin_session();
    tg_json(['admin' => true, 'mustChange' => tg_must_change_password()]);
}

if ($action === 'login_2fa') {
    tg_start_session();
    $t = tg_admin_totp();
    if (empty($_SESSION['tg_pre2fa']) || time() - (int)$_SESSION['tg_pre2fa'] > TG_2FA_WINDOW || !$t['on']) tg_error('Please sign in with your password again.', 401);
    if ((int)($_SESSION['tg_2fa_tries'] ?? 0) >= 5) { $_SESSION = []; tg_error('Too many wrong codes. Sign in again.', 429); }
    $counter = tg_totp_verify($t['secret'], (string)($body['code'] ?? ''));
    if ($counter === 0 || $counter <= $t['last']) { // a code works once
        $_SESSION['tg_2fa_tries'] = (int)($_SESSION['tg_2fa_tries'] ?? 0) + 1;
        tg_admin_failed('2fa_fail', 'wrong or reused authenticator code');
        tg_error('That code is not right. Use the current code from your authenticator app.', 401);
    }
    tg_update_json('admin.json', function ($a) use ($counter) { $a['totp_last'] = $counter; return $a; });
    tg_admin_session();
    tg_json(['admin' => true, 'mustChange' => tg_must_change_password()]);
}

if ($action === 'logout') {
    tg_start_session();
    $_SESSION = [];
    session_destroy();
    tg_json(['admin' => false]);
}

if ($action === 'change_password') {
    tg_require_admin(true);
    $current = (string)($body['current'] ?? '');
    $next = (string)($body['next'] ?? '');
    if (!password_verify($current, tg_admin_password_hash())) { tg_admin_failed('admin_login_fail', 'wrong current password while changing it'); tg_error('Current password is incorrect.', 403); }
    if (strlen($next) < 12) tg_error('New password must be at least 12 characters.');
    if (!preg_match('/[A-Za-z]/', $next) || !preg_match('/\d/', $next)) tg_error('Use letters and numbers in the new password.');
    if ($next === $current || password_verify($next, TG_ADMIN_PASSWORD_HASH)) tg_error('Choose a password different from the current and the original one.');
    tg_update_json('admin.json', function ($data) use ($next) {
        $data['password_hash'] = password_hash($next, PASSWORD_DEFAULT);
        $data['updated_at'] = gmdate('c');
        return $data;
    });
    tg_audit('admin password changed');
    tg_json(['ok' => true]);
}

if ($action === 'totp_setup') {
    tg_require_admin();
    $secret = tg_totp_new_secret();
    tg_update_json('admin.json', function ($a) use ($secret) { $a['totp_pending'] = $secret; return $a; });
    tg_json(['secret' => $secret, 'uri' => tg_totp_uri($secret, TG_ADMIN_USERNAME), 'already' => tg_admin_totp()['on']]);
}

if ($action === 'totp_enable') {
    tg_require_admin();
    $a = tg_read_json('admin.json', []);
    $pending = (string)($a['totp_pending'] ?? '');
    $counter = $pending !== '' ? tg_totp_verify($pending, (string)($body['code'] ?? '')) : 0;
    if ($counter === 0) tg_error('That code is not right. Scan the QR code again and enter the current 6-digit code.');
    tg_update_json('admin.json', function ($a) use ($pending, $counter) {
        unset($a['totp_pending']);
        $a['totp_secret'] = $pending; $a['totp_on'] = true; $a['totp_last'] = $counter;
        return $a;
    });
    tg_audit('admin two-step sign-in turned ON');
    tg_json(['ok' => true]);
}

if ($action === 'totp_disable') {
    tg_require_admin();
    $t = tg_admin_totp();
    if (!password_verify((string)($body['password'] ?? ''), tg_admin_password_hash())) tg_error('Password is incorrect.', 403);
    if ($t['on'] && tg_totp_verify($t['secret'], (string)($body['code'] ?? '')) === 0) tg_error('That code is not right.', 403);
    tg_update_json('admin.json', function ($a) { unset($a['totp_secret'], $a['totp_on'], $a['totp_pending'], $a['totp_last']); return $a; });
    tg_audit('admin two-step sign-in turned OFF');
    tg_json(['ok' => true]);
}

tg_error('Unknown action.', 404);
