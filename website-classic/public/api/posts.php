<?php
// TG Blogs written by students (and the admin). Students write; the admin
// approves before anything is published.
// Public:
//   GET  posts.php                    -> published posts (summaries)
//   GET  posts.php?slug=...           -> one published post
// Student (signed in at /account.html):
//   GET  posts.php?action=mine        -> { canWrite, reason, author, posts }
//   POST posts.php?action=save        { id?, title, category, tags[], excerpt, body, refs[{title,url}], submit } -> draft or pending
//   POST posts.php?action=delete      { id }  (own posts that are not published)
// Admin:
//   GET  posts.php?action=admin       -> all posts, settings, writers
//   POST posts.php?action=review      { id, decision: approve|reject|unpublish, note }
//   POST posts.php?action=save        { ..., publish } -> admin's own post
//   POST posts.php?action=delete      { id }
//   POST posts.php?action=settings    { enabled, buyersOnly }
//   POST posts.php?action=access      { userId, blog: auto|allow|deny }
// Records: data/posts.json, data/blog-settings.json.
require_once __DIR__ . '/users-lib.php';

const TG_POST_STATUSES = ['draft', 'pending', 'published', 'rejected'];

function tg_posts(): array { $p = tg_read_json('posts.json', []); return is_array($p) ? $p : []; }

function tg_post_summary(array $p): array
{
    return [
        'id' => $p['id'], 'slug' => $p['slug'], 'title' => $p['title'], 'excerpt' => $p['excerpt'],
        'category' => $p['category'], 'tags' => $p['tags'], 'author' => $p['author'],
        'date' => $p['published_at'] ?: $p['updated_at'], 'words' => (int)($p['words'] ?? 0),
    ];
}

function tg_post_public(array $p): array
{
    return tg_post_summary($p) + ['body' => $p['body'], 'refs' => $p['refs'], 'updated' => $p['updated_at']];
}

function tg_slugify(string $s): string
{
    $s = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $s), '-'));
    return substr($s !== '' ? $s : 'post', 0, 70);
}

/** Validates and cleans a post from the request body. */
function tg_clean_post(array $b): array
{
    $title = mb_substr(trim(preg_replace('/\s+/u', ' ', (string)($b['title'] ?? ''))), 0, 150);
    $body = str_replace("\r\n", "\n", (string)($b['body'] ?? ''));
    $body = mb_substr(trim($body), 0, 60000);
    if (mb_strlen($title) < 8) tg_error('Please write a title of at least 8 characters.');
    $words = str_word_count(strip_tags($body));
    $category = mb_substr(trim((string)($b['category'] ?? '')), 0, 40) ?: 'Cyber Security';
    $tags = [];
    foreach ((array)($b['tags'] ?? []) as $t) {
        $t = mb_substr(trim((string)$t), 0, 30);
        if ($t !== '' && !in_array($t, $tags, true)) $tags[] = $t;
        if (count($tags) >= 8) break;
    }
    $refs = [];
    foreach ((array)($b['refs'] ?? []) as $r) {
        if (!is_array($r)) continue;
        $url = trim((string)($r['url'] ?? ''));
        if ($url === '') continue;
        if (!preg_match('#^https?://[^\s<>"]+$#i', $url) || strlen($url) > 500) tg_error('Reference links must start with https:// — check: ' . mb_substr($url, 0, 60));
        $refs[] = ['title' => mb_substr(trim((string)($r['title'] ?? '')), 0, 160), 'url' => $url];
        if (count($refs) >= 25) break;
    }
    $excerpt = mb_substr(trim(preg_replace('/\s+/u', ' ', (string)($b['excerpt'] ?? ''))), 0, 300);
    if ($excerpt === '') {
        // First paragraphs of real text: skip headings, list markers, code and link syntax.
        $plain = preg_replace(['/^#{1,6}\s.*$/m', '/^```[\s\S]*?^```/m', '/^\s*([-*•]|\d+[.)])\s+/m', '/[*_`>\[\]]/', '/\((https?:[^)]+)\)/'], ['', '', '', '', ''], $body);
        $excerpt = mb_substr(trim(preg_replace('/\s+/u', ' ', $plain)), 0, 220);
    }
    return ['title' => $title, 'body' => $body, 'category' => $category, 'tags' => $tags, 'refs' => $refs, 'excerpt' => $excerpt, 'words' => $words];
}

function tg_unique_slug(array $all, string $title, string $id): string
{
    $base = tg_slugify($title);
    $slug = $base;
    $n = 2;
    $taken = [];
    foreach ($all as $p) if ($p['id'] !== $id) $taken[$p['slug']] = true;
    while (isset($taken[$slug])) $slug = $base . '-' . $n++;
    return $slug;
}

$action = $_GET['action'] ?? '';

/* ---------- GET ---------- */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === '') {
        $slug = (string)($_GET['slug'] ?? '');
        $published = array_values(array_filter(tg_posts(), fn($p) => $p['status'] === 'published'));
        if ($slug !== '') {
            foreach ($published as $p) if ($p['slug'] === $slug) tg_json(['post' => tg_post_public($p)]);
            tg_error('This article was not found or is no longer published.', 404);
        }
        usort($published, fn($a, $b) => strcmp($b['published_at'], $a['published_at']));
        tg_json(['posts' => array_map('tg_post_summary', $published)]);
    }

    if ($action === 'mine') {
        $u = tg_current_user();
        if (!$u) tg_json(['user' => null]);
        [$ok, $why] = tg_blog_access($u);
        $mine = array_values(array_filter(tg_posts(), fn($p) => ($p['user_id'] ?? '') === $u['id']));
        usort($mine, fn($a, $b) => strcmp($b['updated_at'], $a['updated_at']));
        tg_json(['user' => ['name' => $u['name'], 'username' => $u['username']], 'canWrite' => $ok, 'reason' => $why, 'posts' => $mine]);
    }

    if ($action === 'admin') {
        tg_require_admin();
        $posts = tg_posts();
        usort($posts, fn($a, $b) => strcmp($b['updated_at'], $a['updated_at']));
        $writers = [];
        $courses = tg_course_catalogue();
        foreach (array_reverse(tg_users()) as $u) {
            if (($u['status'] ?? '') !== 'approved') continue;
            $bought = tg_user_purchases($u, $courses);
            [$ok, $why] = tg_blog_access($u, $bought);
            $count = count(array_filter($posts, fn($p) => ($p['user_id'] ?? '') === $u['id']));
            $writers[] = ['id' => $u['id'], 'name' => $u['name'], 'username' => $u['username'], 'email' => $u['email'],
                'mode' => (string)($u['blog'] ?? 'auto'), 'canWrite' => $ok, 'reason' => $why,
                'buyer' => !empty($u['courses']) || !empty($u['pdfs']) || !empty($bought['courses']) || !empty($bought['pdfs']), 'posts' => $count];
        }
        tg_json(['posts' => $posts, 'settings' => tg_blog_settings(), 'writers' => $writers]);
    }
    tg_error('Unknown action.', 404);
}

/* ---------- POST ---------- */
$body = tg_require_json_post();
$admin = tg_is_admin();

if ($action === 'save') {
    $user = $admin ? null : tg_current_user();
    if (!$admin && !$user) tg_error('Please sign in to your student account again.', 401);
    if ($user) {
        [$ok, $why] = tg_blog_access($user);
        if (!$ok) tg_error($why, 403);
        tg_rate_limit('blogsave', 60, 3600);
    }
    $clean = tg_clean_post($body);
    $id = (string)($body['id'] ?? '');
    $submit = !empty($body['submit']);
    $publish = $admin && !empty($body['publish']);
    $result = null;
    $error = '';
    tg_update_json('posts.json', function ($all) use ($clean, $id, $submit, $publish, $admin, $user, &$result, &$error) {
        if (!is_array($all)) $all = [];
        $now = gmdate('c');
        if ($id !== '') {
            foreach ($all as &$p) {
                if ($p['id'] !== $id) continue;
                if (!$admin && ($p['user_id'] ?? '') !== $user['id']) { $error = 'You can only edit your own posts.'; return $all; }
                $p = array_merge($p, $clean);
                $p['slug'] = tg_unique_slug($all, $clean['title'], $id);
                $p['updated_at'] = $now;
                if ($admin) {
                    if ($publish) { $p['status'] = 'published'; $p['published_at'] = $p['published_at'] ?: $now; }
                } else {
                    // Any change by the author goes back to review.
                    $p['status'] = $submit ? 'pending' : 'draft';
                    if ($submit) $p['submitted_at'] = $now;
                    $p['review_note'] = '';
                }
                $result = $p;
                return $all;
            }
            unset($p);
            $error = 'Post not found.';
            return $all;
        }
        $mine = $admin ? 0 : count(array_filter($all, fn($x) => ($x['user_id'] ?? '') === $user['id'] && in_array($x['status'], ['draft', 'pending'], true)));
        if ($mine >= 20) { $error = 'You have 20 drafts or posts waiting for review. Finish or delete some first.'; return $all; }
        $new = $clean + [
            'id' => bin2hex(random_bytes(6)),
            'slug' => tg_unique_slug($all, $clean['title'], ''),
            'status' => $admin ? ($publish ? 'published' : 'draft') : ($submit ? 'pending' : 'draft'),
            'user_id' => $admin ? 'admin' : $user['id'],
            'author' => $admin ? 'Tech Guardians' : $user['name'],
            'author_username' => $admin ? 'admin' : $user['username'],
            'created_at' => $now, 'updated_at' => $now,
            'submitted_at' => (!$admin && $submit) ? $now : '',
            'published_at' => ($admin && $publish) ? $now : '',
            'review_note' => '',
        ];
        $all[] = $new;
        $result = $new;
        return array_slice($all, -5000);
    });
    if ($error) tg_error($error, 400);
    tg_json(['ok' => true, 'post' => $result]);
}

if ($action === 'delete') {
    $id = (string)($body['id'] ?? '');
    $user = $admin ? null : tg_current_user();
    if (!$admin && !$user) tg_error('Please sign in again.', 401);
    $error = 'Post not found.';
    tg_update_json('posts.json', function ($all) use ($id, $admin, $user, &$error) {
        $keep = [];
        foreach ((array)$all as $p) {
            if ($p['id'] === $id) {
                if ($admin || (($p['user_id'] ?? '') === $user['id'] && $p['status'] !== 'published')) { $error = ''; continue; }
                $error = 'A published post can only be removed by Tech Guardians.';
            }
            $keep[] = $p;
        }
        return $keep;
    });
    if ($error) tg_error($error, 403);
    tg_json(['ok' => true]);
}

/* ---------- admin only ---------- */
tg_require_admin();

if ($action === 'review') {
    $id = (string)($body['id'] ?? '');
    $decision = (string)($body['decision'] ?? '');
    $note = mb_substr(trim((string)($body['note'] ?? '')), 0, 600);
    if (!in_array($decision, ['approve', 'reject', 'unpublish'], true)) tg_error('Unknown decision.');
    $found = false;
    tg_update_json('posts.json', function ($all) use ($id, $decision, $note, &$found) {
        foreach ($all as &$p) {
            if ($p['id'] !== $id) continue;
            $found = true;
            $now = gmdate('c');
            if ($decision === 'approve') { $p['status'] = 'published'; $p['published_at'] = $p['published_at'] ?: $now; }
            if ($decision === 'reject') $p['status'] = 'rejected';
            if ($decision === 'unpublish') $p['status'] = 'pending';
            $p['review_note'] = $note;
            $p['reviewed_at'] = $now;
        }
        return $all;
    });
    if (!$found) tg_error('Post not found.', 404);
    tg_json(['ok' => true]);
}

if ($action === 'settings') {
    $next = ['enabled' => !empty($body['enabled']), 'buyersOnly' => !empty($body['buyersOnly'])];
    tg_update_json('blog-settings.json', fn() => $next, []);
    tg_json(['ok' => true, 'settings' => $next]);
}

if ($action === 'access') {
    $uid = (string)($body['userId'] ?? '');
    $mode = (string)($body['blog'] ?? 'auto');
    if (!in_array($mode, ['auto', 'allow', 'deny'], true)) tg_error('Unknown access setting.');
    $found = false;
    tg_update_json('users.json', function ($all) use ($uid, $mode, &$found) {
        foreach ($all as &$u) if ($u['id'] === $uid) { $found = true; $u['blog'] = $mode; tg_log($u, 'Blog writing: ' . $mode); }
        return $all;
    });
    if (!$found) tg_error('Student not found.', 404);
    tg_json(['ok' => true]);
}

tg_error('Unknown action.', 404);
