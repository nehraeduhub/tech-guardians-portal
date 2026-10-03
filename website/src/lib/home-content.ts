import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Homepage text and photo, editable in Manage → Homepage.
export interface HomeContent {
  topBar: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroText: string;
  heroImage: string;
  footerAbout: string;
}

export const HOME_CONTENT_KEY = 'tg_home_content';

export const DEFAULT_HOME_CONTENT: HomeContent = {
  topBar: 'Keep Learning and Keep Sharing · Cybersecurity, Awareness & Forensics',
  heroBadge: 'Keep Learning and Keep Sharing',
  heroTitle: 'Secure Your Digital Life',
  heroTitleAccent: 'with Tech Guardians',
  heroText:
    'Tech Guardians is an all-in-one cybersecurity, awareness, and forensics platform that keeps scams, fraud, and modern digital threats at bay — for people, families, and businesses.',
  heroImage: '/images/tech-guardians-home-team.png',
  footerAbout:
    'An all-in-one cybersecurity, awareness, and digital forensics platform — built to protect people, families, and businesses at the source. Keep Learning and Keep Sharing.',
};

export const loadHomeContent = (): HomeContent => {
  const saved = readSetting<Partial<HomeContent>>(HOME_CONTENT_KEY, {});
  const merged = { ...DEFAULT_HOME_CONTENT };
  for (const key of Object.keys(merged) as (keyof HomeContent)[]) {
    const value = saved?.[key];
    if (typeof value === 'string' && value.trim()) merged[key] = value;
  }
  return merged;
};

export const saveHomeContent = (content: HomeContent) => publishSetting(HOME_CONTENT_KEY, content);

/** Current homepage content, updated live when the admin publishes. */
export const useHomeContent = () => {
  const [content, setContent] = useState(loadHomeContent);
  useEffect(() => {
    const refresh = () => setContent(loadHomeContent());
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  return content;
};
