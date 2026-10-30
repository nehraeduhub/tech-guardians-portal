import { useCallback, useEffect, useState } from 'react';
import { Copy, Loader2, Pencil, Plus, Save, Tag, Trash2, X } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;
type Scope = 'all' | 'course' | 'pdf' | 'ctf' | 'product';
interface Coupon {
  id?: string; code: string; percent: number; scope: Scope[]; maxUses: number; oncePerStudent: boolean;
  expires: string; active: boolean; note: string; used?: number; saved?: string; created_at?: string;
}

const PERCENTS = [10, 20, 30, 50, 80, 90, 100];
const SCOPES: [Scope, string][] = [['all', 'All paid services'], ['course', 'Courses'], ['pdf', 'PDFs'], ['ctf', 'CTF plans'], ['product', 'Products & services']];
const SCOPE_NAME: Record<Scope, string> = { all: 'Everything', course: 'Courses', pdf: 'PDFs', ctf: 'CTF plans', product: 'Products' };
const inputClass = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const percentLabel = (p: number) => (p >= 100 ? 'FREE' : `${p}% off`);

const blank = (): Coupon => ({ code: '', percent: 10, scope: ['all'], maxUses: 0, oncePerStudent: true, expires: '', active: true, note: '' });
const randomCode = (p: number) => `TG${p >= 100 ? 'FREE' : p}-${Array.from(crypto.getRandomValues(new Uint8Array(3)), (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('')}`;
const today = () => new Date(Date.now() + 19800000).toISOString().slice(0, 10);

/** Manage → Coupons: discount codes students apply at checkout. */
const CouponsAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [rows, setRows] = useState<Coupon[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Coupon>(blank);
  const [copied, setCopied] = useState('');
  const [confirm, setConfirm] = useState('');
  const load = useCallback(() => {
    apiGet<{ coupons: Coupon[] }>('coupons.php').then((d) => { setRows(d.coupons); setError(''); }, (e: Error) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleScope = (s: Scope) => setForm((f) => {
    if (s === 'all') return { ...f, scope: ['all'] };
    const rest = f.scope.filter((x) => x !== 'all');
    const next = rest.includes(s) ? rest.filter((x) => x !== s) : [...rest, s];
    return { ...f, scope: next.length ? next : ['all'] };
  });
  const save = () => {
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,24}$/.test(code)) { setError('Use a code of 3–24 letters, digits, - or _.'); return; }
    setError('');
    void onPublish(apiPost('coupons.php?action=save', { ...form, code }), () => { setForm(blank()); load(); });
  };
  const setActive = (c: Coupon, active: boolean) => void onPublish(apiPost('coupons.php?action=save', { ...c, active }), load);
  const remove = (c: Coupon) => { setConfirm(''); void onPublish(apiPost('coupons.php?action=delete', { id: c.id }), load); };
  const copy = (code: string) => {
    void navigator.clipboard?.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(''), 1500); }).catch(() => undefined);
  };
  const state = (c: Coupon) => !c.active ? ['Paused', 'border-border text-muted-foreground']
    : c.expires && c.expires < today() ? ['Expired', 'border-red-500/40 text-red-500']
    : c.maxUses > 0 && (c.used || 0) >= c.maxUses ? ['Used up', 'border-amber-500/40 text-amber-500']
    : ['Active', 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Tag className="h-5 w-5 text-primary" /> Coupons</h2>
        <p className="text-sm text-muted-foreground">Create discount codes for courses, PDFs, CTF plans and products. Students enter the code at checkout and the discount is worked out on the server. A <b>free</b> (100%) coupon skips payment and confirms the order at once.</p>
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-semibold">{form.id ? `Edit coupon ${form.code}` : 'New coupon'}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-xs font-semibold text-muted-foreground">Coupon code</span>
            <span className="flex gap-2">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })} maxLength={24} placeholder="e.g. WELCOME50" className={`${inputClass} font-mono tracking-wider`} />
              <button type="button" onClick={() => setForm({ ...form, code: randomCode(form.percent) })} className="shrink-0 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">Generate</button>
            </span>
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-semibold text-muted-foreground">Note (only you see this)</span>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={160} placeholder="e.g. Diwali offer, college batch" className={inputClass} />
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-muted-foreground">Discount</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PERCENTS.map((p) => (
              <button key={p} type="button" onClick={() => setForm({ ...form, percent: p })} aria-pressed={form.percent === p}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${form.percent === p ? (p >= 100 ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground') : 'border border-border text-foreground hover:border-primary'}`}>
                {p >= 100 ? 'FREE (100%)' : `${p}%`}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-muted-foreground">Applies to</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SCOPES.map(([s, label]) => (
              <label key={s} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.scope.includes(s) ? 'border-primary bg-primary/10 font-semibold' : 'border-border'}`}>
                <input type="checkbox" checked={form.scope.includes(s)} onChange={() => toggleScope(s)} className="accent-primary" /> {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="space-y-1">
            <span className="block text-xs font-semibold text-muted-foreground">Total uses (0 = unlimited)</span>
            <input inputMode="numeric" value={String(form.maxUses)} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value.replace(/\D/g, '').slice(0, 6)) || 0 })} className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-semibold text-muted-foreground">Expires after (optional)</span>
            <input type="date" value={form.expires} min={today()} onChange={(e) => setForm({ ...form, expires: e.target.value })} className={inputClass} />
          </label>
          <div className="space-y-2 pt-1 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.oncePerStudent} onChange={(e) => setForm({ ...form, oncePerStudent: e.target.checked })} className="accent-primary" /> Once per student (email / phone)</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-primary" /> Active</label>
          </div>
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {form.id ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {form.id ? 'Save changes' : 'Create coupon'}
          </button>
          {form.id && <button onClick={() => setForm(blank())} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm"><X className="h-4 w-4" /> Cancel</button>}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Your coupons</h3>
        {!rows ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
          : rows.length === 0 ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No coupons yet. Create one above.</p>
          : rows.map((c) => {
            const [label, cls] = state(c);
            return (
              <div key={c.id} className="grid gap-3 rounded-xl border border-border bg-card/70 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-dashed border-primary/60 bg-primary/5 px-2.5 py-1 font-mono text-sm font-bold tracking-wider">{c.code}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.percent >= 100 ? 'bg-emerald-600 text-white' : 'bg-[#ff9933] text-[#1a1206]'}`}>{percentLabel(c.percent)}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.scope.map((s) => SCOPE_NAME[s]).join(', ')} · used {c.used || 0}{c.maxUses > 0 ? ` of ${c.maxUses}` : ''} · students saved {c.saved || '₹0'}
                    {c.oncePerStudent ? ' · once per student' : ''}{c.expires ? ` · until ${c.expires}` : ''}{c.note ? ` · ${c.note}` : ''}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button onClick={() => copy(c.code)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><Copy className="h-4 w-4" /> {copied === c.code ? 'Copied' : 'Copy'}</button>
                  <button onClick={() => setActive(c, !c.active)} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">{c.active ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => { setForm({ ...blank(), ...c }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><Pencil className="h-4 w-4" /> Edit</button>
                  {confirm === c.id ? (
                    <>
                      <button onClick={() => remove(c)} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Delete</button>
                      <button onClick={() => setConfirm('')} className="rounded-lg border border-border px-3 py-2 text-xs">Keep</button>
                    </>
                  ) : <button onClick={() => setConfirm(c.id || '')} aria-label={`Delete coupon ${c.code}`} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CouponsAdmin;
