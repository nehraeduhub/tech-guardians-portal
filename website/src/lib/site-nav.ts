import { useEffect, useState } from 'react';
import { usePrograms, isCoursesNavVisible, inr, programPrice } from '@/lib/courses-store';
import { portalHref, portalIsExternal, usePortals, useProducts } from '@/lib/catalog';
import { loadOrganizationOfferings, offeringMenuLabel } from '@/lib/organization-offerings-store';
import { loadAboutVisibility } from '@/lib/about-settings';
import { useLayout } from '@/lib/layout';

// One description of the site's menus, shared by the header, the footer and search.

export interface NavLinkItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  external?: boolean;
}
export interface NavMenu { id: string; label: string; items: NavLinkItem[]; footer?: NavLinkItem }

export const sectionLinks = ['Events', 'Awareness'] as const;
export const routeLinks = [{ label: 'About Us', path: '/about' }] as const;
export const toSectionId = (label: string) => label.toLowerCase().replace(/\s/g, '-');

export const useSiteMenus = (): NavMenu[] => {
  const layout = useLayout();
  const programs = usePrograms() || [];
  const products = useProducts();
  const portals = usePortals();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  void tick;
  const on = (path: string) => !layout.hiddenPages.includes(path.split(/[?#]/)[0]);
  const offerings = loadOrganizationOfferings().filter((o) => o.menuVisible);
  const about = loadAboutVisibility();

  const menus: NavMenu[] = [
    {
      id: 'security', label: 'Cybersecurity',
      items: [
        ...offerings.filter((o) => on(o.page)).map((o) => ({
          label: offeringMenuLabel(o), href: o.page, icon: o.type === 'range' ? 'Crosshair' : 'ClipboardCheck',
          description: o.type === 'range' ? 'Hands-on attack and defence labs' : o.type === 'assessment' ? 'VAPT, network and firewall audits' : '',
        })),
        ...(on('/cyber-crime-support') ? [{ label: 'Cyber Crime Support', href: '/cyber-crime-support', icon: 'Siren', description: 'Get help after fraud or hacking' }] : []),
      ],
    },
    {
      id: 'training', label: 'Training',
      items: isCoursesNavVisible() ? programs.map((p) => {
        const price = programPrice(p);
        return { label: p.title, href: p.page, icon: p.icon_name, description: [p.duration, p.showPrice && price.sale ? inr(price.sale) : ''].filter(Boolean).join(' · ') };
      }) : [],
      footer: { label: 'All Training Programs', href: '/training' },
    },
    {
      id: 'products', label: 'Products',
      items: on('/products') ? products.filter((p) => p.visible && p.name).map((p) => ({ label: p.name, href: `/products/${p.id}`, icon: p.icon_name, description: p.tagline })) : [],
      footer: on('/products') ? { label: 'All Products', href: '/products' } : undefined,
    },
    {
      id: 'portals', label: 'Portals',
      items: portals.filter((p) => p.visible && p.name && (portalIsExternal(p) || on(p.fallback))).map((p) => ({
        label: p.name, href: portalHref(p), icon: p.icon_name, description: p.description, external: portalIsExternal(p) && p.newTab,
      })),
    },
    {
      id: 'resources', label: 'Resources',
      items: [
        ...(on('/events') ? [{ label: 'Events & Workshops', href: '/events', icon: 'Users', description: 'Live classes, webinars and bootcamps' }] : []),
        ...(on('/pdf-store') ? [{ label: 'PDF Store', href: '/pdf-store', icon: 'BookOpen', description: 'Handbooks and security guides' }] : []),
        ...(on('/tg-blogs') ? [{ label: 'TG Blogs', href: '/tg-blogs', icon: 'Newspaper', description: 'Articles and guides' }] : []),
        ...(on('/blog') ? [{ label: 'Blog', href: '/blog', icon: 'Search', description: 'Tips and case studies' }] : []),
      ],
    },
    {
      id: 'about', label: 'About',
      items: [
        ...(about.headerVisible && on('/about') ? [{ label: 'About Us', href: '/about', icon: 'ShieldCheck', description: 'Our mission and team' }] : []),
        ...(on('/rj-nehra') ? [{ label: 'Founder — RJ Nehra', href: '/rj-nehra', icon: 'Users', description: 'Meet our founder' }] : []),
        ...(on('/account') ? [{ label: 'My Account', href: '/account.html', icon: 'Lock', description: 'Your courses and PDF books' }] : []),
      ],
    },
  ];
  return menus.filter((m) => m.items.length || m.footer);
};
