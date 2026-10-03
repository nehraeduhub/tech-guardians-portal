// Client for the PHP API in public/api/. Set VITE_API_BASE when the API is
// hosted somewhere other than /api on the same domain.
const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

export const apiUrl = (path: string) => `${API_BASE}/${path}`;

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { credentials: 'same-origin', cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export async function apiPost<T>(path: string, body: unknown = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const adminSignIn = (username: string, password: string) =>
  apiPost<{ admin: boolean }>('auth.php?action=login', { username, password });
export const adminSignOut = () => apiPost('auth.php?action=logout');
export const isAdmin = async () => (await apiGet<{ admin: boolean }>('auth.php?action=me')).admin;
export const changeAdminPassword = (current: string, next: string) =>
  apiPost('auth.php?action=change_password', { current, next });

export const newsUrl = (feed: 'global' | 'india') => apiUrl(`news.php?feed=${feed}`);
