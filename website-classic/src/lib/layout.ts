import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Which homepage sections show, in what order, and which pages are switched off.
// Edited in Manage → Sections & Pages.

export interface HomeSectionInfo { id: string; label: string }

/** Every built-in homepage section, in default order. Custom sections use `custom:<id>`. */
export const HOME_SECTIONS: HomeSectionInfo[] = [
  { id: 'hero', label: 'Homepage carousel and latest-updates ticker' },
  { id: 'updates', label: 'Events & top cyber news table' },
  { id: 'product-ads', label: 'Product video ads' },
  { id: 'courses', label: 'Training Programs' },
  { id: 'ecosystem', label: 'Explore the Tech Guardians ecosystem' },
  { id: 'forensic-tools', label: 'Forensic tools (from the Cyber & Forensic Hub)' },
  { id: 'events', label: 'Events & Workshops' },
  { id: 'free-tools', label: 'Free tools for everyday cyber safety' },
  { id: 'products', label: 'Products & Solutions' },
  { id: 'cyber-crime-banner', label: 'Report cyber crime (victim help)' },
  { id: 'featured-training', label: 'Featured training video' },
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

/** Shown on a fresh homepage: carousel, events & news table, product video ads, ecosystem, forensic tools, free tools, report-a-crime help and contact. */
const DEFAULT_VISIBLE_SECTIONS = ['hero', 'updates', 'product-ads', 'ecosystem', 'forensic-tools', 'free-tools', 'cyber-crime-banner', 'contact'];
/** Sections switched on for homepages saved before version 3. */
const ADDED_IN_V3 = ['cyber-crime-banner', 'contact'];
/** Version 4: the events & news table replaces the separate events cards; programs and forensic tools are added. */
const ADDED_IN_V4 = ['updates', 'courses', 'forensic-tools'];
const REMOVED_IN_V4 = ['events'];
/** Version 5: product video ads are added; training programs leave the homepage (they stay on /training). */
const ADDED_IN_V5 = ['product-ads'];
const REMOVED_IN_V5 = ['courses'];
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
  /** 5 = product video ads, programs off the homepage. 4 = events & news table, programs and forensic tools (section order reset). 3 = adds the cyber crime help banner and contact. 2 = ecosystem, events and free tools. Older layouts keep only their page switches. */
  version?: number;
}

export const LAYOUT_KEY = 'tg_layout';
const EMPTY: SiteLayout = { order: [], hidden: [], hiddenPages: [] };

export const LAYOUT_VERSION = 5;

export const loadLayout = (): SiteLayout => {
  const saved = readSetting<Partial<SiteLayout>>(LAYOUT_KEY, EMPTY) || EMPTY;
  const v = saved.version;
  const known = v === LAYOUT_VERSION || v === 4 || v === 3 || v === 2;
  const step = (list: string[], added: string[], removed: string[]) => [...list.filter((id) => !added.includes(id)), ...removed.filter((id) => !list.includes(id))];
  let hidden = known && Array.isArray(saved.hidden) ? saved.hidden : DEFAULT_HIDDEN_SECTIONS;
  if (v === 2) hidden = hidden.filter((id) => !ADDED_IN_V3.includes(id));
  if (v === 2 || v === 3) hidden = step(hidden, ADDED_IN_V4, REMOVED_IN_V4);
  if (v === 2 || v === 3 || v === 4) hidden = step(hidden, ADDED_IN_V5, REMOVED_IN_V5);
  return {
    // Orders saved before version 4 are dropped so the new sections appear in their places.
    order: (v === LAYOUT_VERSION || v === 4) && Array.isArray(saved.order) ? (v === 4 ? withAfter(saved.order, 'product-ads', 'updates') : saved.order) : [],
    hidden,
    hiddenPages: Array.isArray(saved.hiddenPages) ? saved.hiddenPages : [],
    version: LAYOUT_VERSION,
  };
};

/** Puts `id` right after `anchor` in a saved order (used when a new section is introduced). */
const withAfter = (order: string[], id: string, anchor: string) => {
  const rest = order.filter((x) => x !== id);
  const at = rest.indexOf(anchor);
  return at < 0 ? rest : [...rest.slice(0, at + 1), id, ...rest.slice(at + 1)];
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
