import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, Loader2, Lock, RefreshCw, Save, ShieldCheck, ShieldOff, Trash2, XCircle } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;
interface Config {
  waf: boolean; autoBan: boolean; threshold: number; windowMinutes: number; banMinutes: number[];
  allowIps: string[]; adminIps: string[]; behindCloudflare: boolean; trustedProxies: string[]; floodPerMinute: number;
}
interface Ban { ip: string; until: string; why: string; at: string; manual: boolean }
interface Overview {
  config: Config; counts: Record<string, number>; topIps: Record<string, number>; bans: Ban[]; myIp: string;
  totp: boolean; https: boolean; defaultAdminPassword: boolean; phpVersion: string; dataWritable: boolean;
}
interface LogRow { t: string; ip: string; type: string; detail: string; pts: number; path: string; m: string; ua: string }

const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const label = 'block text-xs font-semibold text-muted-foreground';
const TYPE_LABEL: Record<string, string> = {
  waf_block: 'Attack blocked', scanner: 'Scanner', trap: 'Trap hit', flood: 'Flood', ban: 'IP blocked', ban_manual: 'Blocked by admin', unban: 'IP unblocked',
  login_fail: 'Student login failed', login_ok: 'Student login', admin_login_fail: 'Admin login failed', admin_login_ok: 'Admin login', '2fa_fail': 'Wrong 2-step code',
  lockout: 'Lockout', rate_limit: 'Rate limit', csrf_block: 'Cross-site blocked', admin_ip_denied: 'Admin IP denied', admin_bruteforce: 'Guessing attack', audit: 'Admin action',
};
const BAD = new Set(['waf_block', 'scanner', 'trap', 'flood', 'ban', 'admin_login_fail', '2fa_fail', 'csrf_block', 'admin_ip_denied', 'admin_bruteforce', 'lockout']);
const tone = (t: string) => (BAD.has(t) ? 'border-red-500/40 bg-red-500/10 text-red-600' : t === 'audit' ? 'border-sky-500/40 bg-sky-500/10 text-sky-600' : 'border-border text-muted-foreground');
const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const lines = (v: string) => v.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);

type Tab = 'log' | 'blocked' | 'settings' | 'twostep';

/** Loads the QR-code script that ships with the site (public/js/vendor). */
const useQrScript = () => {
  const [ready, setReady] = useState(() => typeof (window as unknown as { qrcode?: unknown }).qrcode === 'function');
  useEffect(() => {
    if (ready) return;
    const s = document.createElement('script');
    s.src = '/js/vendor/qrcode-generator-1.4.4.js';
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, [ready]);
  return ready;
};

const TwoStep = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => {
  const qrReady = useQrScript();
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!setup || !qrReady || !box.current) return;
    const qr = (window as unknown as { qrcode: (t: number, l: string) => { addData: (d: string) => void; make: () => void; createSvgTag: (o: Record<string, unknown>) => string } }).qrcode(0, 'M');
    qr.addData(setup.uri); qr.make();
    box.current.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
  }, [setup, qrReady]);

  const start = async () => {
    setBusy(true); setMsg(null);
    try { setSetup(await apiPost<{ secret: string; uri: string }>('auth.php?action=totp_setup')); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'That did not work.' }); }
    finally { setBusy(false); }
  };
  const run = async (job: () => Promise<unknown>, ok: string) => {
    setBusy(true); setMsg(null);
    try { await job(); setMsg({ ok: true, text: ok }); setSetup(null); setCode(''); setPassword(''); onChange(); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'That did not work.' }); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/70 p-5">
      <h3 className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-primary" /> Two-step sign-in for the admin</h3>
      <p className="text-sm text-muted-foreground">After your password, the admin must enter a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy). Even if the password leaks, nobody can open the admin panel without your phone. Strongly recommended.</p>
      {!enabled && !setup && (
        <button disabled={busy} onClick={() => void start()} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Set up two-step sign-in</button>
      )}
      {setup && (
        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div ref={box} className="aspect-square w-full max-w-[220px] rounded-lg bg-white p-2" aria-label="QR code to scan with the authenticator app" />
          <div className="space-y-3 text-sm">
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Open the authenticator app and scan the QR code (or type the key below).</li>
              <li>Enter the 6-digit code the app shows, then press Turn on.</li>
            </ol>
            <p className="break-all font-mono text-xs">Key: <b>{setup.secret}</b></p>
            <div className="flex flex-wrap gap-2">
              <input className={`${input} max-w-[160px] text-center font-mono tracking-[0.3em]`} inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Code from the app" />
              <button disabled={busy || code.length !== 6} onClick={() => void run(() => apiPost('auth.php?action=totp_enable', { code }), 'Two-step sign-in is ON. From the next sign-in the code is asked.')} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Turn on</button>
            </div>
            <p className="text-xs text-amber-600">Keep the key somewhere safe. If you lose your phone and the key, remove <code>totp_on</code> from <code>api/data/admin.json</code> on the server (File Manager) to get back in.</p>
          </div>
        </div>
      )}
      {enabled && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Two-step sign-in is ON</p>
          <div className="flex flex-wrap gap-2">
            <input className={`${input} max-w-[200px]`} type="password" autoComplete="current-password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Admin password" />
            <input className={`${input} max-w-[140px] text-center font-mono tracking-[0.3em]`} inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="Code from the app" />
            <button disabled={busy || !password || code.length !== 6} onClick={() => void run(() => apiPost('auth.php?action=totp_disable', { password, code }), 'Two-step sign-in is OFF.')} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">Turn off</button>
          </div>
        </div>
      )}
      {msg && msg.text && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-destructive'}`}>{msg.text}</p>}
    </div>
  );
};

/** Manage → Security: protection status, attack log, blocked IPs, settings and the admin's two-step sign-in. */
const SecurityAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [o, setO] = useState<Overview | null>(null);
  const [cfg, setCfg] = useState<Config | null>(null);
  const [tab, setTab] = useState<Tab>('log');
  const [rows, setRows] = useState<LogRow[]>([]);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [banIp, setBanIp] = useState('');
  const [banMin, setBanMin] = useState('1440');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    apiGet<Overview>('security-admin.php?action=overview').then((d) => { setO(d); setCfg((c) => c ?? d.config); setError(''); }, (e: Error) => setError(e.message));
  }, []);
  const loadLog = useCallback(() => {
    setLoading(true);
    apiGet<{ rows: LogRow[] }>(`security-admin.php?action=log&limit=300&type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`)
      .then((d) => setRows(d.rows), (e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [type, q]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = window.setTimeout(loadLog, 250); return () => window.clearTimeout(t); }, [loadLog]);

  if (!o || !cfg) return <p className="flex items-center gap-2 text-sm text-muted-foreground">{error || <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>}</p>;
  const c = o.counts;
  const attacks = (c.waf_block || 0) + (c.scanner || 0) + (c.trap || 0) + (c.flood || 0) + (c.csrf_block || 0);
  const failed = (c.login_fail || 0) + (c.admin_login_fail || 0) + (c['2fa_fail'] || 0);
  const checks: [boolean, string, string][] = [
    [o.https, 'Website opens on HTTPS', 'Turn on "Force HTTPS" and the free SSL in Hostinger.'],
    [!o.defaultAdminPassword, 'Admin password was changed', 'Manage → Admin Password.'],
    [o.totp, 'Two-step sign-in for admin is on', 'Open the "Two-step sign-in" tab below.'],
    [o.config.waf, 'Attack filter (WAF) is on', 'Turn it on in Settings.'],
    [o.config.autoBan, 'Automatic blocking is on', 'Turn it on in Settings.'],
    [o.dataWritable, 'Data folder is writable (logs and blocks can be saved)', 'Make api/data writable in Hostinger File Manager.'],
    [parseFloat(o.phpVersion) >= 8.1, `PHP ${o.phpVersion} is supported`, 'Choose PHP 8.2 or newer in Hostinger → PHP Configuration.'],
  ];
  const save = () => {
    setError('');
    void onPublish(apiPost('security-admin.php?action=settings', cfg), load);
  };
  const ban = (ip: string, minutes: number, why = '') => void onPublish(apiPost('security-admin.php?action=ban', { ip, minutes, why }), () => { load(); loadLog(); });
  const unban = (ip: string) => void onPublish(apiPost('security-admin.php?action=unban', { ip }), () => { load(); loadLog(); });
  const exportBans = () => {
    const text = o.bans.map((b) => b.ip).join('\n');
    const url = URL.createObjectURL(new Blob([text || '# no blocked IPs'], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = 'tech-guardians-blocked-ips.txt'; a.click(); URL.revokeObjectURL(url);
  };
  const TABS: [Tab, string][] = [['log', 'Security log'], ['blocked', `Blocked IPs (${o.bans.length})`], ['settings', 'Settings'], ['twostep', 'Two-step sign-in']];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><ShieldCheck className="h-5 w-5 text-primary" /> Security Center</h2>
        <p className="text-sm text-muted-foreground">Every request to the website's API is checked. Attack patterns are blocked, scanners and probes are caught by traps, and an address that keeps misbehaving is blocked automatically for longer each time. Everything is written to the log below.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {([[attacks, 'Attacks stopped (24 h)', attacks ? 'text-red-600' : ''], [failed, 'Failed sign-ins (24 h)', failed > 10 ? 'text-amber-600' : ''], [o.bans.length, 'IPs blocked now', ''], [c.audit || 0, 'Admin actions (24 h)', '']] as const).map(([n, l, cls]) => (
          <div key={l} className="rounded-xl border border-border bg-card/70 p-4"><b className={`block text-2xl tabular-nums ${cls}`}>{n}</b><span className="text-xs text-muted-foreground">{l}</span></div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-semibold">Security checklist</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {checks.map(([ok, t, hint]) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />}
              <span><span className={ok ? '' : 'font-semibold'}>{t}</span>{!ok && <span className="block text-xs text-muted-foreground">{hint}</span>}</span>
            </li>
          ))}
        </ul>
        {Object.keys(o.topIps).length > 0 && <p className="mt-4 text-xs text-muted-foreground">Most active addresses today: {Object.entries(o.topIps).map(([ip, n]) => `${ip} (${n})`).join(' · ')}</p>}
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map(([id, text]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>{text}</button>
        ))}
      </div>

      {tab === 'log' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select className={`${input} w-auto`} value={type} onChange={(e) => setType(e.target.value)} aria-label="Event type">
              <option value="">All events</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className={`${input} max-w-xs`} placeholder="Search IP, path, detail…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the log" />
            <button onClick={() => { load(); loadLog(); }} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
            <button onClick={() => { if (window.confirm('Clear the whole security log?')) void onPublish(apiPost('security-admin.php?action=clear_log'), () => { load(); loadLog(); }); }} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /> Clear log</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground"><tr><th className="px-3 py-2">Time</th><th className="px-3 py-2">Event</th><th className="px-3 py-2">IP</th><th className="px-3 py-2">Details</th><th className="px-3 py-2" /></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Nothing logged yet.</td></tr>}
                {rows.map((r, i) => (
                  <tr key={`${r.t}-${i}`} className="border-t border-border align-top">
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{when(r.t)}</td>
                    <td className="px-3 py-2"><span className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-semibold ${tone(r.type)}`}>{TYPE_LABEL[r.type] || r.type}</span>{r.pts > 0 && <span className="ml-1 text-muted-foreground">+{r.pts}</span>}</td>
                    <td className="px-3 py-2 font-mono">{r.ip}</td>
                    <td className="max-w-[420px] break-words px-3 py-2">{r.detail}{r.path && <span className="block text-muted-foreground">{r.m} {r.path}</span>}{r.ua && BAD.has(r.type) && <span className="block truncate text-muted-foreground" title={r.ua}>{r.ua}</span>}</td>
                    <td className="px-3 py-2">{BAD.has(r.type) && r.ip !== o.myIp && <button onClick={() => ban(r.ip, 1440, 'blocked from the log')} className="whitespace-nowrap rounded-md border border-border px-2 py-1 hover:bg-muted">Block 24 h</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'blocked' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <label className="space-y-1"><span className={label}>Block an IP address</span><input className={`${input} w-56 font-mono`} placeholder="203.0.113.7" value={banIp} onChange={(e) => setBanIp(e.target.value.trim())} /></label>
            <label className="space-y-1"><span className={label}>For (minutes)</span><input className={`${input} w-28`} inputMode="numeric" value={banMin} onChange={(e) => setBanMin(e.target.value.replace(/\D/g, ''))} /></label>
            <button disabled={!banIp} onClick={() => { ban(banIp, Number(banMin) || 1440); setBanIp(''); }} className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-5 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50"><ShieldOff className="h-4 w-4" /> Block</button>
            <button onClick={exportBans} disabled={!o.bans.length} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"><Download className="h-4 w-4" /> Export list</button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground"><tr><th className="px-3 py-2">IP</th><th className="px-3 py-2">Why</th><th className="px-3 py-2">Blocked until</th><th className="px-3 py-2" /></tr></thead>
              <tbody>
                {o.bans.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No address is blocked right now.</td></tr>}
                {o.bans.map((b) => (
                  <tr key={b.ip} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">{b.ip}</td>
                    <td className="px-3 py-2">{b.why}{b.manual && <span className="ml-1 text-muted-foreground">(by admin)</span>}</td>
                    <td className="whitespace-nowrap px-3 py-2">{when(b.until)}</td>
                    <td className="px-3 py-2"><button onClick={() => unban(b.ip)} className="rounded-md border border-border px-2 py-1 hover:bg-muted">Unblock</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Blocks apply to the website's API, sign-in and payment pages. To also block an address from every page, add it in Hostinger → Security → IP Manager (use "Export list").</p>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-5 rounded-xl border border-border bg-card/70 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-primary" checked={cfg.waf} onChange={(e) => setCfg({ ...cfg, waf: e.target.checked })} /><span><b>Attack filter (WAF)</b><span className="block text-xs text-muted-foreground">Blocks SQL injection, script injection, path traversal, command injection and scanners.</span></span></label>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-primary" checked={cfg.autoBan} onChange={(e) => setCfg({ ...cfg, autoBan: e.target.checked })} /><span><b>Block automatically</b><span className="block text-xs text-muted-foreground">An address that collects too many points is blocked for longer each time.</span></span></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1"><span className={label}>Points that cause a block</span><input className={input} inputMode="numeric" value={String(cfg.threshold)} onChange={(e) => setCfg({ ...cfg, threshold: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></label>
            <label className="space-y-1"><span className={label}>…within (minutes)</span><input className={input} inputMode="numeric" value={String(cfg.windowMinutes)} onChange={(e) => setCfg({ ...cfg, windowMinutes: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></label>
            <label className="space-y-1"><span className={label}>API requests per minute per IP</span><input className={input} inputMode="numeric" value={String(cfg.floodPerMinute)} onChange={(e) => setCfg({ ...cfg, floodPerMinute: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></label>
          </div>
          <label className="block space-y-1"><span className={label}>Block lengths in minutes: 1st, 2nd, 3rd, 4th time (comma separated)</span><input className={input} value={cfg.banMinutes.join(', ')} onChange={(e) => setCfg({ ...cfg, banMinutes: lines(e.target.value).map(Number).filter((n) => n > 0) })} /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1"><span className={label}>Never block these IPs (your office / home) — one per line</span><textarea className={`${input} min-h-[80px] font-mono`} value={cfg.allowIps.join('\n')} onChange={(e) => setCfg({ ...cfg, allowIps: lines(e.target.value) })} /></label>
            <label className="space-y-1"><span className={label}>Only these IPs may sign in as admin (empty = anywhere)</span><textarea className={`${input} min-h-[80px] font-mono`} value={cfg.adminIps.join('\n')} onChange={(e) => setCfg({ ...cfg, adminIps: lines(e.target.value) })} /></label>
          </div>
          <p className="text-xs text-muted-foreground">Your address now: <b className="font-mono">{o.myIp}</b>{' '}
            <button type="button" className="ml-1 underline" onClick={() => setCfg({ ...cfg, allowIps: Array.from(new Set([...cfg.allowIps, o.myIp])) })}>never block it</button> ·{' '}
            <button type="button" className="underline" onClick={() => setCfg({ ...cfg, adminIps: Array.from(new Set([...cfg.adminIps, o.myIp])) })}>allow it for admin</button>.
            Home internet addresses change; use the admin allow-list only with a fixed IP. If you ever lock yourself out, delete <code>api/data/security-config.json</code> in Hostinger File Manager.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-primary" checked={cfg.behindCloudflare} onChange={(e) => setCfg({ ...cfg, behindCloudflare: e.target.checked })} /><span><b>The domain is behind Cloudflare</b><span className="block text-xs text-muted-foreground">Turn on only if you use Cloudflare's proxy (orange cloud), so visitors' real addresses are used. Leave off otherwise.</span></span></label>
            <label className="space-y-1"><span className={label}>Other trusted proxy IPs (rare) — one per line</span><textarea className={`${input} min-h-[60px] font-mono`} value={cfg.trustedProxies.join('\n')} onChange={(e) => setCfg({ ...cfg, trustedProxies: lines(e.target.value) })} /></label>
          </div>
          <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Save security settings</button>
        </div>
      )}

      {tab === 'twostep' && <TwoStep enabled={o.totp} onChange={load} />}

      {(!o.https || o.defaultAdminPassword) && (
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-600"><AlertTriangle className="h-4 w-4" /> Fix the red items in the checklist first.</p>
      )}
    </div>
  );
};

export default SecurityAdmin;
