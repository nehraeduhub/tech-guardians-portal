import { CalendarDays, Clock, MapPin, Mic, Users } from 'lucide-react';
import { eventDateParts, eventRegisterHref, type TGEventItem } from '@/lib/catalog';

const STATUS: Record<string, string> = {
  'Registrations open': 'bg-emerald-500 text-white',
  Upcoming: 'bg-primary text-primary-foreground',
  'Few seats left': 'bg-amber-500 text-white',
  'Sold out': 'bg-slate-500 text-white',
  Completed: 'bg-slate-200 text-slate-700',
};


/** Event card with a calendar-style date block. */
const EventCard = ({ event, past = false }: { event: TGEventItem; past?: boolean }) => {
  const d = eventDateParts(event);
  const closed = past || event.status === 'Sold out' || event.status === 'Completed';
  return (
    <article className={`tg-card tg-card-hover flex h-full flex-col overflow-hidden ${past ? 'opacity-80' : ''}`}>
      <div className="relative aspect-[16/8] overflow-hidden bg-muted">
        {event.image && <img src={event.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061330]/85 via-[#061330]/20 to-transparent" />
        <div className="absolute left-4 top-4 w-16 overflow-hidden rounded-xl bg-white text-center shadow-lg">
          <div className="bg-primary py-0.5 text-[11px] font-bold tracking-widest text-white">{d.month || 'DATE'}</div>
          <div className="font-display text-2xl font-extrabold leading-9 text-slate-900">{d.day}</div>
          <div className="pb-1 text-[10px] font-semibold uppercase text-slate-500">{d.weekday || 'soon'}</div>
        </div>
        <span className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS[past ? 'Completed' : event.status] || STATUS.Upcoming}`}>{past ? 'Completed' : event.status}</span>
        <span className="absolute bottom-3 left-4 rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">{event.type} · {event.mode}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-foreground">{event.title}</h3>
        {event.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{event.description}</p>}
        <ul className="mt-4 grid gap-1.5 text-sm text-foreground/80">
          <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{d.full}</li>
          {event.time && <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{event.time}</li>}
          {event.venue && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{event.venue}</li>}
          {event.speaker && <li className="flex items-center gap-2"><Mic className="h-4 w-4 text-primary" />{event.speaker}</li>}
          {event.seats && !past && <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" />{event.seats} seats</li>}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="font-display text-lg font-extrabold text-foreground">{event.price || 'Free'}</span>
          {closed ? <span className="text-sm font-semibold text-muted-foreground">{past ? 'Event completed' : 'Registrations closed'}</span>
            : <a href={eventRegisterHref(event)} target={event.registerLink.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" className="tg-btn-primary !py-2">Register</a>}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
