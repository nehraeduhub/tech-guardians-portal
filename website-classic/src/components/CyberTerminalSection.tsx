import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TerminalSquare, ShieldCheck, Radar, Cpu } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const LINES = [
  '$ tg-scan --target user-device --deep',
  '[✓] Signature engine loaded  ·  4,812,330 IOCs',
  '[✓] Dark-web credential sweep .......... clean',
  '[!] Phishing domain blocked: secure-kyc-verify[.]top',
  '[✓] Ransomware behaviour monitor ....... active',
  '$ tg-intel --feed india --live',
  '[✓] CERT-In advisories synced (real-time)',
  '[✓] Cyber & Forensic Intelligence Hub ready',
  '$ status',
  'PROTECTION: ACTIVE   THREATS BLOCKED TODAY: 1,247',
];

const CyberTerminalSection = () => {
  const [out, setOut] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const idx = useRef(0);
  const ch = useRef(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      const line = LINES[idx.current % LINES.length];
      ch.current += 1;
      setTyped(line.slice(0, ch.current));
      if (ch.current >= line.length) {
        setOut((p) => [...p.slice(-7), line]);
        setTyped('');
        ch.current = 0;
        idx.current += 1;
      }
    }, 32);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
      <div className="container mx-auto max-w-6xl px-2 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <ScrollReveal>
            <div>
              <span className="rl-pill mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Live Defence Console
              </span>
              <h2 className="font-display text-3xl md:text-5xl leading-tight text-foreground" style={{ textWrap: 'balance' }}>
                Security that <span className="italic text-primary">runs in real time</span>
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
                Our detection stack continuously scans, correlates and blocks threats across
                devices, identities and networks — the same engine we teach in our labs.
              </p>
              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, label: 'Threats blocked', value: '1.2K/day' },
                  { icon: Radar, label: 'Live intel feeds', value: '12+' },
                  { icon: Cpu, label: 'Forensic tools', value: '38' },
                ].map((s) => (
                  <div key={s.label} className="glass-card px-4 py-4">
                    <s.icon className="w-5 h-5 text-primary mb-2" />
                    <div className="text-xl font-semibold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <motion.div
            initial={{ opacity: 0, rotateY: -14, y: 24 }}
            whileInView={{ opacity: 1, rotateY: -8, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ rotateY: 0, rotateX: 0, scale: 1.01 }}
            style={{ transformPerspective: 1200, transformStyle: 'preserve-3d' }}
            className="glass-card overflow-hidden neon-border"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/20 bg-background/60">
              <span className="w-3 h-3 rounded-full bg-destructive/80" />
              <span className="w-3 h-3 rounded-full bg-[hsl(var(--cyber-orange))]/80" />
              <span className="w-3 h-3 rounded-full bg-accent/80" />
              <span className="ml-3 inline-flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <TerminalSquare className="w-3.5 h-3.5" /> techguardians@soc: ~
              </span>
            </div>
            <div className="p-5 font-mono text-[12.5px] md:text-sm leading-relaxed min-h-[300px] bg-[#02040c]/80">
              {out.map((l, i) => (
                <div key={i} className={l.startsWith('[!]') ? 'text-destructive' : l.startsWith('$') ? 'text-primary' : 'text-accent'}>
                  {l}
                </div>
              ))}
              <div className="text-foreground/90">
                {typed}
                <span className="typing-cursor" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CyberTerminalSection;
