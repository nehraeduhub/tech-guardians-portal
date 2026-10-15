import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { NavLinkItem } from '@/lib/site-nav';

const isAppPage = (href: string) => href.startsWith('/') && !href.endsWith('.html') && !href.startsWith('/api/');

/** Router link for app pages; a normal link for static pages and other websites. */
const SmartLink = ({ item, className, onClick, children }: { item: Pick<NavLinkItem, 'href' | 'external'>; className?: string; onClick?: () => void; children: ReactNode }) =>
  isAppPage(item.href) && !item.external
    ? <Link to={item.href} className={className} onClick={onClick}>{children}</Link>
    : <a href={item.href} className={className} onClick={onClick} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;

export default SmartLink;
