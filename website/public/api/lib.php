<?php
// Shared helpers for the Tech Guardians PHP API.
require_once __DIR__ . '/config.php';

// Never show PHP errors (file paths, internals) to visitors.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Licence: this copy only runs on domains listed in api/license.json, signed
// with the owner's private key (Ed25519). The public key below can only check
// signatures; it cannot create them.
const TG_LICENSE_PUBLIC_KEY = 'azsOewp8XuyAE7nX0sHBeKeQXjSh73PUjIWMqNAN9jY=';
// Admin sessions end after 2 hours without activity, and after 12 hours in any case.
const TG_SESSION_IDLE_SECONDS = 7200;
const TG_SESSION_MAX_SECONDS = 43200;

if (!function_exists('array_is_list')) { // PHP < 8.1
    function array_is_list(array $a): bool { return $a === [] || array_keys($a) === range(0, count($a) - 1); }
}

function tg_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function tg_error(string $message, int $status = 400): void
{
    tg_json(['error' => $message], $status);
}

function tg_data_path(string $name): string
{
    if (!is_dir(TG_DATA_DIR) && !mkdir(TG_DATA_DIR, 0750, true) && !is_dir(TG_DATA_DIR)) {
        tg_error('Server storage is not writable.', 500);
    }
    return TG_DATA_DIR . '/' . $name;
}

// $assoc = false keeps JSON objects as objects, so {} never turns into [].
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

// Read-modify-write a JSON file under an exclusive lock.
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

function tg_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('tg_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function tg_session_fingerprint(): string
{
    return hash('sha256', ($_SERVER['HTTP_USER_AGENT'] ?? '') . '|tg');
}

function tg_is_admin(): bool
{
    tg_start_session();
    if (empty($_SESSION['tg_admin'])) return false;
    $now = time();
    $expired = $now - (int)($_SESSION['tg_seen'] ?? 0) > TG_SESSION_IDLE_SECONDS
        || $now - (int)($_SESSION['tg_login'] ?? 0) > TG_SESSION_MAX_SECONDS
        || !hash_equals((string)($_SESSION['tg_fp'] ?? ''), tg_session_fingerprint());
    if ($expired) {
        $_SESSION = [];
        session_destroy();
        return false;
    }
    $_SESSION['tg_seen'] = $now;
    return true;
}

/** True until the admin replaces the password that shipped with the site. */
function tg_must_change_password(): bool
{
    $stored = tg_read_json('admin.json', []);
    return !is_string($stored['password_hash'] ?? null);
}

function tg_require_admin(bool $allowDefaultPassword = false): void
{
    if (!tg_is_admin()) tg_error('Please sign in again.', 401);
    if (!$allowDefaultPassword && tg_must_change_password()) {
        tg_error('For security, change the default admin password first (Manage → Admin Password).', 403);
    }
}

/* ---------- licence ---------- */
function tg_license_host(): string
{
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? ''));
    return preg_replace('/:\d+$/', '', $host);
}

function tg_license_valid_for(string $host): bool
{
    $file = __DIR__ . '/license.json';
    if (!is_file($file) || !function_exists('sodium_crypto_sign_verify_detached')) return false;
    $lic = json_decode((string)file_get_contents($file), true);
    $entries = isset($lic['licenses']) && is_array($lic['licenses']) ? $lic['licenses'] : [$lic];
    $pub = base64_decode(TG_LICENSE_PUBLIC_KEY, true);
    foreach ($entries as $e) {
        if (!is_array($e) || !is_array($e['domains'] ?? null) || !is_string($e['sig'] ?? null)) continue;
        $domains = array_map('strtolower', array_map('strval', $e['domains']));
        $message = 'TG-LICENSE-1|' . ($e['licensee'] ?? '') . '|' . implode(',', $domains) . '|' . ($e['issued'] ?? '') . '|' . ($e['expires'] ?? '');
        $sig = base64_decode($e['sig'], true);
        if ($sig === false || strlen($sig) !== SODIUM_CRYPTO_SIGN_BYTES) continue;
        if (!sodium_crypto_sign_verify_detached($sig, $message, $pub)) continue;
        if (!empty($e['expires']) && strtotime((string)$e['expires']) < time()) continue;
        foreach ($domains as $d) {
            if ($d === $host) return true;
            if (strpos($d, '*.') === 0 && substr($host, -strlen($d) + 1) === substr($d, 1) && strlen($host) > strlen($d) - 1) return true;
        }
    }
    return false;
}

function tg_enforce_license(): void
{
    $host = tg_license_host();
    if (tg_license_valid_for($host)) return;
    tg_json([
        'error' => 'This copy of the Tech Guardians website is not licensed for ' . $host . '. Contact Tech Guardians for permission.',
        'code' => 'unlicensed',
    ], 451);
}

// Requests that change data must be JSON and come from this site.
// Browsers can't send a cross-site JSON POST without a CORS preflight,
// which this API never approves, so this blocks CSRF.
function tg_require_json_post(): array
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') tg_error('Method not allowed.', 405);
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($type, 'application/json') !== 0) tg_error('Expected JSON.', 415);
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $host = parse_url($origin, PHP_URL_HOST);
        $port = parse_url($origin, PHP_URL_PORT);
        $originHost = $host . ($port ? ':' . $port : '');
        if (strcasecmp($originHost, $_SERVER['HTTP_HOST'] ?? '') !== 0) tg_error('Cross-site request blocked.', 403);
    }
    $body = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($body)) tg_error('Invalid JSON body.');
    return $body;
}

function tg_admin_password_hash(): string
{
    $stored = tg_read_json('admin.json', []);
    return is_string($stored['password_hash'] ?? null) ? $stored['password_hash'] : TG_ADMIN_PASSWORD_HASH;
}

function tg_client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
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

// Decode a base64 image data URL and check it really is an image.
// Returns [binary, extension].
function tg_decode_image(string $dataUrl, int $maxBytes): array
{
    if (!preg_match('#^data:image/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/=\s]+)$#', $dataUrl, $m)) {
        tg_error('Unsupported image. Use JPG, PNG, WebP or GIF.');
    }
    $bin = base64_decode($m[2], true);
    if ($bin === false || strlen($bin) === 0) tg_error('Image could not be read.');
    if (strlen($bin) > $maxBytes) tg_error('Image is too large.', 413);
    $info = @getimagesizefromstring($bin);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
    if (!$info || !isset($types[$info[2]])) tg_error('File is not a valid image.');
    return [$bin, $types[$info[2]]];
}

tg_enforce_license();
