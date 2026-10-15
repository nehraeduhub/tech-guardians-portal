import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Footer from './Footer';
import Navbar from './Navbar';

interface SiteFrameProps {
  children: ReactNode;
  mainClassName?: string;
}

const SiteFrame = ({ children, mainClassName }: SiteFrameProps) => (
  <div className="relative min-h-screen bg-background">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
    <Navbar />
    <main id="main" className={cn('relative pt-[72px]', mainClassName)}>{children}</main>
    <Footer />
  </div>
);

export default SiteFrame;
