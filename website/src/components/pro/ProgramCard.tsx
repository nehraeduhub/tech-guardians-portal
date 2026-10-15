import { ArrowRight, Clock, Signal } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ManagedCourse } from '@/lib/courses-store';
import PriceTag from './PriceTag';

const ProgramCard = ({ program }: { program: ManagedCourse }) => (
  <Link to={program.page} className="tg-card group flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[16/9] overflow-hidden bg-[#0a1a3d]">
      {program.image && <img src={program.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#061330]/70 to-transparent" />
      {program.category && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0b1b33]">{program.category}</span>}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {program.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{program.duration}</span>}
        {program.level && <span className="inline-flex items-center gap-1"><Signal className="h-3.5 w-3.5" />{program.level}</span>}
      </div>
      <h3 className="mt-2 text-lg font-bold leading-snug text-foreground group-hover:text-primary">{program.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{program.description}</p>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
        {program.showPrice ? <PriceTag price={program.price} offer={program.offer} note="Price on request" /> : <span className="text-sm text-muted-foreground">Contact for fees</span>}
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </div>
  </Link>
);

export default ProgramCard;
