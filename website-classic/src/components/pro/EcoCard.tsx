import { useRef, type PointerEvent } from 'react';
import { ArrowRight, BookOpen, GraduationCap, Package, ShieldCheck, Sparkles, Users, type LucideIcon } from 'lucide-react';
import SmartLink from './SmartLink';

export interface EcoCardData { eyebrow: string; title: string; text: string; image: string; buttonText: string; buttonLink: string }

const ICONS: [RegExp, LucideIcon][] = [
  [/train|course|class/i, GraduationCap],
  [/product|solution|tool/i, Package],
  [/resource|guide|book|pdf|store/i, BookOpen],
  [/aware|session|people|communit/i, Users],
  [/secur|protect|safe/i, ShieldCheck],
];
const iconFor = (d: EcoCardData) =>
  ICONS.find(([re]) => re.test(d.eyebrow))?.[1] || ICONS.find(([re]) => re.test(d.buttonLink))?.[1] || Sparkles;

/** Ecosystem card that tilts in 3D towards the pointer, with floating badges and a light glare. */
const EcoCard = ({ card, index }: { card: EcoCardData; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = iconFor(card);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.classList.add('is-tilting');
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * 12}deg`);
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <div className="eco-stage h-full">
      <div ref={ref} className="eco-card group" onPointerMove={move} onPointerLeave={leave}>
        <div className="eco-face">
          <div className="relative h-44 shrink-0 overflow-hidden">
            {card.image && <img src={card.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          </div>
          <div className="eco-body relative flex flex-1 flex-col px-6 pb-6 pt-11">
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-primary">{card.eyebrow}</p>
            <h3 className="mt-2 font-display text-lg font-bold leading-snug text-foreground">{card.title}</h3>
            {card.text && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.text}</p>}
            {card.buttonText && (
              <SmartLink item={{ href: card.buttonLink || '/' }} className="mt-auto inline-flex w-fit items-center gap-2 pt-5 font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary after:absolute after:inset-0 after:content-['']">
                {card.buttonText} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </SmartLink>
            )}
          </div>
          <div className="eco-glare" aria-hidden />
        </div>
        <span className="eco-float left-5 top-[9.25rem] grid h-14 w-14 place-items-center rounded-2xl border border-primary/50 bg-card text-primary shadow-[0_14px_30px_-12px_hsl(var(--primary)/0.6)]" aria-hidden>
          <Icon className="h-7 w-7" />
        </span>
        <span className="eco-float-sm right-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-display text-[11px] font-bold tracking-widest text-white/90 backdrop-blur" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default EcoCard;
