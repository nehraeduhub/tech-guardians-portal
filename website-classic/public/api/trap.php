<?php
// Honeypot. .htaccess sends requests for paths that only attackers ask for here
// (/wp-login.php, /.env, /phpmyadmin, /xmlrpc.php, .php files that do not exist, scanner user agents ...).
// Nobody real ever lands here: the visit is logged, the address gets points, and it is blocked quickly.
require_once __DIR__ . '/security.php';

$ip = tg_client_ip();
if (!tg_sec_safe_ip($ip)) {
    $path = (string)strtok((string)($_SERVER['REQUEST_URI'] ?? ''), '?');
    $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
    $isScanner = $ua !== '' && preg_match(TG_SEC_SCANNER_UA, $ua);
    $points = $isScanner ? 100 : 60;
    $already = tg_sec_ban_left($ip) > 0;
    if (!$already) tg_sec_log($isScanner ? 'scanner' : 'trap', $path, $points);
    tg_sec_penalize($ip, $points, ($isScanner ? 'scanner ' : 'probe of ') . mb_substr($path, 0, 80));
    if (!$already) sleep(2); // slows automated scanners down (banned addresses are not slowed: no free workers lost)
}
http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
echo "<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>Not Found</h1><p>The requested URL was not found on this server.</p></body></html>";
