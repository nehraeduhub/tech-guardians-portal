<?php
// Outgoing email (sign-in codes, test mails).
// Settings live in data/mail-config.json (admin only; the SMTP password is
// never sent back to the browser). Sending uses SMTP when it is set up,
// otherwise the hosting's PHP mail().
require_once __DIR__ . '/lib.php';

const TG_MAIL_DEFAULTS = [
    'otpEnabled' => false,       // students may sign in with an email code
    'method' => 'smtp',          // smtp | mail
    'fromEmail' => '',
    'fromName' => 'Tech Guardians',
    'smtpHost' => 'smtp.hostinger.com',
    'smtpPort' => 465,
    'smtpSecure' => 'ssl',       // ssl (465) | tls (587, STARTTLS)
    'smtpUser' => '',
    'smtpPass' => '',
];

function tg_mail_config(): array
{
    $c = tg_read_json('mail-config.json', []);
    return array_merge(TG_MAIL_DEFAULTS, is_array($c) ? array_intersect_key($c, TG_MAIL_DEFAULTS) : []);
}

/** Settings for the admin page: everything except the password itself. */
function tg_mail_config_public(): array
{
    $c = tg_mail_config();
    $c['hasPass'] = $c['smtpPass'] !== '';
    unset($c['smtpPass']);
    return $c;
}

/** Can the site send mail with the saved settings? */
function tg_mail_ready(array $c): bool
{
    if (!filter_var($c['fromEmail'], FILTER_VALIDATE_EMAIL)) return false;
    return $c['method'] === 'mail' || ($c['smtpHost'] !== '' && $c['smtpUser'] !== '' && $c['smtpPass'] !== '');
}

function tg_mail_line(string $s): string { return trim(preg_replace('/[\r\n\0]+/', ' ', $s)); }
function tg_mail_header_text(string $s): string { return '=?UTF-8?B?' . base64_encode(tg_mail_line($s)) . '?='; }

/** The full message (headers + body) as multipart text/html. */
function tg_mail_message(array $c, string $to, string $subject, string $text, string $html): array
{
    $boundary = 'tg' . bin2hex(random_bytes(12));
    $domain = substr(strrchr($c['fromEmail'], '@') ?: '@localhost', 1);
    $headers = [
        'From: ' . tg_mail_header_text($c['fromName'] ?: 'Tech Guardians') . ' <' . tg_mail_line($c['fromEmail']) . '>',
        'Reply-To: ' . tg_mail_line($c['fromEmail']),
        'Date: ' . date(DATE_RFC2822),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    ];
    $body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text)) . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html)) . "--$boundary--\r\n";
    return [$headers, $body];
}

/** Send one email. Returns '' when sent, else a short reason (for the admin's test button and the log). */
function tg_send_mail(string $to, string $subject, string $text, string $html): string
{
    $c = tg_mail_config();
    $to = tg_mail_line($to);
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return 'Invalid recipient address.';
    if (!tg_mail_ready($c)) return 'Email is not set up yet (Manage → Email & OTP Login).';
    [$headers, $body] = tg_mail_message($c, $to, $subject, $text, $html);

    if ($c['method'] === 'mail') {
        $ok = @mail($to, tg_mail_header_text($subject), $body, implode("\r\n", $headers), '-f' . escapeshellarg($c['fromEmail']));
        return $ok ? '' : 'The hosting mail() function refused the message. Try SMTP instead.';
    }
    return tg_smtp_send($c, $to, array_merge($headers, ['To: <' . $to . '>', 'Subject: ' . tg_mail_header_text($subject)]), $body);
}

/** Minimal SMTP client: SSL (465) or STARTTLS (587), AUTH LOGIN. */
function tg_smtp_send(array $c, string $to, array $headers, string $body): string
{
    $host = tg_mail_line($c['smtpHost']);
    $port = (int)$c['smtpPort'] ?: ($c['smtpSecure'] === 'tls' ? 587 : 465);
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true]]);
    $remote = ($c['smtpSecure'] === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $fp = @stream_socket_client($remote, $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) return "Could not connect to $host:$port ($errstr).";
    stream_set_timeout($fp, 15);
    $read = function () use ($fp) {
        $out = '';
        while (($line = fgets($fp, 515)) !== false) { $out .= $line; if (strlen($line) < 4 || $line[3] === ' ') break; }
        return $out;
    };
    $say = function (string $cmd, array $want) use ($fp, $read) {
        if ($cmd !== '') fwrite($fp, $cmd . "\r\n");
        $r = $read();
        return in_array((int)substr($r, 0, 3), $want, true) ? '' : (trim($r) !== '' ? trim($r) : 'no reply');
    };
    $fail = function (string $step, string $why) use ($fp) { @fwrite($fp, "QUIT\r\n"); fclose($fp); return "SMTP $step failed: " . mb_substr($why, 0, 160); };
    $me = preg_replace('/[^A-Za-z0-9.-]/', '', $_SERVER['SERVER_NAME'] ?? 'localhost') ?: 'localhost';

    if ($e = $say('', [220])) return $fail('greeting', $e);
    if ($e = $say("EHLO $me", [250])) return $fail('EHLO', $e);
    if ($c['smtpSecure'] === 'tls') {
        if ($e = $say('STARTTLS', [220])) return $fail('STARTTLS', $e);
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) return $fail('TLS', 'could not start encryption');
        if ($e = $say("EHLO $me", [250])) return $fail('EHLO', $e);
    }
    if ($e = $say('AUTH LOGIN', [334])) return $fail('login', $e);
    if ($e = $say(base64_encode($c['smtpUser']), [334])) return $fail('login', $e);
    if ($e = $say(base64_encode($c['smtpPass']), [235])) return $fail('login (check the email and password)', $e);
    if ($e = $say('MAIL FROM:<' . tg_mail_line($c['fromEmail']) . '>', [250])) return $fail('MAIL FROM', $e);
    if ($e = $say('RCPT TO:<' . $to . '>', [250, 251])) return $fail('RCPT TO', $e);
    if ($e = $say('DATA', [354])) return $fail('DATA', $e);
    // Dot-stuff lines that start with "." and end with <CRLF>.<CRLF>.
    $data = implode("\r\n", $headers) . "\r\n\r\n" . preg_replace('/^\./m', '..', $body);
    if ($e = $say($data . "\r\n.", [250])) return $fail('send', $e);
    $say('QUIT', [221]);
    fclose($fp);
    return '';
}

/** The sign-in code email. */
function tg_otp_mail(string $to, string $name, string $code): string
{
    $first = explode(' ', trim($name))[0] ?: 'there';
    $text = "Hi $first,\r\n\r\nYour Tech Guardians sign-in code is: $code\r\n\r\nIt is valid for 10 minutes. Do not share it with anyone — Tech Guardians will never ask for it.\r\nIf you did not try to sign in, you can ignore this email.\r\n\r\nTech Guardians — Keep Learning, Keep Sharing";
    $h = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    $html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0b1f4a">'
        . '<div style="height:6px;background:linear-gradient(90deg,#ff9933 33%,#ffffff 33% 66%,#138808 66%);border-radius:3px"></div>'
        . '<h2 style="margin:20px 0 8px">Your sign-in code</h2>'
        . '<p>Hi ' . $h($first) . ', use this code to sign in to your Tech Guardians student account:</p>'
        . '<div style="font-size:34px;font-weight:700;letter-spacing:10px;background:#f2f5fb;border:1px solid #d7dfee;border-radius:12px;padding:16px;text-align:center;margin:18px 0">' . $h($code) . '</div>'
        . '<p style="color:#4b5a78;font-size:14px">Valid for 10 minutes. Do not share it with anyone — Tech Guardians will never ask for it. If you did not try to sign in, ignore this email.</p>'
        . '<p style="color:#8090ad;font-size:12px;margin-top:24px">Tech Guardians — Keep Learning, Keep Sharing</p></div>';
    return tg_send_mail($to, 'Your Tech Guardians sign-in code: ' . $code, $text, $html);
}
