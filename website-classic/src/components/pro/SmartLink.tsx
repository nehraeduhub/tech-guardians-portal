import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { safeLink } from '@/lib/utils';

const isAppPage = (href: string) => href.startsWith('/') && !href.startsWith('//') && !href.endsWith('.html') && !href.startsWith('/api/');

/** Router link for app pages; a normal link for static pages and other websites. */
const SmartLink = ({ item, className, style, onClick, children }: { item: { href: string; external?: boolean }; className?: string; style?: CSSProperties; onClick?: () => void; children: ReactNode }) => {
  const href = safeLink(item.href);
  return isAppPage(href) && !item.external
    ? <Link to={href} className={className} style={style} onClick={onClick}>{children}</Link>
    : <a href={href} className={className} style={style} onClick={onClick} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
};

export default SmartLink;
