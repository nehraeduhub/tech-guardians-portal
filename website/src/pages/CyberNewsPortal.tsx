import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, ArrowRight, Clock, ExternalLink, Flame, Globe2, LayoutGrid, List, Loader2, Newspaper,
  Phone, RefreshCw, Search, ShieldAlert, ShieldCheck, Siren, X,
} from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import { newsUrl } from '@/lib/api';
import { NEWS_ALERTS, useList } from '@/lib/content-lists';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  date?: string;
  summary?: string;
  image?: string;
  category?: string;
  severity?: string;
}

type Desk = 'india' | 'global' | 'advisories';
const DESKS: { id: Desk; label: string; hint: string; icon: typeof Newspaper }[] = [
  { id: 'india', label: 'India Cyber Crime', hint: 'Fraud, scams, breaches and arrests reported across India', icon: Siren },
  { id: 'global', label: 'Global Threats', hint: 'Attacks, malware and breaches from the world’s security press', icon: Globe2 },
  { id: 'advisories', label: 'Advisories & CVEs', hint: 'Official alerts from CERT-In, CISA and new vulnerabilities from NVD', icon: ShieldAlert },
];
const ADVISORY_SOURCES = ['CERT-In', 'CISA', 'NVD', 'SANS ISC'];

// Literal class names so Tailwind keeps them.
const LEVEL: Record<string, { box: string; text: string; dot: string }> = {
  Critical: { box: 'border-red-500/45 bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  High: { box: 'border-orange-500/45 bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  Advisory: { box: 'border-sky-500/45 bg-sky-500/10', text: 'text-sky-400', dot: 'bg-sky-500' },
  Info: { box: 'border-emerald-500/45 bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
};
const SEVERITY: Record<string, string> = {
  CRITICAL: 'border-red-500/50 bg-red-500/15 text-red-400',
  HIGH: 'border-orange-500/50 bg-orange-500/15 text-orange-400',
  MEDIUM: 'border-amber-500/50 bg-amber-500/15 text-amber-400',
  LOW: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400',
};
const TOPICS = ['UPI', 'Digital arrest', 'Phishing', 'Ransomware', 'Data breach', 'Loan app', 'OTP', 'KYC', 'Sextortion', 'Deepfake', 'Crypto',
  'Investment', 'Aadhaar', 'Malware', 'Hacker', 'Bank', 'Arrest', 'Police', 'AI', 'Vulnerability', 'Zero-day', 'Scam', 'Fraud', 'Cyber cell'];

const timeAgo = (iso?: string) => {
  if (!iso) return 'recent';
  const t = new Date(iso).getTime();
  if (!t) return iso.split(' ').slice(0, 4).join(' ');
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} d ago`;
};

const loadFeed = async (feed: 'india' | 'global') => {
  const res = await fetch(newsUrl(feed), { cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `News could not be loaded (${res.status})`);
  return { items: (data?.items ?? []) as NewsItem[], fetchedAt: (data?.fetched_at as string) || '' };
};

const Thumb = ({ item, className = '' }: { item: NewsItem; className?: string }) => (
  <div className={`relative overflow-hidden bg-muted/40 ${className}`}>
    <div aria-hidden className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_25%_25%,hsl(var(--primary)/0.28),transparent_60%),radial-gradient(circle_at_80%_80%,hsl(var(--cyber-green)/0.18),transparent_55%)]">
      <span className="font-display text-3xl font-bold text-foreground/25">{item.source.slice(0, 2).toUpperCase()}</span>
    </div>
    {item.image ? (
      <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
    ) : null}
  </div>
);

const Meta = ({ item }: { item: NewsItem }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
    <span className="font-semibold text-foreground/80">{item.source}</span>
    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(item.date)}</span>
    {item.severity && <span className={`rounded border px-1.5 py-px text-[10px] font-bold ${SEVERITY[item.severity.toUpperCase()] || 'border-border'}`}>{item.severity}</span>}
  </div>
);

const Tag = ({ text }: { text?: string }) => (text ? <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{text}</span> : null);

const CyberNewsPortal = () => {
  const [desk, setDesk] = useState<Desk>('india');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [source, setSource] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [limit, setLimit] = useState(18);
  const alerts = (useList(NEWS_ALERTS) ?? NEWS_ALERTS.seed ?? []).filter((a) => a.visible && a.title);

  const india = useQuery({ queryKey: ['news', 'india'], queryFn: () => loadFeed('india'), refetchInterval: 300000, staleTime: 60000 });
  const global = useQuery({ queryKey: ['news', 'global'], queryFn: () => loadFeed('global'), refetchInterval: 300000, staleTime: 60000 });
  const active = desk === 'india' ? india : global;

  const deskItems = useMemo(() => {
    if (desk === 'india') return india.data?.items ?? [];
    const all = global.data?.items ?? [];
    return desk === 'advisories' ? all.filter((i) => ADVISORY_SOURCES.includes(i.source)) : all.filter((i) => i.source !== 'NVD');
  }, [desk, india.data, global.data]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(deskItems.map((i) => i.category).filter(Boolean) as string[]))], [deskItems]);
  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    deskItems.forEach((i) => counts.set(i.source, (counts.get(i.source) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [deskItems]);
  const topics = useMemo(() => {
    const text = deskItems.map((i) => `${i.title} ${i.summary || ''}`.toLowerCase()).join(' \n ');
    return TOPICS.map((t) => [t, text.split(t.toLowerCase()).length - 1] as const).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [deskItems]);

  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return deskItems.filter((i) => (cat === 'All' || i.category === cat) && (!source || i.source === source)
      && words.every((w) => `${i.title} ${i.summary || ''} ${i.source} ${i.category || ''}`.toLowerCase().includes(w)));
  }, [deskItems, q, cat, source]);

  const filtering = q.trim() !== '' || cat !== 'All' || source !== '';
  const lead = filtering ? undefined : filtered[0];
  const seconds = filtering ? [] : filtered.slice(1, 3);
  const latest = filtering ? filtered : filtered.slice(3);
  const ticker = (india.data?.items ?? []).slice(0, 12);
  const updated = active.data?.fetchedAt ? new Date(active.data.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const switchDesk = (d: Desk) => { setDesk(d); setCat('All'); setSource(''); setLimit(18); };
  const clear = () => { setQ(''); setCat('All'); setSource(''); };

  return (
    <SiteFrame>
      {/* Breaking ticker */}
      {ticker.length > 0 && (
        <div className="border-y border-border/60 bg-card/80">
          <div className="container mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
            </span>
            <div className="tg-ticker relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
              <div className="tg-ticker-track flex w-max gap-10 whitespace-nowrap text-sm">
                {[...ticker, ...ticker].map((n, i) => (
                  <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="text-foreground/85 hover:text-primary" aria-hidden={i >= ticker.length || undefined} tabIndex={i >= ticker.length ? -1 : undefined}>
                    <span className="mr-2 text-primary">■</span>{n.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Masthead */}
      <header className="border-b border-border/60 pb-6 pt-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Tech Guardians · News Desk</p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight md:text-5xl" style={{ textWrap: 'balance' }}>Cyber News Portal</h1>
              <p className="mt-2 text-sm text-muted-foreground">{today} · India’s cyber crime, threat and advisory headlines in one place</p>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[['Stories', String(deskItems.length || '—')], ['Sources', String(sources.length || '—')], ['Updated', updated || '—']].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border bg-card/70 px-4 py-2">
                  <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                  <dd className="font-display text-lg font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border" aria-label="News desks">
            {DESKS.map((d) => (
              <button key={d.id} onClick={() => switchDesk(d.id)} aria-current={desk === d.id ? 'page' : undefined}
                className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${desk === d.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <d.icon className="h-4 w-4" /> {d.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${DESKS.find((d) => d.id === desk)?.label.toLowerCase()} — e.g. UPI, ransomware, Jaipur`}
                className="w-full rounded-lg border border-border bg-muted/30 py-2.5 pl-10 pr-3 text-sm focus:border-primary focus:outline-none" />
            </label>
            <div className="flex gap-2">
              <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Layout">
                <button onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view" className={`rounded-md p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view" className={`rounded-md p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><List className="h-4 w-4" /></button>
              </div>
              <button onClick={() => void active.refetch()} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
                {active.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh
              </button>
            </div>
          </div>

          {categories.length > 2 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${cat === c ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>{c}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Admin alerts */}
        {alerts.length > 0 && (
          <section aria-label="Tech Guardians alerts" className="mb-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((a) => {
              const lv = LEVEL[String(a.level)] || LEVEL.Info;
              return (
                <article key={a.id} className={`rounded-xl border p-4 ${lv.box}`}>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                    <span className={`h-2 w-2 rounded-full ${lv.dot}`} /><span className={lv.text}>{String(a.level || 'Info')} alert</span>
                    {a.date && <span className="ml-auto font-medium normal-case tracking-normal text-muted-foreground">{String(a.date)}</span>}
                  </div>
                  <h2 className="mt-2 font-semibold leading-snug">{String(a.title)}</h2>
                  {a.body && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{String(a.body)}</p>}
                  {/^https?:\/\//.test(String(a.link || '')) && (
                    <a href={String(a.link)} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${lv.text}`}>Read more <ArrowRight className="h-3 w-3" /></a>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0">
            {active.isLoading && <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading the latest headlines…</div>}
            {active.isError && !deskItems.length && <p className="rounded-xl border border-destructive/40 p-6 text-sm text-destructive">{(active.error as Error).message}</p>}

            {filtering && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{filtered.length} stories</span>
                {source && <span className="rounded-full border border-border px-2 py-0.5 text-xs">Source: {source}</span>}
                <button onClick={clear} className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><X className="h-3 w-3" /> Clear filters</button>
              </div>
            )}

            {!active.isLoading && filtered.length === 0 && deskItems.length > 0 && (
              <div className="py-20 text-center text-muted-foreground"><ShieldAlert className="mx-auto mb-3 h-8 w-8" />No stories match. <button onClick={clear} className="font-semibold text-primary">Clear filters</button></div>
            )}

            {lead && (
              <section className="mb-8 grid gap-5 md:grid-cols-[1.35fr_1fr]">
                <a href={lead.url} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border border-border bg-card/70 transition-colors hover:border-primary/50">
                  <Thumb item={lead} className="aspect-[16/9]" />
                  <div className="p-5">
                    <div className="flex items-center gap-2"><span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">Top story</span><Tag text={lead.category} /></div>
                    <h2 className="mt-3 font-display text-xl font-bold leading-snug group-hover:text-primary md:text-2xl" style={{ textWrap: 'balance' }}>{lead.title}</h2>
                    {lead.summary && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{lead.summary}</p>}
                    <div className="mt-4"><Meta item={lead} /></div>
                  </div>
                </a>
                <div className="grid gap-5">
                  {seconds.map((n) => (
                    <a key={n.url} href={n.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/70 transition-colors hover:border-primary/50">
                      <Thumb item={n} className="aspect-[21/9]" />
                      <div className="p-4">
                        <Tag text={n.category} />
                        <h3 className="mt-1 line-clamp-3 font-semibold leading-snug group-hover:text-primary">{n.title}</h3>
                        <div className="mt-2"><Meta item={n} /></div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {latest.length > 0 && (
              <section>
                {!filtering && <h2 className="mb-4 flex items-center gap-2 border-b border-border pb-2 font-display text-lg font-bold"><Newspaper className="h-5 w-5 text-primary" /> Latest</h2>}
                {view === 'grid' ? (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {latest.slice(0, limit).map((n, i) => (
                      <a key={`${n.url}-${i}`} href={n.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card/60 transition-colors hover:border-primary/50">
                        <Thumb item={n} className="aspect-[16/9]" />
                        <div className="flex flex-1 flex-col p-4">
                          <Tag text={n.category} />
                          <h3 className="mt-1 line-clamp-3 text-[15px] font-semibold leading-snug group-hover:text-primary">{n.title}</h3>
                          {n.summary && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{n.summary}</p>}
                          <div className="mt-auto pt-3"><Meta item={n} /></div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y divide-border rounded-xl border border-border bg-card/60">
                    {latest.slice(0, limit).map((n, i) => (
                      <li key={`${n.url}-${i}`}>
                        <a href={n.url} target="_blank" rel="noopener noreferrer" className="group flex gap-4 p-4 hover:bg-muted/30">
                          <Thumb item={n} className="hidden h-20 w-32 shrink-0 rounded-lg sm:block" />
                          <div className="min-w-0">
                            <Tag text={n.category} />
                            <h3 className="font-semibold leading-snug group-hover:text-primary">{n.title}</h3>
                            {n.summary && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.summary}</p>}
                            <div className="mt-2"><Meta item={n} /></div>
                          </div>
                          <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {latest.length > limit && (
                  <div className="mt-6 text-center">
                    <button onClick={() => setLimit((l) => l + 18)} className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted">Show more stories ({latest.length - limit} left)</button>
                  </div>
                )}
              </section>
            )}
          </main>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
              <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-5 w-5 text-red-400" /> Victim of cyber fraud?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Report within the first hour so the bank can freeze the money.</p>
              <a href="tel:1930" className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 font-display text-lg font-bold text-white hover:bg-red-500"><Phone className="h-4 w-4" /> Call 1930</a>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-background/60 px-2 py-2 text-center font-semibold hover:bg-muted">cybercrime.gov.in</a>
                <a href="/cyber-crime-support" className="rounded-lg border border-border bg-background/60 px-2 py-2 text-center font-semibold hover:bg-muted">Get our help</a>
              </div>
            </section>

            {filtered.length > 1 && !filtering && (
              <section className="rounded-2xl border border-border bg-card/70 p-5">
                <h2 className="flex items-center gap-2 font-semibold"><Flame className="h-5 w-5 text-orange-400" /> Top headlines</h2>
                <ol className="mt-3 space-y-3">
                  {filtered.slice(0, 5).map((n, i) => (
                    <li key={n.url} className="flex gap-3">
                      <span className="font-display text-2xl font-bold leading-none text-primary/60 tabular-nums">{i + 1}</span>
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium leading-snug hover:text-primary">{n.title}<span className="mt-1 block text-[11px] text-muted-foreground">{n.source} · {timeAgo(n.date)}</span></a>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {topics.length > 0 && (
              <section className="rounded-2xl border border-border bg-card/70 p-5">
                <h2 className="font-semibold">Trending topics</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topics.map(([t, n]) => (
                    <button key={t} onClick={() => setQ(t)} className="rounded-full border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary">#{t} <span className="text-muted-foreground">{n}</span></button>
                  ))}
                </div>
              </section>
            )}

            {sources.length > 0 && (
              <section className="rounded-2xl border border-border bg-card/70 p-5">
                <h2 className="font-semibold">Sources</h2>
                <ul className="mt-3 space-y-1">
                  {sources.map(([s, n]) => (
                    <li key={s}>
                      <button onClick={() => setSource(source === s ? '' : s)} className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${source === s ? 'bg-primary/15 text-primary' : 'hover:bg-muted/50'}`}>
                        <span>{s}</span><span className="text-xs text-muted-foreground tabular-nums">{n}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-2xl border border-border bg-card/70 p-5 text-sm text-muted-foreground">
              <h2 className="flex items-center gap-2 font-semibold text-foreground"><ShieldCheck className="h-5 w-5 text-primary" /> About this desk</h2>
              <p className="mt-2">{DESKS.find((d) => d.id === desk)?.hint}. Headlines refresh every 5 minutes and open on the publisher’s website.</p>
            </section>
          </aside>
        </div>
      </div>
    </SiteFrame>
  );
};

export default CyberNewsPortal;
