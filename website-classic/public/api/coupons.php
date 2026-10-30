<?php
// Discount coupons.
// Public (checkout page):
//   POST coupons.php?action=check { code, type, productId?, plan?, course?, amount?, email?, phone? }
//                                 -> { ok, code, percent, price, discount, total }
// Admin:
//   GET  coupons.php                 -> all coupons with how often each was used
//   POST coupons.php?action=save   { id?, code, percent, scope[], maxUses, oncePerStudent, expires, active, note }
//   POST coupons.php?action=delete { id }
require_once __DIR__ . '/coupons-lib.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    tg_require_admin();
    $rows = [];
    foreach (tg_coupons() as $c) {
        $orders = tg_coupon_orders((string)$c['code']);
        $c['used'] = count($orders);
        $c['saved'] = tg_money(array_sum(array_map(fn($o) => (float)($o['discount'] ?? 0), $orders)));
        $rows[] = $c;
    }
    usort($rows, fn($a, $b) => strcmp((string)($b['created_at'] ?? ''), (string)($a['created_at'] ?? '')));
    tg_json(['coupons' => $rows, 'percents' => TG_COUPON_PERCENTS]);
}

$body = tg_require_json_post();

if ($action === 'check') {
    tg_rate_limit('couponcheck', 60, 600);
    $item = tg_order_item($body);
    $c = tg_coupon_check((string)($body['code'] ?? ''), $item, (string)($body['email'] ?? ''), (string)($body['phone'] ?? ''));
    $r = tg_coupon_apply($item, $c);
    tg_json(['ok' => true, 'code' => $c['code'], 'title' => $item['title']] + $r);
}

tg_require_admin();

if ($action === 'save') {
    $code = tg_coupon_code((string)($body['code'] ?? ''));
    if (strlen($code) < 3 || strlen($code) > 24) tg_error('Use a code of 3–24 letters, digits, - or _.');
    $percent = (int)($body['percent'] ?? 0);
    if (!in_array($percent, TG_COUPON_PERCENTS, true)) tg_error('Choose a discount: 10, 20, 30, 50, 80, 90 or 100 (free).');
    $scope = array_values(array_intersect(array_merge(['all'], TG_COUPON_SCOPES), (array)($body['scope'] ?? [])));
    if (!$scope) tg_error('Choose what the coupon applies to.');
    if (in_array('all', $scope, true)) $scope = ['all'];
    $expires = (string)($body['expires'] ?? '');
    if ($expires !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $expires)) tg_error('Use a date like 2026-12-31 for the expiry, or leave it empty.');
    $id = (string)($body['id'] ?? '');
    $row = [
        'code' => $code, 'percent' => $percent, 'scope' => $scope,
        'maxUses' => max(0, min(100000, (int)($body['maxUses'] ?? 0))),
        'oncePerStudent' => !empty($body['oncePerStudent']), 'expires' => $expires,
        'active' => !empty($body['active']), 'note' => mb_substr(trim((string)($body['note'] ?? '')), 0, 160),
    ];
    $saved = null;
    tg_update_json('coupons.json', function ($all) use ($id, $row, &$saved) {
        $all = is_array($all) ? $all : [];
        foreach ($all as $c) {
            if (strcasecmp((string)$c['code'], $row['code']) === 0 && ($c['id'] ?? '') !== $id) tg_error('A coupon with this code already exists.', 409);
        }
        foreach ($all as &$c) {
            if ($id !== '' && ($c['id'] ?? '') === $id) { $c = array_merge($c, $row, ['updated_at' => gmdate('c')]); $saved = $c; return $all; }
        }
        unset($c);
        $saved = $row + ['id' => bin2hex(random_bytes(6)), 'created_at' => gmdate('c')];
        $all[] = $saved;
        return $all;
    });
    tg_json(['ok' => true, 'coupon' => $saved]);
}

if ($action === 'delete') {
    $id = (string)($body['id'] ?? '');
    $found = false;
    tg_update_json('coupons.json', function ($all) use ($id, &$found) {
        $keep = [];
        foreach ((array)$all as $c) { if (($c['id'] ?? '') === $id) $found = true; else $keep[] = $c; }
        return $keep;
    });
    if (!$found) tg_error('Coupon not found.', 404);
    tg_json(['ok' => true]);
}

tg_error('Unknown action.', 404);
