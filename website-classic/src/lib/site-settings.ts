import { readSetting, publishSetting } from '@/lib/shared-settings';
// Central contact settings. The WhatsApp number can be changed from the
// admin manager (/manage → Contact tab) and applies across every page.
export const WA_KEY = 'tg_wa_number';
export const DEFAULT_WA_NUMBER = '919929193136';

export const getWhatsAppNumber = (): string => {
  const value = readSetting(WA_KEY, DEFAULT_WA_NUMBER);
  return /^\d{10,15}$/.test(value) ? value : DEFAULT_WA_NUMBER;
};
export const setWhatsAppNumber = (num: string) => publishSetting(WA_KEY, num.replace(/\D/g, ''));

export const waLink = (text?: string) =>
  `https://wa.me/${getWhatsAppNumber()}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

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
