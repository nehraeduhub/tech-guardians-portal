<?php
// Student accounts and the "My Account" dashboard.
// Students ask for an account; the admin approves it and decides what it can open.
// Public (student):
//   POST users.php?action=register { username, name, email, phone, password } -> request waits for approval
//   POST users.php?action=login    { username (or email), password }
//   POST users.php?action=otp_send  { email }        -> emails a 6-digit sign-in code (when the admin turned it on)
//   POST users.php?action=otp_login { email, code }  -> signs in with that code
//   POST users.php?action=logout
//   GET  users.php?action=me       -> profile, courses and PDFs this student can open
//   POST users.php?action=password { current, next }
// Admin:
//   GET  users.php?action=list     -> all students, catalogue, course materials
//   POST users.php?action=update   { id, status?, courses?, pdfs?, name?, email?, phone?, note? }
//   POST users.php?action=create   { username, name, email, phone, password } -> approved account
//   POST users.php?action=reset    { id, password }
//   POST users.php?action=delete   { id }
//   POST users.php?action=materials { materials: { courseId: { link, note } } }
//   GET  users.php?action=mail_settings / POST { otpEnabled, method, fromEmail, fromName, smtp* } -> email & OTP setup
//   POST users.php?action=mail_test { to } -> send a test email
// Records: data/users.json. Course materials (private links): data/course-access.json.
require_once __DIR__ . '/users-lib.php';
require_once __DIR__ . '/mail-lib.php';

const TG_OTP_TTL = 600;        // a code works for 10 minutes
const TG_OTP_TRIES = 5;        // wrong guesses before the code is thrown away
const TG_OTP_GAP = 60;         // seconds between two codes for one email

/** Is "sign in with an email code" on and able to send? */
function tg_otp_on(): bool { $c = tg_mail_config(); return $c['otpEnabled'] && tg_mail_ready($c); }

/** Start the student's session (after a password or an email code). */
function tg_sign_in(array $user): void
{
    tg_update_json('users.json', function ($all) use ($user) {
        foreach ($all as &$u) if ($u['id'] === $user['id']) { $u['last_login'] = gmdate('c'); $u['logins'] = (int)($u['logins'] ?? 0) + 1; }
        return $all;
    });
    tg_start_session();
    if (empty($_SESSION['tg_admin'])) session_regenerate_id(true);
    $_SESSION['tg_user'] = $user['id'];
    $_SESSION['tg_user_seen'] = time();
    $_SESSION['tg_user_fp'] = tg_session_fingerprint();
}

/** Count a failed sign-in for this IP (shared by password and code sign-in). */
function tg_login_failed(): void
{
    $ip = tg_client_ip();
    $now = time();
    tg_update_json('user-login-fails.json', function ($all) use ($ip, $now) {
        foreach ($all as $k => $t) { $all[$k] = array_values(array_filter($t, fn($x) => $x > $now - 900)); if (!$all[$k]) unset($all[$k]); }
        $all[$ip][] = $now;
        return $all;
    });
    usleep(300000);
}

function tg_login_blocked(): void
{
    $recent = array_filter(tg_read_json('user-login-fails.json', [])[tg_client_ip()] ?? [], fn($t) => $t > time() - 900);
    if (count($recent) >= 8) tg_error('Too many failed attempts. Try again in 15 minutes.', 429);
}

/* ---------- GET ---------- */
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'me') {
        if (!tg_accounts_open()) tg_json(['user' => null, 'closed' => true, 'settings' => tg_public_settings()]);
        $u = tg_current_user();
        if (!$u) tg_json(['user' => null, 'settings' => tg_public_settings(), 'otp' => tg_otp_on()]);
        $courses = tg_course_catalogue();
        $bought = tg_user_purchases($u, $courses);
        $materials = tg_course_materials();
        $courseIds = array_values(array_unique(array_merge($u['courses'] ?? [], $bought['courses'])));
        $pdfIds = array_values(array_unique(array_merge($u['pdfs'] ?? [], $bought['pdfs'])));
        $myCourses = [];
        foreach ($courses as $c) {
            if (!in_array($c['id'], $courseIds, true)) continue;
            $m = $materials[$c['id']] ?? [];
            $myCourses[] = ['id' => $c['id'], 'title' => $c['title'], 'page' => $c['page'] ?: '/course/' . $c['id'],
                'link' => (string)($m['link'] ?? ''), 'note' => (string)($m['note'] ?? '')];
        }
        $myPdfs = [];
        foreach (tg_store()['products'] as $p) {
            if (!in_array($p['id'], $pdfIds, true)) continue;
            $myPdfs[] = ['id' => $p['id'], 'title' => $p['title'] ?? '', 'cover' => $p['cover'] ?? '', 'pages' => (int)($p['pages'] ?? 0),
                'link' => !empty($p['driveLink']) ? (string)$p['driveLink'] : (tg_book_file((string)$p['id']) !== '' ? '/api/users.php?action=book&id=' . rawurlencode((string)$p['id']) : '')];
        }
        tg_json([
            'user' => ['username' => $u['username'], 'name' => $u['name'], 'email' => $u['email'], 'since' => substr((string)($u['approved_at'] ?: $u['created_at']), 0, 10)],
            'courses' => $myCourses, 'pdfs' => $myPdfs, 'pending' => $bought['pending'],
            'blog' => (function () use ($u, $bought) { [$ok, $why] = tg_blog_access($u, $bought); return ['canWrite' => $ok, 'reason' => $why]; })(),
            'settings' => tg_public_settings(),
        ]);
    }

    if ($action === 'book') {
        // A signed-in student downloads a book they own (bought or given by the admin).
        $u = tg_current_user();
        if (!$u) { header('Location: /account.html'); exit; }
        $id = (string)($_GET['id'] ?? '');
        $owned = in_array($id, array_merge($u['pdfs'] ?? [], tg_user_purchases($u, tg_course_catalogue())['pdfs']), true);
        $path = $owned ? tg_book_file($id) : '';
        if ($path === '') tg_error('This book is not in your account.', 403);
        $p = tg_store_product($id);
        tg_send_book($path, (string)($p['title'] ?? $id));
    }

    if ($action === 'mail_settings') {
        tg_require_admin();
        tg_json(tg_mail_config_public() + ['ready' => tg_mail_ready(tg_mail_config())]);
    }

    if ($action === 'list') {
        tg_require_admin();
        $courses = tg_course_catalogue();
        $rows = [];
        foreach (array_reverse(tg_users()) as $u) {
            $row = tg_user_public($u);
            $b = tg_user_purchases($u, $courses);
            $row['bought'] = ['courses' => $b['courses'], 'pdfs' => $b['pdfs']];
            $rows[] = $row;
        }
        $pdfs = array_map(fn($p) => ['id' => $p['id'], 'title' => $p['title'] ?? $p['id']], tg_store()['products']);
        tg_json(['users' => $rows, 'courses' => $courses, 'pdfs' => $pdfs, 'materials' => (object)tg_course_materials()]);
    }
    tg_error('Unknown action.', 404);
}

/* ---------- POST ---------- */
$body = tg_require_json_post();

if (in_array($action, ['register', 'login', 'password', 'otp_send', 'otp_login'], true) && !tg_accounts_open()) {
    tg_error('Student accounts are closed at the moment. Please contact Tech Guardians.', 403);
}

if ($action === 'register') {
    if (empty($body['agree'])) tg_error('Please accept the Terms & Conditions.');
    tg_rate_limit('register', 5, 3600);
    $profile = tg_check_profile($body, true);
    tg_add_user($profile, (string)$body['password'], 'pending');
    tg_json(['ok' => true, 'status' => 'pending']);
}

if ($action === 'login') {
    tg_login_blocked();
    $login = strtolower(trim((string)($body['username'] ?? '')));
    $password = (string)($body['password'] ?? '');
    $user = null;
    foreach (tg_users() as $u) if ($login !== '' && ($u['username'] === $login || strcasecmp($u['email'], $login) === 0) && $u['status'] !== 'rejected') { $user = $u; break; }
    // Always run one bcrypt check so timing does not reveal which user IDs exist.
    $ok = password_verify($password, $user['password_hash'] ?? '$2y$12$Clcam7rsvOMWib3UfW1HDe2Dz70UzDOUdYPg.cC0XeBnM6pE9YIMG');
    if (!$user || !$ok) {
        tg_login_failed();
        tg_error('Sign-in failed. Check your user ID and password.', 401);
    }
    if ($user['status'] === 'pending') tg_error('Your account request is waiting for approval. We will confirm it soon.', 403);
    if ($user['status'] !== 'approved') tg_error('This account is not active. Please contact Tech Guardians.', 403);
    tg_sign_in($user);
    tg_json(['ok' => true]);
}

if ($action === 'otp_send') {
    if (!tg_otp_on()) tg_error('Sign-in with an email code is not available. Please use your password.', 403);
    tg_rate_limit('otpsend', 6, 900);
    $email = strtolower(tg_mail_line(mb_substr((string)($body['email'] ?? ''), 0, 160)));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) tg_error('Please enter the email address of your account.');
    $user = null;
    foreach (tg_users() as $u) if (strcasecmp((string)$u['email'], $email) === 0 && $u['status'] === 'approved') { $user = $u; break; }
    // The same answer whether or not the email has an account, so addresses cannot be probed.
    $answer = ['ok' => true, 'message' => 'If this email belongs to an active student account, a 6-digit code is on its way. Check your inbox and spam folder.', 'ttl' => TG_OTP_TTL, 'gap' => TG_OTP_GAP];
    if (!$user) { usleep(random_int(200000, 600000)); tg_json($answer); }
    $now = time();
    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $tooSoon = false;
    tg_update_json('otp-codes.json', function ($all) use ($email, $code, $now, $user, &$tooSoon) {
        foreach ($all as $k => $o) if (($o['exp'] ?? 0) < $now - 3600) unset($all[$k]);
        $prev = $all[$email] ?? null;
        $sends = array_values(array_filter((array)($prev['sends'] ?? []), fn($t) => $t > $now - 3600));
        if (($prev['sent'] ?? 0) > $now - TG_OTP_GAP || count($sends) >= 5) { $tooSoon = true; return $all; }
        $sends[] = $now;
        $all[$email] = ['hash' => password_hash($code, PASSWORD_DEFAULT), 'exp' => $now + TG_OTP_TTL, 'tries' => 0, 'sent' => $now, 'sends' => $sends, 'user' => $user['id']];
        return $all;
    });
    if ($tooSoon) tg_error('A code was sent recently. Please wait a minute (at most 5 codes an hour) and check your spam folder.', 429);
    $err = tg_otp_mail($user['email'], (string)$user['name'], $code);
    if ($err !== '') {
        error_log('Tech Guardians OTP email failed: ' . $err);
        tg_error('We could not send the email right now. Please sign in with your password or contact us on WhatsApp.', 502);
    }
    tg_json($answer);
}

if ($action === 'otp_login') {
    if (!tg_otp_on()) tg_error('Sign-in with an email code is not available. Please use your password.', 403);
    tg_login_blocked();
    $email = strtolower(trim(mb_substr((string)($body['email'] ?? ''), 0, 160)));
    $code = preg_replace('/\D/', '', (string)($body['code'] ?? ''));
    $now = time();
    $result = 'bad';
    $userId = '';
    tg_update_json('otp-codes.json', function ($all) use ($email, $code, $now, &$result, &$userId) {
        $o = $all[$email] ?? null;
        if (!$o || empty($o['hash']) || ($o['exp'] ?? 0) < $now) { $result = 'expired'; return $all; }
        if (strlen($code) === 6 && password_verify($code, $o['hash'])) { $result = 'ok'; $userId = (string)$o['user']; unset($all[$email]['hash']); return $all; }
        $all[$email]['tries'] = (int)($o['tries'] ?? 0) + 1;
        if ($all[$email]['tries'] >= TG_OTP_TRIES) { unset($all[$email]['hash']); $result = 'locked'; }
        return $all;
    });
    if ($result !== 'ok') {
        tg_login_failed();
        tg_error($result === 'expired' ? 'This code has expired or was not requested. Ask for a new code.'
            : ($result === 'locked' ? 'Too many wrong codes. Ask for a new code.' : 'That code is not right. Check the latest email and try again.'), 401);
    }
    $user = null;
    foreach (tg_users() as $u) if ($u['id'] === $userId) { $user = $u; break; }
    if (!$user || $user['status'] !== 'approved') tg_error('This account is not active. Please contact Tech Guardians.', 403);
    tg_sign_in($user);
    tg_json(['ok' => true]);
}

if ($action === 'logout') {
    tg_start_session();
    unset($_SESSION['tg_user'], $_SESSION['tg_user_seen'], $_SESSION['tg_user_fp']);
    tg_json(['ok' => true]);
}

if ($action === 'password') {
    $me = tg_current_user();
    if (!$me) tg_error('Please sign in again.', 401);
    if (!password_verify((string)($body['current'] ?? ''), $me['password_hash'])) tg_error('Current password is incorrect.', 403);
    $next = (string)($body['next'] ?? '');
    tg_check_new_password($next);
    tg_update_json('users.json', function ($all) use ($me, $next) {
        foreach ($all as &$u) if ($u['id'] === $me['id']) { $u['password_hash'] = password_hash($next, PASSWORD_DEFAULT); tg_log($u, 'Changed password'); }
        return $all;
    });
    tg_json(['ok' => true]);
}

/* ---------- admin ---------- */
tg_require_admin();

if ($action === 'create') {
    $profile = tg_check_profile($body, true);
    $u = tg_add_user($profile, (string)$body['password'], 'approved');
    tg_json(['ok' => true, 'id' => $u['id']]);
}

if ($action === 'mail_settings') {
    tg_require_admin();
    $c = tg_mail_config();
    $from = tg_mail_line((string)($body['fromEmail'] ?? ''));
    if ($from !== '' && !filter_var($from, FILTER_VALIDATE_EMAIL)) tg_error('Enter a valid "send from" email address.');
    $host = strtolower(tg_mail_line((string)($body['smtpHost'] ?? '')));
    if ($host !== '' && !preg_match('/^[a-z0-9.-]{3,120}$/', $host)) tg_error('Enter the SMTP server name, e.g. smtp.hostinger.com.');
    $next = [
        'otpEnabled' => !empty($body['otpEnabled']),
        'method' => ($body['method'] ?? '') === 'mail' ? 'mail' : 'smtp',
        'fromEmail' => $from,
        'fromName' => mb_substr(tg_mail_line((string)($body['fromName'] ?? '')), 0, 60) ?: 'Tech Guardians',
        'smtpHost' => $host,
        'smtpPort' => max(1, min(65535, (int)($body['smtpPort'] ?? 465))),
        'smtpSecure' => ($body['smtpSecure'] ?? '') === 'tls' ? 'tls' : 'ssl',
        'smtpUser' => mb_substr(tg_mail_line((string)($body['smtpUser'] ?? '')), 0, 160),
        // An empty password box keeps the saved password.
        'smtpPass' => (string)($body['smtpPass'] ?? '') !== '' ? mb_substr((string)$body['smtpPass'], 0, 200) : $c['smtpPass'],
    ];
    if (!empty($body['clearPass'])) $next['smtpPass'] = '';
    if ($next['otpEnabled'] && !tg_mail_ready($next)) tg_error('Fill in the email settings (and SMTP login) before turning on email-code sign-in.');
    tg_update_json('mail-config.json', fn() => $next, []);
    tg_json(tg_mail_config_public() + ['ready' => tg_mail_ready($next)]);
}

if ($action === 'mail_test') {
    tg_require_admin();
    tg_rate_limit('mailtest', 10, 600);
    $to = tg_mail_line((string)($body['to'] ?? ''));
    $err = tg_send_mail($to, 'Tech Guardians test email', "This is a test email from your Tech Guardians website.
Email sign-in codes will be sent the same way.",
        '<p style="font-family:Arial,sans-serif">This is a test email from your <b>Tech Guardians</b> website.<br>Email sign-in codes will be sent the same way.</p>');
    if ($err !== '') tg_error($err, 502);
    tg_json(['ok' => true]);
}

if ($action === 'materials') {
    $in = is_array($body['materials'] ?? null) ? $body['materials'] : [];
    $ids = array_column(tg_course_catalogue(), 'id');
    $clean = [];
    foreach ($in as $id => $m) {
        if (!in_array((string)$id, $ids, true) || !is_array($m)) continue;
        $link = trim((string)($m['link'] ?? ''));
        if ($link !== '' && !preg_match('#^https?://#i', $link)) tg_error('Course material links must start with https://');
        $clean[(string)$id] = ['link' => mb_substr($link, 0, 500), 'note' => mb_substr(trim((string)($m['note'] ?? '')), 0, 500)];
    }
    tg_update_json('course-access.json', fn() => (object)$clean, []);
    tg_json(['ok' => true]);
}

$id = (string)($body['id'] ?? '');
$found = false;

if ($action === 'update') {
    $courseIds = array_column(tg_course_catalogue(), 'id');
    $pdfIds = array_column(tg_store()['products'], 'id');
    tg_update_json('users.json', function ($all) use ($id, $body, $courseIds, $pdfIds, &$found) {
        foreach ($all as &$u) {
            if ($u['id'] !== $id) continue;
            $found = true;
            if (isset($body['status']) && in_array($body['status'], TG_USER_STATUSES, true) && $body['status'] !== $u['status']) {
                $u['status'] = $body['status'];
                if ($u['status'] === 'approved' && empty($u['approved_at'])) $u['approved_at'] = gmdate('c');
                tg_log($u, 'Status: ' . $u['status']);
            }
            if (isset($body['courses']) && is_array($body['courses'])) $u['courses'] = tg_ids($body['courses'], $courseIds);
            if (isset($body['pdfs']) && is_array($body['pdfs'])) $u['pdfs'] = tg_ids($body['pdfs'], $pdfIds);
            foreach (['name' => 80, 'phone' => 20, 'note' => 500] as $k => $max) if (isset($body[$k])) $u[$k] = mb_substr(trim((string)$body[$k]), 0, $max);
            if (isset($body['email']) && filter_var($body['email'], FILTER_VALIDATE_EMAIL)) $u['email'] = strtolower(trim((string)$body['email']));
        }
        return $all;
    });
}

if ($action === 'reset') {
    $next = (string)($body['password'] ?? '');
    tg_check_new_password($next);
    tg_update_json('users.json', function ($all) use ($id, $next, &$found) {
        foreach ($all as &$u) if ($u['id'] === $id) { $found = true; $u['password_hash'] = password_hash($next, PASSWORD_DEFAULT); tg_log($u, 'Password reset by admin'); }
        return $all;
    });
}

if ($action === 'delete') {
    tg_update_json('users.json', function ($all) use ($id, &$found) {
        $keep = [];
        foreach ($all as $u) { if ($u['id'] === $id) $found = true; else $keep[] = $u; }
        return $keep;
    });
}

if (!in_array($action, ['update', 'reset', 'delete'], true)) tg_error('Unknown action.', 404);
if (!$found) tg_error('Student not found.', 404);
tg_json(['ok' => true]);
