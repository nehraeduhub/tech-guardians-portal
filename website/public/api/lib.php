<?php
// Shared helpers for the Tech Guardians PHP API.
require_once __DIR__ . '/config.php';

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

function tg_is_admin(): bool
{
    tg_start_session();
    return !empty($_SESSION['tg_admin']);
}

function tg_require_admin(): void
{
    if (!tg_is_admin()) tg_error('Please sign in again.', 401);
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
