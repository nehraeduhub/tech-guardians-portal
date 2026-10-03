<?php
// Orders and enrollments (courses and PDFs).
// Public (buyer):
//   POST payments.php                         { type: course|pdf, productId?, course?, amount?, name, email, phone, utr, date, shot? }
//                                             -> { id, token, status, orderUrl }
//   GET  payments.php?action=order&id=&token= -> order status for the buyer's order page
//   GET  payments.php?action=download&id=&token= -> redirects to the PDF once the order is approved
// Admin:
//   GET  payments.php                         -> all records (Google Sheet rows are synced in first, at most once a minute)
//   GET  payments.php?action=sync             -> sync the Google Sheet now; returns the sync status
//   GET  payments.php?shot=ID                 -> payment screenshot
//   POST payments.php?action=status { id, status: pending|approved|rejected }
//   POST payments.php?action=delete { id } / ?action=clear
// Records: data/payments.json. Screenshots: data/payment-shots/.
require_once __DIR__ . '/store-lib.php';

const TG_SHOT_DIR = TG_DATA_DIR . '/payment-shots';
const TG_STATUSES = ['pending', 'approved', 'rejected', 'recorded'];

function tg_shot_path(string $id): ?string
{
    if (!preg_match('/^[a-f0-9]{16}$/', $id)) return null;
    foreach (['jpg', 'png', 'webp', 'gif'] as $ext) {
        $p = TG_SHOT_DIR . "/$id.$ext";
        if (is_file($p)) return $p;
    }
    return null;
}

function tg_find_order(string $id, string $token): ?array
{
    if (!preg_match('/^[a-f0-9]{16}$/', $id) || !preg_match('/^[a-f0-9]{32}$/', $token)) return null;
    foreach (tg_read_json('payments.json', []) as $row) {
        if (($row['id'] ?? '') === $id && !empty($row['token']) && hash_equals($row['token'], $token)) return $row;
    }
    return null;
}

function tg_order_download_link(array $order): string
{
    if (($order['type'] ?? '') !== 'pdf' || ($order['status'] ?? '') !== 'approved') return '';
    $p = tg_store_product((string)($order['productId'] ?? ''));
    return $p ? (string)($p['driveLink'] ?? '') : '';
}

/* ---------- Google Sheet sync ---------- */
function tg_sheet_rows(string $url): array
{
    $isCsv = preg_match('#output=csv|format=csv|\.csv(\?|$)#i', $url);
    $fetch = $isCsv ? $url : $url . (strpos($url, '?') === false ? '?' : '&') . 'action=list';
    $ch = curl_init($fetch);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_USERAGENT => 'TechGuardiansSync/1.0']);
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($raw === false || $code >= 400) throw new RuntimeException($err ?: "The sheet answered with HTTP $code.");
    $rows = [];
    $json = json_decode($raw, true);
    if (is_array($json)) {
        $list = array_is_list($json) ? $json : ($json['rows'] ?? $json['data'] ?? []);
        if (isset($list[0]) && array_is_list($list[0])) { // [[header...], [row...]]
            $head = array_map('strval', array_shift($list));
            foreach ($list as $r) $rows[] = array_combine($head, array_pad(array_map('strval', $r), count($head), ''));
        } else {
            foreach ($list as $r) if (is_array($r)) $rows[] = $r;
        }
    } elseif ($isCsv || strpos($raw, ',') !== false) {
        $lines = array_map('str_getcsv', preg_split('/\r\n|\n|\r/', trim($raw)));
        $head = array_shift($lines) ?: [];
        foreach ($lines as $r) if (count($r) > 1) $rows[] = array_combine($head, array_pad($r, count($head), ''));
    } else {
        throw new RuntimeException('The sheet did not return a list. Use the Apps Script "list" action or a "Publish to web" CSV link.');
    }
    return $rows;
}

function tg_pick(array $row, array $keys): string
{
    foreach ($row as $k => $v) {
        $norm = preg_replace('/[^a-z]/', '', strtolower((string)$k));
        foreach ($keys as $c) if ($norm !== '' && strpos($norm, $c) !== false && trim((string)$v) !== '') return trim((string)$v);
    }
    return '';
}

function tg_sheet_sync(bool $force = false): array
{
    $settings = tg_store()['settings'];
    $status = tg_read_json('sheet-sync.json', ['at' => 0]);
    $url = (string)($settings['sheetUrl'] ?? '');
    if ($url === '' || (!$force && empty($settings['sheetSync']))) return $status + ['enabled' => false];
    if (!$force && time() - (int)($status['at'] ?? 0) < 60) return $status + ['enabled' => true];
    try {
        $rows = tg_sheet_rows($url);
        $added = 0;
        tg_update_json('payments.json', function ($all) use ($rows, &$added) {
            $keys = [];
            foreach ($all as $r) {
                if (!empty($r['utr'])) $keys['u:' . strtolower($r['utr'])] = true;
                $keys['k:' . strtolower(($r['name'] ?? '') . '|' . ($r['date'] ?? '') . '|' . ($r['amount'] ?? ''))] = true;
            }
            foreach ($rows as $row) {
                $first = tg_pick($row, ['firstname']);
                $name = trim($first . ' ' . tg_pick($row, ['lastname'])) ?: tg_pick($row, ['fullname', 'name', 'student']);
                $rec = [
                    'name' => mb_substr($name, 0, 120),
                    'email' => mb_substr(tg_pick($row, ['email', 'mail']), 0, 160),
                    'phone' => mb_substr(tg_pick($row, ['phone', 'mobile', 'whatsapp', 'contact']), 0, 30),
                    'course' => mb_substr(tg_pick($row, ['course', 'program', 'product', 'item']), 0, 160),
                    'amount' => mb_substr(tg_pick($row, ['amount', 'paid', 'fee', 'price']), 0, 30),
                    'utr' => mb_substr(tg_pick($row, ['transactionid', 'utr', 'txn', 'reference']), 0, 60),
                    'date' => mb_substr(tg_pick($row, ['timestamp', 'date', 'time']), 0, 60),
                ];
                if ($rec['name'] === '' && $rec['utr'] === '') continue;
                $k1 = $rec['utr'] !== '' ? 'u:' . strtolower($rec['utr']) : null;
                $k2 = 'k:' . strtolower($rec['name'] . '|' . $rec['date'] . '|' . $rec['amount']);
                if (($k1 && isset($keys[$k1])) || isset($keys[$k2])) continue;
                $all[] = $rec + ['id' => substr(md5($k1 ?? $k2), 0, 16), 'type' => 'sheet', 'status' => 'recorded',
                    'source' => 'sheet', 'received_at' => gmdate('c')];
                if ($k1) $keys[$k1] = true;
                $keys[$k2] = true;
                $added++;
            }
            return array_slice($all, -5000);
        });
        $status = ['at' => time(), 'ok' => true, 'rows' => count($rows), 'added' => $added, 'error' => ''];
    } catch (Throwable $e) {
        $status = ['at' => time(), 'ok' => false, 'rows' => 0, 'added' => 0, 'error' => $e->getMessage()];
    }
    tg_update_json('sheet-sync.json', fn() => $status, []);
    return $status + ['enabled' => true];
}

/* ---------- GET ---------- */
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'order' || $action === 'download') {
        tg_rate_limit('orderlookup', 240, 3600);
        $order = tg_find_order((string)($_GET['id'] ?? ''), (string)($_GET['token'] ?? ''));
        if ($action === 'download') {
            $link = $order ? tg_order_download_link($order) : '';
            if ($link === '') { header('Location: /order.html?id=' . rawurlencode((string)($_GET['id'] ?? '')) . '&token=' . rawurlencode((string)($_GET['token'] ?? '')) . '&notready=1'); exit; }
            tg_update_json('payments.json', function ($all) use ($order) {
                foreach ($all as &$r) if ($r['id'] === $order['id']) { $r['downloads'] = (int)($r['downloads'] ?? 0) + 1; $r['last_download'] = gmdate('c'); }
                return $all;
            });
            header('Cache-Control: no-store');
            header('Location: ' . $link, true, 302);
            exit;
        }
        if (!$order) tg_error('We could not find this order. Check the link you saved after payment.', 404);
        $p = ($order['type'] ?? '') === 'pdf' ? tg_store_product((string)$order['productId']) : null;
        tg_json([
            'id' => $order['id'], 'type' => $order['type'] ?? 'course', 'title' => $order['course'] ?? '',
            'amount' => $order['amount'] ?? '', 'status' => $order['status'] ?? 'pending', 'date' => $order['date'] ?? '',
            'name' => explode(' ', (string)($order['name'] ?? ''))[0], 'cover' => $p['cover'] ?? '',
            'canDownload' => tg_order_download_link($order) !== '',
            'linkMissing' => ($order['type'] ?? '') === 'pdf' && ($order['status'] ?? '') === 'approved' && tg_order_download_link($order) === '',
            'settings' => tg_public_settings(),
        ]);
    }

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
    if ($action === 'sync') tg_json(tg_sheet_sync(true));
    if ($action === 'sync_status') tg_json(tg_read_json('sheet-sync.json', ['at' => 0]) + ['enabled' => !empty(tg_store()['settings']['sheetSync'])]);
    tg_sheet_sync(false);
    $rows = tg_read_json('payments.json', []);
    usort($rows, fn($a, $b) => strcmp((string)($b['received_at'] ?? ''), (string)($a['received_at'] ?? '')));
    foreach ($rows as &$row) {
        if (!empty($row['shot_id'])) $row['shot'] = '/api/payments.php?shot=' . $row['shot_id'];
        if (!empty($row['token'])) $row['orderUrl'] = '/order.html?id=' . $row['id'] . '&token=' . $row['token'];
        $row['status'] = $row['status'] ?? 'pending';
        $row['type'] = $row['type'] ?? 'course';
    }
    tg_json($rows);
}

/* ---------- POST ---------- */
$body = tg_require_json_post();

if ($action === 'status') {
    tg_require_admin();
    $id = (string)($body['id'] ?? '');
    $status = (string)($body['status'] ?? '');
    if (!in_array($status, ['pending', 'approved', 'rejected'], true)) tg_error('Unknown status.');
    $found = false;
    tg_update_json('payments.json', function ($all) use ($id, $status, &$found) {
        foreach ($all as &$r) if (($r['id'] ?? '') === $id) { $r['status'] = $status; $r['status_at'] = gmdate('c'); $found = true; }
        return $all;
    });
    if (!$found) tg_error('Order not found.', 404);
    tg_json(['ok' => true]);
}

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

if ($action !== '' && $action !== 'create') tg_error('Unknown action.', 404);

tg_rate_limit('payments', 10, 3600);

$text = fn(string $k, int $max) => mb_substr(trim((string)($body[$k] ?? '')), 0, $max);
$type = ($body['type'] ?? '') === 'pdf' ? 'pdf' : 'course';
$store = tg_store();
$record = [
    'id' => bin2hex(random_bytes(8)),
    'token' => bin2hex(random_bytes(16)),
    'type' => $type,
    'name' => $text('name', 120),
    'email' => $text('email', 160),
    'phone' => $text('phone', 30),
    'course' => $text('course', 160),
    'amount' => $text('amount', 30),
    'utr' => $text('utr', 60),
    'date' => $text('date', 60),
    'status' => 'pending',
    'received_at' => gmdate('c'),
];
if ($record['name'] === '' || $record['utr'] === '') tg_error('Please enter your name and the UPI transaction ID.');
if (!filter_var($record['email'], FILTER_VALIDATE_EMAIL)) tg_error('Please enter a valid email address.');
if (!preg_match('/^[A-Za-z0-9]{6,30}$/', $record['utr'])) tg_error('The transaction ID (UTR) should be 6–30 letters or digits, as shown in your UPI app.');

if ($type === 'pdf') {
    $p = tg_store_product($text('productId', 80));
    if (!$p || empty($p['visible'])) tg_error('This PDF is no longer available.', 404);
    // The price always comes from the store, never from the browser.
    $record['productId'] = $p['id'];
    $record['course'] = $p['title'];
    $record['amount'] = '₹' . rtrim(rtrim(number_format(tg_product_amount($p), 2, '.', ''), '0'), '.');
    if ($store['settings']['delivery'] === 'instant') $record['status'] = 'approved';
}

foreach (tg_read_json('payments.json', []) as $r) {
    if (!empty($r['utr']) && strcasecmp($r['utr'], $record['utr']) === 0 && ($r['source'] ?? '') !== 'sheet') {
        tg_error('This transaction ID has already been submitted. Open the order link you received, or contact us on WhatsApp.', 409);
    }
}

if (!empty($body['shot']) && is_string($body['shot'])) {
    [$bin, $ext] = tg_decode_image($body['shot'], 2500000);
    if (!is_dir(TG_SHOT_DIR) && !mkdir(TG_SHOT_DIR, 0750, true) && !is_dir(TG_SHOT_DIR)) tg_error('Server storage is not writable.', 500);
    file_put_contents(TG_SHOT_DIR . '/' . $record['id'] . '.' . $ext, $bin);
    $record['shot_id'] = $record['id'];
}

tg_update_json('payments.json', function ($rows) use ($record) {
    array_unshift($rows, $record);
    return array_slice($rows, 0, 5000);
});
// Answer the buyer first, then copy the order to the Google Sheet.
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
echo json_encode([
    'ok' => true, 'id' => $record['id'], 'token' => $record['token'], 'status' => $record['status'],
    'orderUrl' => '/order.html?id=' . $record['id'] . '&token=' . $record['token'],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
else { if (function_exists('session_write_close')) session_write_close(); flush(); }
tg_post_to_sheet($record);
exit;
