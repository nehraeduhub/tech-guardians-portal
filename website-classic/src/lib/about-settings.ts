import { useEffect, useState } from 'react';
import { readSetting, publishSetting } from '@/lib/shared-settings';
export interface AboutVisibilitySettings {
  headerVisible: boolean;
  footerVisible: boolean;
}

const ABOUT_VISIBILITY_KEY = 'tg_about_visibility';

export const DEFAULT_ABOUT_VISIBILITY: AboutVisibilitySettings = {
  headerVisible: true,
  footerVisible: true,
};

export const loadAboutVisibility = (): AboutVisibilitySettings => ({
  ...DEFAULT_ABOUT_VISIBILITY,
  ...readSetting<Partial<AboutVisibilitySettings>>(ABOUT_VISIBILITY_KEY, {}),
});

export const saveAboutVisibility = (settings: AboutVisibilitySettings) => publishSetting(ABOUT_VISIBILITY_KEY, settings);

// About page text (Manage → About Us Page). Empty fields fall back to the defaults.
export const ABOUT_CONTENT_KEY = 'tg_about_content';

export interface AboutStat { value: string; label: string }
export interface AboutContent {
  heroTitle: string;
  heroHighlight: string;
  heroText: string;
  motto: string;
  photo: string;
  photoCaption: string;
  stats: AboutStat[];
  storyTitle: string;
  story: string;
  mission: string;
  vision: string;
  ctaTitle: string;
  ctaText: string;
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroTitle: 'Building a safer digital India through',
  heroHighlight: 'knowledge and action',
  heroText: 'Tech Guardians is a cybersecurity awareness, practical training and digital forensics organisation. We help citizens, students, professionals and institutions understand today’s threats, build real skills and respond with confidence — guided by one simple idea:',
  motto: 'Keep Learning and Keep Sharing.',
  photo: '',
  photoCaption: 'Real labs, real tools and real scenarios in every session.',
  stats: [
    { value: '150+', label: 'Awareness sessions' },
    { value: '5,000+', label: 'Learners trained' },
    { value: '200+', label: 'Learning resources' },
    { value: '24/7', label: 'Support access' },
  ],
  storyTitle: 'Defenders who teach, and teachers who defend',
  story: `Every day, people across India lose money and peace of mind to scams that are easy to stop once you know how they work — fake “digital arrest” calls, UPI and OTP frauds, sextortion, fake loan apps and phishing links. At the same time, organisations struggle to find people with hands-on security skills.

Tech Guardians was started to close both gaps. Our team of cybersecurity practitioners, ethical hackers and forensic professionals brings what it does in real security operations into classrooms, offices and communities — in plain language, with live demonstrations.

Today we run awareness drives, practical training programs, free cyber-safety portals and support for cyber crime victims, and we build security tools and solutions for organisations. Everything we create is designed to be used, not just read.`,
  mission: 'To make cybersecurity knowledge practical and accessible through awareness programs, real labs, affordable training and dependable support for students, families, professionals, institutions and businesses.',
  vision: 'A cyber-resilient India where people can recognise digital risks, secure their online lives and take informed action, supported by a skilled community of ethical defenders.',
  ctaTitle: 'Let’s make your people and systems safer',
  ctaText: 'Book an awareness session, join a training program, get help after a cyber crime, or talk to us about tools and assessments for your organisation.',
};

export const loadAboutContent = (): AboutContent => {
  const saved = readSetting<Partial<AboutContent> | null>(ABOUT_CONTENT_KEY, null) || {};
  const merged = { ...DEFAULT_ABOUT_CONTENT };
  for (const key of Object.keys(DEFAULT_ABOUT_CONTENT) as (keyof AboutContent)[]) {
    const value = saved[key];
    if (key === 'stats') { if (Array.isArray(value) && value.length) merged.stats = value as AboutStat[]; }
    else if (typeof value === 'string' && (value.trim() || key === 'photo')) (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
};

export const saveAboutContent = (content: AboutContent) => publishSetting(ABOUT_CONTENT_KEY, content);

export const useAboutContent = () => {
  const [content, setContent] = useState(loadAboutContent);
  useEffect(() => {
    const refresh = () => setContent(loadAboutContent());
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  return content;
};
