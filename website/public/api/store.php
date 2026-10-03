<?php
// PDF store.
//   GET  store.php                 -> { products: [...], settings: {payment details} }   (public; no Drive links)
//   GET  store.php?id=ID           -> { product, settings }                              (public)
//   GET  store.php?action=admin    -> full store incl. Drive links and sheet settings    (admin)
//   POST store.php?action=save     { settings, products }                                 (admin)
require_once __DIR__ . '/store-lib.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'admin') {
        tg_require_admin();
        tg_json(tg_store());
    }
    $store = tg_store();
    if (isset($_GET['id'])) {
        $p = tg_store_product((string)$_GET['id']);
        if (!$p || empty($p['visible'])) tg_error('This PDF is not available.', 404);
        tg_json(['product' => tg_public_product($p), 'settings' => tg_public_settings()]);
    }
    $visible = array_values(array_filter($store['products'], fn($p) => !empty($p['visible'])));
    tg_json(['products' => array_map('tg_public_product', $visible), 'settings' => tg_public_settings()]);
}

$body = tg_require_json_post();
tg_require_admin();
if ($action !== 'save') tg_error('Unknown action.', 404);

$str = fn($v, int $max) => mb_substr(trim((string)$v), 0, $max);
$url = function ($v) use ($str) {
    $v = $str($v, 600);
    return ($v === '' || preg_match('#^(https?://|/)#i', $v)) ? $v : '';
};

$in = is_array($body['settings'] ?? null) ? $body['settings'] : [];
$settings = [
    'delivery' => ($in['delivery'] ?? '') === 'instant' ? 'instant' : 'approval',
    'payeeName' => $str($in['payeeName'] ?? '', 80),
    'upiId' => preg_match('/^[a-z0-9._-]{2,64}@[a-z0-9.-]{2,32}$/i', (string)($in['upiId'] ?? '')) ? (string)$in['upiId'] : '',
    'qrImage' => $url($in['qrImage'] ?? ''),
    'whatsapp' => preg_replace('/\D/', '', (string)($in['whatsapp'] ?? '')),
    'email' => filter_var($in['email'] ?? '', FILTER_VALIDATE_EMAIL) ?: '',
    'sheetUrl' => preg_match('#^https://#i', (string)($in['sheetUrl'] ?? '')) ? $str($in['sheetUrl'], 600) : '',
    'sheetSync' => !empty($in['sheetSync']),
];

$products = [];
$ids = [];
foreach (is_array($body['products'] ?? null) ? $body['products'] : [] as $p) {
    if (!is_array($p)) continue;
    $id = strtolower(preg_replace('/[^a-z0-9-]+/i', '-', (string)($p['id'] ?? '')));
    $id = trim($id, '-') ?: 'pdf-' . bin2hex(random_bytes(3));
    while (isset($ids[$id])) $id .= '-2';
    $ids[$id] = true;
    $drive = $str($p['driveLink'] ?? '', 600);
    if ($drive !== '' && !preg_match('#^https://#i', $drive)) tg_error('The download link for "' . $str($p['title'] ?? $id, 60) . '" must start with https://');
    $products[] = [
        'id' => $id,
        'title' => $str($p['title'] ?? '', 160),
        'subtitle' => $str($p['subtitle'] ?? '', 200),
        'description' => $str($p['description'] ?? '', 4000),
        'pages' => max(0, (int)($p['pages'] ?? 0)),
        'format' => $str($p['format'] ?? 'PDF', 20) ?: 'PDF',
        'price' => max(0, round((float)($p['price'] ?? 0), 2)),
        'offerPrice' => max(0, round((float)($p['offerPrice'] ?? 0), 2)),
        'cover' => $url($p['cover'] ?? ''),
        'previews' => array_values(array_filter(array_map($url, array_slice(is_array($p['previews'] ?? null) ? $p['previews'] : [], 0, 12)))),
        'tags' => array_values(array_filter(array_map(fn($t) => $str($t, 30), array_slice(is_array($p['tags'] ?? null) ? $p['tags'] : [], 0, 8)))),
        'driveLink' => $drive,
        'visible' => !empty($p['visible']),
    ];
}

tg_update_json('store.json', fn() => ['settings' => $settings, 'products' => $products], null);
tg_json(['ok' => true]);
