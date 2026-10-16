import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Which homepage sections show, in what order, and which pages are switched off.
// Edited in Manage → Sections & Pages.

export interface HomeSectionInfo { id: string; label: string }

/** Every built-in homepage section, in default order. Custom sections use `custom:<id>`. */
export const HOME_SECTIONS: HomeSectionInfo[] = [
  { id: 'hero', label: 'Hero (headline and photo)' },
  { id: 'ecosystem', label: 'Explore the Tech Guardians ecosystem' },
  { id: 'events', label: 'Events & Workshops' },
  { id: 'free-tools', label: 'Free tools for everyday cyber safety' },
  { id: 'products', label: 'Products & Solutions' },
  { id: 'cyber-crime-banner', label: 'Report cyber crime (victim help)' },
  { id: 'featured-training', label: 'Featured training video' },
  { id: 'courses', label: 'Training Programs' },
  { id: 'pdf-store', label: 'PDF Store (books for sale)' },
  { id: 'news-events', label: 'News & quick events (older list)' },
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
  { id: 'contact', label: 'Contact us' },
];

/** Shown on a fresh homepage: banner, ecosystem, events, free tools, report-a-crime help and contact. */
const DEFAULT_VISIBLE_SECTIONS = ['hero', 'ecosystem', 'events', 'free-tools', 'cyber-crime-banner', 'contact'];
/** Sections switched on for homepages saved before version 3. */
const ADDED_IN_V3 = ['cyber-crime-banner', 'contact'];
export const DEFAULT_HIDDEN_SECTIONS = HOME_SECTIONS.map((s) => s.id).filter((id) => !DEFAULT_VISIBLE_SECTIONS.includes(id));


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
  { path: '/cyber-portal', label: 'Cyber Safety Portal' },
  { path: '/pdf-store', label: 'PDF Store' },
  { path: '/training', label: 'Training Programs' },
  { path: '/products', label: 'Products & Solutions' },
  { path: '/events', label: 'Events' },
  { path: '/account', label: 'Student accounts (My Account)' },
];

export interface SiteLayout {
  /** Section ids in display order. Ids missing here are appended in default order. */
  order: string[];
  hidden: string[];
  hiddenPages: string[];
  /** 3 = adds the cyber crime help banner and contact. 2 = ecosystem, events and free tools. Older layouts keep only their page switches. */
  version?: number;
}

export const LAYOUT_KEY = 'tg_layout';
const EMPTY: SiteLayout = { order: [], hidden: [], hiddenPages: [] };

export const LAYOUT_VERSION = 3;

export const loadLayout = (): SiteLayout => {
  const saved = readSetting<Partial<SiteLayout>>(LAYOUT_KEY, EMPTY) || EMPTY;
  const current = saved.version === LAYOUT_VERSION || saved.version === 2;
  const hidden = current && Array.isArray(saved.hidden) ? saved.hidden : DEFAULT_HIDDEN_SECTIONS;
  return {
    order: current && Array.isArray(saved.order) ? saved.order : [],
    hidden: saved.version === 2 ? hidden.filter((id) => !ADDED_IN_V3.includes(id)) : hidden,
    hiddenPages: Array.isArray(saved.hiddenPages) ? saved.hiddenPages : [],
    version: LAYOUT_VERSION,
  };
};

export const saveLayout = (layout: SiteLayout) => publishSetting(LAYOUT_KEY, { ...layout, version: LAYOUT_VERSION });

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
