import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone, Pause, Play } from 'lucide-react';
import SmartLink from '@/components/pro/SmartLink';
import { HERO_LAYOUTS, HERO_SLIDES, useList } from '@/lib/content-lists';
import { eventDateParts, splitEvents, useEvents } from '@/lib/catalog';
import { useTopNews } from '@/lib/news';
import { safeLink } from '@/lib/utils';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const DELAY = 6500;
/** Caption colours take turns, so neighbouring slides never look the same. */
const TONES = ['#12408a', '#138808', '#e07b12', '#6d28d9', '#c62828', '#0e7490', '#1e293b'];

/** Banners are designed at 8:3 (1920 × 720); at that shape they fill the full width exactly. */
const BANNER_RATIO = 8 / 3;
/** How long the 3D cube takes to turn to the next banner. */
const TURN_MS = 1100;

/**
 * Homepage carousel: full-width 8:3 banners on the faces of a 3D cube, so each
 * banner turns into the next one joined to it. A short caption bar and a single
 * button sit underneath. A poster of any other shape is shown whole on a soft
 * blurred copy instead of being cropped. Photo slides can still carry a headline.
 */
const HeroSection = () => {
  const rows = (useList(HERO_SLIDES) ?? HERO_SLIDES.seed ?? []).filter((r) => r.visible && (r.title || r.image));
  const slides = rows.map((r) => ({
    id: r.id, poster: str(r.layout) !== HERO_LAYOUTS[1], eyebrow: str(r.eyebrow), title: str(r.title), accent: str(r.accent), text: str(r.text),
    image: str(r.image), imageMobile: str(r.imageMobile), buttonText: str(r.buttonText), buttonLink: str(r.buttonLink),
  }));
  // Natural shape of each loaded poster: banners fill the frame, other shapes get the blurred backdrop.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  // The banner the cube is turning to, and which way (1 = next, -1 = previous).
  const [turn, setTurn] = useState<{ to: number; dir: 1 | -1; on: boolean } | null>(null);
  const [width, setWidth] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const drag = useRef<number | null>(null);
  const count = slides.length;
  /** Turn the cube to banner `to` (wraps around); instant when motion is reduced. */
  const show = useCallback((to: number, dir: 1 | -1) => {
    if (!count) return;
    const target = (to + count) % count;
    if (reduce) { setIndex(target); return; }
    setTurn((t) => t ?? (target === index ? null : { to: target, dir, on: false }));
  }, [count, index, reduce]);
  const go = useCallback((n: number) => show(index + n, n < 0 ? -1 : 1), [index, show]);

  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);
  // The cube's depth is half its width, so measure it.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [count]);
  // Two steps: first place the next banner on the side face, then start turning.
  useEffect(() => {
    if (!turn) return;
    if (!turn.on) {
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setTurn((t) => (t ? { ...t, on: true } : t))));
      return () => cancelAnimationFrame(r);
    }
    const t = window.setTimeout(() => { setIndex(turn.to); setTurn(null); }, TURN_MS);
    return () => window.clearTimeout(t);
  }, [turn]);
  useEffect(() => {
    if (paused || hover || reduce || count < 2 || turn) return;
    const t = window.setTimeout(() => go(1), DELAY);
    return () => window.clearTimeout(t);
  }, [index, paused, hover, reduce, count, go, turn]);

  if (!count) return null;
  const cur = Math.min(index, count - 1);
  const i = turn ? turn.to : cur;           // the caption follows the banner coming in
  const s = slides[i];
  const tone = TONES[i % TONES.length];

  const down = (e: PointerEvent) => { drag.current = e.clientX; };
  const up = (e: PointerEvent) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  /** One banner, drawn on a face of the cube. */
  const face = (n: number) => {
    const f = slides[n];
    const ratio = ratios[f.id];
    const banner = !ratio || Math.abs(ratio - BANNER_RATIO) < 0.2;
    return (
      <>
        {f.image && f.poster && (
          <>
            {!banner && (
              <>
                <img src={f.image} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" draggable={false} />
                <div className="absolute inset-0 bg-[hsl(var(--tg-navy)/0.35)]" aria-hidden />
              </>
            )}
            <picture>
              {f.imageMobile && <source media="(max-width: 767px)" srcSet={f.imageMobile} />}
              <img
                src={f.image}
                alt={f.title || 'Tech Guardians'}
                onLoad={(e) => { const r = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight; if (r) setRatios((m) => (m[f.id] === r ? m : { ...m, [f.id]: r })); }}
                className={banner ? 'absolute inset-0 h-full w-full object-cover' : 'relative mx-auto h-full w-auto max-w-full object-contain shadow-[0_0_60px_rgba(0,0,0,.45)]'}
                draggable={false}
              />
            </picture>
          </>
        )}
        {f.image && !f.poster && (
          <>
            <img src={f.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--tg-navy)/0.9)_0%,hsl(var(--tg-navy)/0.55)_50%,transparent_100%)]" aria-hidden />
            <div className="tg-dark relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-10">
              {f.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffb24d]">{f.eyebrow}</p>}
              <h1 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl" style={{ textWrap: 'balance' }}>
                {f.title} {f.accent && <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--tg-hero-gradient)' }}>{f.accent}</span>}
              </h1>
              {f.text && <p className="mt-4 hidden max-w-xl text-base leading-relaxed text-slate-200 md:block">{f.text}</p>}
            </div>
          </>
        )}
      </>
    );
  };

  // The cube: faces sit half a width out from its centre; turning it 90° brings the side face to the front.
  const depth = width / 2;
  const ease = `${TURN_MS}ms cubic-bezier(.645,.045,.355,1)`;
  const on = !!turn?.on;
  const dir = turn?.dir ?? 1;
  const faceStyle = (angle: number) => ({ transform: `rotateY(${angle}deg) translateZ(${depth}px)`, backfaceVisibility: 'hidden' as const });
  const shade = (from: number, to: number) => (
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: on ? to : from, transition: turn ? `opacity ${ease}` : undefined }} />
  );

  return (
    <section id="home" aria-roledescription="carousel" aria-label="Tech Guardians highlights" className="relative bg-[hsl(var(--tg-navy))]">
      <div
        ref={frame}
        className="tg-cube-stage relative isolate aspect-[8/3] w-full overflow-hidden select-none"
        style={{ perspective: `${Math.max(1200, width * 1.6)}px` }}
        onPointerDown={down}
        onPointerUp={up}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className={`absolute inset-0 ${turn ? 'tg-cube-dip' : ''}`} style={{ animationDuration: `${TURN_MS}ms`, transformStyle: 'preserve-3d' }}>
          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${-depth}px) rotateY(${on ? -dir * 90 : 0}deg)`,
              transition: turn ? `transform ${ease}` : undefined,
            }}
          >
            <div className="absolute inset-0 overflow-hidden bg-[hsl(var(--tg-navy))]" style={faceStyle(0)} aria-hidden={!!turn}>
              {face(cur)}
              {turn && shade(0, 0.55)}
            </div>
            {turn && (
              <div className="absolute inset-0 overflow-hidden bg-[hsl(var(--tg-navy))]" style={faceStyle(dir * 90)}>
                {face(turn.to)}
                {shade(0.55, 0)}
              </div>
            )}
          </div>
        </div>

        {count > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded bg-black/40 text-white backdrop-blur transition hover:bg-black/70 md:left-4 md:h-12 md:w-12"><ChevronLeft className="h-6 w-6" /></button>
            <button onClick={() => go(1)} aria-label="Next slide" className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded bg-black/40 text-white backdrop-blur transition hover:bg-black/70 md:right-4 md:h-12 md:w-12"><ChevronRight className="h-6 w-6" /></button>
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
                  <button key={x.id} role="tab" aria-selected={n === i} aria-label={`Slide ${n + 1}: ${x.title}`} onClick={() => show(n, n < i ? -1 : 1)}
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
    <a key={`${copy}-${it.key}`} href={safeLink(it.href)} target={it.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" tabIndex={copy ? -1 : 0}
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
