<?php
// Small shared helpers for the Tech Guardians News API (read-only, no login, no uploads).
require_once __DIR__ . '/config.php';
ini_set('display_errors', '0');
ini_set('log_errors', '1');

function tg_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function tg_error(string $message, int $status = 400): void { tg_json(['error' => $message], $status); }

function tg_data_path(string $name): string
{
    if (!is_dir(TG_DATA_DIR) && !mkdir(TG_DATA_DIR, 0750, true) && !is_dir(TG_DATA_DIR)) tg_error('Server storage is not writable.', 500);
    return TG_DATA_DIR . '/' . $name;
}
function tg_read_json(string $name, $fallback = [], bool $assoc = true)
{
    $path = tg_data_path($name);
    if (!is_file($path)) return $fallback;
    $fh = fopen($path, 'rb');
    if (!$fh) return $fallback;
    flock($fh, LOCK_SH);
    $raw = stream_get_contents($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    $data = json_decode($raw === false ? '' : $raw, $assoc);
    return $data === null ? $fallback : $data;
}
function tg_update_json(string $name, callable $fn, $fallback = [], bool $assoc = true)
{
    $path = tg_data_path($name);
    $fh = fopen($path, 'c+b');
    if (!$fh) tg_error('Server storage is not writable.', 500);
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $data = $raw ? json_decode($raw, $assoc) : null;
    if ($data === null) $data = $fallback;
    $data = $fn($data);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $data;
}

/** Visitor address. Behind Cloudflare, CF-Connecting-IP is used (only when the request really comes from Cloudflare's header). */
function tg_client_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP']) && filter_var($_SERVER['HTTP_CF_CONNECTING_IP'], FILTER_VALIDATE_IP) && is_file(TG_DATA_DIR . '/behind-cloudflare')) {
        $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
    }
    return $ip;
}

// Allow at most $max requests per IP for $bucket within $window seconds.
function tg_rate_limit(string $bucket, int $max, int $window): void
{
    $ip = tg_client_ip();
    $now = time();
    $blocked = false;
    tg_update_json("rate-$bucket.json", function ($all) use ($ip, $now, $max, $window, &$blocked) {
        foreach ($all as $k => $times) {
            $all[$k] = array_values(array_filter($times, fn($t) => $t > $now - $window));
            if (!$all[$k]) unset($all[$k]);
        }
        if (count($all[$ip] ?? []) >= $max) { $blocked = true; return $all; }
        $all[$ip][] = $now;
        return $all;
    });
    if ($blocked) tg_error('Too many requests. Please try again later.', 429);
}

// Outgoing requests may only go to public http(s) servers, never to this server or the hosting network.
function tg_public_url(string $url): bool
{
    if (!preg_match('#^https?://#i', $url) || strlen($url) > 2000) return false;
    $host = parse_url($url, PHP_URL_HOST);
    if (!is_string($host) || $host === '') return false;
    $host = trim($host, '[]');
    $ips = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : (gethostbynamel($host) ?: []);
    if (!$ips) return false;
    foreach ($ips as $ip) {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) return false;
    }
    return true;
}
// Pin an outgoing connection to the address just checked (stops DNS rebinding).
function tg_curl_pin($ch, string $url): void
{
    $host = parse_url($url, PHP_URL_HOST);
    if (!is_string($host) || $host === '' || filter_var(trim($host, '[]'), FILTER_VALIDATE_IP)) return;
    $port = parse_url($url, PHP_URL_PORT) ?: (stripos($url, 'https') === 0 ? 443 : 80);
    $ips = gethostbynamel($host) ?: [];
    if ($ips) curl_setopt($ch, CURLOPT_RESOLVE, ["$host:$port:" . $ips[0]]);
}

// This API only answers simple GET requests.
if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD', 'OPTIONS'], true)) tg_error('Method not allowed.', 405);
