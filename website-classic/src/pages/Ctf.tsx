import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Crown, Flag, FlaskConical, Lightbulb, Loader2, Lock, Target, Trophy, Wrench } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import { AccessBadge, CtfBand, LabPanel, LockedPanel, Pill, PlanCards, SignInGate, Toolkit } from '@/components/ctf/CtfKit';
import { useAnimations } from '@/lib/ctf-anim';
import {
  CtfError, DIFFICULTY, formatUntil, loadCatalog, loadTask, roomUrl, submitFlag, taskUrl,
  type CtfCatalog, type CtfRoom, type CtfTaskPage,
} from '@/lib/ctf';

// Lesson, challenge and lab HTML comes from Tech Guardians' own room files on the
// server (api/ctf-data), never from visitors, so it is rendered as HTML.

const useCatalog = () => {
  const [data, setData] = useState<CtfCatalog | null>(null);
  const [error, setError] = useState<CtfError | null>(null);
  const reload = useCallback(() => { loadCatalog().then((d) => { setData(d); setError(null); }, (e: CtfError) => setError(e)); }, []);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, reload };
};

/** Helpers that the room content calls from its own buttons. */
const useContentHelpers = () => {
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.copy = (btn: HTMLElement) => {
      const text = (btn.parentNode?.childNodes[0]?.nodeValue || '').trim();
      void navigator.clipboard?.writeText(text);
      btn.textContent = 'copied';
      window.setTimeout(() => { btn.textContent = 'copy'; }, 900);
    };
  }, []);
};

const Loading = () => <div className="tg-container flex items-center gap-2 py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading the CTF portal…</div>;
const Failed = ({ error }: { error: CtfError }) => error.status === 401 ? <SignInGate /> : <div className="tg-container py-16"><p className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error.message}</p></div>;

const roomProgress = (r: CtfRoom) => {
  const done = r.tasks.filter((t) => t.solved).length;
  return { done, total: r.tasks.length, pct: Math.round((done / Math.max(1, r.tasks.length)) * 100), pts: r.tasks.reduce((a, t) => a + (t.solved ? t.pts : 0), 0) };
};

const Ring = ({ pct }: { pct: number }) => (
  <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90" aria-hidden>
    <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
    <circle cx="18" cy="18" r="15.5" fill="none" stroke={pct === 100 ? '#138808' : '#ff9933'} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${pct * 0.974} 100`} />
  </svg>
);

/* ===================== Portal home ===================== */

export const CtfHome = () => {
  const { data, error } = useCatalog();
  const [query, setQuery] = useState('');
  const stats = useMemo(() => {
    if (!data) return null;
    const tasks = data.rooms.flatMap((r) => r.tasks);
    return { rooms: data.rooms.length, tasks: tasks.length, solved: tasks.filter((t) => t.solved).length, points: tasks.reduce((a, t) => a + (t.solved ? t.pts : 0), 0) };
  }, [data]);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const match = (r: CtfRoom) => words.every((w) => `${r.title} ${r.subtitle} ${r.path} ${r.tasks.map((t) => t.topic).join(' ')}`.toLowerCase().includes(w));

  return (
    <SiteFrame>
      <CtfBand>
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="tg-eyebrow"><Flag className="h-4 w-4" /> Tech Guardians · CTF Portal</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white md:text-5xl">Learn cyber security by <span className="text-[#ffb24d]">capturing flags</span></h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-200">Hands-on rooms from fundamentals to SOC, forensics and threat intelligence. Learn the concept, try it in the TG Lab, then capture the flag.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {data && <AccessBadge access={data.access} />}
              {data && !data.access.active && <Link to="/ctf/plans" className="inline-flex items-center gap-2 rounded-md bg-[#ff9933] px-4 py-2 text-sm font-extrabold text-[#1a1206] hover:brightness-105"><Crown className="h-4 w-4" /> Unlock all rooms — from ₹{data.plans.monthly.price}/month</Link>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[[stats?.rooms ?? '43', 'Rooms'], [stats?.tasks ?? '400+', 'Tasks'], [stats?.solved ?? '—', 'Flags captured'], [stats?.points ?? '—', 'Your points']].map(([n, l]) => (
              <div key={String(l)} className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-center backdrop-blur">
                <b className="block text-3xl font-extrabold text-white">{n}</b><span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </CtfBand>

      {error ? <Failed error={error} /> : !data ? <Loading /> : (
        <div className="tg-container py-10 md:py-14">
          {data.viewer.name && <p className="mb-6 text-lg font-semibold text-foreground">Welcome back, {data.viewer.name.split(' ')[0]} 👋</p>}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rooms — e.g. firewall, phishing, Active Directory" aria-label="Search rooms"
              className="w-full max-w-md rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
            <span className="text-sm text-muted-foreground">Task 1 of every room is free{data.access.active ? ' — and your plan unlocks everything.' : '.'}</span>
          </div>

          {data.paths.map((p) => {
            const rooms = data.rooms.filter((r) => r.path === p.key && match(r));
            if (!rooms.length) return null;
            return (
              <section key={p.key} className="mb-12">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
                  <div><h2 className="text-2xl font-extrabold text-primary">{p.title}</h2><p className="text-sm text-muted-foreground">{p.desc}</p></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{rooms.length} rooms</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rooms.map((r) => {
                    const pr = roomProgress(r);
                    const locked = r.tasks.filter((t) => t.locked).length;
                    const d = DIFFICULTY[r.difficulty] || DIFFICULTY.easy;
                    return (
                      <Link key={r.slug} to={roomUrl(r.slug)} className="group relative flex flex-col rounded-lg border border-border border-t-[3px] border-t-primary bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">ROOM {r.num}</span>
                            <h3 className="mt-0.5 font-bold leading-snug text-foreground group-hover:text-primary">{r.title}</h3>
                          </div>
                          <div className="relative grid place-items-center"><Ring pct={pr.pct} /><span className="absolute text-[10px] font-bold text-foreground">{pr.pct}%</span></div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.subtitle}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs">
                          <Pill className={d.cls}>{d.label}</Pill>
                          <span className="text-muted-foreground">{r.tasks.length} tasks · {pr.done} solved</span>
                          {locked > 0 && <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[#c96a0c]"><Lock className="h-3.5 w-3.5" />{locked} locked</span>}
                          {pr.pct === 100 && <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[#138808]"><Trophy className="h-3.5 w-3.5" />Complete</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {!data.access.active && (
            <section className="mt-6 rounded-xl border border-border bg-muted/30 p-6 md:p-8">
              <h2 className="text-2xl font-extrabold text-primary">Unlock every room</h2>
              <p className="mb-6 mt-1 text-muted-foreground">One plan opens every task in all {data.rooms.length} rooms.</p>
              <PlanCards plans={data.plans} />
            </section>
          )}
        </div>
      )}
    </SiteFrame>
  );
};

/* ===================== Plans ===================== */

export const CtfPlans = () => {
  const { data, error } = useCatalog();
  return (
    <SiteFrame>
      <CtfBand>
        <p className="tg-eyebrow"><Crown className="h-4 w-4" /> CTF Portal plans</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">Unlock every room and task</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-200">Task 1 of every room stays free. A plan opens all the rest — pay by UPI, and access starts as soon as your payment is verified.</p>
        {data && <div className="mt-5"><AccessBadge access={data.access} /></div>}
      </CtfBand>
      {error ? <Failed error={error} /> : !data ? <Loading /> : (
        <div className="tg-container py-10 md:py-14">
          {data.access.active && data.access.until && <p className="mb-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800">Your plan is active until <b>{formatUntil(data.access.until)}</b>. Buying again adds the new period after it ends.</p>}
          {data.access.pending && <p className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800">We have your plan payment and are verifying it — usually within a few hours.</p>}
          <PlanCards plans={data.plans} access={data.access} />
          <p className="mt-6 text-sm text-muted-foreground">Use the same student account when paying — the plan is added to the account you are signed in with. <Link to="/ctf" className="font-semibold text-primary hover:underline">Back to the rooms →</Link></p>
        </div>
      )}
    </SiteFrame>
  );
};

/* ===================== Room + task ===================== */

export const CtfRoomPage = () => {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const task = Number(params.get('task') || 0);
  return task ? <CtfTaskView slug={slug} t={task} /> : <CtfRoomLanding slug={slug} />;
};

const CtfRoomLanding = ({ slug }: { slug: string }) => {
  const { data, error } = useCatalog();
  const room = data?.rooms.find((r) => r.slug === slug);
  useEffect(() => { if (room) document.title = `${room.title} — Tech Guardians CTF`; }, [room]);
  if (error) return <SiteFrame><Failed error={error} /></SiteFrame>;
  if (!data) return <SiteFrame><Loading /></SiteFrame>;
  if (!room) return <SiteFrame><div className="tg-container py-16"><h1 className="text-2xl font-bold">Room not found</h1><Link to="/ctf" className="mt-3 inline-block text-primary hover:underline">← All rooms</Link></div></SiteFrame>;
  const pr = roomProgress(room);
  const d = DIFFICULTY[room.difficulty] || DIFFICULTY.easy;
  const points = room.tasks.reduce((a, t) => a + t.pts, 0);

  return (
    <SiteFrame>
      <CtfBand>
        <Link to="/ctf" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> All rooms</Link>
        <div className="mt-4 grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="tg-eyebrow">Room {room.num} · {room.path}</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">{room.title}</h1>
            <p className="mt-3 text-slate-200">{room.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2"><Pill className={`${d.cls} bg-white`}>{d.label}</Pill><Pill className="bg-white/10 text-white ring-white/20">CTF room</Pill></div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[[room.tasks.length, 'Tasks'], [points, 'Points'], [pr.done, 'Solved']].map(([n, l]) => (
              <div key={String(l)} className="rounded-lg border border-white/10 bg-white/[0.05] p-3"><b className="block text-2xl font-extrabold text-white">{n}</b><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">{l}</span></div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-200"><span>Your progress</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"><i className="block h-full bg-[#ff9933]" style={{ width: `${pr.pct}%` }} /></div><b>{pr.pct}%</b></div>
      </CtfBand>
      <div className="tg-container py-10">
        {room.blurb && <p className="mb-6 text-muted-foreground">{room.blurb}</p>}
        <div className="space-y-3">
          {room.tasks.map((t) => (
            <Link key={t.id} to={t.locked ? '/ctf/plans' : taskUrl(room.slug, t.id)}
              className={`flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-md ${t.solved ? 'border-emerald-500/40' : 'border-border'} ${t.locked ? 'opacity-80' : ''}`}>
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ${t.solved ? 'bg-emerald-600 text-white' : t.locked ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                {t.solved ? <Check className="h-5 w-5" /> : t.locked ? <Lock className="h-4 w-4" /> : t.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Task {t.id} · {t.topic}</span>
                <span className="block font-bold text-foreground">{t.title}</span>
              </span>
              <span className="hidden shrink-0 items-center gap-2 sm:flex">
                {t.free && !t.solved && <Pill className="bg-emerald-500/10 text-emerald-700 ring-emerald-500/30">Free</Pill>}
                {t.lab && <Pill className="bg-sky-500/10 text-sky-700 ring-sky-500/30"><FlaskConical className="h-3 w-3" />Lab</Pill>}
                <Pill className="bg-muted text-foreground ring-border">{t.pts} pts</Pill>
              </span>
              {t.locked ? <span className="shrink-0 text-xs font-bold text-[#c96a0c]">Unlock</span> : <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
            </Link>
          ))}
        </div>
        {room.tasks.some((t) => t.locked) && <div className="mt-10"><LockedPanel plans={data.plans} /></div>}
      </div>
    </SiteFrame>
  );
};

const CtfTaskView = ({ slug, t }: { slug: string; t: number }) => {
  const [page, setPage] = useState<CtfTaskPage | null>(null);
  const [error, setError] = useState<CtfError | null>(null);
  const [plans, setPlans] = useState<CtfCatalog['plans'] | undefined>();
  const [flag, setFlag] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [hints, setHints] = useState(0);
  const [tools, setTools] = useState(false);
  const anim = useAnimations();
  useContentHelpers();

  const load = useCallback(() => {
    setError(null); setMsg(''); setHints(0); setFlag('');
    loadTask(slug, t).then((p) => { setPage(p); document.title = `${p.task.title} — ${p.room.title} — Tech Guardians CTF`; window.scrollTo({ top: 0 }); }, (e: CtfError) => {
      setError(e); setPage(null);
      if (e.status === 402) loadCatalog().then((c) => setPlans(c.plans), () => undefined);
    });
  }, [slug, t]);
  useEffect(() => { load(); }, [load]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) { setMsg('Enter the flag first.'); return; }
    setBusy(true); setMsg('');
    submitFlag(slug, t, flag).then((r) => {
      if (r.ok && page) setPage({ ...page, task: { ...page.task, solved: true, learn: r.learn || '' }, room: { ...page.room, solved: page.room.solved + 1, earned: page.room.earned + (r.pts || 0) } });
      else setMsg('✗ Incorrect flag. Try the lab, a hint, or re-read the concept.');
    }, (err: Error) => setMsg(err.message)).finally(() => setBusy(false));
  };

  if (error?.status === 401) return <SiteFrame><SignInGate /></SiteFrame>;
  if (error?.status === 402) return (
    <SiteFrame>
      <CtfBand><Link to={roomUrl(slug)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to the room</Link><h1 className="mt-3 text-3xl font-extrabold text-white">Task {t} is locked</h1></CtfBand>
      <div className="tg-container py-10"><LockedPanel plans={plans} /></div>
    </SiteFrame>
  );
  if (error) return <SiteFrame><Failed error={error} /></SiteFrame>;
  if (!page) return <SiteFrame><Loading /></SiteFrame>;
  const { room, task } = page;
  const pct = Math.round((room.solved / Math.max(1, room.total)) * 100);
  const navLink = (n: CtfTaskPage['prev'], label: string, dir: 'prev' | 'next') => !n ? <span className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground opacity-50">{label}</span> : (
    <Link to={n.locked ? '/ctf/plans' : taskUrl(room.slug, n.id)} className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-bold ${dir === 'next' ? 'bg-primary text-primary-foreground hover:brightness-110' : 'border border-border text-foreground hover:border-primary'}`}>
      {dir === 'prev' && <ArrowLeft className="h-4 w-4" />}{label}{n.locked && <Lock className="h-3.5 w-3.5" />}{dir === 'next' && <ArrowRight className="h-4 w-4" />}
    </Link>
  );

  return (
    <SiteFrame>
      {/* Sticky task bar under the site menu */}
      <div className="sticky top-16 z-40 border-b border-border bg-card/95 backdrop-blur lg:top-12">
        <div className="tg-container flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 text-sm">
          <Link to={roomUrl(room.slug)} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" />{room.title}</Link>
          <span className="text-muted-foreground">Task {task.id} of {room.total}</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-muted sm:block"><i className="block h-full bg-[#ff9933]" style={{ width: `${pct}%` }} /></div>
            <span className="font-bold text-foreground">{room.earned} pts</span>
            <button onClick={() => setTools(true)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-semibold text-foreground hover:border-primary"><Wrench className="h-4 w-4" /> Toolkit</button>
          </div>
        </div>
      </div>

      <div className="tg-container max-w-4xl space-y-6 py-8 md:py-10">
        <div>
          <p className="tg-eyebrow">Task {task.id} · {task.topic}</p>
          <h1 className="tg-title mt-2">{task.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{room.title} · {(DIFFICULTY[room.difficulty] || DIFFICULTY.easy).label} · {task.pts} points{task.free ? ' · free task' : ''}</p>
        </div>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-7">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground"><BookOpen className="h-5 w-5 text-primary" /> Learn the concept</h2>
          <div className="ctf-prose mt-3" dangerouslySetInnerHTML={{ __html: task.teach }} />
          {task.example && <div className="mt-4 rounded-md border-l-4 border-[#ff9933] bg-[#ff9933]/[0.07] p-4"><p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#c96a0c]">Example</p><div className="ctf-prose" dangerouslySetInnerHTML={{ __html: task.example }} /></div>}
          {anim && task.anim && <div dangerouslySetInnerHTML={{ __html: anim(task.anim) }} />}
          {task.diagram && <div className="mt-4" dangerouslySetInnerHTML={{ __html: task.diagram }} />}
        </section>

        {task.lab && <LabPanel key={`${room.slug}-${task.id}`} lab={task.lab} />}

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-7">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground"><Target className="h-5 w-5 text-[#c96a0c]" /> Your task</h2>
          <div className="ctf-prose mt-3" dangerouslySetInnerHTML={{ __html: task.chal }} />
          {task.solved ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 font-bold text-white"><Check className="h-5 w-5" /> Solved — +{task.pts} pts captured</p>
          ) : (
            <>
              <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="ctf-flag" className="sr-only">Flag</label>
                <input id="ctf-flag" value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="TG{...}" autoComplete="off" spellCheck={false}
                  className="min-w-0 flex-1 rounded-md border border-input bg-background px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ff9933] px-6 py-3 text-sm font-extrabold text-[#1a1206] hover:brightness-105 disabled:opacity-60">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />} Submit flag
                </button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">Each • is one character of the answer. The answer is taught in <b>Learn the concept</b> above; plain letters (no 0/1/3/4 swaps) are accepted too.</p>
              {msg && <p role="alert" className="mt-2 text-sm font-semibold text-destructive">{msg}</p>}
              {!!task.hints.length && (
                <div className="mt-4">
                  <button onClick={() => setHints((h) => Math.min(task.hints.length, h + 1))} disabled={hints >= task.hints.length}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:border-primary disabled:opacity-50">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> {hints >= task.hints.length ? 'No more hints' : 'Reveal a hint'}
                  </button>
                  {task.hints.slice(0, hints).map((h, i) => <div key={i} className="ctf-prose mt-2 rounded-md bg-amber-500/10 p-3 text-sm"><b>Hint {i + 1}:</b> <span dangerouslySetInnerHTML={{ __html: h }} /></div>)}
                </div>
              )}
            </>
          )}
        </section>

        {task.solved && task.learn && (
          <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5 md:p-7">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground"><Trophy className="h-5 w-5 text-[#138808]" /> Debrief</h2>
            <div className="ctf-prose mt-3" dangerouslySetInnerHTML={{ __html: task.learn }} />
          </section>
        )}
        {room.solved >= room.total && <p className="rounded-md bg-[hsl(var(--tg-navy))] p-4 text-center font-bold text-white">🏆 Room complete! <Link to="/ctf" className="text-[#ffb24d] underline">Choose your next room</Link></p>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          {navLink(page.prev, 'Previous', 'prev')}
          <Link to={roomUrl(room.slug)} className="text-sm font-semibold text-primary hover:underline">▦ Room tasks</Link>
          {navLink(page.next, 'Next task', 'next')}
        </div>
      </div>
      <Toolkit open={tools} onClose={() => setTools(false)} />
    </SiteFrame>
  );
};
