<?php
// Cyber news aggregator (replaces the old cloud functions).
//   GET news.php?feed=global  -> global threat intel (CISA, NVD, Hacker News, ...)
//   GET news.php?feed=india   -> India cyber-crime headlines
// Results are cached in data/ for TG_NEWS_CACHE_SECONDS.
require_once __DIR__ . '/lib.php';

$feed = ($_GET['feed'] ?? 'global') === 'india' ? 'india' : 'global';
tg_rate_limit('news', 120, 60);

$SOURCES = [
    'global' => [
        ['https://feeds.feedburner.com/TheHackersNews', 'Hacker News', null, 8],
        ['https://www.bleepingcomputer.com/feed/', 'BleepingComputer', null, 8],
        ['https://krebsonsecurity.com/feed/', 'KrebsOnSecurity', null, 8],
        ['https://www.darkreading.com/rss.xml', 'Dark Reading', null, 8],
        ['https://www.securityweek.com/feed/', 'SecurityWeek', null, 8],
        ['https://isc.sans.edu/rssfeed.xml', 'SANS ISC', null, 8],
        ['https://www.schneier.com/feed/atom/', 'Schneier', null, 8],
        ['https://www.cisa.gov/cybersecurity-advisories/all.xml', 'CISA', null, 8],
        ['https://www.cert-in.org.in/RSS/latestnews.xml', 'CERT-In', null, 8],
        ['https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=8&startIndex=0', 'NVD', 'nvd', 8],
        ['https://therecord.media/feed', 'The Record', null, 8],
        ['https://www.infosecurity-magazine.com/rss/news/', 'Infosecurity Magazine', null, 8],
        ['https://cyberscoop.com/feed/', 'CyberScoop', null, 8],
        ['https://www.helpnetsecurity.com/feed/', 'Help Net Security', null, 8],
        ['https://securityaffairs.com/feed', 'Security Affairs', null, 8],
        ['https://hackread.com/feed/', 'HackRead', null, 8],
        ['https://grahamcluley.com/feed/', 'Graham Cluley', null, 6],
        ['https://www.malwarebytes.com/blog/feed/index.xml', 'Malwarebytes Labs', null, 6],
        ['https://www.welivesecurity.com/en/rss/feed/', 'WeLiveSecurity (ESET)', null, 6],
        ['https://feeds.feedburner.com/eset/blog', 'ESET Blog', null, 4],
        ['https://www.ncsc.gov.uk/api/1/services/v1/news-rss-feed.xml', 'NCSC UK', null, 6],
        ['https://news.google.com/rss/search?q=%22AI+security%22+OR+%22AI+cyber+attack%22+OR+%22prompt+injection%22+OR+%22AI+jailbreak%22+OR+%22AI+malware%22+OR+%22AI+deepfake+fraud%22+OR+%22LLM+vulnerability%22+when:3d&hl=en-US&gl=US&ceid=US:en', 'Google News', null, 12],
        ['https://news.google.com/rss/search?q=%22quantum%22+%22encryption%22+OR+%22post-quantum+cryptography%22+OR+%22quantum+safe%22+OR+%22harvest+now+decrypt+later%22+when:14d&hl=en-US&gl=US&ceid=US:en', 'Google News', null, 10],
        ['https://news.google.com/rss/search?q=ransomware+OR+%22data+breach%22+OR+%22zero-day%22+OR+%22cyber+attack%22+when:1d&hl=en-US&gl=US&ceid=US:en', 'Google News', null, 12],
        ['https://news.google.com/rss/search?q=cybercrime+OR+%22online+fraud%22+OR+%22scam+arrested%22+when:2d&hl=en-US&gl=US&ceid=US:en', 'Google News', null, 10],
        ['https://nakedsecurity.sophos.com/feed/', 'Sophos Naked Security', null, 6],
        ['https://blog.talosintelligence.com/rss/', 'Cisco Talos', null, 6],
        ['https://unit42.paloaltonetworks.com/feed/', 'Unit 42', null, 6],
        ['https://www.microsoft.com/en-us/security/blog/feed/', 'Microsoft Security', null, 6],
        ['https://googleprojectzero.blogspot.com/feeds/posts/default', 'Project Zero', null, 4],
        ['https://research.checkpoint.com/feed/', 'Check Point Research', null, 6],
        ['https://securelist.com/feed/', 'Securelist (Kaspersky)', null, 6],
        ['https://feeds.trendmicro.com/Anti-MalwareBlog', 'Trend Micro', null, 6],
        ['https://www.theregister.com/security/headlines.atom', 'The Register', null, 8],
        ['https://www.csoonline.com/feed/', 'CSO Online', null, 8],
        ['https://www.scmagazine.com/feed', 'SC Media', null, 8],
        ['https://arstechnica.com/security/feed/', 'Ars Technica Security', null, 6],
        ['https://www.wired.com/feed/category/security/latest/rss', 'WIRED Security', null, 6],
        ['https://thequantuminsider.com/feed/', 'The Quantum Insider', null, 10],
        ['https://www.bleepingcomputer.com/feed/tag/artificial-intelligence/', 'BleepingComputer AI', null, 6],
    ],
    'india' => [
        ['https://news.google.com/rss/search?q=india+cyber+crime+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Cyber Crime', 12],
        ['https://news.google.com/rss/search?q=india+cyber+fraud+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Cyber Fraud', 12],
        ['https://news.google.com/rss/search?q=india+data+breach+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Data Breach', 12],
        ['https://news.google.com/rss/search?q=india+ransomware+phishing+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Ransomware', 12],
        ['https://news.google.com/rss/search?q=india+upi+fraud+online+scam+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'UPI / Online Scam', 12],
        ['https://www.thehindu.com/sci-tech/technology/feeder/default.rss', 'The Hindu', 'Technology', 12],
        ['https://timesofindia.indiatimes.com/rssfeeds/66949542.cms', 'Times of India', 'Cyber Crime', 12],
        ['https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', 'Hindustan Times', 'India', 12],
        ['https://indianexpress.com/section/technology/feed/', 'Indian Express', 'Technology', 12],
        ['https://cio.economictimes.indiatimes.com/rss/topstories', 'ET CIO', 'Enterprise Cyber', 12],
        ['https://ciso.economictimes.indiatimes.com/rss/topstories', 'ET CISO', 'CISO / Security', 12],
        ['https://inc42.com/tag/cybersecurity/feed/', 'Inc42', 'Cybersecurity', 12],
        ['https://www.medianama.com/feed/', 'MediaNama', 'Policy & Privacy', 12],
        ['https://www.cert-in.org.in/RSS/latestnews.xml', 'CERT-In', 'Advisory', 12],
        ['https://news.google.com/rss/search?q=india+%22digital+arrest%22+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Digital Arrest', 10],
        ['https://news.google.com/rss/search?q=india+sextortion+cyber+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Sextortion', 10],
        ['https://news.google.com/rss/search?q=cyber+police+arrested+fraud+india+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Arrests', 10],
        ['https://news.google.com/rss/search?q=india+sim+swap+OR+otp+fraud+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'OTP / SIM Fraud', 10],
        ['https://news.google.com/rss/search?q=india+investment+OR+trading+OR+crypto+scam+cyber+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Investment Scam', 10],
        ['https://news.google.com/rss/search?q=india+deepfake+fraud+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Deepfake', 10],
        ['https://news.google.com/rss/search?q=india+cyber+attack+OR+hacked+website+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Cyber Attack', 10],
        ['https://news.google.com/rss/search?q=india+loan+app+OR+job+scam+online+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Loan / Job Scam', 10],
        ['https://news.google.com/rss/search?q=i4c+OR+%22cyber+crime+portal%22+OR+1930+helpline+when:2d&hl=en-IN&gl=IN&ceid=IN:en', 'Google News India', 'Govt Action', 10],
        ['https://www.the420.in/feed/', 'The420.in', 'Cyber Crime', 12],
        ['https://thecyberexpress.com/feed/', 'The Cyber Express', 'Cybersecurity', 10],
        ['https://www.thehindu.com/news/national/feeder/default.rss', 'The Hindu', 'India', 8],
        ['https://feeds.feedburner.com/ndtvnews-india-news', 'NDTV', 'India', 8],
    ],
];

$FALLBACK = [
    'global' => [
        ['title' => 'CISA Cybersecurity Advisories', 'url' => 'https://www.cisa.gov/news-events/cybersecurity-advisories', 'source' => 'CISA', 'summary' => 'US CISA advisories.'],
        ['title' => 'NVD — Recent CVEs', 'url' => 'https://nvd.nist.gov/vuln/search', 'source' => 'NVD', 'summary' => 'Newly published vulnerabilities.'],
        ['title' => 'CERT-In Vulnerability Notes', 'url' => 'https://www.cert-in.org.in/', 'source' => 'CERT-In', 'summary' => 'Indian CERT advisories.'],
        ['title' => 'The Hacker News — Cybersecurity Headlines', 'url' => 'https://thehackernews.com/', 'source' => 'Hacker News', 'summary' => 'Global cyber news.'],
        ['title' => 'BleepingComputer — Threat Reports', 'url' => 'https://www.bleepingcomputer.com/', 'source' => 'BleepingComputer', 'summary' => 'Malware & breach analysis.'],
    ],
    'india' => [
        ['title' => 'India Cyber Crime Portal (Govt. of India)', 'url' => 'https://cybercrime.gov.in/', 'source' => 'MHA', 'category' => 'Report Crime', 'summary' => 'National Cyber Crime Reporting Portal — Ministry of Home Affairs.'],
        ['title' => 'CERT-In — Latest Advisories', 'url' => 'https://www.cert-in.org.in/', 'source' => 'CERT-In', 'category' => 'Advisory', 'summary' => 'Official Indian CERT advisories on cyber threats.'],
    ],
];

// Admin choices (Manage → News Sources): switch built-in feeds off and add
// your own RSS/Atom feeds. Keys are "feed|url".
$settings = tg_read_json('settings.json', [], true);
$cfg = is_array($settings['tg_news_sources']['value'] ?? null) ? $settings['tg_news_sources']['value'] : [];
$disabled = array_flip(array_map('strval', (array)($cfg['disabled'] ?? [])));

//   GET news.php?action=sources -> built-in source list for the admin page
if (($_GET['action'] ?? '') === 'sources') {
    $list = [];
    foreach ($SOURCES as $f => $rows) {
        foreach ($rows as $s) $list[] = ['feed' => $f, 'url' => $s[0], 'name' => $s[1], 'category' => $s[2] === 'nvd' ? null : $s[2]];
    }
    tg_json($list);
}

foreach ((array)($cfg['custom'] ?? []) as $c) {
    if (!is_array($c) || ($c['enabled'] ?? true) === false) continue;
    $url = trim((string)($c['url'] ?? ''));
    $f = ($c['feed'] ?? '') === 'india' ? 'india' : 'global';
    if (!preg_match('#^https?://[^\s]+$#i', $url) || strlen($url) > 500 || !tg_public_url($url)) continue;
    $name = mb_substr(trim((string)($c['name'] ?? '')), 0, 60) ?: (parse_url($url, PHP_URL_HOST) ?: 'Custom feed');
    $cat = mb_substr(trim((string)($c['category'] ?? '')), 0, 40);
    $SOURCES[$f][] = [$url, $name, $f === 'india' ? ($cat ?: 'Cyber Crime') : null, 10];
}
$SOURCES[$feed] = array_values(array_filter($SOURCES[$feed], fn($s) => !isset($disabled[$feed . '|' . $s[0]])));
$cfgHash = substr(md5('topic4|' . json_encode($cfg)), 0, 10); // bump the prefix when parsing changes

$cacheFile = "news-$feed.json";
$cached = tg_read_json($cacheFile, null);
if (is_array($cached) && ($cached['cfg'] ?? '') === $cfgHash && ($cached['saved'] ?? 0) > time() - TG_NEWS_CACHE_SECONDS) {
    tg_json(['items' => $cached['items'], 'fetched_at' => $cached['fetched_at']]);
}

function tg_decode(string $s): string
{
    $s = preg_replace('/<!\[CDATA\[([\s\S]*?)\]\]>/', '$1', $s);
    $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $s = preg_replace('/<[^>]+>/', '', $s);
    return trim(preg_replace('/\s+/u', ' ', $s));
}

function tg_match(string $re, string $s): string
{
    return preg_match($re, $s, $m) ? $m[1] : '';
}

/** The story's picture from a feed item: media tags, enclosure, or the first <img> in its HTML. */
function tg_item_image(string $block): string
{
    $q = '["\']([^"\']+)["\']';
    $found = tg_match("/<media:content[^>]+url={$q}/i", $block)
        ?: tg_match("/<media:thumbnail[^>]+url={$q}/i", $block)
        ?: tg_match("/<enclosure[^>]+type=[\"']image[^>]+url={$q}/i", $block)
        ?: tg_match("/<enclosure[^>]+url={$q}[^>]*type=[\"']image/i", $block)
        ?: tg_match("/<itunes:image[^>]+href={$q}/i", $block);
    if ($found === '') {
        // Many feeds put the picture inside entity-encoded or CDATA HTML.
        $html = html_entity_decode(preg_replace('/<!\[CDATA\[([\s\S]*?)\]\]>/', '$1', $block), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        foreach (preg_match_all("/<img[^>]+src={$q}/i", $html, $m) ? $m[1] : [] as $src) {
            if (!preg_match('#feedburner|/pixel|1x1|gravatar\.com|stats\.|doubleclick#i', $src)) { $found = $src; break; }
        }
    }
    $found = trim(html_entity_decode($found, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if (strpos($found, '//') === 0) $found = 'https:' . $found;
    return preg_match('#^https?://[^\s"<>]+$#i', $found) ? $found : '';
}

/** Sources that only publish security news; their stories are kept without a topic check. */
const TG_NEWS_SECURITY_SOURCES = ['Hacker News', 'BleepingComputer', 'KrebsOnSecurity', 'Dark Reading', 'SecurityWeek', 'SANS ISC', 'Schneier', 'CISA',
    'CERT-In', 'NVD', 'The Record', 'Infosecurity Magazine', 'CyberScoop', 'Help Net Security', 'Security Affairs', 'HackRead', 'Graham Cluley',
    'Malwarebytes Labs', 'WeLiveSecurity (ESET)', 'ESET Blog', 'NCSC UK', 'The420.in', 'The Cyber Express', 'Inc42', 'Sophos Naked Security', 'Cisco Talos',
    'Unit 42', 'Microsoft Security', 'Project Zero', 'Check Point Research', 'Securelist (Kaspersky)', 'Trend Micro', 'The Register', 'CSO Online', 'SC Media',
    'Ars Technica Security', 'WIRED Security', 'BleepingComputer AI'];

/** Is this story about cyber security, fraud, cyber crime, AI SECURITY (attacks, abuse, defence) or quantum SECURITY?
 *  General AI / business / product news does not pass: AI and quantum words only count together with a security word. */
function tg_on_topic(string $text): bool
{
    // 1. Cyber security, fraud and crime on their own.
    if (preg_match('/\b(cyber|infosec|hack(?:ers?|ed|ing|s)?\b|phish|ransom|breach|malware|spyware|stalkerware|trojan|botnet|ddos|exploit|zero[- ]day|vulnerab|cve-\d|security (?:flaw|hole|bug|update|patch|alert|advisory|incident|researcher)|data (?:leak|theft)|leak(?:ed)? (?:data|database)|identity theft|credential|password|encrypt|cryptograph|crypto ?(?:scam|fraud|theft|hack)|fraud|scam|swindl|extortion|sextort|blackmail|digital arrest|deepfake|sim[- ]swap|cert-in|darknet|dark web|spoof|vishing|smishing|social engineering|cybercrime|cyber crime)/i', $text)
        || preg_match('/\b(?:otp|upi|i4c|1930|dox(?:x?ing)?)\b/i', $text)) return true;
    $sec = '(?:attack|attacker|threat|vulnerab|secur|safety|jailbreak|prompt injection|poison|adversarial|guardrail|abuse|misuse|exploit|malicious|malware|fraud|scam|deepfake|phish|privacy|breach|leak|risk|defen[cs]e|detect|harden|backdoor|supply chain|rogue|hijack|steal|manipulat|red team|bypass|impersonat|surveillance)';
    // 2. AI only when the story is about attacks, abuse or security of AI (or AI used for attacks / defence).
    $ai = '(?:\bai\b|\ba\.i\.|artificial intelligence|machine learning|\bllms?\b|chatbot|chatgpt|openai|anthropic|deepseek|generative ai|genai|ai agents?|copilot|gemini)';
    if (preg_match('/' . $ai . '/i', $text) && preg_match('/' . $sec . '/i', $text)) return true;
    // 3. Quantum only when it is about encryption / security.
    if (preg_match('/quantum|qubit|\bpqc\b/i', $text) && preg_match('/(?:secur|encrypt|cryptograph|cipher|rsa|key distribution|qkd|decrypt|nist|safe|break|crack|threat|attack|protect|resistan)/i', $text)) return true;
    return false;
}

function tg_parse_rss(string $xml, string $source, ?string $category, int $limit): array
{
    preg_match_all('/<item\b[\s\S]*?<\/item>/i', $xml, $a);
    preg_match_all('/<entry\b[\s\S]*?<\/entry>/i', $xml, $b);
    $blocks = array_slice(array_merge($a[0], $b[0]), 0, $limit);
    $items = [];
    foreach ($blocks as $block) {
        $title = tg_decode(tg_match('/<title[^>]*>([\s\S]*?)<\/title>/i', $block));
        $link = tg_decode(tg_match('/<link[^>]*>([\s\S]*?)<\/link>/i', $block));
        if ($link === '') $link = tg_match('/<link[^>]+href="([^"]+)"/i', $block);
        if (!preg_match('#^https?://#i', $link)) continue;
        $date = tg_decode(tg_match('/<pubDate>([\s\S]*?)<\/pubDate>/i', $block)
            ?: tg_match('/<updated>([\s\S]*?)<\/updated>/i', $block)
            ?: tg_match('/<published>([\s\S]*?)<\/published>/i', $block));
        $desc = tg_match('/<description>([\s\S]*?)<\/description>/i', $block)
            ?: tg_match('/<summary[^>]*>([\s\S]*?)<\/summary>/i', $block)
            ?: tg_match('/<content[^>]*>([\s\S]*?)<\/content>/i', $block);
        // Only cyber security, fraud, crime, AI attacks/updates and quantum security. General news feeds,
        // Google News searches and any feed you add yourself must match the topic words.
        if (!in_array($source, TG_NEWS_SECURITY_SOURCES, true) || in_array($category, ['India', 'Technology', 'Policy & Privacy', 'Enterprise Cyber', 'CISO / Security'], true)) {
            if (!tg_on_topic($title . ' ' . tg_decode(tg_match('/<description>([\s\S]*?)<\/description>/i', $block)) . ' ' . tg_decode(tg_match('/<summary[^>]*>([\s\S]*?)<\/summary>/i', $block)))) continue;
        }
        // Google News: show the real publisher instead of "Google News".
        $publisher = tg_decode(tg_match('/<source[^>]*>([\s\S]*?)<\/source>/i', $block));
        if ($publisher !== '' && strpos($source, 'Google News') === 0) {
            $title = preg_replace('/\s+-\s+' . preg_quote($publisher, '/') . '$/u', '', $title);
        }
        $item = ['title' => $title, 'url' => $link, 'source' => $publisher !== '' && strpos($source, 'Google News') === 0 ? $publisher : $source, 'date' => $date,
                 'summary' => mb_substr(tg_decode($desc), 0, $category === null ? 320 : 600)];
        if ($category !== null) $item['category'] = $category;
        $image = tg_item_image($block);
        if ($image !== '') $item['image'] = $image;
        if ($title !== '') $items[] = $item;
    }
    return $items;
}

function tg_parse_nvd(string $json): array
{
    $data = json_decode($json, true);
    $items = [];
    foreach (array_slice($data['vulnerabilities'] ?? [], 0, 8) as $v) {
        $cve = $v['cve'] ?? null;
        if (empty($cve['id'])) continue;
        $desc = '';
        foreach ($cve['descriptions'] ?? [] as $d) if (($d['lang'] ?? '') === 'en') { $desc = $d['value']; break; }
        $m = $cve['metrics'] ?? [];
        $sev = $m['cvssMetricV31'][0]['cvssData']['baseSeverity']
            ?? $m['cvssMetricV30'][0]['cvssData']['baseSeverity']
            ?? $m['cvssMetricV2'][0]['baseSeverity'] ?? '';
        $items[] = [
            'title' => $cve['id'] . ($sev ? " — $sev" : '') . ': ' . mb_substr($desc, 0, 140),
            'url' => 'https://nvd.nist.gov/vuln/detail/' . rawurlencode($cve['id']),
            'source' => 'NVD',
            'date' => $cve['published'] ?? '',
            'summary' => mb_substr($desc, 0, 320),
            'severity' => $sev,
        ];
    }
    return $items;
}

// Fetch every source in parallel.
$multi = curl_multi_init();
$handles = [];
foreach ($SOURCES[$feed] as $i => $src) {
    $ch = curl_init($src[0]);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 9,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; TechGuardiansBot/1.0)',
        CURLOPT_ENCODING => '',
        CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
        CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
    ]);
    curl_multi_add_handle($multi, $ch);
    $handles[$i] = $ch;
}
do {
    $status = curl_multi_exec($multi, $running);
    if ($running) curl_multi_select($multi, 1.0);
} while ($running && $status === CURLM_OK);

$results = [];
foreach ($SOURCES[$feed] as $i => [$url, $source, $category, $limit]) {
    $body = curl_multi_getcontent($handles[$i]) ?: '';
    curl_multi_remove_handle($multi, $handles[$i]);
    curl_close($handles[$i]);
    $results[] = $category === 'nvd' ? tg_parse_nvd($body) : tg_parse_rss($body, $source, $category, $limit);
}
curl_multi_close($multi);

// Interleave sources, drop duplicate titles, newest first.
$merged = [];
$seen = [];
$max = $results ? max(array_map('count', $results)) : 0;
for ($i = 0; $i < $max; $i++) {
    foreach ($results as $r) {
        if (!isset($r[$i])) continue;
        $k = mb_substr(mb_strtolower(preg_replace('/\s+/', ' ', $r[$i]['title'])), 0, 120);
        if (isset($seen[$k])) continue;
        $seen[$k] = true;
        $merged[] = $r[$i];
    }
}
usort($merged, fn($a, $b) => (strtotime($b['date'] ?? '') ?: 0) <=> (strtotime($a['date'] ?? '') ?: 0));

$items = $merged ? array_slice($merged, 0, $feed === 'india' ? 160 : 120) : $FALLBACK[$feed];
$fetchedAt = gmdate('c');
if ($merged) tg_update_json($cacheFile, fn() => ['saved' => time(), 'cfg' => $cfgHash, 'fetched_at' => $fetchedAt, 'items' => $items], null);

tg_json(['items' => $items, 'fetched_at' => $fetchedAt]);
