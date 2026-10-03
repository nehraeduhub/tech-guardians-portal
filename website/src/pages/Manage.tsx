import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { type LucideIcon, Palette, PencilLine, BookOpen, FileText, Home, Image as ImageIcon, KeyRound, LayoutList, Youtube, Building2, CalendarClock, CloudDownload, Download, Eye, EyeOff, GraduationCap, LogOut, MessageCircle, Plus, RefreshCw, Save, Trash2, Upload, Users, Wallet, Video } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import { refreshSettings } from '@/lib/shared-settings';
import { adminSignOut, isAdmin, uploadImage } from '@/lib/api';
import AdminPasswordPanel from '@/components/AdminPasswordPanel';
import HomeContentPanel from '@/components/HomeContentPanel';
import LayoutPanel from '@/components/admin/LayoutPanel';
import ThemePanel from '@/components/admin/ThemePanel';
import ListEditor from '@/components/admin/ListEditor';
import { CUSTOM_SECTIONS, MEDIA_LIST, PDF_LIST, VIDEO_LIST } from '@/lib/content-lists';
import { loadAboutVisibility, saveAboutVisibility } from '@/lib/about-settings';
import {
  PaymentRecord,
  TGEvent,
  loadEvents,
  fetchSheetPayments,
  normalizeSheetRows,
  saveEvents,
  syncPayments,
  loadServerPayments,
} from '@/lib/manage-store';
import {
  DEFAULT_WA_NUMBER,
  PAYMENT_SHEET_URL,
  getWhatsAppNumber,
  setWhatsAppNumber,
  getFeaturedVideo,
  setFeaturedVideo,
  DEFAULT_VIDEO_ID,
  DEFAULT_VIDEO_TITLE,
  DEFAULT_VIDEO_TAGLINE,
} from '@/lib/site-settings';
import {
  TRAINER_GRADIENTS,
  TRAINER_ICON_NAMES,
  TrainerOrg,
  emptyTrainer,
  getTrainerIcon,
  loadTrainers,
  saveTrainers,
  type TrainerIconName,
} from '@/lib/trainers-store';
import { DEFAULT_BLOGS, TGBlog, emptyBlog, loadBlogs, saveBlogs } from '@/lib/blogs-store';
import {
  COURSE_ICON_NAMES,
  ManagedCourse,
  emptyCourse,
  isCoursesHomeVisible,
  isCoursesNavVisible,
  loadManagedCourses,
  saveCourseOverrides,
  setCoursesHomeVisible,
  setCoursesNavVisible,
} from '@/lib/courses-store';
import {
  emptyOrganizationOffering,
  loadOrganizationOfferings,
  saveOrganizationOfferings,
  type OrganizationOffering,
} from '@/lib/organization-offerings-store';

const COLORS: TGEvent['color'][] = ['cyber-green', 'cyber-blue', 'cyber-purple', 'cyber-orange'];

const emptyEvent = (): TGEvent => ({
  id: `e${Date.now()}`,
  title: '',
  when: '',
  tag: 'Live',
  color: 'cyber-green',
});

type ManageTab = 'themes' | 'layout' | 'home' | 'custom' | 'events' | 'offerings' | 'courses' | 'blogs' | 'pdfs' | 'media' | 'videos'
  | 'payments' | 'trainers' | 'contact' | 'video' | 'about' | 'password';

const TAB_INFO: Record<ManageTab, { label: string; icon: LucideIcon }> = {
  themes: { label: 'Themes', icon: Palette },
  layout: { label: 'Sections & Pages', icon: LayoutList },
  home: { label: 'Homepage Text', icon: Home },
  custom: { label: 'Custom Sections', icon: Plus },
  events: { label: 'Events', icon: CalendarClock },
  offerings: { label: 'Organization Services', icon: Building2 },
  courses: { label: 'Courses', icon: GraduationCap },
  blogs: { label: 'Blogs', icon: BookOpen },
  pdfs: { label: 'PDF Library', icon: FileText },
  media: { label: 'Media Gallery', icon: ImageIcon },
  videos: { label: 'YouTube Videos', icon: Youtube },
  payments: { label: 'Payment History', icon: Wallet },
  trainers: { label: 'Trainings At', icon: Users },
  contact: { label: 'WhatsApp Number', icon: MessageCircle },
  video: { label: 'Featured Training', icon: Video },
  about: { label: 'About Us Link', icon: Eye },
  password: { label: 'Admin Password', icon: KeyRound },
};
const TAB_ORDER = Object.keys(TAB_INFO) as ManageTab[];

const Manage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ManageTab>('layout');
  const [about, setAbout] = useState(loadAboutVisibility);
  const [publishError, setPublishError] = useState('');
  const [blogs, setBlogs] = useState<TGBlog[]>([]);
  const [blogsSaved, setBlogsSaved] = useState(false);
  const [blogImageError, setBlogImageError] = useState('');
  const [blogImageBusy, setBlogImageBusy] = useState<string | null>(null);
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [coursesSaved, setCoursesSaved] = useState(false);
  const [coursesNav, setCoursesNav] = useState(true);
  const [coursesHome, setCoursesHome] = useState(true);
  const [shot, setShot] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<TrainerOrg[]>([]);
  const [trainersSaved, setTrainersSaved] = useState(false);
  const [sheetStatus, setSheetStatus] = useState('');
  const [waNumber, setWaNumber] = useState(DEFAULT_WA_NUMBER);
  const [waSaved, setWaSaved] = useState(false);
  const [videoData, setVideoData] = useState({ id: DEFAULT_VIDEO_ID, title: DEFAULT_VIDEO_TITLE, tagline: DEFAULT_VIDEO_TAGLINE });
  const [videoSaved, setVideoSaved] = useState(false);
  const [events, setEvents] = useState<TGEvent[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [saved, setSaved] = useState(false);
  const [offerings, setOfferings] = useState<OrganizationOffering[]>([]);
  const [offeringsSaved, setOfferingsSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const admin = await isAdmin().catch(() => false);
      if (!admin) { navigate('/login', { replace: true }); return; }
      try { await refreshSettings(); } catch (error) { if (active) setPublishError('Could not load shared settings. Please check your connection.'); }
      if (!active) return;
      setEvents(loadEvents());
      setPayments(syncPayments());
      void loadServerPayments().then((rows) => { if (active) setPayments(syncPayments(rows)); }).catch(() => undefined);
      setWaNumber(getWhatsAppNumber());
      setVideoData(getFeaturedVideo());
      setTrainers(loadTrainers());
      setBlogs(loadBlogs());
      setCoursesNav(isCoursesNavVisible());
      setCoursesHome(isCoursesHomeVisible());
      setOfferings(loadOrganizationOfferings());
      setAbout(loadAboutVisibility());
      void loadManagedCourses().then(setCourses);
    })();
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    if (tab !== 'payments') return;
    const timer = window.setInterval(() => {
      void loadServerPayments().then((rows) => setPayments(syncPayments(rows))).catch(() => undefined);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [tab]);

  const publish = async (job: Promise<unknown>, onSuccess?: () => void) => {
    setPublishError('');
    try { await job; onSuccess?.(); }
    catch (error) { setPublishError(error instanceof Error ? error.message : 'Publishing failed. Try again.'); }
  };

  const totalAmount = useMemo(
    () =>
      payments.reduce((sum, p) => {
        const n = Number(String(p.amount || '').replace(/[^\d.]/g, ''));
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0),
    [payments],
  );

  const update = (id: string, patch: Partial<TGEvent>) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const persist = () => {
    void publish(saveEvents(events.filter((e) => e.title.trim())), () => setSaved(true));
    window.setTimeout(() => setSaved(false), 2200);
  };

  const importSheet = async (file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    const normalized = normalizeSheetRows(rows);
    setPayments(syncPayments(normalized));
  };

  const syncFromSheet = async () => {
    setSheetStatus('Syncing with the Google Sheet…');
    try {
      const rows = await fetchSheetPayments(PAYMENT_SHEET_URL);
      setPayments(syncPayments(rows));
      setSheetStatus(`Synced ${rows.length} record(s) from the sheet.`);
    } catch (err) {
      setSheetStatus(
        `Sheet sync unavailable (${(err as Error).message}). Use "Load Payment Excel / CSV" to import the sheet export.`,
      );
    }
  };

  const updateTrainer = (id: string, patch: Partial<TrainerOrg>) =>
    setTrainers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const persistTrainers = () => {
    const rows = trainers.filter((t) => t.name.trim());
    void publish(saveTrainers(rows), () => { setTrainers(rows); setTrainersSaved(true); });
    window.setTimeout(() => setTrainersSaved(false), 2200);
  };

  const updateBlog = (id: string, patch: Partial<TGBlog>) =>
    setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const persistBlogs = () => {
    const rows = blogs.filter((b) => b.title.trim());
    void publish(saveBlogs(rows), () => { setBlogs(rows); setBlogImageError(''); setBlogsSaved(true); });
    window.setTimeout(() => setBlogsSaved(false), 2200);
  };

  const readBlogImage = async (id: string, file: File) => {
    setBlogImageError('');
    if (!file.type.startsWith('image/')) {
      setBlogImageError('Please choose a JPG, PNG, WebP, GIF, or another image file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setBlogImageError('This photo is larger than 20 MB. Please choose a smaller photo.');
      return;
    }

    setBlogImageBusy(id);
    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('The photo could not be read.'));
        reader.readAsDataURL(file);
      });
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('The selected file is not a valid image.'));
        element.src = source;
      });
      const scale = Math.min(1, 1200 / image.naturalWidth, 800 / image.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Photo processing is unavailable in this browser.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let compressed = canvas.toDataURL('image/webp', 0.76);
      if (!compressed.startsWith('data:image/webp')) compressed = canvas.toDataURL('image/jpeg', 0.76);
      if (compressed.length > 900_000) compressed = canvas.toDataURL('image/jpeg', 0.58);
      if (compressed.length > 1_200_000) throw new Error('The compressed photo is still too large. Please choose a simpler image.');
      const { url } = await uploadImage(compressed);
      updateBlog(id, { image: url });
    } catch (error) {
      setBlogImageError(error instanceof Error ? error.message : 'The photo could not be uploaded.');
    } finally {
      setBlogImageBusy(null);
    }
  };

  const updateCourse = (id: string, patch: Partial<ManagedCourse>) =>
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const persistCourses = () => {
    const rows = courses.filter((c) => c.title.trim());
    void publish(saveCourseOverrides(rows), () => { setCourses(rows); setCoursesSaved(true); });
    window.setTimeout(() => setCoursesSaved(false), 2200);
  };

  const persistVideo = () => {
    void publish(setFeaturedVideo(videoData.id, videoData.title, videoData.tagline), () => setVideoSaved(true));
    window.setTimeout(() => setVideoSaved(false), 2200);
  };

  const updateOffering = (id: string, patch: Partial<OrganizationOffering>) =>
    setOfferings((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));

  const persistOfferings = () => {
    const rows = offerings.filter((item) => item.title.trim() && item.page.trim());
    void publish(saveOrganizationOfferings(rows), () => { setOfferings(rows); setOfferingsSaved(true); });
    window.setTimeout(() => setOfferingsSaved(false), 2200);
  };

  const exportSheet = () => {
    const ws = XLSX.utils.json_to_sheet(payments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'tech-guardians-payments.xlsx');
  };

  const logout = () => { void adminSignOut().catch(() => undefined).then(() => navigate('/login')); };

  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] tracking-[0.25em] uppercase text-cyber-green">Admin Console</span>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">Tech Guardians Manager</h1>
            </div>
            <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { try { sessionStorage.setItem('tg_editing', '1'); } catch { /* ignore */ } window.location.href = '/'; }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <PencilLine className="w-4 h-4" /> Edit website visually
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
            </div>
          </div>

          {publishError && <p role="alert" className="mb-5 text-sm text-destructive">{publishError}</p>}
          <div className="flex flex-wrap gap-2 mb-6">
            {TAB_ORDER.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  tab === t ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {(() => { const Icon = TAB_INFO[t].icon; return <Icon className="w-4 h-4" />; })()}
                {TAB_INFO[t].label}
              </button>
            ))}
          </div>

          {tab === 'themes' ? (
            <ThemePanel onPublish={publish} />
          ) : tab === 'layout' ? (
            <LayoutPanel onPublish={publish} />
          ) : tab === 'custom' ? (
            <ListEditor def={CUSTOM_SECTIONS} onPublish={publish} />
          ) : tab === 'pdfs' ? (
            <ListEditor def={PDF_LIST} onPublish={publish} />
          ) : tab === 'media' ? (
            <ListEditor def={MEDIA_LIST} onPublish={publish} />
          ) : tab === 'videos' ? (
            <ListEditor def={VIDEO_LIST} onPublish={publish} />
          ) : tab === 'home' ? (
            <HomeContentPanel onPublish={publish} />
          ) : tab === 'password' ? (
            <AdminPasswordPanel />
          ) : tab === 'about' ? (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-display text-lg font-semibold">About Us visibility</h2>
              {(['headerVisible', 'footerVisible'] as const).map((field) => (
                <label key={field} className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm">
                  <span>Show in {field === 'headerVisible' ? 'header (desktop and mobile)' : 'footer'}</span>
                  <input type="checkbox" checked={about[field]} onChange={(event) => setAbout({ ...about, [field]: event.target.checked })} className="h-5 w-5 accent-primary" />
                </label>
              ))}
              <button onClick={() => void publish(saveAboutVisibility(about), () => setPublishError(''))} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Save & Publish</button>
            </div>
          ) : tab === 'offerings' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Edit organization services and control whether each appears on the homepage and in TG Portals.</p>
              {offerings.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-lg border border-border bg-card/70 p-5 md:grid-cols-12">
                  <input value={item.title} onChange={(e) => updateOffering(item.id, { title: e.target.value })} placeholder="Offering title" className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground md:col-span-7" />
                  <input value={item.page} onChange={(e) => updateOffering(item.id, { page: e.target.value })} placeholder="/page-link" className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground md:col-span-5" />
                  <input value={item.menuLabel || ''} onChange={(e) => updateOffering(item.id, { menuLabel: e.target.value })} placeholder="Menu label (short name in TG Portals)" className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground md:col-span-12" />
                  <textarea value={item.description} onChange={(e) => updateOffering(item.id, { description: e.target.value })} placeholder="Short description" rows={3} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground md:col-span-8" />
                  <input value={item.buttonText} onChange={(e) => updateOffering(item.id, { buttonText: e.target.value })} placeholder="Button text" className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground md:col-span-4" />
                  <div className="flex flex-wrap gap-2 md:col-span-12 md:justify-end">
                    <button onClick={() => updateOffering(item.id, { homeVisible: !item.homeVisible })} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted">{item.homeVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} Homepage {item.homeVisible ? 'visible' : 'hidden'}</button>
                    <button onClick={() => updateOffering(item.id, { menuVisible: !item.menuVisible })} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted">{item.menuVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} Menu {item.menuVisible ? 'visible' : 'hidden'}</button>
                    <button onClick={() => setOfferings((prev) => prev.filter((row) => row.id !== item.id))} aria-label="Delete offering" className="inline-flex items-center justify-center rounded-lg border border-destructive/40 px-3 py-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button onClick={() => setOfferings((prev) => [...prev, emptyOrganizationOffering()])} className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add Offering</button>
                <button onClick={persistOfferings} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save & Publish</button>
                {offeringsSaved && <span className="text-xs text-cyber-green">Saved — homepage and menus updated.</span>}
              </div>
            </div>
          ) : tab === 'courses' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/70 p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">Courses tab on the website</h2>
                  <p className="text-xs text-muted-foreground">Show or hide the Courses menu in the website header on desktop and mobile.</p>
                </div>
                <button
                  onClick={() => {
                    const next = !coursesNav;
                    setCoursesNav(next);
                    void publish(setCoursesNavVisible(next));
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  {coursesNav ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {coursesNav ? 'Visible' : 'Hidden'}
                </button>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">Courses section on the homepage</h2>
                  <p className="text-xs text-muted-foreground">Show or hide all course cards on the front page.</p>
                </div>
                <button
                  onClick={() => {
                    const next = !coursesHome;
                    setCoursesHome(next);
                    void publish(setCoursesHomeVisible(next));
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  {coursesHome ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {coursesHome ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {courses.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card/70 p-5 grid gap-3 md:grid-cols-12">
                  <input
                    value={c.title}
                    onChange={(e) => updateCourse(c.id, { title: e.target.value })}
                    placeholder="Course title"
                    className="md:col-span-5 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <input
                    value={c.page}
                    onChange={(e) => updateCourse(c.id, { page: e.target.value })}
                    placeholder="/courses/new-course.html"
                    className="md:col-span-5 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <select
                    value={c.icon_name}
                    onChange={(e) => updateCourse(c.id, { icon_name: e.target.value })}
                    className="md:col-span-2 bg-muted/30 border border-border rounded-lg px-2 py-2 text-xs text-foreground"
                  >
                    {COURSE_ICON_NAMES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <textarea
                    value={c.description}
                    onChange={(e) => updateCourse(c.id, { description: e.target.value })}
                    placeholder="Short description"
                    rows={2}
                    className="md:col-span-6 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <input
                    value={c.price}
                    onChange={(e) => updateCourse(c.id, { price: e.target.value })}
                    placeholder="Regular price (₹999)"
                    className="md:col-span-2 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <input
                    value={c.offer}
                    onChange={(e) => updateCourse(c.id, { offer: e.target.value })}
                    placeholder="Offer price (₹499)"
                    className="md:col-span-2 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <div className="md:col-span-2 flex gap-2 justify-end items-start">
                    <button
                      onClick={() => updateCourse(c.id, { showPrice: !c.showPrice })}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${c.showPrice ? 'border-cyber-green/50 text-cyber-green' : 'border-border text-muted-foreground'}`}
                    >
                      {c.showPrice ? 'Price shown' : 'Price hidden'}
                    </button>
                  </div>
                  <div className="md:col-span-12 flex gap-2 justify-end">
                    <button
                      onClick={() => updateCourse(c.id, { enabled: !c.enabled })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                    >
                      {c.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {c.enabled ? 'Shown on site' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => setCourses((prev) => prev.filter((x) => x.id !== c.id))}
                      className="inline-flex items-center justify-center rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors px-3 py-2"
                      aria-label="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => setCourses((p) => [...p, emptyCourse()])} className="inline-flex items-center gap-2 rounded-full border border-primary/50 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors">
                  <Plus className="w-4 h-4" /> Add Course
                </button>
                <button onClick={persistCourses} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save & Publish
                </button>
                {coursesSaved && <span className="self-center text-xs text-cyber-green">Saved — courses updated on the website.</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                To add a brand-new course page, upload its HTML file into the <code>/courses/</code> folder of the
                website and enter that path above (for example <code>/courses/my-course.html</code>).
              </p>
            </div>
          ) : tab === 'blogs' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage articles and their photos. Disable a blog to hide it without deleting it.
              </p>
              {blogImageError && (
                <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {blogImageError}
                </p>
              )}
              {blogs.map((b) => (
                <div key={b.id} className="rounded-2xl border border-border bg-card/70 p-5 grid gap-3 md:grid-cols-12">
                  <div className="md:col-span-3 space-y-2">
                    <img src={b.image} alt={b.title || 'Blog image'} className="w-full h-28 object-cover rounded-lg border border-border" />
                    <label className="block text-center text-xs rounded-lg border border-border px-3 py-2 cursor-pointer text-foreground hover:bg-muted transition-colors">
                      {blogImageBusy === b.id ? 'Optimizing photo…' : 'Change photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={blogImageBusy === b.id}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) readBlogImage(b.id, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="md:col-span-9 grid gap-3 md:grid-cols-12">
                    <input
                      value={b.title}
                      onChange={(e) => updateBlog(b.id, { title: e.target.value })}
                      placeholder="Blog title"
                      className="md:col-span-7 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    />
                    <input
                      value={b.category}
                      onChange={(e) => updateBlog(b.id, { category: e.target.value })}
                      placeholder="Category"
                      className="md:col-span-3 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    />
                    <select
                      value={b.language || 'en'}
                      onChange={(e) => updateBlog(b.id, { language: e.target.value as TGBlog['language'] })}
                      className="md:col-span-2 bg-muted/30 border border-border rounded-lg px-2 py-2 text-xs text-foreground"
                      aria-label="Blog language"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी</option>
                    </select>
                    <input
                      type="date"
                      value={b.date}
                      onChange={(e) => updateBlog(b.id, { date: e.target.value })}
                      className="md:col-span-12 bg-muted/30 border border-border rounded-lg px-2 py-2 text-xs text-foreground"
                    />
                    <textarea
                      value={b.summary}
                      onChange={(e) => updateBlog(b.id, { summary: e.target.value })}
                      placeholder="Short summary shown on the card"
                      rows={2}
                      className="md:col-span-12 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    />
                    <textarea
                      value={b.body}
                      onChange={(e) => updateBlog(b.id, { body: e.target.value })}
                      placeholder="Full article"
                      rows={6}
                      className="md:col-span-12 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    />
                    <div className="md:col-span-12 flex gap-2 justify-end">
                      <button
                        onClick={() => updateBlog(b.id, { enabled: !b.enabled })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        {b.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {b.enabled ? 'Published' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => setBlogs((prev) => prev.filter((x) => x.id !== b.id))}
                        className="inline-flex items-center justify-center rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors px-3 py-2"
                        aria-label="Delete blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => setBlogs((p) => [...p, emptyBlog()])} className="inline-flex items-center gap-2 rounded-full border border-primary/50 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors">
                  <Plus className="w-4 h-4" /> Add Blog
                </button>
                <button onClick={persistBlogs} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save & Publish
                </button>
                {blogsSaved && <span className="self-center text-xs text-cyber-green">Saved — blogs updated on the website.</span>}
              </div>
            </div>
          ) : tab === 'trainers' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Organizations and campuses where Tech Guardians has conducted training.
              </p>
              {trainers.map((t) => (
                <div key={t.id} className="rounded-2xl border border-border bg-card/70 p-5 grid gap-3 md:grid-cols-12">
                  <input
                    value={t.name}
                    onChange={(e) => updateTrainer(t.id, { name: e.target.value })}
                    placeholder="Organization Name"
                    className="md:col-span-6 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <select
                    value={t.icon}
                    onChange={(e) => updateTrainer(t.id, { icon: e.target.value as TrainerIconName })}
                    className="md:col-span-3 bg-muted/30 border border-border rounded-lg px-2 py-2 text-xs text-foreground"
                  >
                    {TRAINER_ICON_NAMES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <select
                    value={`${t.from}|${t.to}`}
                    onChange={(e) => {
                      const gradient = TRAINER_GRADIENTS.find((item) => `${item.from}|${item.to}` === e.target.value);
                      if (gradient) updateTrainer(t.id, { from: gradient.from, to: gradient.to });
                    }}
                    className="md:col-span-2 bg-muted/30 border border-border rounded-lg px-2 py-2 text-xs text-foreground"
                  >
                    {TRAINER_GRADIENTS.map((g) => (
                      <option key={g.label} value={`${g.from}|${g.to}`}>{g.label}</option>
                    ))}
                  </select>
                  <input
                    value={t.place}
                    onChange={(e) => updateTrainer(t.id, { place: e.target.value })}
                    placeholder="Location or description"
                    className="md:col-span-11 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <button
                    onClick={() => updateTrainer(t.id, { enabled: !t.enabled })}
                    className="md:col-span-1 inline-flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors py-2"
                    aria-label={t.enabled ? 'Disable trainer' : 'Enable trainer'}
                  >
                    {t.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setTrainers((prev) => prev.filter((x) => x.id !== t.id))}
                    className="md:col-span-1 inline-flex items-center justify-center rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors py-2"
                    aria-label="Delete trainer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => setTrainers((p) => [...p, emptyTrainer()])} className="inline-flex items-center gap-2 rounded-full border border-primary/50 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors">
                  <Plus className="w-4 h-4" /> Add Trainer
                </button>
                <button onClick={persistTrainers} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save & Publish
                </button>
                {trainersSaved && <span className="self-center text-xs text-cyber-green">Saved — homepage section updated.</span>}
              </div>
            </div>
          ) : tab === 'contact' ? (
            <div className="rounded-2xl border border-border bg-card/70 p-6 md:p-8 max-w-xl">
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">Site-wide WhatsApp number</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Update the support number used by every page — homepage, courses, awareness booking,
                payment gateway and the forensic engine.
              </p>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Number with country code
              </label>
              <input
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="919929193136"
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground mb-4"
              />
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => {
                    void publish(setWhatsAppNumber(waNumber), () => setWaSaved(true));
                    window.setTimeout(() => setWaSaved(false), 2200);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" /> Save number
                </button>
                <button
                  onClick={() => void publish(setWhatsAppNumber(DEFAULT_WA_NUMBER), () => setWaNumber(DEFAULT_WA_NUMBER))}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Reset to default
                </button>
                {waSaved && <span className="text-xs text-cyber-green">Saved — applied across the website.</span>}
              </div>
            </div>
          ) : tab === 'video' ? (
            <div className="rounded-2xl border border-border bg-card/70 p-6 md:p-8 max-w-2xl">
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">Featured Training</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Change the video shown in the "Featured Training" section on the homepage.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    YouTube Video Link
                  </label>
                  <input
                    value={videoData.id}
                    onChange={(e) => setVideoData({ ...videoData, id: e.target.value })}
                    placeholder="https://youtu.be/_RChOOeJo7Y"
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Paste a YouTube, youtu.be, Shorts, embed link, or the 11-character video ID.
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Section Heading
                  </label>
                  <input
                    value={videoData.title}
                    onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    placeholder="Learn Social Media Ethical Hacking"
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Tagline / Description
                  </label>
                  <textarea
                    value={videoData.tagline}
                    onChange={(e) => setVideoData({ ...videoData, tagline: e.target.value })}
                    placeholder="A hands-on walkthrough..."
                    rows={3}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                  />
                </div>

                <div className="flex flex-wrap gap-3 items-center pt-2">
                  <button
                    onClick={persistVideo}
                    className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Save className="w-4 h-4" /> Save Video Settings
                  </button>
                  <button
                    onClick={() => {
                      const defaults = { id: DEFAULT_VIDEO_ID, title: DEFAULT_VIDEO_TITLE, tagline: DEFAULT_VIDEO_TAGLINE };
                      setVideoData(defaults);
                      void publish(setFeaturedVideo(defaults.id, defaults.title, defaults.tagline));
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset to default
                  </button>
                  {videoSaved && <span className="text-xs text-cyber-green">Saved — updated on the homepage.</span>}
                </div>
              </div>
            </div>
          ) : tab === 'events' ? (
            <div className="space-y-4">
              {events.map((ev) => (
                <div key={ev.id} className="rounded-2xl border border-border bg-card/70 p-5 grid gap-3 md:grid-cols-12">
                  <input
                    value={ev.title}
                    onChange={(e) => update(ev.id, { title: e.target.value })}
                    placeholder="Event title"
                    className="md:col-span-5 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <input
                    value={ev.when}
                    onChange={(e) => update(ev.id, { when: e.target.value })}
                    placeholder="When (e.g. Sat • 7:00 PM IST)"
                    className="md:col-span-3 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <input
                    value={ev.tag}
                    onChange={(e) => update(ev.id, { tag: e.target.value })}
                    placeholder="Tag"
                    className="md:col-span-2 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                  <select
                    value={ev.color}
                    onChange={(e) => update(ev.id, { color: e.target.value as TGEvent['color'] })}
                    className="md:col-span-1 bg-muted/30 border border-border rounded-lg px-2 py-2 text-xs text-foreground"
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c.replace('cyber-', '')}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setEvents((prev) => prev.filter((x) => x.id !== ev.id))}
                    className="md:col-span-1 inline-flex items-center justify-center rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors py-2"
                    aria-label="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => setEvents((p) => [...p, emptyEvent()])} className="inline-flex items-center gap-2 rounded-full border border-primary/50 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors">
                  <Plus className="w-4 h-4" /> Add Event
                </button>
                <button onClick={persist} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save & Publish
                </button>
                {saved && <span className="self-center text-xs text-cyber-green">Saved — homepage events updated.</span>}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importSheet(f);
                    e.target.value = '';
                  }}
                />
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-primary/50 text-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary/10 transition-colors">
                  <Upload className="w-4 h-4" /> Load Payment Excel / CSV
                </button>
                <button onClick={syncFromSheet} className="inline-flex items-center gap-2 rounded-full bg-cyber-green/15 border border-cyber-green/50 text-cyber-green px-5 py-2.5 text-sm font-semibold hover:bg-cyber-green/25 transition-colors">
                  <CloudDownload className="w-4 h-4" /> Sync from Google Sheet
                </button>
                <button onClick={() => void loadServerPayments().then((rows) => setPayments(syncPayments(rows))).catch(() => setPayments(syncPayments()))} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                  <RefreshCw className="w-4 h-4" /> Refresh enrollments
                </button>
                <button onClick={exportSheet} disabled={!payments.length} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40">
                  <Download className="w-4 h-4" /> Export Excel
                </button>
                <span className="text-xs text-muted-foreground">
                  {payments.length} entries · Total ₹{totalAmount.toLocaleString('en-IN')}
                </span>
                {sheetStatus && <span className="w-full text-xs text-muted-foreground">{sheetStatus}</span>}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border bg-card/70">
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="p-3">#</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">UTR / Txn ID</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Screenshot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
                          No enrollments yet. They appear here automatically when students submit the payment page.
                        </td>
                      </tr>
                    )}
                    {payments.map((p, i) => (
                      <tr key={`${p.utr}-${i}`} className="border-t border-border/60">
                        <td className="p-3 text-muted-foreground">{i + 1}</td>
                        <td className="p-3 text-foreground">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.date}</td>
                        <td className="p-3 text-muted-foreground">{p.course}</td>
                        <td className="p-3 text-cyber-green">{p.amount}</td>
                        <td className="p-3 text-cyber-orange">{p.utr}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {p.email}
                          {p.phone ? ` · ${p.phone}` : ''}
                        </td>
                        <td className="p-3">
                          {p.shot ? (
                            <button onClick={() => p.shot && setShot(p.shot)} className="block">
                              <img src={p.shot} alt="Payment screenshot" className="w-14 h-14 object-cover rounded-lg border border-border hover:border-primary transition-colors" />
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {shot && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShot(null)}>
          <img src={shot} alt="Payment screenshot" className="max-h-[85vh] max-w-full rounded-xl border border-border" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </SiteFrame>
  );
};

export default Manage;
