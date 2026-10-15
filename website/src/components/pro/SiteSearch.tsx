import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useSiteMenus, type NavLinkItem } from '@/lib/site-nav';
import { useEvents } from '@/lib/catalog';
import SmartLink from './SmartLink';
import { iconFor } from './icons';

const PAGES: NavLinkItem[] = [
  { label: 'Training Programs', href: '/training', icon: 'GraduationCap', description: 'All courses and awareness sessions' },
  { label: 'Products', href: '/products', icon: 'Package', description: 'Security tools and services' },
  { label: 'Events & Workshops', href: '/events', icon: 'Users', description: 'Upcoming live events' },
  { label: 'Contact', href: '/#contact', icon: 'Search', description: 'WhatsApp, email and enquiry form' },
];

/** Search box over every menu item, page and event. */
const SiteSearch = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const menus = useSiteMenus();
  const events = useEvents();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    const t = window.setTimeout(() => input.current?.focus(), 30);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', esc); };
  }, [open, onClose]);

  const all = useMemo(() => {
    const seen = new Set<string>();
    const rows: (NavLinkItem & { group: string })[] = [];
    const add = (group: string, item: NavLinkItem) => { if (!seen.has(item.href + item.label)) { seen.add(item.href + item.label); rows.push({ ...item, group }); } };
    PAGES.forEach((p) => add('Pages', p));
    menus.forEach((m) => m.items.forEach((i) => add(m.label, i)));
    events.filter((e) => e.visible && e.title).forEach((e) => add('Events', { label: e.title, href: '/events', icon: 'Users', description: [e.type, e.date].filter(Boolean).join(' · ') }));
    return rows;
  }, [menus, events]);

  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length ? all.filter((r) => words.every((w) => `${r.label} ${r.description || ''} ${r.group}`.toLowerCase().includes(w))).slice(0, 12) : all.slice(0, 8);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[#020817]/70 p-4 pt-[10vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search training, products, portals, events…" className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Close search"><X className="h-5 w-5" /></button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Nothing found for “{q}”.</li>}
          {results.map((r) => {
            const Icon = iconFor(r.icon);
            return (
              <li key={r.group + r.href + r.label}>
                <SmartLink item={r} onClick={onClose} className="group flex items-center gap-3 rounded-xl p-3 hover:bg-muted">
                  <span className="tg-icon-tile !h-10 !w-10"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.group}{r.description ? ` · ${r.description}` : ''}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
};

export default SiteSearch;
