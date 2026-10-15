/* Tech Guardians — global WhatsApp number sync.
   The number saved in the admin manager (/manage → Contact) is applied to
   every wa.me link and visible support number on static pages. */
(function () {
  var KEY = 'tg_wa_number';
  var DEFAULT = '919929193136';
  var remote = {};
  function sync() {
    fetch('/api/settings.php?keys=tg_wa_number', { cache: 'no-store' })
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
  }
  window.TG_WHATSAPP_NUMBER = current();
  sync();
  setInterval(sync, 15000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
