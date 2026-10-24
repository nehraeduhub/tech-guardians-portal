import { motion } from 'framer-motion';
import {
  ArrowRight, Award, BookOpen, Building2, CheckCircle2, ClipboardCheck, Crosshair, Eye, GraduationCap, HeartHandshake, Landmark,
  Lightbulb, MessageCircle, Package, ScanSearch, School, ShieldCheck, Siren, Target, Users,
} from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import LazyScene from '@/components/pro/LazyScene';
import { waLink } from '@/lib/site-settings';
import { useAboutContent } from '@/lib/about-settings';
import tgLogo from '@/assets/tg-logo.png';
import dkPhoto from '@/assets/founder-dk-jha.jpg';
import rjPhoto from '@/assets/founder-rj-nehra.jpg';
import teamPhoto from '@/assets/hands-on-practical.jpg';
import { safeLink } from '@/lib/utils';

const services = [
  { icon: Users, title: 'Cyber awareness programmes', text: 'Live sessions for schools, colleges, offices and communities on scams, phishing, social media safety and reporting cyber crime — online or on campus.', link: '/courses/awareness-booking.html' },
  { icon: GraduationCap, title: 'Training Programs', text: 'Mentor-led, hands-on programs in ethical hacking, networks, firewalls, Active Directory, web hosting and AI automation, with a certificate.', link: '/training' },
  { icon: Siren, title: 'Cyber crime support', text: 'Step-by-step help for victims of online fraud, hacking and identity theft: what to do first, how to report on 1930, and how to recover accounts.', link: '/cyber-crime-support' },
  { icon: ScanSearch, title: 'Forensic & threat intelligence portals', text: 'Free tools for investigators and citizens: live lookups, official complaint portals, breach checks, threat intel and a cyber crime news desk.', link: '/forensic-engine.html' },
  { icon: ClipboardCheck, title: 'Security assessments & Cyber Range', text: 'Network, firewall and vulnerability assessments for organisations, and in-house cyber ranges for realistic attack-and-defence practice.', link: '/security-assessment' },
  { icon: Package, title: 'Products & solutions', text: 'Security tools such as our VAPT and Windows audit & hardening tools, secure website and app development, and product training for teams.', link: '/products' },
];

const audiences = [
  { icon: School, title: 'Students & colleges', text: 'Career-ready skills and safe online habits.' },
  { icon: HeartHandshake, title: 'Families & citizens', text: 'Recognise scams and protect loved ones.' },
  { icon: Building2, title: 'Businesses & IT teams', text: 'Assess, harden and train against real attacks.' },
  { icon: Landmark, title: 'Police & government', text: 'Investigation tools and digital-evidence training.' },
];

const approach = [
  { title: 'Aware', text: 'We start with real cases people can relate to, so the risk is clear and personal.' },
  { title: 'Practise', text: 'Every lesson becomes a hands-on lab or live demo — learning by doing, not by slides.' },
  { title: 'Protect', text: 'Learners leave with checklists, tools and settings they can apply the same day.' },
  { title: 'Share', text: 'Everyone we train passes it on. That is how a whole community becomes safer.' },
];

const values = [
  { icon: ShieldCheck, title: 'Ethics first', text: 'We teach offensive skills only for defence, on systems you own or are allowed to test.' },
  { icon: Lightbulb, title: 'Practical and simple', text: 'Clear language, real tools, real scenarios — no unnecessary jargon.' },
  { icon: BookOpen, title: 'Affordable for all', text: 'Free awareness and portals, and fairly priced programs with transparent offers.' },
  { icon: Award, title: 'Always learning', text: 'Threats change every week; so do our labs, guides and news desk.' },
];

const About = () => {
  const c = useAboutContent();
  return (
  <SiteFrame>
    {/* Hero */}
    <section className="tg-dark tg-band relative overflow-hidden border-b border-border/70 pt-10">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      <LazyScene variant="rings" className="pointer-events-none absolute -right-16 top-0 hidden h-[520px] w-[560px] opacity-60 lg:block" />
      <div className="container relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ScrollReveal>
          <img src={tgLogo} alt="Tech Guardians" className="h-14 w-14 rounded-xl object-contain" />
          <span className="rl-eyebrow mt-6">About Tech Guardians</span>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-6xl" style={{ textWrap: 'balance' }}>
            {c.heroTitle} {c.heroHighlight && <span className="cyber-gradient-text">{c.heroHighlight}</span>}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
            {c.heroText}{c.motto && <strong className="text-foreground"> {c.motto}</strong>}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={waLink('Hello Tech Guardians, I would like to know more about your work.')} target="_blank" rel="noopener noreferrer" className="cyber-btn-primary"><MessageCircle className="h-4 w-4" /> Talk to us</a>
            <a href="#what-we-do" className="cyber-btn-outline">What we do</a>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.5)]">
            <img src={c.photo || teamPhoto} alt="Tech Guardians hands-on training" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-5">
              <p className="font-display text-xs uppercase tracking-[0.25em] text-primary">Hands-on, always</p>
              <p className="mt-1 text-sm text-foreground">{c.photoCaption}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* Stats */}
    <section className="px-4 py-12 md:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border md:grid-cols-4">
          {c.stats.map((stat, i) => <div key={i} className="border-border bg-card/60 p-6 text-center even:border-l md:border-l first:border-l-0"><strong className="block font-display text-3xl text-primary md:text-4xl">{stat.value}</strong><span className="mt-2 block text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</span></div>)}
        </div>
      </div>
    </section>

    {/* Story */}
    <section className="section-padding pt-8">
      <div className="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <ScrollReveal>
          <span className="rl-eyebrow">Who we are</span>
          <h2 className="mt-4 text-3xl font-bold text-foreground">{c.storyTitle}</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
            {c.story.split(/\n\s*\n/).filter((p) => p.trim()).map((p, i) => <p key={i}>{p.trim()}</p>)}
          </div>
        </ScrollReveal>
        <div className="grid gap-5">
          <ScrollReveal><div className="glass-card h-full p-7"><Target className="h-8 w-8 text-primary" /><h3 className="mt-4 text-xl font-bold text-foreground">Our mission</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{c.mission}</p></div></ScrollReveal>
          <ScrollReveal><div className="glass-card h-full p-7"><Eye className="h-8 w-8 text-cyber-green" /><h3 className="mt-4 text-xl font-bold text-foreground">Our vision</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{c.vision}</p></div></ScrollReveal>
        </div>
      </div>
    </section>

    {/* What we do */}
    <section id="what-we-do" className="section-padding scroll-mt-24 border-y border-border/60 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal><div className="text-center"><span className="rl-eyebrow">What we do</span><h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">One team, six ways to keep you safe</h2></div></ScrollReveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} delay={(i % 3) * 0.06}>
              <a href={safeLink(s.link)} className="glass-card group flex h-full flex-col p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary"><s.icon className="h-6 w-6" /></span>
                <h3 className="mt-5 text-lg font-semibold text-foreground group-hover:text-primary">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{s.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 font-display text-xs uppercase tracking-wider text-primary">Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Approach */}
    <section className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal><div className="text-center"><span className="rl-eyebrow">How we work</span><h2 className="mt-4 text-3xl font-bold text-foreground">Aware → Practise → Protect → Share</h2></div></ScrollReveal>
        <ol className="mt-12 grid gap-5 md:grid-cols-4">
          {approach.map((a, i) => (
            <ScrollReveal key={a.title} delay={i * 0.06}>
              <li className="glass-card relative h-full p-6">
                <span className="font-display text-4xl font-bold text-primary/30">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.text}</p>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>

    {/* Who we serve + values */}
    <section className="section-padding border-y border-border/60 bg-card/30">
      <div className="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <span className="rl-eyebrow">Who we serve</span>
          <h2 className="mt-4 text-3xl font-bold text-foreground">From first-time phone users to SOC teams</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {audiences.map((a) => <div key={a.title} className="glass-card p-5"><a.icon className="h-6 w-6 text-cyber-green" /><h3 className="mt-3 font-semibold text-foreground">{a.title}</h3><p className="mt-1 text-sm text-muted-foreground">{a.text}</p></div>)}
          </div>
        </div>
        <div>
          <span className="rl-eyebrow">What we stand for</span>
          <h2 className="mt-4 text-3xl font-bold text-foreground">Our values</h2>
          <ul className="mt-8 space-y-4">
            {values.map((v) => <li key={v.title} className="glass-card flex gap-4 p-5"><v.icon className="h-6 w-6 shrink-0 text-primary" /><div><h3 className="font-semibold text-foreground">{v.title}</h3><p className="mt-1 text-sm text-muted-foreground">{v.text}</p></div></li>)}
          </ul>
        </div>
      </div>
    </section>

    {/* Leadership */}
    <section className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal><div className="text-center"><span className="rl-eyebrow">Leadership</span><h2 className="mt-4 text-3xl font-bold text-foreground">People behind the mission</h2></div></ScrollReveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ScrollReveal direction="left"><div className="glass-card flex h-full flex-col gap-6 p-7 sm:flex-row"><img src={dkPhoto} alt="D K Jha" className="h-28 w-28 shrink-0 rounded-lg object-cover object-top"/><div><h3 className="text-xl font-bold text-foreground">D K Jha</h3><p className="mt-1 text-xs uppercase tracking-widest text-primary">Founder & Chief Executive Officer</p><p className="mt-4 text-sm leading-6 text-muted-foreground">Cybersecurity educator and ethical hacker focused on practical instruction, cyber forensics, network security, public awareness, and cyber-crime response.</p></div></div></ScrollReveal>
          <ScrollReveal direction="right"><motion.a whileHover={{ y: -4 }} href="/rj-nehra" className="glass-card group flex h-full flex-col gap-6 p-7 sm:flex-row"><img src={rjPhoto} alt="RJ Nehra" className="h-28 w-28 shrink-0 rounded-lg object-cover object-top"/><div><h3 className="flex items-center gap-2 text-xl font-bold text-foreground">RJ Nehra <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1"/></h3><p className="mt-1 text-xs uppercase tracking-widest text-cyber-green">Co-Founder & Cyber Security Professional</p><p className="mt-4 text-sm leading-6 text-muted-foreground">A 12-year IT professional specializing in security operations, digital forensics, threat intelligence, enterprise infrastructure, and hands-on cyber-range development.</p><span className="mt-4 inline-block text-xs font-semibold text-primary">View professional profile</span></div></motion.a></ScrollReveal>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section-padding pt-0">
      <div className="container mx-auto max-w-5xl rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center md:p-12">
        <Crosshair className="mx-auto h-8 w-8 text-primary"/>
        <h2 className="mt-5 text-3xl font-bold text-foreground">{c.ctaTitle}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{c.ctaText}</p>
        <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {['Free awareness portals', 'Live, hands-on training', 'Victim support & guidance', 'Tools for organisations'].map((t) => <li key={t} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyber-green" />{t}</li>)}
        </ul>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={waLink('Hello Tech Guardians, I would like to learn more about your cybersecurity services.')} target="_blank" rel="noopener noreferrer" className="cyber-btn-primary">Connect with Tech Guardians</a>
          <a href="/training" className="cyber-btn-outline">Explore Training Programs</a>
        </div>
      </div>
    </section>
  </SiteFrame>
  );
};

export default About;
