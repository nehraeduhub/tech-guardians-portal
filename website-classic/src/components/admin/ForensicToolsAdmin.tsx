import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Plus, RefreshCw, Save, Search, Trash2 } from 'lucide-react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Manage → Forensic Hub Tools: categories and tools of /forensic-engine.html.
// Stored in the `tg_forensic_tools` setting; the page falls back to its
// built-in list (also in /content/forensic-tools.json) until this is saved.

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;

export const FORENSIC_KEY = 'tg_forensic_tools';

interface Cat { id: string; name: string; desc: string; icon: string }
/** Short keys match the page script: c category, i icon, o organisation, t title, d description, u link, h host, g official, x hidden. */
interface Tool { key: string; c: string; i: string; o: string; t: string; d: string; u: string; h?: string; g: boolean; x?: boolean }
interface Data { cats: Cat[]; tools: Tool[] }

const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const label = 'text-xs font-semibold text-muted-foreground';
const uid = () => Math.random().toString(36).slice(2, 9);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'category';

const withKeys = (d: { cats: Cat[]; tools: Omit<Tool, 'key'>[] }): Data => ({
  cats: d.cats.map((c) => ({ id: c.id, name: c.name || '', desc: c.desc || '', icon: c.icon || '🔧' })),
  tools: d.tools.map((t) => ({ ...t, key: uid(), i: t.i || '🔧', o: t.o || '', d: t.d || '', g: !!t.g })),
});

const ForensicToolsAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [data, setData] = useState<Data | null>(null);
  const [builtIn, setBuiltIn] = useState<Data | null>(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/content/forensic-tools.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const base = withKeys(d);
        setBuiltIn(base);
        const own = readSetting<{ cats: Cat[]; tools: Tool[] } | null>(FORENSIC_KEY, null);
        setData(own && Array.isArray(own.cats) && Array.isArray(own.tools) ? withKeys(own) : base);
      })
      .catch(() => setError('Could not load the tool list. Check that /content/forensic-tools.json was uploaded.'));
  }, []);

  const shown = useMemo(() => {
    if (!data) return [];
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return data.tools.filter((t) => (filter === 'all' || t.c === filter)
      && words.every((w) => `${t.t} ${t.d} ${t.o} ${t.u}`.toLowerCase().includes(w)));
  }, [data, filter, q]);

  if (!data) return <p className="text-sm text-muted-foreground">{error || 'Loading tools…'}</p>;

  const change = (next: Data) => { setData(next); setSaved(false); };
  const setCat = (id: string, patch: Partial<Cat>) => change({ ...data, cats: data.cats.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const moveCat = (i: number, d: -1 | 1) => {
    const cats = [...data.cats]; const j = i + d;
    if (j < 0 || j >= cats.length) return;
    [cats[i], cats[j]] = [cats[j], cats[i]]; change({ ...data, cats });
  };
  const addCat = () => {
    const id = `${slug('new category')}-${uid().slice(0, 4)}`;
    change({ ...data, cats: [...data.cats, { id, name: 'New category', desc: '', icon: '🧰' }] });
  };
  const deleteCat = (id: string) => change({ cats: data.cats.filter((c) => c.id !== id), tools: data.tools.filter((t) => t.c !== id) });
  const setTool = (key: string, patch: Partial<Tool>) => change({ ...data, tools: data.tools.map((t) => (t.key === key ? { ...t, ...patch } : t)) });
  const addTool = () => {
    const tool: Tool = { key: uid(), c: filter !== 'all' ? filter : data.cats[0]?.id || '', i: '🔧', o: '', t: 'New tool', d: '', u: 'https://', g: false };
    change({ ...data, tools: [tool, ...data.tools] });
    setOpen(tool.key); setQ('');
  };

  const save = () => {
    const bad = data.tools.find((t) => !/^https?:\/\/[^\s]+\.[^\s]+/i.test(t.u.trim()));
    if (bad) { setError(`“${bad.t || 'Untitled tool'}” needs a full link starting with https://`); setOpen(bad.key); return; }
    const noName = data.cats.find((c) => !c.name.trim());
    if (noName) { setError('Every category needs a name.'); return; }
    setError('');
    const clean = {
      cats: data.cats.map(({ id, name, desc, icon }) => ({ id, name: name.trim(), desc: desc.trim(), icon: icon.trim() || '🧰' })),
      tools: data.tools.filter((t) => t.t.trim()).map(({ key: _key, h: _h, ...t }) => ({ ...t, t: t.t.trim(), u: t.u.trim(), x: !!t.x })),
    };
    void onPublish(publishSetting(FORENSIC_KEY, clean), () => setSaved(true));
  };

  const catName = (id: string) => data.cats.find((c) => c.id === id)?.name || 'No category';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Forensic Hub tools</h2>
        <p className="text-sm text-muted-foreground">
          Add, edit, hide or remove the tools and categories on the <a href="/forensic-engine.html" target="_blank" rel="noopener noreferrer" className="text-primary underline">Cyber &amp; Forensic Intelligence Hub</a>.
          The live lookup engines at the top of that page stay as they are.
        </p>
      </div>

      {/* Categories */}
      <section className="space-y-3 rounded-2xl border border-border bg-card/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Categories ({data.cats.length})</h3>
          <button onClick={addCat} className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add category</button>
        </div>
        {data.cats.map((c, i) => {
          const n = data.tools.filter((t) => t.c === c.id).length;
          return (
            <div key={c.id} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-[64px_1fr_1.6fr_auto] md:items-center">
              <input aria-label="Category icon (emoji)" className={`${input} text-center text-lg`} value={c.icon} onChange={(e) => setCat(c.id, { icon: e.target.value.slice(0, 4) })} />
              <input aria-label="Category name" className={input} value={c.name} onChange={(e) => setCat(c.id, { name: e.target.value })} />
              <input aria-label="Category description" placeholder="Short description" className={input} value={c.desc} onChange={(e) => setCat(c.id, { desc: e.target.value })} />
              <div className="flex flex-wrap items-center gap-1.5">
                <button onClick={() => setFilter(c.id)} className="rounded-lg border border-border px-2.5 py-2 text-xs hover:bg-muted">{n} tools</button>
                <button onClick={() => moveCat(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => moveCat(i, 1)} disabled={i === data.cats.length - 1} aria-label="Move down" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                {confirm === `cat:${c.id}` ? (
                  <>
                    <button onClick={() => { deleteCat(c.id); setConfirm(null); if (filter === c.id) setFilter('all'); }} className="rounded-lg bg-destructive px-2.5 py-2 text-xs font-semibold text-destructive-foreground">Delete{n ? ` + ${n} tools` : ''}</button>
                    <button onClick={() => setConfirm(null)} className="rounded-lg border border-border px-2.5 py-2 text-xs">Keep</button>
                  </>
                ) : (
                  <button onClick={() => setConfirm(`cat:${c.id}`)} aria-label="Delete category" className="rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Tools */}
      <section className="space-y-3 rounded-2xl border border-border bg-card/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Tools ({data.tools.length})</h3>
          <button onClick={addTool} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /> Add tool</button>
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_260px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input aria-label="Search tools" placeholder="Search tools…" className={`${input} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select aria-label="Show category" className={input} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All categories ({data.tools.length})</option>
            {data.cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name} ({data.tools.filter((t) => t.c === c.id).length})</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">Showing {shown.length} tools. Click a tool to edit it.</p>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {shown.map((t) => (
            <li key={t.key} className={t.x ? 'opacity-60' : ''}>
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span className="text-xl" aria-hidden>{t.i}</span>
                <button onClick={() => setOpen(open === t.key ? null : t.key)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-semibold">{t.t || 'Untitled tool'}</span>
                  <span className="block truncate text-xs text-muted-foreground">{catName(t.c)}{t.g ? ' · Official' : ''}{t.x ? ' · hidden' : ''}</span>
                </button>
                <a href={t.u} target="_blank" rel="noopener noreferrer" aria-label={`Open ${t.t}`} className="rounded-lg p-2 text-muted-foreground hover:text-primary"><ExternalLink className="h-4 w-4" /></a>
                <button onClick={() => setTool(t.key, { x: !t.x })} aria-label={t.x ? 'Show tool' : 'Hide tool'} className="rounded-lg border border-border p-2 hover:bg-muted">{t.x ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                {confirm === t.key ? (
                  <>
                    <button onClick={() => { change({ ...data, tools: data.tools.filter((x) => x.key !== t.key) }); setConfirm(null); }} className="rounded-lg bg-destructive px-2.5 py-2 text-xs font-semibold text-destructive-foreground">Delete</button>
                    <button onClick={() => setConfirm(null)} className="rounded-lg border border-border px-2.5 py-2 text-xs">Keep</button>
                  </>
                ) : (
                  <button onClick={() => setConfirm(t.key)} aria-label="Delete tool" className="rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                )}
                <button onClick={() => setOpen(open === t.key ? null : t.key)} aria-label="Edit" className="rounded-lg p-2 hover:bg-muted">{open === t.key ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
              </div>
              {open === t.key && (
                <div className="grid gap-3 border-t border-border bg-muted/20 p-4 md:grid-cols-2">
                  <label className="space-y-1 md:col-span-2"><span className={label}>Tool name</span>
                    <input id={`ft-${t.key}-t`} className={input} value={t.t} onChange={(e) => setTool(t.key, { t: e.target.value })} /></label>
                  <label className="space-y-1 md:col-span-2"><span className={label}>Description</span>
                    <textarea id={`ft-${t.key}-d`} rows={3} className={input} value={t.d} onChange={(e) => setTool(t.key, { d: e.target.value })} /></label>
                  <label className="space-y-1 md:col-span-2"><span className={label}>Link (opens in a new tab)</span>
                    <input id={`ft-${t.key}-u`} className={input} placeholder="https://…" value={t.u} onChange={(e) => setTool(t.key, { u: e.target.value })} /></label>
                  <label className="space-y-1"><span className={label}>Category</span>
                    <select className={input} value={t.c} onChange={(e) => setTool(t.key, { c: e.target.value })}>
                      {data.cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select></label>
                  <label className="space-y-1"><span className={label}>Run by (optional, e.g. Government of India)</span>
                    <input className={input} value={t.o} onChange={(e) => setTool(t.key, { o: e.target.value })} /></label>
                  <label className="space-y-1"><span className={label}>Icon (one emoji)</span>
                    <input className={`${input} text-lg`} value={t.i} onChange={(e) => setTool(t.key, { i: e.target.value.slice(0, 4) })} /></label>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={t.g} onChange={(e) => setTool(t.key, { g: e.target.checked })} /> Official government portal</label>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save & Publish</button>
        {builtIn && <button onClick={() => { change(withKeys(builtIn)); setFilter('all'); }} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"><RefreshCw className="h-4 w-4" /> Restore original list</button>}
        {saved && <span className="text-xs text-cyber-green">Published — the Forensic Hub is updated.</span>}
      </div>
    </div>
  );
};

export default ForensicToolsAdmin;
