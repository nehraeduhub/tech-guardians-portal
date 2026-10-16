import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import LazyScene from './LazyScene';
import type { SceneVariant } from '../Scene3D';

/** Dark navy page header with a 3D scene on the right (or behind, on phones). */
const PageHero = ({ eyebrow, title, accent, lead, actions, children, variant = 'globe', compact = false }: {
  eyebrow?: string; title: ReactNode; accent?: ReactNode; lead?: ReactNode; actions?: ReactNode; children?: ReactNode;
  variant?: SceneVariant; compact?: boolean;
}) => (
  <section className="tg-dark tg-band relative overflow-hidden">
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(hsl(216_100%_60%/.08)_1px,transparent_1px),linear-gradient(90deg,hsl(216_100%_60%/.08)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_40%,#000_20%,transparent_75%)]" />
    <div className={`tg-container relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] ${compact ? 'py-12 md:py-16' : 'py-14 md:py-20'}`}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
        {eyebrow && <p className="tg-eyebrow text-[hsl(var(--cyber-blue))]">{eyebrow}</p>}
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] text-foreground md:text-5xl lg:text-[3.4rem]" style={{ textWrap: 'balance' }}>
          {title}{accent && <><br /><span className="bg-gradient-to-r from-[#3b8bff] to-[#22d3ee] bg-clip-text text-transparent">{accent}</span></>}
        </h1>
        {lead && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{lead}</p>}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        {children}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-30 lg:pointer-events-auto lg:relative lg:h-[340px] lg:w-auto lg:opacity-100">
        <LazyScene variant={variant} className="h-full w-full" />
      </div>
    </div>
  </section>
);

export default PageHero;
