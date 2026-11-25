<?php
// Time-based one-time passwords (RFC 6238): the 6-digit codes of Google Authenticator, Microsoft
// Authenticator, Authy, 1Password ... Used for the admin's second sign-in step.

const TG_B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function tg_b32_encode(string $bin): string
{
    $bits = '';
    foreach (str_split($bin) as $c) $bits .= str_pad(decbin(ord($c)), 8, '0', STR_PAD_LEFT);
    $out = '';
    foreach (str_split($bits, 5) as $chunk) $out .= TG_B32[bindec(str_pad($chunk, 5, '0'))];
    return $out;
}

function tg_b32_decode(string $s): string
{
    $s = strtoupper(preg_replace('/[^A-Za-z2-7]/', '', $s));
    $bits = '';
    foreach (str_split($s) as $c) $bits .= str_pad(decbin(strpos(TG_B32, $c)), 5, '0', STR_PAD_LEFT);
    $out = '';
    foreach (str_split($bits, 8) as $byte) if (strlen($byte) === 8) $out .= chr(bindec($byte));
    return $out;
}

function tg_totp_new_secret(): string { return tg_b32_encode(random_bytes(20)); }

function tg_totp_code(string $secret, int $counter): string
{
    $hash = hash_hmac('sha1', pack('J', $counter), tg_b32_decode($secret), true);
    $o = ord($hash[19]) & 0x0F;
    $n = ((ord($hash[$o]) & 0x7F) << 24) | (ord($hash[$o + 1]) << 16) | (ord($hash[$o + 2]) << 8) | ord($hash[$o + 3]);
    return str_pad((string)($n % 1000000), 6, '0', STR_PAD_LEFT);
}

/** Checks a code (30-second steps, one step of clock drift either way). Returns the matching counter, or 0. */
function tg_totp_verify(string $secret, string $code, int $now = 0): int
{
    $code = preg_replace('/\D/', '', $code);
    if (strlen($code) !== 6 || $secret === '') return 0;
    $step = intdiv($now ?: time(), 30);
    for ($d = -1; $d <= 1; $d++) {
        if (hash_equals(tg_totp_code($secret, $step + $d), $code)) return $step + $d;
    }
    return 0;
}

function tg_totp_uri(string $secret, string $account, string $issuer = 'Tech Guardians'): string
{
    return 'otpauth://totp/' . rawurlencode($issuer . ':' . $account) . '?secret=' . $secret . '&issuer=' . rawurlencode($issuer) . '&algorithm=SHA1&digits=6&period=30';
}
