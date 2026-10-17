import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';
import { waLink } from '@/lib/site-settings';

// Website chat button (Manage → Chat & Telegram Bot): WhatsApp now, and a
// Telegram bot once its username is entered.

export const CHAT_KEY = 'tg_chat';

export interface ChatSettings {
  enabled: boolean;
  whatsapp: boolean;
  /** Bot username without @, e.g. TechGuardiansBot. */
  telegramBot: string;
  telegram: boolean;
  greeting: string;
  /** Pre-filled WhatsApp message. */
  whatsappText: string;
}

export const DEFAULT_CHAT: ChatSettings = {
  enabled: true,
  whatsapp: true,
  telegramBot: '',
  telegram: true,
  greeting: 'Hi! 👋 How can Tech Guardians help you today? Choose how you want to chat.',
  whatsappText: 'Hello Tech Guardians, I need help with',
};

export const cleanBotName = (v: string) => v.trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '');

export const loadChat = (): ChatSettings => ({ ...DEFAULT_CHAT, ...(readSetting<Partial<ChatSettings> | null>(CHAT_KEY, null) || {}) });
export const saveChat = (c: ChatSettings) => publishSetting(CHAT_KEY, { ...c, telegramBot: cleanBotName(c.telegramBot) });

export const telegramLink = (c: ChatSettings) => {
  const bot = cleanBotName(c.telegramBot);
  return bot ? `https://t.me/${bot}` : '';
};
export const whatsappLink = (c: ChatSettings) => waLink(c.whatsappText || undefined);

export const useChat = () => {
  const [chat, setChat] = useState(loadChat);
  useEffect(() => {
    const refresh = () => setChat(loadChat());
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  return chat;
};
