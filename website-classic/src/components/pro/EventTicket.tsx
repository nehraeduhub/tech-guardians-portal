import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { eventDateParts, eventRegisterHref, type TGEventItem } from '@/lib/catalog';

const STATUS: Record<string, string> = {
  'Registrations open': 'bg-emerald-500/10 text-emerald-700',
  Upcoming: 'bg-sky-500/10 text-sky-700',
  'Few seats left': 'bg-amber-500/10 text-amber-700',
  'Sold out': 'bg-muted text-muted-foreground',
  Completed: 'bg-muted text-muted-foreground',
};

/** Homepage event as a compact ticket: date stub and the key details, no photo. */
const EventTicket = ({ event }: { event: TGEventItem }) => {
  const d = eventDateParts(event);
  const closed = event.status === 'Sold out' || event.status === 'Completed';
  const href = eventRegisterHref(event);
  return (
    <article className="ticket group h-full">
      <div className="ticket-stub">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em]">{d.month || 'Date'}</span>
        <span className="font-display text-4xl font-extrabold leading-none">{d.day || 'TBA'}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80">{d.weekday || 'soon'}</span>
      </div>
      <div className="flex min-w-0 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-primary">{event.type}</span>
          <span className="text-muted-foreground">· {event.mode}</span>
          <span className={`ml-auto rounded-full px-2 py-0.5 normal-case tracking-normal ${STATUS[event.status] || STATUS.Upcoming}`}>{event.status}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-foreground">{event.title}</h3>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {event.time && <li className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{event.time}</li>}
          {event.venue && <li className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{event.venue}</span></li>}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="font-display text-sm font-extrabold text-foreground">{event.price || 'Free'}</span>
          {closed ? <span className="text-xs font-semibold text-muted-foreground">Closed</span> : (
            <a href={href} target={event.registerLink.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5">
              Register <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventTicket;
