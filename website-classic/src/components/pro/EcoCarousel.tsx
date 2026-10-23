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
/** Each card has its own colour so neighbouring cards never look alike. */
const TONES = ['#12408a', '#138808', '#e07b12', '#6d28d9', '#c62828', '#0e7490'];

/** Ecosystem: a 3D cover-flow of photo cards. Swipe, drag, click or use the
 *  arrows; the text panel changes with the card in front. */
const EcoCarousel = ({ items }: { items: EcoItem[] }) => {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
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
  const tone = TONES[Math.min(active, n - 1) % TONES.length];

  const down = (e: PointerEvent) => { drag.current = e.clientX; };
  // The front card leans towards the mouse.
  const lean = (e: PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };
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
              <span className="grid h-12 w-12 place-items-center rounded-xl text-white shadow-lg" style={{ background: tone }}><Icon className="h-6 w-6" /></span>
              <span className="font-display text-xs font-bold uppercase tracking-[0.2em]" style={{ color: tone }}>{cur.eyebrow}</span>
            </span>
            <h3 className="mt-5 text-2xl font-extrabold leading-tight text-foreground md:text-3xl" style={{ textWrap: 'balance' }}>{cur.title}</h3>
            {cur.text && <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">{cur.text}</p>}
            {cur.buttonText && (
              <SmartLink item={{ href: cur.buttonLink || '/' }} className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5" style={{ background: tone }}>
                {cur.buttonText} <ArrowRight className="h-4 w-4" />
              </SmartLink>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex items-center gap-3">
          <button onClick={() => go(-1)} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm hover:border-primary/50 hover:text-primary"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => go(1)} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full text-white shadow-lg hover:brightness-110" style={{ background: tone }}><ChevronRight className="h-5 w-5" /></button>
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

      {/* 3D stage: navy spotlight, perspective floor, solid cards with a reflection */}
      <div
        className="relative order-1 h-[400px] touch-pan-y select-none overflow-hidden rounded-2xl sm:h-[470px] lg:order-2"
        style={{ perspective: '1400px', background: 'radial-gradient(70% 60% at 50% 35%, #173f7a 0%, #0a2147 55%, #050f24 100%)' }}
        onPointerDown={down}
        onPointerUp={up}
        onPointerMove={lean}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        onPointerCancel={() => { drag.current = null; }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-[-30%] bottom-[-8%] h-[45%] opacity-40 [background-image:linear-gradient(rgba(255,153,51,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(147,197,253,.25)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_top,#000,transparent)] [transform:rotateX(68deg)] [transform-origin:50%_100%]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-[86%] h-10 w-[60%] -translate-x-1/2 rounded-[50%] bg-black/50 blur-2xl" />
        {items.map((it, i) => {
          const d = offset(i);
          const abs = Math.abs(d);
          const hidden = abs > 2;
          const CardIcon = iconFor(it);
          const c = TONES[i % TONES.length];
          const front = d === 0;
          return (
            <motion.button
              key={it.id}
              type="button"
              onClick={() => { if (!dragged.current && d !== 0) setActive(i); }}
              aria-label={front ? `${it.eyebrow}: ${it.title}` : `Show ${it.eyebrow || it.title}`}
              tabIndex={front ? 0 : -1}
              className="absolute left-1/2 top-[46%] flex h-[310px] w-[230px] -ml-[115px] -mt-[155px] flex-col overflow-hidden rounded-xl bg-white text-left sm:h-[360px] sm:w-[268px] sm:-ml-[134px] sm:-mt-[180px]"
              style={{
                transformStyle: 'preserve-3d',
                pointerEvents: hidden ? 'none' : 'auto',
                boxShadow: front ? `0 2px 0 ${c}, 0 8px 0 -2px rgba(0,0,0,.35), 0 50px 80px -28px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.08)` : '0 30px 60px -30px rgba(0,0,0,.8)',
                WebkitBoxReflect: front ? 'below 10px linear-gradient(transparent 72%, rgba(255,255,255,.22))' : undefined,
              }}
              animate={{
                x: Math.sign(d) * (abs === 0 ? 0 : abs === 1 ? 150 : 240),
                rotateY: reduce ? 0 : front ? tilt.x * 14 : d * -38,
                rotateX: reduce || !front ? 0 : -tilt.y * 10,
                z: reduce ? 0 : front ? 40 : -abs * 160,
                scale: front ? 1 : 0.84 - (abs - 1) * 0.08,
                opacity: hidden ? 0 : front ? 1 : 0.7 - (abs - 1) * 0.3,
                zIndex: 10 - abs,
              }}
              transition={{ type: 'spring', stiffness: 210, damping: 26 }}
            >
              <span className="relative block h-[58%] overflow-hidden">
                {it.image ? <img src={it.image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                  : <span className="absolute inset-0" style={{ background: c }} />}
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
                <span className="absolute right-3 top-3 rounded bg-black/55 px-2 py-0.5 font-display text-[11px] font-bold tracking-widest text-white">{String(i + 1).padStart(2, '0')}</span>
                {/* Gloss sweep on the front card */}
                {front && <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.28)_48%,transparent_60%)]" style={{ transform: `translateX(${tilt.x * 60}%)` }} />}
              </span>
              <span className="relative flex flex-1 flex-col border-t-4 px-4 pb-4 pt-7" style={{ borderColor: c }}>
                <span className="absolute -top-6 left-4 grid h-11 w-11 place-items-center rounded-lg text-white shadow-lg ring-4 ring-white" style={{ background: c }}><CardIcon className="h-5 w-5" /></span>
                <span className="block font-display text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: c }}>{it.eyebrow}</span>
                <span className="mt-1 line-clamp-2 block text-[15px] font-bold leading-snug text-slate-900">{it.title}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold" style={{ color: c }}>{it.buttonText || 'Explore'} <ArrowRight className="h-3.5 w-3.5" /></span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EcoCarousel;
