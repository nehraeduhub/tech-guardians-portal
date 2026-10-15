import type { ReactNode } from 'react';
import LazyScene from './LazyScene';
import type { SceneVariant } from '../Scene3D';

/** Turns an existing page header into a navy band with a 3D scene behind it. */
const HeroBand = ({ variant = 'globe', align = 'right', className = '', children }: {
  variant?: SceneVariant; align?: 'right' | 'center'; className?: string; children: ReactNode;
}) => (
  <section className={`tg-dark tg-band relative overflow-hidden ${className}`}>
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(hsl(216_100%_60%/.07)_1px,transparent_1px),linear-gradient(90deg,hsl(216_100%_60%/.07)_1px,transparent_1px)] [background-size:56px_56px]" />
    <LazyScene
      variant={variant}
      className={`pointer-events-none absolute ${align === 'center'
        ? 'left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-25'
        : 'right-[-4%] top-1/2 hidden h-[440px] w-[520px] -translate-y-1/2 opacity-60 xl:block'}`}
    />
    <div className="relative">{children}</div>
  </section>
);

export default HeroBand;
