<?php
// Public site settings (WhatsApp number, events, courses, blogs, ...).
//   GET  settings.php                 -> [{ key, value }, ...]
//   GET  settings.php?keys=a,b        -> only those keys
//   POST settings.php { key, value }  -> admin only
// Stored in data/settings.json. Never store payment records here: every
// visitor can read these values.
require_once __DIR__ . '/lib.php';

const TG_MAX_SETTING_BYTES = 2000000;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $all = tg_read_json('settings.json', []);
    $wanted = isset($_GET['keys']) ? array_filter(array_map('trim', explode(',', (string)$_GET['keys']))) : null;
    $rows = [];
    foreach ($all as $key => $row) {
        if ($wanted !== null && !in_array($key, $wanted, true)) continue;
        $rows[] = ['key' => $key, 'value' => $row['value'] ?? null];
    }
    tg_json($rows);
}

$body = tg_require_json_post();
tg_require_admin();

$key = (string)($body['key'] ?? '');
if (!preg_match('/^[a-z0-9_.-]{1,80}$/i', $key)) tg_error('Invalid setting name.');
if (!array_key_exists('value', $body)) tg_error('Missing value.');
if (strlen(json_encode($body['value'])) > TG_MAX_SETTING_BYTES) tg_error('Setting is too large.', 413);

tg_update_json('settings.json', function ($all) use ($key, $body) {
    $all[$key] = ['value' => $body['value'], 'updated_at' => gmdate('c')];
    return $all;
});
tg_json(['ok' => true]);
