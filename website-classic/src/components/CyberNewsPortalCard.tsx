import { motion } from 'framer-motion';
import { Newspaper, ArrowUpRight, Flame, MapPin, Clock, ShieldAlert } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const PORTAL_URL = '/cyber-news';

const highlights = [
  { icon: Flame, label: 'Daily India Cyber-Crime', tint: '--cyber-red' as const },
  { icon: MapPin, label: 'City-wise Incidents', tint: '--cyber-orange' as const },
  { icon: Newspaper, label: 'All Major Newspapers', tint: '--cyber-blue' as const },
  { icon: Clock, label: 'Auto-refresh · 5 min', tint: '--cyber-green' as const },
];

const CyberNewsPortalCard = () => (
  <section id="cyber-news-portal-card" className="section-padding relative">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <motion.a
          href={PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="group relative block overflow-hidden rounded-2xl border border-cyber-green/30 bg-gradient-to-br from-background via-card to-background p-8 md:p-12 shadow-[0_0_60px_-20px_hsl(var(--cyber-green)/0.5)] hover:shadow-[0_0_80px_-15px_hsl(var(--cyber-green)/0.7)] transition-shadow"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, hsl(var(--cyber-green)) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
          <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyber-green/20 blur-[120px] pointer-events-none" />
          <div aria-hidden className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyber-red/15 blur-[120px] pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-cyber-green opacity-75 animate-ping" />
                  <span className="relative w-2 h-2 rounded-full bg-cyber-green" />
                </span>
                <span className="text-[10px] font-display tracking-[0.3em] uppercase text-cyber-green">
                  Live · India Cyber Crime Desk
                </span>
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyber-red/10 border border-cyber-red/30 text-[10px] font-display tracking-wider uppercase text-cyber-red">
                  Daily
                </span>
              </div>

              <h2 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] mb-4" style={{ textWrap: 'balance' }}>
                Tech Guardians{' '}
                <span className="bg-gradient-to-r from-cyber-green via-cyber-blue to-cyber-red bg-clip-text text-transparent">
                  Cyber News Portal
                </span>
              </h2>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-6" style={{ textWrap: 'pretty' }}>
                Every cyber-crime incident, UPI fraud, data breach and CERT-In
                advisory across India — pulled in real time from The Hindu, Times
                of India, Hindustan Times, Indian Express, Economic Times, Inc42
                and MediaNama. Read the full article on the publisher's site with
                one click.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-7 max-w-xl">
                {highlights.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/50 bg-muted/30 backdrop-blur-sm"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: `hsl(var(${s.tint}))` }} />
                      <span className="text-[11px] font-medium text-foreground/90 truncate">{s.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-cyber-green text-black font-display text-sm font-semibold tracking-wider uppercase shadow-lg shadow-cyber-green/30 group-hover:shadow-cyber-green/50 transition-shadow">
                Open Cyber News Portal
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Newspaper emblem */}
            <div className="relative hidden lg:flex items-center justify-center w-64 h-64 shrink-0">
              <div aria-hidden className="absolute inset-0 rounded-full border border-cyber-green/30" />
              <div aria-hidden className="absolute inset-4 rounded-full border border-cyber-red/30 animate-[spin_22s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
              <div aria-hidden className="absolute inset-10 rounded-full border border-cyber-green/20" />
              <div
                aria-hidden
                className="absolute inset-2 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, hsl(var(--cyber-green) / 0.30) 30deg, transparent 60deg)',
                  animation: 'spin 5s linear infinite',
                }}
              />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyber-green/20 via-cyber-blue/20 to-cyber-red/10 border border-cyber-green/40 flex items-center justify-center backdrop-blur-sm">
                <Newspaper className="w-16 h-16 text-cyber-green" strokeWidth={1.2} />
              </div>
              <ShieldAlert aria-hidden className="absolute top-4 right-6 w-4 h-4 text-cyber-red animate-pulse" />
              <MapPin aria-hidden className="absolute bottom-6 left-4 w-4 h-4 text-cyber-orange animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          <span aria-hidden className="absolute top-3 left-3 w-3 h-3 border-t border-l border-cyber-green/60" />
          <span aria-hidden className="absolute top-3 right-3 w-3 h-3 border-t border-r border-cyber-green/60" />
          <span aria-hidden className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-cyber-green/60" />
          <span aria-hidden className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-cyber-green/60" />
        </motion.a>
      </ScrollReveal>
    </div>
  </section>
);

export default CyberNewsPortalCard;
