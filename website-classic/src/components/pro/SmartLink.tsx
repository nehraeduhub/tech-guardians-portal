import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

const isAppPage = (href: string) => href.startsWith('/') && !href.endsWith('.html') && !href.startsWith('/api/');

/** Router link for app pages; a normal link for static pages and other websites. */
const SmartLink = ({ item, className, style, onClick, children }: { item: { href: string; external?: boolean }; className?: string; style?: CSSProperties; onClick?: () => void; children: ReactNode }) =>
  isAppPage(item.href) && !item.external
    ? <Link to={item.href} className={className} style={style} onClick={onClick}>{children}</Link>
    : <a href={item.href} className={className} style={style} onClick={onClick} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;

export default SmartLink;
