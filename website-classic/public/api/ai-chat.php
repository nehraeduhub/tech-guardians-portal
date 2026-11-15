<?php
// AI chat assistant.
// Public:
//   GET  ai-chat.php                 -> { enabled, botName, welcome }
//   POST ai-chat.php { messages: [{role: user|assistant, content}] } -> { reply }
// Admin:
//   GET  ai-chat.php?action=admin    -> settings (keys hidden), presets, today's usage
//   POST ai-chat.php?action=save     { enabled, botName, welcome, extra, maxTokens, perIpHour, perIpDay, dailyCap, providers[] }
//                                     (an empty apiKey keeps the saved key)
//   POST ai-chat.php?action=test     { id } -> asks that provider a short question
require_once __DIR__ . '/ai-lib.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'admin') {
        tg_require_admin();
        tg_json(['config' => tg_ai_config_admin(), 'presets' => TG_AI_PRESETS, 'usage' => tg_read_json('ai-usage.json', [])]);
    }
    $c = tg_ai_config();
    $ready = $c['enabled'] && array_filter($c['providers'], fn($p) => !empty($p['enabled']) && !empty($p['apiKey']) && !empty($p['model']));
    tg_json(['enabled' => (bool)$ready, 'botName' => $c['botName'], 'welcome' => $c['welcome'], 'showContacts' => (bool)$c['showContacts']]);
}

$body = tg_require_json_post();

if ($action === 'save') {
    tg_require_admin();
    $old = [];
    foreach (tg_ai_config()['providers'] as $p) $old[(string)($p['id'] ?? '')] = $p;
    $providers = [];
    foreach (array_slice((array)($body['providers'] ?? []), 0, TG_AI_MAX_PROVIDERS) as $p) {
        if (!is_array($p)) continue;
        $id = preg_match('/^[a-z0-9]{6,16}$/', (string)($p['id'] ?? '')) ? $p['id'] : bin2hex(random_bytes(5));
        $preset = isset(TG_AI_PRESETS[$p['preset'] ?? '']) ? $p['preset'] : 'custom';
        $type = TG_AI_PRESETS[$preset]['type'];
        $base = rtrim(trim((string)($p['baseUrl'] ?? '')), '/');
        if ($preset !== 'custom') $base = TG_AI_PRESETS[$preset]['baseUrl'];
        if ($base !== '' && !preg_match('#^https://[a-z0-9.-]+(:\d+)?(/[A-Za-z0-9._~/-]*)?$#i', $base)) tg_error('Provider address must be a plain https:// URL.');
        $key = trim((string)($p['apiKey'] ?? ''));
        $providers[] = [
            'id' => $id, 'preset' => $preset, 'type' => $type,
            'label' => mb_substr(trim((string)($p['label'] ?? '')), 0, 40) ?: TG_AI_PRESETS[$preset]['label'],
            'baseUrl' => $base,
            'model' => mb_substr(preg_replace('/[^A-Za-z0-9._:\/@-]/', '', (string)($p['model'] ?? '')), 0, 120),
            'apiKey' => !empty($p['clearKey']) ? '' : ($key !== '' ? mb_substr($key, 0, 300) : (string)($old[$id]['apiKey'] ?? '')),
            'enabled' => !empty($p['enabled']),
        ];
    }
    $num = fn($k, $min, $max, $def) => max($min, min($max, (int)($body[$k] ?? $def)));
    $next = [
        'enabled' => !empty($body['enabled']),
        'showContacts' => !empty($body['showContacts']),
        'botName' => mb_substr(trim((string)($body['botName'] ?? '')), 0, 40) ?: TG_AI_DEFAULTS['botName'],
        'welcome' => mb_substr(trim((string)($body['welcome'] ?? '')), 0, 600) ?: TG_AI_DEFAULTS['welcome'],
        'extra' => mb_substr(trim((string)($body['extra'] ?? '')), 0, 3000),
        'maxTokens' => $num('maxTokens', 200, 16000, 4000),
        'perIpHour' => $num('perIpHour', 1, 500, 20),
        'perIpDay' => $num('perIpDay', 1, 5000, 60),
        'dailyCap' => $num('dailyCap', 1, 100000, 1000),
        'providers' => $providers,
    ];
    tg_update_json('ai-config.json', fn() => $next, []);
    tg_json(['ok' => true, 'config' => tg_ai_config_admin()]);
}

if ($action === 'test') {
    tg_require_admin();
    tg_rate_limit('aitest', 20, 600);
    $c = tg_ai_config();
    foreach ($c['providers'] as $p) {
        if (($p['id'] ?? '') !== ($body['id'] ?? '')) continue;
        $t = microtime(true);
        [$reply, $err] = tg_ai_ask($p, tg_ai_system($c), [['role' => 'user', 'content' => 'साइबर फ्रॉड होने पर सबसे पहले क्या करें? एक वाक्य में बताइए।']], 300);
        tg_ai_note((string)$p['id'], $err === '', $err);
        if ($err !== '') tg_error($err, 502);
        tg_json(['ok' => true, 'reply' => $reply, 'ms' => (int)((microtime(true) - $t) * 1000)]);
    }
    tg_error('Provider not found. Save first.', 404);
}

if ($action !== '') tg_error('Unknown action.', 404);

/* ---------- a visitor's question ---------- */
$c = tg_ai_config();
$providers = array_values(array_filter($c['providers'], fn($p) => !empty($p['enabled']) && !empty($p['apiKey']) && !empty($p['model'])));
if (!$c['enabled'] || !$providers) tg_error('The AI assistant is not available right now. Please contact us on WhatsApp.', 503);

// Last 10 turns only, each trimmed; the conversation must end with the visitor's question.
$msgs = [];
foreach (array_slice((array)($body['messages'] ?? []), -10) as $m) {
    if (!is_array($m)) continue;
    $role = ($m['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
    $text = trim(mb_substr((string)($m['content'] ?? ''), 0, $role === 'user' ? 1000 : 2000));
    if ($text === '') continue;
    if ($msgs && end($msgs)['role'] === $role) { $msgs[count($msgs) - 1]['content'] .= "\n" . $text; continue; }
    $msgs[] = ['role' => $role, 'content' => $text];
}
while ($msgs && $msgs[0]['role'] !== 'user') array_shift($msgs);
if (!$msgs || end($msgs)['role'] !== 'user') tg_error('Please type your question.');

tg_rate_limit('aichat-hour', $c['perIpHour'], 3600);
tg_rate_limit('aichat-day', $c['perIpDay'], 86400);
$usage = tg_read_json('ai-usage.json', []);
if (($usage['day'] ?? '') === gmdate('Y-m-d', time() + 19800) && (int)($usage['total'] ?? 0) >= $c['dailyCap']) {
    tg_error('Our AI assistant has reached today\'s limit. Please message us on WhatsApp or try again tomorrow.', 429);
}
tg_ai_note('', true);

$system = tg_ai_system($c);
foreach ($providers as $p) {
    [$reply, $err] = tg_ai_ask($p, $system, $msgs, (int)$c['maxTokens']);
    tg_ai_note((string)$p['id'], $err === '', $err);
    if ($err === '') tg_json(['reply' => $reply]);
}
tg_error('Our AI assistant is busy right now. Please try again in a minute, or message us on WhatsApp.', 503);
