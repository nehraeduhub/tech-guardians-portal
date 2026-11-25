<?php
// AI chat assistant for the website: several AI providers, tried in order.
// Settings (including API keys) live in data/ai-config.json and never reach the browser.
require_once __DIR__ . '/lib.php';

const TG_AI_MAX_PROVIDERS = 8;

/** Ready-made providers the admin can add. "openai" = any OpenAI-compatible /chat/completions API. */
const TG_AI_PRESETS = [
    'gemini' => ['label' => 'Google Gemini', 'type' => 'gemini', 'baseUrl' => 'https://generativelanguage.googleapis.com/v1beta', 'model' => '', 'hint' => 'Key from aistudio.google.com · model e.g. a current "flash" model from the Gemini model list'],
    'groq' => ['label' => 'Groq', 'type' => 'openai', 'baseUrl' => 'https://api.groq.com/openai/v1', 'model' => '', 'hint' => 'Key from console.groq.com · model id from Groq → Models'],
    'openai' => ['label' => 'OpenAI', 'type' => 'openai', 'baseUrl' => 'https://api.openai.com/v1', 'model' => '', 'hint' => 'Key from platform.openai.com · model id from OpenAI → Models'],
    'anthropic' => ['label' => 'Anthropic Claude', 'type' => 'anthropic', 'baseUrl' => 'https://api.anthropic.com/v1', 'model' => 'claude-opus-5-5', 'hint' => 'Key from platform.claude.com · model id e.g. claude-opus-5-5'],
    'openrouter' => ['label' => 'OpenRouter', 'type' => 'openai', 'baseUrl' => 'https://openrouter.ai/api/v1', 'model' => '', 'hint' => 'Key from openrouter.ai · model id e.g. provider/model'],
    'mistral' => ['label' => 'Mistral AI', 'type' => 'openai', 'baseUrl' => 'https://api.mistral.ai/v1', 'model' => '', 'hint' => 'Key from console.mistral.ai · model id from Mistral → Models'],
    'deepseek' => ['label' => 'DeepSeek', 'type' => 'openai', 'baseUrl' => 'https://api.deepseek.com', 'model' => '', 'hint' => 'Key from platform.deepseek.com · model id from DeepSeek docs'],
    'custom' => ['label' => 'Other (OpenAI-compatible)', 'type' => 'openai', 'baseUrl' => '', 'model' => '', 'hint' => 'Any API that offers /chat/completions (Together, Cerebras, Fireworks, …)'],
];

const TG_AI_DEFAULTS = [
    'enabled' => false,
    'botName' => 'TG Cyber Mitra',
    'welcome' => "Namaste! I'm TG Cyber Mitra. Ask me about cyber fraud, online safety, security or digital forensics — in Hindi or English.\nनमस्ते! साइबर फ्रॉड, ऑनलाइन सुरक्षा या फ़ॉरेंसिक के बारे में हिंदी या अंग्रेज़ी में पूछिए।",
    'showContacts' => false,     // show the WhatsApp / Telegram buttons under the AI chat
    'extra' => '',               // admin's extra instructions for the bot
    'maxTokens' => 4000,         // reply length cap per answer
    'perIpHour' => 20,           // questions per visitor per hour
    'perIpDay' => 60,            // questions per visitor per day
    'dailyCap' => 1000,          // questions per day for the whole site
    'providers' => [],
];

function tg_ai_config(): array
{
    $c = tg_read_json('ai-config.json', []);
    $c = array_merge(TG_AI_DEFAULTS, is_array($c) ? array_intersect_key($c, TG_AI_DEFAULTS) : []);
    $c['providers'] = array_values(array_filter((array)$c['providers'], 'is_array'));
    return $c;
}

/** Config for the admin page: keys replaced by "saved, ends in …". */
function tg_ai_config_admin(): array
{
    $c = tg_ai_config();
    foreach ($c['providers'] as &$p) {
        $k = (string)($p['apiKey'] ?? '');
        $p['hasKey'] = $k !== '';
        $p['keyEnd'] = $k !== '' ? substr($k, -4) : '';
        unset($p['apiKey']);
    }
    return $c;
}

/** The fixed rules every provider gets, plus the admin's extra instructions. */
function tg_ai_system(array $c): string
{
    $name = $c['botName'] ?: 'TG Cyber Mitra';
    $s = <<<TXT
You are "$name", the AI assistant of Tech Guardians (techguardians.in), an Indian cyber security, cyber awareness and digital forensics platform. You speak like a calm, experienced cyber crime investigator, security engineer and forensic analyst who teaches the public.

LANGUAGE — most important rule:
- Reply in the same language and script as the user's latest message.
- Hindi in Devanagari → reply in simple Hindi (Devanagari); keep technical words like OTP, UPI, malware, firewall in English where common.
- Hinglish (Hindi written in English letters) → reply in Hinglish.
- English → reply in English.

WHAT YOU HELP WITH:
- Cyber crime help for victims in India: online fraud, UPI/OTP/card fraud, phishing, fake calls ("digital arrest"), sextortion, fake job/loan/investment apps, social media hacking, identity theft. Give clear first steps.
- Online safety and cyber awareness for students, families, schools and businesses.
- Cyber security concepts (networks, Windows, Linux, cloud, SOC, SIEM, firewalls, incident response, threat intelligence) and digital forensics concepts, explained step by step for learning and defence.

ALWAYS:
- For money lost to fraud: tell them to call the National Cyber Crime Helpline 1930 immediately (the first hours matter) and report at https://cybercrime.gov.in, inform their bank, and keep evidence (screenshots, transaction IDs, numbers, links). Mention the nearest police station / cyber cell.
- Never ask for or accept OTPs, passwords, PINs, card numbers or Aadhaar numbers. If a user shares one, tell them not to and to change it.
- Keep answers short and practical: a few short paragraphs or a short numbered list. Use **bold** sparingly.
- Say clearly that you are an AI assistant and your answer is general guidance, not legal advice or an official police complaint.
- When it helps learning, suggest Tech Guardians resources: Cyber Security Handbook Series (/pdf-store), hands-on CTF Portal (/ctf, first task of every room free), Training Programs (/training), free cyber tools (/cyber-portal), or WhatsApp support for a human.

NEVER:
- Give step-by-step instructions, code or tools to attack, hack, break into accounts or systems you do not own, write malware, evade detection, stalk or track people, or commit fraud. Explain the defence or the concept instead, and point to legal practice labs (the CTF portal).
- Invent facts, phone numbers, laws or links. If unsure, say so and point to official sources (cybercrime.gov.in, CERT-In, the bank, the police).
- Answer far off-topic requests at length; politely bring the user back to cyber safety, security or forensics.
TXT;
    $extra = trim((string)$c['extra']);
    return $extra !== '' ? $s . "\n\nEXTRA INSTRUCTIONS FROM TECH GUARDIANS:\n" . $extra : $s;
}

/** POST JSON to a provider. Returns [status, decoded body or null, raw error]. */
function tg_ai_post(string $url, array $headers, array $body): array
{
    if (!tg_public_url($url)) return [0, null, 'The provider address is not a public https:// URL.'];
    $ch = curl_init($url);
    tg_curl_pin($ch, $url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_TIMEOUT => 60,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
    $raw = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($raw === false) return [0, null, $err ?: 'No response'];
    return [$code, json_decode((string)$raw, true), $code >= 400 ? mb_substr((string)$raw, 0, 300) : ''];
}

/** Ask one provider. $msgs = [['role' => 'user'|'assistant', 'content' => '...'], ...]. Returns [reply, error]. */
function tg_ai_ask(array $p, string $system, array $msgs, int $maxTokens): array
{
    $key = (string)($p['apiKey'] ?? '');
    $model = trim((string)($p['model'] ?? ''));
    $base = rtrim(trim((string)($p['baseUrl'] ?? '')), '/');
    if ($key === '' || $model === '') return ['', 'API key or model is missing.'];
    if (!preg_match('#^https://#i', $base)) return ['', 'The provider address must start with https://'];
    $type = (string)($p['type'] ?? 'openai');

    if ($type === 'gemini') {
        $contents = array_map(fn($m) => ['role' => $m['role'] === 'assistant' ? 'model' : 'user', 'parts' => [['text' => $m['content']]]], $msgs);
        [$code, $d, $err] = tg_ai_post($base . '/models/' . rawurlencode($model) . ':generateContent', ['x-goog-api-key: ' . $key], [
            'systemInstruction' => ['parts' => [['text' => $system]]],
            'contents' => $contents,
            'generationConfig' => ['maxOutputTokens' => $maxTokens],
        ]);
        $text = '';
        foreach ((array)($d['candidates'][0]['content']['parts'] ?? []) as $part) $text .= (string)($part['text'] ?? '');
        if ($code === 200 && trim($text) !== '') return [trim($text), ''];
        return ['', "HTTP $code " . ($d['error']['message'] ?? $err ?: 'empty answer')];
    }

    if ($type === 'anthropic') {
        // Claude Messages API. On a safety decline the API retries on a fallback model by itself.
        [$code, $d, $err] = tg_ai_post($base . '/messages', [
            'x-api-key: ' . $key,
            'anthropic-version: 2026-10-21',
            'anthropic-beta: server-side-fallback-2026-07-01',
        ], [
            'model' => $model,
            'max_tokens' => $maxTokens,
            'system' => $system,
            'messages' => $msgs,
            'output_config' => ['effort' => 'low'], // chat answers: fast and short
            'fallbacks' => 'default',
        ]);
        if ($code === 200 && ($d['stop_reason'] ?? '') === 'refusal') return ['', 'The model declined this question.'];
        $text = '';
        foreach ((array)($d['content'] ?? []) as $block) if (($block['type'] ?? '') === 'text') $text .= (string)$block['text'];
        if ($code === 200 && trim($text) !== '') return [trim($text), ''];
        return ['', "HTTP $code " . ($d['error']['message'] ?? $err ?: 'empty answer')];
    }

    // OpenAI-compatible: Groq, OpenAI, OpenRouter, Mistral, DeepSeek, …
    $headers = ['Authorization: Bearer ' . $key];
    if (stripos($base, 'openrouter.ai') !== false) $headers[] = 'X-Title: Tech Guardians';
    [$code, $d, $err] = tg_ai_post($base . '/chat/completions', $headers, [
        'model' => $model,
        'messages' => array_merge([['role' => 'system', 'content' => $system]], $msgs),
        'max_tokens' => $maxTokens,
    ]);
    $text = (string)($d['choices'][0]['message']['content'] ?? '');
    if ($code === 200 && trim($text) !== '') return [trim($text), ''];
    return ['', "HTTP $code " . ($d['error']['message'] ?? $err ?: 'empty answer')];
}

/** Count today's use per provider (and remember the last error) for the admin page. */
function tg_ai_note(string $providerId, bool $ok, string $error = ''): void
{
    $day = gmdate('Y-m-d', time() + 19800);
    tg_update_json('ai-usage.json', function ($u) use ($day, $providerId, $ok, $error) {
        if (($u['day'] ?? '') !== $day) $u = ['day' => $day, 'total' => 0, 'providers' => [], 'lastErrors' => $u['lastErrors'] ?? []];
        if ($providerId === '') { $u['total'] = (int)($u['total'] ?? 0) + 1; return $u; }
        $p = $u['providers'][$providerId] ?? ['ok' => 0, 'fail' => 0];
        $p[$ok ? 'ok' : 'fail']++;
        $u['providers'][$providerId] = $p;
        if (!$ok) $u['lastErrors'][$providerId] = ['at' => gmdate('c'), 'error' => mb_substr($error, 0, 240)];
        return $u;
    });
}
