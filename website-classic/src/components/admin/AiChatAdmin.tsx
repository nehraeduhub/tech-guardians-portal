import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Bot, CheckCircle2, Loader2, Plus, Save, Trash2, Zap } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;
interface Preset { label: string; type: string; baseUrl: string; model: string; hint: string }
interface Provider {
  id: string; preset: string; type: string; label: string; baseUrl: string; model: string; enabled: boolean;
  hasKey?: boolean; keyEnd?: string; apiKey?: string; clearKey?: boolean;
}
interface Config {
  enabled: boolean; showContacts: boolean; botName: string; welcome: string; extra: string;
  maxTokens: number; perIpHour: number; perIpDay: number; dailyCap: number; providers: Provider[];
}
interface Usage { day?: string; total?: number; providers?: Record<string, { ok: number; fail: number }>; lastErrors?: Record<string, { at: string; error: string }> }

const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const label = 'block text-xs font-semibold text-muted-foreground';
const MAX = 8;

/** Manage → AI Chatbot: the website's AI assistant and the AI providers it uses, tried top to bottom. */
const AiChatAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [c, setC] = useState<Config | null>(null);
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [usage, setUsage] = useState<Usage>({});
  const [error, setError] = useState('');
  const [adding, setAdding] = useState('gemini');
  const [tests, setTests] = useState<Record<string, { ok: boolean; text: string } | 'busy'>>({});
  const load = useCallback(() => {
    apiGet<{ config: Config; presets: Record<string, Preset>; usage: Usage }>('ai-chat.php?action=admin').then((d) => {
      setC(d.config); setPresets(d.presets); setUsage(d.usage || {}); setError('');
    }, (e: Error) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!c) return <p className="flex items-center gap-2 text-sm text-muted-foreground">{error || <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>}</p>;
  const set = (patch: Partial<Config>) => setC({ ...c, ...patch });
  const setP = (i: number, patch: Partial<Provider>) => set({ providers: c.providers.map((p, n) => (n === i ? { ...p, ...patch } : p)) });
  const move = (i: number, d: number) => {
    const list = [...c.providers]; const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]]; set({ providers: list });
  };
  const add = () => {
    const p = presets[adding];
    if (!p || c.providers.length >= MAX) return;
    set({ providers: [...c.providers, { id: '', preset: adding, type: p.type, label: p.label, baseUrl: p.baseUrl, model: p.model, enabled: true, apiKey: '' }] });
  };
  const save = (extra: Partial<Config> = {}) => {
    setError('');
    void onPublish(apiPost<{ config: Config }>('ai-chat.php?action=save', { ...c, ...extra }).then((d) => setC(d.config)), load);
  };
  const test = async (p: Provider) => {
    if (!p.id) { setTests((t) => ({ ...t, [p.label]: { ok: false, text: 'Save first, then test.' } })); return; }
    setTests((t) => ({ ...t, [p.id]: 'busy' }));
    try {
      const d = await apiPost<{ reply: string; ms: number }>('ai-chat.php?action=test', { id: p.id });
      setTests((t) => ({ ...t, [p.id]: { ok: true, text: `${(d.ms / 1000).toFixed(1)} s — ${d.reply}` } }));
    } catch (e) {
      setTests((t) => ({ ...t, [p.id]: { ok: false, text: e instanceof Error ? e.message : 'Test failed.' } }));
    }
  };
  const ready = c.providers.filter((p) => p.enabled && (p.hasKey || p.apiKey) && p.model).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Bot className="h-5 w-5 text-primary" /> AI Chatbot</h2>
        <p className="text-sm text-muted-foreground">An AI assistant in the website's chat button that answers like a cyber crime, security and forensics expert — in Hindi to Hindi speakers and English to English speakers. Add the AI providers you pay for; the bot tries them top to bottom and moves to the next one if a provider fails or hits its limit. API keys stay on your server and are never shown again.</p>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 ${c.enabled ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-card/70'}`}>
        <div>
          <h3 className="font-semibold">{c.enabled ? 'Chatbot is on' : 'Chatbot is off'}</h3>
          <p className="text-sm text-muted-foreground">{ready} provider{ready === 1 ? '' : 's'} ready. Today: {usage.day ? `${usage.total || 0} questions` : 'no questions yet'}.</p>
        </div>
        <button onClick={() => save({ enabled: !c.enabled })} disabled={!c.enabled && !ready}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${c.enabled ? 'border border-border hover:bg-muted' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
          {c.enabled ? 'Turn off' : 'Turn on'}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">AI providers <span className="font-normal text-muted-foreground">({c.providers.length}/{MAX}, tried in this order)</span></h3>
          <span className="flex flex-wrap gap-2">
            <select className={`${input} w-auto`} value={adding} onChange={(e) => setAdding(e.target.value)} aria-label="Provider to add">
              {Object.entries(presets).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
            </select>
            <button onClick={add} disabled={c.providers.length >= MAX} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"><Plus className="h-4 w-4" /> Add</button>
          </span>
        </div>
        {c.providers.length === 0 && <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No providers yet. Pick one above (for example Google Gemini or Groq) and click Add.</p>}
        <div className="mt-4 space-y-4">
          {c.providers.map((p, i) => {
            const pr = presets[p.preset];
            const st = tests[p.id || p.label];
            const used = usage.providers?.[p.id];
            const lastErr = usage.lastErrors?.[p.id];
            return (
              <div key={p.id || `new-${i}`} className={`rounded-xl border p-4 ${p.enabled ? 'border-border' : 'border-dashed border-border opacity-70'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <input className={`${input} max-w-[220px] font-semibold`} value={p.label} onChange={(e) => setP(i, { label: e.target.value })} aria-label="Name" />
                  <span className="text-xs text-muted-foreground">{pr?.label}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <label className="mr-2 flex items-center gap-1.5 text-xs font-semibold"><input type="checkbox" checked={p.enabled} onChange={(e) => setP(i, { enabled: e.target.checked })} className="accent-primary" /> Use</label>
                    <button onClick={() => move(i, -1)} aria-label="Move up" className="rounded-md border border-border p-1.5 hover:bg-muted"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => move(i, 1)} aria-label="Move down" className="rounded-md border border-border p-1.5 hover:bg-muted"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button onClick={() => set({ providers: c.providers.filter((_, n) => n !== i) })} aria-label="Remove provider" className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1"><span className={label}>API key {p.hasKey && <span className="font-normal">— saved (…{p.keyEnd}); leave empty to keep</span>}</span>
                    <input className={input} type="password" autoComplete="new-password" placeholder={p.hasKey ? '••••••••' : 'Paste the API key'} value={p.apiKey || ''} onChange={(e) => setP(i, { apiKey: e.target.value.trim() })} /></label>
                  <label className="space-y-1"><span className={label}>Model id</span>
                    <input className={`${input} font-mono`} placeholder="model id from the provider" value={p.model} onChange={(e) => setP(i, { model: e.target.value.trim() })} /></label>
                  {p.preset === 'custom' && (
                    <label className="space-y-1 md:col-span-2"><span className={label}>API address (OpenAI-compatible, ends before /chat/completions)</span>
                      <input className={input} placeholder="https://api.example.com/v1" value={p.baseUrl} onChange={(e) => setP(i, { baseUrl: e.target.value.trim() })} /></label>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{pr?.hint}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <button onClick={() => void test(p)} disabled={st === 'busy'} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-semibold hover:bg-muted disabled:opacity-50">
                    {st === 'busy' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />} Test
                  </button>
                  {used && <span className="text-muted-foreground">Today: {used.ok} answered, {used.fail} failed</span>}
                  {st && st !== 'busy' && <span className={st.ok ? 'text-emerald-600' : 'text-destructive'}>{st.ok && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}{st.text}</span>}
                </div>
                {lastErr && !st && <p className="mt-2 text-xs text-amber-600">Last error ({new Date(lastErr.at).toLocaleString('en-IN')}): {lastErr.error}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/70 p-5">
        <h3 className="font-semibold">Bot settings</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5"><span className={label}>Bot name</span>
            <input className={input} value={c.botName} onChange={(e) => set({ botName: e.target.value })} /></label>
          <label className="space-y-1.5"><span className={label}>Longest answer (tokens)</span>
            <input className={input} inputMode="numeric" value={String(c.maxTokens)} onChange={(e) => set({ maxTokens: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></label>
          <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={c.showContacts} onChange={(e) => set({ showContacts: e.target.checked })} className="accent-primary" /> Also show the WhatsApp / Telegram buttons under the AI chat (off = hidden)</label>
          <label className="space-y-1.5 md:col-span-2"><span className={label}>Welcome message</span>
            <textarea className={`${input} min-h-[70px]`} value={c.welcome} onChange={(e) => set({ welcome: e.target.value })} /></label>
          <label className="space-y-1.5 md:col-span-2"><span className={label}>Extra instructions for the bot (optional) — e.g. current offers, courses to suggest, office hours</span>
            <textarea className={`${input} min-h-[90px]`} value={c.extra} onChange={(e) => set({ extra: e.target.value })} placeholder="Example: Mention that the Sophos Firewall course starts on 1 December. Our office hours are 10 am – 6 pm IST." /></label>
        </div>
        <h4 className="mt-5 text-sm font-semibold">Limits (protect your API bill)</h4>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {([['perIpHour', 'Questions per visitor per hour'], ['perIpDay', 'Questions per visitor per day'], ['dailyCap', 'Questions per day, whole website']] as const).map(([k, t]) => (
            <label key={k} className="space-y-1.5"><span className={label}>{t}</span>
              <input className={input} inputMode="numeric" value={String(c[k])} onChange={(e) => set({ [k]: Number(e.target.value.replace(/\D/g, '')) || 0 } as Partial<Config>)} /></label>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">The bot already follows fixed rules: replies in the visitor's language, points fraud victims to 1930 and cybercrime.gov.in, never asks for OTPs or passwords, refuses hacking/attack instructions, and suggests your handbooks, CTF portal and training.</p>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <button onClick={() => save()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Save chatbot settings</button>
      </div>
    </div>
  );
};

export default AiChatAdmin;
