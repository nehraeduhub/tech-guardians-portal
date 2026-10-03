/* Tech Guardians — site themes.
   Loaded in the <head> of every page (React app and static pages).
   The admin picks a theme in Manage → Themes; it is stored in the `tg_theme`
   setting and every open page switches within 15 seconds.
   Each theme sets colours, fonts, card style and an animated 3D background. */
(function () {
  if (window.tgTheme) return;

  var CACHE = 'tg_theme_cache';
  var DEFAULT_ID = 'cyber-neon';

  // Shorthand: React tokens are HSL triplets ("h s% l%"), static pages use hex.
  var THEMES = [
    {
      id: 'cyber-neon',
      name: 'Cyber Neon',
      tagline: 'The original Tech Guardians look: neon cyan on deep space blue.',
      swatch: ['#020617', '#00D4FF', '#00FF9C', '#FF9F1C'],
      fonts: { head: "'Orbitron', 'Inter', sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" },
      original: true,
    },
    {
      id: 'quantum-grid',
      name: 'Quantum Grid',
      tagline: 'Electric violet and cyan over an endless 3D grid horizon.',
      swatch: ['#07031a', '#8b5cf6', '#22d3ee', '#f472b6'],
      fontUrl: 'family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600',
      fonts: { head: "'Space Grotesk', 'Inter', sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" },
      react: {
        background: '252 75% 6%', foreground: '250 100% 97%', card: '252 55% 10%', popover: '252 60% 8%',
        primary: '258 90% 66%', primaryFg: '0 0% 100%', secondary: '252 45% 16%', secondaryFg: '250 100% 90%',
        muted: '252 40% 15%', mutedFg: '250 25% 72%', accent: '188 86% 53%', accentFg: '252 75% 6%',
        border: '258 50% 26%', input: '252 40% 18%', ring: '258 90% 66%',
        blue: '188 86% 53%', green: '160 84% 52%', purple: '258 90% 66%', orange: '330 86% 70%', red: '350 89% 60%',
        topbar: '252 80% 4%', topbarFg: '250 60% 85%', radius: '1rem',
      },
      css: { bg: '#07031a', bg2: '#0d0828', surface: '#120c30', surface2: '#1a1240', surface3: '#221852', text: '#f3f0ff', muted: '#a59fc9', border: 'rgba(139,92,246,.28)', primary: '#8b5cf6', primary2: '#a78bfa', secondary: '#22d3ee', accent: '#f472b6', gold: '#fbbf24' },
      pageBg: 'radial-gradient(1200px 700px at 50% -10%, rgba(139,92,246,.28), transparent 60%), radial-gradient(900px 500px at 100% 30%, rgba(34,211,238,.12), transparent 60%), #07031a',
      fx: 'grid', tilt: true,
    },
    {
      id: 'aurora-glass',
      name: 'Aurora Glass',
      tagline: 'Frosted glass panels floating on slow northern-lights colour.',
      swatch: ['#041318', '#2dd4bf', '#38bdf8', '#a3e635'],
      fontUrl: 'family=Sora:wght@500;600;700&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500',
      fonts: { head: "'Sora', 'DM Sans', sans-serif", body: "'DM Sans', system-ui, sans-serif", mono: "'IBM Plex Mono', monospace" },
      react: {
        background: '194 70% 5%', foreground: '180 40% 96%', card: '192 45% 10%', popover: '194 55% 8%',
        primary: '172 66% 50%', primaryFg: '194 70% 5%', secondary: '192 35% 16%', secondaryFg: '172 60% 85%',
        muted: '192 30% 15%', mutedFg: '186 18% 72%', accent: '199 89% 60%', accentFg: '194 70% 5%',
        border: '180 40% 24%', input: '192 30% 18%', ring: '172 66% 50%',
        blue: '199 89% 60%', green: '83 78% 55%', purple: '265 85% 75%', orange: '38 92% 60%', red: '0 84% 64%',
        topbar: '194 75% 4%', topbarFg: '172 50% 80%', radius: '1.25rem',
      },
      css: { bg: '#041318', bg2: '#062027', surface: 'rgba(13,42,50,.72)', surface2: 'rgba(18,56,66,.72)', surface3: 'rgba(24,70,82,.72)', text: '#effcfb', muted: '#9ec3c4', border: 'rgba(45,212,191,.25)', primary: '#2dd4bf', primary2: '#5eead4', secondary: '#a3e635', accent: '#38bdf8', gold: '#fcd34d' },
      pageBg: '#041318',
      cardBg: 'linear-gradient(160deg, hsl(192 45% 14% / .55), hsl(194 60% 8% / .55))',
      glass: true, fx: 'aurora', tilt: true,
    },
    {
      id: 'royal-command',
      name: 'Royal Command',
      tagline: 'Navy and saffron-gold, formal and trusted, with turning gold rings.',
      swatch: ['#06101f', '#f5a524', '#e8eef9', '#16a34a'],
      fontUrl: 'family=Rajdhani:wght@600;700&family=Mukta:wght@400;500;600&family=Roboto+Mono:wght@400;500',
      fonts: { head: "'Rajdhani', 'Mukta', sans-serif", body: "'Mukta', system-ui, sans-serif", mono: "'Roboto Mono', monospace" },
      react: {
        background: '217 68% 7%', foreground: '216 60% 95%', card: '217 55% 11%', popover: '217 60% 9%',
        primary: '37 91% 55%', primaryFg: '217 68% 7%', secondary: '217 45% 17%', secondaryFg: '37 90% 80%',
        muted: '217 40% 16%', mutedFg: '215 22% 72%', accent: '142 71% 45%', accentFg: '0 0% 100%',
        border: '37 45% 26%', input: '217 40% 19%', ring: '37 91% 55%',
        blue: '211 90% 62%', green: '142 71% 45%', purple: '262 60% 70%', orange: '27 96% 58%', red: '0 78% 58%',
        topbar: '217 75% 5%', topbarFg: '37 70% 78%', radius: '0.6rem',
      },
      css: { bg: '#06101f', bg2: '#0a1830', surface: '#0d1d36', surface2: '#132645', surface3: '#1a3157', text: '#eef3fb', muted: '#a7b4c9', border: 'rgba(245,165,36,.28)', primary: '#f5a524', primary2: '#fbbf24', secondary: '#16a34a', accent: '#fb923c', gold: '#f5a524' },
      pageBg: 'radial-gradient(1000px 600px at 15% -10%, rgba(245,165,36,.14), transparent 60%), radial-gradient(800px 600px at 100% 40%, rgba(37,99,235,.16), transparent 60%), #06101f',
      fx: 'rings', tilt: true, bevel: true,
    },
    {
      id: 'matrix-ops',
      name: 'Matrix Ops',
      tagline: 'Hacker-terminal green, falling code and a scan-lined CRT finish.',
      swatch: ['#000a04', '#22ff88', '#00c853', '#e6ffe9'],
      fontUrl: 'family=Share+Tech+Mono&family=IBM+Plex+Sans:wght@400;500;600&family=Fira+Code:wght@400;500',
      fonts: { head: "'Share Tech Mono', 'Fira Code', monospace", body: "'IBM Plex Sans', system-ui, sans-serif", mono: "'Fira Code', monospace" },
      react: {
        background: '145 100% 2%', foreground: '130 100% 92%', card: '145 70% 5%', popover: '145 80% 4%',
        primary: '148 100% 57%', primaryFg: '145 100% 2%', secondary: '145 60% 10%', secondaryFg: '140 100% 80%',
        muted: '145 50% 9%', mutedFg: '135 25% 65%', accent: '142 100% 39%', accentFg: '145 100% 2%',
        border: '146 70% 18%', input: '145 50% 12%', ring: '148 100% 57%',
        blue: '170 100% 50%', green: '148 100% 57%', purple: '120 60% 70%', orange: '60 100% 55%', red: '0 100% 60%',
        topbar: '145 100% 1%', topbarFg: '140 80% 70%', radius: '0.25rem',
      },
      css: { bg: '#000a04', bg2: '#021208', surface: '#04180b', surface2: '#062010', surface3: '#082a15', text: '#e6ffe9', muted: '#8fb89a', border: 'rgba(34,255,136,.25)', primary: '#22ff88', primary2: '#5cffa8', secondary: '#00c853', accent: '#d4ff3a', gold: '#d4ff3a' },
      pageBg: '#000a04',
      fx: 'matrix', tilt: false, crt: true,
    },
    {
      id: 'arctic-light',
      name: 'Arctic Light',
      tagline: 'Bright, clean corporate style with soft 3D depth and ice-blue accents.',
      swatch: ['#f4f8fc', '#0b63e5', '#0f172a', '#14b8a6'],
      fontUrl: 'family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500',
      fonts: { head: "'Manrope', 'Inter', sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" },
      light: true,
      react: {
        background: '210 50% 97%', foreground: '222 47% 11%', card: '0 0% 100%', popover: '0 0% 100%',
        primary: '216 91% 47%', primaryFg: '0 0% 100%', secondary: '214 45% 92%', secondaryFg: '216 80% 30%',
        muted: '214 40% 93%', mutedFg: '215 19% 38%', accent: '173 80% 36%', accentFg: '0 0% 100%',
        border: '214 32% 85%', input: '214 32% 88%', ring: '216 91% 47%',
        blue: '216 91% 47%', green: '160 84% 32%', purple: '262 70% 50%', orange: '25 95% 45%', red: '0 74% 48%',
        topbar: '222 47% 11%', topbarFg: '210 40% 92%', radius: '1rem',
      },
      css: { bg: '#f4f8fc', bg2: '#e8f0f9', surface: '#ffffff', surface2: '#f1f5fb', surface3: '#e6edf7', text: '#0f172a', muted: '#475569', border: 'rgba(15,23,42,.12)', primary: '#0b63e5', primary2: '#2563eb', secondary: '#0d9488', accent: '#ea580c', gold: '#b45309' },
      pageBg: 'radial-gradient(1000px 600px at 85% -10%, rgba(11,99,229,.10), transparent 60%), radial-gradient(800px 500px at 0% 20%, rgba(20,184,166,.08), transparent 60%), #f4f8fc',
      heroGradient: 'linear-gradient(100deg, #0b63e5 0%, #0d9488 55%, #6d28d9 100%)', heroAccent: '#c2410c',
      fx: 'shapes', tilt: true,
    },
  ];

  var byId = {};
  THEMES.forEach(function (t) { byId[t.id] = t; });
  var current = null;
  var root = document.documentElement;
  var isStatic = /\.html$/i.test(location.pathname) && !/\/index\.html$/i.test(location.pathname);
  if (isStatic) root.setAttribute('data-tg-static', '');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
    return m ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) : '0,212,255';
  }

  function themeCss(t) {
    if (t.original) return '';
    var r = t.react, c = t.css, f = t.fonts, sel = ':root[data-tg-theme="' + t.id + '"]';
    var react = sel + ':not([data-tg-static])';
    var stat = sel + '[data-tg-static]';
    var prgb = hexToRgb(c.primary);
    var out = [];
    // React app tokens
    out.push(react + '{--background:' + r.background + ';--foreground:' + r.foreground + ';--card:' + r.card + ';--card-foreground:' + r.foreground +
      ';--popover:' + r.popover + ';--popover-foreground:' + r.foreground + ';--primary:' + r.primary + ';--primary-foreground:' + r.primaryFg +
      ';--secondary:' + r.secondary + ';--secondary-foreground:' + r.secondaryFg + ';--muted:' + r.muted + ';--muted-foreground:' + r.mutedFg +
      ';--accent:' + r.accent + ';--accent-foreground:' + r.accentFg + ';--border:' + r.border + ';--input:' + r.input + ';--ring:' + r.ring +
      ';--radius:' + r.radius + ';--cyber-blue:' + r.blue + ';--cyber-green:' + r.green + ';--cyber-purple:' + r.purple + ';--cyber-orange:' + r.orange +
      ';--cyber-red:' + r.red + ';--destructive:' + r.red + ';--glass-bg:' + r.card + ';--glass-border:' + r.primary + ';--topbar:' + r.topbar + ';--topbar-foreground:' + r.topbarFg + '}');
    // Homepage headline colours follow the theme.
    out.push(sel + '{--tg-hero-gradient:' + (t.heroGradient || ('linear-gradient(100deg, ' + c.primary + ' 0%, ' + c.secondary + ' 50%, ' + c.primary2 + ' 100%)')) + ';--tg-hero-accent:' + (t.heroAccent || c.accent) + '}');
    // Static page variables (each static page names its palette a little differently)
    out.push(stat + '{--ink:' + c.bg + ';--ink2:' + c.bg2 + ';--bg:' + c.bg + ';--bg2:' + c.bg2 + ';--navy:' + c.bg2 + ';--navy2:' + c.bg2 + ';--topbar:' + c.bg +
      ';--surface:' + c.surface + ';--surface2:' + c.surface2 + ';--surface3:' + c.surface3 + ';--card:' + c.surface + ';--card2:' + c.surface2 +
      ';--panel:' + c.surface + ';--panel2:' + c.surface2 + ';--panel3:' + c.surface3 + ';--hub-bg:' + c.bg + ';--hub-card:' + c.surface + ';--hub-border:' + c.border +
      ';--text:' + c.text + ';--text2:' + c.text + ';--muted:' + c.muted + ';--muted2:' + c.muted + ';--border:' + c.border + ';--border2:' + c.border + ';--bdr:' + c.border +
      ';--cyan:' + c.primary + ';--cyan2:' + c.primary2 + ';--hub-cyan:' + c.primary + ';--pri:' + c.primary + ';--blue:' + c.primary + ';--c1:' + c.primary +
      ';--green:' + c.secondary + ';--green2:' + c.secondary + ';--hub-green:' + c.secondary + ';--teal:' + c.secondary + ';--g1:' + c.secondary +
      ';--orange:' + c.accent + ';--orange2:' + c.accent + ';--amber:' + c.accent + ';--hub-orange:' + c.accent + ';--accent:' + c.accent +
      ';--gold:' + c.gold + ';--gold2:' + c.gold + ';--gold3:' + c.gold + ';--gold4:' + c.gold + ';--purple:' + c.primary2 +
      ';--txt2:' + c.muted + ';--soft:' + c.muted + ';--glow:0 0 40px rgba(' + prgb + ',.35);--glow-g:0 0 40px rgba(' + prgb + ',.3)' +
      ';--head:' + f.head + ';--body:' + f.body + ';--mono:' + f.mono + ';--font-head:' + f.head + ';--font-body:' + f.body + ';--font-mono:' + f.mono + '}');
    // Page background lives on <html> so the 3D layer can sit between it and the content.
    out.push(sel + '{background:' + t.pageBg + ' !important;background-attachment:fixed !important;color-scheme:' + (t.light ? 'light' : 'dark') + '}');
    out.push(sel + ' body{background:transparent !important;isolation:isolate}');
    out.push(sel + ' body{font-family:' + f.body + '}');
    out.push(sel + ' h1,' + sel + ' h2,' + sel + ' h3,' + sel + ' .font-display{font-family:' + f.head + ' !important}');
    out.push(sel + ' code,' + sel + ' pre,' + sel + ' kbd,' + sel + ' .font-mono{font-family:' + f.mono + ' !important}');
    out.push(sel + ':not([data-tg-static]) body{color:hsl(var(--foreground))}');
    out.push(sel + '[data-tg-static] body{color:' + c.text + '}');
    // Components from the main stylesheet that use fixed colours
    out.push(sel + ' .glass-card{background:' + (t.cardBg || 'linear-gradient(180deg, hsl(var(--card) / .92), hsl(var(--background) / .92))') + ' !important;border-color:hsl(var(--primary) / .22) !important}');
    out.push(sel + ' .rl-pill{background:hsl(var(--card) / .85) !important;border-color:hsl(var(--primary) / .3) !important}');
    out.push(sel + ' .grid-pattern{background-image:linear-gradient(hsl(var(--primary) / .06) 1px, transparent 1px),linear-gradient(90deg, hsl(var(--primary) / .06) 1px, transparent 1px) !important}');
    out.push(sel + ' ::-webkit-scrollbar-track{background:' + c.bg + '}' + sel + ' ::-webkit-scrollbar-thumb{background:rgba(' + prgb + ',.35)}');
    out.push(sel + ' ::selection{background:rgba(' + prgb + ',.35)}');
    out.push(sel + ' .cyber-btn-primary{color:hsl(var(--primary-foreground)) !important}');
    if (t.glass) {
      out.push(sel + ':not([data-tg-static]) .bg-card,' + sel + ':not([data-tg-static]) [class*="bg-card/"]{backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%)}');
    }
    if (t.bevel) {
      out.push(sel + ' .glass-card,' + sel + ':not([data-tg-static]) .rounded-2xl.border{box-shadow:inset 0 1px 0 rgba(255,255,255,.07), inset 0 -2px 0 rgba(0,0,0,.35), 0 18px 40px -22px rgba(' + prgb + ',.45) !important}');
    }
    if (t.light) {
      // Light theme: soft layered shadows instead of glow, darker neon text.
      out.push(sel + ' .neon-text,' + sel + ' .neon-text-green,' + sel + ' .neon-text-purple,' + sel + ' .neon-text-red,' + sel + ' .neon-text-orange{text-shadow:none !important}');
      out.push(sel + ' .glass-card,' + sel + ':not([data-tg-static]) .rounded-2xl.border,' + sel + ':not([data-tg-static]) .rounded-xl.border{box-shadow:0 1px 2px rgba(15,23,42,.06), 0 12px 32px -16px rgba(15,23,42,.25) !important}');
      out.push(sel + ':not([data-tg-static]) .text-white{color:hsl(var(--foreground)) !important}');
      // Static pages: their headers and a few panels use fixed dark colours.
      var ls = sel + '[data-tg-static] ';
      out.push(ls + 'nav,' + ls + '.topnav,' + ls + '.header{background:rgba(255,255,255,.9) !important;border-bottom:1px solid ' + c.border + ' !important;box-shadow:0 6px 24px -14px rgba(15,23,42,.25) !important}');
      out.push(ls + '.logo-text .name,' + ls + '.directory-toolbar .result-info{color:' + c.text + ' !important}');
      out.push(ls + '.logo-text .sub{color:' + c.primary + ' !important}' + ls + '.hdr-back{background:' + c.primary + ' !important;color:#fff !important}');
      out.push(ls + '.hero{color:' + c.text + ' !important}' + ls + '.hero-sub{color:' + c.muted + ' !important}');
      out.push(ls + '.stat{background:#fff !important;border-color:' + c.border + ' !important;box-shadow:0 10px 26px -16px rgba(15,23,42,.3)}');
      out.push(ls + '.stat-n{-webkit-text-fill-color:' + c.primary + ' !important;color:' + c.primary + ' !important}' + ls + '.stat-l{color:' + c.muted + ' !important}');
      out.push(ls + '.directory-toolbar{background:rgba(255,255,255,.96) !important;border-bottom-color:' + c.border + ' !important}');
      out.push(ls + '.portal-search{background:#fff !important;color:' + c.text + ' !important;border-color:' + c.border + ' !important}');
      out.push(ls + '.hub-disclaimer{background:#fff7e0 !important;color:#5e4b17 !important;border-color:#e2bd54 !important}');
      out.push(sel + ':not([data-tg-static]) .bg-primary .text-white,' + sel + ':not([data-tg-static]) [class*="bg-gradient"] .text-white,' + sel + ':not([data-tg-static]) .bg-destructive.text-white{color:#fff !important}');
    }
    // 3D: cards lift towards the viewer on hover.
    if (t.tilt && !reduceMotion) {
      out.push(sel + ' .glass-card,' + sel + ':not([data-tg-static]) .rounded-2xl.border,' + sel + ':not([data-tg-static]) .rounded-xl.border{transition:transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease;transform-style:preserve-3d;will-change:transform}');
    }
    if (t.crt) {
      out.push(sel + ' #tg-theme-fx::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 3px);mix-blend-mode:multiply}');
      out.push(sel + ' h1,' + sel + ' h2{text-shadow:0 0 12px rgba(' + prgb + ',.55), 0 2px 0 rgba(0,0,0,.6)}');
    }
    return out.join('\n');
  }

  function fxCss() {
    return [
      '#tg-theme-fx{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}',
      '#tg-theme-fx .grid{position:absolute;left:-50%;right:-50%;bottom:-10%;height:70%;transform-origin:50% 0;transform:perspective(520px) rotateX(64deg);',
      'background-image:linear-gradient(rgba(139,92,246,.55) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.45) 1px,transparent 1px);background-size:60px 60px;',
      '-webkit-mask-image:linear-gradient(to bottom,transparent,#000 35%,#000);mask-image:linear-gradient(to bottom,transparent,#000 35%,#000);opacity:.38;animation:tgGrid 4s linear infinite}',
      '#tg-theme-fx .sun{position:absolute;left:50%;top:22%;width:520px;height:520px;margin-left:-260px;border-radius:50%;background:radial-gradient(circle,rgba(244,114,182,.35),rgba(139,92,246,.12) 45%,transparent 70%);filter:blur(10px)}',
      '@keyframes tgGrid{to{background-position:0 60px,0 0}}',
      '#tg-theme-fx .blob{position:absolute;width:55vmax;height:55vmax;border-radius:50%;filter:blur(70px);opacity:.42;mix-blend-mode:screen}',
      '#tg-theme-fx .b1{background:#2dd4bf;left:-15vmax;top:-20vmax;animation:tgDrift1 26s ease-in-out infinite alternate}',
      '#tg-theme-fx .b2{background:#38bdf8;right:-20vmax;top:10vmax;animation:tgDrift2 32s ease-in-out infinite alternate}',
      '#tg-theme-fx .b3{background:#a3e635;left:20vmax;bottom:-30vmax;opacity:.22;animation:tgDrift3 38s ease-in-out infinite alternate}',
      '@keyframes tgDrift1{to{transform:translate3d(18vmax,12vmax,0) scale(1.15)}}',
      '@keyframes tgDrift2{to{transform:translate3d(-16vmax,8vmax,0) scale(.9)}}',
      '@keyframes tgDrift3{to{transform:translate3d(-10vmax,-14vmax,0) scale(1.2)}}',
      '#tg-theme-fx .rings{position:absolute;right:-12vmax;top:8vh;width:60vmax;height:60vmax;perspective:900px;opacity:.5}',
      '#tg-theme-fx .ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(245,165,36,.45);box-shadow:0 0 30px rgba(245,165,36,.12) inset}',
      '#tg-theme-fx .r1{animation:tgSpin1 40s linear infinite}#tg-theme-fx .r2{inset:9%;border-style:dashed;border-color:rgba(245,165,36,.35);animation:tgSpin2 55s linear infinite}',
      '#tg-theme-fx .r3{inset:20%;border-color:rgba(147,197,253,.35);animation:tgSpin3 70s linear infinite}#tg-theme-fx .r4{inset:34%;border-width:2px;border-color:rgba(245,165,36,.4);animation:tgSpin1 30s linear infinite reverse}',
      '@keyframes tgSpin1{from{transform:rotateX(68deg) rotateZ(0)}to{transform:rotateX(68deg) rotateZ(360deg)}}',
      '@keyframes tgSpin2{from{transform:rotateY(60deg) rotateZ(0)}to{transform:rotateY(60deg) rotateZ(-360deg)}}',
      '@keyframes tgSpin3{from{transform:rotateX(40deg) rotateY(30deg) rotateZ(0)}to{transform:rotateX(40deg) rotateY(30deg) rotateZ(360deg)}}',
      '#tg-theme-fx canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.28}',
      '#tg-theme-fx .shape{position:absolute;border-radius:28%;background:linear-gradient(145deg,rgba(255,255,255,.9),rgba(219,234,254,.55));box-shadow:0 30px 60px -20px rgba(11,99,229,.28),inset 0 1px 0 #fff;border:1px solid rgba(11,99,229,.12);transform-style:preserve-3d}',
      '#tg-theme-fx .s1{width:180px;height:180px;right:6%;top:18%;animation:tgFloat1 14s ease-in-out infinite alternate}',
      '#tg-theme-fx .s2{width:110px;height:110px;left:5%;top:52%;border-radius:50%;animation:tgFloat2 18s ease-in-out infinite alternate}',
      '#tg-theme-fx .s3{width:70px;height:70px;right:30%;bottom:8%;border-radius:18px;animation:tgFloat1 16s ease-in-out infinite alternate-reverse}',
      '@keyframes tgFloat1{from{transform:perspective(600px) rotateX(18deg) rotateY(-24deg) translateY(0)}to{transform:perspective(600px) rotateX(-12deg) rotateY(28deg) translateY(-40px)}}',
      '@keyframes tgFloat2{from{transform:translateY(0) scale(1)}to{transform:translateY(-50px) scale(1.08)}}',
      '@media (prefers-reduced-motion: reduce){#tg-theme-fx *{animation:none !important}}',
      '@media (max-width:640px){#tg-theme-fx .rings{opacity:.3}#tg-theme-fx .s1{width:110px;height:110px}}',
    ].join('\n');
  }

  var styleEl, fontEl, fxEl, matrixTimer;
  function ensureStyle() {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tg-theme-style';
      (document.head || root).appendChild(styleEl);
    }
  }
  function loadFont(t) {
    if (!t.fontUrl) { if (fontEl) fontEl.removeAttribute('href'); return; }
    if (!fontEl) {
      fontEl = document.createElement('link');
      fontEl.rel = 'stylesheet';
      (document.head || root).appendChild(fontEl);
    }
    var href = 'https://fonts.googleapis.com/css2?' + t.fontUrl + '&display=swap';
    if (fontEl.getAttribute('href') !== href) fontEl.setAttribute('href', href);
  }

  function startMatrix(canvas) {
    var ctx = canvas.getContext('2d');
    var chars = '01ABCDEF<>/{}#$%&TGSECURE'.split('');
    var size = 16, cols = 0, drops = [];
    function resize() {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / size); drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    }
    resize();
    window.addEventListener('resize', resize);
    matrixTimer = setInterval(function () {
      if (document.hidden) return;
      ctx.fillStyle = 'rgba(0,10,4,0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22ff88';
      ctx.font = size + 'px monospace';
      for (var i = 0; i < cols; i++) {
        ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, drops[i] * size);
        if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 60);
  }

  function renderFx(t) {
    if (!document.body) return;
    if (matrixTimer) { clearInterval(matrixTimer); matrixTimer = null; }
    if (!fxEl) {
      fxEl = document.createElement('div');
      fxEl.id = 'tg-theme-fx';
      fxEl.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(fxEl, document.body.firstChild);
    }
    fxEl.innerHTML = '';
    fxEl.style.display = t.fx ? '' : 'none';
    if (t.fx === 'grid') fxEl.innerHTML = '<div class="sun"></div><div class="grid"></div>';
    if (t.fx === 'aurora') fxEl.innerHTML = '<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>';
    if (t.fx === 'rings') fxEl.innerHTML = '<div class="rings"><div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div><div class="ring r4"></div></div>';
    if (t.fx === 'shapes') fxEl.innerHTML = '<div class="shape s1"></div><div class="shape s2"></div><div class="shape s3"></div>';
    if (t.fx === 'matrix') {
      var canvas = document.createElement('canvas');
      fxEl.appendChild(canvas);
      if (!reduceMotion) startMatrix(canvas);
    }
    // Hide the original theme's own 3D hero globe and matrix canvases behind a new theme's background.
    root.classList.toggle('tg-theme-custom', !t.original);
  }

  // Interactive 3D tilt: cards follow the pointer.
  var tiltOn = false;
  function tiltTarget(e) {
    var el = e.target && e.target.closest ? e.target.closest('.glass-card, [data-tg-static] .card, :root:not([data-tg-static]) .rounded-2xl.border') : null;
    return el && el.offsetWidth < 900 ? el : null;
  }
  document.addEventListener('pointermove', function (e) {
    if (!tiltOn || e.pointerType !== 'mouse') return;
    var el = tiltTarget(e);
    if (!el) return;
    var r = el.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = 'perspective(900px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg) translateZ(6px)';
    el.__tgTilt = true;
  }, { passive: true });
  document.addEventListener('pointerout', function (e) {
    var el = tiltTarget(e);
    if (el && el.__tgTilt && !el.contains(e.relatedTarget)) { el.style.transform = ''; el.__tgTilt = false; }
  }, { passive: true });

  function apply(id) {
    var t = byId[id] || byId[DEFAULT_ID];
    ensureStyle();
    if (current && current.id === t.id && styleEl.textContent) { renderFxWhenReady(t); return t.id; }
    current = t;
    root.setAttribute('data-tg-theme', t.id);
    styleEl.textContent = fxCss() + '\n' + themeCss(t) +
      '\n:root.tg-theme-custom:not([data-tg-static]) #home canvas{opacity:.35}';
    loadFont(t);
    tiltOn = !!t.tilt && !reduceMotion;
    renderFxWhenReady(t);
    try { localStorage.setItem(CACHE, t.id); } catch (e) {}
    window.dispatchEvent(new CustomEvent('tg-theme-changed', { detail: t.id }));
    return t.id;
  }
  function renderFxWhenReady(t) {
    if (document.body) renderFx(t);
    else document.addEventListener('DOMContentLoaded', function () { renderFx(current || t); }, { once: true });
  }

  var previewId = null;
  function load() {
    if (previewId) return Promise.resolve();
    return fetch('/api/settings.php?keys=tg_theme', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        var row = (rows || []).filter(function (x) { return x.key === 'tg_theme'; })[0];
        apply(row && typeof row.value === 'string' ? row.value : DEFAULT_ID);
      })
      .catch(function () {});
  }

  var cached = null;
  try { cached = localStorage.getItem(CACHE); } catch (e) {}
  apply(cached || DEFAULT_ID);
  load();
  setInterval(load, 15000);
  window.addEventListener('focus', load);

  window.tgTheme = {
    themes: THEMES.map(function (t) { return { id: t.id, name: t.name, tagline: t.tagline, swatch: t.swatch, fonts: t.fonts, light: !!t.light, original: !!t.original }; }),
    current: function () { return current ? current.id : DEFAULT_ID; },
    apply: function (id) { previewId = null; return apply(id); },
    /** Show a theme to this viewer only, until apply() or endPreview(). */
    preview: function (id) { previewId = id; return apply(id); },
    endPreview: function () { previewId = null; return load(); },
    refresh: load,
  };
})();
