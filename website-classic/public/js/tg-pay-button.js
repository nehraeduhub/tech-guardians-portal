/* Tech Guardians "Pay by UPI" button for other websites.
   1. Add this script to the page:
        <script src="https://techguardians.in/js/tg-pay-button.js" defer></script>
   2. Add a button (only data-amount is required):
        <button data-tg-pay data-amount="499" data-for="Website hosting" data-ref="INV-1023"
                data-site="Client Name" data-return="https://clientwebsite.com/thanks">Pay ₹499</button>
   Clicking opens the Tech Guardians payment page in a new window (a new tab on phones).
   When the buyer submits the payment, the page fires a "tg-pay" event on document:
        document.addEventListener('tg-pay', function (e) { console.log(e.detail); // { status, order, token, ref } });
   The data-return website must be listed in api/pay-config.php on techguardians.in. */
(function () {
  var me = document.currentScript;
  var BASE = me && me.src ? new URL(me.src).origin : 'https://techguardians.in';
  var KEYS = { amount: 'amount', for: 'for', ref: 'ref', site: 'site', return: 'return', name: 'name', email: 'email', phone: 'phone' };

  function payUrl(el) {
    var q = new URLSearchParams();
    Object.keys(KEYS).forEach(function (k) { var v = el.getAttribute('data-' + k); if (v) q.set(KEYS[k], v); });
    return BASE + '/pay.html?' + q.toString();
  }
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-tg-pay]') : null;
    if (!el) return;
    e.preventDefault();
    var url = payUrl(el);
    var phone = /Android|iPhone|iPad/i.test(navigator.userAgent);
    var w = phone ? window.open(url, '_blank') : window.open(url, 'tgpay', 'width=1080,height=860,noreferrer=no');
    if (!w) location.href = url; // pop-up blocked: go to the page instead
  });
  window.addEventListener('message', function (e) {
    if (e.origin !== BASE || !e.data || e.data.type !== 'tg-pay') return;
    document.dispatchEvent(new CustomEvent('tg-pay', { detail: { status: e.data.status, order: e.data.order, token: e.data.token, ref: e.data.ref } }));
  });
})();
