(function () {
  var $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var id = q.get('id') || '', token = q.get('token') || '';
  var timer = null;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  function mine() {
    var list = [];
    try { list = JSON.parse(localStorage.getItem('tg_my_orders') || '[]'); } catch (e) {}
    if (id && token && !list.some(function (o) { return o.id === id; })) {
      // Opening an order link on a new device remembers it here too.
      list.unshift({ id: id, token: token, title: 'Order ' + id.slice(0, 6), at: Date.now() });
    }
    $('mine').hidden = list.length < 2;
    $('mine-list').innerHTML = list.slice(0, 12).map(function (o) {
      return '<li><span>' + esc(o.title) + (o.id === id ? ' (this order)' : '') + '</span>' + (o.id === id ? '' : '<a href="/order.html?id=' + esc(o.id) + '&token=' + esc(o.token) + '">Open →</a>') + '</li>';
    }).join('');
    return list;
  }

  function render(d) {
    $('loading').hidden = true; $('order').hidden = false;
    var pdf = d.type === 'pdf';
    $('type').textContent = pdf ? 'PDF download' : d.type === 'ctf' ? 'CTF Portal plan' : d.type === 'product' ? 'Product / service' : d.type === 'link' ? 'Payment' + (d.site ? ' — ' + d.site : '') : 'Course enrollment';
    $('title').textContent = d.title || 'Your order';
    $('amount').textContent = (d.amount === '₹0' && d.coupon ? 'Free' : d.amount || '') + (d.coupon ? ' (coupon ' + d.coupon + ')' : '');
    $('oid').textContent = d.id.slice(0, 8).toUpperCase();
    $('date').textContent = d.date || '';
    $('media').innerHTML = d.cover ? '<img src="' + esc(d.cover) + '" alt=""/>' : '<div class="ph">' + (pdf ? '📘' : '🎓') + '</div>';
    var labels = { pending: '⏳ Verifying your payment', approved: '✓ Payment approved', rejected: '✕ Payment not verified', recorded: '✓ Recorded' };
    $('status').innerHTML = '<span class="status ' + esc(d.status) + '">' + labels[d.status] + '</span>';
    var wa = ((d.settings && d.settings.whatsapp) || '919929193136').replace(/\D/g, '');
    var waBtn = '<a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent('Hi, about my Tech Guardians order ' + d.id + ' for "' + d.title + '".') + '">💬 WhatsApp us</a>';
    var msg, actions = waBtn;
    if (d.status === 'approved' && pdf && d.canDownload) {
      msg = 'Thank you' + (d.name ? ', ' + d.name : '') + '! Your PDF is ready. The download opens Google Drive, where you can save it to your device.';
      actions = '<a class="btn btn-pri" href="/api/payments.php?action=download&id=' + esc(id) + '&token=' + esc(token) + '">⬇ Download PDF</a>' + waBtn;
    } else if (d.status === 'approved' && pdf) {
      msg = 'Your payment is approved. The download link is being prepared — please check back shortly or message us on WhatsApp.';
    } else if (d.status === 'approved' && d.type === 'ctf') {
      msg = 'Your CTF plan is active. Every room and task in the CTF Portal is now unlocked.';
      actions = '<a class="btn btn-pri" href="/ctf">🚩 Open the CTF Portal</a>' + waBtn;
    } else if (d.status === 'approved') {
      msg = 'Your enrollment is confirmed. Course access details are shared on WhatsApp and email.';
    } else if (d.status === 'rejected') {
      msg = 'We could not match this payment with our bank records. If you have paid, message us on WhatsApp with your payment screenshot and we will fix it.';
    } else {
      msg = 'We are matching your UPI transaction with our bank records, usually within a few hours. This page updates by itself' + (pdf ? ' and shows the download button once approved.' : '.');
    }
    $('message').textContent = msg;
    $('actions').innerHTML = actions;
    clearTimeout(timer);
    if (d.status === 'pending' || (d.status === 'approved' && pdf && !d.canDownload)) timer = setTimeout(load, 20000);
    if (q.get('notready') && !d.canDownload) { $('notready').textContent = 'Your download is not available yet. It unlocks as soon as your payment is approved.'; $('notready').classList.add('show'); }
    // remember the real title for "My purchases"
    try {
      var list = mine().map(function (o) { return o.id === d.id ? { id: o.id, token: o.token, title: d.title, at: o.at } : o; });
      localStorage.setItem('tg_my_orders', JSON.stringify(list.slice(0, 30)));
    } catch (e) {}
    mine();
  }

  function load() {
    if (!id || !token) { $('loading').hidden = true; $('missing').hidden = false; mine(); return; }
    fetch('/api/payments.php?action=order&id=' + encodeURIComponent(id) + '&token=' + encodeURIComponent(token), { cache: 'no-store' })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error); return d; }); })
      .then(render)
      .catch(function (e) { $('loading').hidden = true; $('order').hidden = true; $('missing').hidden = false; if (e && e.message) $('missing-text').textContent = e.message; mine(); });
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && id) load(); });
  load();
})();
