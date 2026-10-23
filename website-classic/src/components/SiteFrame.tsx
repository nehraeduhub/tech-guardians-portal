import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Footer from './Footer';
import Navbar from './Navbar';
import ChatWidget from './ChatWidget';

interface SiteFrameProps {
  children: ReactNode;
  mainClassName?: string;
}

// The header sits in the page flow (only its menu bar sticks), so pages no longer
// need top padding to clear it; older `pt-*` classes from pages are ignored.
const SiteFrame = ({ children, mainClassName }: SiteFrameProps) => (
  <div className="relative min-h-screen">
    <Navbar />
    <main id="main" tabIndex={-1} className={cn('relative z-10 outline-none', mainClassName?.replace(/(^|\s)pt-\S+/g, ''))}>{children}</main>
    <Footer />
    <ChatWidget />
  </div>
);

export default SiteFrame;
