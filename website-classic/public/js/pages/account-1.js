(function () {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var safeUrl = function (u) { u = String(u || ''); return /^(https?:\/\/|\/)/i.test(u) ? u : ''; };
  var wa = '919929193136';
  var waLink = function (text) { return 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text); };

  function api(path, body) {
    var opts = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
    opts.credentials = 'same-origin'; opts.cache = 'no-store';
    return fetch('/api/users.php?action=' + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error || 'Something went wrong. Please try again.'); return d; });
    });
  }
  function showErr(id, msg) { $(id).textContent = msg; $(id).classList.toggle('show', !!msg); }
  function busy(btn, on, label) { btn.disabled = on; if (label) btn.textContent = on ? 'Please wait…' : label; }

  function setTab(reg) {
    $('tab-login').classList.toggle('on', !reg); $('tab-register').classList.toggle('on', reg);
    $('login-form').hidden = reg || otpMode; $('otp-form').hidden = reg || !otpMode; $('register-form').hidden = !reg; $('r-done').hidden = true;
  }

  /* ---------- Sign in with an email code ---------- */
  var otpOn = false, otpMode = false, otpTimer = 0;
  function setOtp(on) {
    otpMode = on; setTab(false); showErr('l-err', ''); showErr('o-err', '');
    if (on && !$('o-email').value && /@/.test($('l-user').value)) $('o-email').value = $('l-user').value.trim();
    (on ? $('o-email') : $('l-user')).focus();
  }
  $('use-otp').onclick = function () { setOtp(true); };
  $('use-pass').onclick = function () { setOtp(false); };
  function waitResend(sec) {
    clearInterval(otpTimer); $('o-resend').hidden = true;
    var left = sec;
    var tick = function () {
      if (left <= 0) { clearInterval(otpTimer); $('o-wait').textContent = ''; $('o-resend').hidden = false; return; }
      $('o-wait').textContent = 'You can ask for a new code in ' + left + ' s.'; left--;
    };
    tick(); otpTimer = setInterval(tick, 1000);
  }
  function sendCode() {
    showErr('o-err', '');
    var email = $('o-email').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showErr('o-err', 'Please enter the email address of your account.'); return; }
    busy($('o-btn'), true, 'Send code');
    api('otp_send', { email: email }).then(function (d) {
      $('o-code-box').hidden = false; $('o-sent').textContent = d.message; $('o-code').value = ''; $('o-code').focus();
      $('o-btn').dataset.step = 'verify'; busy($('o-btn'), false, 'Verify & sign in');
      waitResend(d.gap || 60);
    }).catch(function (err) { showErr('o-err', err.message); busy($('o-btn'), false, $('o-btn').dataset.step === 'verify' ? 'Verify & sign in' : 'Send code'); });
  }
  $('o-resend').onclick = function (e) { e.preventDefault(); sendCode(); };
  $('o-email').oninput = function () { $('o-btn').dataset.step = ''; $('o-code-box').hidden = true; $('o-btn').textContent = 'Send code'; };
  $('o-code').oninput = function () { this.value = this.value.replace(/\D/g, '').slice(0, 6); if (this.value.length === 6) $('o-btn').click(); };
  $('otp-form').onsubmit = function (e) {
    e.preventDefault();
    if ($('o-btn').dataset.step !== 'verify') { sendCode(); return; }
    var code = $('o-code').value;
    if (code.length !== 6) { showErr('o-err', 'Enter the 6-digit code from the email.'); return; }
    showErr('o-err', ''); busy($('o-btn'), true, 'Verify & sign in');
    api('otp_login', { email: $('o-email').value.trim(), code: code }).then(function () {
      clearInterval(otpTimer); afterSignIn();
    }).catch(function (err) { showErr('o-err', err.message); busy($('o-btn'), false, 'Verify & sign in'); $('o-code').select(); });
  };
  $('tab-login').onclick = function () { setTab(false); };
  $('tab-register').onclick = function () { setTab(true); };
  $('back-login').onclick = function () { setTab(false); };

  function showAuth() {
    $('loading').hidden = true; $('dash').hidden = true; $('auth').hidden = false;
    $('forgot').href = waLink('Hi Tech Guardians, I forgot my account password. My user ID is: ');
    if (location.hash === '#register') setTab(true);
    var q = new URLSearchParams(location.search);
    if (q.get('email')) $('r-email').value = q.get('email');
    if (q.get('name')) $('r-name').value = q.get('name');
    if (q.get('phone')) $('r-phone').value = q.get('phone');
  }

  function item(icon, img, title, sub, links) {
    return '<div class="item">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy"/>' : '<div class="ph">' + icon + '</div>') +
      '<div style="min-width:0"><h3>' + esc(title) + '</h3>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '<div class="links">' + links + '</div></div></div>';
  }
  function a(href, label, go, ext) {
    href = safeUrl(href);
    return href ? '<a' + (go ? ' class="go"' : '') + ' href="' + esc(href) + '"' + (ext || /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>' : '';
  }

  function showDash(d) {
    $('loading').hidden = true; $('auth').hidden = true; $('dash').hidden = false;
    var u = d.user;
    $('d-avatar').textContent = (u.name || u.username).charAt(0).toUpperCase();
    $('d-name').textContent = 'Hi, ' + (u.name || u.username).split(' ')[0];
    $('d-user').textContent = '@' + u.username;
    $('d-since').textContent = u.since || '';
    $('n-courses').textContent = d.courses.length; $('n-pdfs').textContent = d.pdfs.length; $('n-pending').textContent = d.pending.length;
    $('d-wa').href = waLink('Hi Tech Guardians, I need help with my account (@' + u.username + ').');

    $('courses').innerHTML = d.courses.length ? d.courses.map(function (c) {
      return item('🎓', '', c.title, c.note, a(c.link, '▶ Open course material', true, true) + a(c.page, 'Course page', false) +
        (c.link ? '' : '<span>Access details on WhatsApp</span>'));
    }).join('') : '<div class="empty">No courses yet. Courses you paid for with <b>' + esc(u.email) + '</b> appear here once your payment is approved.</div>';

    $('pdfs').innerHTML = d.pdfs.length ? d.pdfs.map(function (p) {
      return item('📘', p.cover, p.title, p.pages ? p.pages + ' pages · PDF' : 'PDF',
        p.link ? a(p.link, '⬇ Open in Google Drive', true, true) : '<span>Link being prepared</span>');
    }).join('') : '<div class="empty">No PDF books yet. <a href="/pdf-store/">Visit the PDF Store</a>.</div>';

    $('pending-card').hidden = !d.pending.length;
    var blog = d.blog || { canWrite: false, reason: '' };
    $('blog-card').hidden = !blog.canWrite && !blog.reason;
    $('blog-text').textContent = blog.canWrite
      ? 'Share what you have learned. Write an article — our team reviews it and publishes it on TG Blogs.'
      : blog.reason;
    $('blog-btn').hidden = !blog.canWrite;
    $('pending').innerHTML = d.pending.map(function (p) {
      return '<li><span>' + esc(p.title || 'Payment') + (p.amount ? ' · ' + esc(p.amount) : '') + '</span><span class="status ' + (p.status === 'rejected' ? 'rejected' : 'pending') + '">' + (p.status === 'rejected' ? 'Not verified' : 'Verifying') + '</span></li>';
    }).join('');
  }

  function load() {
    api('me').then(function (d) {
      if (d.settings && d.settings.whatsapp) wa = String(d.settings.whatsapp).replace(/\D/g, '') || wa;
      if (d.closed) { $('loading').innerHTML = 'Student accounts are closed at the moment. Please contact Tech Guardians on <a href="' + waLink('Hi Tech Guardians, I need access to my courses.') + '" target="_blank" rel="noopener">WhatsApp</a>.'; return; }
      otpOn = !!d.otp; $('use-otp').hidden = !otpOn;
      if (d.user) showDash(d); else showAuth();
    }).catch(function (e) {
      $('loading').innerHTML = esc(e.message);
    });
  }

  function afterSignIn() {
    // Came from a members-only page (e.g. the CTF portal)? Go back there.
    var next = new URLSearchParams(location.search).get('next') || '';
    if (/^\/(ctf)(\/[A-Za-z0-9\/_-]*)?$/.test(next)) { location.assign(next); return; }
    load();
  }

  $('login-form').onsubmit = function (e) {
    e.preventDefault(); showErr('l-err', '');
    busy($('l-btn'), true, 'Sign in');
    api('login', { username: $('l-user').value, password: $('l-pass').value })
      .then(function () { $('l-pass').value = ''; afterSignIn(); })
      .catch(function (err) { showErr('l-err', err.message); })
      .then(function () { busy($('l-btn'), false, 'Sign in'); });
  };

  $('register-form').onsubmit = function (e) {
    e.preventDefault(); showErr('r-err', '');
    if ($('r-pass').value !== $('r-pass2').value) { showErr('r-err', 'The two passwords do not match.'); return; }
    if (!$('r-agree').checked) { showErr('r-err', 'Please accept the Terms & Conditions and confirm you have saved your login details.'); return; }
    busy($('r-btn'), true, 'Send request');
    var body = { agree: true, name: $('r-name').value, email: $('r-email').value, phone: $('r-phone').value, username: $('r-user').value, password: $('r-pass').value };
    api('register', body).then(function () {
      $('register-form').hidden = true; $('r-done').hidden = false;
      $('r-wa').href = waLink('Hi Tech Guardians, I requested a student account. User ID: ' + body.username.toLowerCase() + ', name: ' + body.name + '.');
      $('l-user').value = body.username.toLowerCase();
      $('r-pass').value = $('r-pass2').value = '';
    }).catch(function (err) { showErr('r-err', err.message); })
      .then(function () { busy($('r-btn'), false, 'Send request'); });
  };

  $('logout').onclick = function () { api('logout', {}).then(showAuth, showAuth); };

  $('pw-form').onsubmit = function (e) {
    e.preventDefault(); showErr('p-err', ''); $('p-ok').hidden = true;
    busy($('p-btn'), true, 'Save new password');
    api('password', { current: $('p-cur').value, next: $('p-new').value })
      .then(function () { $('p-cur').value = $('p-new').value = ''; $('p-ok').hidden = false; })
      .catch(function (err) { showErr('p-err', err.message); })
      .then(function () { busy($('p-btn'), false, 'Save new password'); });
  };

  document.addEventListener('visibilitychange', function () { if (!document.hidden && !$('dash').hidden) load(); });
  load();
})();
