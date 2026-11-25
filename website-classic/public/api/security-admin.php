<?php
// Security Center for the admin (Manage -> Security).
//   GET  security-admin.php?action=overview         -> status, last-24-hour counts, blocked IPs, settings
//   GET  security-admin.php?action=log&type=&q=&limit=  -> newest security events first
//   POST security-admin.php?action=ban     { ip, minutes, why }
//   POST security-admin.php?action=unban   { ip }
//   POST security-admin.php?action=settings { waf, autoBan, threshold, windowMinutes, banMinutes[], allowIps[], adminIps[], behindCloudflare, trustedProxies[], floodPerMinute }
//   POST security-admin.php?action=clear_log
require_once __DIR__ . '/lib.php';

const TG_SEC_TYPES = ['waf_block', 'scanner', 'trap', 'flood', 'ban', 'ban_manual', 'unban', 'login_fail', 'login_ok', 'admin_login_fail',
    'admin_login_ok', '2fa_fail', 'lockout', 'rate_limit', 'csrf_block', 'admin_ip_denied', 'admin_bruteforce', 'audit'];

/** The newest $limit log lines that match, newest first. Reads only the end of the file. */
function tg_sec_tail(int $limit, string $type = '', string $q = ''): array
{
    $rows = [];
    foreach ([tg_sec_path('security-log.jsonl'), tg_sec_path('security-log.jsonl.1')] as $file) {
        if (!is_file($file) || count($rows) >= $limit) continue;
        $size = filesize($file);
        $fh = fopen($file, 'rb');
        if (!$fh) continue;
        fseek($fh, max(0, $size - 1500000));
        $chunk = (string)stream_get_contents($fh);
        fclose($fh);
        $lines = array_reverse(explode("\n", trim($chunk)));
        foreach ($lines as $l) {
            $r = json_decode($l, true);
            if (!is_array($r)) continue;
            if ($type !== '' && $r['type'] !== $type) continue;
            if ($q !== '' && stripos(($r['ip'] ?? '') . ' ' . ($r['detail'] ?? '') . ' ' . ($r['path'] ?? '') . ' ' . ($r['ua'] ?? ''), $q) === false) continue;
            $rows[] = $r;
            if (count($rows) >= $limit) break;
        }
    }
    return $rows;
}

tg_require_admin();
$action = $_GET['action'] ?? 'overview';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'log') {
        $type = in_array($_GET['type'] ?? '', TG_SEC_TYPES, true) ? $_GET['type'] : '';
        tg_json(['rows' => tg_sec_tail(max(10, min(500, (int)($_GET['limit'] ?? 200))), $type, mb_substr((string)($_GET['q'] ?? ''), 0, 80))]);
    }
    if ($action === 'overview') {
        $since = gmdate('c', time() - 86400);
        $counts = array_fill_keys(TG_SEC_TYPES, 0);
        $ips = [];
        foreach (tg_sec_tail(3000) as $r) {
            if (($r['t'] ?? '') < $since) break;
            $counts[$r['type']] = ($counts[$r['type']] ?? 0) + 1;
            if (!in_array($r['type'], ['audit', 'login_ok', 'admin_login_ok', 'unban'], true)) $ips[$r['ip']] = ($ips[$r['ip']] ?? 0) + 1;
        }
        arsort($ips);
        $bans = [];
        foreach (tg_sec_read('security-bans.json') as $ip => $b) {
            if (($b['until'] ?? 0) > time()) $bans[] = ['ip' => $ip, 'until' => gmdate('c', $b['until']), 'why' => $b['why'] ?? '', 'at' => $b['at'] ?? '', 'manual' => !empty($b['manual'])];
        }
        usort($bans, fn($a, $b) => strcmp($b['at'], $a['at']));
        $cfg = tg_sec_config();
        $totp = !empty(tg_read_json('admin.json', [])['totp_on']);
        tg_json([
            'config' => $cfg, 'counts' => $counts, 'topIps' => array_slice($ips, 0, 8, true), 'bans' => $bans, 'myIp' => tg_client_ip(),
            'totp' => $totp, 'https' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https',
            'defaultAdminPassword' => tg_must_change_password(), 'phpVersion' => PHP_VERSION,
            'dataWritable' => is_writable(TG_DATA_DIR),
        ]);
    }
    tg_error('Unknown action.', 404);
}

$body = tg_require_json_post();
$validIp = function ($v) {
    $v = trim((string)$v);
    [$ip] = explode('/', $v, 2);
    return $v !== '' && filter_var($ip, FILTER_VALIDATE_IP) ? $v : null;
};

if ($action === 'ban') {
    $ip = trim((string)($body['ip'] ?? ''));
    if (!filter_var($ip, FILTER_VALIDATE_IP)) tg_error('Enter a valid IP address.');
    if ($ip === tg_client_ip()) tg_error('That is your own address. You would lock yourself out.');
    tg_sec_ban($ip, max(1, min(525600, (int)($body['minutes'] ?? 1440))), mb_substr(trim((string)($body['why'] ?? '')), 0, 120) ?: 'blocked by the admin', true);
    tg_audit("blocked IP $ip");
    tg_json(['ok' => true]);
}
if ($action === 'unban') {
    $ip = trim((string)($body['ip'] ?? ''));
    if (!filter_var($ip, FILTER_VALIDATE_IP)) tg_error('Enter a valid IP address.');
    tg_sec_unban($ip);
    tg_audit("unblocked IP $ip");
    tg_json(['ok' => true]);
}
if ($action === 'clear_log') {
    @unlink(tg_sec_path('security-log.jsonl'));
    @unlink(tg_sec_path('security-log.jsonl.1'));
    tg_audit('security log cleared');
    tg_json(['ok' => true]);
}
if ($action === 'settings') {
    $list = function ($v) use ($validIp) {
        $out = [];
        foreach ((array)$v as $x) { $ok = $validIp($x); if ($ok !== null) $out[] = $ok; if (count($out) >= 50) break; }
        return array_values(array_unique($out));
    };
    $num = fn($k, $min, $max, $def) => max($min, min($max, (int)($body[$k] ?? $def)));
    $ban = array_values(array_filter(array_map('intval', (array)($body['banMinutes'] ?? [])), fn($m) => $m >= 1 && $m <= 525600));
    $next = [
        'waf' => !empty($body['waf']), 'autoBan' => !empty($body['autoBan']),
        'threshold' => $num('threshold', 20, 1000, 100), 'windowMinutes' => $num('windowMinutes', 1, 240, 15),
        'banMinutes' => array_slice($ban ?: TG_SEC_DEFAULTS['banMinutes'], 0, 6),
        'allowIps' => $list($body['allowIps'] ?? []), 'adminIps' => $list($body['adminIps'] ?? []),
        'behindCloudflare' => !empty($body['behindCloudflare']), 'trustedProxies' => $list($body['trustedProxies'] ?? []),
        'floodPerMinute' => $num('floodPerMinute', 30, 5000, 300),
    ];
    // An admin allow-list that does not include the address being used right now would lock the admin out.
    if ($next['adminIps'] && !tg_ip_in(tg_client_ip(), $next['adminIps'])) {
        tg_error('Your current address (' . tg_client_ip() . ') is not in the admin allow-list. Add it first, or you would be locked out.');
    }
    tg_sec_update('security-config.json', fn() => $next);
    tg_audit('security settings changed');
    tg_json(['ok' => true, 'config' => $next]);
}
tg_error('Unknown action.', 404);
