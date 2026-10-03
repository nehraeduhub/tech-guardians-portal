import { getWhatsAppNumber } from "@/lib/site-settings";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper, CalendarClock, Video, Sparkles, ExternalLink, MessageCircle, Radio, Clock,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { newsUrl } from '@/lib/api';
import { loadEvents, TGEvent } from '@/lib/manage-store';
import { waLink } from '@/lib/site-settings';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  date?: string;
  summary?: string;
}

const joinViaWA = (label: string) =>
  waLink(`Hi Tech Guardians, I want to join: ${label}`);

const TAG_ICONS: Record<string, typeof Video> = {
  live: Video,
  capsule: Sparkles,
  workshop: Radio,
  bootcamp: CalendarClock,
};

const THREAT_INTEL_URL = '/threat-intel';

const FALLBACK_NEWS: NewsItem[] = [
  { title: 'Tech Guardians Cyber Intel Portal — Live Threat Hub', url: THREAT_INTEL_URL, source: 'TG Intel', summary: 'Open the Tech Guardians live threat intelligence dashboard.' },
  { title: 'CERT-In Vulnerability Notes & Advisories', url: 'https://www.cert-in.org.in/', source: 'CERT-In', summary: 'Latest advisories from CERT-In.' },
  { title: 'The Hacker News — Cybersecurity Headlines', url: 'https://thehackernews.com/', source: 'Hacker News', summary: 'Global breaking cybersecurity news.' },
  { title: 'BleepingComputer — Threat Reports', url: 'https://www.bleepingcomputer.com/', source: 'BleepingComputer', summary: 'Threat intel & malware analysis.' },
];


const SRC_STYLES: Record<string, { dot: string; chip: string }> = {
  'cyber-blue': { dot: 'text-cyber-blue', chip: 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/40' },
  'cyber-green': { dot: 'text-cyber-green', chip: 'bg-cyber-green/15 text-cyber-green border-cyber-green/40' },
  'cyber-orange': { dot: 'text-cyber-orange', chip: 'bg-cyber-orange/15 text-cyber-orange border-cyber-orange/40' },
  'cyber-purple': { dot: 'text-cyber-purple', chip: 'bg-cyber-purple/15 text-cyber-purple border-cyber-purple/40' },
  'cyber-red': { dot: 'text-cyber-red', chip: 'bg-cyber-red/15 text-cyber-red border-cyber-red/40' },
};
const sourceKey = (src: string) => {
  if (/TG\s*Intel|Tech Guardians/i.test(src)) return 'cyber-red';
  if (/CERT/i.test(src)) return 'cyber-blue';
  if (/Hacker/i.test(src)) return 'cyber-green';
  if (/Bleeping/i.test(src)) return 'cyber-orange';
  if (/Ni5arga/i.test(src)) return 'cyber-purple';
  return 'cyber-purple';
};

const timeAgo = (iso?: string) => {
  if (!iso) return 'just now';
  const t = new Date(iso).getTime();
  if (!t) return iso.split(' ').slice(0, 4).join(' ');
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const NewsEventsSection = () => {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [events, setEvents] = useState<TGEvent[]>(() => loadEvents());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = () => setEvents(loadEvents());
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  useEffect(() => {
    let alive = true;
    const TG_PIN: NewsItem = {
      title: 'Tech Guardians Cyber Intel Portal — Live Threat Hub',
      url: THREAT_INTEL_URL,
      source: 'TG Intel',
      summary: 'Open the Tech Guardians live threat intelligence dashboard for real-time IOCs, advisories and feeds.',
      date: new Date().toISOString(),
    };
    const load = async () => {
      try {
        const data = await fetch(newsUrl('global')).then((r) => r.json());
        if (alive && data?.items?.length) {
          setNews([TG_PIN, ...data.items.filter((x: NewsItem) => !/ISEA|Ni5arga/i.test(x.source)).slice(0, 8)]);

        }
      } catch {
        // keep fallback
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <section id="events" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">Pulse</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              <span className="neon-text-green text-cyber-green">Events</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
              Live Google Meet classes, weekend workshops and capsule bootcamps — tap any event to reserve your seat on WhatsApp.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6">

          <ScrollReveal direction="right">
            <div className="glass-card neon-border-green h-full p-6 md:p-7 relative overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-cyber-green" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold">Upcoming Events</h3>
                    <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground">
                      Meet · Capsule · Workshops
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-display tracking-[0.2em] uppercase text-cyber-orange">
                  Join via WhatsApp
                </span>
              </div>

              <ul className="space-y-3">
                {events.map((ev, i) => {
                  const Icon = TAG_ICONS[ev.tag.toLowerCase()] || CalendarClock;
                  const cssVar = `--${ev.color}`;
                  return (
                    <motion.li
                      key={ev.title}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <a
                        href={joinViaWA(ev.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            background: `hsl(var(${cssVar}) / 0.12)`,
                            borderColor: `hsl(var(${cssVar}) / 0.4)`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: `hsl(var(${cssVar}))` }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-display tracking-wider uppercase border"
                              style={{
                                color: `hsl(var(${cssVar}))`,
                                borderColor: `hsl(var(${cssVar}) / 0.4)`,
                                background: `hsl(var(${cssVar}) / 0.1)`,
                              }}
                            >
                              {ev.tag}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{ev.when}</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-snug group-hover:text-cyber-green transition-colors line-clamp-2">
                            {ev.title}
                          </p>
                        </div>
                        <MessageCircle className="w-4 h-4 text-cyber-green opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default NewsEventsSection;
