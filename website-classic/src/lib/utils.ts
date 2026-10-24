import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Links from site content may be page links or web, mail, phone, WhatsApp or UPI links — never javascript:, data: or other schemes. */
export const safeLink = (href: string, fallback = '#') => {
  // Backslashes become slashes so "/\\evil.com" cannot pose as a page link (open redirect).
  const h = String(href || '').trim().replace(/[\u0000-\u001F\u007F]/g, '').replace(/\\/g, '/');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(h);
  return !scheme || /^(https?|mailto|tel|whatsapp|upi)$/i.test(scheme[1]) ? h || fallback : fallback;
};
