/* Tech Guardians — global WhatsApp number sync.
   The number saved in the admin manager (/manage → Contact) is applied to
   every wa.me link, visible support number, and course price on static pages. */
(function () {
  var KEY = 'tg_wa_number';
  var COURSES_KEY = 'tg_courses_admin';
  var DEFAULT = '919929193136';
  var remote = {};
  function sync() {
    fetch('/api/settings.php?keys=tg_wa_number,tg_courses_admin', { cache: 'no-store' })
      .then(function (res) { if (!res.ok) throw new Error('settings unavailable'); return res.json(); })
      .then(function (rows) { remote = {}; rows.forEach(function (row) { remote[row.key] = row.value; }); apply(); })
      .catch(function () { /* keep the public defaults */ });
  }
  function current() {
    try {
      var v = remote[KEY];
      return v && /^\d{10,15}$/.test(v) ? v : DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }
  function apply() {
    var num = current();
    var links = document.querySelectorAll('a[href*="wa.me/"]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = links[i].href.replace(/wa\.me\/\d+/, 'wa.me/' + num);
    }
    window.TG_WHATSAPP_NUMBER = num;
    var formatted = '+' + num.slice(0, Math.max(0, num.length - 10)) + ' ' + num.slice(-10, -5) + ' ' + num.slice(-5);
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (/99291\s*93136|95495\s*06570/.test(node.nodeValue || '')) {
        node.nodeValue = (node.nodeValue || '').replace(/(?:\+?91[\s-]*)?(?:99291[\s-]*93136|95495[\s-]*06570)/g, formatted);
      }
    }
    applyCourse();
  }
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
        var oldPrice = course.offer && course.price ? '<span style="text-decoration:line-through;color:rgba(255,255,255,0.45);font-size:13px;">' + course.price + '</span>' : '';
        var currentPrice = '<span style="color:#00FF9C;font-size:18px;">' + (course.offer || course.price) + '</span>';
        tag.innerHTML = oldPrice + currentPrice;
        tag.style.display = 'inline-flex';
      });
      document.querySelectorAll('.price-block').forEach(function (block) { block.style.display = course.showPrice && amount ? '' : 'none'; });
      document.querySelectorAll('.price-amount').forEach(function (el) { if (amount) el.innerHTML = '<sup>₹</sup>' + Number(amount).toLocaleString('en-IN'); });
    } catch (e) {
      // Keep the page defaults when stored settings are unavailable.
    }
  }
  window.TG_WHATSAPP_NUMBER = current();
  sync();
  setInterval(sync, 15000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
