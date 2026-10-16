import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Check, ChevronDown, ChevronUp, Download, ExternalLink, KeyRound, MessageCircle, Plus, Save, Search, Trash2, UserX, X } from 'lucide-react';
import {
  createStudent, deleteStudent, loadStudents, resetStudentPassword, saveCourseMaterials, updateStudent,
  type CourseMaterials, type NewStudent, type Student, type StudentStatus, type StudentsData,
} from '@/lib/students';

type Filter = 'all' | StudentStatus;
const FILTERS: [Filter, string][] = [['all', 'All'], ['pending', 'Waiting for approval'], ['approved', 'Approved'], ['disabled', 'Disabled'], ['rejected', 'Rejected']];
const STATUS_STYLE: Record<StudentStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/40',
  disabled: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/40',
};
const STATUS_LABEL: Record<StudentStatus, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', disabled: 'Disabled' };
const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm';
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const emptyNew = (): NewStudent => ({ username: '', name: '', email: '', phone: '', password: '' });

/** Admin: approve student accounts, choose what each one can open, keep records. */
const StudentsPanel = () => {
  const [data, setData] = useState<StudentsData | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<NewStudent>(emptyNew);
  const [materials, setMaterials] = useState<CourseMaterials>({});
  const [showMaterials, setShowMaterials] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const d = await loadStudents();
      setData(d);
      setError('');
      return d;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load students.');
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh().then((d) => { if (d) setMaterials(Array.isArray(d.materials) ? {} : d.materials); });
    const t = window.setInterval(() => void refresh(), 20000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const users = useMemo(() => data?.users ?? [], [data]);
  const shown = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return users.filter((u) => (filter === 'all' || u.status === filter)
      && words.every((w) => [u.username, u.name, u.email, u.phone].join(' ').toLowerCase().includes(w)));
  }, [users, filter, q]);
  const counts = useMemo(() => ({
    pending: users.filter((u) => u.status === 'pending').length,
    approved: users.filter((u) => u.status === 'approved').length,
    total: users.length,
  }), [users]);

  const act = async (id: string, job: () => Promise<unknown>, done = '') => {
    setBusy(id);
    setNotice('');
    try { await job(); await refresh(); if (done) setNotice(done); }
    catch (e) { setError(e instanceof Error ? e.message : 'That did not work. Try again.'); }
    finally { setBusy(''); }
  };

  const toggle = (u: Student, field: 'courses' | 'pdfs', id: string) => {
    const list = u[field].includes(id) ? u[field].filter((x) => x !== id) : [...u[field], id];
    // Tick at once; the refresh after saving brings back the server's copy.
    setData((d) => (d ? { ...d, users: d.users.map((x) => (x.id === u.id ? { ...x, [field]: list } : x)) } : d));
    void act(u.id, () => updateStudent(u.id, { [field]: list }));
  };

  const waLink = (u: Student) => {
    const phone = u.phone.replace(/\D/g, '');
    const to = phone.length === 10 ? `91${phone}` : phone;
    const msg = `Hi ${u.name.split(' ')[0]}, your Tech Guardians student account is approved. Sign in at ${window.location.origin}/account.html with your user ID "${u.username}" to open your courses and PDF books.`;
    return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  };

  const exportExcel = () => {
    const title = (list: { id: string; title: string }[], ids: string[]) => ids.map((id) => list.find((c) => c.id === id)?.title || id).join(', ');
    const rows = shown.map((u) => ({
      'User ID': u.username, Name: u.name, Email: u.email, Mobile: u.phone, Status: STATUS_LABEL[u.status],
      Requested: when(u.created_at), Approved: when(u.approved_at), 'Last sign-in': when(u.last_login), 'Sign-ins': u.logins,
      Courses: title(data?.courses ?? [], [...new Set([...u.courses, ...u.bought.courses])]),
      'PDF books': title(data?.pdfs ?? [], [...new Set([...u.pdfs, ...u.bought.pdfs])]),
      Note: u.note,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Students');
    XLSX.writeFile(wb, 'tech-guardians-students.xlsx');
  };

  const addStudent = async () => {
    setBusy('new');
    setError('');
    try {
      await createStudent(draft);
      setDraft(emptyNew());
      setAdding(false);
      setNotice('Student account created and approved.');
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create the account.'); }
    finally { setBusy(''); }
  };

  const saveMaterials = async () => {
    setBusy('materials');
    setError('');
    try { await saveCourseMaterials(materials); setNotice('Course material links saved.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); }
    finally { setBusy(''); }
  };

  if (!data && !error) return <p className="text-sm text-muted-foreground">Loading students…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-semibold">Student accounts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Students request an account on <a className="text-primary underline" href="/account.html" target="_blank" rel="noopener noreferrer">/account.html</a> (the “My Account” link in the menu).
          Approve them here. Courses and PDF books paid for with the same email or mobile appear on their dashboard automatically; tick extra items to give access by hand.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"><div className="text-2xl font-bold tabular-nums">{counts.pending}</div><div className="text-xs text-muted-foreground">Waiting for your approval</div></div>
        <div className="rounded-xl border border-border bg-card/70 p-4"><div className="text-2xl font-bold tabular-nums">{counts.approved}</div><div className="text-xs text-muted-foreground">Active students</div></div>
        <div className="rounded-xl border border-border bg-card/70 p-4"><div className="text-2xl font-bold tabular-nums">{counts.total}</div><div className="text-xs text-muted-foreground">All records</div></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input id="student-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user ID, name, email, mobile…" className={`${input} pl-9`} />
        </label>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add student</button>
        <button onClick={() => setShowMaterials((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:bg-muted">Course material links</button>
        <button onClick={exportExcel} disabled={!shown.length} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs hover:bg-muted disabled:opacity-50"><Download className="h-3.5 w-3.5" /> Export Excel</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([id, text]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
            {text}{id === 'pending' && counts.pending ? ` (${counts.pending})` : ''}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {notice && <p className="text-sm text-emerald-400">{notice}</p>}

      {adding && (
        <div className="space-y-3 rounded-xl border border-primary/40 bg-card/70 p-4">
          <h3 className="font-semibold">New student (approved straight away)</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className={input} placeholder="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <input className={input} placeholder="User ID (e.g. rahul.sharma)" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
            <input className={input} placeholder="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            <input className={input} placeholder="Mobile" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            <input className={input} placeholder="Password (8+ characters, letters and numbers)" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button disabled={busy === 'new'} onClick={() => void addStudent()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" /> Create account</button>
            <button onClick={() => setAdding(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {showMaterials && data && (
        <div className="space-y-3 rounded-xl border border-border bg-card/70 p-4">
          <h3 className="font-semibold">Course material links</h3>
          <p className="text-xs text-muted-foreground">The private link (Google Drive folder, class recording, WhatsApp group…) a student sees for each course they own. Only signed-in students with access can see it.</p>
          {data.courses.map((c) => (
            <div key={c.id} className="grid gap-2 md:grid-cols-[220px_1fr_1fr] md:items-center">
              <span className="text-sm font-medium">{c.title}</span>
              <input className={input} placeholder="https://drive.google.com/…" value={materials[c.id]?.link || ''} onChange={(e) => setMaterials({ ...materials, [c.id]: { link: e.target.value, note: materials[c.id]?.note || '' } })} />
              <input className={input} placeholder="Short note (batch timing, password hint…)" value={materials[c.id]?.note || ''} onChange={(e) => setMaterials({ ...materials, [c.id]: { link: materials[c.id]?.link || '', note: e.target.value } })} />
            </div>
          ))}
          <button disabled={busy === 'materials'} onClick={() => void saveMaterials()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"><Save className="h-4 w-4" /> Save links</button>
        </div>
      )}

      <div className="space-y-3">
        {shown.length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No students here yet. New requests appear automatically.</p>}
        {shown.map((u) => {
          const expanded = open === u.id;
          return (
            <div key={u.id} className="rounded-xl border border-border bg-card/70 p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{u.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">@{u.username}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[u.status]}`}>{STATUS_LABEL[u.status]}</span>
                  </div>
                  <div className="text-xs text-muted-foreground break-all">{u.email} · {u.phone} · requested {when(u.created_at)} · last sign-in {when(u.last_login)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Set([...u.courses, ...u.bought.courses]).size} courses · {new Set([...u.pdfs, ...u.bought.pdfs]).size} PDF books
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {u.status !== 'approved' && (
                    <button disabled={busy === u.id} onClick={() => void act(u.id, () => updateStudent(u.id, { status: 'approved' }), `${u.name} approved.`)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"><Check className="h-4 w-4" /> Approve</button>
                  )}
                  {u.status === 'pending' && (
                    <button disabled={busy === u.id} onClick={() => void act(u.id, () => updateStudent(u.id, { status: 'rejected' }))} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"><X className="h-4 w-4" /> Reject</button>
                  )}
                  {u.status === 'approved' && (
                    <>
                      <a href={waLink(u)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                      <button disabled={busy === u.id} onClick={() => void act(u.id, () => updateStudent(u.id, { status: 'disabled' }))} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><UserX className="h-4 w-4" /> Disable</button>
                    </>
                  )}
                  <button onClick={() => setOpen(expanded ? null : u.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">
                    Access {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {expanded && data && (
                <div className="mt-4 grid gap-4 border-t border-border pt-4 lg:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold">Courses</h4>
                    <div className="mt-2 space-y-1.5">
                      {data.courses.map((c) => {
                        const auto = u.bought.courses.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={auto || u.courses.includes(c.id)} disabled={auto} onChange={() => toggle(u, 'courses', c.id)} />
                            <span>{c.title}</span>{auto && <span className="text-[11px] text-emerald-400">paid</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">PDF books</h4>
                    <div className="mt-2 space-y-1.5">
                      {data.pdfs.map((p) => {
                        const auto = u.bought.pdfs.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={auto || u.pdfs.includes(p.id)} disabled={auto} onChange={() => toggle(u, 'pdfs', p.id)} />
                            <span>{p.title}</span>{auto && <span className="text-[11px] text-emerald-400">paid</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <h4 className="text-sm font-semibold">Admin note (only you see this)</h4>
                    <textarea defaultValue={u.note} rows={2} className={`${input} mt-2`} onBlur={(e) => { if (e.target.value !== u.note) void act(u.id, () => updateStudent(u.id, { note: e.target.value }), 'Note saved.'); }} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
                    {resetFor === u.id ? (
                      <>
                        <input className={`${input} max-w-xs`} placeholder="New password for this student" value={resetPw} onChange={(e) => setResetPw(e.target.value)} />
                        <button onClick={() => void act(u.id, () => resetStudentPassword(u.id, resetPw), 'Password reset. Send the new password to the student.').then(() => { setResetFor(null); setResetPw(''); })} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Save password</button>
                        <button onClick={() => setResetFor(null)} className="rounded-lg border border-border px-3 py-2 text-xs">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => { setResetFor(u.id); setResetPw(''); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><KeyRound className="h-4 w-4" /> Reset password</button>
                    )}
                    {u.status === 'disabled' || u.status === 'rejected' ? null : (
                      <a href="/account.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><ExternalLink className="h-4 w-4" /> Student page</a>
                    )}
                    {confirmDelete === u.id ? (
                      <>
                        <button onClick={() => { setConfirmDelete(null); void act(u.id, () => deleteStudent(u.id), 'Student deleted.'); }} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Delete for good</button>
                        <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-border px-3 py-2 text-xs">Keep</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(u.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /> Delete</button>
                    )}
                  </div>
                  {!!u.history?.length && (
                    <div className="lg:col-span-2">
                      <h4 className="text-sm font-semibold">Record</h4>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {u.history.slice(0, 8).map((h, i) => <li key={i}>{when(h.at)} — {h.event}</li>)}
                        <li>Signed in {u.logins} times</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentsPanel;
