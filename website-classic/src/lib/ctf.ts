import { apiUrl } from '@/lib/api';

// Tech Guardians CTF portal (api/ctf.php). Students sign in on /account.html;
// every room's first task is free and the rest need a CTF plan.

export interface CtfPlan { label: string; days: number; price: number }
export type CtfPlans = Record<'monthly' | 'annual', CtfPlan>;
export interface CtfAccess { active: boolean; plan: string; until: string; pending: boolean }
export interface CtfTaskInfo { id: number; title: string; topic: string; pts: number; lab: boolean; free: boolean; locked: boolean; solved: boolean }
export interface CtfRoom { num: string; slug: string; title: string; subtitle: string; difficulty: string; path: string; blurb: string; tasks: CtfTaskInfo[] }
export interface CtfPath { key: string; title: string; desc: string }
export interface CtfCatalog { viewer: { name: string; admin: boolean }; access: CtfAccess; plans: CtfPlans; paths: CtfPath[]; rooms: CtfRoom[] }

export interface CtfLabStep { cmd?: string; match?: string; out?: string }
export interface CtfLab { intro?: string; env?: string; note?: string; dl?: string; steps2?: string[]; term?: { host?: string; sugg?: string[]; steps: CtfLabStep[] } }
export interface CtfTask {
  id: number; title: string; topic: string; pts: number; teach: string; example: string; diagram: string; anim: string;
  chal: string; hints: string[]; lab: CtfLab | null; solved: boolean; learn: string; free: boolean;
}
export interface CtfTaskPage {
  room: { slug: string; title: string; difficulty: string; path: string; total: number; solved: number; points: number; earned: number };
  task: CtfTask;
  prev: { id: number; locked: boolean } | null;
  next: { id: number; locked: boolean } | null;
  access: CtfAccess;
}

/** An API error that keeps the status: 401 = sign in, 402 = needs a plan. */
export class CtfError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), body === undefined
    ? { credentials: 'same-origin', cache: 'no-store' }
    : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new CtfError(data?.error || `Request failed (${res.status})`, res.status);
  return data as T;
}

export const loadCatalog = () => call<CtfCatalog>('ctf.php?action=catalog');
export const loadTask = (room: string, t: number) => call<CtfTaskPage>(`ctf.php?action=task&room=${encodeURIComponent(room)}&t=${t}`);
export const submitFlag = (room: string, t: number, flag: string) =>
  call<{ ok: boolean; learn?: string; pts?: number }>('ctf.php?action=submit', { room, t, flag });

export const SIGN_IN_URL = '/account.html?next=/ctf';
export const REGISTER_URL = '/account.html?next=/ctf#register';
export const planCheckoutUrl = (plan: 'monthly' | 'annual') => `/courses/payment.html?ctf=${plan}`;
export const roomUrl = (slug: string) => `/ctf/${encodeURIComponent(slug)}`;
export const taskUrl = (slug: string, t: number) => `/ctf/${encodeURIComponent(slug)}?task=${t}`;

export const DIFFICULTY: Record<string, { label: string; cls: string }> = {
  easy: { label: 'Easy', cls: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/30' },
  med: { label: 'Medium', cls: 'bg-amber-500/10 text-amber-700 ring-amber-500/30' },
  hard: { label: 'Hard', cls: 'bg-red-500/10 text-red-700 ring-red-500/30' },
};

export const formatUntil = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? '' : new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ---------- Analyst Toolkit ---------- */

export const rot13 = (s: string) => s.replace(/[a-zA-Z]/g, (c) => {
  const b = c <= 'Z' ? 65 : 97;
  return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
});

export async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** MD5 (for the toolkit only; flags are checked on the server). */
export function md5(input: string) {
  const str = unescape(encodeURIComponent(input));
  const rl = (n: number, c: number) => (n << c) | (n >>> (32 - c));
  const ad = (x: number, y: number) => { const l = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff); };
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => ad(rl(ad(ad(a, q), ad(x, t)), s), b);
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) => cmn(c ^ (b | ~d), a, b, x, s, t);
  const x: number[] = [];
  for (let i = 0; i < str.length * 8; i += 8) x[i >> 5] |= (str.charCodeAt(i / 8) & 0xff) << i % 32;
  const len = str.length * 8;
  x[len >> 5] |= 0x80 << len % 32;
  x[(((len + 64) >>> 9) << 4) + 14] = len;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  const S = [[7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21]];
  const T = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) | 0);
  for (let i = 0; i < x.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d];
    for (let j = 0; j < 64; j++) {
      const r = j >> 4;
      const k = r === 0 ? j : r === 1 ? (5 * j + 1) % 16 : r === 2 ? (3 * j + 5) % 16 : (7 * j) % 16;
      const fn = [ff, gg, hh, ii][r];
      const nv = fn(a, b, c, d, x[i + k] | 0, S[r][j % 4], T[j]);
      [a, b, c, d] = [d, nv, b, c];
    }
    a = ad(a, oa); b = ad(b, ob); c = ad(c, oc); d = ad(d, od);
  }
  return [a, b, c, d].map((n) => Array.from({ length: 4 }, (_, j) => ((n >> (j * 8)) & 0xff).toString(16).padStart(2, '0')).join('')).join('');
}

export type ToolOp = 'b64d' | 'b64e' | 'rot' | 'md5' | 'sha' | 'url';
export async function runTool(op: ToolOp, v: string) {
  if (op === 'b64d') return decodeURIComponent(escape(atob(v.trim())));
  if (op === 'b64e') return btoa(unescape(encodeURIComponent(v)));
  if (op === 'rot') return rot13(v);
  if (op === 'md5') return md5(v);
  if (op === 'sha') return sha256Hex(v);
  return decodeURIComponent(v);
}
