import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper, Clock, ExternalLink, Search, RefreshCw, Loader2, ShieldAlert, Filter, Globe2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SiteFrame from '@/components/SiteFrame';
import { newsUrl } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';


interface NewsItem {
  title: string;
  url: string;
  source: string;
  date?: string;
  summary?: string;
  image?: string;
  category?: string;
}

const timeAgo = (iso?: string) => {
  if (!iso) return 'recent';
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

const CATEGORY_TINT: Record<string, string> = {
  'Cyber Crime': 'cyber-red',
  'Cyber Fraud': 'cyber-orange',
  'Data Breach': 'cyber-red',
  'Ransomware': 'cyber-red',
  'UPI / Online Scam': 'cyber-orange',
  'Technology': 'cyber-blue',
  'Enterprise Cyber': 'cyber-blue',
  'CISO / Security': 'cyber-purple',
  'Cybersecurity': 'cyber-green',
  'Policy & Privacy': 'cyber-purple',
  'Advisory': 'cyber-green',
  'India': 'cyber-blue',
};
const tintOf = (c?: string) => CATEGORY_TINT[c || ''] || 'cyber-green';

// Tailwind JIT safelist — keep literal class names so dynamic `text-${tint}` etc compile:
// text-cyber-red text-cyber-orange text-cyber-blue text-cyber-green text-cyber-purple
// bg-cyber-red/10 bg-cyber-orange/10 bg-cyber-blue/10 bg-cyber-green/10 bg-cyber-purple/10
// bg-cyber-red/20 bg-cyber-orange/20 bg-cyber-blue/20 bg-cyber-green/20 bg-cyber-purple/20
// border-cyber-red/40 border-cyber-orange/40 border-cyber-blue/40 border-cyber-green/40 border-cyber-purple/40
// border-cyber-red/50 border-cyber-orange/50 border-cyber-blue/50 border-cyber-green/50 border-cyber-purple/50
// border-cyber-red/60 border-cyber-orange/60 border-cyber-blue/60 border-cyber-green/60 border-cyber-purple/60

async function loadNews(): Promise<NewsItem[]> {
  const res = await fetch(newsUrl('india'));
  if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);
  const data = await res.json();
  return (data?.items ?? []) as NewsItem[];
}

const CyberNewsPortal = () => {
  const [q, setQ] = useState('');
  const [activeCat, setActiveCat] = useState<string>('All');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['india-cyber-news'],
    queryFn: loadNews,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const items = data ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((i) => {
      if (activeCat !== 'All' && i.category !== activeCat) return false;
      if (!ql) return true;
      return (
        i.title.toLowerCase().includes(ql) ||
        (i.summary || '').toLowerCase().includes(ql) ||
        i.source.toLowerCase().includes(ql)
      );
    });
  }, [items, q, activeCat]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <SiteFrame>
      {/* HERO */}
      <section className="relative pt-28 pb-10 border-b border-border/40 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, hsl(var(--cyber-red)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyber-red/20 blur-[120px]" />
        <div aria-hidden className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyber-green/15 blur-[120px]" />

        <div className="container mx-auto max-w-6xl px-4 relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-cyber-red opacity-75 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-cyber-red" />
            </span>
            <span className="text-[10px] font-display tracking-[0.3em] uppercase text-cyber-red">
              Tech Guardians · India Cyber Crime Desk
            </span>
          </div>
          <h1
            className="font-display text-3xl md:text-5xl font-bold leading-[1.05] mb-4"
            style={{ textWrap: 'balance' }}
          >
            Cyber News Portal —{' '}
            <span className="bg-gradient-to-r from-cyber-red via-cyber-orange to-cyber-green bg-clip-text text-transparent">
              India Cyber Crime Daily
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
            Every cyber-crime incident, fraud, data-breach and advisory reported
            across India — aggregated in real time from The Hindu, Times of India,
            Hindustan Times, Indian Express, Economic Times, Inc42, MediaNama and
            CERT-In. Click any headline to open the full article on the publisher's
            site.
          </p>

          {/* Search + refresh */}
          <div className="mt-6 flex flex-col md:flex-row items-stretch gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search headlines, source, city…"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 text-sm focus:outline-none focus:border-cyber-green/60"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-cyber-green/40 bg-cyber-green/10 text-cyber-green text-xs font-display tracking-widest uppercase hover:bg-cyber-green/20 transition-colors"
            >
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>

          {/* Category chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {categories.map((c) => {
              const active = c === activeCat;
              const tint = c === 'All' ? 'cyber-green' : tintOf(c);
              return (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-display tracking-widest uppercase transition-colors ${
                    active
                      ? `bg-${tint}/20 border-${tint}/60 text-${tint}`
                      : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section-padding">
        <div className="container mx-auto max-w-6xl px-4">
          {isLoading && (
            <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading latest India cyber-crime news…
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">
              <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-cyber-orange" />
              No headlines matched your filters.
            </div>
          )}

          {/* Featured */}
          {featured && (
            <ScrollReveal>
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block mb-8 rounded-2xl border border-cyber-red/30 bg-gradient-to-br from-background via-card to-background overflow-hidden hover:border-cyber-red/60 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
                  <div className="p-6 md:p-8 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-display tracking-[0.3em] uppercase text-cyber-red">
                        Top Story
                      </span>
                      {featured.category && (
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-display tracking-widest uppercase bg-${tintOf(featured.category)}/10 border-${tintOf(featured.category)}/40 text-${tintOf(featured.category)}`}>
                          {featured.category}
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-xl md:text-2xl font-bold leading-snug group-hover:text-cyber-red transition-colors">
                      {featured.title}
                    </h2>
                    {featured.summary && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                        {featured.summary}
                      </p>
                    )}
                    <div className="mt-auto pt-5 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5" /> {featured.source}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {timeAgo(featured.date)}
                      </span>
                    </div>
                  </div>
                  <div className="relative min-h-[220px] bg-muted/30">
                    {featured.image ? (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 30% 30%, hsl(var(--cyber-red)/0.35), transparent 60%), radial-gradient(circle at 70% 70%, hsl(var(--cyber-green)/0.25), transparent 60%)',
                        }}
                      />
                    )}
                  </div>
                </div>
              </a>
            </ScrollReveal>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((n, i) => {
              const tint = tintOf(n.category);
              return (
                <motion.a
                  key={`${n.url}-${i}`}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 9) * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col rounded-xl border border-border/50 bg-card/60 hover:border-cyber-green/50 hover:bg-card transition-colors overflow-hidden"
                >
                  <div className="relative aspect-[16/9] bg-muted/30 overflow-hidden">
                    {n.image ? (
                      <img
                        src={n.image}
                        alt={n.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `radial-gradient(circle at 30% 30%, hsl(var(--${tint})/0.28), transparent 60%), radial-gradient(circle at 70% 70%, hsl(var(--cyber-green)/0.18), transparent 60%)`,
                        }}
                      />
                    )}
                    {n.category && (
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-display tracking-widest uppercase border bg-${tint}/20 border-${tint}/50 text-${tint} backdrop-blur-sm`}>
                        {n.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-display text-sm font-semibold leading-snug line-clamp-3 group-hover:text-cyber-green transition-colors">
                      {n.title}
                    </h3>
                    {n.summary && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                        {n.summary}
                      </p>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Newspaper className="w-3 h-3 shrink-0" /> {n.source}
                      </span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {timeAgo(n.date)}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {data && (
            <p className="text-center mt-10 text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground">
              Auto-refreshes every 5 minutes · Aggregated from public RSS feeds
            </p>
          )}
        </div>
      </section>
    </SiteFrame>
  );
};

export default CyberNewsPortal;
