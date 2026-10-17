import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowRight, ChevronLeft, ChevronRight, Fingerprint, Pause, Play, ShieldCheck } from 'lucide-react';
import SmartLink from '@/components/pro/SmartLink';
import { HERO_SLIDES, useList } from '@/lib/content-lists';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const DELAY = 6500;

/** Homepage hero: photo slides scroll behind the headline (Manage → Homepage Carousel). */
const HeroSection = () => {
  const rows = (useList(HERO_SLIDES) ?? HERO_SLIDES.seed ?? []).filter((r) => r.visible && (r.title || r.image));
  const slides = rows.map((r) => ({
    id: r.id, eyebrow: str(r.eyebrow), title: str(r.title), accent: str(r.accent), text: str(r.text),
    image: str(r.image), buttonText: str(r.buttonText), buttonLink: str(r.buttonLink),
  }));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const drag = useRef<number | null>(null);
  const count = slides.length;
  const go = useCallback((n: number) => setIndex((i) => (count ? (i + n + count) % count : 0)), [count]);

  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);
  useEffect(() => {
    if (paused || reduce || count < 2) return;
    const t = window.setTimeout(() => go(1), DELAY);
    return () => window.clearTimeout(t);
  }, [index, paused, reduce, count, go]);

  if (!count) return null;
  const s = slides[Math.min(index, count - 1)];

  const down = (e: PointerEvent) => { drag.current = e.clientX; };
  const up = (e: PointerEvent) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      id="home"
      className="tg-dark relative isolate overflow-hidden bg-[hsl(var(--tg-navy))]"
      aria-roledescription="carousel"
      aria-label="Tech Guardians highlights"
      onPointerDown={down}
      onPointerUp={up}
    >
      {/* Photos */}
      <AnimatePresence initial={false}>
        <motion.div
          key={s.id}
          className="absolute inset-0 -z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 1.1, ease: 'easeInOut' }}
        >
          {s.image && (
            <motion.img
              src={s.image}
              alt=""
              className="h-full w-full object-cover object-center"
              initial={{ scale: reduce ? 1 : 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: reduce ? 0 : DELAY / 1000 + 1.5, ease: 'linear' }}
              draggable={false}
            />
          )}
        </motion.div>
      </AnimatePresence>
      {/* Readability overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(var(--tg-navy)/0.94)_0%,hsl(var(--tg-navy)/0.78)_45%,hsl(var(--tg-navy)/0.25)_100%)]" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_10%_110%,hsl(var(--primary)/0.35),transparent_60%)]" aria-hidden />

      <div className="container mx-auto flex min-h-[600px] max-w-7xl flex-col justify-center px-6 pb-24 pt-16 md:min-h-[660px] md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            className="max-w-2xl"
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -16 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            aria-live="polite"
          >
            {s.eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{s.eyebrow}
              </span>
            )}
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl" style={{ textWrap: 'balance' }}>
              {s.title}{' '}
              {s.accent && <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--tg-hero-gradient, linear-gradient(100deg, #a78bfa, #38bdf8))' }}>{s.accent}</span>}
            </h1>
            {s.text && <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200">{s.text}</p>}
            {s.buttonText && (
              <SmartLink item={{ href: s.buttonLink || '/' }} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_14px_30px_-12px_hsl(var(--primary))] transition-transform hover:-translate-y-0.5">
                {s.buttonText} <ArrowRight className="h-4 w-4" />
              </SmartLink>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-300">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> ISO-aligned practices</span>
          <span className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-primary" /> Privacy-first</span>
          <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> 24×7 threat intel</span>
        </div>
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6">
          <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 md:px-8">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
              {slides.map((x, i) => (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}: ${x.title} ${x.accent}`}
                  onClick={() => setIndex(i)}
                  className={`relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all ${i === index ? 'w-12' : 'w-6 hover:bg-white/45'}`}
                >
                  {i === index && (
                    <motion.span
                      key={`${x.id}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-white"
                      initial={{ width: paused || reduce ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: paused || reduce ? 0 : DELAY / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-1 font-display text-xs tabular-nums text-slate-300">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
              <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play slides' : 'Pause slides'} className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white hover:bg-white/10">{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>
              <button onClick={() => go(-1)} aria-label="Previous slide" className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white hover:bg-white/10"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => go(1)} aria-label="Next slide" className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white hover:bg-white/10"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
