import { motion } from 'framer-motion';
import { ArrowRight, Award, BookOpen, Eye, Globe2, ShieldCheck, Target, Users } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import { waLink } from '@/lib/site-settings';
import tgLogo from '@/assets/tg-logo.png';
import dkPhoto from '@/assets/founder-dk-jha.jpg';
import rjPhoto from '@/assets/founder-rj-nehra.jpg';

const pillars = [
  { icon: ShieldCheck, title: 'Protect', desc: 'Practical knowledge and services that help people and organizations defend against evolving digital threats.' },
  { icon: BookOpen, title: 'Learn', desc: 'Accessible awareness, mentor-led courses, live demonstrations, and hands-on cyber labs.' },
  { icon: Target, title: 'Respond', desc: 'Clear guidance, cyber-crime support, threat intelligence, and investigation-focused resources.' },
];

const stats = [
  { value: '150+', label: 'Awareness sessions' },
  { value: '5,000+', label: 'Learners trained' },
  { value: '200+', label: 'Learning resources' },
  { value: '24/7', label: 'Support access' },
];

const About = () => (
  <SiteFrame>
    <section className="section-padding relative overflow-hidden border-b border-border/70">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      <div className="container relative mx-auto max-w-6xl text-center">
        <ScrollReveal>
          <img src={tgLogo} alt="Tech Guardians" className="mx-auto h-16 w-16 rounded-xl object-contain" />
          <span className="rl-eyebrow mt-7">About Tech Guardians</span>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold leading-tight text-foreground md:text-6xl">
            Building a safer digital India through <span className="cyber-gradient-text">knowledge and action</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground">Tech Guardians is a cybersecurity awareness, practical training, and digital forensics organization helping citizens, learners, and institutions understand threats, build skills, and respond confidently.</p>
        </ScrollReveal>
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        <ScrollReveal direction="left"><div className="glass-card h-full p-8"><Target className="h-8 w-8 text-primary" /><h2 className="mt-5 text-2xl font-bold text-foreground">Our mission</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">To make cybersecurity knowledge practical and accessible through awareness programs, real labs, affordable training, and dependable support for students, families, professionals, institutions, and businesses.</p></div></ScrollReveal>
        <ScrollReveal direction="right"><div className="glass-card h-full p-8"><Eye className="h-8 w-8 text-cyber-green" /><h2 className="mt-5 text-2xl font-bold text-foreground">Our vision</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">A cyber-resilient India where people can recognize digital risks, secure their online lives, and take informed action with support from a skilled community of ethical defenders.</p></div></ScrollReveal>
      </div>
    </section>

    <section className="section-padding border-y border-border/60 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal><div className="text-center"><span className="rl-eyebrow">What guides us</span><h2 className="mt-4 text-3xl font-bold text-foreground">Keep Learning and Keep Sharing</h2></div></ScrollReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{pillars.map((p, i) => <ScrollReveal key={p.title} delay={i * 0.08}><div className="glass-card h-full p-7"><p.icon className="h-7 w-7 text-primary"/><h3 className="mt-5 text-lg font-semibold text-foreground">{p.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{p.desc}</p></div></ScrollReveal>)}</div>
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border md:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="border-border bg-card/60 p-6 text-center even:border-l md:border-l first:border-l-0"><strong className="block font-display text-2xl text-primary md:text-3xl">{stat.value}</strong><span className="mt-2 block text-xs text-muted-foreground">{stat.label}</span></div>)}</div>
      </div>
    </section>

    <section className="section-padding pt-0">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal><div className="text-center"><span className="rl-eyebrow">Leadership</span><h2 className="mt-4 text-3xl font-bold text-foreground">People behind the mission</h2></div></ScrollReveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ScrollReveal direction="left"><div className="glass-card flex h-full flex-col gap-6 p-7 sm:flex-row"><img src={dkPhoto} alt="D K Jha" className="h-28 w-28 shrink-0 rounded-lg object-cover object-top"/><div><h3 className="text-xl font-bold text-foreground">D K Jha</h3><p className="mt-1 text-xs uppercase tracking-widest text-primary">Founder & Chief Executive Officer</p><p className="mt-4 text-sm leading-6 text-muted-foreground">Cybersecurity educator and ethical hacker focused on practical instruction, cyber forensics, network security, public awareness, and cyber-crime response.</p></div></div></ScrollReveal>
          <ScrollReveal direction="right"><motion.a whileHover={{ y: -4 }} href="/rj-nehra" className="glass-card group flex h-full flex-col gap-6 p-7 sm:flex-row"><img src={rjPhoto} alt="RJ Nehra" className="h-28 w-28 shrink-0 rounded-lg object-cover object-top"/><div><h3 className="flex items-center gap-2 text-xl font-bold text-foreground">RJ Nehra <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1"/></h3><p className="mt-1 text-xs uppercase tracking-widest text-cyber-green">Co-Founder & Cyber Security Professional</p><p className="mt-4 text-sm leading-6 text-muted-foreground">A 12-year IT professional specializing in security operations, digital forensics, threat intelligence, enterprise infrastructure, and hands-on cyber-range development.</p><span className="mt-4 inline-block text-xs font-semibold text-primary">View professional profile</span></div></motion.a></ScrollReveal>
        </div>
      </div>
    </section>

    <section className="section-padding pt-0">
      <div className="container mx-auto max-w-5xl rounded-xl border border-primary/30 bg-primary/5 p-8 text-center md:p-12"><Globe2 className="mx-auto h-8 w-8 text-primary"/><h2 className="mt-5 text-3xl font-bold text-foreground">Cybersecurity built around real-world needs</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">From awareness and ethical hacking to forensics, threat intelligence, and practical training environments, Tech Guardians helps turn knowledge into confident action.</p><a href={waLink('Hello Tech Guardians, I would like to learn more about your cybersecurity services.')} target="_blank" rel="noopener noreferrer" className="cyber-btn-primary mt-7">Connect with Tech Guardians</a></div>
    </section>
  </SiteFrame>
);

export default About;