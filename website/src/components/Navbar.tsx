import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle, ChevronDown } from 'lucide-react';
import tgLogo from '@/assets/tg-logo.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { sectionLinks, toSectionId } from '@/lib/site-nav';
import { isCoursesNavVisible } from '@/lib/courses-store';
import { waLink } from '@/lib/site-settings';
import { loadOrganizationOfferings, offeringMenuLabel, type OrganizationOffering } from '@/lib/organization-offerings-store';
import { loadAboutVisibility } from '@/lib/about-settings';
import { useHomeContent } from '@/lib/home-content';
import { useLayout } from '@/lib/layout';

const BLOGS_PATH = '/tg-blogs';
const LOGIN_PATH = '/login';

const fixedPortals: { label: string; path: string; external?: boolean }[] = [
  { label: 'Cyber News Portal', path: '/cyber-news' },
  { label: 'Threat Intel Hub', path: '/threat-intel' },
  { label: 'Cyber & Forensic Hub', path: '/forensic-engine.html' },
  { label: 'Cyber Safety Portal', path: '/cyber-portal' },
];

const allCourses: { label: string; path: string }[] = [
  { label: 'Web Server & Hosting', path: '/courses/web-server-hosting.html' },
  { label: 'Learn Sophos Firewall', path: '/courses/sophos-firewall.html' },
  { label: 'Learn Active Directory', path: '/courses/active-directory.html' },
  { label: 'Build Your First AI Agent', path: '/courses/ai-agent.html' },
  { label: 'Ethical Hacking: Password Cracking', path: '/courses/password-cracking.html' },
  { label: 'Social Media & Android Hacking', path: '/courses/social-android-hacking.html' },
  { label: 'Cyber Awareness Booking', path: '/courses/awareness-booking.html' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | 'portals' | 'courses'>(null);
  const [showCourses, setShowCourses] = useState(true);
  const [organizationPortals, setOrganizationPortals] = useState<OrganizationOffering[]>([]);
  const [showAbout, setShowAbout] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const home = useHomeContent();
  const layout = useLayout();
  const pageOn = (path: string) => !layout.hiddenPages.includes(path.split(/[?#]/)[0]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const refreshSettings = () => {
      setShowCourses(isCoursesNavVisible());
      setOrganizationPortals(loadOrganizationOfferings().filter((item) => item.menuVisible));
      setShowAbout(loadAboutVisibility().headerVisible);
    };
    refreshSettings();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('tg-settings-changed', refreshSettings);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('tg-settings-changed', refreshSettings);
    };
  }, []);

  const tgPortals: { label: string; path: string; external?: boolean }[] = [
    ...organizationPortals.map((item) => ({ label: offeringMenuLabel(item), path: item.page })),
    ...fixedPortals,
  ].filter((p) => pageOn(p.path));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const goToSection = (label: string) => {
    const id = toSectionId(label);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(id === 'home' ? '/' : `/#${id}`);
    }
    setMobileOpen(false);
    setOpenMenu(null);
  };


  const openLink = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else if (path.endsWith('.html')) {
      window.location.href = path;
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setOpenMenu(null);
    setMobileOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Top strip */}
      <div className="hidden md:block" style={{ background: 'hsl(var(--topbar))', color: 'hsl(var(--topbar-foreground))' }}>
        <div className="container mx-auto flex items-center justify-between h-9 px-4 text-xs">
          <span className="opacity-80">{home.topBar}</span>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-90 hover:opacity-100 transition">
            <MessageCircle className="w-3.5 h-3.5" /> Support Center
          </a>
        </div>
      </div>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-background/60 backdrop-blur-md border-b border-transparent'}`}
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <button onClick={() => goToSection('Home')} className="flex items-center gap-2 group">
            <img src={tgLogo} alt="Tech Guardians logo" className="w-9 h-9 rounded-md object-contain" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Tech<span className="text-primary"> Guardians</span>
            </span>
          </button>

          <div ref={menuRef} className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => goToSection('Home')}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </button>

            {/* Courses dropdown */}
            <div className="relative" style={{ display: showCourses ? undefined : 'none' }}>
              <button
                onClick={() => setOpenMenu(openMenu === 'courses' ? null : 'courses')}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Courses <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'courses' && (
                <div className="absolute right-0 mt-1 w-72 bg-popover border border-border rounded-xl shadow-lg py-2 z-50">
                  {allCourses.map((c) => (
                    <button
                      key={c.path}
                      onClick={() => openLink(c.path)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TG Portals dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'portals' ? null : 'portals')}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                TG Portals <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === 'portals' && (
                <div className="absolute right-0 mt-1 w-60 bg-popover border border-border rounded-xl shadow-lg py-2 z-50">
                  {tgPortals.map((p) => (
                    <button
                      key={p.path}
                      onClick={() => openLink(p.path, p.external)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {sectionLinks.map((link) => (
              <button
                key={link}
                onClick={() => goToSection(link)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </button>
            ))}

            {pageOn('/pdf-store') && (
              <button onClick={() => openLink('/pdf-store')} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                PDF Store
              </button>
            )}
            {showAbout && pageOn('/about') && (
              <button onClick={() => openLink('/about')} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </button>
            )}

          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => { navigate(LOGIN_PATH); window.scrollTo({ top: 0 }); }} className="text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-2">Login</button>
            {pageOn(BLOGS_PATH) && <button onClick={() => openLink(BLOGS_PATH)} className="rounded-full border-2 border-primary text-primary px-5 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
              TG Blogs
            </button>}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground p-2" aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background border-b border-border overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-1">
                {sectionLinks.map((link) => (
                  <button key={link} onClick={() => goToSection(link)} className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg text-left">
                    {link}
                  </button>
                ))}

                {pageOn('/pdf-store') && (
                  <button onClick={() => { openLink('/pdf-store'); setMobileOpen(false); }} className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg text-left">
                    PDF Store
                  </button>
                )}
                {showAbout && pageOn('/about') && (
                  <button onClick={() => openLink('/about')} className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg text-left">
                    About Us
                  </button>
                )}

                {showCourses && (
                  <>
                    <div className="mt-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Courses</div>
                    {allCourses.map((c) => (
                      <button key={c.path} onClick={() => openLink(c.path)} className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg text-left">
                        {c.label}
                      </button>
                    ))}
                  </>
                )}

                <div className="mt-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">TG Portals</div>
                {tgPortals.map((p) => (
                  <button key={p.path} onClick={() => openLink(p.path, p.external)} className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg text-left">
                    {p.label}
                  </button>
                ))}


                <button onClick={() => { navigate(LOGIN_PATH); setMobileOpen(false); }} className="mt-2 rounded-full border border-border text-foreground text-center px-5 py-3 text-sm font-semibold">
                  Login
                </button>
                {pageOn(BLOGS_PATH) && <button onClick={() => openLink(BLOGS_PATH)} className="rounded-full bg-primary text-primary-foreground text-center px-5 py-3 text-sm font-semibold">
                  TG Blogs
                </button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
