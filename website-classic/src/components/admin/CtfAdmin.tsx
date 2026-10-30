import { useCallback, useEffect, useState } from 'react';
import { Crown, Flag, Loader2, Save } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { publishSetting } from '@/lib/shared-settings';
import { formatUntil, type CtfAccess, type CtfPlans } from '@/lib/ctf';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;
interface Row { id: string; name: string; username: string; email: string; access: CtfAccess; grantedUntil: string; solved: number }
interface Data { students: Row[]; plans: CtfPlans; rooms: number; tasks: number }

const inputClass = 'rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';

/** Manage → CTF Portal: plan prices, who has access, and free access grants. */
const CtfAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState({ monthly: '', annual: '' });
  const [grant, setGrant] = useState<Record<string, string>>({});
  const [q, setQ] = useState('');
  const load = useCallback(() => {
    apiGet<Data>('ctf.php?action=admin').then((d) => {
      setData(d);
      setPrices({ monthly: String(d.plans.monthly.price), annual: String(d.plans.annual.price) });
      setGrant(Object.fromEntries(d.students.map((s) => [s.id, s.grantedUntil])));
    }, (e: Error) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!data) return <p className="flex items-center gap-2 text-sm text-muted-foreground">{error || <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>}</p>;
  const active = data.students.filter((s) => s.access.active).length;
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = data.students.filter((s) => words.every((w) => `${s.name} ${s.username} ${s.email}`.toLowerCase().includes(w)));
  const savePrices = () => {
    const m = Number(prices.monthly), a = Number(prices.annual);
    if (!(m > 0) || !(a > 0)) { setError('Enter both prices in rupees.'); return; }
    setError('');
    void onPublish(publishSetting('tg_ctf', { prices: { monthly: Math.round(m), annual: Math.round(a) } }), load);
  };
  const saveGrant = (id: string) => void onPublish(apiPost('ctf.php?action=grant', { userId: id, until: grant[id] || '' }), load);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Flag className="h-5 w-5 text-primary" /> CTF Portal</h2>
        <p className="text-sm text-muted-foreground">{data.rooms} rooms · {data.tasks} tasks. Signed-in students get task 1 of every room free; a plan unlocks everything. Plans start when you approve the payment in Payment History (filter: CTF plans).</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[[data.students.length, 'Approved students'], [active, 'With an active plan'], [data.students.reduce((a, s) => a + s.solved, 0), 'Flags captured']].map(([n, l]) => (
          <div key={String(l)} className="rounded-xl border border-border bg-card/70 p-4"><b className="block text-2xl">{n}</b><span className="text-xs text-muted-foreground">{l}</span></div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-semibold">Plan prices (₹)</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="space-y-1"><span className="block text-xs font-semibold text-muted-foreground">Monthly (30 days)</span><input inputMode="numeric" value={prices.monthly} onChange={(e) => setPrices({ ...prices, monthly: e.target.value.replace(/\D/g, '') })} className={`${inputClass} w-32`} /></label>
          <label className="space-y-1"><span className="block text-xs font-semibold text-muted-foreground">Annual (365 days)</span><input inputMode="numeric" value={prices.annual} onChange={(e) => setPrices({ ...prices, annual: e.target.value.replace(/\D/g, '') })} className={`${inputClass} w-32`} /></label>
          <button onClick={savePrices} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Save prices</button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Students</h3>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, user ID or email" className={`${inputClass} w-64`} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Give free access until a date (for staff, scholarships or offline payments). Leave the date empty and save to remove it.</p>
        <div className="mt-4 divide-y divide-border">
          {shown.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-[12rem] flex-1">
                <p className="font-semibold">{s.name} <span className="text-xs text-muted-foreground">@{s.username}</span></p>
                <p className="text-xs text-muted-foreground">{s.email} · {s.solved} flags</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.access.active ? 'bg-emerald-500/15 text-emerald-700' : s.access.pending ? 'bg-amber-500/15 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                {s.access.active ? <><Crown className="h-3.5 w-3.5" /> {s.access.plan === 'granted' ? 'Granted' : s.access.plan} until {formatUntil(s.access.until)}</> : s.access.pending ? 'Payment pending' : 'Free tasks only'}
              </span>
              <input type="date" value={grant[s.id] || ''} onChange={(e) => setGrant({ ...grant, [s.id]: e.target.value })} aria-label={`Free access until, for ${s.name}`} className={inputClass} />
              <button onClick={() => saveGrant(s.id)} className="rounded-full border border-primary/50 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10">Save access</button>
            </div>
          ))}
          {!shown.length && <p className="py-4 text-sm text-muted-foreground">No approved students{q ? ' match the search' : ' yet'}.</p>}
        </div>
      </div>
    </div>
  );
};

export default CtfAdmin;
