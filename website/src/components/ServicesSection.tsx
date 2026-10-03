import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import { HardDrive, Bot, Globe } from 'lucide-react';
import { ENROLL_URL } from '@/lib/site-content';

const services = [
  {
    icon: HardDrive,
    title: 'Online Data Recovery',
    desc: 'Accidentally deleted files from your laptop or phone? We recover them remotely and securely — no physical access needed.',
    price: '₹2,999',
    btn: 'Get Help Now',
    glow: 'blue' as const,
  },
  {
    icon: Bot,
    title: 'Build AI Agents for Business',
    desc: 'Custom AI agents tailored to automate and power your business workflows.',
    price: '₹50,999',
    btn: 'Request a Demo',
    glow: 'purple' as const,
  },
  {
    icon: Globe,
    title: 'Business Website + Mobile App',
    desc: 'Get a professional website and mobile app built with self-hosting support.',
    price: '₹20,999',
    btn: 'Start Your Project',
    glow: 'green' as const,
  },
];

const ServicesSection = () => (
  <section id="services" className="section-padding relative">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-purple mb-4 block">Services</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Tech Guardians <span className="neon-text-purple text-cyber-purple">Services</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <ScrollReveal key={s.title} delay={i * 0.1}>
            <GlassCard glowColor={s.glow} className="h-full flex flex-col">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-5">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-3 text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{s.desc}</p>
              <div className="mb-4">
                <span className="text-xs text-muted-foreground">Starting at </span>
                <span className="font-display text-lg font-bold text-primary tabular-nums">{s.price}/-</span>
              </div>
              <a href={ENROLL_URL} target="_blank" rel="noopener noreferrer" className="cyber-btn-outline w-full text-center block">{s.btn}</a>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
