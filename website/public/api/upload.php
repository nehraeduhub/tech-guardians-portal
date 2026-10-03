<?php
// Admin image upload (blog covers and other site images).
//   POST upload.php { image: "data:image/...;base64,..." } -> { url: "/uploads/xxxx.jpg" }
// Files go to /uploads/ next to index.html so every visitor can load them.
require_once __DIR__ . '/lib.php';

$body = tg_require_json_post();
tg_require_admin();

[$bin, $ext] = tg_decode_image((string)($body['image'] ?? ''), 3000000);

$dir = dirname(__DIR__) . '/uploads';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) tg_error('Upload folder is not writable.', 500);
$name = bin2hex(random_bytes(10)) . '.' . $ext;
if (file_put_contents("$dir/$name", $bin) === false) tg_error('Upload folder is not writable.', 500);

tg_json(['url' => '/uploads/' . $name]);
