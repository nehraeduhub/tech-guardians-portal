import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CalendarDays, FileText, GraduationCap, Home as HomeIcon, Loader2, LogOut, Newspaper, ScanSearch, ShieldAlert, ShoppingBag, User, Flag } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { loadManagedCourses } from '@/lib/courses-store';
import { eventDateParts, eventRegisterHref, splitEvents, useEvents, usePortals, portalHref, useProducts } from '@/lib/catalog';
import { loadStore, rupees, salePrice, checkoutUrl } from '@/lib/store';
import { useTopNews, timeAgo } from '@/lib/news';
import { useList } from '@/lib/content-lists';
import { TIPS_LIST, tipOfTheDay } from '@/lib/daily-tips';
import InstallPrompt from '@/components/InstallPrompt';

interface Me {
  user: null | { username: string; name: string; email: string; since: string };
  closed?: boolean; otp?: boolean;
  courses?: { id: string; title: string; page: string; link: string; note: string }[];
  pdfs?: { id: string; title: string; cover: string; pages: number; link: string }[];
  pending?: unknown;
}
type Tab = 'home' | 'learn' | 'events' | 'news' | 'tools' | 'me';
const TABS: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon }, { id: 'learn', label: 'Learn', icon: GraduationCap }, { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'news', label: 'News', icon: Newspaper }, { id: 'tools', label: 'Tools', icon: ScanSearch }, { id: 'me', label: 'Me', icon: User },
];
const card = 'rounded-2xl border border-border bg-card p-4';
const field = 'w-full rounded-xl border border-border bg-muted/30 px-3 py-3 text-base text-foreground';
const btn = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60';

const DailyTip = () => {
  const tip = tipOfTheDay(useList(TIPS_LIST));
  return (
    <section className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-transparent p-4" aria-label="Tip of the day">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500"><ShieldAlert className="h-4 w-4" /> Cyber tip of the day · {tip.tag}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{tip.en}</p>
      {tip.hi && <p className="mt-2 text-sm text-muted-foreground">{tip.hi}</p>}
    </section>
  );
};

const SignIn = ({ otp, onDone }: { otp: boolean; onDone: () => void }) => {
  const [mode, setMode] = useState<'pw' | 'otp'>('pw');
  const [id, setId] = useState(''); const [pw, setPw] = useState('');
  const [email, setEmail] = useState(''); const [code, setCode] = useState(''); const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const run = async (job: () => Promise<unknown>) => { setBusy(true); setErr(''); try { await job(); } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(false); } };
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-5 py-10">
      <div className="text-center"><img src="/icons/icon-192.png" alt="" className="mx-auto h-20 w-20 rounded-2xl" /><h1 className="mt-3 font-display text-2xl font-extrabold text-foreground">Tech Guardians</h1><p className="text-sm text-muted-foreground">Student app — sign in to continue</p></div>
      <form className={`${card} grid gap-3`} onSubmit={(e) => { e.preventDefault(); void run(async () => {
        if (mode === 'pw') { await apiPost('users.php?action=login', { username: id, password: pw }); onDone(); }
        else if (!sent) { await apiPost('users.php?action=otp_send', { email }); setSent(true); }
        else { await apiPost('users.php?action=otp_login', { email, code }); onDone(); }
      }); }}>
        {mode === 'pw' ? (<>
          <input className={field} value={id} onChange={(e) => setId(e.target.value)} placeholder="Email or user ID" autoComplete="username" required />
          <input className={field} type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" autoComplete="current-password" required />
        </>) : (<>
          <input className={field} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSent(false); }} placeholder="Your account email" autoComplete="email" required />
          {sent && <input className={field} inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code from email" autoComplete="one-time-code" required />}
        </>)}
        {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
        <button className={btn} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === 'pw' ? 'Sign in' : sent ? 'Verify & sign in' : 'Send code'}</button>
        {otp && <button type="button" className="text-sm font-semibold text-primary" onClick={() => { setMode(mode === 'pw' ? 'otp' : 'pw'); setErr(''); setSent(false); }}>{mode === 'pw' ? 'Sign in with an email code instead' : 'Use password instead'}</button>}
      </form>
      <p className="text-center text-sm text-muted-foreground">New student? <a className="font-semibold text-primary" href="/account.html">Create an account</a></p>
      <InstallPrompt />
    </div>
  );
};

const Learn = ({ me }: { me: Me }) => {
  const courses = useQuery({ queryKey: ['app-courses'], queryFn: loadManagedCourses, staleTime: 300000 });
  const mine = new Set((me.courses || []).map((c) => c.id));
  const more = (courses.data || []).filter((c) => c.enabled && !mine.has(c.id));
  return (
    <div className="grid gap-5">
      <section><h2 className="mb-2 font-bold text-foreground">My courses</h2>
        {(me.courses || []).length === 0 ? <p className={`${card} text-sm text-muted-foreground`}>No courses yet. Enroll below.</p> :
          <div className="grid gap-3">{me.courses!.map((c) => (
            <div key={c.id} className={card}><p className="font-semibold text-foreground">{c.title}</p>{c.note && <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>}
              <div className="mt-3 flex gap-2">{c.link && <a className={btn} href={c.link} target="_blank" rel="noopener noreferrer">Open class</a>}<a className="rounded-xl border border-border px-4 py-3 text-sm font-semibold" href={c.page}>Details</a></div></div>))}</div>}
      </section>
      <section><h2 className="mb-2 font-bold text-foreground">My PDFs</h2>
        {(me.pdfs || []).length === 0 ? <p className={`${card} text-sm text-muted-foreground`}>No PDFs yet. Get one from the PDF store.</p> :
          <div className="grid gap-3">{me.pdfs!.map((p) => (
            <div key={p.id} className={`${card} flex items-center gap-3`}><FileText className="h-8 w-8 shrink-0 text-primary" />
              <div className="flex-1"><p className="font-semibold text-foreground">{p.title}</p>{p.pages > 0 && <p className="text-xs text-muted-foreground">{p.pages} pages</p>}</div>
              {p.link && <a className={btn} href={p.link} target="_blank" rel="noopener noreferrer">Open</a>}</div>))}</div>}
        <a className="mt-3 inline-block text-sm font-semibold text-primary" href="/pdf-store">Browse PDF store →</a>
      </section>
      <section><h2 className="mb-2 font-bold text-foreground">Enroll in a course</h2>
        {courses.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="grid gap-3">{more.map((c) => (
          <a key={c.id} href={c.page || `/course/${c.id}`} className={`${card} block`}><p className="font-semibold text-foreground">{c.title}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
            <p className="mt-2 text-sm font-bold text-primary">{c.showPrice && (c.offer || c.price) ? `₹${c.offer || c.price} · ` : ''}Enroll →</p></a>))}</div>}
      </section>
    </div>
  );
};

const Events = () => {
  const { upcoming } = splitEvents(useEvents());
  return <div className="grid gap-3">{upcoming.length === 0 && <p className={`${card} text-sm text-muted-foreground`}>No upcoming events right now.</p>}{upcoming.map((e) => { const d = eventDateParts(e); return (
    <div key={e.id} className={card}><p className="text-xs font-semibold text-primary">{e.type} · {e.mode}</p><p className="mt-1 font-semibold text-foreground">{e.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{d.full}{e.time ? ` · ${e.time}` : ''}{e.venue ? ` · ${e.venue}` : ''}</p>
      <a className={`${btn} mt-3`} href={eventRegisterHref(e)} target={e.registerLink.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer">Join — {e.price || 'Free'}</a></div>); })}</div>;
};

const News = () => {
  const news = useTopNews(20);
  return <div className="grid gap-3">{news.isLoading && <Loader2 className="h-5 w-5 animate-spin" />}{(news.data || []).map((n) => (
    <a key={n.url} href={n.url} target="_blank" rel="noopener noreferrer" className={`${card} block`}><p className="font-semibold text-foreground">{n.title}</p><p className="mt-1 text-xs text-muted-foreground">{n.source} · {timeAgo(n.date)}</p></a>))}
    <a className="text-sm font-semibold text-primary" href="/cyber-news">Open full news portal →</a></div>;
};

const Tools = () => {
  const portals = usePortals().filter((p) => p.visible);
  const products = useProducts().filter((p) => p.visible && p.name);
  const store = useQuery({ queryKey: ['app-store'], queryFn: loadStore, staleTime: 300000 });
  return (
    <div className="grid gap-5">
      <section><h2 className="mb-2 font-bold text-foreground">Forensic & free tools</h2><div className="grid gap-3">
        <a className={`${card} flex items-center gap-3`} href="/forensic-engine.html"><ScanSearch className="h-6 w-6 text-primary" /><span className="font-semibold text-foreground">Forensic Engine</span></a>
        <a className={`${card} flex items-center gap-3`} href="/ctf"><Flag className="h-6 w-6 text-primary" /><span className="font-semibold text-foreground">CTF Lab</span></a>
        {portals.map((p) => <a key={p.id} className={`${card} block`} href={portalHref(p)}><p className="font-semibold text-foreground">{p.name}</p><p className="text-sm text-muted-foreground">{p.description}</p></a>)}
      </div></section>
      <section><h2 className="mb-2 font-bold text-foreground">Buy our tools</h2><div className="grid gap-3">
        {products.map((p) => <a key={p.id} className={`${card} block`} href={`/products/${p.id}`}><p className="font-semibold text-foreground">{p.name}</p><p className="text-sm text-muted-foreground">{p.tagline}</p><p className="mt-1 text-sm font-bold text-primary">{p.offer || p.price || 'Price on request'}</p></a>)}
        {(store.data?.products || []).map((p) => <a key={p.id} className={`${card} flex items-center gap-3`} href={checkoutUrl(p)}><ShoppingBag className="h-5 w-5 text-primary" /><span className="flex-1 font-semibold text-foreground">{p.title}</span><span className="font-bold text-primary">{rupees(salePrice(p))}</span></a>)}
      </div></section>
    </div>
  );
};

const StudentApp = () => {
  const [me, setMe] = useState<Me | null>(null);
  const [tab, setTab] = useState<Tab>(() => { const t = new URLSearchParams(location.search).get('tab'); return t === 'courses' ? 'learn' : (TABS.find((x) => x.id === t)?.id ?? 'home'); });
  const load = useCallback(() => apiGet<Me>('users.php?action=me').then(setMe, () => setMe({ user: null })), []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { document.title = 'Tech Guardians App'; }, []);

  if (!me) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!me.user) return <SignIn otp={!!me.otp} onDone={() => void load()} />;
  const u = me.user;
  return (
    <div className="mx-auto min-h-screen max-w-2xl" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(76px + env(safe-area-inset-bottom))' }}>
      <header className="flex items-center gap-3 px-4 py-4"><img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-xl" /><div className="flex-1"><p className="text-xs text-muted-foreground">Welcome back</p><p className="font-bold text-foreground">{u.name || u.username}</p></div></header>
      <main className="grid gap-4 px-4">
        {tab === 'home' && <>
          <DailyTip /><InstallPrompt />
          <div className="grid grid-cols-2 gap-3">{([['learn', BookOpen, 'My learning'], ['events', CalendarDays, 'Events'], ['news', Newspaper, 'Cyber news'], ['tools', ScanSearch, 'Tools & store']] as const).map(([t, Icon, l]) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`${card} flex flex-col items-start gap-2 text-left`}><Icon className="h-6 w-6 text-primary" /><span className="font-semibold text-foreground">{l}</span></button>))}</div>
          <p className={`${card} text-sm text-muted-foreground`}>{(me.courses || []).length} course(s) · {(me.pdfs || []).length} PDF(s) in your account</p>
        </>}
        {tab === 'learn' && <Learn me={me} />}
        {tab === 'events' && <Events />}
        {tab === 'news' && <News />}
        {tab === 'tools' && <Tools />}
        {tab === 'me' && <div className="grid gap-3"><div className={card}><p className="font-bold text-foreground">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p><p className="text-sm text-muted-foreground">ID: {u.username} · since {u.since}</p></div>
          <a className="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold" href="/account.html">Change password / full account</a>
          <button type="button" className={`${btn} !bg-red-600 !text-white`} onClick={() => void apiPost('users.php?action=logout').finally(() => { setMe({ user: null }); void load(); })}><LogOut className="h-4 w-4" /> Sign out</button></div>}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="App">
        <div className="mx-auto grid max-w-2xl grid-cols-6">{TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${tab === id ? 'text-primary' : 'text-muted-foreground'}`}><Icon className="h-5 w-5" />{label}</button>))}</div>
      </nav>
    </div>
  );
};

export default StudentApp;
