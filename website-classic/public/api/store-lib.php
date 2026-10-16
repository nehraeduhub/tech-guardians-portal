<?php
// Shared data for the PDF store, checkout and orders.
// data/store.json holds the payment settings and the products, including the
// private Google Drive links, so it is only ever sent to the admin.
require_once __DIR__ . '/lib.php';

/** Version of the shipped book catalogue; a saved store from an older version gets the new books. */
const TG_STORE_CATALOG_VERSION = 2;
/** Folder with the sellable PDF files (blocked from direct web access). */
define('TG_BOOKS_DIR', __DIR__ . '/books');

function tg_store_books(): array
{
    $books = json_decode((string)@file_get_contents(__DIR__ . '/store-books.json'), true);
    return is_array($books) ? $books : [];
}

/** Path of a book's PDF stored on this server, or '' when there is none. */
function tg_book_file(string $id): string
{
    if (!preg_match('/^[a-z0-9-]{1,80}$/', $id)) return '';
    $path = TG_BOOKS_DIR . '/' . $id . '.pdf';
    return is_file($path) ? $path : '';
}

/** Send a book's PDF to the browser as a download. */
function tg_send_book(string $path, string $title): void
{
    $name = preg_replace('/[^A-Za-z0-9 _.&-]+/', '', $title) ?: 'Tech-Guardians-Handbook';
    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: attachment; filename="' . $name . ' - Tech Guardians.pdf"');
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    readfile($path);
    exit;
}

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
        // The Tech Guardians Cyber Security Handbook series (api/store-books.json).
        'products' => tg_store_books(),
    ];
}

function tg_store(): array
{
    $saved = tg_read_json('store.json', null);
    $d = tg_store_defaults();
    if (!is_array($saved)) return $d;
    $saved['settings'] = array_merge($d['settings'], is_array($saved['settings'] ?? null) ? $saved['settings'] : []);
    if (!isset($saved['products']) || !is_array($saved['products']) || (int)($saved['catalogVersion'] ?? 1) < TG_STORE_CATALOG_VERSION) {
        $saved['products'] = $d['products'];
    }
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
        'category' => (string)($p['category'] ?? ''), 'series' => (int)($p['series'] ?? 0),
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
