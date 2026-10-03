import { readSetting, publishSetting } from '@/lib/shared-settings';
import { apiGet } from '@/lib/api';
export interface TGEvent {
  id: string;
  title: string;
  when: string;
  tag: string;
  color: 'cyber-green' | 'cyber-blue' | 'cyber-purple' | 'cyber-orange';
}

export interface PaymentRecord {
  name?: string;
  date?: string;
  course?: string;
  amount?: string;
  utr?: string;
  email?: string;
  phone?: string;
  /** Data-URL of the payment screenshot uploaded on the payment page. */
  shot?: string;
}

export const EVENTS_KEY = 'tg_events';
export const PAYMENTS_KEY = 'tg_payment_history';

export const DEFAULT_EVENTS: TGEvent[] = [
  { id: 'e1', title: 'Live Google Meet Class — Ethical Hacking Essentials', when: 'Every Sat • 7:00 PM IST', tag: 'Live', color: 'cyber-green' },
  { id: 'e2', title: 'Upcoming Capsule Course — AI Agents in 3 Days', when: 'Next batch • This month', tag: 'Capsule', color: 'cyber-blue' },
  { id: 'e3', title: 'Weekend Workshop — Social Media Hacking Demo', when: 'Sun • 11:00 AM IST', tag: 'Workshop', color: 'cyber-purple' },
  { id: 'e4', title: 'Capsule Course — Web Hosting Bootcamp', when: 'Rolling enrolment', tag: 'Bootcamp', color: 'cyber-orange' },
];

export const loadEvents = (): TGEvent[] => readSetting(EVENTS_KEY, DEFAULT_EVENTS);
export const saveEvents = (events: TGEvent[]) => publishSetting(EVENTS_KEY, events);

export const loadPayments = (): PaymentRecord[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const savePayments = (rows: PaymentRecord[]) => {
  try {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(rows.slice(0, 1000)));
  } catch {
    // ignore storage errors
  }
};

const pick = (row: Record<string, unknown>, keys: string[]) => {
  for (const k of Object.keys(row)) {
    const norm = k.toLowerCase().replace(/[^a-z]/g, '');
    if (keys.some((c) => norm.includes(c))) {
      const v = row[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
    }
  }
  return '';
};

export const normalizeSheetRows = (rows: Record<string, unknown>[]): PaymentRecord[] =>
  rows
    .map((r) => ({
      name: pick(r, ['name', 'student', 'fullname']),
      date: pick(r, ['date', 'timestamp', 'time']),
      course: pick(r, ['course', 'program', 'session']),
      amount: pick(r, ['amount', 'paid', 'fee', 'price']),
      utr: pick(r, ['utr', 'transaction', 'txn', 'reference']),
      email: pick(r, ['email', 'mail']),
      phone: pick(r, ['phone', 'mobile', 'contact', 'whatsapp']),
    }))
    .filter((r) => r.name || r.utr || r.amount);

const recordKey = (r: PaymentRecord) =>
  (r.utr && r.utr.trim()) ||
  `${(r.name || '').trim().toLowerCase()}|${(r.date || '').trim()}|${(r.amount || '').trim()}`;

/** Merge Excel/CSV rows with the entries auto-saved by the payment page so
 *  the manager and the payment login history always show the same records. */
export const mergePayments = (...groups: PaymentRecord[][]): PaymentRecord[] => {
  const map = new Map<string, PaymentRecord>();
  for (const group of groups) {
    for (const row of group) {
      const key = recordKey(row);
      if (!key.replace(/\|/g, '').trim()) continue;
      map.set(key, { ...(map.get(key) || {}), ...row });
    }
  }
  return Array.from(map.values());
};

/** Reads whatever the payment page stored on this device and syncs it back. */
export const syncPayments = (extra: PaymentRecord[] = []): PaymentRecord[] => {
  const merged = mergePayments(loadPayments(), extra);
  savePayments(merged);
  return merged;
};

/** Enrollments submitted on the payment page, stored on the server (admin only). */
export const loadServerPayments = () => apiGet<PaymentRecord[]>('payments.php');


/** Pulls every payment row stored in the Google Sheet (Apps Script web app)
 *  and merges it with the records saved locally by the payment page. */
export const fetchSheetPayments = async (url: string): Promise<PaymentRecord[]> => {
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}action=list`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Sheet responded with ${res.status}`);
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Sheet did not return JSON — enable the doGet(list) endpoint in Apps Script.');
  }
  const rows = Array.isArray(data)
    ? data
    : Array.isArray((data as { rows?: unknown[] }).rows)
    ? (data as { rows: unknown[] }).rows
    : Array.isArray((data as { data?: unknown[] }).data)
    ? (data as { data: unknown[] }).data
    : [];
  return normalizeSheetRows(rows as Record<string, unknown>[]);
};
