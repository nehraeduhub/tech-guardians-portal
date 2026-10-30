<?php
// Tech Guardians CTF portal. Students must be signed in (My Account).
//   GET  ctf.php?action=catalog              -> rooms and tasks (titles only), lock state, progress, plans
//   GET  ctf.php?action=task&room=&t=        -> one task's content, if the student may open it
//   GET  ctf.php?action=file&room=&t=        -> that task's downloadable lab file
//   POST ctf.php?action=submit {room, t, flag} -> checks the flag on the server and records progress
// Admin (signed in on the Manage page) can open everything to preview it.
//   GET  ctf.php?action=admin                -> students' CTF access and progress
//   POST ctf.php?action=grant {userId, until} -> give or remove free access until a date
require_once __DIR__ . '/ctf-lib.php';

$action = $_GET['action'] ?? 'catalog';
$admin = tg_is_admin();
$user = tg_current_user();

function tg_ctf_viewer(?array $user, bool $admin): array
{
    if ($user) return ['key' => $user['id'], 'access' => tg_ctf_access($user), 'name' => $user['name']];
    if ($admin) return ['key' => 'admin', 'access' => ['active' => true, 'plan' => 'admin', 'until' => '', 'pending' => false], 'name' => 'Admin'];
    tg_json(['error' => 'Sign in to your student account to open the CTF portal.', 'login' => true], 401);
}

/** May this viewer open task $id of $room? */
function tg_ctf_can_open(array $room, int $id, array $viewer): bool
{
    return $id === tg_ctf_free_id($room) || !empty($viewer['access']['active']);
}

function tg_ctf_task_or_404(): array
{
    $room = tg_ctf_room((string)($_GET['room'] ?? $GLOBALS['body']['room'] ?? ''));
    if (!$room) tg_error('Room not found.', 404);
    $id = (int)($_GET['t'] ?? $GLOBALS['body']['t'] ?? 0);
    foreach ($room['tasks'] as $t) if ((int)$t['id'] === $id) return [$room, $t];
    tg_error('Task not found.', 404);
}

function tg_ctf_locked(): void
{
    tg_json(['error' => 'This task is part of the CTF plan. The first task of every room is free.', 'locked' => true], 402);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'admin') {
        tg_require_admin();
        $progress = tg_read_json('ctf-progress.json', []);
        $rows = [];
        foreach (tg_users() as $u) {
            if (($u['status'] ?? '') !== 'approved') continue;
            $solved = 0;
            foreach ($progress[$u['id']] ?? [] as $tasks) $solved += count((array)$tasks);
            $rows[] = ['id' => $u['id'], 'name' => $u['name'], 'username' => $u['username'], 'email' => $u['email'],
                'access' => tg_ctf_access($u), 'grantedUntil' => (string)($u['ctf_until'] ?? ''), 'solved' => $solved];
        }
        $tasks = 0;
        foreach (tg_ctf_data()['rooms'] as $r) $tasks += count($r['tasks']);
        tg_json(['students' => $rows, 'plans' => tg_ctf_plans(), 'rooms' => count(tg_ctf_data()['rooms']), 'tasks' => $tasks]);
    }

    $viewer = tg_ctf_viewer($user, $admin);
    $done = tg_ctf_progress($viewer['key']);

    if ($action === 'catalog') {
        $rooms = [];
        foreach (tg_ctf_data()['rooms'] as $r) {
            $tasks = [];
            foreach ($r['tasks'] as $t) {
                $id = (int)$t['id'];
                $tasks[] = ['id' => $id, 'title' => $t['title'], 'topic' => $t['topic'], 'pts' => (int)$t['pts'], 'lab' => !empty($t['lab']),
                    'free' => $id === tg_ctf_free_id($r), 'locked' => !tg_ctf_can_open($r, $id, $viewer), 'solved' => isset($done[$r['slug']][$id])];
            }
            $rooms[] = ['num' => $r['num'], 'slug' => $r['slug'], 'title' => $r['title'], 'subtitle' => $r['subtitle'],
                'difficulty' => $r['difficulty'], 'path' => $r['path'], 'blurb' => $r['blurb'], 'tasks' => $tasks];
        }
        tg_json(['viewer' => ['name' => $viewer['name'], 'admin' => $viewer['key'] === 'admin'], 'access' => $viewer['access'],
            'plans' => tg_ctf_plans(), 'paths' => tg_ctf_data()['paths'], 'rooms' => $rooms]);
    }

    if ($action === 'task' || $action === 'file') {
        [$room, $t] = tg_ctf_task_or_404();
        $id = (int)$t['id'];
        if (!tg_ctf_can_open($room, $id, $viewer)) tg_ctf_locked();
        $lab = $t['lab'] ?? null;
        $file = is_array($lab) && !empty($lab['dl']) ? basename((string)$lab['dl']) : '';

        if ($action === 'file') {
            $path = TG_CTF_DIR . '/labs/' . $file;
            if ($file === '' || !preg_match('/^[A-Za-z0-9._-]+$/', $file) || !is_file($path)) tg_error('This task has no lab file.', 404);
            header('Content-Type: text/plain; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $file . '"');
            header('Cache-Control: private, no-store');
            header('X-Content-Type-Options: nosniff');
            readfile($path);
            exit;
        }

        if (is_array($lab) && $file !== '') $lab['dl'] = '/api/ctf.php?action=file&room=' . rawurlencode($room['slug']) . '&t=' . $id;
        $solved = isset($done[$room['slug']][$id]);
        $ids = array_map(fn($x) => (int)$x['id'], $room['tasks']);
        $pos = array_search($id, $ids, true);
        $neighbour = function ($nid) use ($room, $viewer) {
            return $nid === null ? null : ['id' => $nid, 'locked' => !tg_ctf_can_open($room, $nid, $viewer)];
        };
        tg_json([
            'room' => ['slug' => $room['slug'], 'title' => $room['title'], 'difficulty' => $room['difficulty'], 'path' => $room['path'], 'total' => count($ids),
                'solved' => count($done[$room['slug']] ?? []), 'points' => array_sum(array_map(fn($x) => (int)$x['pts'], $room['tasks'])),
                'earned' => array_sum(array_map(fn($x) => isset($done[$room['slug']][(int)$x['id']]) ? (int)$x['pts'] : 0, $room['tasks']))],
            'task' => ['id' => $id, 'title' => $t['title'], 'topic' => $t['topic'], 'pts' => (int)$t['pts'], 'teach' => $t['teach'], 'example' => $t['example'] ?? '',
                'diagram' => $t['diagram'] ?? '', 'anim' => ($t['anim'] ?? '') ?: ($room['defanim'] ?? ''), 'chal' => $t['chal'], 'hints' => $t['hints'] ?? [],
                'lab' => $lab, 'solved' => $solved, 'learn' => $solved ? ($t['learn'] ?? '') : '', 'free' => $id === tg_ctf_free_id($room)],
            'prev' => $neighbour($pos > 0 ? $ids[$pos - 1] : null),
            'next' => $neighbour($pos !== false && $pos < count($ids) - 1 ? $ids[$pos + 1] : null),
            'access' => $viewer['access'],
        ]);
    }
    tg_error('Unknown action.', 404);
}

$body = tg_require_json_post();

if ($action === 'grant') {
    tg_require_admin();
    $id = (string)($body['userId'] ?? '');
    $until = (string)($body['until'] ?? '');
    if ($until !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $until)) tg_error('Use a date like 2027-03-31, or leave it empty to remove.');
    $found = false;
    tg_update_json('users.json', function ($all) use ($id, $until, &$found) {
        foreach ($all as &$u) {
            if ($u['id'] !== $id) continue;
            $found = true;
            $u['ctf_until'] = $until;
            tg_log($u, $until ? 'CTF access granted until ' . $until : 'CTF access grant removed');
        }
        return $all;
    });
    if (!$found) tg_error('Student not found.', 404);
    tg_json(['ok' => true]);
}

if ($action === 'submit') {
    $viewer = tg_ctf_viewer($user, $admin);
    tg_rate_limit('ctfsubmit', 60, 600);
    [$room, $t] = tg_ctf_task_or_404();
    $id = (int)$t['id'];
    if (!tg_ctf_can_open($room, $id, $viewer)) tg_ctf_locked();
    $flag = trim(mb_substr((string)($body['flag'] ?? ''), 0, 300));
    if ($flag === '') tg_error('Enter the flag first.');
    if (!tg_ctf_flag_ok($t, $flag)) tg_json(['ok' => false]);
    $slug = $room['slug'];
    $key = $viewer['key'];
    tg_update_json('ctf-progress.json', function ($all) use ($key, $slug, $id) {
        if (!isset($all[$key][$slug][$id])) $all[$key][$slug][$id] = gmdate('c');
        return $all;
    });
    tg_json(['ok' => true, 'learn' => $t['learn'] ?? '', 'pts' => (int)$t['pts']]);
}

tg_error('Unknown action.', 404);
