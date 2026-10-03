import { useEffect, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { Award, MessageSquare, Monitor, Wifi, Terminal } from 'lucide-react';
import { getTrainerIcon, loadTrainers, type TrainerOrg } from '@/lib/trainers-store';

const AWARENESS_BOOKING_URL = '/courses/awareness-booking.html';

const features = [
  { icon: Monitor, label: 'Custom Sessions' },
  { icon: Award, label: 'Certificate of Participation' },
  { icon: MessageSquare, label: 'Interactive Q&A' },
  { icon: Wifi, label: 'On-site & Online' },
];

const LINES = [
  '$ tg-awareness --start --audience "school | college | office"',
  '[+] Loading real cyber-crime case files ... done',
  '[!] FACT: 1 in 3 Indians faced an online scam attempt last year.',
  '[!] FACT: 80% of breaches start with a single weak or reused password.',
  '[!] FACT: Phishing links are opened within 60 seconds of delivery.',
  '[+] LIVE DEMO: cloning a login page ... (safe sandbox)',
  '[+] LIVE DEMO: cracking "rahul@123" ... 0.4 seconds',
  '[✓] Session complete — audience trained, awareness deployed.',
  '$ echo "Keep Learning and Keep Sharing"',
];

const useTypedLines = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setCount((c) => (c >= LINES.length ? 0 : c + 1)), 1200);
    return () => window.clearInterval(t);
  }, []);
  return count;
};

const AwarenessSection = () => {
  const shown = useTypedLines();
  const [trainers, setTrainers] = useState<TrainerOrg[]>([]);

  useEffect(() => {
    const refresh = () => setTrainers(loadTrainers().filter((t) => t.enabled && t.name.trim()));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  return (
    <section id="awareness" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">Outreach</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Cyber Awareness at <span className="neon-text-green text-cyber-green">Your Doorstep</span>
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed" style={{ textWrap: 'pretty' }}>
              Tech Guardians brings cybersecurity and cybercrime awareness programmes directly to schools, colleges, and institutions.
              Our expert-led sessions educate students, staff, and parents on online threats, safe internet practices, and digital rights.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Hacking-room terminal */}
          <ScrollReveal>
            <div className="relative h-full rounded-2xl border border-cyber-green/30 bg-background/80 overflow-hidden shadow-[0_0_60px_-25px_hsl(var(--cyber-green))]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-cyber-green/20 bg-cyber-green/5">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-orange/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/70" />
                <span className="ml-3 text-[11px] font-mono tracking-widest uppercase text-cyber-green/80 inline-flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> awareness-session — live
                </span>
              </div>
              <div className="p-5 font-mono text-[12.5px] leading-7 min-h-[300px]">
                {LINES.slice(0, shown).map((l) => (
                  <div
                    key={l}
                    className={
                      l.startsWith('[!]')
                        ? 'text-cyber-orange'
                        : l.startsWith('[✓]')
                        ? 'text-cyber-green'
                        : l.startsWith('$')
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }
                  >
                    {l}
                  </div>
                ))}
                <span className="inline-block w-2 h-4 bg-cyber-green align-middle animate-pulse" />
              </div>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-4">
            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {features.map((f) => (
                  <div key={f.label} className="glass-card p-5 text-center">
                    <f.icon className="w-6 h-6 text-cyber-green mx-auto mb-2" />
                    <span className="text-xs font-medium text-foreground">{f.label}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every session is a live "hacking room" — we show real attacks on screen, then teach the exact defence.
                  No slides-only theory. Just facts, demos, and habits your audience will actually remember.
                </p>
                <a href={AWARENESS_BOOKING_URL} className="cyber-btn-primary inline-block mt-5">
                  Book an Awareness Session
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Trainers track record */}
        {trainers.length > 0 && (
          <ScrollReveal delay={0.2}>
            <div className="mt-14">
              <h3 className="font-display text-xl md:text-2xl font-bold text-center mb-2">
                Our Trainers have given Trainings at
              </h3>
              <p className="text-center text-xs text-muted-foreground mb-6 tracking-wide">
                Corporate awareness &amp; security hygiene programmes across Delhi NCR
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trainers.map((c) => {
                  const Icon = getTrainerIcon(c.icon);
                  return (
                    <div key={c.id} className="glass-card p-5 text-center hover:border-cyber-green/40 transition-colors">
                      <div
                        className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-background shadow-[0_10px_30px_-12px_hsl(var(--cyber-green)/0.8)]"
                        style={{ background: `linear-gradient(135deg, hsl(${c.from}), hsl(${c.to}))` }}
                        aria-label={`${c.name} logo`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="text-sm font-semibold text-foreground">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{c.place}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

export default AwarenessSection;
