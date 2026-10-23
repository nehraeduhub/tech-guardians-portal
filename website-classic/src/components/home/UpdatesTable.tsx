import { ArrowRight, CalendarDays, ExternalLink, Loader2, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { eventDateParts, eventRegisterHref, splitEvents, useEvents } from '@/lib/catalog';
import { timeAgo, useTopNews } from '@/lib/news';
import { useLayout } from '@/lib/layout';

/** Panel with a navy title bar and a "View all" link, as on government portals. */
const Panel = ({ icon, title, viewAll, children }: { icon: ReactNode; title: string; viewAll: ReactNode; children: ReactNode }) => (
  <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b-[3px] border-[#ff9933] bg-[hsl(var(--tg-navy))] px-4 py-3 text-white">
      <h3 className="flex items-center gap-2 text-base font-bold">{icon}{title}</h3>
      {viewAll}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const viewAllClass = 'inline-flex shrink-0 items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[#ff9933] hover:text-[#1a1206]';

/** Homepage table: upcoming events (left) and today's top cyber news (right). */
const UpdatesTable = () => {
  const layout = useLayout();
  const { upcoming } = splitEvents(useEvents());
  const news = useTopNews(6);
  const showEvents = !layout.hiddenPages.includes('/events');
  const showNews = !layout.hiddenPages.includes('/cyber-news');
  if (!showEvents && !showNews) return null;

  return (
    <section id="updates" className="tg-section relative">
      <div className="tg-container">
        <div className="mb-8">
          <p className="tg-eyebrow">What’s happening</p>
          <h2 className="tg-title mt-2">Events &amp; today’s cyber news</h2>
        </div>
        <div className={`grid gap-6 ${showEvents && showNews ? 'lg:grid-cols-2' : ''}`}>
          {showEvents && (
            <Panel icon={<CalendarDays className="h-5 w-5 text-[#ff9933]" />} title="Upcoming events" viewAll={<Link to="/events" className={viewAllClass}>View all <ArrowRight className="h-3.5 w-3.5" /></Link>}>
              {upcoming.length ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr><th scope="col" className="w-24 px-4 py-2 font-semibold">Date</th><th scope="col" className="px-2 py-2 font-semibold">Event</th><th scope="col" className="hidden px-4 py-2 text-right font-semibold sm:table-cell">Register</th></tr>
                  </thead>
                  <tbody>
                    {upcoming.slice(0, 6).map((e, n) => {
                      const d = eventDateParts(e);
                      const href = eventRegisterHref(e);
                      const closed = e.status === 'Sold out' || e.status === 'Completed';
                      return (
                        <tr key={e.id} className={`border-t border-border align-top ${n % 2 ? 'bg-muted/25' : ''}`}>
                          <td className="px-4 py-3">
                            <span className="block text-lg font-extrabold leading-none text-primary">{d.day}</span>
                            <span className="text-[11px] font-semibold uppercase text-muted-foreground">{d.month} {d.weekday && `· ${d.weekday}`}</span>
                          </td>
                          <td className="px-2 py-3">
                            <span className="block font-semibold leading-snug text-foreground">{e.title}</span>
                            <span className="text-xs text-muted-foreground">{[e.type, e.mode, e.time].filter(Boolean).join(' · ')}</span>
                            <a href={href} target={href.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" className="mt-1 flex w-fit text-xs font-semibold text-accent hover:underline sm:hidden">{closed ? e.status : 'Register →'}</a>
                          </td>
                          <td className="hidden px-4 py-3 text-right sm:table-cell">
                            {closed
                              ? <span className="text-xs font-semibold text-muted-foreground">{e.status}</span>
                              : <a href={href} target={href.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-primary/40 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Register</a>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : <p className="p-6 text-sm text-muted-foreground">New events will be announced soon. <Link to="/events" className="font-semibold text-primary hover:underline">See past events</Link></p>}
            </Panel>
          )}

          {showNews && (
            <Panel icon={<Newspaper className="h-5 w-5 text-[#ff9933]" />} title="Top cyber news of the day" viewAll={<Link to="/cyber-news" className={viewAllClass}>View all <ArrowRight className="h-3.5 w-3.5" /></Link>}>
              {news.isLoading && <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading today’s headlines…</p>}
              {!news.isLoading && !news.data?.length && <p className="p-6 text-sm text-muted-foreground">Headlines could not be loaded right now. <Link to="/cyber-news" className="font-semibold text-primary hover:underline">Open the Cyber News Portal</Link></p>}
              {!!news.data?.length && (
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr><th scope="col" className="w-10 px-4 py-2 font-semibold">#</th><th scope="col" className="px-2 py-2 font-semibold">Headline</th><th scope="col" className="hidden w-28 px-4 py-2 text-right font-semibold sm:table-cell">When</th></tr>
                  </thead>
                  <tbody>
                    {news.data.map((n, k) => (
                      <tr key={n.url} className={`border-t border-border align-top ${k % 2 ? 'bg-muted/25' : ''}`}>
                        <td className="px-4 py-3 font-extrabold text-accent">{String(k + 1).padStart(2, '0')}</td>
                        <td className="px-2 py-3">
                          <a href={n.url} target="_blank" rel="noopener noreferrer" className="group font-semibold leading-snug text-foreground hover:text-primary">
                            <span className="line-clamp-2">{n.title}</span>
                          </a>
                          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">{n.source}<ExternalLink className="h-3 w-3" /><span className="sm:hidden">· {timeAgo(n.date)}</span></span>
                        </td>
                        <td className="hidden px-4 py-3 text-right text-xs text-muted-foreground sm:table-cell">{timeAgo(n.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          )}
        </div>
      </div>
    </section>
  );
};

export default UpdatesTable;
