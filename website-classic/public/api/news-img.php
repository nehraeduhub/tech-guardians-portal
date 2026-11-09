<?php
// Pictures for the Cyber News Portal.
//   GET news-img.php?u=<url>  -> the picture for a story in the cached news feeds
// <url> is either a story's image URL from its feed, or the story's own link
// (then the page's og:image / twitter:image is used). Only URLs that appear in
// data/news-global.json or data/news-india.json are fetched, so this cannot be
// used as an open proxy. Pictures are kept in data/news-img/ for a few days.
require_once __DIR__ . '/lib.php';

const TG_IMG_DIR = TG_DATA_DIR . '/news-img';
const TG_IMG_TTL = 3 * 86400;        // keep a picture this long
const TG_IMG_MISS_TTL = 6 * 3600;    // remember "no picture" this long
const TG_IMG_MAX = 4000000;          // bytes
const TG_IMG_TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];

function tg_img_none(): void
{
    header('Cache-Control: public, max-age=3600');
    http_response_code(404);
    exit;
}

/** GET a public URL, following up to 3 redirects and checking every hop. Returns [body, content-type, final url]. */
function tg_img_get(string $url, int $max, string $accept): ?array
{
    for ($hop = 0; $hop < 4; $hop++) {
        if (!tg_public_url($url)) return null;
        $ch = curl_init($url);
        $body = '';
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false, CURLOPT_FOLLOWLOCATION => false, CURLOPT_HEADER => false,
            CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 10, CURLOPT_ENCODING => '',
            CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; TechGuardiansBot/1.0; +https://techguardians.in)',
            CURLOPT_HTTPHEADER => ['Accept: ' . $accept],
            CURLOPT_WRITEFUNCTION => function ($ch, $chunk) use (&$body, $max) {
                $body .= $chunk;
                return strlen($body) > $max ? 0 : strlen($chunk); // stop reading past the limit
            },
        ]);
        curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $type = strtolower(trim(explode(';', (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE))[0]));
        $next = (string)curl_getinfo($ch, CURLINFO_REDIRECT_URL);
        curl_close($ch);
        if ($code >= 300 && $code < 400 && $next !== '') { $url = $next; $body = ''; continue; }
        if ($code !== 200 || $body === '') return null;
        return [$body, $type, $url];
    }
    return null;
}

/** Make a link from a page absolute. */
function tg_img_abs(string $src, string $base): string
{
    $src = trim(html_entity_decode($src, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if (preg_match('#^https?://#i', $src)) return $src;
    $p = parse_url($base);
    if (empty($p['scheme']) || empty($p['host'])) return '';
    if (strpos($src, '//') === 0) return $p['scheme'] . ':' . $src;
    $origin = $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '');
    if (strpos($src, '/') === 0) return $origin . $src;
    // Relative to the page's folder.
    $dir = preg_replace('#/[^/]*$#', '/', $p['path'] ?? '/');
    return $origin . $dir . $src;
}

/** The share picture a news page declares (og:image or twitter:image). */
function tg_img_from_page(string $url): string
{
    $page = tg_img_get($url, 800000, 'text/html,application/xhtml+xml');
    if (!$page) return '';
    [$html, , $final] = $page;
    foreach (['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src'] as $name) {
        $n = preg_quote($name, '/');
        if (preg_match('/<meta[^>]+(?:property|name)=["\']' . $n . '["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $m)
            || preg_match('/<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property|name)=["\']' . $n . '["\']/i', $html, $m)) {
            $abs = tg_img_abs($m[1], $final);
            if ($abs !== '') return $abs;
        }
    }
    return '';
}

function tg_img_send(string $file, string $type): void
{
    header('Content-Type: ' . $type);
    header('Content-Length: ' . filesize($file));
    header('Cache-Control: public, max-age=86400');
    header('X-Content-Type-Options: nosniff');
    header("Content-Security-Policy: default-src 'none'");
    readfile($file);
    exit;
}

$u = (string)($_GET['u'] ?? '');
if ($u === '' || strlen($u) > 2000 || !preg_match('#^https?://#i', $u)) tg_img_none();

$key = sha1($u);
$file = TG_IMG_DIR . "/$key.img";
$meta = TG_IMG_DIR . "/$key.json";
if (is_file($meta)) {
    $m = json_decode((string)file_get_contents($meta), true) ?: [];
    $age = time() - (int)($m['at'] ?? 0);
    if (!empty($m['type']) && is_file($file) && $age < TG_IMG_TTL) tg_img_send($file, $m['type']);
    if (empty($m['type']) && $age < TG_IMG_MISS_TTL) tg_img_none();
}

// Only stories that are in our own news feeds.
$known = null;
foreach (['news-global.json', 'news-india.json'] as $cache) {
    foreach ((array)(tg_read_json($cache, [])['items'] ?? []) as $it) {
        if (($it['image'] ?? '') === $u) { $known = 'image'; break 2; }
        if (($it['url'] ?? '') === $u) { $known = 'page'; break 2; }
    }
}
if (!$known) tg_img_none();
tg_rate_limit('newsimg', 300, 600);

if (!is_dir(TG_IMG_DIR)) @mkdir(TG_IMG_DIR, 0750, true);
$remember = function (array $m) use ($meta) { @file_put_contents($meta, json_encode($m + ['at' => time()])); };

// Google News links only redirect with JavaScript, so they have no picture of their own.
$host = strtolower((string)parse_url($u, PHP_URL_HOST));
$imgUrl = $known === 'image' ? $u : ($host === 'news.google.com' ? '' : tg_img_from_page($u));
$got = $imgUrl !== '' ? tg_img_get($imgUrl, TG_IMG_MAX, 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8') : null;
if ($got && strlen($got[0]) <= TG_IMG_MAX && isset(TG_IMG_TYPES[$got[1]]) && @getimagesizefromstring($got[0])) {
    file_put_contents($file, $got[0]);
    $remember(['type' => $got[1], 'src' => $imgUrl]);
    // Keep the folder small: drop the oldest pictures beyond 800.
    $all = glob(TG_IMG_DIR . '/*.img') ?: [];
    if (count($all) > 800) {
        usort($all, fn($a, $b) => filemtime($a) <=> filemtime($b));
        foreach (array_slice($all, 0, count($all) - 700) as $old) { @unlink($old); @unlink(substr($old, 0, -4) . '.json'); }
    }
    tg_img_send($file, $got[1]);
}
$remember(['type' => '']);
tg_img_none();
