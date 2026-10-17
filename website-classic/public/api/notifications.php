<?php
// Admin notification feed: new student account requests, payments / buy
// requests waiting for approval, and blog posts waiting for review.
//   GET notifications.php -> { counts: {students, orders, posts}, items: [{type, title, detail, at, tab}] }
require_once __DIR__ . '/lib.php';
tg_require_admin();

$items = [];
$counts = ['students' => 0, 'orders' => 0, 'posts' => 0];

foreach ((array)tg_read_json('users.json', []) as $u) {
    if (($u['status'] ?? '') !== 'pending') continue;
    $counts['students']++;
    $items[] = ['type' => 'student', 'title' => 'New student account request', 'detail' => trim(($u['name'] ?? '') . ' · ' . ($u['email'] ?? '')),
        'at' => (string)($u['created_at'] ?? ''), 'tab' => 'students'];
}

foreach ((array)tg_read_json('payments.json', []) as $o) {
    if (($o['status'] ?? '') !== 'pending') continue;
    $counts['orders']++;
    $what = ($o['type'] ?? '') === 'pdf' ? 'PDF book' : 'Training / course';
    $items[] = ['type' => 'order', 'title' => 'New ' . $what . ' payment to verify', 'detail' => trim(($o['name'] ?? '') . ' · ' . ($o['course'] ?? '') . ' · ' . ($o['amount'] ?? '')),
        'at' => (string)($o['received_at'] ?? ''), 'tab' => 'payments'];
}

foreach ((array)tg_read_json('posts.json', []) as $p) {
    if (($p['status'] ?? '') !== 'pending') continue;
    $counts['posts']++;
    $items[] = ['type' => 'post', 'title' => 'Blog post waiting for review', 'detail' => trim(($p['title'] ?? '') . ' · by ' . ($p['author'] ?? '')),
        'at' => (string)($p['submitted_at'] ?: ($p['updated_at'] ?? '')), 'tab' => 'blogposts'];
}

usort($items, fn($a, $b) => strcmp($b['at'], $a['at']));
tg_json(['counts' => $counts, 'items' => array_slice($items, 0, 50)]);
