<?php
// Enrollment / payment records. Private: only a signed-in admin can read them.
//   POST payments.php                      { name, email, phone, course, amount, utr, date, shot? }  (public, from the payment page)
//   GET  payments.php                      -> [records]                     (admin)
//   GET  payments.php?shot=ID              -> the payment screenshot image  (admin)
//   POST payments.php?action=delete { id } / ?action=clear                  (admin)
// Records: data/payments.json. Screenshots: data/payment-shots/.
require_once __DIR__ . '/lib.php';

const TG_SHOT_DIR = TG_DATA_DIR . '/payment-shots';

function tg_shot_path(string $id): ?string
{
    if (!preg_match('/^[a-f0-9]{16}$/', $id)) return null;
    foreach (['jpg', 'png', 'webp', 'gif'] as $ext) {
        $p = TG_SHOT_DIR . "/$id.$ext";
        if (is_file($p)) return $p;
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    tg_require_admin();
    if (isset($_GET['shot'])) {
        $path = tg_shot_path((string)$_GET['shot']);
        if (!$path) tg_error('Not found.', 404);
        $mime = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'][pathinfo($path, PATHINFO_EXTENSION)];
        header('Content-Type: ' . $mime);
        header('Cache-Control: private, max-age=3600');
        header('X-Content-Type-Options: nosniff');
        readfile($path);
        exit;
    }
    $rows = tg_read_json('payments.json', []);
    foreach ($rows as &$row) {
        if (!empty($row['shot_id'])) $row['shot'] = '/api/payments.php?shot=' . $row['shot_id'];
    }
    tg_json($rows);
}

$action = $_GET['action'] ?? 'create';
$body = tg_require_json_post();

if ($action === 'delete' || $action === 'clear') {
    tg_require_admin();
    $id = (string)($body['id'] ?? '');
    $removed = [];
    tg_update_json('payments.json', function ($rows) use ($action, $id, &$removed) {
        $keep = [];
        foreach ($rows as $row) {
            if ($action === 'clear' || $row['id'] === $id) $removed[] = $row; else $keep[] = $row;
        }
        return $keep;
    });
    foreach ($removed as $row) {
        if (!empty($row['shot_id']) && ($p = tg_shot_path($row['shot_id']))) @unlink($p);
    }
    tg_json(['ok' => true, 'removed' => count($removed)]);
}

if ($action !== 'create') tg_error('Unknown action.', 404);

tg_rate_limit('payments', 10, 3600);

$text = function (string $k, int $max) use ($body): string {
    return mb_substr(trim((string)($body[$k] ?? '')), 0, $max);
};
$record = [
    'id' => bin2hex(random_bytes(8)),
    'name' => $text('name', 120),
    'email' => $text('email', 160),
    'phone' => $text('phone', 30),
    'course' => $text('course', 160),
    'amount' => $text('amount', 30),
    'utr' => $text('utr', 60),
    'date' => $text('date', 60),
    'received_at' => gmdate('c'),
];
if ($record['name'] === '' || $record['utr'] === '') tg_error('Name and transaction ID are required.');

if (!empty($body['shot']) && is_string($body['shot'])) {
    [$bin, $ext] = tg_decode_image($body['shot'], 1500000);
    if (!is_dir(TG_SHOT_DIR) && !mkdir(TG_SHOT_DIR, 0750, true) && !is_dir(TG_SHOT_DIR)) tg_error('Server storage is not writable.', 500);
    file_put_contents(TG_SHOT_DIR . '/' . $record['id'] . '.' . $ext, $bin);
    $record['shot_id'] = $record['id'];
}

tg_update_json('payments.json', function ($rows) use ($record) {
    array_unshift($rows, $record);
    return array_slice($rows, 0, 5000);
});
tg_json(['ok' => true]);
