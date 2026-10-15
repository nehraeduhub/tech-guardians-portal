import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';
import { waLink } from '@/lib/site-settings';

// Products, portals and events: admin-managed lists (Manage → Products,
// Portals, Events). Until the admin saves a list, the defaults below are shown.

const useSettingList = <T,>(key: string, defaults: T[]) => {
  const read = () => {
    const saved = readSetting<T[] | null>(key, null);
    return Array.isArray(saved) ? saved : defaults;
  };
  const [rows, setRows] = useState<T[]>(read);
  useEffect(() => {
    const refresh = () => setRows(read());
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return rows;
};

export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/* ---------------- Products ---------------- */

export type ProductStatus = 'Available' | 'Coming soon' | 'Beta' | 'On request';
export type ProductCta = 'buy' | 'demo' | 'enquire' | 'link';

export interface Product {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  features: string[];
  /** Regular price; empty means "price on request". */
  price: string;
  offer: string;
  priceNote: string;
  status: ProductStatus;
  icon_name: string;
  image: string;
  cta: ProductCta;
  /** Used when cta is "link" (e.g. a download or product website). */
  ctaLink: string;
  trainingIncluded: boolean;
  visible: boolean;
  featured: boolean;
}

export const PRODUCTS_KEY = 'tg_products';
export const PRODUCT_CATEGORIES = ['Security Tool', 'Service', 'Product Training', 'Software'];
export const PRODUCT_ICONS = ['Radar', 'ShieldCheck', 'MonitorCog', 'Code2', 'GraduationCap', 'Bug', 'Lock', 'Server', 'Cloud', 'Smartphone', 'Wrench', 'Package'];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'tg-vapt', name: 'TG VAPT Tool', category: 'Security Tool',
    tagline: 'Vulnerability assessment and penetration testing in one console',
    description: 'Scan networks, servers and web applications for known vulnerabilities and misconfigurations, verify findings, and produce a clear, prioritised report your team and auditors can act on.',
    features: ['Network, server and web application scanning', 'OWASP Top 10 and CVE-based checks', 'Risk scoring with clear remediation steps', 'Executive and technical PDF reports', 'Re-scan to verify fixes'],
    price: '', offer: '', priceNote: 'Licence pricing on request', status: 'Coming soon', icon_name: 'Radar',
    image: '/images/site/product-vapt.jpg', cta: 'demo', ctaLink: '', trainingIncluded: true, visible: true, featured: true,
  },
  {
    id: 'win-audit-hardening', name: 'Win Audit & Hardening Tool', category: 'Security Tool',
    tagline: 'Audit and harden Windows systems against security benchmarks',
    description: 'Check Windows 10/11 and Windows Server against hardening best practices (CIS-aligned), see every weak setting in one report, and apply recommended fixes safely with a record of what changed.',
    features: ['One-click security audit of a Windows system', 'CIS-aligned checks: firewall, SMB, RDP, Defender, BitLocker, UAC, audit policy', 'Pass/fail report with the reason for each check', 'Apply recommended hardening with rollback notes', 'Ideal for IT teams, labs and audits'],
    price: '', offer: '', priceNote: 'Pricing on request', status: 'Coming soon', icon_name: 'ShieldCheck',
    image: '/images/site/product-win-audit.jpg', cta: 'demo', ctaLink: '', trainingIncluded: true, visible: true, featured: true,
  },
  {
    id: 'web-app-development', name: 'Website & App Development', category: 'Service',
    tagline: 'Secure websites, web apps and mobile apps, built and maintained for you',
    description: 'From business websites to custom web portals and mobile apps, we design, build, host and maintain them with security built in from day one.',
    features: ['Business websites and landing pages', 'Custom web portals and dashboards', 'Android and cross-platform mobile apps', 'Hosting, SSL, backups and maintenance', 'Security testing before launch'],
    price: '', offer: '', priceNote: 'Quote based on your requirements', status: 'Available', icon_name: 'Code2',
    image: '/images/site/product-web-dev.jpg', cta: 'enquire', ctaLink: '', trainingIncluded: false, visible: true, featured: true,
  },
  {
    id: 'product-training', name: 'Product Training', category: 'Product Training',
    tagline: 'Hands-on training on our tools for your team',
    description: 'Get your IT and security team productive with Tech Guardians tools: guided setup, live walkthroughs, real use cases and support after the training.',
    features: ['Live online or on-site sessions', 'Setup and configuration walkthrough', 'Real-world use cases and reporting', 'Training material and certificate', 'Post-training support'],
    price: '', offer: '', priceNote: 'Included with tool licences, or on request', status: 'Available', icon_name: 'GraduationCap',
    image: '/images/site/product-training.jpg', cta: 'enquire', ctaLink: '', trainingIncluded: false, visible: true, featured: false,
  },
];

export const emptyProduct = (): Product => ({
  id: newId('prod'), name: '', category: 'Security Tool', tagline: '', description: '', features: [],
  price: '', offer: '', priceNote: 'Pricing on request', status: 'Coming soon', icon_name: 'Package', image: '',
  cta: 'enquire', ctaLink: '', trainingIncluded: false, visible: true, featured: false,
});

export const useProducts = () => useSettingList<Product>(PRODUCTS_KEY, DEFAULT_PRODUCTS);
export const loadProducts = () => {
  const saved = readSetting<Product[] | null>(PRODUCTS_KEY, null);
  return Array.isArray(saved) ? saved : DEFAULT_PRODUCTS;
};
export const saveProducts = (rows: Product[]) => publishSetting(PRODUCTS_KEY, rows);

/* ---------------- Portals ---------------- */

export interface Portal {
  id: string;
  name: string;
  description: string;
  /** Full address of the portal on its own subdomain, e.g. https://news.techguardians.in */
  url: string;
  /** Page on this website, used while no external address is set. */
  fallback: string;
  icon_name: string;
  newTab: boolean;
  visible: boolean;
}

export const PORTALS_KEY = 'tg_portals';
export const PORTAL_ICONS = ['Newspaper', 'Radar', 'ScanSearch', 'ShieldCheck', 'Crosshair', 'ClipboardCheck', 'Globe2', 'Siren', 'Database', 'Fingerprint'];

export const DEFAULT_PORTALS: Portal[] = [
  { id: 'news', name: 'Cyber News Portal', description: 'India cyber crime, global threats and advisories, updated live.', url: '', fallback: '/cyber-news', icon_name: 'Newspaper', newTab: true, visible: true },
  { id: 'threat-intel', name: 'Threat Intel Hub', description: 'Live vulnerability and threat intelligence from CISA, NVD and CERT-In.', url: '', fallback: '/threat-intel', icon_name: 'Radar', newTab: true, visible: true },
  { id: 'forensic', name: 'Cyber & Forensic Hub', description: '78 investigation tools and live lookups for analysts and police.', url: '', fallback: '/forensic-engine.html', icon_name: 'ScanSearch', newTab: true, visible: true },
  { id: 'safety', name: 'Cyber Safety Portal', description: 'Check links, report fraud and learn to stay safe online.', url: '', fallback: '/cyber-portal', icon_name: 'ShieldCheck', newTab: true, visible: true },
  { id: 'range', name: 'Cyber Range', description: 'Hands-on attack and defence labs for teams and students.', url: '', fallback: '/cyber-range', icon_name: 'Crosshair', newTab: true, visible: true },
];

export const emptyPortal = (): Portal => ({ id: newId('portal'), name: '', description: '', url: '', fallback: '', icon_name: 'Globe2', newTab: true, visible: true });

export const usePortals = () => useSettingList<Portal>(PORTALS_KEY, DEFAULT_PORTALS);
export const loadPortals = () => {
  const saved = readSetting<Portal[] | null>(PORTALS_KEY, null);
  return Array.isArray(saved) ? saved : DEFAULT_PORTALS;
};
export const savePortals = (rows: Portal[]) => publishSetting(PORTALS_KEY, rows);

/** Where a portal link goes: its own subdomain when set, else the page on this site. */
export const portalHref = (p: Portal) => (/^https?:\/\//i.test(p.url.trim()) ? p.url.trim() : p.fallback || '/');
export const portalIsExternal = (p: Portal) => /^https?:\/\//i.test(p.url.trim());

/* ---------------- Events ---------------- */

export type EventStatus = 'Registrations open' | 'Upcoming' | 'Few seats left' | 'Sold out' | 'Completed';
export const EVENT_TYPES = ['Workshop', 'Webinar', 'Bootcamp', 'Live Class', 'Awareness Session', 'Conference', 'CTF / Competition'];
export const EVENT_STATUSES: EventStatus[] = ['Registrations open', 'Upcoming', 'Few seats left', 'Sold out', 'Completed'];

export interface TGEventItem {
  id: string;
  title: string;
  type: string;
  /** YYYY-MM-DD; empty means "date to be announced". */
  date: string;
  time: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  venue: string;
  description: string;
  speaker: string;
  price: string;
  seats: string;
  image: string;
  registerLink: string;
  status: EventStatus;
  visible: boolean;
}

export const EVENTS_V2_KEY = 'tg_events_v2';

export const DEFAULT_EVENTS_V2: TGEventItem[] = [
  {
    id: 'ev1', title: 'Ethical Hacking Essentials — Live Class', type: 'Live Class', date: '2026-10-24', time: '7:00 PM IST', mode: 'Online',
    venue: 'Google Meet', description: 'A live, hands-on introduction to ethical hacking: reconnaissance, scanning and the attacker mindset, with Q&A.',
    speaker: 'RJ Nehra', price: 'Free', seats: '100', image: '/images/site/event-1.jpg', registerLink: '', status: 'Registrations open', visible: true,
  },
  {
    id: 'ev2', title: 'Build an AI Agent in 3 Days — Capsule Bootcamp', type: 'Bootcamp', date: '2026-11-07', time: '6:30 PM IST', mode: 'Online',
    venue: 'Live online', description: 'Three evening sessions to design, build and deploy your first working AI agent with N8n — no coding background needed.',
    speaker: 'Tech Guardians mentors', price: '₹499', seats: '40', image: '/images/site/event-2.jpg', registerLink: '', status: 'Upcoming', visible: true,
  },
  {
    id: 'ev3', title: 'Cyber Safety Awareness Drive for Schools & Colleges', type: 'Awareness Session', date: '2026-11-21', time: '11:00 AM IST', mode: 'Offline',
    venue: 'Your campus (on request)', description: 'Real scam case studies, live demos and safety habits for students and staff, followed by a certificate of participation.',
    speaker: 'Tech Guardians team', price: 'On request', seats: '', image: '/images/site/event-3.jpg', registerLink: '', status: 'Registrations open', visible: true,
  },
];

export const emptyEvent = (): TGEventItem => ({
  id: newId('ev'), title: '', type: 'Workshop', date: '', time: '', mode: 'Online', venue: '', description: '', speaker: '',
  price: 'Free', seats: '', image: '', registerLink: '', status: 'Upcoming', visible: true,
});

export const useEvents = () => useSettingList<TGEventItem>(EVENTS_V2_KEY, DEFAULT_EVENTS_V2);
export const loadEventsV2 = () => {
  const saved = readSetting<TGEventItem[] | null>(EVENTS_V2_KEY, null);
  return Array.isArray(saved) ? saved : DEFAULT_EVENTS_V2;
};
export const saveEventsV2 = (rows: TGEventItem[]) => publishSetting(EVENTS_V2_KEY, rows);

const today = () => new Date(new Date().toDateString()).getTime();
/** Upcoming (or undated) events first by date; past events after, newest first. */
export const splitEvents = (rows: TGEventItem[]) => {
  const visible = rows.filter((e) => e.visible && e.title.trim());
  const isPast = (e: TGEventItem) => e.status === 'Completed' || (!!e.date && new Date(e.date).getTime() < today());
  const upcoming = visible.filter((e) => !isPast(e)).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  const past = visible.filter(isPast).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return { upcoming, past };
};

export const eventDateParts = (e: TGEventItem) => {
  if (!e.date) return { day: 'TBA', month: '', weekday: '', full: 'Date to be announced' };
  const d = new Date(`${e.date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: 'TBA', month: '', weekday: '', full: e.date };
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

/** Registration link for an event: its own link, else a WhatsApp message. */
export const eventRegisterHref = (e: TGEventItem) =>
  /^https?:\/\//i.test(e.registerLink) || e.registerLink.startsWith('/') ? e.registerLink : waLink(`Hi Tech Guardians, I want to register for "${e.title}"${e.date ? ` on ${e.date}` : ''}.`);
