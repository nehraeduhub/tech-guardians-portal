<?php
// Websites that may send buyers to /pay.html and get them back afterwards.
// Add each website's domain (without https://). Subdomains are allowed too,
// so 'example.com' also covers 'shop.example.com'.
const TG_PAY_SITES = [
    'techguardians.in',
    // 'clientwebsite.com',
];

/** Is $url an https:// address on one of the websites above? */
function tg_pay_site_allowed(string $url): bool
{
    if (!preg_match('#^https://#i', $url) || strlen($url) > 500) return false;
    $host = strtolower((string)parse_url($url, PHP_URL_HOST));
    if ($host === '') return false;
    foreach (TG_PAY_SITES as $site) {
        $site = strtolower($site);
        if ($host === $site || substr($host, -strlen('.' . $site)) === '.' . $site) return true;
    }
    return false;
}
