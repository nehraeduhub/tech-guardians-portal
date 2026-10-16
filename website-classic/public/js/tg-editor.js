/* Tech Guardians — live visual editor.
   Loaded on every page (React app and static pages).
   - Visitors: applies the admin's saved edits (text, links, images, hidden items)
     and re-checks for new edits every 15 seconds.
   - Signed-in admin: shows an "Edit this page" button. In edit mode, click any
     text, link, image or section to change, hide, unhide or reset it.
   Edits are stored in the `tg_overrides` site setting through /api/settings.php. */
(function () {
  if (window.__tgEditor) return;
  window.__tgEditor = true;

  var KEY = 'tg_overrides';
  var CACHE = 'tg_overrides_cache';
  var API = '/api/';
  var UI_ID = 'tg-editor-ui';
  var ov = {};
  var editing = false;
  var isAdmin = false;
  var selected = null;
  var origText = new WeakMap();
  var lastText = new WeakMap();
  var hiddenEls = [];
  var applyTimer = null;
  var lastJson = '';

  /* ---------- helpers ---------- */
  function pageKey() {
    var path = location.pathname.replace(/\/index\.html$/, '/');
    if (location.hash.indexOf('#/') === 0) path = path.replace(/\/[^/]*$/, '') + location.hash.slice(1).split(/[?#]/)[0];
    return path.replace(/\/+$/, '') || '/';
  }
  function isGlobal(el) { return !!(el && el.closest && el.closest('header, nav, footer')); }
  function scopeFor(el) { return isGlobal(el) ? '*' : pageKey(); }
  function bucket(scope, create) {
    if (!ov[scope] && create) ov[scope] = { t: {}, img: {}, href: {}, hide: [] };
    var b = ov[scope];
    if (b) {
      ['t', 'img', 'href'].forEach(function (k) { if (!b[k] || typeof b[k] !== 'object' || Array.isArray(b[k])) b[k] = {}; });
      if (!Array.isArray(b.hide)) b.hide = [];
    }
    return b;
  }
  function inUI(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    return !!(el && el.closest && el.closest('#' + UI_ID));
  }
  function safeUrl(u) {
    u = String(u || '').trim();
    if (/^(javascript|vbscript|data:text)/i.test(u.replace(/\s/g, ''))) return '';
    return u;
  }
  function cssPath(el) {
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      if (el.id && !/^(radix|headlessui)/.test(el.id)) { parts.unshift('#' + CSS.escape(el.id)); return parts.join(' > '); }
      var sec = el.getAttribute('data-tg-section');
      if (sec) { parts.unshift('[data-tg-section="' + sec + '"]'); return parts.join(' > '); }
      var tag = el.tagName.toLowerCase(), i = 1, sib = el;
      while ((sib = sib.previousElementSibling)) if (sib.tagName === el.tagName) i++;
      parts.unshift(tag + ':nth-of-type(' + i + ')');
      el = el.parentElement;
    }
    parts.unshift('body');
    return parts.join(' > ');
  }
  function api(path, opts) {
    return fetch(API + path, Object.assign({ credentials: 'same-origin', cache: 'no-store' }, opts || {}))
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw new Error(d.error || ('Request failed (' + r.status + ')')); return d; }); });
  }

  /* ---------- apply saved edits ---------- */
  function lookupText(node, key) {
    var el = node.parentElement;
    var scopes = isGlobal(el) ? ['*', pageKey()] : [pageKey(), '*'];
    for (var i = 0; i < scopes.length; i++) {
      var b = bucket(scopes[i]);
      if (b && Object.prototype.hasOwnProperty.call(b.t, key)) return b.t[key];
    }
    return undefined;
  }
  function lookupAttr(el, kind, orig) {
    var scopes = isGlobal(el) ? ['*', pageKey()] : [pageKey(), '*'];
    for (var i = 0; i < scopes.length; i++) {
      var b = bucket(scopes[i]);
      if (b && b[kind][orig]) return b[kind][orig];
    }
    return undefined;
  }
  function applyAll() {
    if (!document.body) return;
    // text
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.tagName) || inUI(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var cur = node.nodeValue;
      var orig = origText.get(node);
      if (orig === undefined || cur !== lastText.get(node)) { orig = cur; origText.set(node, orig); }
      var key = orig.trim();
      if (!key) { lastText.set(node, cur); continue; }
      var rep = lookupText(node, key);
      var want = rep === undefined ? orig : orig.replace(key, rep);
      if (cur !== want) node.nodeValue = want;
      lastText.set(node, want);
    }
    // images
    var imgs = document.body.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (inUI(img)) continue;
      var src = img.getAttribute('src') || '';
      var o = img.getAttribute('data-tg-orig-src');
      var applied = img.getAttribute('data-tg-src');
      if (o === null || (src !== applied && src !== o)) { o = src; img.setAttribute('data-tg-orig-src', o); }
      var ns = lookupAttr(img, 'img', o);
      var target = ns ? safeUrl(ns) || o : o;
      if (src !== target) { img.setAttribute('src', target); img.removeAttribute('srcset'); }
      img.setAttribute('data-tg-src', target);
    }
    // links
    var links = document.body.querySelectorAll('a[href]');
    for (var j = 0; j < links.length; j++) {
      var a = links[j];
      if (inUI(a)) continue;
      var href = a.getAttribute('href') || '';
      var oh = a.getAttribute('data-tg-orig-href');
      var ah = a.getAttribute('data-tg-href');
      if (oh === null || (href !== ah && href !== oh)) { oh = href; a.setAttribute('data-tg-orig-href', oh); }
      var nh = lookupAttr(a, 'href', oh);
      var th = nh ? safeUrl(nh) || oh : oh;
      if (href !== th) a.setAttribute('href', th);
      a.setAttribute('data-tg-href', th);
    }
    // hidden elements
    hiddenEls.forEach(function (el) { el.style.removeProperty('display'); el.removeAttribute('data-tg-hidden'); });
    hiddenEls = [];
    [pageKey(), '*'].forEach(function (scope) {
      var b = bucket(scope);
      if (!b) return;
      b.hide.forEach(function (sel) {
        var el = null;
        try { el = document.querySelector(sel); } catch (e) { el = null; }
        if (!el || inUI(el)) return;
        el.setAttribute('data-tg-hidden', scope + '|' + sel);
        if (!editing) el.style.setProperty('display', 'none', 'important');
        hiddenEls.push(el);
      });
    });
  }
  var lastPage = '';
  function scheduleApply() {
    if (applyTimer) return;
    applyTimer = setTimeout(function () {
      applyTimer = null;
      var page = pageKey();
      if (page !== lastPage) {
        lastPage = page;
        updateFab();
        if (!isAdmin) checkAdmin();
        if (editing) { clearSelection(); renderPanel(); }
      }
      applyAll();
    }, 40);
  }

  function setOverrides(value) {
    var json = JSON.stringify(value || {});
    if (json === lastJson) return;
    lastJson = json;
    ov = value && typeof value === 'object' ? value : {};
    try { localStorage.setItem(CACHE, json); } catch (e) {}
    applyAll();
    if (editing) renderPanel();
  }
  function load() {
    return api('settings.php?keys=' + KEY).then(function (rows) {
      var row = (rows || []).filter(function (r) { return r.key === KEY; })[0];
      setOverrides(row ? row.value : {});
    }).catch(function () {});
  }
  function save(status) {
    status = status || function () {};
    status('Saving…');
    return api('settings.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: KEY, value: ov }) })
      .then(function () { lastJson = JSON.stringify(ov); try { localStorage.setItem(CACHE, lastJson); } catch (e) {} applyAll(); status('Saved — live for all visitors.'); })
      .catch(function (e) { status(e.message || 'Could not save.'); });
  }

  /* ---------- editor UI ---------- */
  var ui, panel, fab;
  function css() {
    var s = document.createElement('style');
    s.textContent =
      '#' + UI_ID + '{all:initial;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#e2e8f0}' +
      '#' + UI_ID + ' *{box-sizing:border-box;font-family:inherit}' +
      '#tg-fab{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483000;background:#00d4ff;color:#001018;border:0;border-radius:999px;padding:11px 18px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 8px 30px rgba(0,212,255,.35)}' +
      '#tg-fab.on{background:#ff3b5c;color:#fff}' +
      '#tg-panel{position:fixed;top:0;right:0;bottom:0;width:min(360px,100vw);z-index:2147483001;background:#0b1220;border-left:1px solid #1e3a5f;padding:18px;overflow:auto;box-shadow:-10px 0 40px rgba(0,0,0,.5)}' +
      '#tg-panel h3{margin:0 0 6px;font-size:16px;color:#fff}#tg-panel p{margin:6px 0;color:#94a3b8;font-size:13px;line-height:1.45}' +
      '#tg-panel label{display:block;margin:12px 0 4px;font-size:12px;font-weight:700;color:#94a3b8}' +
      '#tg-panel textarea,#tg-panel input[type=text]{width:100%;background:#111a2e;border:1px solid #24406a;border-radius:8px;color:#fff;padding:9px;font-size:14px}' +
      '#tg-panel textarea{min-height:90px;resize:vertical}' +
      '#tg-panel .row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}' +
      '#tg-panel button{border:1px solid #24406a;background:#111a2e;color:#e2e8f0;border-radius:8px;padding:8px 12px;font-size:13px;cursor:pointer}' +
      '#tg-panel button.primary{background:#00d4ff;color:#001018;border-color:#00d4ff;font-weight:700}' +
      '#tg-panel button.danger{border-color:#7f1d1d;color:#fca5a5}' +
      '#tg-panel button:focus-visible,#tg-fab:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
      '#tg-panel .status{margin-top:10px;font-size:12px;color:#34d399;min-height:16px}' +
      '#tg-panel .hid{display:flex;justify-content:space-between;gap:8px;align-items:center;border-top:1px solid #1e3a5f;padding:8px 0;font-size:12px;color:#cbd5e1}' +
      '#tg-panel .hid span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '#tg-panel img{max-width:100%;max-height:140px;border-radius:8px;border:1px solid #24406a;display:block;margin-top:6px}' +
      '.tg-editing [data-tg-hover]{outline:2px dashed #00d4ff!important;outline-offset:2px;cursor:pointer!important}' +
      '.tg-editing [data-tg-selected]{outline:3px solid #00d4ff!important;outline-offset:2px}' +
      '.tg-editing [data-tg-hidden]{opacity:.35!important;outline:2px dashed #ff3b5c!important}' +
      '@media (max-width:640px){#tg-panel{top:auto;left:0;width:100vw;max-height:60vh;border-left:0;border-top:1px solid #1e3a5f}}';
    document.head.appendChild(s);
  }
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) { if (k === 'onclick') e.onclick = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (text != null) e.textContent = text;
    return e;
  }
  function buildUI() {
    if (ui) return;
    css();
    ui = el('div', { id: UI_ID });
    fab = el('button', { id: 'tg-fab', type: 'button' }, '✎ Edit this page');
    fab.onclick = function () { setEditing(!editing); };
    ui.appendChild(fab);
    document.body.appendChild(ui);
  }
  function setEditing(on) {
    editing = on;
    try { sessionStorage.setItem('tg_editing', on ? '1' : ''); } catch (e) {}
    document.documentElement.classList.toggle('tg-editing', on);
    fab.textContent = on ? '✕ Exit edit mode' : '✎ Edit this page';
    fab.classList.toggle('on', on);
    clearSelection();
    if (on) renderPanel(); else if (panel) { panel.remove(); panel = null; }
    applyAll();
  }
  function clearSelection() {
    if (selected) selected.removeAttribute('data-tg-selected');
    selected = null;
  }
  function mainTextNode(e) {
    var best = null;
    for (var n = e.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.nodeValue.trim() && (!best || n.nodeValue.trim().length > best.nodeValue.trim().length)) best = n;
    }
    return best;
  }
  function pickTarget(t, x, y) {
    if (t.tagName === 'IMG') return t;
    // Decorative overlays often sit on top of photos: look beneath for an image.
    if (x != null && !mainTextNode(t) && document.elementsFromPoint) {
      var stack = document.elementsFromPoint(x, y);
      for (var k = 0; k < stack.length; k++) {
        if (inUI(stack[k])) continue;
        if (stack[k].tagName === 'IMG') return stack[k];
        if (mainTextNode(stack[k])) break;
      }
    }
    var e = t;
    while (e && e !== document.body) { if (mainTextNode(e)) return e; e = e.parentElement; }
    return t;
  }

  function renderPanel() {
    if (!editing) return;
    if (!panel) { panel = el('div', { id: 'tg-panel', role: 'dialog', 'aria-label': 'Page editor' }); ui.appendChild(panel); }
    panel.innerHTML = '';
    var status = el('div', { class: 'status', 'aria-live': 'polite' });
    var say = function (m) { status.textContent = m; };

    if (!selected) {
      panel.appendChild(el('h3', null, 'Edit this page'));
      panel.appendChild(el('p', null, 'Click any text, button, link, image or section to change it. Hidden items show faded with a red outline. Turn off edit mode to use links normally.'));
      panel.appendChild(el('p', null, 'Menu, header and footer edits apply on every page; everything else applies to this page only.'));
      var hidden = [];
      [pageKey(), '*'].forEach(function (scope) { var b = bucket(scope); if (b) b.hide.forEach(function (sel) { hidden.push({ scope: scope, sel: sel }); }); });
      panel.appendChild(el('label', null, 'Hidden on this page (' + hidden.length + ')'));
      if (!hidden.length) panel.appendChild(el('p', null, 'Nothing hidden.'));
      hidden.forEach(function (h) {
        var row = el('div', { class: 'hid' });
        var target = null;
        try { target = document.querySelector(h.sel); } catch (e) {}
        var name = target ? (target.textContent || target.getAttribute('alt') || target.tagName).trim().slice(0, 60) : '(not on screen now)';
        row.appendChild(el('span', { title: h.sel }, name || h.sel));
        row.appendChild(el('button', { type: 'button', onclick: function () {
          var b = bucket(h.scope); b.hide = b.hide.filter(function (s) { return s !== h.sel; });
          save(say).then(renderPanel);
        } }, 'Unhide'));
        panel.appendChild(row);
      });
      panel.appendChild(status);
      return;
    }

    var target = selected;
    var scope = scopeFor(target);
    var b = bucket(scope, true);
    var isImg = target.tagName === 'IMG';
    var link = target.closest('a');
    panel.appendChild(el('h3', null, isImg ? 'Image' : 'Text'));
    panel.appendChild(el('p', null, scope === '*' ? 'Applies on every page.' : 'Applies on this page.'));

    var textNode = !isImg && mainTextNode(target);
    var textArea, hrefInput, imgInput;
    if (textNode) {
      var orig = (origText.get(textNode) || textNode.nodeValue).trim();
      panel.appendChild(el('label', { for: 'tg-text' }, 'Text'));
      textArea = el('textarea', { id: 'tg-text' });
      textArea.value = textNode.nodeValue.trim();
      panel.appendChild(textArea);
      textArea.dataset.orig = orig;
    }
    if (isImg) {
      var origSrc = target.getAttribute('data-tg-orig-src') || target.getAttribute('src');
      panel.appendChild(el('img', { src: target.getAttribute('src') || '', alt: '' }));
      panel.appendChild(el('label', { for: 'tg-img' }, 'Image link'));
      imgInput = el('input', { id: 'tg-img', type: 'text' });
      imgInput.value = target.getAttribute('src') || '';
      imgInput.dataset.orig = origSrc;
      panel.appendChild(imgInput);
      var file = el('input', { type: 'file', accept: 'image/*', id: 'tg-file' });
      file.style.marginTop = '8px';
      file.onchange = function () {
        var f = file.files && file.files[0];
        if (!f) return;
        say('Uploading…');
        shrink(f).then(function (dataUrl) {
          return api('upload.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl }) });
        }).then(function (r) { imgInput.value = r.url; say('Uploaded. Click Save to publish.'); })
          .catch(function (e) { say(e.message || 'Upload failed.'); });
      };
      panel.appendChild(el('label', { for: 'tg-file' }, 'Or upload a new image'));
      panel.appendChild(file);
    }
    if (link) {
      var origHref = link.getAttribute('data-tg-orig-href') || link.getAttribute('href');
      panel.appendChild(el('label', { for: 'tg-href' }, 'Link goes to'));
      hrefInput = el('input', { id: 'tg-href', type: 'text' });
      hrefInput.value = link.getAttribute('href') || '';
      hrefInput.dataset.orig = origHref;
      panel.appendChild(hrefInput);
    }

    var row = el('div', { class: 'row' });
    row.appendChild(el('button', { type: 'button', class: 'primary', onclick: function () {
      if (textArea) {
        var v = textArea.value.trim();
        if (v === textArea.dataset.orig) delete b.t[textArea.dataset.orig]; else b.t[textArea.dataset.orig] = v;
      }
      if (imgInput) {
        var iv = safeUrl(imgInput.value);
        if (!iv || iv === imgInput.dataset.orig) delete b.img[imgInput.dataset.orig]; else b.img[imgInput.dataset.orig] = iv;
      }
      if (hrefInput) {
        var hv = safeUrl(hrefInput.value);
        if (!hv || hv === hrefInput.dataset.orig) delete b.href[hrefInput.dataset.orig]; else b.href[hrefInput.dataset.orig] = hv;
      }
      save(say);
    } }, 'Save'));
    var hideBtn = function (label, elToHide) {
      return el('button', { type: 'button', class: 'danger', onclick: function () {
        var sel = cssPath(elToHide);
        var hb = bucket(scopeFor(elToHide), true);
        if (hb.hide.indexOf(sel) < 0) hb.hide.push(sel);
        clearSelection();
        save(say).then(renderPanel);
      } }, label);
    };
    if (target.hasAttribute('data-tg-hidden')) {
      row.appendChild(el('button', { type: 'button', onclick: function () {
        var parts = target.getAttribute('data-tg-hidden').split('|');
        var hb = bucket(parts[0], true);
        hb.hide = hb.hide.filter(function (s) { return s !== parts.slice(1).join('|'); });
        save(say).then(renderPanel);
      } }, 'Unhide'));
    } else {
      row.appendChild(hideBtn('Hide this', link && link.contains(target) && link !== target && !isImg ? link : target));
      var section = target.closest('section, [data-tg-section], header, footer');
      if (section && section !== target) row.appendChild(hideBtn('Hide whole section', section.closest('[data-tg-section]') || section));
    }
    row.appendChild(el('button', { type: 'button', onclick: function () {
      if (textArea) delete b.t[textArea.dataset.orig];
      if (imgInput) delete b.img[imgInput.dataset.orig];
      if (hrefInput) delete b.href[hrefInput.dataset.orig];
      save(say).then(renderPanel);
    } }, 'Reset to original'));
    row.appendChild(el('button', { type: 'button', onclick: function () { clearSelection(); renderPanel(); } }, 'Back'));
    panel.appendChild(row);
    panel.appendChild(status);
    if (textArea) textArea.focus();
  }

  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onerror = function () { reject(new Error('The photo could not be read.')); };
      fr.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('That file is not an image.')); };
        img.onload = function () {
          var s = Math.min(1, 1600 / img.naturalWidth, 1200 / img.naturalHeight);
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * s));
          c.height = Math.max(1, Math.round(img.naturalHeight * s));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var out = c.toDataURL('image/webp', 0.82);
          if (out.indexOf('data:image/webp') !== 0) out = c.toDataURL('image/jpeg', 0.82);
          resolve(out);
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---------- events ---------- */
  var hovered = null;
  document.addEventListener('mouseover', function (e) {
    if (!editing || inUI(e.target)) return;
    if (hovered) hovered.removeAttribute('data-tg-hover');
    hovered = pickTarget(e.target, e.clientX, e.clientY);
    if (hovered) hovered.setAttribute('data-tg-hover', '');
  }, true);
  ['click', 'submit'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (!editing || inUI(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      if (type !== 'click') return;
      clearSelection();
      selected = pickTarget(e.target, e.clientX, e.clientY);
      if (selected) selected.setAttribute('data-tg-selected', '');
      renderPanel();
    }, true);
  });

  /* ---------- start ---------- */
  function start() {
    try { var cached = localStorage.getItem(CACHE); if (cached) setOverrides(JSON.parse(cached)); } catch (e) {}
    applyAll();
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) if (!inUI(list[i].target)) { scheduleApply(); return; }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src', 'href'] });
    window.addEventListener('hashchange', scheduleApply);
    window.addEventListener('popstate', scheduleApply);
    load();
    checkAdmin();
    setInterval(function () { load(); if (!isAdmin) checkAdmin(); }, 15000);
  }
  function onAdminScreen() { return /\/(manage|login)$/.test(pageKey()); }
  function updateFab() {
    if (!fab) return;
    var hide = onAdminScreen();
    fab.style.display = hide ? 'none' : '';
    if (hide && editing) setEditing(false);
  }
  function checkAdmin() {
    api('auth.php?action=me').then(function (me) {
      if (!me || !me.admin || isAdmin) return;
      isAdmin = true;
      buildUI();
      updateFab();
      var keep = false;
      try { keep = sessionStorage.getItem('tg_editing') === '1'; } catch (e) {}
      if (keep && !onAdminScreen()) setEditing(true);
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.tgEditorAdmin = function () { return isAdmin; };
})();
