import { useEffect, useState } from 'react';
import { Activity, BarChart3, Boxes, Crosshair, Network, Radio, Server, ShieldCheck, Swords, Target, Users } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import { Button } from '@/components/ui/button';
import { getOrganizationOffering, type OrganizationOffering } from '@/lib/organization-offerings-store';
import { waLink } from '@/lib/site-settings';

const capabilities = [
  { icon: Swords, title: '200+ Attack Simulations', text: 'Practice ransomware, phishing, web exploitation, privilege escalation, lateral movement and cloud attack scenarios.' },
  { icon: Boxes, title: 'Isolated In-House Lab', text: 'Run repeatable exercises in a private environment without putting production systems or business data at risk.' },
  { icon: Users, title: 'Team & Student Training', text: 'Create guided learning paths for SOC analysts, IT teams, students, faculty and incident-response groups.' },
  { icon: Activity, title: 'Live Red vs Blue Exercises', text: 'Develop offensive and defensive skills through realistic attacker-versus-defender simulations.' },
  { icon: BarChart3, title: 'Progress & Reporting', text: 'Measure completion, response time and practical capability with clear exercise-level reporting.' },
  { icon: Network, title: 'Custom Scenarios', text: 'Align labs to your infrastructure, curriculum, security controls and organization-specific risks.' },
];

const CyberRange = () => {
  const [offering, setOffering] = useState<OrganizationOffering | undefined>();

  useEffect(() => {
    const refresh = () => setOffering(getOrganizationOffering('cyber-range'));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  const title = offering?.title || 'Launch Your Own Cyber Range';
  const description = offering?.description || 'Build an in-house training and simulation lab with 200+ realistic cyberattack scenarios.';

  return (
    <SiteFrame>
      <section className="px-4 pb-14 pt-10">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-green/40 bg-cyber-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyber-green"><Crosshair className="h-4 w-4" /> Cyber Training Infrastructure</span>
            <h1 className="mt-6 max-w-5xl font-display text-4xl font-extrabold leading-tight text-foreground md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
            <Button asChild size="lg" className="mt-8 rounded-full">
              <a href={waLink('Hi Tech Guardians, I want to launch an in-house Cyber Range for training simulations.')} target="_blank" rel="noopener noreferrer">Plan My Cyber Range <Crosshair className="h-4 w-4" /></a>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="container mx-auto mb-10 max-w-6xl overflow-hidden rounded-lg border border-cyber-green/30 bg-card/70 p-5 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div><span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyber-green">Live Exercise Map</span><h2 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">Attack simulation control room</h2></div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyber-green"><span className="h-2 w-2 animate-pulse rounded-full bg-cyber-green" /> RANGE ONLINE</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="relative min-h-72 overflow-hidden rounded-lg border border-border bg-background/80">
              <div className="absolute inset-0 opacity-40 grid-pattern" />
              <div className="absolute left-[8%] top-[18%] flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-background text-primary shadow-[0_0_28px_hsl(var(--primary)/0.3)]"><Server className="h-5 w-5" /></div>
              <div className="absolute left-[43%] top-[40%] flex h-16 w-16 items-center justify-center rounded-full border border-cyber-green/60 bg-background text-cyber-green shadow-[0_0_32px_hsl(var(--cyber-green)/0.35)]"><ShieldCheck className="h-7 w-7" /></div>
              <div className="absolute right-[9%] top-[16%] flex h-12 w-12 items-center justify-center rounded-full border border-destructive/60 bg-background text-destructive"><Target className="h-5 w-5" /></div>
              <div className="absolute bottom-[12%] left-[19%] flex h-11 w-11 items-center justify-center rounded-full border border-cyber-orange/60 bg-background text-cyber-orange"><Radio className="h-5 w-5" /></div>
              <div className="absolute bottom-[10%] right-[18%] flex h-11 w-11 items-center justify-center rounded-full border border-primary/50 bg-background text-primary"><Network className="h-5 w-5" /></div>
              <svg className="absolute inset-0 h-full w-full" aria-hidden="true"><line x1="14%" y1="25%" x2="48%" y2="49%" className="stroke-primary/45" strokeWidth="1.5" strokeDasharray="7 7"/><line x1="86%" y1="23%" x2="55%" y2="48%" className="stroke-destructive/50" strokeWidth="1.5" strokeDasharray="7 7"/><line x1="25%" y1="80%" x2="48%" y2="58%" className="stroke-cyber-orange/45" strokeWidth="1.5"/><line x1="80%" y1="81%" x2="56%" y2="58%" className="stroke-primary/45" strokeWidth="1.5"/></svg>
              <div className="absolute bottom-3 left-3 rounded border border-border bg-background/90 px-3 py-2 font-mono text-[11px] text-cyber-green">DEFENSE NODE: ACTIVE</div>
            </div>
            <div className="space-y-3">
              {[['Scenarios ready', '200+'], ['Isolated networks', '12'], ['Active teams', '08'], ['Detection status', 'LIVE']].map(([label, value], index) => <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-background/65 p-4"><span className="text-xs text-muted-foreground">{label}</span><strong className={index === 3 ? 'text-cyber-green' : 'text-foreground'}>{value}</strong></div>)}
            </div>
          </div>
        </div>
        <div className="container mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => (
            <ScrollReveal key={item.title}>
              <article className="h-full rounded-lg border border-border bg-card/75 p-6 transition-colors hover:border-cyber-green/45">
                <item.icon className="h-6 w-6 text-cyber-green" />
                <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl rounded-lg border border-primary/35 bg-primary/5 p-8 text-center md:p-12">
          <ShieldCheck className="mx-auto h-9 w-9 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground md:text-3xl">Turn cyber knowledge into operational readiness</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Deploy a controlled training environment tailored to your organization, institute or security team.</p>
          <Button asChild className="mt-7 rounded-full">
            <a href={waLink('Hi Tech Guardians, please share details for an in-house Cyber Range.')} target="_blank" rel="noopener noreferrer">Discuss Requirements</a>
          </Button>
        </div>
      </section>
    </SiteFrame>
  );
};

export default CyberRange;