import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Admin-managed lists (custom sections, PDFs, media, videos, testimonials).
// Each row has an id and a `visible` flag; the website shows visible rows only.

export interface ListRow { id: string; visible: boolean; [field: string]: string | boolean }

export interface ListField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'image' | 'video' | 'url' | 'select';
  options?: string[];
  placeholder?: string;
}

export interface ListDef {
  key: string;
  title: string;
  description: string;
  itemLabel: string;
  fields: ListField[];
  /** Rows shown until the admin saves the list for the first time. */
  seed?: ListRow[];
}

export const CUSTOM_SECTIONS: ListDef = {
  key: 'tg_custom_sections',
  title: 'Custom sections',
  description: 'Add your own homepage sections. Position them in Sections & Pages.',
  itemLabel: 'section',
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Small label above the title' },
    { key: 'body', label: 'Text', type: 'textarea' },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'buttonText', label: 'Button text' },
    { key: 'buttonLink', label: 'Button link', type: 'url', placeholder: 'https://… or /courses/…' },
  ],
};

export const PDF_LIST: ListDef = {
  key: 'tg_pdfs',
  title: 'PDF library',
  description: 'Downloadable guides shown in the PDF library section.',
  itemLabel: 'PDF',
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'file_url', label: 'PDF link', type: 'url', placeholder: 'https://… or /pdfs/file.pdf' },
  ],
};

export const MEDIA_LIST: ListDef = {
  key: 'tg_media',
  title: 'Media gallery',
  description: 'Photos and videos shown in the media gallery section.',
  itemLabel: 'media item',
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type', type: 'select', options: ['image', 'video'] },
    { key: 'url', label: 'Image', type: 'image' },
  ],
};

export const VIDEO_LIST: ListDef = {
  key: 'tg_videos',
  title: 'YouTube videos',
  description: 'Videos shown in the YouTube section. Use the YouTube video id (the part after v=).',
  itemLabel: 'video',
  fields: [
    { key: 'id_youtube', label: 'YouTube video id', placeholder: 'dQw4w9WgXcQ' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
};

const seed = (rows: Record<string, string>[]): ListRow[] => rows.map((r, i) => ({ id: `seed${i + 1}`, visible: true, ...r }));

export const NEWS_ALERTS: ListDef = {
  key: 'tg_news_alerts',
  title: 'News desk alerts',
  description: 'Your own warnings, pinned at the top of the Cyber News Portal (scam alerts, advisories, event notices).',
  itemLabel: 'alert',
  fields: [
    { key: 'title', label: 'Headline' },
    { key: 'level', label: 'Level', type: 'select', options: ['Critical', 'High', 'Advisory', 'Info'] },
    { key: 'body', label: 'Details', type: 'textarea' },
    { key: 'date', label: 'Date shown', placeholder: '3 Oct 2026' },
    { key: 'link', label: 'Read-more link (optional)', type: 'url', placeholder: 'https://…' },
  ],
  seed: seed([
    { title: '“Digital arrest” video calls are a scam', level: 'Critical', date: '', link: 'https://cybercrime.gov.in/',
      body: 'No police, CBI, ED or customs officer arrests anyone on a video call or asks for money to “clear your name”. Disconnect, do not pay, and call 1930.' },
    { title: 'Fake electricity-bill and KYC SMS', level: 'High', date: '', link: '',
      body: 'Messages saying your power or bank account will be cut tonight are phishing. Never call the number in the SMS or install apps they send (AnyDesk, APK files).' },
    { title: 'Report cyber fraud within the golden hour', level: 'Advisory', date: '', link: 'https://cybercrime.gov.in/',
      body: 'Call 1930 or file at cybercrime.gov.in immediately. Fast reporting lets banks freeze the money before it moves.' },
  ]),
};

export const RANGE_SCENARIOS: ListDef = {
  key: 'tg_range_scenarios',
  title: 'Cyber Range scenarios',
  description: 'Lab scenarios shown in the Cyber Range catalogue.',
  itemLabel: 'scenario',
  fields: [
    { key: 'title', label: 'Scenario name' },
    { key: 'track', label: 'Track', type: 'select', options: ['Web', 'Network', 'Malware', 'Forensics', 'Cloud', 'SOC / Blue Team', 'OT / IoT'] },
    { key: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'duration', label: 'Duration', placeholder: '90 min' },
    { key: 'mitre', label: 'MITRE ATT&CK techniques', placeholder: 'T1566, T1204' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  seed: seed([
    { title: 'Phishing to Initial Access', track: 'SOC / Blue Team', level: 'Beginner', duration: '60 min', mitre: 'T1566, T1204', description: 'Trace a malicious attachment from inbox to endpoint, read the mail headers and contain the infected host.' },
    { title: 'SQL Injection on a Banking Portal', track: 'Web', level: 'Beginner', duration: '75 min', mitre: 'T1190', description: 'Exploit and then fix an injectable login and statement search on a mock net-banking site.' },
    { title: 'Ransomware Outbreak Response', track: 'SOC / Blue Team', level: 'Advanced', duration: '3 hrs', mitre: 'T1486, T1490', description: 'A file server starts encrypting. Detect, isolate, find patient zero and restore from clean backups against the clock.' },
    { title: 'Active Directory Kerberoasting', track: 'Network', level: 'Intermediate', duration: '2 hrs', mitre: 'T1558.003', description: 'Request service tickets, crack weak service-account passwords, then harden AD and detect the attack in event logs.' },
    { title: 'Lateral Movement Hunt', track: 'Network', level: 'Advanced', duration: '2.5 hrs', mitre: 'T1021, T1550', description: 'Follow an attacker hopping between hosts with stolen credentials using Sysmon, Zeek and SIEM queries.' },
    { title: 'Android Banking Trojan Analysis', track: 'Malware', level: 'Intermediate', duration: '2 hrs', mitre: 'T1417, T1636', description: 'Unpack a fake KYC APK, find its SMS-stealing permissions and C2 server, and write detection notes.' },
    { title: 'Windows Memory Forensics', track: 'Forensics', level: 'Intermediate', duration: '2 hrs', mitre: 'T1055', description: 'Use Volatility on a RAM capture to find injected code, hidden processes and the attacker’s command history.' },
    { title: 'UPI Fraud Investigation', track: 'Forensics', level: 'Beginner', duration: '90 min', mitre: 'T1656', description: 'Rebuild a fraud timeline from screenshots, call logs and bank statements and prepare a cyber-cell complaint.' },
    { title: 'Misconfigured Cloud Storage', track: 'Cloud', level: 'Beginner', duration: '60 min', mitre: 'T1530', description: 'Find a public storage bucket leaking customer data, assess the exposure and lock it down with least privilege.' },
    { title: 'Cloud Account Takeover', track: 'Cloud', level: 'Advanced', duration: '2.5 hrs', mitre: 'T1078.004, T1098', description: 'Investigate stolen access keys, attacker-created users and crypto-mining instances in a cloud tenant.' },
    { title: 'Web Shell on a WordPress Site', track: 'Web', level: 'Intermediate', duration: '90 min', mitre: 'T1505.003', description: 'Find the vulnerable plugin, the dropped web shell and the attacker’s actions in access logs, then clean and harden.' },
    { title: 'SCADA / PLC Intrusion', track: 'OT / IoT', level: 'Advanced', duration: '3 hrs', mitre: 'T0831, T0855', description: 'Detect unauthorised Modbus writes on a simulated water-treatment plant and restore safe operation.' },
  ]),
};

export const HOME_ECOSYSTEM: ListDef = {
  key: 'tg_home_ecosystem',
  title: 'Ecosystem cards',
  description: 'The picture cards in “Explore the Tech Guardians ecosystem” on the homepage.',
  itemLabel: 'card',
  fields: [
    { key: 'eyebrow', label: 'Small label' },
    { key: 'title', label: 'Title' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'image', label: 'Picture', type: 'image' },
    { key: 'buttonText', label: 'Button text' },
    { key: 'buttonLink', label: 'Button link', type: 'url', placeholder: '/products or https://…' },
  ],
  seed: seed([
    { eyebrow: 'Training Programs', title: 'Upgrade your skills with practical cybersecurity training', text: 'Live classes and hands-on labs for students, professionals and organisations.', image: '/images/site/home-training.jpg', buttonText: 'View Training', buttonLink: '/training' },
    { eyebrow: 'Products & Solutions', title: 'Security tools and services for your organisation', text: 'VAPT tool, Windows audit & hardening, secure website and app development — with product training.', image: '/images/site/product-vapt.jpg', buttonText: 'Explore Products', buttonLink: '/products' },
    { eyebrow: 'Resources & Guides', title: 'Stay informed. Stay ahead.', text: 'Handbooks, guides, checklists and the latest cybersecurity news.', image: '/images/site/home-resources.jpg', buttonText: 'Explore Resources', buttonLink: '/pdf-store' },
    { eyebrow: 'Cyber Awareness', title: 'A safer digital world for everyone', text: 'Awareness sessions with real examples to keep students, staff and families safe online.', image: '/images/site/home-awareness.jpg', buttonText: 'Book a Session', buttonLink: '/courses/awareness-booking.html' },
  ]),
};

export const HERO_LAYOUTS = ['Poster — picture already has its text', 'Photo — show the headline on the picture'] as const;

export const HERO_SLIDES: ListDef = {
  // v3: full-width 8:3 banners. Slides saved under older keys are not read.
  key: 'tg_hero_slides_v3',
  title: 'Homepage carousel',
  description: 'The full-width banners at the top of the homepage. Make banner pictures 1920 × 720 px (8:3) and keep text and logos inside the middle 1500 × 600 px; they then fill the full width with nothing blurred or cut off. Pictures of any other shape are shown whole on a soft blurred background. Keep the caption short and do not repeat words already on the picture. "Photo" slides show the headline on top of the photo.',
  itemLabel: 'slide',
  fields: [
    { key: 'layout', label: 'Slide type', type: 'select', options: [...HERO_LAYOUTS] },
    { key: 'image', label: 'Picture', type: 'image' },
    { key: 'title', label: 'Caption (short — one line)' },
    { key: 'buttonText', label: 'Button text' },
    { key: 'buttonLink', label: 'Button link', type: 'url', placeholder: '/training or https://…' },
    { key: 'eyebrow', label: 'Photo slides only: small label above the headline' },
    { key: 'accent', label: 'Photo slides only: highlighted end of the headline' },
    { key: 'text', label: 'Photo slides only: text', type: 'textarea' },
  ],
  seed: seed([
    { layout: HERO_LAYOUTS[0], image: '/images/hero/banner-training.webp', imageMobile: '/images/hero/banner-training-m.webp', title: 'Learn by doing in live, mentor-led labs', buttonText: 'Explore Training', buttonLink: '/training' },
    { layout: HERO_LAYOUTS[0], image: '/images/hero/banner-news-forensic.webp', imageMobile: '/images/hero/banner-news-forensic-m.webp', title: 'Today’s cyber news and free forensic tools in one place', buttonText: 'Read Cyber News', buttonLink: '/cyber-news' },
    { layout: HERO_LAYOUTS[0], image: '/images/hero/banner-events.webp', imageMobile: '/images/hero/banner-events-m.webp', title: 'Seats are limited — register in a minute', buttonText: 'See Events', buttonLink: '/events' },
    { layout: HERO_LAYOUTS[0], image: '/images/hero/banner-handbooks.webp', imageMobile: '/images/hero/banner-handbooks-m.webp', title: '43 handbooks — look inside before you buy', buttonText: 'Open PDF Store', buttonLink: '/pdf-store' },
    { layout: HERO_LAYOUTS[0], image: '/images/hero/banner-awareness.webp', imageMobile: '/images/hero/banner-awareness-m.webp', title: 'Bring a cyber awareness session to your school or office', buttonText: 'Book a Session', buttonLink: '/courses/awareness-booking.html' },
    { layout: HERO_LAYOUTS[0], image: '/images/hero/banner-products.webp', imageMobile: '/images/hero/banner-products-m.webp', title: 'Ready-to-use security tools — now with Cyber Sec Chitti', buttonText: 'View Products', buttonLink: '/products' },
  ]),
};

export const PRODUCT_ADS: ListDef = {
  key: 'tg_product_ads',
  title: 'Product video ads',
  description: 'Short product videos shown as advertisements on the homepage and the Products page. They play silently and automatically, one after another. Use MP4 videos up to 80 MB (shorter and smaller loads faster). Leave the button link empty to open WhatsApp with a "I want to buy" message.',
  itemLabel: 'video ad',
  fields: [
    { key: 'title', label: 'Product name' },
    { key: 'tagline', label: 'One-line pitch' },
    { key: 'video', label: 'Video', type: 'video' },
    { key: 'poster', label: 'Cover picture (shown before the video plays)', type: 'image' },
    { key: 'badge', label: 'Badge (e.g. New, Bestseller)' },
    { key: 'price', label: 'Price text (optional, e.g. ₹4,999)' },
    { key: 'buttonText', label: 'Button text', placeholder: 'Buy Now' },
    { key: 'buttonLink', label: 'Button link', type: 'url', placeholder: '/products/tg-vapt or https://…' },
  ],
  seed: seed([
    { title: 'Cyber Sec Chitti', tagline: 'Your offline AI SOC analyst — turns 10,000 alerts into the one real attack, with the full attack path and next steps.', video: '/videos/ads/cyber-sec-chitti.mp4', videoWebm: '/videos/ads/cyber-sec-chitti.webm', poster: '/videos/ads/cyber-sec-chitti.jpg', badge: 'New', price: '', buttonText: 'Buy Now', buttonLink: '/products/cyber-sec-chitti' },
    { title: 'Automated VAPT Platform', tagline: 'Plug, scan, report — portable security testing that confirms real vulnerabilities.', video: '/videos/ads/vapt-platform.mp4', videoWebm: '/videos/ads/vapt-platform.webm', poster: '/videos/ads/vapt-platform.jpg', badge: 'Portable', price: '', buttonText: 'Buy Now', buttonLink: '/products/tg-vapt' },
    { title: 'AI Social Media Auto-Pilot', tagline: 'Daily cyber-awareness posts, reels and stories — written, designed and posted automatically.', video: '/videos/ads/ai-autopilot.mp4', videoWebm: '/videos/ads/ai-autopilot.webm', poster: '/videos/ads/ai-autopilot.jpg', badge: 'Bestseller', price: '', buttonText: 'Buy Now', buttonLink: '' },
    { title: 'Cyber Crime Awareness Demo Kit', tagline: '24 real scams decoded with live demos — ready for schools, colleges and offices.', video: '/videos/ads/awareness-kit.mp4', videoWebm: '/videos/ads/awareness-kit.webm', poster: '/videos/ads/awareness-kit.jpg', badge: 'For institutions', price: '', buttonText: 'Buy Now', buttonLink: '' },
  ]),
};

export const MANAGED_LISTS = [CUSTOM_SECTIONS, PDF_LIST, MEDIA_LIST, VIDEO_LIST, NEWS_ALERTS, RANGE_SCENARIOS, HOME_ECOSYSTEM, HERO_SLIDES, PRODUCT_ADS];

export const newRowId = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Saved rows, or null when the admin has never saved this list. */
export const readList = (def: ListDef): ListRow[] | null => {
  const rows = readSetting<ListRow[] | null>(def.key, null);
  return Array.isArray(rows) ? rows : null;
};

export const saveList = (def: ListDef, rows: ListRow[]) => publishSetting(def.key, rows);

/** Rows of a list, live; null when never saved (fall back to def.seed). */
export const useList = (def: ListDef) => {
  const [rows, setRows] = useState<ListRow[] | null>(() => readList(def));
  useEffect(() => {
    const refresh = () => setRows(readList(def));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, [def]);
  return rows;
};
