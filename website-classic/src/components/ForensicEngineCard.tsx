import { motion } from 'framer-motion';
import { Fingerprint, ShieldCheck, Search, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const FORENSIC_URL = '/forensic-engine.html';

const features = [
  { icon: Search, label: 'OSINT Lookups', tint: '--cyber-blue' as const },
  { icon: ShieldCheck, label: 'Threat Intel', tint: '--cyber-green' as const },
  { icon: Activity, label: 'Live Analysis', tint: '--cyber-orange' as const },
  { icon: Fingerprint, label: 'Digital Forensics', tint: '--cyber-purple' as const },
];

const ForensicEngineCard = () => {
  return (
    <section id="forensic-engine" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <motion.a
            href={FORENSIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="group relative block overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-background via-card to-background p-8 md:p-12 shadow-[0_0_60px_-20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_80px_-15px_hsl(var(--primary)/0.7)] transition-shadow"
          >
            {/* animated grid bg */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* orbs */}
            <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyber-green/20 blur-[120px] pointer-events-none" />
            <div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
              {/* LEFT — content */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-cyber-green opacity-75 animate-ping" />
                    <span className="relative w-2 h-2 rounded-full bg-cyber-green" />
                  </span>
                  <span className="text-[10px] font-display tracking-[0.3em] uppercase text-cyber-green">
                    New · Live Tool
                  </span>
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-display tracking-wider uppercase text-primary">
                    <Sparkles className="w-3 h-3" /> Pro
                  </span>
                </div>

                <h2 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] mb-4" style={{ textWrap: 'balance' }}>
                  Tech Guardians{' '}
                  <span className="bg-gradient-to-r from-primary via-cyber-green to-primary bg-clip-text text-transparent">
                    Cyber &amp; Forensic Intelligence Hub
                  </span>
                </h2>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-6" style={{ textWrap: 'pretty' }}>
                  An India-focused OSINT &amp; cyber forensics workbench. Run real-time lookups,
                  trace digital footprints, validate threats and access verified government &amp;
                  intelligence sources — all from one purpose-built hub.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-7 max-w-xl">
                  {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/50 bg-muted/30 backdrop-blur-sm"
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: `hsl(var(${f.tint}))` }} />
                        <span className="text-[11px] font-medium text-foreground/90 truncate">{f.label}</span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-display text-sm font-semibold tracking-wider uppercase shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                  Open Intelligence Hub
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              {/* RIGHT — emblem */}
              <div className="relative hidden lg:flex items-center justify-center w-64 h-64 shrink-0">
                <div aria-hidden className="absolute inset-0 rounded-full border border-primary/30" />
                <div aria-hidden className="absolute inset-4 rounded-full border border-cyber-green/30 animate-[spin_30s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
                <div aria-hidden className="absolute inset-10 rounded-full border border-primary/20" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-cyber-green/20 to-primary/5 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
                  <Fingerprint className="w-16 h-16 text-primary" strokeWidth={1.2} />
                </div>
                <div aria-hidden className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                <div aria-hidden className="absolute bottom-6 left-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            {/* corner ticks */}
            <span aria-hidden className="absolute top-3 left-3 w-3 h-3 border-t border-l border-primary/60" />
            <span aria-hidden className="absolute top-3 right-3 w-3 h-3 border-t border-r border-primary/60" />
            <span aria-hidden className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-primary/60" />
            <span aria-hidden className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-primary/60" />
          </motion.a>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ForensicEngineCard;
