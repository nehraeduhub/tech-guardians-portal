import { ArrowRight, Clock, MapPin, Mic, Users } from 'lucide-react';
import { eventDateParts, eventRegisterHref, type TGEventItem } from '@/lib/catalog';

const STATUS: Record<string, string> = {
  'Registrations open': 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300',
  Upcoming: 'border-sky-400/50 bg-sky-400/10 text-sky-300',
  'Few seats left': 'border-amber-400/50 bg-amber-400/10 text-amber-300',
  'Sold out': 'border-slate-400/40 bg-slate-400/10 text-slate-300',
  Completed: 'border-slate-400/40 bg-slate-400/10 text-slate-300',
};

/** Homepage event as an admission ticket: date stub, details, and a picture panel on wide screens. */
const EventTicket = ({ event }: { event: TGEventItem }) => {
  const d = eventDateParts(event);
  const closed = event.status === 'Sold out' || event.status === 'Completed';
  const href = eventRegisterHref(event);
  return (
    <article className="ticket group">
      <div className="ticket-stub">
        <span className="font-display text-xs font-bold uppercase tracking-[0.25em]">{d.month || 'Date'}</span>
        <span className="font-display text-5xl font-extrabold leading-none">{d.day || 'TBA'}</span>
        <span className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{d.weekday || 'soon'}</span>
        <span className="mt-3 rounded-full bg-[hsl(222_60%_6%)] px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-cyber-green">{event.price || 'Free'}</span>
      </div>
      <div className="flex min-w-0 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-display uppercase tracking-widest text-primary">{event.type}</span>
          <span className="rounded-full border border-white/15 px-2.5 py-0.5 uppercase tracking-widest text-slate-300">{event.mode}</span>
          <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${STATUS[event.status] || STATUS.Upcoming}`}>{event.status}</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white md:text-xl">{event.title}</h3>
        {event.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{event.description}</p>}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-300">
          {event.time && <li className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyber-green" />{event.time}</li>}
          {event.venue && <li className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-cyber-green" />{event.venue}</li>}
          {event.speaker && <li className="inline-flex items-center gap-1.5"><Mic className="h-3.5 w-3.5 text-cyber-green" />{event.speaker}</li>}
          {event.seats && <li className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-cyber-green" />{event.seats} seats</li>}
        </ul>
        <div className="mt-5">
          {closed ? <span className="text-sm font-semibold text-slate-400">Registrations closed</span> : (
            <a href={href} target={event.registerLink.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-cyber-green px-5 py-2 text-sm font-bold text-[hsl(222_60%_6%)] shadow-[0_10px_30px_-10px_hsl(var(--cyber-green))] transition-transform hover:-translate-y-0.5">
              Reserve your seat <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
      <div className="relative hidden overflow-hidden md:block">
        {event.image && <img src={event.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_60%_5%)] via-[hsl(222_60%_5%)/0.4] to-transparent" />
      </div>
    </article>
  );
};

export default EventTicket;
