import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, FileText, GraduationCap, PenLine, RefreshCw, Search, ShoppingBag, Trash2, Undo2, XCircle } from 'lucide-react';
import { apiGet } from '@/lib/api';
import BlogBody from '@/components/blog/BlogBody';
import BlogEditor from '@/components/blog/BlogEditor';
import {
  cleanDraft, deletePost, emptyDraft, formatDate, loadBlogAdmin, postUrl, reviewPost, saveBlogSettings, savePost, setWriterAccess,
  type BlogSettings, type OwnPost, type PostDraft, type Writer,
} from '@/lib/blog-posts';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;

const STATUS_STYLE: Record<OwnPost['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-amber-500/10 text-amber-700',
  published: 'bg-emerald-500/10 text-emerald-700',
  rejected: 'bg-red-500/10 text-red-700',
};
const STATUS_LABEL: Record<OwnPost['status'], string> = { draft: 'Draft', pending: 'Waiting for review', published: 'Published', rejected: 'Changes requested' };

/* ------------------------------------------------------------- Posts ---- */

export const BlogPostsAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [data, setData] = useState<{ posts: OwnPost[] } | null>(null);
  const [filter, setFilter] = useState<'pending' | 'published' | 'rejected' | 'draft' | 'all'>('pending');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [writing, setWriting] = useState<PostDraft | null>(null);

  const load = useCallback(() => loadBlogAdmin().then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Could not load posts.')), []);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0, pending: 0, published: 0, rejected: 0, draft: 0 };
    data?.posts.forEach((p) => { c[p.status]++; c.all++; });
    return c;
  }, [data]);
  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    // Students' private drafts are not shown in the review queue.
    return (data?.posts || []).filter((p) => (filter === 'all' || p.status === filter)
      && words.every((w) => `${p.title} ${p.author} ${p.category}`.toLowerCase().includes(w)));
  }, [data, filter, q]);

  const act = (job: Promise<unknown>) => onPublish(job, () => { setConfirm(null); void load(); window.dispatchEvent(new Event('tg-notices-refresh')); });

  if (writing) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">{writing.id ? 'Edit article' : 'Write an article as Tech Guardians'}</h2>
          <button type="button" onClick={() => setWriting(null)} className="text-sm text-primary underline">Back to posts</button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 md:p-8"><BlogEditor draft={writing} onChange={setWriting} /></div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void onPublish(savePost(cleanDraft(writing), { publish: true }), () => { setWriting(null); setFilter('published'); void load(); })} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Publish now</button>
          <button type="button" onClick={() => void onPublish(savePost(cleanDraft(writing), {}), () => { setWriting(null); setFilter('all'); void load(); })} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">Save without publishing</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">TG Blog posts</h2>
          <p className="text-sm text-muted-foreground">Articles written by students appear here when they send them for review. Approve to publish on <a href="/tg-blogs/" target="_blank" rel="noopener noreferrer" className="text-primary underline">TG Blogs</a>, or send back with a note.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"><RefreshCw className="h-4 w-4" /> Refresh</button>
          <button type="button" onClick={() => setWriting(emptyDraft())} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><PenLine className="h-4 w-4" /> Write article</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'published', 'rejected', 'draft', 'all'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === f ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
            {f === 'all' ? 'All' : STATUS_LABEL[f]} ({counts[f] || 0})
          </button>
        ))}
        <label className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Search posts" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm" />
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!data ? <p className="text-sm text-muted-foreground">Loading…</p> : list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{filter === 'pending' ? 'No articles are waiting for review.' : 'No posts here.'}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button type="button" onClick={() => setOpen(open === p.id ? null : p.id)} className="min-w-0 flex-1 text-left">
                  <span className="block font-semibold text-foreground">{p.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">by {p.author}{p.author_username && p.author_username !== 'admin' ? ` (@${p.author_username})` : ''} · {p.category} · {p.words} words · updated {formatDate(p.updated_at, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </button>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                <button type="button" onClick={() => setOpen(open === p.id ? null : p.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">{open === p.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Read</button>
              </div>
              {open === p.id && (
                <div className="border-t border-border">
                  <div className="max-h-[60vh] overflow-y-auto bg-background px-6 py-4 font-serif">
                    {p.excerpt && <p className="mb-4 rounded-lg bg-muted px-4 py-3 text-sm italic text-muted-foreground">{p.excerpt}</p>}
                    <BlogBody text={p.body || ''} />
                    {p.refs && p.refs.length > 0 && (
                      <div className="mt-6 border-t border-border pt-4 font-sans">
                        <h4 className="text-sm font-bold">References</h4>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{p.refs.map((r, i) => <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary underline">{r.title || r.url}</a></li>)}</ol>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 border-t border-border bg-muted/30 p-4">
                    {p.review_note && <p className="text-xs text-muted-foreground">Last note: {p.review_note}</p>}
                    <textarea aria-label="Note to the writer" rows={2} placeholder="Note to the writer (optional — shown to them, e.g. what to improve)" value={notes[p.id] || ''} onChange={(e) => setNotes({ ...notes, [p.id]: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <div className="flex flex-wrap items-center gap-2">
                      {p.status !== 'published' && <button type="button" onClick={() => void act(reviewPost(p.id, 'approve', notes[p.id]))} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"><CheckCircle2 className="h-4 w-4" /> Approve &amp; publish</button>}
                      {p.status !== 'rejected' && p.status !== 'draft' && <button type="button" onClick={() => void act(reviewPost(p.id, 'reject', notes[p.id]))} className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/5"><XCircle className="h-4 w-4" /> Send back for changes</button>}
                      {p.status === 'published' && <button type="button" onClick={() => void act(reviewPost(p.id, 'unpublish', notes[p.id]))} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"><Undo2 className="h-4 w-4" /> Unpublish</button>}
                      {p.status === 'published' && <a href={postUrl(p.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline">View on blog <ExternalLink className="h-3.5 w-3.5" /></a>}
                      {p.user_id === 'admin' && <button type="button" onClick={() => setWriting({ id: p.id, title: p.title, category: p.category, tags: p.tags, excerpt: p.excerpt, body: p.body || '', refs: p.refs || [] })} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"><PenLine className="h-4 w-4" /> Edit</button>}
                      <span className="ml-auto">
                        {confirm === p.id ? (
                          <>
                            <button type="button" onClick={() => void act(deletePost(p.id))} className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">Delete permanently</button>
                            <button type="button" onClick={() => setConfirm(null)} className="ml-2 text-sm">Keep</button>
                          </>
                        ) : <button type="button" onClick={() => setConfirm(p.id)} aria-label="Delete post" className="rounded-full border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ----------------------------------------------------------- Writers ---- */

export const BlogWritersAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(() => loadBlogAdmin().then((d) => { setSettings(d.settings); setWriters(d.writers); }).catch((e) => setError(e instanceof Error ? e.message : 'Could not load.')), []);
  useEffect(() => { void load(); }, [load]);
  if (!settings) return <p className="text-sm text-muted-foreground">{error || 'Loading…'}</p>;

  const saveSettings = (next: BlogSettings) => { setSettings(next); void onPublish(saveBlogSettings(next), () => void load()); };
  const setMode = (w: Writer, mode: Writer['mode']) => void onPublish(setWriterAccess(w.id, mode), () => void load());
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = writers.filter((w) => words.every((x) => `${w.name} ${w.username} ${w.email}`.toLowerCase().includes(x)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Blog writers</h2>
        <p className="text-sm text-muted-foreground">Choose which students may write for TG Blogs. Students write at <a href="/write/" target="_blank" rel="noopener noreferrer" className="text-primary underline">/write</a> (also linked in their My Account page). Every article still needs your approval before it is published.</p>
      </div>
      <section className="space-y-3 rounded-2xl border border-border bg-card/70 p-5">
        <label className="flex items-center justify-between gap-4 text-sm font-semibold">Student blogging is open
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={settings.enabled} onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })} /></label>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span><span className="font-semibold">Only students who bought something</span><span className="block text-xs text-muted-foreground">On: a training program or PDF book (or one you gave them) unlocks writing automatically. Off: every approved student can write.</span></span>
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={settings.buyersOnly} onChange={(e) => saveSettings({ ...settings, buyersOnly: e.target.checked })} /></label>
      </section>
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Students ({writers.length})</h3>
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input aria-label="Search students" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…" className="rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm" />
          </label>
        </div>
        {writers.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No approved students yet. Approve accounts in the Students tab.</p>}
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {shown.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{w.name} <span className="font-normal text-muted-foreground">@{w.username}</span></p>
                <p className="text-xs text-muted-foreground">{w.email} · {w.buyer ? 'Buyer' : 'No purchase yet'} · {w.posts} posts</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${w.canWrite ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{w.canWrite ? 'Can write' : 'Cannot write'}</span>
              <select aria-label={`Blog access for ${w.name}`} value={w.mode} onChange={(e) => setMode(w, e.target.value as Writer['mode'])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="auto">Automatic (by purchase)</option>
                <option value="allow">Always allow</option>
                <option value="deny">Hide / block writing</option>
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

/* ----------------------------------------------------- Notifications ---- */

interface Notice { type: 'student' | 'order' | 'post'; title: string; detail: string; at: string; tab: string }
const SEEN_KEY = 'tg_admin_notices_seen';
const ICON = { student: GraduationCap, order: ShoppingBag, post: FileText };

/** Bell in the admin header: new student requests, payments to verify, posts to review. */
export const NotificationBell = ({ onOpenTab }: { onOpenTab: (tab: string) => void }) => {
  const [items, setItems] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => { try { return localStorage.getItem(SEEN_KEY) || ''; } catch { return ''; } });
  const load = useCallback(() => apiGet<{ items: Notice[] }>('notifications.php').then((d) => setItems(d.items)).catch(() => undefined), []);
  useEffect(() => {
    void load();
    const t = window.setInterval(load, 30000);
    window.addEventListener('tg-notices-refresh', load);
    return () => { window.clearInterval(t); window.removeEventListener('tg-notices-refresh', load); };
  }, [load]);
  const unseen = items.filter((i) => i.at > seen).length;
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = unseen ? `(${unseen}) ${base}` : base;
  }, [unseen]);
  const markSeen = () => {
    const latest = items[0]?.at || new Date().toISOString();
    setSeen(latest);
    try { localStorage.setItem(SEEN_KEY, latest); } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => { setOpen((o) => !o); if (!open) void load(); }} aria-expanded={open} aria-label={`Notifications${items.length ? `: ${items.length} need attention` : ''}`}
        className="relative inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
        <Bell className="h-4 w-4" /> Notifications
        {items.length > 0 && <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold text-white ${unseen ? 'bg-red-600' : 'bg-muted-foreground'}`}>{items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold">Needs your attention</p>
            {unseen > 0 && <button type="button" onClick={markSeen} className="text-xs font-semibold text-primary">Mark all as seen</button>}
          </div>
          {items.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted-foreground">All caught up — nothing waiting.</p> : (
            <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
              {items.map((n, i) => {
                const I = ICON[n.type];
                const fresh = n.at > seen;
                return (
                  <li key={i}>
                    <button type="button" onClick={() => { onOpenTab(n.tab); setOpen(false); markSeen(); }} className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-muted ${fresh ? 'bg-primary/5' : ''}`}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><I className="h-4 w-4" /></span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-semibold">{n.title}{fresh && <span className="h-2 w-2 rounded-full bg-red-600" aria-label="new" />}</span>
                        <span className="block truncate text-xs text-muted-foreground">{n.detail}</span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> {n.at ? formatDate(n.at, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
