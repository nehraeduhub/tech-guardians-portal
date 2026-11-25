import { readSetting, publishSetting } from '@/lib/shared-settings';
// Central contact settings. The WhatsApp number can be changed from the
// admin manager (/manage → Contact tab) and applies across every page.
export const WA_KEY = 'tg_wa_number';
export const DEFAULT_WA_NUMBER = '919929193136';

// Two WhatsApp numbers, each with its own on/off switch (Manage -> WhatsApp):
//   new  - the business WhatsApp (https://api.whatsapp.com/send/?phone=15558843157)
//   old  - the previous number kept in WA_KEY
export const WA_CHANNELS_KEY = 'tg_wa_channels';
export const NEW_WA_NUMBER = '15558843157';
export interface WaChannels { newOn: boolean; newNumber: string; oldOn: boolean }
export const DEFAULT_WA_CHANNELS: WaChannels = { newOn: true, newNumber: NEW_WA_NUMBER, oldOn: false };

export const getWaChannels = (): WaChannels => {
  const v = { ...DEFAULT_WA_CHANNELS, ...(readSetting<Partial<WaChannels> | null>(WA_CHANNELS_KEY, null) || {}) };
  return { newOn: !!v.newOn, oldOn: !!v.oldOn, newNumber: /^\d{10,15}$/.test(String(v.newNumber)) ? String(v.newNumber) : NEW_WA_NUMBER };
};
export const setWaChannels = (c: WaChannels) => publishSetting(WA_CHANNELS_KEY, { ...c, newNumber: c.newNumber.replace(/\D/g, '') });

export const getOldWhatsAppNumber = (): string => {
  const value = readSetting(WA_KEY, DEFAULT_WA_NUMBER);
  return /^\d{10,15}$/.test(value) ? value : DEFAULT_WA_NUMBER;
};
export const setWhatsAppNumber = (num: string) => publishSetting(WA_KEY, num.replace(/\D/g, ''));

export interface WaTarget { id: 'new' | 'old'; number: string }
/** The WhatsApp numbers that are switched on, the new one first. */
export const activeWhatsApp = (): WaTarget[] => {
  const c = getWaChannels();
  const out: WaTarget[] = [];
  if (c.newOn) out.push({ id: 'new', number: c.newNumber });
  if (c.oldOn) out.push({ id: 'old', number: getOldWhatsAppNumber() });
  return out;
};
/** First active number, or '' when both numbers are switched off. */
export const getWhatsAppNumber = (): string => activeWhatsApp()[0]?.number ?? '';

export const waUrl = (t: WaTarget, text?: string) =>
  t.id === 'new'
    ? `https://api.whatsapp.com/send/?phone=${t.number}${text ? `&text=${encodeURIComponent(text)}` : ''}`
    : `https://wa.me/${t.number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
/** Every active WhatsApp link (used by the chat button, which can show both). */
export const waLinks = (text?: string) => activeWhatsApp().map((t) => ({ id: t.id, href: waUrl(t, text) }));
/** One WhatsApp link; goes to the contact section when WhatsApp is switched off. */
export const waLink = (text?: string) => {
  const t = activeWhatsApp()[0];
  return t ? waUrl(t, text) : '/#contact';
};

export const FEATURED_VIDEO_KEY = 'tg_featured_video';
export const DEFAULT_VIDEO_ID = '_RChOOeJo7Y';
export const DEFAULT_VIDEO_TITLE = 'Learn Social Media Ethical Hacking';
export const DEFAULT_VIDEO_TAGLINE = 'A hands-on walkthrough of social engineering tactics, account hardening, and ethical defense techniques.';

export interface FeaturedVideoSettings {
  id: string;
  title: string;
  tagline: string;
}

export const getFeaturedVideo = (): FeaturedVideoSettings => ({
  id: DEFAULT_VIDEO_ID, title: DEFAULT_VIDEO_TITLE, tagline: DEFAULT_VIDEO_TAGLINE,
  ...readSetting<Partial<FeaturedVideoSettings>>(FEATURED_VIDEO_KEY, {}),
});

const youtubeVideoId = (value: string) => {
  const input = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || DEFAULT_VIDEO_ID;
    if (url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || DEFAULT_VIDEO_ID;
    return url.searchParams.get('v') || DEFAULT_VIDEO_ID;
  } catch {
    return DEFAULT_VIDEO_ID;
  }
};

export const setFeaturedVideo = (idOrUrl: string, title: string, tagline: string) =>
  publishSetting(FEATURED_VIDEO_KEY, { id: youtubeVideoId(idOrUrl), title: title.trim(), tagline: tagline.trim() });

// Google Sheet (Apps Script web app) that stores every payment submitted from
// the payment gateway. Used to sync the admin payment history.
export const PAYMENT_SHEET_URL =
  'https://script.google.com/macros/s/AKfycby4vVoo20WGdp7hLuxvLP7_NrpFzuMFHC6tkFsLyzMexS44vte8_4nYVEMWAE_xrE7r/exec';
