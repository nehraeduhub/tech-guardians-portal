import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, FileText, Lock, PenLine, Plus, Save, Send, Trash2 } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import BlogEditor from '@/components/blog/BlogEditor';
import { cleanDraft, deletePost, emptyDraft, formatDate, loadMine, postUrl, savePost, type OwnPost, type PostDraft } from '@/lib/blog-posts';

// /write — students who bought a program or book (or were given access by
// the admin) write TG Blogs articles. Admin approval is needed to publish.

const STATUS: Record<OwnPost['status'], { label: string; cls: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground', icon: FileText },
  pending: { label: 'Waiting for review', cls: 'bg-amber-500/10 text-amber-700', icon: Clock },
  published: { label: 'Published', cls: 'bg-emerald-500/10 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Changes needed', cls: 'bg-red-500/10 text-red-700', icon: AlertCircle },
};

const toDraft = (p: OwnPost): PostDraft => ({ id: p.id, title: p.title, category: p.category, tags: p.tags, excerpt: p.excerpt, body: p.body || '', refs: p.refs || [] });

const BlogStudio = () => {
  const [state, setState] = useState<Awaited<ReturnType<typeof loadMine>> | null>(null);
  const [draft, setDraft] = useState<PostDraft>(emptyDraft);
  const [editing, setEditing] = useState<OwnPost | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = useCallback(() => loadMine().then(setState).catch(() => setState({ user: null })), []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (d: PostDraft) => { setDraft(d); setDirty(true); setMsg(null); };
  const open = (p: OwnPost | null) => {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    setEditing(p); setDraft(p ? toDraft(p) : emptyDraft()); setDirty(false); setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (submit: boolean) => {
    if (submit && draft.body.trim().split(/\s+/).length < 150) { setMsg({ ok: false, text: 'Please write at least 150 words before sending the article for review.' }); return; }
    setBusy(true); setMsg(null);
    try {
      const { post } = await savePost(cleanDraft(draft), { submit });
      setEditing(post); setDraft(toDraft(post)); setDirty(false);
      setMsg({ ok: true, text: submit ? 'Sent for review. Tech Guardians will check it and publish it on TG Blogs.' : 'Draft saved.' });
      await refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not save. Try again.' });
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    try { await deletePost(id); if (editing?.id === id) open(null); await refresh(); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not delete.' }); }
    setConfirmDel(null);
  };

  return (
    <SiteFrame mainClassName="pt-24">
      <div className="container mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">TG Blogs</p>
            <h1 className="mt-1 text-3xl font-extrabold text-foreground md:text-4xl">Writer studio</h1>
            <p className="mt-2 text-muted-foreground">Write an article for TG Blogs. Our team reviews every post before it is published.</p>
          </div>
          <Link to="/tg-blogs/" className="text-sm font-semibold text-primary hover:underline">View TG Blogs →</Link>
        </div>

        {!state ? <p className="py-20 text-center text-muted-foreground">Loading…</p>
          : !state.user ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <Lock className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold">Sign in to write</h2>
              <p className="mt-2 text-sm text-muted-foreground">Blog writing is for Tech Guardians students. Sign in to your student account to continue.</p>
              <a href="/account.html" className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Sign in to My Account</a>
            </div>
          ) : !state.canWrite ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <PenLine className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold">Hi {state.user.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{state.reason}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/training" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Training Programs</Link>
                <Link to="/pdf-store/" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">PDF Store</Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                <button type="button" onClick={() => open(null)} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> New article</button>
                <div className="rounded-xl border border-border bg-card">
                  <h2 className="border-b border-border px-4 py-3 text-sm font-bold">My articles ({state.posts?.length || 0})</h2>
                  {!state.posts?.length && <p className="px-4 py-6 text-center text-sm text-muted-foreground">No articles yet.</p>}
                  <ul className="max-h-[50vh] divide-y divide-border overflow-y-auto">
                    {state.posts?.map((p) => {
                      const st = STATUS[p.status];
                      return (
                        <li key={p.id} className={`px-4 py-3 ${editing?.id === p.id ? 'bg-primary/5' : ''}`}>
                          <button type="button" onClick={() => open(p)} className="block w-full text-left">
                            <span className="line-clamp-2 text-sm font-semibold text-foreground">{p.title}</span>
                            <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}><st.icon className="h-3 w-3" /> {st.label}</span>
                            <span className="ml-2 text-[11px] text-muted-foreground">{formatDate(p.updated_at, { day: 'numeric', month: 'short' })}</span>
                          </button>
                          <div className="mt-1.5 flex gap-3 text-xs">
                            {p.status === 'published' && <Link to={postUrl(p.slug)} className="inline-flex items-center gap-1 text-primary hover:underline">View <ExternalLink className="h-3 w-3" /></Link>}
                            {p.status !== 'published' && (confirmDel === p.id
                              ? <><button type="button" onClick={() => void remove(p.id)} className="font-semibold text-destructive">Delete?</button><button type="button" onClick={() => setConfirmDel(null)} className="text-muted-foreground">Keep</button></>
                              : <button type="button" onClick={() => setConfirmDel(p.id)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /> Delete</button>)}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                  <h3 className="mb-2 text-sm font-bold text-foreground">Writing guidelines</h3>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Original work only — no copied text.</li>
                    <li>Explain clearly with steps and examples.</li>
                    <li>Hacking techniques only for learning and authorised testing.</li>
                    <li>No personal data of real victims.</li>
                    <li>Add references for facts and figures.</li>
                  </ul>
                </div>
              </aside>

              <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
                {editing && (
                  <div className={`mb-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${STATUS[editing.status].cls}`}>
                    {(() => { const I = STATUS[editing.status].icon; return <I className="mt-0.5 h-4 w-4 shrink-0" />; })()}
                    <div>
                      <strong>{STATUS[editing.status].label}.</strong>{' '}
                      {editing.status === 'published' && 'Saving changes sends the article back for review; it stays hidden until approved again.'}
                      {editing.status === 'pending' && 'Our team will review it soon. You can still make changes.'}
                      {editing.status === 'rejected' && (editing.review_note ? `Reviewer note: ${editing.review_note}` : 'Please improve the article and send it again.')}
                      {editing.status === 'draft' && 'Only you can see this draft.'}
                    </div>
                  </div>
                )}
                <BlogEditor key={editing?.id || 'new'} draft={draft} onChange={change} />
                {msg && <p role="status" className={`mt-5 rounded-lg px-4 py-3 text-sm ${msg.ok ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>{msg.text}</p>}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                  <button type="button" disabled={busy} onClick={() => void save(false)} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"><Save className="h-4 w-4" /> Save draft</button>
                  <button type="button" disabled={busy} onClick={() => void save(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"><Send className="h-4 w-4" /> Send for review</button>
                  {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
                </div>
              </section>
            </div>
          )}
      </div>
    </SiteFrame>
  );
};

export default BlogStudio;
