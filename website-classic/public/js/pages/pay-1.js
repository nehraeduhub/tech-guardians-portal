(function () {
  var params = new URLSearchParams(location.search);
  var $ = function (id) { return document.getElementById(id); };
  var rupees = function (n) { return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }); };
  var clean = function (v, max) { return String(v || '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, max); };
  function newRef() {
    var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = 'TG', b = new Uint8Array(6);
    window.crypto.getRandomValues(b);
    for (var i = 0; i < 6; i++) out += abc[b[i] % abc.length];
    return out;
  }
  var amount = Math.round(Number(String(params.get('amount') || '').replace(/[^\d.]/g, '')) * 100) / 100;
  var state = {
    amount: amount, title: clean(params.get('for'), 120) || 'Payment', site: clean(params.get('site'), 60),
    extRef: String(params.get('ref') || '').replace(/[^A-Za-z0-9._\/-]/g, '').slice(0, 40),
    returnUrl: String(params.get('return') || '').slice(0, 500), ref: newRef(), settings: {}, shot: ''
  };

  function show(step) {
    ['step1', 'step2', 'step3', 'done'].forEach(function (id) { $(id).hidden = id !== step; });
    var n = { step1: 1, step2: 2, step3: 3, done: 4 }[step];
    Array.prototype.forEach.call($('steps').children, function (li, i) { li.className = i + 1 < n ? 'done' : i + 1 === n ? 'on' : ''; });
    $('steps').hidden = step === 'done';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function fail(box, msg) { $(box).textContent = msg; $(box).classList.add('show'); }
  function clear(box) { $(box).classList.remove('show'); }

  var UPI_RE = /^[a-z0-9._-]{2,64}@[a-z0-9.-]{2,32}$/i;
  function upiLink() {
    var s = state.settings;
    if (!s.upiId || !UPI_RE.test(s.upiId) || !(state.amount > 0)) return '';
    var note = (state.ref + ' ' + (state.extRef || state.title)).replace(/[^\w .,&()\/-]/g, '').replace(/\s+/g, ' ').slice(0, 50).trim();
    var am = state.amount.toFixed(2);
    return 'upi://pay?pa=' + encodeURIComponent(s.upiId).replace('%40', '@') + '&pn=' + encodeURIComponent((s.payeeName || 'Tech Guardians').slice(0, 50)) +
      '&am=' + am + '&mam=' + am + '&cu=INR&tn=' + encodeURIComponent(note);
  }

  function render() {
    var s = state.settings;
    $('sum-title').textContent = state.title;
    $('sum-site').textContent = state.site ? 'Payment to Tech Guardians for ' + state.site : 'Payment';
    $('sum-sub').textContent = state.extRef ? 'Reference: ' + state.extRef : '';
    if (state.site) { $('from-site').hidden = false; $('from-site').textContent = 'From ' + state.site; }
    $('sum-total').textContent = rupees(state.amount);
    $('pay-amount').textContent = rupees(state.amount);
    $('payee').textContent = s.payeeName || 'Tech Guardians';
    var link = upiLink(), live = !!link && typeof window.qrcode === 'function';
    if (live) {
      var qr = window.qrcode(0, 'M'); qr.addData(link); qr.make();
      $('qr-live').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: 'UPI QR code for ' + rupees(state.amount) });
    } else if (s.qrImage) $('qr').src = s.qrImage;
    $('qr-live').hidden = !live; $('qr').hidden = live; $('qr-badge').hidden = !live;
    $('qr-box').className = 'qr' + (live ? ' live' : '');
    $('ref-row').hidden = !live; $('pay-ref').textContent = state.ref;
    $('howto-1').textContent = live ? 'Scan the QR with any UPI app — ' + rupees(state.amount) + ' and the note ' + state.ref + ' are filled in for you.' : 'Open any UPI app and scan the QR code (or pay to the UPI ID).';
    $('howto-2').textContent = live ? 'Check the amount and payee, then enter your UPI PIN.' : 'Pay exactly ' + rupees(state.amount) + '.';
    if (s.upiId) {
      $('upi-row').hidden = false; $('upi-id').textContent = s.upiId;
      if (/Android|iPhone|iPad/i.test(navigator.userAgent) && link) { $('upi-app').hidden = false; $('upi-app').href = link; }
    }
    var wa = (s.whatsapp || '919929193136').replace(/\D/g, '');
    $('help-wa').href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hi, I need help with my payment for "' + state.title + '"' + (state.extRef ? ' (ref ' + state.extRef + ')' : '') + '.');
    $('help-email').textContent = s.email || '';
    document.title = rupees(state.amount) + ' — ' + state.title + ' — Pay by UPI';
  }

  $('step1').addEventListener('submit', function (e) {
    e.preventDefault(); clear('err1');
    var phone = $('phone').value.replace(/\D/g, '');
    if ($('name').value.trim().length < 2) return fail('err1', 'Please enter your full name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('email').value.trim())) return fail('err1', 'Please enter a valid email address.');
    if (phone.length < 10) return fail('err1', 'Please enter a 10-digit phone number.');
    show('step2');
  });
  ['name', 'email', 'phone'].forEach(function (id) { $(id).addEventListener('input', function () { clear('err1'); }); });
  ['utr', 'agree', 'agree-terms'].forEach(function (id) { $(id).addEventListener('input', function () { clear('err3'); }); });
  $('paid').addEventListener('click', function () { show('step3'); $('utr').focus(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-back]'), function (b) { b.addEventListener('click', function () { show('step' + b.getAttribute('data-back')); }); });
  $('copy-upi').addEventListener('click', function () { var b = this; navigator.clipboard && navigator.clipboard.writeText(state.settings.upiId).then(function () { b.textContent = 'Copied'; }).catch(function () {}); });

  $('drop').addEventListener('click', function () { $('shot').click(); });
  $('shot').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1280 / img.width, 1600 / img.height), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        state.shot = c.toDataURL('image/jpeg', 0.72);
        $('drop-ico').outerHTML = '<img id="drop-ico" src="' + state.shot + '" alt=""/>';
        $('drop-text').textContent = f.name + ' — tap to change';
      };
      img.onerror = function () { fail('err3', 'That file is not an image. Please upload a screenshot.'); };
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  });

  $('step3').addEventListener('submit', function (e) {
    e.preventDefault(); clear('err3');
    var utr = $('utr').value.replace(/\s/g, '');
    if (!/^[A-Za-z0-9]{6,30}$/.test(utr)) return fail('err3', 'Please enter the transaction ID (UTR) exactly as shown in your UPI app.');
    if (!$('agree').checked) return fail('err3', 'Please tick the box to confirm you have paid.');
    if (!$('agree-terms').checked) return fail('err3', 'Please accept the Terms & Conditions and Refund Policy.');
    var btn = $('submit'); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Submitting…';
    fetch('/api/payments.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
      body: JSON.stringify({
        type: 'link', amount: String(state.amount), course: state.title, site: state.site, extRef: state.extRef, returnUrl: state.returnUrl,
        ref: state.ref, name: $('name').value.trim(), email: $('email').value.trim(), phone: $('phone').value.replace(/\D/g, ''),
        utr: utr, date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), shot: state.shot || undefined
      })
    }).then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || 'Submission failed.'); return d; }); })
      .then(function (d) {
        $('order-link').value = location.origin + d.orderUrl;
        var wa = (state.settings.whatsapp || '919929193136').replace(/\D/g, '');
        var msg = 'Hi Tech Guardians, I have paid ' + rupees(state.amount) + ' for "' + state.title + '"' + (state.extRef ? ' (ref ' + state.extRef + ')' : '') + '. UTR: ' + utr + '. Note: ' + state.ref + '. Order ID: ' + d.id;
        var back = /^https:\/\//i.test(d.returnUrl || '') ? d.returnUrl : '';
        var actions = $('done-actions'); actions.textContent = '';
        var add = function (cls, text, href, blank) { var a = document.createElement('a'); a.className = 'btn ' + cls; a.textContent = text; a.href = href; if (blank) { a.target = '_blank'; a.rel = 'noopener'; } actions.appendChild(a); return a; };
        if (back) add('btn-pri', '← Back to ' + (state.site || 'the website'), back);
        add(back ? 'btn-ghost' : 'btn-pri', 'Open my receipt', d.orderUrl);
        add('btn-ghost', '💬 WhatsApp us', 'https://wa.me/' + wa + '?text=' + encodeURIComponent(msg), true);
        show('done');
        // Opened from a website's Pay button: tell that window the payment was submitted.
        if (window.opener && back) {
          try { window.opener.postMessage({ type: 'tg-pay', status: d.status, order: d.id, token: d.token, ref: state.extRef }, new URL(back).origin); } catch (err) { /* window closed */ }
        }
      })
      .catch(function (err) { fail('err3', (err && err.message) || 'Could not submit. Please try again.'); btn.disabled = false; btn.textContent = 'Submit payment'; });
  });
  $('copy-link').addEventListener('click', function () { var b = this; (navigator.clipboard ? navigator.clipboard.writeText($('order-link').value) : Promise.reject()).then(function () { b.textContent = 'Copied'; }).catch(function () { $('order-link').select(); }); });

  ['name', 'email', 'phone'].forEach(function (k) { if (params.get(k)) $(k).value = clean(params.get(k), 160); });
  if (!(state.amount >= 1 && state.amount <= 200000)) {
    fail('err0', 'This payment link has no valid amount. Please go back to the website you came from, or contact us on WhatsApp.');
    $('step1').querySelector('button[type=submit]').disabled = true;
  }
  fetch('/api/store.php').then(function (r) { return r.json(); }).then(function (d) { state.settings = d.settings || {}; }).catch(function () {}).then(render);
  render();
})();
