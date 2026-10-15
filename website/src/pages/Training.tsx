import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight, Award, BadgeCheck, CalendarClock, CheckCircle2, ChevronDown, Clock, GraduationCap, Laptop, MessageCircle,
  MonitorPlay, Signal, Users, Wrench,
} from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import PageHero from '@/components/pro/PageHero';
import SectionHeading from '@/components/pro/SectionHeading';
import ProgramCard from '@/components/pro/ProgramCard';
import PriceTag from '@/components/pro/PriceTag';
import ScrollReveal from '@/components/ScrollReveal';
import NotFound from '@/pages/NotFound';
import { checkoutPath, inr, programPrice, usePrograms, type ManagedCourse } from '@/lib/courses-store';
import { waLink } from '@/lib/site-settings';

const WHY = [
  { icon: MonitorPlay, title: 'Live, mentor-led classes', text: 'Learn in live sessions and ask questions as you go.' },
  { icon: Laptop, title: 'Hands-on labs', text: 'Practise every topic on real tools, not just slides.' },
  { icon: Award, title: 'Certificate', text: 'Get a Tech Guardians certificate when you complete the program.' },
  { icon: Users, title: 'Support that continues', text: 'Doubt-solving and guidance even after the batch ends.' },
];

/* ------------------------------ listing ------------------------------ */

export const TrainingList = () => {
  const programs = usePrograms();
  const [cat, setCat] = useState('All');
  const cats = useMemo(() => ['All', ...Array.from(new Set((programs || []).map((p) => p.category || 'Other')))], [programs]);
  const shown = (programs || []).filter((p) => cat === 'All' || (p.category || 'Other') === cat);

  return (
    <SiteFrame>
      <PageHero
        variant="network"
        eyebrow="Training Programs"
        title="Practical training for"
        accent="real-world security skills"
        lead="Live, hands-on programs in ethical hacking, networks, servers, AI automation and cyber awareness — for students, professionals and teams."
        actions={<>
          <a href="#programs" className="tg-btn-primary">Browse programs <ArrowRight className="h-4 w-4" /></a>
          <a href={waLink('Hi Tech Guardians, I need help choosing a training program.')} target="_blank" rel="noopener noreferrer" className="tg-btn-outline"><MessageCircle className="h-4 w-4" /> Ask an advisor</a>
        </>}
      >
        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-slate-400">Programs</dt><dd className="font-display text-2xl font-bold text-white">{programs?.length ?? '—'}</dd></div>
          <div><dt className="text-slate-400">Format</dt><dd className="font-display text-2xl font-bold text-white">Live + Labs</dd></div>
          <div><dt className="text-slate-400">On completion</dt><dd className="font-display text-2xl font-bold text-white">Certificate</dd></div>
        </dl>
      </PageHero>

      <section id="programs" className="tg-section scroll-mt-24">
        <div className="tg-container">
          {cats.length > 2 && (
            <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${cat === c ? 'bg-primary text-white' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
          {!programs && <p className="text-muted-foreground">Loading programs…</p>}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((p, i) => <ScrollReveal key={p.id} delay={(i % 3) * 0.05}><ProgramCard program={p} /></ScrollReveal>)}
          </div>
        </div>
      </section>

      <section className="tg-section border-t border-border bg-card">
        <div className="tg-container">
          <SectionHeading eyebrow="Why Tech Guardians" title="Training built around practice" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-2xl border border-border bg-background p-6">
                <span className="tg-icon-tile"><w.icon className="h-6 w-6" /></span>
                <h3 className="mt-4 text-base font-bold">{w.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteFrame>
  );
};

/* ------------------------------ detail ------------------------------ */

const EnrollCard = ({ p }: { p: ManagedCourse }) => {
  const price = programPrice(p);
  const session = p.kind === 'session';
  return (
    <div className="tg-card overflow-hidden">
      {p.image && <img src={p.image} alt="" className="aspect-[16/9] w-full object-cover" />}
      <div className="p-6">
        {p.showPrice && price.sale ? <PriceTag price={p.price} offer={p.offer} size="lg" /> : <span className="text-lg font-bold">Fees on request</span>}
        {price.discount > 0 && <p className="mt-1 text-sm text-[hsl(var(--cyber-green))]">You save {inr(price.regular - price.sale)}</p>}
        <a href={checkoutPath(p)} className="tg-btn-primary mt-5 w-full !py-3.5 !text-base">{session ? 'Book online session' : 'Enroll now'} <ArrowRight className="h-4 w-4" /></a>
        <a href={waLink(`Hi Tech Guardians, I have a question about "${p.title}".`)} target="_blank" rel="noopener noreferrer" className="tg-btn-outline mt-3 w-full"><MessageCircle className="h-4 w-4" /> {session ? 'On-site session? Ask us' : 'Ask a question'}</a>
        <ul className="mt-5 space-y-2.5 text-sm">
          {[p.duration && ['Duration', p.duration], p.level && ['Level', p.level], p.mode && ['Format', p.mode]].filter(Boolean).map((row) => {
            const [k, v] = row as string[];
            return <li key={k} className="flex justify-between gap-4 border-b border-border pb-2.5"><span className="text-muted-foreground">{k}</span><span className="text-right font-semibold">{v}</span></li>;
          })}
          {(p.highlights || []).map((h) => <li key={h} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[hsl(var(--cyber-green))]" />{h}</li>)}
        </ul>
      </div>
    </div>
  );
};

export const TrainingDetail = () => {
  const { id = '' } = useParams();
  const programs = usePrograms();
  const [openModule, setOpenModule] = useState(0);
  if (!programs) return <SiteFrame><div className="tg-container py-24 text-muted-foreground">Loading…</div></SiteFrame>;
  const p = programs.find((x) => x.id === id);
  if (!p) return <NotFound />;
  const others = programs.filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <SiteFrame>
      <PageHero
        variant="network"
        eyebrow={`Training Program${p.category ? ` · ${p.category}` : ''}`}
        title={p.headline || p.title}
        lead={p.intro || p.description}
        actions={<>
          <a href={checkoutPath(p)} className="tg-btn-primary">{p.kind === 'session' ? 'Book now' : 'Enroll now'}{p.showPrice && programPrice(p).sale ? ` — ${inr(programPrice(p).sale)}` : ''} <ArrowRight className="h-4 w-4" /></a>
          {!!p.modules?.length && <a href="#curriculum" className="tg-btn-outline">View curriculum</a>}
        </>}
      >
        <ul className="mt-7 flex flex-wrap gap-2 text-sm">
          {p.duration && <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200"><Clock className="h-4 w-4 text-[#60a5fa]" />{p.duration}</li>}
          {p.level && <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200"><Signal className="h-4 w-4 text-[#60a5fa]" />{p.level}</li>}
          {p.mode && <li className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200"><CalendarClock className="h-4 w-4 text-[#60a5fa]" />{p.mode}</li>}
        </ul>
      </PageHero>

      <div className="tg-container grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-16">
        <div className="min-w-0 space-y-14">
          {!!p.stats?.length && (
            <dl className="grid grid-cols-3 gap-3">
              {p.stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
                  <dd className="font-display text-2xl font-extrabold text-primary md:text-3xl">{s.value}</dd>
                  <dt className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>
          )}

          {!!p.outcomes?.length && (
            <section>
              <SectionHeading center={false} eyebrow={p.kind === 'session' ? 'Formats' : 'What you will learn'} title={p.kind === 'session' ? 'Choose how you want the session' : 'Skills you will build'} />
              <div className="grid gap-4 sm:grid-cols-2">
                {p.outcomes.map((o, i) => (
                  <div key={o.title} className="rounded-2xl border border-border bg-card p-5">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 text-base font-bold">{o.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{o.text}</p>
                    {!!o.chips?.length && <div className="mt-3 flex flex-wrap gap-1.5">{o.chips.map((c) => <span key={c} className="tg-chip">{c}</span>)}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!!p.modules?.length && (
            <section id="curriculum" className="scroll-mt-24">
              <SectionHeading center={false} eyebrow="Curriculum" title={`${p.modules.length} modules, step by step`} />
              <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {p.modules.map((m, i) => (
                  <li key={m.title}>
                    <button onClick={() => setOpenModule(openModule === i ? -1 : i)} aria-expanded={openModule === i} className="flex w-full items-center gap-4 p-5 text-left hover:bg-muted/50">
                      <span className="grid h-11 w-16 shrink-0 place-items-center rounded-lg bg-[#0b1f47] text-xs font-bold text-white">{m.label || `Module ${i + 1}`}</span>
                      <span className="flex-1 font-semibold">{m.title}</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{m.topics.length} topics</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${openModule === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openModule === i && (
                      <ul className="grid gap-2 px-5 pb-5 sm:grid-cols-2 sm:pl-[100px]">
                        {m.topics.map((t) => <li key={t} className="flex gap-2 text-sm text-foreground/85"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {!!p.tools?.length && (
            <section>
              <SectionHeading center={false} eyebrow="Tools" title="Industry tools you will use" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {p.tools.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <span className="tg-icon-tile !h-10 !w-10"><Wrench className="h-5 w-5" /></span>
                    <span><span className="block text-sm font-semibold">{t.name}</span>{t.type && <span className="block text-xs text-muted-foreground">{t.type}</span>}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!!p.tags?.length && (
            <section>
              <h2 className="text-lg font-bold">Topics covered</h2>
              <div className="mt-3 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{t}</span>)}</div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <EnrollCard p={p} />
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Pay securely by UPI. Your seat is confirmed after we verify the payment, usually within a few hours.</p>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="tg-section border-t border-border bg-card">
          <div className="tg-container">
            <SectionHeading center={false} eyebrow="More programs" title="You may also like" action={<Link to="/training" className="tg-btn-outline"><GraduationCap className="h-4 w-4" /> All programs</Link>} />
            <div className="grid gap-6 md:grid-cols-3">{others.map((o) => <ProgramCard key={o.id} program={o} />)}</div>
          </div>
        </section>
      )}
    </SiteFrame>
  );
};
