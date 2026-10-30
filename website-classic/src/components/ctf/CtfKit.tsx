import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, KeyRound, Lock, LogIn, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react';
import { REGISTER_URL, SIGN_IN_URL, formatUntil, planCheckoutUrl, runTool, type CtfAccess, type CtfLab, type CtfPlans, type ToolOp } from '@/lib/ctf';

/* ---------- shared look ---------- */

/** Navy band at the top of every CTF page, with a faint terminal grid. */
export const CtfBand = ({ children }: { children: ReactNode }) => (
  <section className="tg-dark tg-band relative overflow-hidden">
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,153,51,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(147,197,253,.08)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_70%_30%,#000_25%,transparent_75%)]" />
    <div className="tg-container relative py-10 md:py-14">{children}</div>
  </section>
);

export const Pill = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ${className}`}>{children}</span>
);

/** Plan status line for the top band. */
export const AccessBadge = ({ access }: { access: CtfAccess }) => access.active ? (
  <span className="inline-flex items-center gap-2 rounded-md bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
    <Crown className="h-4 w-4" /> {access.plan === 'admin' ? 'Admin preview — everything unlocked' : `CTF plan active${access.until ? ` until ${formatUntil(access.until)}` : ''}`}
  </span>
) : (
  <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/20">
    <Lock className="h-4 w-4 text-[#ff9933]" /> Free access: task 1 of every room{access.pending ? ' · your plan payment is being verified' : ''}
  </span>
);

/* ---------- sign-in gate ---------- */

export const SignInGate = () => (
  <div className="tg-container py-14">
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"><KeyRound className="h-7 w-7" /></span>
      <h2 className="mt-4 text-2xl font-extrabold text-foreground">Students only</h2>
      <p className="mt-2 text-muted-foreground">The CTF Portal is open to registered Tech Guardians students. Sign in to your student account to start capturing flags — the first task of every room is free.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href={SIGN_IN_URL} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110"><LogIn className="h-4 w-4" /> Sign in</a>
        <a href={REGISTER_URL} className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-bold text-foreground hover:border-primary hover:text-primary">Create a student account</a>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">New accounts are approved by the Tech Guardians team, usually the same day.</p>
    </div>
  </div>
);

/* ---------- plans ---------- */

const FEATURES = ['Every task in all 43 rooms unlocked', 'In-browser TG Lab shells + self-hosted lab guides', 'Hints, debriefs and the Analyst Toolkit', 'Progress and points saved to your account'];

export const PlanCards = ({ plans, access }: { plans: CtfPlans; access?: CtfAccess }) => {
  const save = Math.max(0, Math.round((1 - plans.annual.price / (plans.monthly.price * 12)) * 100));
  const card = (key: 'monthly' | 'annual', best: boolean) => {
    const p = plans[key];
    return (
      <div className={`relative flex flex-col rounded-xl border bg-card p-6 shadow-sm ${best ? 'border-[#ff9933] ring-2 ring-[#ff9933]/40' : 'border-border'}`}>
        {best && <span className="absolute -top-3 left-6 rounded bg-[#ff9933] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1a1206]">Best value{save ? ` · save ${save}%` : ''}</span>}
        <p className="text-sm font-bold uppercase tracking-wider text-primary">{p.label} plan</p>
        <p className="mt-2 flex items-baseline gap-1"><span className="text-4xl font-extrabold text-foreground">₹{p.price.toLocaleString('en-IN')}</span><span className="text-sm text-muted-foreground">/ {key === 'monthly' ? 'month' : 'year'}</span></p>
        <p className="mt-1 text-xs text-muted-foreground">{p.days} days of full access{key === 'annual' ? ` — about ₹${Math.round(p.price / 12)} a month` : ''}</p>
        <ul className="mt-5 space-y-2 text-sm text-foreground">
          {FEATURES.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{f}</li>)}
        </ul>
        <a href={planCheckoutUrl(key)} className={`mt-6 inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-extrabold transition hover:brightness-110 ${best ? 'bg-[#ff9933] text-[#1a1206]' : 'bg-primary text-primary-foreground'}`}>
          <Sparkles className="h-4 w-4" /> {access?.active ? 'Extend with' : 'Unlock with'} {p.label.toLowerCase()} — ₹{p.price.toLocaleString('en-IN')}
        </a>
      </div>
    );
  };
  return <div className="grid gap-6 md:grid-cols-2">{card('monthly', false)}{card('annual', true)}</div>;
};

/** Shown in place of a locked task. */
export const LockedPanel = ({ plans }: { plans?: CtfPlans }) => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
    <div className="flex items-start gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#ff9933]/15 text-[#c96a0c]"><Lock className="h-6 w-6" /></span>
      <div>
        <h2 className="text-xl font-extrabold text-foreground">This task is locked</h2>
        <p className="mt-1 text-muted-foreground">Task 1 of every room is free. Get a CTF plan to unlock every task in all rooms, with labs, hints and debriefs.</p>
      </div>
    </div>
    <div className="mt-6">{plans ? <PlanCards plans={plans} /> : <Link to="/ctf/plans" className="font-semibold text-primary hover:underline">See CTF plans →</Link>}</div>
    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Pay by UPI. Your plan starts as soon as the payment is verified.</p>
  </div>
);

/* ---------- Analyst Toolkit ---------- */

const OPS: [ToolOp, string][] = [['b64d', 'Base64 ▸ decode'], ['b64e', 'Base64 ◂ encode'], ['rot', 'ROT13'], ['md5', 'MD5'], ['sha', 'SHA-256'], ['url', 'URL decode']];

export const Toolkit = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const run = (op: ToolOp) => runTool(op, input).then((o) => setOutput(o || '[empty]'), (e: Error) => setOutput(`[error: ${e.message}]`));
  return (
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside role="dialog" aria-label="Analyst Toolkit" className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b-[3px] border-[#ff9933] bg-[hsl(var(--tg-navy))] px-5 py-4 text-white">
          <b className="flex items-center gap-2"><Wrench className="h-4 w-4 text-[#ff9933]" /> Analyst Toolkit</b>
          <button onClick={onClose} aria-label="Close toolkit" className="rounded p-1 hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <p className="text-sm text-muted-foreground">Transform text the way real analysts do. Encoding is reversible; hashing is one-way.</p>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} placeholder="Paste text or a flag…" className="w-full rounded-md border border-input bg-background p-3 font-mono text-sm text-foreground outline-none focus:border-primary" />
          <div className="flex flex-wrap gap-2">
            {OPS.map(([op, label]) => <button key={op} onClick={() => void run(op)} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary">{label}</button>)}
          </div>
          <pre className="min-h-[5rem] whitespace-pre-wrap break-all rounded-md bg-[#071a33] p-3 font-mono text-sm text-[#9fe8c0]">{output}</pre>
        </div>
      </aside>
    </div>
  );
};

/* ---------- TG Lab terminal ---------- */

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const norm = (s: string) => (s || '').trim().toLowerCase();

export const LabPanel = ({ lab }: { lab: CtfLab }) => {
  const host = lab.term?.host || 'student@tg-lab';
  const [lines, setLines] = useState<string[]>([]);
  const [cmd, setCmd] = useState('');
  const out = useRef<HTMLDivElement>(null);
  useEffect(() => { if (out.current) out.current.scrollTop = out.current.scrollHeight; }, [lines]);
  const run = (c: string) => {
    const v = c.trim();
    if (!v || !lab.term) return;
    const match = lab.term.steps.find((s) => {
      const key = (s.cmd || '').toLowerCase();
      if (norm(v) === norm(s.cmd || '') || (key && norm(v).includes(key))) return true;
      try { return !!s.match && new RegExp(s.match, 'i').test(v); } catch { return false; }
    });
    // Lab output is written by Tech Guardians; the typed command is escaped.
    const body = match ? (match.out || '').replace(/TG\{[^}]+\}/g, (m) => `<span class="ctf-term-flag">${m}</span>`) : '<span class="text-red-300">command not recognised in this lab — try one of the suggested commands.</span>';
    setLines((l) => [...l, `<span class="text-emerald-300">${escapeHtml(host)}:~$</span> <span class="text-white">${escapeHtml(v)}</span>\n${body}`]);
    setCmd('');
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground"><span aria-hidden>🖥️</span> Practical — reveal the flag</h2>
      {lab.intro && <p className="mt-2 text-muted-foreground">{lab.intro}</p>}
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {lab.term && (
          <div>
            <p className="text-sm font-bold text-foreground"><span className="mr-2 rounded bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">Option A</span>TG Lab — in your browser</p>
            <div className="mt-3 overflow-hidden rounded-lg border border-[#1d3b5c] bg-[#071a33] shadow-inner">
              <div className="flex items-center gap-1.5 border-b border-[#1d3b5c] bg-[#0b2a52] px-3 py-2"><i className="h-2.5 w-2.5 rounded-full bg-red-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><span className="ml-2 font-mono text-xs text-slate-300">{host}: ~</span></div>
              <div ref={out} className="ctf-term max-h-72 min-h-[9rem] overflow-y-auto whitespace-pre-wrap break-words p-3 font-mono text-[12.5px] leading-relaxed text-slate-200">
                {lines.length ? lines.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l }} />) : <span className="text-slate-400">type a command below…</span>}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); run(cmd); }} className="flex items-center gap-2 border-t border-[#1d3b5c] px-3 py-2">
                <span className="font-mono text-sm text-emerald-300">$</span>
                <input value={cmd} onChange={(e) => setCmd(e.target.value)} autoComplete="off" spellCheck={false} placeholder="run a command" aria-label="Lab command" className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-slate-500" />
              </form>
            </div>
            {!!lab.term.sugg?.length && <div className="mt-2 flex flex-wrap gap-2">{lab.term.sugg.map((s) => <button key={s} onClick={() => run(s)} className="max-w-full truncate rounded border border-border bg-muted/50 px-2 py-1 font-mono text-[11px] text-foreground hover:border-primary">{s}</button>)}</div>}
            {lab.dl && <a href={lab.dl} className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">⬇ Download the lab file to inspect it in your own tools</a>}
          </div>
        )}
        {!!lab.steps2?.length && (
          <div>
            <p className="text-sm font-bold text-foreground"><span className="mr-2 rounded bg-[#138808] px-2 py-0.5 text-[11px] text-white">Option B</span>Self-hosted lab — {lab.env || 'Kali / Linux / Packet Tracer'}</p>
            <p className="mt-2 text-sm text-muted-foreground">Prefer the real thing? Reproduce it on your own lab and you will get the same flag.</p>
            <ol className="ctf-prose mt-3 list-decimal space-y-1.5 pl-5 text-sm text-foreground">
              {lab.steps2.map((s, i) => <li key={i} dangerouslySetInnerHTML={{ __html: s }} />)}
            </ol>
          </div>
        )}
      </div>
      {lab.note && <p className="mt-4 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: lab.note }} />}
    </div>
  );
};
