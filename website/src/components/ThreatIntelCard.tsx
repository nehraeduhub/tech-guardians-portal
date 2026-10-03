import { motion } from 'framer-motion';
import { Radar, Globe2, AlertTriangle, ArrowUpRight, Activity, ShieldAlert } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const THREAT_URL = '/threat-intel';

const stats = [
  { icon: Globe2, label: 'Live Global Feeds', tint: '--cyber-blue' as const },
  { icon: AlertTriangle, label: 'CVE & IOC Watch', tint: '--cyber-orange' as const },
  { icon: Activity, label: 'Realtime Telemetry', tint: '--cyber-green' as const },
  { icon: ShieldAlert, label: 'Attack Surface', tint: '--cyber-red' as const },
];

const ThreatIntelCard = () => {
  return (
    <section id="threat-intel-card" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <motion.a
            href={THREAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="group relative block overflow-hidden rounded-2xl border border-cyber-red/30 bg-gradient-to-br from-background via-card to-background p-8 md:p-12 shadow-[0_0_60px_-20px_hsl(var(--cyber-red)/0.5)] hover:shadow-[0_0_80px_-15px_hsl(var(--cyber-red)/0.7)] transition-shadow"
          >
            {/* radar sweep bg */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at center, hsl(var(--cyber-red)) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
            <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyber-red/20 blur-[120px] pointer-events-none" />
            <div aria-hidden className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyber-orange/20 blur-[120px] pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-cyber-red opacity-75 animate-ping" />
                    <span className="relative w-2 h-2 rounded-full bg-cyber-red" />
                  </span>
                  <span className="text-[10px] font-display tracking-[0.3em] uppercase text-cyber-red">
                    Live · Threat Feed
                  </span>
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyber-orange/10 border border-cyber-orange/30 text-[10px] font-display tracking-wider uppercase text-cyber-orange">
                    Realtime
                  </span>
                </div>

                <h2 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] mb-4" style={{ textWrap: 'balance' }}>
                  Threat Intelligence{' '}
                  <span className="bg-gradient-to-r from-cyber-red via-cyber-orange to-cyber-red bg-clip-text text-transparent">
                    Command Portal
                  </span>
                </h2>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-6" style={{ textWrap: 'pretty' }}>
                  Monitor global cyber threats in real time — track active CVEs,
                  emerging malware, dark-web chatter and attack indicators from
                  trusted intelligence feeds, all unified in one operations hub.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-7 max-w-xl">
                  {stats.map((s, i) => {
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

                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-cyber-red text-white font-display text-sm font-semibold tracking-wider uppercase shadow-lg shadow-cyber-red/30 group-hover:shadow-cyber-red/50 transition-shadow">
                  Open Threat Intel Portal
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              {/* Radar emblem */}
              <div className="relative hidden lg:flex items-center justify-center w-64 h-64 shrink-0">
                <div aria-hidden className="absolute inset-0 rounded-full border border-cyber-red/30" />
                <div aria-hidden className="absolute inset-4 rounded-full border border-cyber-orange/30 animate-[spin_18s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
                <div aria-hidden className="absolute inset-10 rounded-full border border-cyber-red/20" />
                <div
                  aria-hidden
                  className="absolute inset-2 rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, hsl(var(--cyber-red) / 0.35) 30deg, transparent 60deg)',
                    animation: 'spin 4s linear infinite',
                  }}
                />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyber-red/20 via-cyber-orange/20 to-cyber-red/5 border border-cyber-red/40 flex items-center justify-center backdrop-blur-sm">
                  <Radar className="w-16 h-16 text-cyber-red" strokeWidth={1.2} />
                </div>
                <div aria-hidden className="absolute top-4 right-8 w-1.5 h-1.5 rounded-full bg-cyber-orange animate-pulse" />
                <div aria-hidden className="absolute bottom-8 left-4 w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            <span aria-hidden className="absolute top-3 left-3 w-3 h-3 border-t border-l border-cyber-red/60" />
            <span aria-hidden className="absolute top-3 right-3 w-3 h-3 border-t border-r border-cyber-red/60" />
            <span aria-hidden className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-cyber-red/60" />
            <span aria-hidden className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-cyber-red/60" />
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ThreatIntelCard;
