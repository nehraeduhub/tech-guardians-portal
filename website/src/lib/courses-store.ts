import { readSetting, publishSetting } from '@/lib/shared-settings';
import { loadCourses as loadCourseJson, type CourseItem } from '@/lib/local-content';

export interface ManagedCourse {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  page: string;
  price: string;
  offer: string;
  showPrice: boolean;
  enabled: boolean;
}

export const COURSES_KEY = 'tg_courses_admin';
export const COURSES_NAV_KEY = 'tg_show_courses_nav';
export const COURSES_HOME_KEY = 'tg_show_courses_home';

export const COURSE_ICON_NAMES = [
  'Globe', 'Shield', 'Server', 'Bot', 'Key', 'Smartphone', 'BookOpen',
  'Skull', 'Search', 'Brain', 'HardDrive', 'Eye', 'Bug', 'Code', 'Database', 'Cpu', 'Network',
] as const;

const toManaged = (c: CourseItem): ManagedCourse => ({
  id: c.id,
  title: c.title,
  description: c.description,
  icon_name: c.icon_name,
  page: c.page,
  price: '',
  offer: '',
  showPrice: false,
  enabled: true,
});

export const loadCourseOverrides = (): ManagedCourse[] => readSetting(COURSES_KEY, [] as ManagedCourse[]);
export const saveCourseOverrides = (rows: ManagedCourse[]) => publishSetting(COURSES_KEY, rows);

/** Base catalogue merged with the admin edits (order follows the admin list). */
export const loadManagedCourses = async (): Promise<ManagedCourse[]> => {
  const base = (await loadCourseJson()).map(toManaged);
  const overrides = loadCourseOverrides();
  if (!overrides.length) return base;
  const byId = new Map(base.map((c) => [c.id, c]));
  const merged = overrides.map((o) => ({ ...(byId.get(o.id) || toManaged(o as CourseItem)), ...o }));
  const seen = new Set(merged.map((c) => c.id));
  return [...merged, ...base.filter((c) => !seen.has(c.id))];
};

export const emptyCourse = (): ManagedCourse => ({
  id: `c${Date.now()}`,
  title: '',
  description: '',
  icon_name: 'BookOpen',
  page: '/courses/',
  price: '',
  offer: '',
  showPrice: false,
  enabled: true,
});

export const isCoursesNavVisible = () => readSetting(COURSES_NAV_KEY, true);
export const setCoursesNavVisible = (visible: boolean) => publishSetting(COURSES_NAV_KEY, visible);
export const isCoursesHomeVisible = () => readSetting(COURSES_HOME_KEY, true);
export const setCoursesHomeVisible = (visible: boolean) => publishSetting(COURSES_HOME_KEY, visible);
