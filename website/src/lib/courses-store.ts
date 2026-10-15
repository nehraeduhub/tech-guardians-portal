import { useEffect, useState } from 'react';
import { readSetting, publishSetting } from '@/lib/shared-settings';

// Training Programs (formerly "courses"). The catalogue ships in
// public/content/courses.json; the admin's edits (Manage → Training Programs)
// are saved in the `tg_courses_admin` setting and win over the shipped values.
// The server reads the same two sources to price orders (api/store-lib.php).

export interface ProgramOutcome { title: string; text: string; chips?: string[] }
export interface ProgramModule { label: string; title: string; topics: string[] }
export interface ProgramTool { name: string; type?: string }
export interface ProgramStat { value: string; label: string }

export interface ManagedCourse {
  id: string;
  title: string;
  /** Short text for cards. */
  description: string;
  icon_name: string;
  page: string;
  /** Regular price (MRP), e.g. "1599". */
  price: string;
  /** Offer price; empty when there is no offer. */
  offer: string;
  showPrice: boolean;
  enabled: boolean;
  kind?: 'course' | 'session';
  category?: string;
  headline?: string;
  intro?: string;
  duration?: string;
  level?: string;
  mode?: string;
  image?: string;
  featured?: boolean;
  highlights?: string[];
  tags?: string[];
  stats?: ProgramStat[];
  outcomes?: ProgramOutcome[];
  modules?: ProgramModule[];
  tools?: ProgramTool[];
}

export const COURSES_KEY = 'tg_courses_admin';
export const COURSES_NAV_KEY = 'tg_show_courses_nav';
export const COURSES_HOME_KEY = 'tg_show_courses_home';

export const COURSE_ICON_NAMES = [
  'Globe', 'Shield', 'Server', 'Bot', 'Key', 'Smartphone', 'BookOpen',
  'Skull', 'Search', 'Brain', 'HardDrive', 'Eye', 'Bug', 'Code', 'Database', 'Cpu', 'Network',
] as const;

/** Old static course pages now live at /training/<id>. */
export const programPath = (c: Pick<ManagedCourse, 'id' | 'page'>) => {
  const m = /^\/courses\/([a-z0-9-]+)\.html$/i.exec(c.page || '');
  if (m && m[1] !== 'payment') return `/training/${m[1]}`;
  if (!c.page || c.page === '/courses/' || c.page === `/course/${c.id}`) return `/training/${c.id}`;
  return c.page;
};

const amount = (v: string | number | undefined) => {
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Price shown to visitors: sale price, regular price and the real discount. */
export const programPrice = (c: Pick<ManagedCourse, 'price' | 'offer'>) => {
  const mrp = amount(c.price);
  const offer = amount(c.offer);
  const sale = offer || mrp;
  const regular = offer && mrp > offer ? mrp : 0;
  const discount = regular ? Math.round(((regular - sale) / regular) * 100) : 0;
  return { sale, regular, discount };
};

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const checkoutPath = (c: Pick<ManagedCourse, 'id'>) => `/courses/payment.html?program=${encodeURIComponent(c.id)}`;

let baseCache: Promise<ManagedCourse[]> | null = null;
const loadBase = () => {
  if (!baseCache) {
    baseCache = fetch('/content/courses.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: ManagedCourse[]) => (Array.isArray(rows) ? rows : []))
      .catch(() => []);
  }
  return baseCache;
};

export const loadCourseOverrides = (): ManagedCourse[] => {
  const rows = readSetting<ManagedCourse[]>(COURSES_KEY, []);
  return Array.isArray(rows) ? rows : [];
};
export const saveCourseOverrides = (rows: ManagedCourse[]) => publishSetting(COURSES_KEY, rows);

/** Shipped catalogue merged with the admin edits (order follows the admin list). */
export const loadManagedCourses = async (): Promise<ManagedCourse[]> => {
  const base = await loadBase();
  const overrides = loadCourseOverrides();
  const byId = new Map(base.map((c) => [c.id, c]));
  const merged = overrides.length
    ? [
      ...overrides.map((o) => ({ ...(byId.get(o.id) || emptyCourse()), ...o })),
      ...base.filter((c) => !overrides.some((o) => o.id === c.id)),
    ]
    : base;
  return merged.map((c) => ({ ...c, page: programPath(c) }));
};

/** Enabled programs, live. */
export const usePrograms = () => {
  const [rows, setRows] = useState<ManagedCourse[] | null>(null);
  useEffect(() => {
    let alive = true;
    const refresh = () => void loadManagedCourses().then((all) => { if (alive) setRows(all.filter((c) => c.enabled && c.title.trim())); });
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => { alive = false; window.removeEventListener('tg-settings-changed', refresh); };
  }, []);
  return rows;
};

export const emptyCourse = (): ManagedCourse => ({
  id: `p${Date.now().toString(36)}`,
  title: '',
  description: '',
  icon_name: 'BookOpen',
  page: '',
  price: '',
  offer: '',
  showPrice: true,
  enabled: true,
  kind: 'course',
  category: 'Cyber Security',
  duration: '',
  level: 'Beginner to Pro',
  mode: 'Live online classes',
  highlights: [],
  tags: [],
  stats: [],
  outcomes: [],
  modules: [],
  tools: [],
});

export const isCoursesNavVisible = () => readSetting(COURSES_NAV_KEY, true);
export const setCoursesNavVisible = (visible: boolean) => publishSetting(COURSES_NAV_KEY, visible);
export const isCoursesHomeVisible = () => readSetting(COURSES_HOME_KEY, true);
export const setCoursesHomeVisible = (visible: boolean) => publishSetting(COURSES_HOME_KEY, visible);
