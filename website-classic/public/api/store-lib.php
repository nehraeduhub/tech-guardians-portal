<?php
// Shared data for the PDF store, checkout and orders.
// data/store.json holds the payment settings and the products, including the
// private Google Drive links, so it is only ever sent to the admin.
require_once __DIR__ . '/lib.php';

function tg_store_defaults(): array
{
    return [
        'settings' => [
            // 'approval': buyer downloads after the admin approves the payment.
            // 'instant' : buyer downloads right after submitting the payment details.
            'delivery' => 'approval',
            'payeeName' => 'Ms Seth Enterprises',
            'upiId' => '',
            'qrImage' => '/images/payment-qr.jpg',
            'whatsapp' => '919929193136',
            'email' => 'ittechguardians@gmail.com',
            // Google Apps Script web app (or a "Publish to web" CSV link) for the enrollment sheet.
            'sheetUrl' => 'https://script.google.com/macros/s/AKfycby4vVoo20WGdp7hLuxvLP7_NrpFzuMFHC6tkFsLyzMexS44vte8_4nYVEMWAE_xrE7r/exec',
            'sheetSync' => true,
        ],
        'products' => [
            [
                'id' => 'windows-linux-hardening',
                'title' => 'Windows & Linux System Hardening',
                'subtitle' => 'Step-by-step vulnerability detection & remediation',
                'description' => "A practical hardening playbook by RJ Nehra. Every chapter shows how to detect the weakness, why it matters, the exact commands to fix it, and how to verify the fix.\n\nPart I covers Windows 10/11 and Server 2019/2022: firewall, SMBv1, Defender, BitLocker, UAC, RDP, PowerShell logging, audit policy, LAPS, TLS hardening, patching and Credential Guard.\nPart II covers Ubuntu, RHEL and Rocky Linux.\n\nMapped to CIS Benchmarks, NIST 800-53, DISA STIG and ISO 27001.",
                'pages' => 34,
                'format' => 'PDF',
                'price' => 999,
                'offerPrice' => 499,
                'cover' => '/images/store/hardening-cover.jpg',
                'previews' => ['/images/store/hardening-preview-1.jpg', '/images/store/hardening-preview-2.jpg', '/images/store/hardening-preview-3.jpg'],
                'tags' => ['Windows', 'Linux', 'CIS', 'NIST'],
                'driveLink' => '',
                'visible' => true,
            ],
            [
                'id' => 'networking-handbook',
                'title' => 'Complete Networking Handbook',
                'subtitle' => 'From cables to cloud — Cyber Fouji Series',
                'description' => "Everything you need to understand networks, written for students and new security professionals.\n\nCovers networking fundamentals, the OSI and TCP/IP models, IPv4/IPv6 addressing and subnetting, TCP vs UDP, common ports and protocols, DNS, DHCP, routing, switching and VLANs, and network security — with tables and diagrams you can revise from.",
                'pages' => 19,
                'format' => 'PDF',
                'price' => 499,
                'offerPrice' => 199,
                'cover' => '/images/store/networking-cover.jpg',
                'previews' => ['/images/store/networking-preview-1.jpg', '/images/store/networking-preview-2.jpg', '/images/store/networking-preview-3.jpg'],
                'tags' => ['Networking', 'OSI', 'Subnetting'],
                'driveLink' => '',
                'visible' => true,
            ],
        ],
    ];
}

function tg_store(): array
{
    $saved = tg_read_json('store.json', null);
    $d = tg_store_defaults();
    if (!is_array($saved)) return $d;
    $saved['settings'] = array_merge($d['settings'], is_array($saved['settings'] ?? null) ? $saved['settings'] : []);
    if (!isset($saved['products']) || !is_array($saved['products'])) $saved['products'] = $d['products'];
    return $saved;
}

function tg_store_product(string $id): ?array
{
    foreach (tg_store()['products'] as $p) if (($p['id'] ?? '') === $id) return $p;
    return null;
}

/** Product fields every visitor may see (never the Drive link). */
function tg_public_product(array $p): array
{
    return [
        'id' => $p['id'], 'title' => $p['title'] ?? '', 'subtitle' => $p['subtitle'] ?? '',
        'description' => $p['description'] ?? '', 'pages' => (int)($p['pages'] ?? 0), 'format' => $p['format'] ?? 'PDF',
        'price' => (float)($p['price'] ?? 0), 'offerPrice' => (float)($p['offerPrice'] ?? 0),
        'cover' => $p['cover'] ?? '', 'previews' => array_values($p['previews'] ?? []), 'tags' => array_values($p['tags'] ?? []),
    ];
}

function tg_product_amount(array $p): float
{
    $offer = (float)($p['offerPrice'] ?? 0);
    return $offer > 0 ? $offer : (float)($p['price'] ?? 0);
}

function tg_public_settings(): array
{
    $s = tg_store()['settings'];
    return [
        'payeeName' => $s['payeeName'], 'upiId' => $s['upiId'], 'qrImage' => $s['qrImage'],
        'whatsapp' => $s['whatsapp'], 'email' => $s['email'], 'delivery' => $s['delivery'],
    ];
}

/** Send an enrollment to the Google Sheet (Apps Script) in the format the sheet already uses. */
function tg_post_to_sheet(array $record): void
{
    $s = tg_store()['settings'];
    $url = (string)($s['sheetUrl'] ?? '');
    if (!preg_match('#^https://script\.google\.com/#', $url) || !function_exists('curl_init')) return;
    $parts = preg_split('/\s+/', trim($record['name']), 2);
    $payload = [
        'timestamp' => $record['date'] ?: gmdate('d/m/Y, H:i:s'),
        'firstName' => $parts[0] ?? '', 'lastName' => $parts[1] ?? '',
        'email' => $record['email'], 'phone' => $record['phone'],
        'course' => $record['course'], 'amount' => $record['amount'],
        'transactionId' => $record['utr'], 'screenshotName' => !empty($record['shot_id']) ? 'uploaded on website' : '',
        'orderId' => $record['id'], 'type' => $record['type'],
    ];
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 4,
    ]);
    curl_exec($ch);
    curl_close($ch);
}
