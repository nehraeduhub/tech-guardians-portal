import { Link } from 'react-router-dom';
import { ShieldCheck, Network, Lock, Activity, ArrowUpRight, ScanLine } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const points = [
  { icon: Network, label: 'Network Security Assessment' },
  { icon: Lock, label: 'Firewall & VPN Consulting' },
  { icon: Activity, label: 'Vulnerability Assessment' },
  { icon: ShieldCheck, label: 'Security Awareness Training' },
];

const SecurityAssessmentBanner = () => (
  <section id="security-assessment" className="py-14 px-4">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="group relative overflow-hidden rounded-2xl border border-primary/40 bg-card/90 px-6 py-10 shadow-[0_30px_80px_-35px_hsl(var(--primary)/0.65)] backdrop-blur md:px-12 md:py-14 [transform:perspective(1200px)_rotateX(0.8deg)] transition-transform duration-500 hover:[transform:perspective(1200px)_rotateX(0deg)_translateY(-4px)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(60% 80% at 15% 10%, hsl(var(--primary) / 0.16), transparent 60%), radial-gradient(50% 70% at 90% 90%, hsl(var(--primary) / 0.10), transparent 60%)',
            }}
          />
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
          <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full border border-primary/20" />
          <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full border border-cyber-green/20" />
          <ScanLine className="pointer-events-none absolute right-12 top-12 hidden h-20 w-20 text-primary/15 md:block" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Security Services
            </span>

            <h2 className="font-display mt-5 text-3xl md:text-5xl font-extrabold leading-[1.12] max-w-4xl">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, hsl(var(--cyber-green)), hsl(var(--primary)) 55%, hsl(var(--cyber-purple)))' }}
              >
                Secure Your Organization
              </span>
              <br />
              <span className="text-foreground">Before Attackers Find the </span>
              <span className="text-cyber-orange">Weaknesses.</span>
            </h2>

            <p className="mt-4 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Get expert cybersecurity guidance, network security assessment, firewall consulting,
              vulnerability assessment, and security awareness training from experienced professionals.
            </p>

            <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
              {points.map((p) => (
                <div
                  key={p.label}
                  className="flex min-h-16 items-center gap-3 rounded-lg border border-primary/20 bg-background/60 px-3.5 py-3 shadow-[0_12px_30px_-20px_hsl(var(--primary)/0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-cyber-green/50 hover:bg-primary/10"
                >
                  <p.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-[11.5px] md:text-xs font-medium text-foreground/90 leading-snug">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex">
              <Link
                to="/security-assessment"
                className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-bold text-background shadow-[0_10px_40px_-10px_hsl(var(--cyber-green)/0.8)] hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(90deg, hsl(var(--cyber-green)), hsl(var(--primary)))' }}
              >
                Explore Security Assessment <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Keep Learning, Keep Sharing
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default SecurityAssessmentBanner;
