  // More live lookups (free, open services) from /js/tg-lookups.js, in the same card style.
  (function () {
    var grid = document.querySelector('#live-lookups .lookup-grid');
    if (!grid || !window.tgLookups) return;
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    var subs = { dns: 'A, MX, NS and TXT records', whois: 'Registration date, age & registrar', spoof: 'SPF & DMARC — can emails be faked?', password: 'Leaked-password check, privately', ifsc: 'Bank & branch from an IFSC code', pin: 'Post offices for an Indian PIN code' };
    ['dns', 'whois', 'spoof', 'password', 'ifsc', 'pin'].forEach(function (key) {
      var e = window.tgLookups[key];
      var card = document.createElement('div');
      card.className = 'lookup-card';
      card.innerHTML = '<div class="lc-header"><div class="tool-icon" style="margin-bottom:0;">' + e.icon + '</div><div><div class="lc-title">' + esc(e.label) + '</div><div class="lc-sub">' + esc(subs[key]) + '</div></div></div>' +
        '<input autocomplete="off" class="l-input" type="' + (e.secret ? 'password' : 'text') + '" placeholder="' + esc(e.placeholder) + '"/>' +
        '<button class="btn-pri" type="button">' + esc(e.button) + '</button><div class="l-result"></div>';
      var input = card.querySelector('input'), out = card.querySelector('.l-result'), btn = card.querySelector('button');
      btn.addEventListener('click', function () {
        out.style.display = 'block';
        out.innerHTML = '<div style="text-align:center;padding:16px"><div class="loading"></div></div>';
        e.run(input.value).then(function (r) {
          out.innerHTML = '<div style="color:var(--pri);font-weight:700;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--bdr)">' + esc(r.title) + '</div>' +
            r.rows.map(function (row) { return '<div><span style="color:var(--muted)">' + esc(row[0]) + ':</span> ' + esc(row[1]) + '</div>'; }).join('') +
            (r.note ? '<div style="margin-top:10px;color:var(--muted)">' + esc(r.note) + '</div>' : '') +
            (r.links || []).map(function (l) { return '<div style="margin-top:8px"><a target="_blank" rel="noopener noreferrer" href="' + esc(l[1]) + '">' + esc(l[0]) + ' ↗</a></div>'; }).join('');
        }, function (err) { out.innerHTML = '<span style="color:var(--red)">❌ ' + esc(err.message) + '</span>'; });
      });
      grid.appendChild(card);
    });
  })();
