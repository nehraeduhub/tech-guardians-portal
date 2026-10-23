<?php
// Admin video upload (product advertisement videos).
//   POST upload-video.php  multipart/form-data  video=<file>  -> { url: "/uploads/videos/xxxx.mp4" }
// The X-TG-Upload header makes browsers refuse cross-site uploads (it needs a CORS preflight we never allow).
require_once __DIR__ . '/lib.php';

const TG_VIDEO_MAX = 80 * 1024 * 1024;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') tg_error('Method not allowed.', 405);
if (($_SERVER['HTTP_X_TG_UPLOAD'] ?? '') !== '1') tg_error('Missing upload header.', 400);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $host = parse_url($origin, PHP_URL_HOST);
    $port = parse_url($origin, PHP_URL_PORT);
    if (strcasecmp($host . ($port ? ':' . $port : ''), $_SERVER['HTTP_HOST'] ?? '') !== 0) tg_error('Cross-site request blocked.', 403);
}
tg_require_admin();

$file = $_FILES['video'] ?? null;
if (!$file || !is_array($file)) tg_error('No video received. If the file is large, your hosting upload limit may be too small.', 413);
if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
    tg_error('This video is larger than your hosting allows (' . ini_get('upload_max_filesize') . '). Compress it or raise the limit in Hostinger → PHP settings.', 413);
}
if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) tg_error('The video could not be uploaded.');
if ($file['size'] > TG_VIDEO_MAX) tg_error('Videos can be up to 80 MB.', 413);

// Check the real file type, not the name.
$head = (string)file_get_contents($file['tmp_name'], false, null, 0, 64);
$ext = '';
if (substr($head, 4, 4) === 'ftyp') $ext = 'mp4';
elseif (substr($head, 0, 4) === "\x1A\x45\xDF\xA3") $ext = 'webm';
if ($ext === '') tg_error('Use an MP4 or WebM video.');

$dir = dirname(__DIR__) . '/uploads/videos';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) tg_error('Upload folder is not writable.', 500);
$name = bin2hex(random_bytes(10)) . '.' . $ext;
if (!move_uploaded_file($file['tmp_name'], "$dir/$name")) tg_error('Upload folder is not writable.', 500);

tg_json(['url' => '/uploads/videos/' . $name]);
