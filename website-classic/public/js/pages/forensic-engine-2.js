(function () {
  // Tools and categories: the admin's saved list (Manage → Forensic Hub Tools),
  // or the built-in list below when none is saved.
  var builtIn = JSON.parse(document.getElementById('tools-data').textContent);
  var data = builtIn;
  var dir = document.getElementById('directory');
  var search = document.getElementById('portal-search');
  var chips = document.getElementById('chips');
  var officialBtn = document.getElementById('official-toggle');
  var info = document.getElementById('result-info');
  var empty = document.getElementById('empty');
  var live = document.getElementById('live-lookups');
  var state = { q: '', cat: 'all', official: false };

  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || '')) ? u : '#'; }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function render() {
    // Build every category section once; filtering only hides cards.
    dir.innerHTML = data.cats.map(function (c) {
      var cards = data.tools.filter(function (t) { return t.c === c.id; }).map(function (t, i) {
        var hay = (t.t + ' ' + (t.d || '') + ' ' + (t.o || '') + ' ' + (t.h || hostOf(t.u)) + ' ' + c.name + ' ' + c.desc).toLowerCase();
        return '<article class="tool" data-hay="' + esc(hay) + '" data-official="' + (t.g ? 1 : 0) + '">' +
          '<div class="tool-top"><span class="tool-ico" aria-hidden="true">' + esc(t.i) + '</span>' +
          (t.o ? '<span class="tool-org">' + esc(t.o) + '</span>' : '') + (t.g ? '<span class="badge">Official</span>' : '') + '</div>' +
          '<h3>' + esc(t.t) + '</h3><p>' + esc(t.d) + '</p>' +
          '<div class="tool-foot"><span class="tool-host">' + esc(t.h || hostOf(t.u)) + '</span>' +
          '<a class="tool-open" href="' + esc(safeUrl(t.u)) + '" target="_blank" rel="noopener noreferrer" aria-label="Open ' + esc(t.t) + ' (opens in a new tab)">Open ↗</a></div></article>';
      }).join('');
      return '<section class="group" id="cat-' + esc(c.id) + '" data-cat="' + esc(c.id) + '"><div class="group-head"><div>' +
        '<h2><span class="ico" aria-hidden="true">' + esc(c.icon) + '</span>' + esc(c.name) + '</h2><p>' + esc(c.desc) + '</p></div>' +
        '<span class="group-count"></span></div><div class="grid">' + cards + '</div></section>';
    }).join('');

    function count(catId) { return data.tools.filter(function (t) { return catId === 'all' || t.c === catId; }).length; }
    chips.innerHTML = '<button class="chip" type="button" data-cat="all" aria-pressed="true">All<span class="n">' + data.tools.length + '</span></button>' +
      '<button class="chip" type="button" data-cat="lookup" aria-pressed="false">⚡ Live lookups<span class="n">13</span></button>' +
      data.cats.map(function (c) { return '<button class="chip" type="button" data-cat="' + esc(c.id) + '" aria-pressed="false">' + esc(c.icon) + ' ' + esc(c.name) + '<span class="n">' + count(c.id) + '</span></button>'; }).join('');

    document.getElementById('stat-tools').textContent = data.tools.length + 13;
    document.getElementById('stat-cats').textContent = data.cats.length + 1;
    document.getElementById('stat-official').textContent = data.tools.filter(function (t) { return t.g; }).length;

    // Links such as /forensic-engine.html#cat=breach open one category (used by the homepage).
    var want = (location.hash.match(/^#cat=([\w-]+)/) || [])[1];
    state.cat = want && (want === 'lookup' || data.cats.some(function (c) { return c.id === want; })) ? want : 'all';
    Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-cat') === state.cat ? 'true' : 'false'); });
  }
  function validData(d) {
    return d && Array.isArray(d.cats) && Array.isArray(d.tools) && d.cats.length > 0;
  }
  function useData(d) {
    data = { cats: d.cats.filter(function (c) { return c && c.id && c.name; }),
             tools: d.tools.filter(function (t) { return t && t.t && t.c && !t.x; }) };
    render();
    apply();
  }
  function apply() {
    var q = state.q.trim().toLowerCase();
    var words = q ? q.split(/\s+/) : [];
    var shown = 0;
    Array.prototype.forEach.call(dir.querySelectorAll('.group'), function (g) {
      var inCat = state.cat === 'all' || state.cat === g.getAttribute('data-cat');
      var visible = 0;
      Array.prototype.forEach.call(g.querySelectorAll('.tool'), function (card) {
        var hay = card.getAttribute('data-hay');
        var ok = inCat && (!state.official || card.getAttribute('data-official') === '1') &&
          words.every(function (w) { return hay.indexOf(w) > -1; });
        card.hidden = !ok;
        if (ok) visible++;
      });
      g.hidden = visible === 0;
      g.querySelector('.group-count').textContent = visible + (visible === 1 ? ' tool' : ' tools');
      shown += visible;
    });
    var lookupOn = (state.cat === 'all' || state.cat === 'lookup') && !state.official &&
      (!q || words.every(function (w) { return live.textContent.toLowerCase().indexOf(w) > -1; }));
    live.hidden = !lookupOn;
    empty.style.display = shown === 0 && !lookupOn ? 'block' : 'none';
    info.textContent = (q || state.cat !== 'all' || state.official)
      ? 'Showing ' + shown + ' of ' + data.tools.length + ' tools' + (lookupOn ? ' plus live lookups' : '')
      : 'Showing all ' + data.tools.length + ' tools and 13 live lookups';
  }

  var timer;
  search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { state.q = search.value; apply(); }, 120); });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    state.cat = b.getAttribute('data-cat');
    Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
    apply();
    var target = state.cat === 'all' ? null : document.getElementById(state.cat === 'lookup' ? 'live-lookups' : 'cat-' + state.cat);
    if (target && !state.q) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  officialBtn.addEventListener('click', function () {
    state.official = !state.official;
    officialBtn.setAttribute('aria-pressed', String(state.official));
    apply();
  });
  document.getElementById('clear-filters').addEventListener('click', function () {
    state = { q: '', cat: 'all', official: false };
    search.value = ''; officialBtn.setAttribute('aria-pressed', 'false');
    Array.prototype.forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-cat') === 'all' ? 'true' : 'false'); });
    apply(); search.focus();
  });
  // Pressing Enter in a lookup box runs that lookup.
  Array.prototype.forEach.call(document.querySelectorAll('.lookup-card .l-input'), function (input) {
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = input.parentNode.querySelector('.btn-pri'); if (b) b.click(); } });
  });
  render();
  apply();
  // Use the admin's saved list when there is one.
  fetch('/api/settings.php?keys=tg_forensic_tools', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) {
      var row = (rows || []).filter(function (x) { return x.key === 'tg_forensic_tools'; })[0];
      if (row && validData(row.value)) useData(row.value);
    })
    .catch(function () { /* keep the built-in list */ });
})();
