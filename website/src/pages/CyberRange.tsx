import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BarChart3, Boxes, Building2, CheckCircle2, ChevronDown, Clock, Cloud, Crosshair, GraduationCap, Landmark,
  Layers, MonitorCheck, Network, Server, ShieldCheck, Swords, Target, Users,
} from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import { getOrganizationOffering, type OrganizationOffering } from '@/lib/organization-offerings-store';
import { RANGE_SCENARIOS, useList } from '@/lib/content-lists';
import { waLink } from '@/lib/site-settings';

const CONSOLE: [string, string][] = [
  ['dim', '$ range deploy --scenario ransomware-outbreak --team blue-02'],
  ['ok', '[✓] 14 virtual machines online · network 10.20.0.0/16 isolated'],
  ['ok', '[✓] SIEM, EDR and packet capture connected'],
  ['warn', '[!] 09:14:22  red team: phishing mail delivered to finance-pc-03'],
  ['warn', '[!] 09:16:05  powershell -enc … spawned by WINWORD.EXE'],
  ['info', '[i] 09:16:40  blue-02 raised alert TG-1043 (T1059.001)'],
  ['bad', '[x] 09:19:12  smb lateral movement → fileserver-01'],
  ['info', '[i] 09:21:30  blue-02 isolated finance-pc-03 and fileserver-01'],
  ['ok', '[✓] 09:24:02  encryption stopped · 0 files lost · score 92/100'],
];
const TONE: Record<string, string> = { dim: 'text-slate-400', ok: 'text-emerald-400', warn: 'text-amber-300', info: 'text-sky-300', bad: 'text-red-400' };

const LEVEL_STYLE: Record<string, string> = {
  Beginner: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  Intermediate: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  Advanced: 'border-red-500/40 bg-red-500/10 text-red-400',
};

const TRACKS = [
  { icon: MonitorCheck, title: 'SOC Analyst', weeks: '8 weeks', steps: ['Log sources & SIEM basics', 'Alert triage and phishing analysis', 'Threat hunting with Sysmon & Zeek', 'Incident report writing'] },
  { icon: Swords, title: 'Penetration Tester', weeks: '10 weeks', steps: ['Recon and scanning', 'Web & API exploitation', 'Active Directory attacks', 'Reporting and retesting'] },
  { icon: ShieldCheck, title: 'Incident Responder', weeks: '8 weeks', steps: ['Ransomware & BEC playbooks', 'Memory and disk forensics', 'Containment and recovery', 'Cyber-cell & legal evidence'] },
];

const STEPS = [
  { title: 'Assess', text: 'We study your team’s skill level, your infrastructure and your training goals.' },
  { title: 'Design', text: 'We choose scenarios and tracks, mapped to MITRE ATT&CK and your curriculum.' },
  { title: 'Deploy', text: 'We set up the isolated range on your premises, in the cloud or both.' },
  { title: 'Train & measure', text: 'Instructor-led exercises, live scoring and reports for every learner and team.' },
];

const MODELS = [
  { icon: Server, title: 'On-premise lab', text: 'Hardware and software installed in your institute or SOC. Full control, no internet needed during exercises.', points: ['Dedicated servers & network', 'Air-gapped option', 'Annual scenario updates'] },
  { icon: Cloud, title: 'Cloud range', text: 'Browser-based access for learners anywhere. Nothing to install, scale up for events and batches.', points: ['Launch labs in minutes', 'Pay per batch or yearly', 'Ideal for remote students'], featured: true },
  { icon: Layers, title: 'Hybrid', text: 'A small on-site lab for hands-on classes, plus cloud capacity for large exercises and CTFs.', points: ['Best of both', 'CTF & hackathon ready', 'Shared scoreboards'] },
];

const AUDIENCE = [
  { icon: GraduationCap, title: 'Colleges & universities', text: 'Practical labs for B.Tech, BCA, MCA and cyber security programmes.' },
  { icon: Building2, title: 'Enterprises & SOC teams', text: 'Drill your analysts and IT staff on the attacks you actually face.' },
  { icon: Landmark, title: 'Police & government', text: 'Investigation and digital-evidence training for cyber cells.' },
  { icon: Users, title: 'Training institutes', text: 'Add a hands-on range to your courses and certifications.' },
];

const FAQ = [
  ['Do learners need powerful computers?', 'No. In the cloud range everything runs on our servers; a laptop with a modern browser is enough. On-premise labs run on the hardware we install.'],
  ['Is it safe to run real attacks?', 'Yes. Every exercise runs in an isolated network with no route to your real systems or the internet, and resets in minutes.'],
  ['Can you build scenarios for our environment?', 'Yes. We create custom labs that mirror your network, applications and security tools.'],
  ['How are learners assessed?', 'Each scenario has objectives and flags. The range records time, actions and score, and gives per-learner and per-team reports.'],
  ['Do you provide instructors?', 'Yes. We can run instructor-led batches, train your faculty to run the range, or both.'],
];

const CyberRange = () => {
  const [offering, setOffering] = useState<OrganizationOffering | undefined>();
  const [lines, setLines] = useState(1);
  const [track, setTrack] = useState('All');
  const [level, setLevel] = useState('All');
  const [faq, setFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: '', org: '', type: 'College / University', learners: '', message: '' });
  const scenarios = (useList(RANGE_SCENARIOS) ?? RANGE_SCENARIOS.seed ?? []).filter((s) => s.visible && s.title);

  useEffect(() => {
    const refresh = () => setOffering(getOrganizationOffering('cyber-range'));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setLines(CONSOLE.length); return; }
    const t = window.setInterval(() => setLines((n) => (n >= CONSOLE.length + 4 ? 1 : n + 1)), 1100);
    return () => window.clearInterval(t);
  }, []);

  const tracks = useMemo(() => ['All', ...Array.from(new Set(scenarios.map((s) => String(s.track || '')).filter(Boolean)))], [scenarios]);
  const shown = scenarios.filter((s) => (track === 'All' || s.track === track) && (level === 'All' || s.level === level));

  const title = offering?.title || 'Launch Your Own Cyber Range';
  const description = offering?.description || 'An isolated, hands-on lab where your students and security teams practise real attacks and real defence — safely, repeatably and with measurable results.';
  const plan = waLink('Hi Tech Guardians, I want to launch an in-house Cyber Range for training simulations.');

  const enquire = (e: FormEvent) => {
    e.preventDefault();
    const text = `Hi Tech Guardians, Cyber Range enquiry.\nName: ${form.name}\nOrganisation: ${form.org}\nType: ${form.type}\nLearners: ${form.learners || '—'}\n${form.message}`;
    window.open(waLink(text), '_blank', 'noopener');
  };
  const input = 'w-full rounded-lg border border-border bg-background/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none';

  return (
    <SiteFrame>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 grid-pattern" />
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="container relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Crosshair className="h-4 w-4" /> Tech Guardians Cyber Range</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] md:text-6xl" style={{ textWrap: 'balance' }}>{title}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={plan} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Plan my Cyber Range <ArrowRight className="h-4 w-4" /></a>
              <a href="#scenarios" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted">Explore scenarios</a>
            </div>
            <ul className="mt-8 grid max-w-lg grid-cols-2 gap-2 text-sm text-muted-foreground">
              {['Real attacks, zero risk', 'MITRE ATT&CK mapped', 'Live scoring & reports', 'Instructor-led or self-paced'].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-cyber-green" />{t}</li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <div className="overflow-hidden rounded-2xl border border-border bg-[#060b16] shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.45)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/80" /><span className="h-3 w-3 rounded-full bg-amber-400/80" /><span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-xs text-slate-400">range-console · exercise #2471</span>
                <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />LIVE</span>
              </div>
              <div className="grid grid-cols-3 gap-px border-b border-white/10 bg-white/10 text-center font-mono">
                {[['RED TEAM', '3 ops', 'text-red-400'], ['BLUE TEAM', '5 analysts', 'text-sky-300'], ['SCORE', lines > 8 ? '92' : '—', 'text-emerald-400']].map(([k, v, c]) => (
                  <div key={k} className="bg-[#060b16] px-2 py-3"><div className="text-[10px] tracking-widest text-slate-500">{k}</div><div className={`text-sm font-bold ${c}`}>{v}</div></div>
                ))}
              </div>
              <pre className="h-72 overflow-hidden whitespace-pre-wrap p-4 font-mono text-[12.5px] leading-relaxed" aria-label="Example exercise log">
                {CONSOLE.slice(0, Math.min(lines, CONSOLE.length)).map(([tone, text], i) => <div key={i} className={TONE[tone]}>{text}</div>)}
                <span className="tg-caret text-emerald-400">▋</span>
              </pre>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50 px-4 py-8">
        <dl className="container mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[['200+', 'Attack & defence scenarios'], ['12', 'Isolated lab networks'], ['7', 'Skill tracks'], ['24×7', 'Cloud lab access']].map(([v, k]) => (
            <div key={k}><dd className="font-display text-3xl font-bold text-primary md:text-4xl">{v}</dd><dt className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{k}</dt></div>
          ))}
        </dl>
      </section>

      {/* Scenarios */}
      <section id="scenarios" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Scenario catalogue</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Train on the attacks that hit India</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">A sample of our labs. Each one has a story, objectives, hints and an automatic score.</p>
            </div>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-border p-1 text-xs" role="group" aria-label="Level">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} className={`rounded-full px-3 py-1.5 font-semibold ${level === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {tracks.map((t) => (
              <button key={t} onClick={() => setTrack(t)} aria-pressed={track === t} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${track === t ? 'bg-foreground text-background' : 'border border-border text-muted-foreground hover:text-foreground'}`}>{t}</button>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => (
              <article key={s.id} className="group flex flex-col rounded-2xl border border-border bg-card/70 p-5 transition-colors hover:border-primary/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">{String(s.track || '')}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${LEVEL_STYLE[String(s.level)] || 'border-border text-muted-foreground'}`}>{String(s.level || '')}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-snug">{String(s.title)}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{String(s.description || '')}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  {s.duration && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{String(s.duration)}</span>}
                  {s.mitre && <span className="inline-flex items-center gap-1 font-mono"><Target className="h-3.5 w-3.5" />{String(s.mitre)}</span>}
                </div>
              </article>
            ))}
            {shown.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No scenarios match these filters.</p>}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="bg-card/40 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-primary">Learning paths</p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold md:text-4xl">From beginner to job-ready</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TRACKS.map((t) => (
              <ScrollReveal key={t.title}>
                <article className="h-full rounded-2xl border border-border bg-background/70 p-6">
                  <div className="flex items-center justify-between"><t.icon className="h-8 w-8 text-primary" /><span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{t.weeks}</span></div>
                  <h3 className="mt-4 font-display text-xl font-bold">{t.title}</h3>
                  <ol className="mt-4 space-y-3">
                    {t.steps.map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">{i + 1}</span><span className="pt-0.5 text-muted-foreground">{step}</span></li>
                    ))}
                  </ol>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Your range, live in four steps</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-border bg-card/70 p-5">
                <span className="font-display text-4xl font-bold text-primary/30">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Deployment */}
      <section className="bg-card/40 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-primary">Deployment</p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold md:text-4xl">Choose how you run it</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {MODELS.map((m) => (
              <article key={m.title} className={`relative rounded-2xl border p-6 ${m.featured ? 'border-primary bg-primary/5 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.6)]' : 'border-border bg-background/70'}`}>
                {m.featured && <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary-foreground">Most chosen</span>}
                <m.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
                <ul className="mt-4 space-y-2 text-sm">{m.points.map((p) => <li key={p} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyber-green" />{p}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Audience + features */}
      <section className="px-4 py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Who it’s for</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Built for every security learner</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {AUDIENCE.map((a) => (
                <div key={a.title} className="rounded-xl border border-border bg-card/70 p-4"><a.icon className="h-6 w-6 text-primary" /><h3 className="mt-2 font-semibold">{a.title}</h3><p className="mt-1 text-sm text-muted-foreground">{a.text}</p></div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Inside the range</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Everything a real SOC has</h2>
            <ul className="mt-6 space-y-3">
              {[[Boxes, 'Isolated virtual networks', 'Windows, Linux, AD, web apps, firewalls and IoT devices per team.'],
                [Network, 'Real security tools', 'SIEM, EDR, IDS, packet capture and forensics workstations.'],
                [Swords, 'Red vs Blue exercises', 'Attackers and defenders compete live with a shared scoreboard.'],
                [BarChart3, 'Reports that prove skill', 'Time-to-detect, actions and scores for every learner and team.']].map(([Icon, t, d]) => {
                const I = Icon as typeof Boxes;
                return <li key={t as string} className="flex gap-4 rounded-xl border border-border bg-card/70 p-4"><I className="h-6 w-6 shrink-0 text-primary" /><div><h3 className="font-semibold">{t as string}</h3><p className="text-sm text-muted-foreground">{d as string}</p></div></li>;
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ + enquiry */}
      <section id="enquire" className="scroll-mt-24 bg-card/40 px-4 py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Questions</h2>
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-background/70">
              {FAQ.map(([qn, a], i) => (
                <div key={qn}>
                  <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold">
                    {qn}<ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${faq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {faq === i && <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>}
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={enquire} className="rounded-2xl border border-primary/40 bg-background/80 p-6">
            <h2 className="font-display text-2xl font-bold">Get a proposal</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tell us a little about you. We reply on WhatsApp with a plan and quote.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-sm"><span className="mb-1 block text-muted-foreground">Your name</span><input required className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="text-sm"><span className="mb-1 block text-muted-foreground">Organisation</span><input required className={input} value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} /></label>
              <label className="text-sm"><span className="mb-1 block text-muted-foreground">Type</span>
                <select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {['College / University', 'Company / SOC', 'Police / Government', 'Training institute', 'Other'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="text-sm"><span className="mb-1 block text-muted-foreground">Number of learners</span><input className={input} inputMode="numeric" value={form.learners} onChange={(e) => setForm({ ...form, learners: e.target.value })} /></label>
              <label className="text-sm sm:col-span-2"><span className="mb-1 block text-muted-foreground">What do you need?</span><textarea rows={3} className={input} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
            </div>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Send on WhatsApp <ArrowRight className="h-4 w-4" /></button>
          </form>
        </div>
      </section>
    </SiteFrame>
  );
};

export default CyberRange;
