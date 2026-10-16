import { useState } from 'react';
import RecordEditor, { type RecordField } from './RecordEditor';
import { inr, programPrice } from '@/lib/courses-store';
import {
  EVENT_STATUSES, EVENT_TYPES, PORTAL_ICONS, PRODUCT_CATEGORIES, PRODUCT_ICONS, emptyEvent, emptyPortal, emptyProduct,
  loadEventsV2, loadPortals, loadProducts, saveEventsV2, savePortals, saveProducts, type Portal, type Product, type TGEventItem,
} from '@/lib/catalog';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;

/* ---- text <-> list helpers for the admin forms ---- */
const lines = (v: unknown) => (Array.isArray(v) ? v.join('\n') : '');
const toLines = (t: string) => t.split('\n').map((s) => s.trim()).filter(Boolean);
const PriceBadge = ({ price, offer }: { price: string; offer: string }) => {
  const p = programPrice({ price, offer });
  if (!p.sale) return <span className="text-xs text-muted-foreground">no price</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <b>{inr(p.sale)}</b>
      {p.regular > 0 && <s className="text-xs text-muted-foreground">{inr(p.regular)}</s>}
      {p.discount > 0 && <span className="rounded bg-emerald-100 px-1.5 text-[11px] font-bold text-emerald-700">{p.discount}% OFF</span>}
    </span>
  );
};

/* ------------------------------ Products ------------------------------ */

const PRODUCT_FIELDS: RecordField<Product>[] = [
  { key: 'name', label: 'Product name' },
  { key: 'category', label: 'Category', type: 'select', options: PRODUCT_CATEGORIES },
  { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Coming soon', 'Beta', 'On request'] },
  { key: 'icon_name', label: 'Icon', type: 'select', options: PRODUCT_ICONS },
  { key: 'tagline', label: 'One-line summary', wide: true },
  { key: 'description', label: 'Description', type: 'textarea', rows: 4 },
  { key: 'features', label: 'Features — one per line', type: 'lines', format: lines, parse: toLines },
  { key: 'price', label: 'Regular price (₹) — leave empty for “on request”', placeholder: '4999' },
  { key: 'offer', label: 'Offer price (₹)', placeholder: '2499' },
  { key: 'priceNote', label: 'Price note', placeholder: 'Per licence / per year' },
  { key: 'cta', label: 'Main button', type: 'select', options: ['demo', 'enquire', 'link'], hint: 'demo/enquire open WhatsApp with a ready message · link opens the address below' },
  { key: 'ctaLink', label: 'Button link (for “link”)', type: 'url', placeholder: 'https://…' },
  { key: 'image', label: 'Picture', type: 'image' },
  { key: 'trainingIncluded', label: 'Product training included', type: 'checkbox' },
  { key: 'featured', label: 'Feature on the homepage', type: 'checkbox' },
];

export const ProductsAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [rows] = useState(loadProducts);
  return (
    <RecordEditor<Product>
      title="Products"
      description="Your tools and services (VAPT tool, Win Audit & Hardening, development, product training…). Add new tools any time; each gets its own page at /products/<id>."
      itemLabel="product"
      rows={rows}
      fields={PRODUCT_FIELDS}
      visibleKey="visible"
      heading={(r) => `${r.name || 'New product'} · ${r.status}`}
      preview={(r) => <PriceBadge price={r.price} offer={r.offer} />}
      create={emptyProduct}
      onSave={saveProducts}
      onPublish={onPublish}
    />
  );
};

/* ------------------------------ Portals ------------------------------ */

const PORTAL_FIELDS: RecordField<Portal>[] = [
  { key: 'name', label: 'Portal name' },
  { key: 'icon_name', label: 'Icon', type: 'select', options: PORTAL_ICONS },
  { key: 'url', label: 'Portal address on its subdomain', type: 'url', wide: true, placeholder: 'https://news.techguardians.in', hint: 'When set, every menu, footer and homepage link opens this address. Leave empty to use the page on this website.' },
  { key: 'fallback', label: 'Page on this website (used while the address is empty)', placeholder: '/cyber-news' },
  { key: 'newTab', label: 'Open in a new tab', type: 'checkbox' },
  { key: 'description', label: 'Short description', type: 'textarea', rows: 2 },
];

export const PortalsAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [rows] = useState(loadPortals);
  return (
    <RecordEditor<Portal>
      title="Portals"
      description="Link your portals hosted on their own subdomains. Visitors who click a portal link go straight to its address."
      itemLabel="portal"
      rows={rows}
      fields={PORTAL_FIELDS}
      visibleKey="visible"
      heading={(r) => `${r.name || 'New portal'} → ${/^https?:\/\//.test(r.url) ? r.url : r.fallback || '(no link)'}`}
      create={emptyPortal}
      onSave={(next) => {
        const bad = next.find((p) => p.url.trim() && !/^https:\/\//i.test(p.url.trim()));
        if (bad) return Promise.reject(new Error(`The address for “${bad.name}” must start with https://`));
        return savePortals(next.map((p) => ({ ...p, url: p.url.trim() })));
      }}
      onPublish={onPublish}
    />
  );
};

/* ------------------------------ Events ------------------------------ */

const EVENT_FIELDS: RecordField<TGEventItem>[] = [
  { key: 'title', label: 'Event title', wide: true },
  { key: 'type', label: 'Type', type: 'select', options: EVENT_TYPES },
  { key: 'status', label: 'Status', type: 'select', options: EVENT_STATUSES },
  { key: 'date', label: 'Date', type: 'date', hint: 'Past dates move to “Past events” automatically.' },
  { key: 'time', label: 'Time', placeholder: '7:00 PM IST' },
  { key: 'mode', label: 'Mode', type: 'select', options: ['Online', 'Offline', 'Hybrid'] },
  { key: 'venue', label: 'Venue / platform', placeholder: 'Google Meet, or the address' },
  { key: 'speaker', label: 'Speaker' },
  { key: 'price', label: 'Fee', placeholder: 'Free or ₹499' },
  { key: 'seats', label: 'Seats', placeholder: '50' },
  { key: 'registerLink', label: 'Registration link (empty = WhatsApp)', type: 'url', placeholder: 'https://forms.gle/…' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'image', label: 'Banner picture', type: 'image' },
];

export const EventsAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [rows] = useState(loadEventsV2);
  return (
    <RecordEditor<TGEventItem>
      title="Events & Workshops"
      description="Shown on the Events page and the homepage. Upcoming events are sorted by date; the next one is featured with a countdown."
      itemLabel="event"
      rows={rows}
      fields={EVENT_FIELDS}
      visibleKey="visible"
      heading={(r) => `${r.date || 'TBA'} · ${r.title || 'New event'}`}
      create={emptyEvent}
      onSave={saveEventsV2}
      onPublish={onPublish}
    />
  );
};
