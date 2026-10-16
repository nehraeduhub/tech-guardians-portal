import { apiGet, apiPost } from '@/lib/api';

const cache = new Map<string, unknown>();
let loaded = false;

export const readSetting = <T,>(name: string, fallback: T): T =>
  cache.has(name) ? cache.get(name) as T : fallback;

export async function refreshSettings() {
  const data = await apiGet<{ key: string; value: unknown }[]>('settings.php');
  cache.clear();
  for (const row of data || []) cache.set(row.key, row.value);
  loaded = true;
  window.dispatchEvent(new Event('tg-settings-changed'));
}

export async function initializeSettings() {
  try { await refreshSettings(); } catch (error) { console.error('Site settings unavailable', error); }
  // Polling works with static hosting and across browsers without a persistent server.
  window.setInterval(() => { void refreshSettings().catch(console.error); }, 15000);
  window.addEventListener('focus', () => { void refreshSettings().catch(console.error); });
}

export async function publishSetting(name: string, value: unknown) {
  await apiPost('settings.php', { key: name, value });
  cache.set(name, value);
  window.dispatchEvent(new Event('tg-settings-changed'));
}

export const settingsLoaded = () => loaded;
