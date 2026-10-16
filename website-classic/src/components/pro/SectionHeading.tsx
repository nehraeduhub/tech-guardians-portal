import type { ReactNode } from 'react';

/** Eyebrow, title and lead text for a section, centred or left-aligned. */
const SectionHeading = ({ eyebrow, title, lead, center = true, action }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; center?: boolean; action?: ReactNode }) => (
  <div className={`mb-10 md:mb-12 ${center ? 'mx-auto max-w-3xl text-center' : 'flex flex-wrap items-end justify-between gap-4'}`}>
    <div className={center ? '' : 'max-w-2xl'}>
      {eyebrow && (
        <p className={`tg-eyebrow ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-primary/50" aria-hidden />{eyebrow}{center && <span className="h-px w-8 bg-primary/50" aria-hidden />}
        </p>
      )}
      <h2 className="tg-title mt-3">{title}</h2>
      {lead && <p className="tg-lead mt-3">{lead}</p>}
    </div>
    {action}
  </div>
);

export default SectionHeading;
