<?php
// Digital Asset Links for the Android app (Trusted Web Activity).
// Served at /.well-known/assetlinks.json. Fill the package name and SHA-256 fingerprint in Manage -> Mobile App.
require_once __DIR__ . '/lib.php';
$all = tg_read_json('settings.json', new stdClass(), false);
$v = is_object($all) && isset($all->tg_app->value) ? (array)$all->tg_app->value : [];
$pkg = (string)($v['packageId'] ?? '');
$prints = array_values(array_filter(array_map('trim', preg_split('/[\s,]+/', (string)($v['sha256'] ?? '')) ?: []),
    fn($f) => preg_match('/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i', $f)));
header('Content-Type: application/json');
header('Cache-Control: public, max-age=300');
if (!preg_match('/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i', $pkg) || !$prints) { echo '[]'; exit; }
echo json_encode([[
    'relation' => ['delegate_permission/common.handle_all_urls'],
    'target' => ['namespace' => 'android_app', 'package_name' => $pkg, 'sha256_cert_fingerprints' => array_map('strtoupper', $prints)],
]], JSON_UNESCAPED_SLASHES);
