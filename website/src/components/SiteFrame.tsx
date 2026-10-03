import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Footer from './Footer';
import Navbar from './Navbar';

interface SiteFrameProps {
  children: ReactNode;
  mainClassName?: string;
}

const SiteFrame = ({ children, mainClassName }: SiteFrameProps) => (
  <div className="relative min-h-screen">
    <Navbar />
    <main className={cn('relative z-10 pt-24', mainClassName)}>{children}</main>
    <Footer />
  </div>
);

export default SiteFrame;
