<?php
// Coupons for every paid service (courses, PDFs, CTF plans, products).
// Records: data/coupons.json. Prices and discounts are always worked out here,
// never taken from the browser.
require_once __DIR__ . '/ctf-lib.php';

const TG_COUPON_PERCENTS = [10, 20, 30, 50, 80, 90, 100];
const TG_COUPON_SCOPES = ['course', 'pdf', 'ctf', 'product'];
const TG_COUPON_SCOPE_LABEL = ['course' => 'courses', 'pdf' => 'PDFs', 'ctf' => 'CTF plans', 'product' => 'products'];

/** Course prices used when the admin has not set one under Training Programs. */
const TG_DEFAULT_COURSE_PRICES = [
    'Web Server and Hosting' => 799, 'Learn Sophos Firewall' => 499, 'Learn Active Directory' => 799,
    'Build Your First AI Agent' => 499, 'Ethical Hacking: Password Cracking' => 799,
    'Learn Social Media and Ethical Hacking' => 499, 'Awareness Session (Online)' => 999,
];

function tg_coupons(): array
{
    $all = tg_read_json('coupons.json', []);
    return is_array($all) ? array_values(array_filter($all, 'is_array')) : [];
}

function tg_coupon_code(string $code): string { return strtoupper(preg_replace('/[^A-Za-z0-9_-]/', '', $code)); }

function tg_money(float $n): string { return '₹' . rtrim(rtrim(number_format($n, 2, '.', ''), '0'), '.'); }

function tg_amount_of($v): float { return (float)preg_replace('/[^\d.]/', '', (string)$v); }

/** The setting value saved from the admin manager, or $fallback. */
function tg_setting_value(string $key, $fallback = null)
{
    $all = tg_read_json('settings.json', []);
    return $all[$key]['value'] ?? $fallback;
}

/**
 * What the buyer is paying for and its full price, from the order body.
 * Returns ['type', 'title', 'price', ...extra record fields] or calls tg_error().
 */
function tg_order_item(array $body): array
{
    $type = in_array($body['type'] ?? '', ['pdf', 'ctf', 'product'], true) ? $body['type'] : 'course';
    if ($type === 'pdf') {
        $p = tg_store_product(mb_substr((string)($body['productId'] ?? ''), 0, 80));
        if (!$p || empty($p['visible'])) tg_error('This PDF is no longer available.', 404);
        return ['type' => 'pdf', 'title' => $p['title'], 'price' => tg_product_amount($p), 'productId' => $p['id']];
    }
    if ($type === 'ctf') {
        $plans = tg_ctf_plans();
        $plan = (string)($body['plan'] ?? '');
        if (!isset($plans[$plan])) tg_error('Choose the monthly or annual CTF plan.');
        return ['type' => 'ctf', 'title' => 'CTF Portal — ' . $plans[$plan]['label'] . ' plan (' . $plans[$plan]['days'] . ' days)',
            'price' => (float)$plans[$plan]['price'], 'plan' => $plan];
    }
    if ($type === 'product') {
        $id = (string)($body['productId'] ?? '');
        foreach ((array)tg_setting_value('tg_products', []) as $p) {
            if (!is_array($p) || ($p['id'] ?? '') !== $id || empty($p['visible'])) continue;
            $price = tg_amount_of($p['offer'] ?? '') ?: tg_amount_of($p['price'] ?? '');
            if ($price <= 0) break;
            return ['type' => 'product', 'title' => mb_substr((string)$p['name'], 0, 160), 'price' => $price, 'productId' => $id];
        }
        tg_error('This product cannot be bought online. Please contact us on WhatsApp.', 404);
    }
    // Course: the admin's price for a matching title, else the standard price, else the course page's price.
    $title = mb_substr(trim((string)($body['course'] ?? '')), 0, 160);
    if ($title === '') tg_error('Please choose what you are paying for.');
    $price = 0.0;
    foreach ((array)tg_setting_value('tg_courses_admin', []) as $c) {
        if (is_array($c) && tg_norm((string)($c['title'] ?? '')) === tg_norm($title)) {
            $price = tg_amount_of($c['offer'] ?? '') ?: tg_amount_of($c['price'] ?? '');
            break;
        }
    }
    if ($price <= 0) foreach (TG_DEFAULT_COURSE_PRICES as $name => $p) if (tg_norm($name) === tg_norm($title)) $price = (float)$p;
    if ($price <= 0) $price = tg_amount_of($body['amount'] ?? '');
    if ($price <= 0) tg_error('Please choose what you are paying for.');
    return ['type' => 'course', 'title' => $title, 'price' => $price];
}

/** Orders that used this coupon and were not rejected. */
function tg_coupon_orders(string $code): array
{
    return array_values(array_filter(tg_read_json('payments.json', []), fn($o) =>
        strcasecmp((string)($o['coupon'] ?? ''), $code) === 0 && ($o['status'] ?? '') !== 'rejected'));
}

/**
 * Check $code for $item and this buyer. Returns the coupon or calls tg_error() with the reason.
 */
function tg_coupon_check(string $code, array $item, string $email = '', string $phone = ''): array
{
    $code = tg_coupon_code($code);
    $c = null;
    foreach (tg_coupons() as $row) if (strcasecmp((string)$row['code'], $code) === 0) $c = $row;
    if (!$c || empty($c['active'])) tg_error('This coupon code is not valid.');
    if (!empty($c['expires']) && gmdate('Y-m-d', time() + 19800) > $c['expires']) tg_error('This coupon has expired.');
    $scope = (array)($c['scope'] ?? []);
    if (!in_array('all', $scope, true) && !in_array($item['type'], $scope, true)) {
        $names = array_map(fn($s) => TG_COUPON_SCOPE_LABEL[$s] ?? $s, $scope);
        tg_error('This coupon works only for ' . implode(', ', $names) . '.');
    }
    $used = tg_coupon_orders($c['code']);
    if ((int)($c['maxUses'] ?? 0) > 0 && count($used) >= (int)$c['maxUses']) tg_error('This coupon has been fully used.');
    if (!empty($c['oncePerStudent']) && ($email !== '' || $phone !== '')) {
        $email = strtolower(trim($email));
        $phone = substr(preg_replace('/\D/', '', $phone), -10);
        foreach ($used as $o) {
            $sameEmail = $email !== '' && strtolower(trim((string)($o['email'] ?? ''))) === $email;
            $samePhone = strlen($phone) === 10 && substr(preg_replace('/\D/', '', (string)($o['phone'] ?? '')), -10) === $phone;
            if ($sameEmail || $samePhone) tg_error('You have already used this coupon.');
        }
    }
    return $c;
}

/** Price, discount and total for $item with coupon $c (or none). */
function tg_coupon_apply(array $item, ?array $c): array
{
    $price = round((float)$item['price'], 2);
    $percent = $c ? (int)$c['percent'] : 0;
    $total = $percent >= 100 ? 0.0 : (float)round($price * (100 - $percent) / 100);
    return ['price' => $price, 'percent' => $percent, 'discount' => round($price - $total, 2), 'total' => $total];
}
