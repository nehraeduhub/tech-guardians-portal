import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, GraduationCap, Package, ShieldCheck, Sparkles, Users, type LucideIcon } from 'lucide-react';
import SmartLink from './SmartLink';

export interface EcoItem { id: string; eyebrow: string; title: string; text: string; image: string; buttonText: string; buttonLink: string }

const ICONS: [RegExp, LucideIcon][] = [
  [/train|course|class/i, GraduationCap],
  [/product|solution|tool/i, Package],
  [/resource|guide|book|pdf|store/i, BookOpen],
  [/aware|session|people|communit/i, Users],
  [/secur|protect|safe/i, ShieldCheck],
];
const iconFor = (d: EcoItem) => ICONS.find(([re]) => re.test(d.eyebrow))?.[1] || ICONS.find(([re]) => re.test(d.buttonLink))?.[1] || Sparkles;
const DELAY = 5500;

/** Ecosystem: a 3D cover-flow of photo cards. Swipe, drag, click or use the
 *  arrows; the text panel changes with the card in front. */
const EcoCarousel = ({ items }: { items: EcoItem[] }) => {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const drag = useRef<number | null>(null);
  const dragged = useRef(false);
  const n = items.length;
  const go = useCallback((d: number) => setActive((i) => (i + d + n) % n), [n]);

  useEffect(() => { if (active >= n) setActive(0); }, [n, active]);
  useEffect(() => {
    if (hover || reduce || n < 2) return;
    const t = window.setTimeout(() => go(1), DELAY);
    return () => window.clearTimeout(t);
  }, [active, hover, reduce, n, go]);

  const cur = items[Math.min(active, n - 1)];
  if (!cur) return null;
  const Icon = iconFor(cur);

  const down = (e: PointerEvent) => { drag.current = e.clientX; };
  const up = (e: PointerEvent) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (Math.abs(dx) > 40) {
      dragged.current = true;
      window.setTimeout(() => { dragged.current = false; }, 50);
      go(dx < 0 ? 1 : -1);
    }
  };

  // Shortest signed distance from the active card, so the ring wraps around.
  const offset = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {/* Text for the card in front */}
      <div className="order-2 lg:order-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, x: reduce ? 0 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            aria-live="polite"
          >
            <span className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--cyber-purple))] text-primary-foreground shadow-[0_14px_30px_-12px_hsl(var(--primary))]"><Icon className="h-6 w-6" /></span>
              <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">{cur.eyebrow}</span>
            </span>
            <h3 className="mt-5 text-2xl font-extrabold leading-tight text-foreground md:text-3xl" style={{ textWrap: 'balance' }}>{cur.title}</h3>
            {cur.text && <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">{cur.text}</p>}
            {cur.buttonText && (
              <SmartLink item={{ href: cur.buttonLink || '/' }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_-14px_hsl(var(--primary))] transition-transform hover:-translate-y-0.5">
                {cur.buttonText} <ArrowRight className="h-4 w-4" />
              </SmartLink>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex items-center gap-3">
          <button onClick={() => go(-1)} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm hover:border-primary/50 hover:text-primary"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => go(1)} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_hsl(var(--primary))] hover:brightness-110"><ChevronRight className="h-5 w-5" /></button>
          <div className="ml-2 flex items-center gap-1.5" role="tablist" aria-label="Choose card">
            {items.map((it, i) => (
              <button key={it.id} role="tab" aria-selected={i === active} aria-label={it.eyebrow || it.title} onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${i === active ? 'w-8 bg-primary' : 'w-2 bg-primary/25 hover:bg-primary/50'}`} />
            ))}
          </div>
          <span className="ml-auto font-display text-sm tabular-nums text-muted-foreground">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Swipe or drag the cards to explore.</p>
      </div>

      {/* 3D cover-flow */}
      <div
        className="relative order-1 h-[360px] touch-pan-y select-none overflow-hidden rounded-[2rem] sm:h-[420px] lg:order-2"
        style={{ perspective: '1400px' }}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => { drag.current = null; }}
      >
        {items.map((it, i) => {
          const d = offset(i);
          const abs = Math.abs(d);
          const hidden = abs > 2;
          const CardIcon = iconFor(it);
          return (
            <motion.button
              key={it.id}
              type="button"
              onClick={() => { if (!dragged.current && d !== 0) setActive(i); }}
              aria-label={d === 0 ? `${it.eyebrow}: ${it.title}` : `Show ${it.eyebrow || it.title}`}
              tabIndex={d === 0 ? 0 : -1}
              className="absolute left-1/2 top-1/2 h-[300px] w-[230px] -ml-[115px] -mt-[150px] overflow-hidden rounded-[1.6rem] text-left shadow-[0_40px_80px_-30px_rgba(15,23,42,.55)] sm:h-[360px] sm:w-[270px] sm:-ml-[135px] sm:-mt-[180px]"
              style={{ transformStyle: 'preserve-3d', pointerEvents: hidden ? 'none' : 'auto' }}
              animate={{
                x: Math.sign(d) * (abs === 0 ? 0 : abs === 1 ? 135 : 215),
                rotateY: reduce ? 0 : d * -32,
                z: reduce ? 0 : -abs * 140,
                scale: d === 0 ? 1 : 0.86 - (abs - 1) * 0.08,
                opacity: hidden ? 0 : d === 0 ? 1 : 0.75 - (abs - 1) * 0.3,
                zIndex: 10 - abs,
              }}
              transition={{ type: 'spring', stiffness: 210, damping: 26 }}
            >
              {it.image ? <img src={it.image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                : <span className="absolute inset-0 bg-gradient-to-br from-primary to-[hsl(var(--cyber-purple))]" />}
              <span className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--tg-navy)/0.92)] via-[hsl(var(--tg-navy)/0.25)] to-transparent" />
              <span className="absolute inset-0 rounded-[1.6rem] ring-1 ring-inset ring-white/15" />
              {d === 0 && <span className="absolute inset-0 rounded-[1.6rem] ring-2 ring-inset ring-primary/70" />}
              <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-white/90 text-primary shadow-lg backdrop-blur"><CardIcon className="h-5 w-5" /></span>
              <span className="absolute right-4 top-4 rounded-full bg-black/45 px-2.5 py-1 font-display text-[11px] font-bold tracking-widest text-white backdrop-blur">{String(i + 1).padStart(2, '0')}</span>
              <span className="absolute inset-x-4 bottom-4">
                <span className="block font-display text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200">{it.eyebrow}</span>
                <span className="mt-1 block text-base font-bold leading-snug text-white">{it.title}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EcoCarousel;
