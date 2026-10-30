<?php
// Shared helpers for the Tech Guardians CTF portal (used by ctf.php and payments.php).
// Room content and flag hashes live in api/ctf-data/ (never served directly).
// Every room's first task is free for signed-in students; the rest need an
// active CTF plan, bought on the checkout page and approved by the admin.
require_once __DIR__ . '/users-lib.php';

const TG_CTF_DIR = __DIR__ . '/ctf-data';
const TG_CTF_DEFAULT_PLANS = [
    'monthly' => ['label' => 'Monthly', 'days' => 30, 'price' => 99],
    'annual' => ['label' => 'Annual', 'days' => 365, 'price' => 999],
];

/** Plans with the admin's prices (Manage → CTF Portal). */
function tg_ctf_plans(): array
{
    $plans = TG_CTF_DEFAULT_PLANS;
    $own = tg_read_json('settings.json', [])['tg_ctf']['value'] ?? [];
    foreach ($plans as $k => &$p) {
        $price = (int)($own['prices'][$k] ?? 0);
        if ($price > 0 && $price <= 100000) $p['price'] = $price;
    }
    return $plans;
}

function tg_ctf_data(): array
{
    static $data = null;
    if ($data === null) {
        $data = json_decode((string)@file_get_contents(TG_CTF_DIR . '/rooms.json'), true) ?: ['paths' => [], 'rooms' => []];
    }
    return $data;
}

function tg_ctf_room(string $slug): ?array
{
    foreach (tg_ctf_data()['rooms'] as $r) if (($r['slug'] ?? '') === $slug) return $r;
    return null;
}

/** The free task of a room: its first task. */
function tg_ctf_free_id(array $room): int
{
    return (int)($room['tasks'][0]['id'] ?? 1);
}

/**
 * A student's CTF access. Approved plan payments run back to back from their
 * approval time; the admin can also grant access until a date (ctf_until).
 */
function tg_ctf_access(array $u): array
{
    $plans = tg_ctf_plans();
    $rows = [];
    $pending = false;
    foreach (tg_read_json('payments.json', []) as $o) {
        if (($o['type'] ?? '') !== 'ctf' || ($o['user_id'] ?? '') !== $u['id']) continue;
        if (($o['status'] ?? '') === 'pending') { $pending = true; continue; }
        if (($o['status'] ?? '') !== 'approved' || !isset($plans[$o['plan'] ?? ''])) continue;
        $rows[] = ['at' => strtotime((string)($o['status_at'] ?? $o['received_at'] ?? '')) ?: time(), 'plan' => $o['plan']];
    }
    usort($rows, fn($a, $b) => $a['at'] <=> $b['at']);
    $end = 0;
    $plan = '';
    foreach ($rows as $r) {
        $start = max($r['at'], $end);
        $end = $start + $plans[$r['plan']]['days'] * 86400;
        $plan = $r['plan'];
    }
    $granted = strtotime((string)($u['ctf_until'] ?? '')) ?: 0;
    if ($granted > $end) { $end = $granted + 86399; $plan = 'granted'; }
    return ['active' => $end > time(), 'plan' => $end > time() ? $plan : '', 'until' => $end ? gmdate('c', $end) : '', 'pending' => $pending];
}

/** Solved tasks per room for one student: [slug => [taskId => solvedAt]]. */
function tg_ctf_progress(string $key): array
{
    $all = tg_read_json('ctf-progress.json', []);
    return is_array($all[$key] ?? null) ? $all[$key] : [];
}
