import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock, MapPin, MessageCircle } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import PageHero from '@/components/pro/PageHero';
import SectionHeading from '@/components/pro/SectionHeading';
import EventCard from '@/components/pro/EventCard';
import ScrollReveal from '@/components/ScrollReveal';
import { EVENT_TYPES, eventDateParts, eventRegisterHref, splitEvents, useEvents, type TGEventItem } from '@/lib/catalog';
import { waLink } from '@/lib/site-settings';

const Countdown = ({ date }: { date: string }) => {
  const target = new Date(`${date}T00:00:00`).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(t); }, []);
  const ms = Math.max(0, target - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (!date || Number.isNaN(target)) return null;
  return (
    <div className="flex gap-3" aria-label={`${days} days and ${hours} hours to go`}>
      {[[days, 'Days'], [hours, 'Hours']].map(([v, l]) => (
        <div key={l} className="w-20 rounded-xl border border-white/15 bg-white/5 py-2 text-center">
          <div className="font-display text-3xl font-extrabold text-white">{v}</div>
          <div className="text-[11px] uppercase tracking-widest text-slate-400">{l}</div>
        </div>
      ))}
    </div>
  );
};

const Featured = ({ e }: { e: TGEventItem }) => {
  const d = eventDateParts(e);
  return (
    <section className="tg-container -mt-px py-12">
      <div className="tg-dark grid overflow-hidden rounded-3xl border border-white/10 bg-[#071633] lg:grid-cols-2">
        <div className="relative min-h-[260px]">
          {e.image && <img src={e.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#071633] lg:block" />
          <span className="absolute left-5 top-5 rounded-full bg-[#2563eb] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Next event</span>
        </div>
        <div className="p-7 md:p-10">
          <p className="text-sm font-semibold text-[#60a5fa]">{e.type} · {e.mode}</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white md:text-3xl" style={{ textWrap: 'balance' }}>{e.title}</h2>
          {e.description && <p className="mt-3 text-slate-300">{e.description}</p>}
          <ul className="mt-5 grid gap-2 text-sm text-slate-200">
            <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#60a5fa]" />{d.full}</li>
            {e.time && <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#60a5fa]" />{e.time}</li>}
            {e.venue && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#60a5fa]" />{e.venue}</li>}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Countdown date={e.date} />
            <a href={eventRegisterHref(e)} target={e.registerLink.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" className="tg-btn-primary !px-6 !py-3.5">Register — {e.price || 'Free'} <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Events = () => {
  const { upcoming, past } = splitEvents(useEvents());
  const [type, setType] = useState('All');
  const types = ['All', ...EVENT_TYPES.filter((t) => upcoming.some((e) => e.type === t))];
  const [first, ...rest] = upcoming;
  const shown = (type === 'All' ? rest : upcoming.filter((e) => e.type === type));

  return (
    <SiteFrame>
      <PageHero
        variant="radar"
        eyebrow="Events & Workshops"
        title="Learn live with"
        accent="Tech Guardians experts"
        lead="Live classes, webinars, bootcamps and awareness drives — online and on campus. Register in a minute."
        actions={<a href={waLink('Hi Tech Guardians, I want to host an event or awareness session at my organisation.')} target="_blank" rel="noopener noreferrer" className="tg-btn-outline"><MessageCircle className="h-4 w-4" /> Host an event with us</a>}
      />

      {first && type === 'All' && <Featured e={first} />}

      <section className="tg-section !pt-6">
        <div className="tg-container">
          <SectionHeading center={false} eyebrow="Upcoming" title={upcoming.length ? 'Upcoming events' : 'No upcoming events right now'}
            lead={upcoming.length ? undefined : 'New dates are announced here first. Message us to get notified.'} />
          {types.length > 2 && (
            <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
              {types.map((t) => (
                <button key={t} onClick={() => setType(t)} aria-pressed={type === t} className={`rounded-full px-4 py-2 text-sm font-semibold ${type === t ? 'bg-primary text-white' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}>{t}</button>
              ))}
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((e, i) => <ScrollReveal key={e.id} delay={(i % 3) * 0.05}><EventCard event={e} /></ScrollReveal>)}
          </div>
        </div>
      </section>

      {past.length > 0 && (
        <section className="tg-section border-t border-border bg-card">
          <div className="tg-container">
            <SectionHeading center={false} eyebrow="Archive" title="Past events" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.slice(0, 6).map((e) => <EventCard key={e.id} event={e} past />)}
            </div>
          </div>
        </section>
      )}
    </SiteFrame>
  );
};

export default Events;
