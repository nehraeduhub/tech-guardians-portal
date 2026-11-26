/* Tech Guardians News - front end (no inline scripts, strict CSP). */
(function () {
  'use strict';
  var C = window.TG_NEWS || {};
  var PAGE = 24;
  var DESKS = [
    { id: 'all', label: 'All news' }, { id: 'india', label: '🇮🇳 India' }, { id: 'global', label: '🌍 Global' },
    { id: 'fraud', label: 'Fraud & scams' }, { id: 'ai', label: 'AI security' }, { id: 'quantum', label: 'Quantum' }, { id: 'adv', label: 'Advisories & CVEs' }
  ];
  var RX = {
    ai: /\b(ai|a\.i\.|llms?|artificial intelligence|machine learning|chatgpt|openai|anthropic|deepseek|generative|genai|prompt injection|jailbreak|deepfake|ai agents?|copilot)\b/i,
    q: /quantum|qubit|\bpqc\b/i,
    fraud: /fraud|scam|phish|digital arrest|sextort|upi|otp|sim[- ]swap|loan app|investment|swindl|extortion|blackmail|vishing|smishing|identity theft|arrest/i
  };
  var ADV_SRC = /^(CISA|CERT-In|NCSC UK|NVD|Project Zero)$/i;
  var state = { items: [], desk: 'all', q: '', src: '', sort: 'new', shown: PAGE, loading: false };
  var $ = function (id) { return document.getElementById(id); };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(u) { return /^https?:\/\/[^\s"'<>]+$/i.test(u || '') ? u : ''; }
  function ts(it) { var t = Date.parse(it.date || ''); return isNaN(t) ? 0 : t; }
  function ago(it) {
    var t = ts(it); if (!t) return 'recent';
    var m = Math.floor((Date.now() - t) / 60000);
    if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
    var h = Math.floor(m / 60); if (h < 24) return h + ' hr ago';
    var d = Math.floor(h / 24); return d < 30 ? d + ' d ago' : new Date(t).toLocaleDateString('en-IN');
  }
  function text(it) { return (it.title || '') + ' ' + (it.summary || '') + ' ' + (it.category || ''); }
  function imgOf(it) { var u = it.image || it.url; return u ? '/api/news-img.php?u=' + encodeURIComponent(u) : ''; }

  function inDesk(it, d) {
    if (d === 'all') return true;
    if (d === 'india') return it._feed === 'india';
    if (d === 'global') return it._feed === 'global';
    if (d === 'ai') return RX.ai.test(text(it));
    if (d === 'quantum') return RX.q.test(text(it));
    if (d === 'fraud') return RX.fraud.test(text(it));
    if (d === 'adv') return !!it.severity || ADV_SRC.test(it.source || '') || /advisory|cve-\d/i.test(it.title || '') || it.category === 'Advisory';
    return true;
  }
  function visible() {
    var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var out = state.items.filter(function (it) {
      return inDesk(it, state.desk) && (!state.src || it.source === state.src) &&
        words.every(function (w) { return (text(it) + ' ' + (it.source || '')).toLowerCase().indexOf(w) !== -1; });
    });
    out.sort(state.sort === 'src' ? function (a, b) { return (a.source || '').localeCompare(b.source || '') || ts(b) - ts(a); } : function (a, b) { return ts(b) - ts(a); });
    return out;
  }

  function tags(it) {
    var h = '';
    if (it.severity) h += '<span class="tag ' + esc(it.severity) + '">' + esc(it.severity) + '</span>';
    if (it.category) h += '<span class="tag">' + esc(it.category) + '</span>';
    var t = text(it);
    if (RX.ai.test(t)) h += '<span class="tag ai">AI</span>';
    if (RX.q.test(t)) h += '<span class="tag q">Quantum</span>';
    return h;
  }
  function card(it, big, top) {
    var url = safeUrl(it.url); if (!url) return '';
    var img = imgOf(it);
    return '<a class="card' + (big ? ' big' : '') + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer nofollow">' +
      '<div class="thumb"><span class="ph" aria-hidden="true">🛡️</span>' + (img ? '<img loading="lazy" alt="" src="' + esc(img) + '" data-hide-on-error="1"/>' : '') + '</div>' +
      '<div class="body">' + (top ? '<span class="top">TOP STORY</span>' : '') + '<h3>' + esc(it.title) + '</h3>' +
      (it.summary && it.summary !== it.title ? '<p>' + esc(it.summary) + '</p>' : '') +
      '<div class="meta"><span>' + esc(it.source) + '</span><span>·</span><span>' + esc(ago(it)) + '</span>' + tags(it) + '</div></div></a>';
  }

  function render() {
    var rows = visible(), list = $('list'), lead = $('lead');
    if (!rows.length) {
      lead.innerHTML = ''; list.innerHTML = '<div class="empty" style="grid-column:1/-1">' + (state.loading ? '' : 'No stories match. Try another desk or search word.') + '</div>';
      $('more').hidden = true; return;
    }
    var top = state.sort === 'new' && !state.q && !state.src ? rows.slice(0, 3) : [];
    var rest = top.length ? rows.slice(3) : rows;
    lead.innerHTML = top.length ? card(top[0], true, true) + '<div style="display:grid;gap:18px">' + card(top[1] || top[0], false, false) + (top[2] ? card(top[2], false, false) : '') + '</div>' : '';
    lead.style.display = top.length ? '' : 'none';
    list.innerHTML = rest.slice(0, state.shown).map(function (it) { return card(it); }).join('');
    $('more').hidden = rest.length <= state.shown;
  }
  function fillSources() {
    var sel = $('src'), cur = state.src, set = {};
    state.items.forEach(function (it) { if (it.source) set[it.source] = (set[it.source] || 0) + 1; });
    sel.innerHTML = '<option value="">All sources (' + Object.keys(set).length + ')</option>' + Object.keys(set).sort().map(function (s) { return '<option value="' + esc(s) + '"' + (s === cur ? ' selected' : '') + '>' + esc(s) + ' (' + set[s] + ')</option>'; }).join('');
  }
  function stats() {
    var n = state.items.length, src = {}; state.items.forEach(function (i) { src[i.source] = 1; });
    var day = state.items.filter(function (i) { return Date.now() - ts(i) < 864e5; }).length;
    $('stats').innerHTML = '<div class="stat"><b>' + n + '</b>stories</div><div class="stat"><b>' + day + '</b>last 24 hours</div><div class="stat"><b>' + Object.keys(src).length + '</b>trusted sources</div>';
  }

  function load() {
    state.loading = true;
    if (!state.items.length) $('list').innerHTML = '<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
    return Promise.all(['global', 'india'].map(function (f) {
      return fetch('/api/news.php?feed=' + f, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(f); return r.json(); })
        .then(function (d) { return (d.items || []).map(function (i) { i._feed = f; return i; }); }).catch(function () { return null; });
    })).then(function (res) {
      state.loading = false;
      if (!res[0] && !res[1]) { if (!state.items.length) $('list').innerHTML = '<div class="err" style="grid-column:1/-1">News could not be loaded. Check your connection and try again.</div>'; return; }
      var seen = {}, all = [];
      res.forEach(function (rows) { (rows || []).forEach(function (it) { var k = (it.title || '').toLowerCase().slice(0, 100); if (!k || seen[k]) return; seen[k] = 1; all.push(it); }); });
      state.items = all; fillSources(); stats(); render();
    });
  }

  function tip() {
    var tips = window.TG_TIPS || []; if (!tips.length) { $('tip').style.display = 'none'; return; }
    var d = new Date(), day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5), t = tips[day % tips.length];
    $('tip-en').textContent = t.en; $('tip-hi').textContent = t.hi || '';
  }

  function init() {
    var main = (C.mainSite || '').replace(/\/$/, '');
    [['l-main', main + '/'], ['l-train', main + '/training'], ['f-main', main + '/'], ['f-pdf', main + '/pdf-store'], ['l-wa', C.whatsapp || '#']].forEach(function (p) { var a = $(p[0]); if (a) a.href = p[1]; });
    $('tabs').innerHTML = DESKS.map(function (d) { return '<button type="button" role="tab" class="tab" data-desk="' + d.id + '" aria-selected="' + (d.id === state.desk) + '">' + d.label + '</button>'; }).join('');
    $('tabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-desk]'); if (!b) return;
      state.desk = b.dataset.desk; state.shown = PAGE;
      Array.prototype.forEach.call($('tabs').children, function (x) { x.setAttribute('aria-selected', String(x === b)); });
      try { history.replaceState(null, '', '#' + state.desk); } catch (er) { /* ignore */ }
      render();
    });
    var h = (location.hash || '').slice(1); if (DESKS.some(function (d) { return d.id === h; })) { state.desk = h; Array.prototype.forEach.call($('tabs').children, function (x) { x.setAttribute('aria-selected', String(x.dataset.desk === h)); }); }
    var t; $('q').addEventListener('input', function (e) { clearTimeout(t); var v = e.target.value; t = setTimeout(function () { state.q = v; state.shown = PAGE; render(); }, 200); });
    $('src').addEventListener('change', function (e) { state.src = e.target.value; state.shown = PAGE; render(); });
    $('sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    $('more').addEventListener('click', function () { state.shown += PAGE; render(); });
    $('theme').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', cur); try { localStorage.setItem('tgn-theme', cur); } catch (e) { /* ignore */ }
    });
    // a picture that fails to load is simply hidden (CSP forbids inline onerror)
    document.addEventListener('error', function (e) { var el = e.target; if (el && el.tagName === 'IMG' && el.dataset.hideOnError) el.style.display = 'none'; }, true);
    tip(); load(); setInterval(load, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
  }

  // service worker + install banner
  if ('serviceWorker' in navigator && window.isSecureContext) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; try { if (sessionStorage.getItem('tgn-inst')) return; } catch (x) {} $('install').style.display = 'flex'; });
  document.addEventListener('DOMContentLoaded', function () {
    $('install-go').addEventListener('click', function () { if (deferred) { deferred.prompt(); deferred = null; } $('install').style.display = 'none'; });
    $('install-x').addEventListener('click', function () { $('install').style.display = 'none'; try { sessionStorage.setItem('tgn-inst', '1'); } catch (x) {} });
    init();
  });
})();
