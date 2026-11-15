import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

// The website's AI assistant (api/ai-chat.php). The server picks the AI provider;
// the browser only sends the conversation and shows the reply.

export interface AiMessage { role: 'user' | 'assistant'; content: string }
export interface AiInfo { enabled: boolean; botName: string; welcome: string; showContacts: boolean }

const KEY = 'tg_ai_chat';

/** Whether the assistant is switched on, its name and greeting. */
export const useAiInfo = () => {
  const [info, setInfo] = useState<AiInfo | null>(null);
  useEffect(() => {
    let live = true;
    fetch(apiUrl('ai-chat.php'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (live && d) setInfo(d as AiInfo); })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);
  return info;
};

/** This tab's conversation (kept while the tab is open). */
export const loadHistory = (): AiMessage[] => {
  try {
    const rows = JSON.parse(sessionStorage.getItem(KEY) || '[]');
    return Array.isArray(rows) ? rows.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-30) : [];
  } catch { return []; }
};
export const saveHistory = (rows: AiMessage[]) => {
  try { sessionStorage.setItem(KEY, JSON.stringify(rows.slice(-30))); } catch { /* private mode */ }
};

export async function askAi(history: AiMessage[]): Promise<string> {
  const res = await fetch(apiUrl('ai-chat.php'), {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history.slice(-10) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'The assistant could not answer. Please try again.');
  return String(data.reply || '');
}
