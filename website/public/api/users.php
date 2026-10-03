<?php
// Student accounts and the "My Account" dashboard.
// Students ask for an account; the admin approves it and decides what it can open.
// Public (student):
//   POST users.php?action=register { username, name, email, phone, password } -> request waits for approval
//   POST users.php?action=login    { username (or email), password }
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
// Records: data/users.json. Course materials (private links): data/course-access.json.
require_once __DIR__ . '/store-lib.php';

const TG_USER_IDLE_SECONDS = 43200;  // students stay signed in for 12 hours of inactivity
const TG_USER_STATUSES = ['pending', 'approved', 'rejected', 'disabled'];

/* ---------- helpers ---------- */
function tg_users(): array { return tg_read_json('users.json', []); }

function tg_user_public(array $u): array
{
    unset($u['password_hash']);
    return $u;
}

/** Course catalogue: content/courses.json merged with the admin's course edits. */
function tg_course_catalogue(): array
{
    $base = json_decode((string)@file_get_contents(dirname(__DIR__) . '/content/courses.json'), true) ?: [];
    $settings = tg_read_json('settings.json', []);
    $edits = $settings['tg_courses_admin']['value'] ?? [];
    $byId = [];
    foreach ($base as $c) if (!empty($c['id'])) $byId[$c['id']] = $c;
    if (is_array($edits)) foreach ($edits as $c) if (is_array($c) && !empty($c['id'])) $byId[$c['id']] = array_merge($byId[$c['id']] ?? [], $c);
    $out = [];
    foreach ($byId as $id => $c) $out[] = ['id' => (string)$id, 'title' => (string)($c['title'] ?? $id), 'page' => (string)($c['page'] ?? ''), 'description' => (string)($c['description'] ?? '')];
    return $out;
}

function tg_norm(string $s): string { return preg_replace('/[^a-z0-9]+/', ' ', strtolower(trim($s))); }

/** Approved orders paid with this student's email or phone, mapped to course and PDF ids. */
function tg_user_purchases(array $u, array $courses): array
{
    $email = strtolower(trim((string)($u['email'] ?? '')));
    $phone = substr(preg_replace('/\D/', '', (string)($u['phone'] ?? '')), -10);
    $found = ['courses' => [], 'pdfs' => [], 'pending' => []];
    foreach (tg_read_json('payments.json', []) as $o) {
        $oEmail = strtolower(trim((string)($o['email'] ?? '')));
        $oPhone = substr(preg_replace('/\D/', '', (string)($o['phone'] ?? '')), -10);
        $mine = ($email !== '' && $oEmail === $email) || (strlen($phone) === 10 && $oPhone === $phone);
        if (!$mine) continue;
        $status = (string)($o['status'] ?? 'pending');
        $title = (string)($o['course'] ?? '');
        if ($status === 'pending' || $status === 'rejected') {
            $found['pending'][] = ['title' => $title, 'status' => $status, 'date' => (string)($o['date'] ?? ''), 'amount' => (string)($o['amount'] ?? '')];
            continue;
        }
        // approved website orders, or payments recorded in the Google Sheet
        if (($o['type'] ?? '') === 'pdf' && !empty($o['productId'])) { $found['pdfs'][] = (string)$o['productId']; continue; }
        $t = tg_norm($title);
        if ($t === '') continue;
        foreach ($courses as $c) {
            $ct = tg_norm($c['title']);
            if ($ct !== '' && (strpos($t, $ct) !== false || strpos($ct, $t) !== false)) { $found['courses'][] = $c['id']; break; }
        }
        foreach (tg_store()['products'] as $p) {
            $pt = tg_norm((string)($p['title'] ?? ''));
            if ($pt !== '' && (strpos($t, $pt) !== false || strpos($pt, $t) !== false)) { $found['pdfs'][] = (string)$p['id']; break; }
        }
    }
    $found['courses'] = array_values(array_unique($found['courses']));
    $found['pdfs'] = array_values(array_unique($found['pdfs']));
    $found['pending'] = array_slice($found['pending'], 0, 10);
    return $found;
}

function tg_ids(array $list, array $allowed): array
{
    $out = [];
    foreach ($list as $id) if (is_string($id) && in_array($id, $allowed, true)) $out[] = $id;
    return array_values(array_unique($out));
}

function tg_check_new_password(string $p): void
{
    if (strlen($p) < 8 || strlen($p) > 200) tg_error('Password must be at least 8 characters.');
    if (!preg_match('/[A-Za-z]/', $p) || !preg_match('/\d/', $p)) tg_error('Use letters and numbers in the password.');
}

function tg_check_profile(array $b, bool $needPassword): array
{
    $u = [
        'username' => strtolower(trim((string)($b['username'] ?? ''))),
        'name' => mb_substr(trim((string)($b['name'] ?? '')), 0, 80),
        'email' => mb_substr(strtolower(trim((string)($b['email'] ?? ''))), 0, 160),
        'phone' => mb_substr(preg_replace('/[^\d+ ]/', '', (string)($b['phone'] ?? '')), 0, 20),
    ];
    if (!preg_match('/^[a-z0-9][a-z0-9._-]{3,29}$/', $u['username'])) tg_error('User ID must be 4–30 letters, digits, dot, dash or underscore.');
    if ($u['name'] === '') tg_error('Please enter your full name.');
    if (!filter_var($u['email'], FILTER_VALIDATE_EMAIL)) tg_error('Please enter a valid email address.');
    if (strlen(preg_replace('/\D/', '', $u['phone'])) < 10) tg_error('Please enter a valid mobile number.');
    if ($needPassword) tg_check_new_password((string)($b['password'] ?? ''));
    return $u;
}

function tg_add_user(array $profile, string $password, string $status): array
{
    $user = $profile + [
        'id' => bin2hex(random_bytes(8)),
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'status' => $status,
        'courses' => [], 'pdfs' => [], 'note' => '',
        'created_at' => gmdate('c'),
        'approved_at' => $status === 'approved' ? gmdate('c') : '',
        'last_login' => '', 'logins' => 0,
        'history' => [['at' => gmdate('c'), 'event' => $status === 'approved' ? 'Created by admin' : 'Requested an account']],
    ];
    $clash = '';
    tg_update_json('users.json', function ($all) use ($user, &$clash) {
        foreach ($all as $u) {
            if ($u['username'] === $user['username']) { $clash = 'This user ID is taken. Please choose another.'; return $all; }
            if (strcasecmp($u['email'], $user['email']) === 0 && $u['status'] !== 'rejected') { $clash = 'An account with this email already exists. Sign in, or contact us if you forgot your password.'; return $all; }
        }
        $all[] = $user;
        return array_slice($all, -10000);
    });
    if ($clash) tg_error($clash, 409);
    return $user;
}

function tg_log(array &$u, string $event): void
{
    $u['history'] = array_slice(array_merge([['at' => gmdate('c'), 'event' => $event]], $u['history'] ?? []), 0, 30);
}

/** Signed-in, approved student, or null. */
function tg_current_user(): ?array
{
    tg_start_session();
    $id = (string)($_SESSION['tg_user'] ?? '');
    if ($id === '') return null;
    $stale = time() - (int)($_SESSION['tg_user_seen'] ?? 0) > TG_USER_IDLE_SECONDS
        || !hash_equals((string)($_SESSION['tg_user_fp'] ?? ''), tg_session_fingerprint());
    $user = null;
    foreach (tg_users() as $u) if ($u['id'] === $id) { $user = $u; break; }
    if ($stale || !$user || $user['status'] !== 'approved') {
        unset($_SESSION['tg_user'], $_SESSION['tg_user_seen'], $_SESSION['tg_user_fp']);
        return null;
    }
    $_SESSION['tg_user_seen'] = time();
    return $user;
}

function tg_course_materials(): array
{
    $m = tg_read_json('course-access.json', []);
    return is_array($m) ? $m : [];
}

/** Admin can switch student accounts off in Manage → Sections & Pages ("/account"). */
function tg_accounts_open(): bool
{
    $settings = tg_read_json('settings.json', []);
    $hidden = $settings['tg_layout']['value']['hiddenPages'] ?? [];
    return !(is_array($hidden) && in_array('/account', $hidden, true));
}

/* ---------- GET ---------- */
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'me') {
        if (!tg_accounts_open()) tg_json(['user' => null, 'closed' => true, 'settings' => tg_public_settings()]);
        $u = tg_current_user();
        if (!$u) tg_json(['user' => null, 'settings' => tg_public_settings()]);
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
                'link' => (string)($p['driveLink'] ?? '')];
        }
        tg_json([
            'user' => ['username' => $u['username'], 'name' => $u['name'], 'email' => $u['email'], 'since' => substr((string)($u['approved_at'] ?: $u['created_at']), 0, 10)],
            'courses' => $myCourses, 'pdfs' => $myPdfs, 'pending' => $bought['pending'],
            'settings' => tg_public_settings(),
        ]);
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

if (in_array($action, ['register', 'login', 'password'], true) && !tg_accounts_open()) {
    tg_error('Student accounts are closed at the moment. Please contact Tech Guardians.', 403);
}

if ($action === 'register') {
    tg_rate_limit('register', 5, 3600);
    $profile = tg_check_profile($body, true);
    tg_add_user($profile, (string)$body['password'], 'pending');
    tg_json(['ok' => true, 'status' => 'pending']);
}

if ($action === 'login') {
    $ip = tg_client_ip();
    $now = time();
    $fails = tg_read_json('user-login-fails.json', []);
    $recent = array_filter($fails[$ip] ?? [], fn($t) => $t > $now - 900);
    if (count($recent) >= 8) tg_error('Too many failed attempts. Try again in 15 minutes.', 429);
    $login = strtolower(trim((string)($body['username'] ?? '')));
    $password = (string)($body['password'] ?? '');
    $user = null;
    foreach (tg_users() as $u) if ($login !== '' && ($u['username'] === $login || strcasecmp($u['email'], $login) === 0) && $u['status'] !== 'rejected') { $user = $u; break; }
    // Always run one bcrypt check so timing does not reveal which user IDs exist.
    $ok = password_verify($password, $user['password_hash'] ?? '$2y$12$Clcam7rsvOMWib3UfW1HDe2Dz70UzDOUdYPg.cC0XeBnM6pE9YIMG');
    if (!$user || !$ok) {
        tg_update_json('user-login-fails.json', function ($all) use ($ip, $now) {
            foreach ($all as $k => $t) { $all[$k] = array_values(array_filter($t, fn($x) => $x > $now - 900)); if (!$all[$k]) unset($all[$k]); }
            $all[$ip][] = $now;
            return $all;
        });
        usleep(300000);
        tg_error('Sign-in failed. Check your user ID and password.', 401);
    }
    if ($user['status'] === 'pending') tg_error('Your account request is waiting for approval. We will confirm it soon.', 403);
    if ($user['status'] !== 'approved') tg_error('This account is not active. Please contact Tech Guardians.', 403);
    tg_update_json('users.json', function ($all) use ($user) {
        foreach ($all as &$u) if ($u['id'] === $user['id']) { $u['last_login'] = gmdate('c'); $u['logins'] = (int)($u['logins'] ?? 0) + 1; }
        return $all;
    });
    tg_start_session();
    if (empty($_SESSION['tg_admin'])) session_regenerate_id(true);
    $_SESSION['tg_user'] = $user['id'];
    $_SESSION['tg_user_seen'] = time();
    $_SESSION['tg_user_fp'] = tg_session_fingerprint();
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
