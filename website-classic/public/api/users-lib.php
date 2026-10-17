<?php
// Shared student-account helpers (used by users.php and posts.php).
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

/* ---------- TG Blogs: who may write ---------- */
function tg_blog_settings(): array
{
    $s = tg_read_json('blog-settings.json', []);
    return ['enabled' => (bool)($s['enabled'] ?? true), 'buyersOnly' => (bool)($s['buyersOnly'] ?? true)];
}

/** [allowed, reason] for a student. Admin choice per student: auto (default), allow, deny. */
function tg_blog_access(array $u, ?array $bought = null): array
{
    $s = tg_blog_settings();
    if (!$s['enabled']) return [false, 'Student blogging is switched off at the moment.'];
    $mode = (string)($u['blog'] ?? 'auto');
    if ($mode === 'allow') return [true, ''];
    if ($mode === 'deny') return [false, 'Blog writing is not enabled for your account. Contact Tech Guardians.'];
    if (!$s['buyersOnly']) return [true, ''];
    $bought = $bought ?? tg_user_purchases($u, tg_course_catalogue());
    $has = !empty($u['courses']) || !empty($u['pdfs']) || !empty($bought['courses']) || !empty($bought['pdfs']);
    return $has ? [true, ''] : [false, 'Blog writing opens after you buy a training program or PDF book from Tech Guardians.'];
}
