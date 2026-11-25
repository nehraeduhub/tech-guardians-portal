/* Tech Guardians — global WhatsApp number sync.
   The number saved in the admin manager (/manage → Contact) is applied to
   every WhatsApp link, visible support number, and course price on static pages.
   Two numbers with on/off switches: new (api.whatsapp.com) and old (wa.me). */
(function () {
  var KEY = 'tg_wa_number';
  var COURSES_KEY = 'tg_courses_admin';
  var LEGAL_KEY = 'tg_legal';
  var DEFAULT = '919929193136';
  var CH_KEY = 'tg_wa_channels';
  var NEW_DEFAULT = '15558843157';
  var remote = {};
  function sync() {
    fetch('/api/settings.php?keys=tg_wa_number,tg_wa_channels,tg_courses_admin,tg_legal', { cache: 'no-store' })
      .then(function (res) { if (!res.ok) throw new Error('settings unavailable'); return res.json(); })
      .then(function (rows) { remote = {}; rows.forEach(function (row) { remote[row.key] = row.value; }); apply(); })
      .catch(function () { /* keep the public defaults */ });
  }
  /** The WhatsApp target that is switched on: { id: 'new'|'old', num } or null when both are off. */
  function current() {
    var ch = remote[CH_KEY] || {};
    var newOn = ch.newOn === undefined ? true : !!ch.newOn;
    var oldOn = !!ch.oldOn;
    var newNum = /^\d{10,15}$/.test(String(ch.newNumber || '')) ? String(ch.newNumber) : NEW_DEFAULT;
    var v = remote[KEY];
    var oldNum = v && /^\d{10,15}$/.test(v) ? v : DEFAULT;
    if (newOn) return { id: 'new', num: newNum };
    if (oldOn) return { id: 'old', num: oldNum };
    return null;
  }
  function textOf(href) {
    try { return new URL(href, location.href).searchParams.get('text') || ''; } catch (e) { return ''; }
  }
  function apply() {
    var t = current();
    var links = document.querySelectorAll('a[href*="wa.me/"], a[href*="api.whatsapp.com/send"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!t) { a.style.display = 'none'; continue; }
      a.style.display = '';
      var txt = textOf(a.href);
      a.href = t.id === 'new'
        ? 'https://api.whatsapp.com/send/?phone=' + t.num + (txt ? '&text=' + encodeURIComponent(txt) : '')
        : 'https://wa.me/' + t.num + (txt ? '?text=' + encodeURIComponent(txt) : '');
    }
    window.TG_WHATSAPP_NUMBER = t ? t.num : '';
    if (t) {
    var num = t.num;
    var formatted = '+' + num.slice(0, Math.max(0, num.length - 10)) + ' ' + num.slice(-10, -5) + ' ' + num.slice(-5);
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (/99291\s*93136|95495\s*06570/.test(node.nodeValue || '')) {
        node.nodeValue = (node.nodeValue || '').replace(/(?:\+?91[\s-]*)?(?:99291[\s-]*93136|95495[\s-]*06570)/g, formatted);
      }
    }
    }
    applyCourse();
    applyLegal();
  }
  function escHtml(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function applyCourse() {
    var match = location.pathname.match(/\/courses\/([^/]+)\.html$/);
    if (!match || match[1] === 'payment' || match[1] === 'awareness-booking') return;
    try {
      var rows = remote[COURSES_KEY] || [];
      var course = rows.find(function (row) { return row.id === match[1] || row.page === location.pathname; });
      if (!course) return;
      var amount = String(course.offer || course.price || '').replace(/[^\d.]/g, '');
      document.querySelectorAll('a[href*="/courses/payment.html"]').forEach(function (link) {
        if (amount) link.href = '/courses/payment.html?course=' + encodeURIComponent(course.title) + '&amount=' + encodeURIComponent(amount);
      });
      document.querySelectorAll('.tg-price-tag').forEach(function (tag) {
        if (!course.showPrice || !amount) { tag.style.display = 'none'; return; }
        var oldPrice = course.offer && course.price ? '<span style="text-decoration:line-through;color:rgba(255,255,255,0.45);font-size:13px;">' + escHtml(course.price) + '</span>' : '';
        var currentPrice = '<span style="color:#00FF9C;font-size:18px;">' + escHtml(course.offer || course.price) + '</span>';
        tag.innerHTML = oldPrice + currentPrice;
        tag.style.display = 'inline-flex';
      });
      document.querySelectorAll('.price-block').forEach(function (block) { block.style.display = course.showPrice && amount ? '' : 'none'; });
      document.querySelectorAll('.price-amount').forEach(function (el) { if (amount) el.innerHTML = '<sup>₹</sup>' + Number(amount).toLocaleString('en-IN'); });
    } catch (e) {
      // Keep the page defaults when stored settings are unavailable.
    }
  }
  // Privacy note edited in Manage → Terms & Privacy (plain text only).
  function applyLegal() {
    var legal = remote[LEGAL_KEY];
    var note = legal && typeof legal.note === 'string' ? legal.note.trim() : '';
    if (!note) return;
    document.querySelectorAll('[data-tg-privacy-note] .tg-note-text').forEach(function (el) { el.textContent = note; });
  }
  window.TG_WHATSAPP_NUMBER = current() ? current().num : '';
  sync();
  setInterval(sync, 15000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
