import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { Smartphone, Users, ShieldAlert, ClipboardCheck } from 'lucide-react';

const modules = [
  {
    icon: Smartphone,
    title: 'Secure Your Mobile Phone',
    desc: 'Step-by-step guide to lock down your smartphone — app permissions, encryption, and safe browsing.',
    color: 'cyber-blue',
  },
  {
    icon: Users,
    title: 'Secure Social Media',
    desc: 'Privacy settings, 2FA setup, and safe practices across Instagram, Facebook, WhatsApp, and more.',
    color: 'cyber-green',
  },
  {
    icon: ShieldAlert,
    title: 'Cyber Awareness India',
    desc: 'Know CERT-In guidelines, report cybercrime via 1930, and stay updated on latest Indian cyber threats.',
    color: 'cyber-orange',
  },
  {
    icon: ClipboardCheck,
    title: 'Weekly Security Checklist',
    desc: 'A practical weekly checklist to audit your digital hygiene — passwords, updates, backups, and more.',
    color: 'cyber-red',
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
  'cyber-blue': { bg: 'bg-primary/10', text: 'text-primary', border: 'hover:border-primary/40', shadow: 'hover:shadow-[0_0_30px_hsl(190_100%_50%/0.2)]' },
  'cyber-green': { bg: 'bg-cyber-green/10', text: 'text-cyber-green', border: 'hover:border-cyber-green/40', shadow: 'hover:shadow-[0_0_30px_hsl(160_100%_50%/0.2)]' },
  'cyber-orange': { bg: 'bg-[hsl(33_100%_55%/0.1)]', text: 'text-[hsl(var(--cyber-orange))]', border: 'hover:border-[hsl(var(--cyber-orange)/0.4)]', shadow: 'hover:shadow-[0_0_30px_hsl(33_100%_55%/0.2)]' },
  'cyber-red': { bg: 'bg-destructive/10', text: 'text-destructive', border: 'hover:border-destructive/40', shadow: 'hover:shadow-[0_0_30px_hsl(0_100%_62%/0.2)]' },
};

const SecurityModulesSection = () => (
  <section id="security-modules" className="section-padding relative">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">Security Modules</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Your Digital <span className="neon-text text-primary">Defense Kit</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {modules.map((m, i) => {
          const c = colorClasses[m.color];
          return (
            <ScrollReveal key={m.title} delay={i * 0.08}>
              <motion.div
                className={`glass-card light-sweep p-6 h-full cursor-pointer transition-all duration-500 ${c.border} ${c.shadow}`}
                whileHover={{ y: -6, rotateX: 3, rotateY: 3 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${c.bg} mb-5`}>
                  <m.icon className={`w-7 h-7 ${c.text}`} />
                </div>
                <h3 className="font-display text-sm font-semibold mb-3 text-foreground">{m.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  </section>
);

export default SecurityModulesSection;
