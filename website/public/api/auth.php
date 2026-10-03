<?php
// Admin sign-in for the Manage page.
//   GET  auth.php?action=me              -> { admin: bool }
//   POST auth.php?action=login           { username, password }
//   POST auth.php?action=logout
//   POST auth.php?action=change_password { current, next }
require_once __DIR__ . '/lib.php';

$action = $_GET['action'] ?? 'me';

if ($action === 'me') {
    tg_json(['admin' => tg_is_admin()]);
}

$body = tg_require_json_post();

if ($action === 'login') {
    $ip = tg_client_ip();
    $now = time();
    $attempts = tg_read_json('login-attempts.json', []);
    $recent = array_values(array_filter($attempts[$ip] ?? [], fn($t) => $t > $now - TG_LOGIN_LOCKOUT_SECONDS));
    if (count($recent) >= TG_MAX_LOGIN_ATTEMPTS) {
        tg_error('Too many failed attempts. Try again in 15 minutes.', 429);
    }

    $username = trim((string)($body['username'] ?? ''));
    $password = (string)($body['password'] ?? '');
    $ok = hash_equals(strtolower(TG_ADMIN_USERNAME), strtolower($username))
        && password_verify($password, tg_admin_password_hash());

    if (!$ok) {
        tg_update_json('login-attempts.json', function ($all) use ($ip, $now) {
            foreach ($all as $k => $times) {
                $all[$k] = array_values(array_filter($times, fn($t) => $t > $now - TG_LOGIN_LOCKOUT_SECONDS));
                if (!$all[$k]) unset($all[$k]);
            }
            $all[$ip][] = $now;
            return $all;
        });
        usleep(300000);
        tg_error('Sign-in failed. Check your username and password.', 401);
    }

    tg_update_json('login-attempts.json', function ($all) use ($ip) { unset($all[$ip]); return $all; });
    tg_start_session();
    session_regenerate_id(true);
    $_SESSION['tg_admin'] = true;
    tg_json(['admin' => true]);
}

if ($action === 'logout') {
    tg_start_session();
    $_SESSION = [];
    session_destroy();
    tg_json(['admin' => false]);
}

if ($action === 'change_password') {
    tg_require_admin();
    $current = (string)($body['current'] ?? '');
    $next = (string)($body['next'] ?? '');
    if (!password_verify($current, tg_admin_password_hash())) tg_error('Current password is incorrect.', 403);
    if (strlen($next) < 12) tg_error('New password must be at least 12 characters.');
    tg_update_json('admin.json', function ($data) use ($next) {
        $data['password_hash'] = password_hash($next, PASSWORD_DEFAULT);
        $data['updated_at'] = gmdate('c');
        return $data;
    });
    tg_json(['ok' => true]);
}

tg_error('Unknown action.', 404);
