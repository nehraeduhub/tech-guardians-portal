import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone, Pause, Play } from 'lucide-react';
import SmartLink from '@/components/pro/SmartLink';
import { HERO_LAYOUTS, HERO_SLIDES, useList } from '@/lib/content-lists';
import { eventDateParts, splitEvents, useEvents } from '@/lib/catalog';
import { useTopNews } from '@/lib/news';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const DELAY = 6500;
/** Caption colours take turns, so neighbouring slides never look the same. */
const TONES = ['#12408a', '#138808', '#e07b12', '#6d28d9', '#c62828', '#0e7490', '#1e293b'];

/**
 * Homepage carousel in the government-portal pattern: the full picture is
 * always visible (posters are never cropped), with a short caption bar and a
 * single button underneath. Photo slides can still carry a headline.
 */
const HeroSection = () => {
  const rows = (useList(HERO_SLIDES) ?? HERO_SLIDES.seed ?? []).filter((r) => r.visible && (r.title || r.image));
  const slides = rows.map((r) => ({
    id: r.id, poster: str(r.layout) !== HERO_LAYOUTS[1], eyebrow: str(r.eyebrow), title: str(r.title), accent: str(r.accent), text: str(r.text),
    image: str(r.image), buttonText: str(r.buttonText), buttonLink: str(r.buttonLink),
  }));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const drag = useRef<number | null>(null);
  const count = slides.length;
  const go = useCallback((n: number) => setIndex((i) => (count ? (i + n + count) % count : 0)), [count]);

  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);
  useEffect(() => {
    if (paused || hover || reduce || count < 2) return;
    const t = window.setTimeout(() => go(1), DELAY);
    return () => window.clearTimeout(t);
  }, [index, paused, hover, reduce, count, go]);

  if (!count) return null;
  const i = Math.min(index, count - 1);
  const s = slides[i];
  const tone = TONES[i % TONES.length];

  const down = (e: PointerEvent) => { drag.current = e.clientX; };
  const up = (e: PointerEvent) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <section id="home" aria-roledescription="carousel" aria-label="Tech Guardians highlights" className="relative bg-[hsl(var(--tg-navy))]">
      <div
        className="relative isolate h-[clamp(210px,52vw,600px)] overflow-hidden select-none"
        onPointerDown={down}
        onPointerUp={up}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={s.id}
            className="absolute inset-0"
            initial={{ opacity: 0, x: reduce ? 0 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -40 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {s.image && s.poster && (
              <>
                {/* Soft, blurred copy fills the sides; the poster itself is shown whole. */}
                <img src={s.image} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" draggable={false} />
                <div className="absolute inset-0 bg-[hsl(var(--tg-navy)/0.35)]" aria-hidden />
                <img src={s.image} alt={s.title || 'Tech Guardians'} className="relative mx-auto h-full w-auto max-w-full object-contain shadow-[0_0_60px_rgba(0,0,0,.45)]" draggable={false} />
              </>
            )}
            {s.image && !s.poster && (
              <>
                <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--tg-navy)/0.9)_0%,hsl(var(--tg-navy)/0.55)_50%,transparent_100%)]" aria-hidden />
                <div className="tg-dark relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-10">
                  {s.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffb24d]">{s.eyebrow}</p>}
                  <h1 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl" style={{ textWrap: 'balance' }}>
                    {s.title} {s.accent && <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--tg-hero-gradient)' }}>{s.accent}</span>}
                  </h1>
                  {s.text && <p className="mt-4 hidden max-w-xl text-base leading-relaxed text-slate-200 md:block">{s.text}</p>}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded bg-black/40 text-white backdrop-blur transition hover:bg-black/70 md:left-4 md:h-12 md:w-12"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={() => go(1)} aria-label="Next slide" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded bg-black/40 text-white backdrop-blur transition hover:bg-black/70 md:right-4 md:h-12 md:w-12"><ChevronRight className="h-6 w-6" /></button>
          </>
        )}
      </div>

      {/* Caption bar: one short line and one button per slide */}
      <div className="border-t-4 transition-colors duration-500" style={{ borderColor: tone, background: `linear-gradient(90deg, ${tone} 0, ${tone} 6px, hsl(var(--tg-navy)) 6px)` }}>
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <AnimatePresence mode="wait">
            <motion.p key={s.id} aria-live="polite" initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex min-w-0 items-center gap-3 text-sm font-semibold text-white md:text-base">
              <span className="shrink-0 rounded px-2 py-0.5 text-[11px] font-bold tabular-nums text-white" style={{ background: tone }}>{String(i + 1).padStart(2, '0')}/{String(count).padStart(2, '0')}</span>
              <span className="line-clamp-2">{s.poster ? s.title : s.eyebrow}</span>
            </motion.p>
          </AnimatePresence>
          <div className="flex shrink-0 items-center gap-3">
            {count > 1 && (
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose slide">
                {slides.map((x, n) => (
                  <button key={x.id} role="tab" aria-selected={n === i} aria-label={`Slide ${n + 1}: ${x.title}`} onClick={() => setIndex(n)}
                    className={`h-2.5 rounded-full transition-all ${n === i ? 'w-7' : 'w-2.5 bg-white/35 hover:bg-white/60'}`} style={n === i ? { background: '#ff9933' } : undefined} />
                ))}
                <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play slides' : 'Pause slides'} className="ml-1 grid h-7 w-7 place-items-center rounded border border-white/30 text-white hover:bg-white/10">
                  {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
            {s.buttonText && (
              <SmartLink item={{ href: s.buttonLink || '/' }} className="inline-flex items-center gap-1.5 rounded bg-[#ff9933] px-4 py-2 text-sm font-bold text-[#1a1206] transition hover:brightness-105">
                {s.buttonText} <ArrowRight className="h-4 w-4" />
              </SmartLink>
            )}
          </div>
        </div>
      </div>

      <LatestUpdates />
    </section>
  );
};

/** "Latest updates" ticker under the slider: upcoming events and today's top cyber news. */
const LatestUpdates = () => {
  const { upcoming } = splitEvents(useEvents());
  const { data: news = [] } = useTopNews(6);
  const items = [
    ...upcoming.slice(0, 3).map((e) => ({ key: `e${e.id}`, label: `${eventDateParts(e).full} — ${e.title}`, href: '/events', tag: 'Event' })),
    ...news.map((n, k) => ({ key: `n${k}`, label: n.title, href: n.url, tag: n.source })),
  ];
  if (!items.length) return null;
  const row = (copy: number) => items.map((it) => (
    <a key={`${copy}-${it.key}`} href={it.href} target={it.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" tabIndex={copy ? -1 : 0}
      className="inline-flex shrink-0 items-center gap-2 px-6 text-sm text-foreground hover:text-primary hover:underline">
      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">{it.tag}</span>{it.label}
      <span className="ml-4 text-accent" aria-hidden>◆</span>
    </a>
  ));
  return (
    <div className="flex items-stretch border-b border-border bg-card">
      <span className="tg-updates-label flex shrink-0 items-center gap-2 px-3 text-xs font-extrabold uppercase tracking-wider md:px-5">
        <Megaphone className="h-4 w-4" /> <span className="hidden sm:inline">Latest updates</span>
      </span>
      <div className="tg-ticker relative min-w-0 flex-1 overflow-hidden py-2.5" aria-label="Latest updates">
        <div className="tg-ticker-track flex w-max">{row(0)}<span aria-hidden className="flex">{row(1)}</span></div>
      </div>
    </div>
  );
};

export default HeroSection;
