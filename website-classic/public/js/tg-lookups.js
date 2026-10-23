/* Tech Guardians — live lookup engines (free, open services, no API keys).
   Used by the Cyber & Forensic Hub page and the homepage.
   Every engine returns a Promise of { title, rows: [[label, value], ...], note?, links?: [[label, url], ...] }
   and rejects with an Error whose message can be shown to the visitor.
   Services: ipwho.is, Google Public DNS (dns.google), RDAP (rdap.org), Have I Been Pwned
   Pwned Passwords (k-anonymity: only 5 characters of the password's hash leave the browser),
   Razorpay IFSC and India Post PIN code APIs. */
(function () {
  if (window.tgLookups) return;

  function getJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      if (!r.ok) throw new Error(r.status === 404 ? 'Nothing was found for this value.' : 'The lookup service did not answer (' + r.status + '). Try again shortly.');
      return r.json();
    }, function () { throw new Error('The lookup service could not be reached. Check your connection or try again shortly.'); });
  }
  function cleanDomain(v) {
    var d = String(v || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[\/?#:]/)[0];
    if (d.indexOf('@') > -1) d = d.split('@').pop();
    if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(d)) throw new Error('Enter a domain such as example.com');
    return d;
  }
  function dns(name, type) {
    return getJSON('https://dns.google/resolve?name=' + encodeURIComponent(name) + '&type=' + type).then(function (j) {
      return (j.Answer || []).filter(function (a) { return a.type === { A: 1, NS: 2, CNAME: 5, MX: 15, TXT: 16, AAAA: 28 }[type]; })
        .map(function (a) { return String(a.data).replace(/^"|"$/g, '').replace(/" "/g, ''); });
    });
  }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function age(days) {
    var y = Math.floor(days / 365), m = Math.floor((days % 365) / 30.4);
    return y ? plural(y, 'year') + (m ? ' ' + plural(m, 'month') : '') : plural(m, 'month');
  }
  function date(s) { var d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

  var engines = {
    ip: {
      label: 'IP Intelligence', icon: '🌐', placeholder: 'e.g. 8.8.8.8', button: 'Analyze IP',
      run: function (v) {
        var ip = String(v || '').trim();
        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && !(ip.indexOf(':') > -1 && /^[0-9a-f:]+$/i.test(ip))) return Promise.reject(new Error('Enter a valid IPv4 or IPv6 address.'));
        return getJSON('https://ipwho.is/' + encodeURIComponent(ip)).then(function (j) {
          if (j.success === false) throw new Error(j.message || 'This IP address could not be looked up.');
          return { title: 'IP ' + ip, rows: [
            ['Location', [j.city, j.region, j.country].filter(Boolean).join(', ') || '—'],
            ['ISP / organisation', (j.connection && (j.connection.isp || j.connection.org)) || '—'],
            ['Network (ASN)', j.connection && j.connection.asn ? 'AS' + j.connection.asn : '—'],
            ['Type', j.type || '—'], ['Time zone', (j.timezone && j.timezone.id) || '—'],
          ], links: [['Check abuse reports (AbuseIPDB)', 'https://www.abuseipdb.com/check/' + encodeURIComponent(ip)]] };
        });
      },
    },
    dns: {
      label: 'DNS Records', icon: '🧭', placeholder: 'e.g. example.com', button: 'Get DNS records',
      run: function (v) {
        var d; try { d = cleanDomain(v); } catch (e) { return Promise.reject(e); }
        return Promise.all(['A', 'AAAA', 'MX', 'NS', 'TXT'].map(function (t) { return dns(d, t).catch(function () { return []; }); })).then(function (r) {
          if (!r.some(function (x) { return x.length; })) throw new Error('No DNS records found — the domain may not exist.');
          return { title: 'DNS for ' + d, rows: [['A (IPv4)', r[0].join(', ') || '—'], ['AAAA (IPv6)', r[1].join(', ') || '—'], ['Mail servers (MX)', r[2].join(', ') || '—'], ['Name servers (NS)', r[3].join(', ') || '—'], ['TXT', r[4].slice(0, 4).join(' | ') || '—']] };
        });
      },
    },
    whois: {
      label: 'Domain WHOIS (RDAP)', icon: '📇', placeholder: 'e.g. example.com', button: 'Who owns it?',
      run: function (v) {
        var d; try { d = cleanDomain(v); } catch (e) { return Promise.reject(e); }
        return getJSON('https://rdap.org/domain/' + encodeURIComponent(d)).then(function (j) {
          var ev = {}; (j.events || []).forEach(function (e) { ev[e.eventAction] = e.eventDate; });
          var registrar = '';
          (j.entities || []).forEach(function (e) {
            if ((e.roles || []).indexOf('registrar') > -1 && e.vcardArray && e.vcardArray[1]) {
              e.vcardArray[1].forEach(function (f) { if (f[0] === 'fn') registrar = f[3]; });
            }
          });
          var created = ev.registration ? new Date(ev.registration) : null;
          var ageDays = created && !isNaN(created) ? Math.floor((Date.now() - created) / 864e5) : null;
          return { title: 'Registration of ' + d, rows: [
            ['Registered on', ev.registration ? date(ev.registration) : '—'],
            ['Domain age', ageDays == null ? '—' : ageDays < 180 ? ageDays + ' days — very new, be careful' : age(ageDays)],
            ['Expires on', ev.expiration ? date(ev.expiration) : '—'], ['Registrar', registrar || '—'],
            ['Status', (j.status || []).slice(0, 3).join(', ') || '—'],
          ], note: 'Scam websites are usually only days or weeks old.' };
        }, function () { throw new Error('Registration data is not available for this domain. Try who.is or the registry website.'); });
      },
    },
    spoof: {
      label: 'Email Spoofing Check', icon: '📧', placeholder: 'e.g. yourbank.com or name@company.com', button: 'Check SPF & DMARC',
      run: function (v) {
        var d; try { d = cleanDomain(v); } catch (e) { return Promise.reject(e); }
        return Promise.all([dns(d, 'TXT').catch(function () { return []; }), dns('_dmarc.' + d, 'TXT').catch(function () { return []; })]).then(function (r) {
          var spf = r[0].filter(function (t) { return /^v=spf1/i.test(t); })[0] || '';
          var dmarc = r[1].filter(function (t) { return /^v=DMARC1/i.test(t); })[0] || '';
          var policy = (dmarc.match(/;\s*p=(\w+)/i) || [])[1] || '';
          var verdict = !spf || !dmarc ? 'Weak — emails can be faked from this domain' : /reject|quarantine/i.test(policy) ? 'Protected — fake emails are blocked' : 'Partly protected — fake emails are only monitored';
          return { title: 'Email protection for ' + d, rows: [['Verdict', verdict], ['SPF', spf || 'Missing'], ['DMARC', dmarc || 'Missing'], ['DMARC policy', policy || '—']] };
        });
      },
    },
    password: {
      label: 'Password Leak Check', icon: '🔑', placeholder: 'Type a password to test', button: 'Check safely', secret: true,
      run: function (v) {
        var pw = String(v || '');
        if (!pw) return Promise.reject(new Error('Type a password to check.'));
        if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('This browser cannot check passwords safely.'));
        return crypto.subtle.digest('SHA-1', new TextEncoder().encode(pw)).then(function (buf) {
          var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').toUpperCase();
          return fetch('https://api.pwnedpasswords.com/range/' + hex.slice(0, 5), { headers: { 'Add-Padding': 'true' } }).then(function (r) {
            if (!r.ok) throw new Error('The password service did not answer. Try again shortly.');
            return r.text();
          }).then(function (txt) {
            var hit = txt.split('\n').map(function (l) { return l.trim().split(':'); }).filter(function (p) { return p[0] === hex.slice(5) && +p[1] > 0; })[0];
            var n = hit ? +hit[1] : 0;
            return { title: n ? 'This password has been leaked' : 'Not found in known leaks', rows: [
              ['Times seen in data breaches', n ? n.toLocaleString('en-IN') : '0'],
              ['Advice', n ? 'Stop using it everywhere and change it now.' : 'Good — still use a unique password for every account.'],
            ], note: 'Your password never leaves this device: only the first 5 characters of its SHA-1 hash are sent (k-anonymity).' };
          });
        });
      },
    },
    ifsc: {
      label: 'Bank IFSC Lookup', icon: '🏦', placeholder: 'e.g. SBIN0000300', button: 'Find bank branch',
      run: function (v) {
        var code = String(v || '').trim().toUpperCase();
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) return Promise.reject(new Error('Enter an 11-character IFSC such as SBIN0000300.'));
        return getJSON('https://ifsc.razorpay.com/' + code).then(function (j) {
          return { title: j.BANK + ' — ' + j.BRANCH, rows: [['Address', j.ADDRESS || '—'], ['City / State', [j.CITY, j.STATE].filter(Boolean).join(', ') || '—'], ['Contact', j.CONTACT || '—'], ['Payment services', [j.UPI && 'UPI', j.IMPS && 'IMPS', j.NEFT && 'NEFT', j.RTGS && 'RTGS'].filter(Boolean).join(' · ') || '—']],
            note: 'Use the branch details when you report a fraud to your bank or on cybercrime.gov.in.' };
        });
      },
    },
    pin: {
      label: 'PIN Code Lookup', icon: '📮', placeholder: 'e.g. 110001', button: 'Find post offices',
      run: function (v) {
        var pin = String(v || '').trim();
        if (!/^\d{6}$/.test(pin)) return Promise.reject(new Error('Enter a 6-digit PIN code.'));
        return getJSON('https://api.postalpincode.in/pincode/' + pin).then(function (j) {
          var po = (j && j[0] && j[0].PostOffice) || [];
          if (!po.length) throw new Error('No post office found for this PIN code.');
          return { title: 'PIN ' + pin + ' — ' + po[0].District + ', ' + po[0].State, rows: po.slice(0, 5).map(function (p) { return [p.Name, p.BranchType + ' · ' + p.Block]; }) };
        });
      },
    },
  };

  window.tgLookups = engines;
})();
