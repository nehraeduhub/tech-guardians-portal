import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Database, Laptop, Lock, ShieldCheck } from 'lucide-react';
import LazyScene from './LazyScene';

// Homepage hero art: a glowing shield and lock on a light platform, a rotating
// 3D globe behind it, and floating security panels that tilt with the mouse.

/** Outer box: position and 3D angle. Inner box: the floating animation. */
const Panel = ({ className = '', float = 'tg-float', style, children }: { className?: string; float?: string; style?: CSSProperties; children: ReactNode }) => (
  <div className={`absolute ${className}`}>
    <div
      className={`${float} rounded-xl border border-[#3b82f6]/40 bg-[#0a1a3d]/75 p-3 text-white shadow-[0_20px_50px_-20px_rgba(37,99,235,.7)] backdrop-blur-md`}
      style={style}
    >
      {children}
    </div>
  </div>
);

const Bars = () => (
  <svg viewBox="0 0 120 44" className="mt-2 h-10 w-full" aria-hidden>
    {[10, 18, 14, 26, 22, 32, 28, 38, 30, 42].map((h, i) => (
      <rect key={i} x={i * 12 + 2} y={44 - h} width="7" height={h} rx="1.5" fill={i > 6 ? '#22d3ee' : '#3b82f6'} opacity={0.5 + i * 0.05} />
    ))}
  </svg>
);

const Line = () => (
  <svg viewBox="0 0 120 44" className="mt-2 h-10 w-full" aria-hidden>
    <polyline points="0,36 14,32 26,38 40,28 52,30 66,20 78,26 92,10 104,16 120,6" fill="none" stroke="#22d3ee" strokeWidth="2" />
    <polyline points="0,40 120,40" stroke="#1e3a8a" strokeWidth="1" />
  </svg>
);

const Shield = () => (
  <svg viewBox="0 0 220 250" className="h-full w-full drop-shadow-[0_0_40px_rgba(56,189,248,.65)]" aria-hidden>
    <defs>
      <linearGradient id="tgShieldEdge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7dd3fc" />
        <stop offset="1" stopColor="#2563eb" />
      </linearGradient>
      <radialGradient id="tgShieldFill" cx="50%" cy="40%" r="65%">
        <stop offset="0" stopColor="#1d4ed8" stopOpacity="0.55" />
        <stop offset="1" stopColor="#020a24" stopOpacity="0.85" />
      </radialGradient>
      <pattern id="tgCircuit" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M0 11h8l3-3h11M11 0v6M11 16v6" stroke="#38bdf8" strokeWidth=".8" fill="none" opacity=".45" />
        <circle cx="11" cy="8" r="1.4" fill="#7dd3fc" opacity=".7" />
      </pattern>
    </defs>
    <path d="M110 8 200 40v70c0 62-38 108-90 132C58 218 20 172 20 110V40Z" fill="url(#tgShieldFill)" stroke="url(#tgShieldEdge)" strokeWidth="5" />
    <path d="M110 26 184 52v58c0 52-31 91-74 112-43-21-74-60-74-112V52Z" fill="url(#tgCircuit)" stroke="#60a5fa" strokeOpacity=".55" strokeWidth="2" />
  </svg>
);

const HomeHeroVisual = () => {
  const box = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (!box.current || e.pointerType !== 'mouse') return;
    const r = box.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    box.current.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
    box.current.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
  };
  const reset = () => { box.current?.style.setProperty('--rx', '0deg'); box.current?.style.setProperty('--ry', '0deg'); };

  return (
    <div
      ref={box}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative mx-auto aspect-[1.15/1] w-full max-w-[620px] [perspective:1200px]"
    >
      <LazyScene variant="globe" className="absolute inset-[-6%] opacity-90" />

      <div className="absolute inset-0 transition-transform duration-300 ease-out [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]">
        {/* platform */}
        <div aria-hidden className="absolute bottom-[6%] left-1/2 h-[18%] w-[62%] -translate-x-1/2 rounded-[50%] border border-sky-400/50 bg-[radial-gradient(ellipse,rgba(56,189,248,.35),transparent_70%)] shadow-[0_0_60px_rgba(56,189,248,.45)]" />
        <div aria-hidden className="absolute bottom-[9%] left-1/2 h-[10%] w-[40%] -translate-x-1/2 rounded-[50%] border border-sky-300/60" />
        {/* shield + lock */}
        <div className="absolute left-[27%] top-[14%] h-[66%] w-[46%] [transform:translateZ(60px)]">
          <div className="tg-float relative h-full w-full">
            <Shield />
            <div className="absolute left-[31%] top-[38%] grid h-[30%] w-[38%] place-items-center rounded-2xl bg-gradient-to-b from-sky-200 to-sky-500 shadow-[0_0_40px_rgba(125,211,252,.9)]">
              <Lock className="h-1/2 w-1/2 text-[#0a2a6b]" strokeWidth={2.4} />
            </div>
          </div>
        </div>

        <Panel float="tg-float-slow" className="left-[1%] top-[8%] hidden w-[30%] sm:block [transform:translateZ(90px)_rotateY(14deg)]">
          <div className="text-[11px] font-semibold leading-tight">SOC<br />Monitoring</div>
          <Bars />
        </Panel>
        <Panel className="left-[3%] top-[48%] w-[28%] [transform:translateZ(70px)_rotateY(14deg)]" style={{ animationDelay: '-2s' }}>
          <div className="text-[11px] font-semibold leading-tight">Threat<br />Detection</div>
          <Line />
        </Panel>
        <Panel float="tg-float-slow" className="right-[1%] top-[6%] w-[28%] [transform:translateZ(90px)_rotateY(-14deg)]" style={{ animationDelay: '-4s' }}>
          <div className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 shrink-0 text-sky-300" /><span className="text-[11px] font-semibold leading-tight">Network<br />Security</span></div>
          <div className="mt-2 flex gap-1" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-1 flex-1 rounded bg-sky-400/60" />)}</div>
        </Panel>
        <Panel className="right-[0%] top-[38%] hidden w-[27%] sm:block [transform:translateZ(80px)_rotateY(-14deg)]" style={{ animationDelay: '-1s' }}>
          <div className="flex items-center gap-2"><Laptop className="h-6 w-6 shrink-0 text-sky-300" /><span className="text-[11px] font-semibold leading-tight">Endpoint<br />Protection</span></div>
        </Panel>
        <Panel float="tg-float-slow" className="right-[4%] top-[63%] w-[25%] [transform:translateZ(70px)_rotateY(-14deg)]" style={{ animationDelay: '-3s' }}>
          <div className="flex items-center gap-2"><Database className="h-6 w-6 shrink-0 text-sky-300" /><span className="text-[11px] font-semibold leading-tight">Data<br />Security</span></div>
        </Panel>
      </div>
    </div>
  );
};

export default HomeHeroVisual;
