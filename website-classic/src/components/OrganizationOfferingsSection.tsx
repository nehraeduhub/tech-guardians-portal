import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Crosshair, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { Button } from '@/components/ui/button';
import { loadOrganizationOfferings, type OrganizationOffering } from '@/lib/organization-offerings-store';

const OrganizationOfferingsSection = () => {
  const [offerings, setOfferings] = useState<OrganizationOffering[]>([]);

  useEffect(() => {
    const refresh = () => setOfferings(loadOrganizationOfferings().filter((item) => item.homeVisible));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  if (!offerings.length) return null;

  return (
    <section id="organization-services" className="px-4 py-14">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="mb-8 max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyber-green">Organization Security</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-5xl">Assess. Simulate. Defend.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">Practical security services for stronger systems and better-prepared teams.</p>
          </div>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-2">
          {offerings.map((item, index) => {
            const Icon = item.type === 'range' ? Crosshair : ShieldCheck;
            const accent = index % 2 === 0 ? 'text-primary border-primary/35' : 'text-cyber-green border-cyber-green/35';
            return (
              <ScrollReveal key={item.id}>
                <article className="group relative h-full overflow-hidden rounded-lg border border-border bg-card/80 p-7 shadow-[0_24px_60px_-36px_hsl(var(--primary)/0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 md:p-9">
                  <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />
                  <div className="relative">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg border bg-background/70 ${accent}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-bold leading-tight text-foreground">{item.title}</h3>
                    <p className="mt-4 min-h-20 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    <Button asChild className="mt-6 rounded-full">
                      <Link to={item.page}>{item.buttonText}<ArrowUpRight className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OrganizationOfferingsSection;