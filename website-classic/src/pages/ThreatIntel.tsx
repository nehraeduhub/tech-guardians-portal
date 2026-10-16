import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Clock, ExternalLink, Globe, Loader2, Radar,
  RefreshCw, Search, Shield, ShieldAlert, Zap, Archive,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { newsUrl } from '@/lib/api';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeedItem {
  title: string;
  url: string;
  source: string;
  date?: string;
  summary?: string;
  severity?: string;
}

const SOURCE_COLOR: Record<string, string> = {
  'CISA': 'cyber-red',
  'NVD': 'cyber-orange',
  'CERT-In': 'cyber-blue',
  'Hacker News': 'cyber-green',
  'BleepingComputer': 'cyber-orange',
  'KrebsOnSecurity': 'cyber-purple',
  'Dark Reading': 'cyber-red',
  'SecurityWeek': 'cyber-blue',
  'SANS ISC': 'cyber-green',
  'Schneier': 'cyber-purple',
};
const colorOf = (s: string) => SOURCE_COLOR[s] || 'cyber-orange';

// Tailwind JIT safelist — keep literal class names so dynamic `text-${color}` etc compile:
// text-cyber-red text-cyber-orange text-cyber-blue text-cyber-green text-cyber-purple
// bg-cyber-red bg-cyber-orange bg-cyber-blue bg-cyber-green bg-cyber-purple
// bg-cyber-red/10 bg-cyber-orange/10 bg-cyber-blue/10 bg-cyber-green/10 bg-cyber-purple/10
// border-cyber-red/40 border-cyber-orange/40 border-cyber-blue/40 border-cyber-green/40 border-cyber-purple/40

const timeAgo = (iso?: string) => {
  if (!iso) return 'just now';
  const t = new Date(iso).getTime();
  if (!t) return iso.split(' ').slice(0, 4).join(' ');
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const sevColor = (sev?: string) => {
  const s = (sev || '').toUpperCase();
  return s === 'CRITICAL' ? 'cyber-red'
    : s === 'HIGH' ? 'cyber-orange'
    : s === 'MEDIUM' ? 'cyber-blue'
    : s === 'LOW' ? 'cyber-green'
    : 'muted-foreground';
};

const ThreatIntel = () => {
  const [q, setQ] = useState('');
  const [source, setSource] = useState<string>('all');

  useEffect(() => { document.title = 'Tech Guardians Intl Hub — Cyber Threat Intelligence'; }, []);

  const { data, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['threat-intel-feed'],
    queryFn: async (): Promise<FeedItem[]> => {
      const res = await fetch(newsUrl('global'));
      if (!res.ok) throw new Error(`Feed error ${res.status}`);
      const json = await res.json();
      return (json?.items as FeedItem[]) || [];
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: 2,
  });

  const items = useMemo(() => data || [], [data]);
  const sources = useMemo(() => Array.from(new Set(items.map(i => i.source))), [items]);

  const filtered = useMemo(() => items.filter(i => {
    if (source !== 'all' && i.source !== source) return false;
    if (!q) return true;
    const hay = (i.title + ' ' + (i.summary || '') + ' ' + i.source).toLowerCase();
    return hay.includes(q.toLowerCase());
  }), [items, q, source]);

  const liveItems = filtered.slice(0, 12);
  const archiveItems = filtered.slice(12);

  const stats = useMemo(() => {
    const critical = items.filter(i => i.severity?.toUpperCase() === 'CRITICAL').length;
    const high = items.filter(i => i.severity?.toUpperCase() === 'HIGH').length;
    return [
      { value: items.length.toString(), label: 'Active Threats', sub: 'Across all feeds', color: 'cyber-orange', icon: Shield },
      { value: critical.toString(), label: 'Critical', sub: 'Immediate attention', color: 'cyber-red', icon: AlertTriangle },
      { value: high.toString(), label: 'High Severity', sub: 'Elevated risk', color: 'cyber-orange', icon: Activity },
      { value: '30s', label: 'Last Refresh', sub: 'Auto-refreshing', color: 'cyber-blue', icon: Clock },
    ];
  }, [items]);

  return (
    <SiteFrame mainClassName="pt-24">
      {/* LIVE TICKER — top */}
      <section className="pt-2">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="overflow-hidden rounded-md border border-cyber-orange/30 bg-cyber-orange/5 relative">
            <div className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex items-center gap-2 shrink-0 text-[10px] font-display tracking-[0.2em] uppercase text-cyber-orange">
                <Zap className="w-3 h-3" />
                Live Alerts
              </span>
              <div className="flex-1 overflow-hidden relative">
                <motion.div
                  className="flex gap-10 whitespace-nowrap"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
                >
                  {[...items, ...items].slice(0, 50).map((n, i) => (
                    <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-foreground/80 hover:text-cyber-orange transition-colors shrink-0">
                      <span className={`mr-2 text-${sevColor(n.severity)} font-display tracking-wider`}>[{(n.severity || 'INFO').toUpperCase()}]</span>
                      {n.title}
                    </a>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="section-padding pb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-cyber-orange/10 blur-[140px]" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-orange/40 bg-cyber-orange/10 mb-6">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-cyber-orange opacity-75 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-cyber-orange" />
              </span>
              <span className="text-[11px] font-display tracking-[0.25em] uppercase text-cyber-orange">
                Real-Time Threat Intelligence Portal
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6" style={{ lineHeight: 1.04, textWrap: 'balance' }}>
              <span className="text-foreground">Tech Guardians</span>{' '}
              <span className="bg-gradient-to-r from-cyber-orange via-amber-400 to-cyber-orange bg-clip-text text-transparent">
                Intl Hub
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Live intelligence feeds from global security sources — CISA, NVD, CERT-In, BleepingComputer, KrebsOnSecurity, SANS ISC, Dark Reading, SecurityWeek and Schneier — aggregated and classified in real time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <a href="#threats" className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-cyber-orange text-background font-display text-sm font-semibold tracking-wide hover:bg-cyber-orange/90 transition-all shadow-lg shadow-cyber-orange/20">
                <Activity className="w-4 h-4" /> View Live Threats
              </a>
              <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border bg-muted/30 text-foreground font-display text-sm font-medium hover:border-cyber-orange/50 hover:text-cyber-orange transition-all">
                <Globe className="w-4 h-4" /> cybercrime.gov.in
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass-card p-5 text-left relative overflow-hidden">
                    <div className={`w-9 h-9 rounded-md border border-${s.color}/30 bg-${s.color}/10 flex items-center justify-center mb-3`}>
                      <Icon className={`w-4 h-4 text-${s.color}`} />
                    </div>
                    <div className={`font-display text-3xl font-bold text-${s.color} tabular-nums leading-none`}>{s.value}</div>
                    <div className="mt-2 text-sm font-medium text-foreground">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* LIVE FEED */}
      <section id="threats" className="section-padding pt-4">
        <div className="container mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyber-orange/10 border border-cyber-orange/30 flex items-center justify-center">
                  <Radar className="w-5 h-5 text-cyber-orange" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold">Live Threat Intelligence</h2>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1.5 text-cyber-green">
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="absolute inset-0 rounded-full bg-cyber-green opacity-75 animate-ping" />
                        <span className="relative w-1.5 h-1.5 rounded-full bg-cyber-green" />
                      </span>
                      Monitoring
                    </span>
                    <span>· {items.length} active threats</span>
                    {dataUpdatedAt ? <span>· updated {timeAgo(new Date(dataUpdatedAt).toISOString())}</span> : null}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search threats, CVEs..."
                    className="bg-muted/40 border border-border rounded-lg pl-9 pr-3 py-2 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-cyber-orange/50"
                  />
                </div>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyber-orange/50"
                >
                  <option value="all">All Sources</option>
                  {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-cyber-orange/40 bg-cyber-orange/10 text-cyber-orange hover:bg-cyber-orange/20 transition-all"
                >
                  {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Refresh
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Table-style feed */}
          <div className="glass-card overflow-hidden">
            <div className="hidden md:grid grid-cols-[110px_1fr_160px_120px] gap-4 px-5 py-3 border-b border-border/60 bg-muted/20 text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground">
              <div>Severity</div><div>Threat</div><div>Source</div><div>Time</div>
            </div>

            {liveItems.length === 0 && !isFetching && (
              <div className="p-10 text-center text-sm text-muted-foreground">No alerts match your filter.</div>
            )}

            {liveItems.map((n, i) => {
              const sc = sevColor(n.severity);
              const src = colorOf(n.source);
              return (
                <a
                  key={`${n.url}-${i}`}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-1 md:grid-cols-[110px_1fr_160px_120px] gap-2 md:gap-4 items-start px-5 py-4 border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors group"
                >
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-display tracking-wider uppercase border border-${sc}/40 bg-${sc}/10 text-${sc}`}>
                      {(n.severity || 'INFO').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground/95 leading-snug group-hover:text-cyber-orange transition-colors">
                      {n.title}
                    </h3>
                    {n.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{n.summary}</p>
                    )}
                  </div>
                  <div className={`text-xs text-${src} font-medium md:pt-0.5 flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-${src}`} />
                    {n.source}
                  </div>
                  <div className="text-xs text-muted-foreground md:pt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {timeAgo(n.date)}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              );
            })}

            {isFetching && liveItems.length === 0 && (
              <div className="flex items-center justify-center py-16 gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-cyber-orange" />
                Loading global threat intelligence...
              </div>
            )}
          </div>

          {/* ARCHIVE — scrollable older feeds */}
          {archiveItems.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center">
                  <Archive className="w-4 h-4 text-cyber-blue" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">Threat Archive</h3>
                  <p className="text-[11px] text-muted-foreground">{archiveItems.length} older advisories · scroll to explore</p>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <ScrollArea className="h-[480px]">
                  <div>
                    {archiveItems.map((n, i) => {
                      const sc = sevColor(n.severity);
                      const src = colorOf(n.source);
                      return (
                        <a
                          key={`arch-${n.url}-${i}`}
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid grid-cols-1 md:grid-cols-[90px_1fr_140px_110px] gap-2 md:gap-4 items-start px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors group"
                        >
                          <div>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-display tracking-wider uppercase border border-${sc}/40 bg-${sc}/10 text-${sc}`}>
                              {(n.severity || 'INFO').toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[13px] font-medium text-foreground/90 leading-snug group-hover:text-cyber-orange transition-colors line-clamp-2">
                              {n.title}
                            </h4>
                          </div>
                          <div className={`text-[11px] text-${src} font-medium flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-${src}`} />
                            {n.source}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {timeAgo(n.date)}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* footer info cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <Shield className="w-5 h-5 text-cyber-green mb-2" />
              <h4 className="text-sm font-semibold mb-1">Vetted Sources</h4>
              <p className="text-xs text-muted-foreground">Only official advisories and trusted security newsrooms — no rumors, no clickbait.</p>
            </div>
            <div className="glass-card p-5">
              <Activity className="w-5 h-5 text-cyber-blue mb-2" />
              <h4 className="text-sm font-semibold mb-1">Real-Time Refresh</h4>
              <p className="text-xs text-muted-foreground">Feed auto-refreshes every 30 seconds so analysts never miss a fresh CVE or breach.</p>
            </div>
            <div className="glass-card p-5">
              <ShieldAlert className="w-5 h-5 text-cyber-orange mb-2" />
              <h4 className="text-sm font-semibold mb-1">Severity Tagged</h4>
              <p className="text-xs text-muted-foreground">CVEs include CVSS severity (Critical / High / Medium / Low) for rapid triage.</p>
            </div>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
};

export default ThreatIntel;
