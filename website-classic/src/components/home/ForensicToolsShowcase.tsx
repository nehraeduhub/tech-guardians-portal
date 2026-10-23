import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BadgeCheck, ExternalLink, Loader2, Radar, Search } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionHeading from '@/components/pro/SectionHeading';
import { readSetting } from '@/lib/shared-settings';
import { useLayout } from '@/lib/layout';

// A taste of the Cyber & Forensic Hub: one tool from each category.
// Uses the admin's list (Manage → Forensic Hub Tools) or the built-in one.

interface Cat { id: string; name: string; icon: string }
interface Tool { c: string; i: string; t: string; d: string; u: string; h?: string; g?: boolean; x?: boolean }
interface Data { cats: Cat[]; tools: Tool[] }

const HUB = '/forensic-engine.html';
const valid = (d: unknown): d is Data => !!d && Array.isArray((d as Data).cats) && Array.isArray((d as Data).tools);

const useForensicData = () => {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    const pick = () => {
      const own = readSetting<Data | null>('tg_forensic_tools', null);
      if (valid(own)) { setData(own); return true; }
      return false;
    };
    if (!pick()) fetch('/content/forensic-tools.json').then((r) => r.json()).then((d) => { if (valid(d)) setData((cur) => cur || d); }).catch(() => undefined);
    const refresh = () => { pick(); };
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  return data;
};

interface LookupResult { title: string; rows: [string, string][]; note?: string; links?: [string, string][] }
interface Engine { label: string; icon: string; placeholder: string; button: string; secret?: boolean; run: (v: string) => Promise<LookupResult> }
type Engines = Record<string, Engine>;
const ENGINE_ORDER = ['ip', 'dns', 'whois', 'spoof', 'password', 'ifsc', 'pin'];

/** Loads the shared lookup engines (/js/tg-lookups.js, also used by the Forensic Hub page). */
const useEngines = () => {
  const [engines, setEngines] = useState<Engines | null>(() => (window as unknown as { tgLookups?: Engines }).tgLookups || null);
  useEffect(() => {
    if (engines) return;
    const s = document.createElement('script');
    s.src = '/js/tg-lookups.js';
    s.async = true;
    s.onload = () => setEngines((window as unknown as { tgLookups?: Engines }).tgLookups || null);
    document.head.appendChild(s);
  }, [engines]);
  return engines;
};

/** Live lookup engines that run right on the homepage. */
const LiveLookups = () => {
  const engines = useEngines();
  const [key, setKey] = useState('ip');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState('');
  if (!engines) return null;
  const keys = ENGINE_ORDER.filter((k) => engines[k]);
  const e = engines[key] || engines[keys[0]];
  const pick = (k: string) => { setKey(k); setValue(''); setResult(null); setError(''); };
  const run = (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true); setError(''); setResult(null);
    e.run(value).then(setResult, (err: Error) => setError(err.message)).finally(() => setBusy(false));
  };

  return (
    <div className="mb-10 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#ff9933] bg-[hsl(var(--tg-navy))] px-5 py-3 text-white">
        <h3 className="flex items-center gap-2 text-base font-bold"><Radar className="h-5 w-5 text-[#ff9933]" /> Live lookup engines <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Free · no sign-up</span></h3>
        <a href={`${HUB}#cat=lookup`} className="text-xs font-semibold text-white/85 hover:text-white hover:underline">13 engines on the Hub →</a>
      </div>
      <div className="grid md:grid-cols-[15rem_1fr]">
        <div className="flex gap-1 overflow-x-auto border-b border-border p-2 md:flex-col md:overflow-visible md:border-b-0 md:border-r" role="tablist" aria-label="Choose a lookup">
          {keys.map((k) => (
            <button key={k} role="tab" aria-selected={k === key} onClick={() => pick(k)}
              className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition ${k === key ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>
              <span aria-hidden>{engines[k].icon}</span>{engines[k].label}
            </button>
          ))}
        </div>
        <div className="p-5">
          <form onSubmit={run} className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="tg-lookup-input">{e.label}</label>
            <input id="tg-lookup-input" type={e.secret ? 'password' : 'text'} autoComplete="off" value={value} onChange={(x) => setValue(x.target.value)} placeholder={e.placeholder}
              className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {e.button}
            </button>
          </form>
          <div className="mt-4 min-h-[7rem]" aria-live="polite">
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
            {result && (
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="font-bold text-primary">{result.title}</p>
                <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[11rem_1fr]">
                  {result.rows.map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="break-words font-medium text-foreground">{v}</dd></div>
                  ))}
                </dl>
                {result.note && <p className="mt-3 text-xs text-muted-foreground">{result.note}</p>}
                {result.links?.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">{label} <ExternalLink className="h-3 w-3" /></a>)}
              </div>
            )}
            {!error && !result && !busy && <p className="text-sm text-muted-foreground">Results appear here. Lookups use free public services; nothing you type is stored by Tech Guardians.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ForensicToolsShowcase = () => {
  const layout = useLayout();
  const data = useForensicData();
  if (layout.hiddenPages.includes(HUB) || !data) return null;
  const tools = data.tools.filter((t) => t.t && t.u && !t.x);
  const featured = data.cats.map((c) => tools.find((t) => t.c === c.id)).filter((t): t is Tool => !!t).slice(0, 8);
  if (!featured.length) return null;
  const catName = (id: string) => data.cats.find((c) => c.id === id)?.name || '';

  return (
    <section id="forensic-tools" className="tg-section relative">
      <div className="tg-container">
        <SectionHeading center={false} eyebrow="Cyber & Forensic Hub" title="Live lookups & forensic tools"
          lead={`Run instant checks right here, or browse ${tools.length} verified tools for citizens, investigators and analysts — complaint portals, breach checks, deepfake detection, OSINT and more.`}
          action={<a href={HUB} className="cyber-btn-primary">View all {tools.length} tools <ArrowRight className="h-4 w-4" /></a>} />

        <LiveLookups />

        <div className="mb-6 flex flex-wrap gap-2">
          {data.cats.map((c) => (
            <a key={c.id} href={`${HUB}#cat=${c.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary">
              <span aria-hidden>{c.icon}</span>{c.name}
              <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">{tools.filter((t) => t.c === c.id).length}</span>
            </a>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t, i) => (
            <ScrollReveal key={t.u} delay={(i % 4) * 0.05} className="h-full">
              <a href={t.u} target="_blank" rel="noopener noreferrer" className="tg-card group flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-2xl" aria-hidden>{t.i}</span>
                  {t.g && <span className="inline-flex items-center gap-1 rounded bg-[#138808]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#138808]"><BadgeCheck className="h-3 w-3" />Official</span>}
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-accent">{catName(t.c)}</p>
                <h3 className="mt-1 font-bold leading-snug text-foreground group-hover:text-primary">{t.t}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{t.d}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-primary">Open {t.h || 'tool'} <ExternalLink className="h-3.5 w-3.5" /></span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForensicToolsShowcase;
