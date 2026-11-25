<?php
// Tech Guardians security layer: attack filter (WAF), security log, automatic IP blocking.
// Loaded by lib.php on every API request and by trap.php. It needs only config.php so it keeps
// working even when the rest of the API cannot start.
//
// Files in data/ (never served over the web):
//   security-config.json  settings (Manage -> Security)
//   security-state.json   points collected per IP and how often it was banned
//   security-bans.json    IPs blocked right now
//   security-log.jsonl    one JSON line per security event (rotates at 3 MB, one old copy kept)
require_once __DIR__ . '/config.php';

if (!defined('TG_TRUSTED_PROXIES')) define('TG_TRUSTED_PROXIES', []); // e.g. ['203.0.113.7'] if your host puts a proxy in front

const TG_SEC_DEFAULTS = [
    'waf' => true,                 // block requests that look like attacks
    'autoBan' => true,             // block IPs automatically when they collect enough points
    'threshold' => 100,            // points within the window that cause a ban
    'windowMinutes' => 15,
    'banMinutes' => [30, 180, 1440, 10080], // 1st, 2nd, 3rd, 4th+ ban (minutes)
    'allowIps' => [],              // never blocked by the filter (your office / home) — IPs or CIDR
    'adminIps' => [],              // if not empty, only these IPs may sign in as admin — IPs or CIDR
    'behindCloudflare' => false,   // true only if the domain is proxied by Cloudflare (orange cloud)
    'trustedProxies' => [],        // IPs of other reverse proxies whose X-Forwarded-For can be trusted
    'floodPerMinute' => 300,       // API requests per IP per minute
];

// Cloudflare's published address ranges (https://www.cloudflare.com/ips/) — used only to trust CF-Connecting-IP.
const TG_CF_RANGES = [
    '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18', '108.162.192.0/18',
    '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
    '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
    '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
];

/* ---------- small file helpers (no dependency on lib.php) ---------- */
function tg_sec_path(string $name): string
{
    if (!is_dir(TG_DATA_DIR)) @mkdir(TG_DATA_DIR, 0750, true);
    return TG_DATA_DIR . '/' . $name;
}

function tg_sec_read(string $name, $fallback = [])
{
    $p = tg_sec_path($name);
    if (!is_file($p)) return $fallback;
    $raw = @file_get_contents($p);
    $d = $raw === false ? null : json_decode($raw, true);
    return is_array($d) ? $d : $fallback;
}

/** Read-modify-write under an exclusive lock. $fn gets the array and returns the new one. */
function tg_sec_update(string $name, callable $fn): void
{
    $fh = @fopen(tg_sec_path($name), 'c+b');
    if (!$fh) return;
    flock($fh, LOCK_EX);
    $d = json_decode((string)stream_get_contents($fh), true);
    $d = $fn(is_array($d) ? $d : []);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($d, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
}

function tg_sec_config(): array
{
    static $c = null;
    if ($c === null) {
        $saved = tg_sec_read('security-config.json');
        $c = array_merge(TG_SEC_DEFAULTS, array_intersect_key($saved, TG_SEC_DEFAULTS));
    }
    return $c;
}

/* ---------- visitor's IP ---------- */
function tg_ip_in(string $ip, array $list): bool
{
    $b = @inet_pton($ip);
    if ($b === false) return false;
    foreach ($list as $c) {
        $c = trim((string)$c);
        if ($c === '') continue;
        [$net, $bits] = array_pad(explode('/', $c, 2), 2, null);
        $nb = @inet_pton($net);
        if ($nb === false || strlen($nb) !== strlen($b)) continue;
        $max = strlen($b) * 8;
        $bits = $bits === null ? $max : max(0, min($max, (int)$bits));
        $bytes = intdiv($bits, 8);
        $rem = $bits % 8;
        if ($bytes && substr($b, 0, $bytes) !== substr($nb, 0, $bytes)) continue;
        if ($rem) {
            $mask = (0xFF << (8 - $rem)) & 0xFF;
            if ((ord($b[$bytes]) & $mask) !== (ord($nb[$bytes]) & $mask)) continue;
        }
        return true;
    }
    return false;
}

/** The real visitor address. Forwarding headers are believed only when the request really comes from a trusted proxy. */
function tg_client_ip(): string
{
    static $ip = null;
    if ($ip !== null) return $ip;
    $remote = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $ip = $remote;
    $cfg = tg_sec_config();
    if (!empty($cfg['behindCloudflare']) && !empty($_SERVER['HTTP_CF_CONNECTING_IP']) && tg_ip_in($remote, TG_CF_RANGES)) {
        $c = trim((string)$_SERVER['HTTP_CF_CONNECTING_IP']);
        if (filter_var($c, FILTER_VALIDATE_IP)) return $ip = $c;
    }
    $proxies = array_merge((array)TG_TRUSTED_PROXIES, (array)$cfg['trustedProxies']);
    if ($proxies && !empty($_SERVER['HTTP_X_FORWARDED_FOR']) && tg_ip_in($remote, $proxies)) {
        $chain = array_reverse(array_map('trim', explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR'])));
        foreach ($chain as $hop) {
            if (!filter_var($hop, FILTER_VALIDATE_IP)) break;
            $ip = $hop;
            if (!tg_ip_in($hop, $proxies)) break;
        }
    }
    return $ip;
}

function tg_sec_safe_ip(string $ip): bool
{
    $allow = tg_sec_config()['allowIps'];
    return $allow && tg_ip_in($ip, $allow);
}

/* ---------- log ---------- */
function tg_sec_log(string $type, string $detail = '', int $points = 0): void
{
    $path = tg_sec_path('security-log.jsonl');
    if (is_file($path) && @filesize($path) > 3 * 1024 * 1024) @rename($path, $path . '.1');
    $clean = fn($s, $n) => mb_substr(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string)$s), 0, $n);
    $line = json_encode([
        't' => gmdate('c'), 'ip' => tg_client_ip(), 'type' => $type, 'detail' => $clean($detail, 240), 'pts' => $points,
        'path' => $clean(strtok((string)($_SERVER['REQUEST_URI'] ?? ''), '?'), 160), 'm' => (string)($_SERVER['REQUEST_METHOD'] ?? ''),
        'ua' => $clean($_SERVER['HTTP_USER_AGENT'] ?? '', 140),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    @file_put_contents($path, $line . "\n", FILE_APPEND | LOCK_EX);
}

/** Admin actions are kept in the same log, so you can see who changed what and when. */
function tg_audit(string $what): void { tg_sec_log('audit', $what); }

/* ---------- points and bans ---------- */
function tg_sec_ban(string $ip, int $minutes, string $why, bool $manual = false): void
{
    $until = time() + max(1, $minutes) * 60;
    tg_sec_update('security-bans.json', function ($b) use ($ip, $until, $why, $manual) {
        foreach ($b as $k => $v) if (($v['until'] ?? 0) < time()) unset($b[$k]);
        $b[$ip] = ['until' => $until, 'why' => mb_substr($why, 0, 160), 'at' => gmdate('c'), 'manual' => $manual];
        return $b;
    });
    tg_sec_log($manual ? 'ban_manual' : 'ban', "$minutes min — $why");
}

function tg_sec_unban(string $ip): void
{
    tg_sec_update('security-bans.json', function ($b) use ($ip) { unset($b[$ip]); return $b; });
    tg_sec_update('security-state.json', function ($s) use ($ip) { if (isset($s['ips'][$ip])) $s['ips'][$ip]['pts'] = []; return $s; });
    tg_sec_log('unban', $ip);
}

/** Seconds left on this IP's ban, 0 if it is not banned. */
function tg_sec_ban_left(string $ip): int
{
    $b = tg_sec_read('security-bans.json');
    $until = (int)($b[$ip]['until'] ?? 0);
    return $until > time() ? $until - time() : 0;
}

/** Add points to an IP; ban it when it collects too many inside the window. Returns true if it was just banned. */
function tg_sec_penalize(string $ip, int $points, string $why): bool
{
    $cfg = tg_sec_config();
    if ($points <= 0 || tg_sec_safe_ip($ip)) return false;
    $now = time();
    $ban = 0;
    tg_sec_update('security-state.json', function ($s) use ($ip, $points, $now, $cfg, &$ban) {
        $ips = $s['ips'] ?? [];
        if (count($ips) > 3000) { // keep the file small: drop the oldest quiet addresses
            uasort($ips, fn($a, $b) => ($a['last'] ?? 0) <=> ($b['last'] ?? 0));
            $ips = array_slice($ips, -2000, null, true);
        }
        $e = $ips[$ip] ?? ['pts' => [], 'bans' => 0];
        $e['pts'] = array_values(array_filter($e['pts'], fn($p) => $p[0] > $now - $cfg['windowMinutes'] * 60));
        $e['pts'][] = [$now, $points];
        $e['last'] = $now;
        if ($cfg['autoBan'] && array_sum(array_column($e['pts'], 1)) >= $cfg['threshold']) {
            $steps = array_values((array)$cfg['banMinutes']) ?: [30];
            $ban = (int)$steps[min((int)$e['bans'], count($steps) - 1)];
            $e['bans'] = (int)$e['bans'] + 1;
            $e['pts'] = [];
        }
        $ips[$ip] = $e;
        $s['ips'] = $ips;
        return $s;
    });
    if ($ban > 0) { tg_sec_ban($ip, $ban, $why); return true; }
    return false;
}

/* ---------- attack signatures ---------- */
// [regex, points, name]. 40+ points block the request at once; lower values only add to the IP's score.
const TG_SEC_RULES = [
    ['/union[\s\/*+(]+(all[\s\/*+(]+|distinct[\s\/*+(]+)?select\b/i', 45, 'sql-injection'],
    ['/\bselect\b[\s\S]{0,60}\bfrom\b[\s\S]{0,60}\b(information_schema|mysql\.user|pg_catalog|sqlite_master|sys\.objects)\b/i', 45, 'sql-injection'],
    ['/\b(sleep|benchmark|pg_sleep|extractvalue|updatexml)\s*\(|waitfor\s+delay|xp_cmdshell|load_file\s*\(|into\s+(out|dump)file/i', 45, 'sql-injection'],
    ['/;\s*(drop|alter|truncate|insert\s+into|delete\s+from|update\s+\w+\s+set)\b/i', 45, 'sql-injection'],
    ['/[\'"`)]\s*(or|and|xor|\|\||&&)\s*[\'"`(]?\s*[\w-]+\s*[\'"`]?\s*(=|like|>|<)\s*[\'"`(]?\s*[\w-]+/i', 25, 'sql-probe'],
    ['/<\s*script\b|<\s*\/\s*script|javascript\s*:|vbscript\s*:|\bon(error|load|click|mouse\w+|focus\w*|toggle|animation\w+|pointer\w+|begin)\s*=/i', 45, 'xss'],
    ['/<\s*(iframe|object|embed|svg|math|marquee|meta|link|base|form)\b[^>]*>/i', 35, 'xss'],
    ['/\.\.[\/\\\\]|%2e%2e(%2f|%5c|\/|\\\\)|\.\.%2f|\.\.%5c/i', 45, 'path-traversal'],
    ['/\/etc\/(passwd|shadow|hosts|group)|\bwin\.ini\b|\bboot\.ini\b|\/proc\/self\/|c:[\/\\\\]windows|\/\.(git|svn|env|ssh|aws)\b/i', 45, 'file-probe'],
    ['/\b(php|data|expect|phar|zip|glob|gopher|dict|ldap|jar|ogg|rar):\/\//i', 45, 'wrapper-injection'],
    ['/(;|\||&&|`|\$\()\s*(cat|ls|id|whoami|uname|wget|curl|nc|ncat|bash|sh|zsh|python\d?|perl|php|ruby|powershell|cmd(\.exe)?|certutil|bitsadmin)\b/i', 45, 'command-injection'],
    ['/\b(passthru|shell_exec|popen|proc_open|pcntl_exec|eval|create_function|base64_decode|file_put_contents)\s*\(/i', 45, 'code-injection'],
    ['/<\?(php|=)|<%[=@]?|\$\{jndi:|\$\{\s*\$\{|\$\{(env|sys|java|lower|upper|date):/i', 50, 'code-injection'],
    ['/\{\{[^}]{0,80}(__class__|__globals__|config|self\.|\d+\s*\*\s*\d+|constructor)[^}]{0,80}\}\}|\{%[^%]{0,80}%\}/i', 35, 'template-injection'],
    ['/<!ENTITY|<!DOCTYPE[^>]*\[|SYSTEM\s+["\']file:/i', 45, 'xxe'],
    ['/%0d%0a|%0a%0d|\r\n(set-cookie|location|content-type):/i', 45, 'header-injection'],
    ['/%00|\x00/', 40, 'null-byte'],
];

// Tools that announce themselves. Real visitors never use these names.
const TG_SEC_SCANNER_UA = '/sqlmap|nikto|nessus|acunetix|netsparker|wpscan|masscan|dirbuster|dirb\b|gobuster|feroxbuster|ffuf|wfuzz|hydra|havij|openvas|w3af|zgrab|nuclei|arachni|skipfish|whatweb|jaeles|dalfox|commix|xsstrike|metasploit|wapiti|appscan|qualys|rapid7|python-httpx|projectdiscovery|fuzz faster|nmap scripting|libwww-perl|zmeu|morfeus|f-secure|webinspect|burpcollaborator/i';

/** Decode like a server would (URL and HTML entities, twice), so %3Cscript%3E is seen as <script>. */
function tg_sec_normalize(string $s): string
{
    for ($i = 0; $i < 2; $i++) {
        $d = urldecode($s);
        $d = html_entity_decode($d, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        if ($d === $s) break;
        $s = $d;
    }
    return $s;
}

/** Highest-scoring rule that matches $value, as [points, name], or null. */
function tg_sec_match(string $value): ?array
{
    if ($value === '') return null;
    $raw = mb_substr($value, 0, 2000);
    $norm = tg_sec_normalize($raw);
    $best = null;
    foreach (TG_SEC_RULES as [$re, $pts, $name]) {
        if ((preg_match($re, $raw) || preg_match($re, $norm)) && (!$best || $pts > $best[0])) $best = [$pts, $name];
    }
    return $best;
}

/** Every short text value inside request data (nested arrays and JSON). */
function tg_sec_leaves($data, array &$out, int $depth = 0): void
{
    if ($depth > 6 || count($out) > 400) return;
    if (is_array($data)) { foreach ($data as $k => $v) { if (is_string($k)) $out[] = $k; tg_sec_leaves($v, $out, $depth + 1); } return; }
    if (is_string($data) && strlen($data) <= 400) $out[] = $data;
}

function tg_sec_deny(string $message, int $status, string $code, int $retry = 0): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    if ($retry > 0) header('Retry-After: ' . $retry);
    echo json_encode(['error' => $message, 'code' => $code], JSON_UNESCAPED_UNICODE);
    exit;
}

// Endpoints whose bodies are free text written by people (articles, chat questions, admin content).
// Their bodies are not scanned: a cyber-security article may legitimately contain "<script>" or "UNION SELECT".
const TG_SEC_FREE_TEXT = ['posts.php', 'ai-chat.php', 'settings.php', 'store.php', 'upload.php', 'upload-video.php', 'ctf.php'];

/** Runs first on every API request: blocked IPs, scanners, floods and attack payloads. */
function tg_sec_gate(): void
{
    $cfg = tg_sec_config();
    $ip = tg_client_ip();
    if (tg_sec_safe_ip($ip)) return;

    if (($left = tg_sec_ban_left($ip)) > 0) {
        tg_sec_deny('Access denied. Your address has been blocked after suspicious activity. If this is a mistake, contact Tech Guardians on WhatsApp.', 403, 'blocked', $left);
    }
    if (!$cfg['waf']) return;

    $method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, ['GET', 'POST', 'HEAD', 'OPTIONS'], true)) {
        tg_sec_log('waf_block', "method $method", 20);
        tg_sec_penalize($ip, 20, "unusual method $method");
        tg_sec_deny('Method not allowed.', 405, 'method');
    }

    $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
    if ($ua !== '' && preg_match(TG_SEC_SCANNER_UA, $ua)) {
        tg_sec_log('scanner', $ua, 100);
        tg_sec_penalize($ip, 100, 'security scanner: ' . mb_substr($ua, 0, 60));
        tg_sec_deny('Access denied.', 403, 'blocked');
    }

    // Too many requests from one address in a minute.
    $flood = false;
    $now = time();
    tg_sec_update('security-flood.json', function ($f) use ($ip, $now, $cfg, &$flood) {
        foreach ($f as $k => $v) if (($v[0] ?? 0) < $now - 120) unset($f[$k]);
        $e = $f[$ip] ?? [$now, 0];
        if ($e[0] < $now - 60) $e = [$now, 0];
        $e[1]++;
        $f[$ip] = $e;
        if ($e[1] > $cfg['floodPerMinute']) $flood = true;
        return $f;
    });
    if ($flood) {
        tg_sec_log('flood', 'more than ' . $cfg['floodPerMinute'] . ' requests in a minute', 20);
        tg_sec_penalize($ip, 20, 'request flood');
        tg_sec_deny('Too many requests. Please slow down.', 429, 'flood', 60);
    }

    // Where the payload can be: address, query string, form fields, a few headers, short JSON values.
    $texts = [(string)($_SERVER['REQUEST_URI'] ?? ''), $ua, (string)($_SERVER['HTTP_REFERER'] ?? '')];
    tg_sec_leaves($_GET, $texts);
    tg_sec_leaves($_POST, $texts);
    $script = basename((string)parse_url((string)($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH));
    $type = (string)($_SERVER['CONTENT_TYPE'] ?? '');
    if ($method === 'POST' && stripos($type, 'application/json') === 0 && !in_array($script, TG_SEC_FREE_TEXT, true)
        && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) <= 1048576) {
        $json = json_decode((string)file_get_contents('php://input'), true);
        if (is_array($json)) tg_sec_leaves($json, $texts);
    }

    $hit = null;
    foreach ($texts as $t) {
        $m = tg_sec_match($t);
        if ($m && (!$hit || $m[0] > $hit[0])) $hit = $m;
        if ($hit && $hit[0] >= 45) break;
    }
    if ($hit) {
        tg_sec_log('waf_block', $hit[1], $hit[0]);
        tg_sec_penalize($ip, $hit[0], 'attack pattern: ' . $hit[1]);
        if ($hit[0] >= 35) tg_sec_deny('Request blocked by the security filter.', 403, 'waf');
    }
}

/** True if this IP may use the admin sign-in (no allow-list set = everybody). */
function tg_sec_admin_ip_ok(): bool
{
    $list = tg_sec_config()['adminIps'];
    return !$list || tg_ip_in(tg_client_ip(), $list);
}
