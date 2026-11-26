/* Tech Guardians News service worker: caches the app shell only, never /api (news is always live). */
const V = 'tgn-v1';
const SHELL = ['/offline.html', '/icons/icon-192.png', '/favicon.png', '/css/news.css', '/js/news.js', '/js/config.js', '/js/tips.js', '/js/theme.js'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match('/offline.html'))); return; }
  if (/\.(js|css|png|jpe?g|webp|svg|woff2?)$/i.test(u.pathname)) {
    e.respondWith(fetch(r).then((x) => { if (x.ok) { const c = x.clone(); caches.open(V).then((ca) => ca.put(r, c)); } return x; }).catch(() => caches.match(r)));
  }
});
