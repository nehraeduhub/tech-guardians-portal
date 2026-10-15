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
  heroPoints: string;
  heroPrimaryText: string;
  heroPrimaryLink: string;
  heroSecondaryText: string;
  heroSecondaryLink: string;
  ctaTitle: string;
  ctaText: string;
  footerAbout: string;
}

export const HOME_CONTENT_KEY = 'tg_home_content';

export const DEFAULT_HOME_CONTENT: HomeContent = {
  topBar: 'Keep Learning and Keep Sharing · Cybersecurity, Awareness & Forensics',
  heroBadge: 'Cybersecurity • Technology • Learning',
  heroTitle: 'Build Skills.',
  heroTitleAccent: 'Strengthen Security.',
  heroText:
    'Practical cybersecurity training, security tools and awareness programmes for a safer connected world — for students, professionals and organisations.',
  heroImage: '/images/tech-guardians-home-team.png',
  heroPoints: 'Expert Guidance | Hands-on Learning | Real-world Skills | For Students, Professionals & Organisations',
  heroPrimaryText: 'Explore Training',
  heroPrimaryLink: '/training',
  heroSecondaryText: 'Explore Products',
  heroSecondaryLink: '/products',
  ctaTitle: 'Ready to strengthen your security?',
  ctaText: 'Talk to Tech Guardians about training for your team, a security assessment or one of our tools.',
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
