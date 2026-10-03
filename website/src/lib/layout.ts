import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Which homepage sections show, in what order, and which pages are switched off.
// Edited in Manage → Sections & Pages.

export interface HomeSectionInfo { id: string; label: string }

/** Every built-in homepage section, in default order. Custom sections use `custom:<id>`. */
export const HOME_SECTIONS: HomeSectionInfo[] = [
  { id: 'hero', label: 'Hero (headline and photo)' },
  { id: 'cyber-crime-banner', label: 'Cyber crime help banner' },
  { id: 'featured-training', label: 'Featured training video' },
  { id: 'courses', label: 'Courses' },
  { id: 'news-events', label: 'News & events' },
  { id: 'organization-offerings', label: 'Organization services' },
  { id: 'awareness', label: 'Awareness & trainings at' },
  { id: 'about', label: 'About' },
  { id: 'features', label: 'Programs / features' },
  { id: 'services', label: 'Services' },
  { id: 'protection-platform', label: 'Protection platform' },
  { id: 'security-modules', label: 'Security modules' },
  { id: 'step-by-step', label: 'Step-by-step guides' },
  { id: 'indian-cyber', label: 'India cyber section' },
  { id: 'cyber-terminal', label: 'Cyber terminal' },
  { id: 'threat-intel-card', label: 'Threat intel card' },
  { id: 'cyber-news-card', label: 'Cyber news portal card' },
  { id: 'forensic-engine-card', label: 'Forensic engine card' },
  { id: 'security-assessment-banner', label: 'Security assessment banner' },
  { id: 'download-tools', label: 'Download tools' },
  { id: 'pdf-library', label: 'PDF library' },
  { id: 'media-gallery', label: 'Media gallery' },
  { id: 'youtube', label: 'YouTube videos' },
  { id: 'founders', label: 'Founders' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'trust', label: 'Trust / partners' },
  { id: 'enroll', label: 'Enroll call-to-action' },
  { id: 'enroll-form', label: 'Enroll form' },
  { id: 'contact', label: 'Contact' },
];

/** Pages that can be switched off. A switched-off page shows "not found". */
export const SITE_PAGES: { path: string; label: string }[] = [
  { path: '/about', label: 'About Us' },
  { path: '/rj-nehra', label: 'RJ Nehra profile' },
  { path: '/blog', label: 'Blog' },
  { path: '/tg-blogs', label: 'TG Blogs' },
  { path: '/cyber-crime-support', label: 'Cyber Crime Support' },
  { path: '/threat-intel', label: 'Threat Intel Hub' },
  { path: '/cyber-news', label: 'Cyber News Portal' },
  { path: '/security-assessment', label: 'Security Assessment' },
  { path: '/cyber-range', label: 'Cyber Range' },
  { path: '/admin', label: 'Admin (legacy page)' },
];

export interface SiteLayout {
  /** Section ids in display order. Ids missing here are appended in default order. */
  order: string[];
  hidden: string[];
  hiddenPages: string[];
}

export const LAYOUT_KEY = 'tg_layout';
const EMPTY: SiteLayout = { order: [], hidden: [], hiddenPages: [] };

export const loadLayout = (): SiteLayout => {
  const saved = readSetting<Partial<SiteLayout>>(LAYOUT_KEY, EMPTY) || EMPTY;
  return {
    order: Array.isArray(saved.order) ? saved.order : [],
    hidden: Array.isArray(saved.hidden) ? saved.hidden : [],
    hiddenPages: Array.isArray(saved.hiddenPages) ? saved.hiddenPages : [],
  };
};

export const saveLayout = (layout: SiteLayout) => publishSetting(LAYOUT_KEY, layout);

/** Full ordered list of section ids: saved order first, then anything new. */
export const orderedSectionIds = (layout: SiteLayout, customIds: string[]) => {
  const all = [...HOME_SECTIONS.map((s) => s.id), ...customIds.map((id) => `custom:${id}`)];
  const known = new Set(all);
  const result = layout.order.filter((id) => known.has(id));
  for (const id of all) if (!result.includes(id)) result.push(id);
  return result;
};

export const isPageHidden = (path: string) => {
  const clean = path.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  return loadLayout().hiddenPages.includes(clean);
};

export const useLayout = () => {
  const [layout, setLayout] = useState(loadLayout);
  useEffect(() => {
    const refresh = () => setLayout(loadLayout());
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  return layout;
};
