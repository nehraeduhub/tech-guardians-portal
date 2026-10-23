import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle, ChevronDown, PhoneCall } from 'lucide-react';
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
const ACCOUNT_PATH = '/account';

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

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  const menuLink = (label: string, onClick: () => void, active = false) => (
    <button key={label} onClick={onClick} className={`tg-menu-link ${active ? 'active' : ''}`}>{label}</button>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to main content</a>

      {/* Utility strip */}
      <div className="hidden md:block" style={{ background: 'hsl(var(--topbar))', color: 'hsl(var(--topbar-foreground))' }}>
        <div className="container mx-auto flex h-9 items-center justify-between gap-4 px-4 text-xs">
          <span className="truncate opacity-85">{home.topBar}</span>
          <div className="flex shrink-0 items-center gap-4">
            <a href="#main" className="opacity-85 hover:opacity-100">Skip to main content</a>
            <span className="h-3.5 w-px bg-current opacity-30" aria-hidden />
            <TextSizeControls />
            <span className="h-3.5 w-px bg-current opacity-30" aria-hidden />
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 opacity-90 transition hover:opacity-100">
              <MessageCircle className="h-3.5 w-3.5" /> Support Center
            </a>
          </div>
        </div>
      </div>
      <div className="tg-tricolour" aria-hidden />

      {/* Brand row (stays at the top on phones) */}
      <header className={`sticky top-0 z-50 border-b border-border bg-card lg:static ${scrolled ? 'shadow-md lg:shadow-none' : ''}`}>
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:h-[84px]">
          <button onClick={() => goToSection('Home')} className="flex min-w-0 items-center gap-3 text-left">
            <img src={tgLogo} alt="Tech Guardians logo" className="h-10 w-10 shrink-0 rounded-md object-contain md:h-14 md:w-14" />
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold leading-tight tracking-tight text-primary md:text-2xl">Tech Guardians</span>
              <span className="hidden truncate text-xs font-medium text-muted-foreground sm:block md:text-[13px]">Cyber Security · Awareness · Digital Forensics</span>
            </span>
          </button>

          <div className="hidden items-center gap-3 lg:flex">
            <a href="tel:1930" className="flex items-center gap-2.5 rounded-md border border-border bg-background px-3 py-1.5 transition-colors hover:border-accent">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff9933]/15 text-accent"><PhoneCall className="h-4 w-4" /></span>
              <span className="leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cyber fraud helpline</span>
                <span className="block text-lg font-extrabold text-accent">1930</span>
              </span>
            </a>
            {pageOn(ACCOUNT_PATH)
              ? <a href="/account.html" className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary">My Account</a>
              : <button onClick={() => { navigate(LOGIN_PATH); window.scrollTo({ top: 0 }); }} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary">Login</button>}
            {pageOn(BLOGS_PATH) && <button onClick={() => openLink(BLOGS_PATH)} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110">
              TG Blogs
            </button>}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground lg:hidden" aria-label="Toggle menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden"
            >
              <div className="flex flex-col gap-1 p-4">
                <button onClick={() => goToSection('Home')} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted">Home</button>
                {sectionLinks.map((link) => (
                  <button key={link} onClick={() => goToSection(link)} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted">
                    {link}
                  </button>
                ))}

                {pageOn('/products') && (
                  <button onClick={() => openLink('/products')} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted">
                    Products &amp; Solutions
                  </button>
                )}
                {pageOn('/pdf-store') && (
                  <button onClick={() => openLink('/pdf-store')} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted">
                    PDF Store
                  </button>
                )}
                {showAbout && pageOn('/about') && (
                  <button onClick={() => openLink('/about')} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted">
                    About Us
                  </button>
                )}

                {showCourses && (
                  <>
                    <div className="mt-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Training Programs</div>
                    {allCourses.map((c) => (
                      <button key={c.path} onClick={() => openLink(c.path)} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted">
                        {c.label}
                      </button>
                    ))}
                  </>
                )}

                <div className="mt-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">TG Portals</div>
                {tgPortals.map((p) => (
                  <button key={p.path} onClick={() => openLink(p.path, p.external)} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted">
                    {p.label}
                  </button>
                ))}

                <a href="tel:1930" className="mt-2 flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-semibold text-accent"><PhoneCall className="h-4 w-4" /> Cyber fraud helpline 1930</a>
                {pageOn(ACCOUNT_PATH)
                  ? <a href="/account.html" className="rounded-md border border-border px-5 py-3 text-center text-sm font-semibold text-foreground">My Account</a>
                  : <button onClick={() => { navigate(LOGIN_PATH); setMobileOpen(false); }} className="rounded-md border border-border px-5 py-3 text-center text-sm font-semibold text-foreground">
                  Login
                </button>}
                {pageOn(BLOGS_PATH) && <button onClick={() => openLink(BLOGS_PATH)} className="rounded-md bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground">
                  TG Blogs
                </button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Navy menu bar (sticks to the top on larger screens) */}
      <nav className="tg-menubar sticky top-0 z-50 hidden lg:block" aria-label="Main menu">
        <div ref={menuRef} className="container mx-auto flex items-center px-4">
          {menuLink('Home', () => goToSection('Home'), isActive('/'))}

          <div className="relative" style={{ display: showCourses ? undefined : 'none' }}>
            <button onClick={() => setOpenMenu(openMenu === 'courses' ? null : 'courses')} aria-expanded={openMenu === 'courses'} className={`tg-menu-link ${isActive('/training') ? 'active' : ''}`}>
              Training Programs <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {openMenu === 'courses' && (
              <div className="absolute left-0 top-full z-50 w-72 overflow-hidden rounded-b-md border border-border bg-popover py-1 shadow-xl">
                {allCourses.map((c) => (
                  <button key={c.path} onClick={() => openLink(c.path)} className="w-full border-l-[3px] border-transparent px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-[#ff9933] hover:bg-muted">
                    {c.label}
                  </button>
                ))}
                <button onClick={() => openLink('/training')} className="w-full border-t border-border px-4 py-2.5 text-left text-sm font-semibold text-primary hover:bg-muted">All Training Programs →</button>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setOpenMenu(openMenu === 'portals' ? null : 'portals')} aria-expanded={openMenu === 'portals'} className="tg-menu-link">
              TG Portals <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {openMenu === 'portals' && (
              <div className="absolute left-0 top-full z-50 w-64 overflow-hidden rounded-b-md border border-border bg-popover py-1 shadow-xl">
                {tgPortals.map((p) => (
                  <button key={p.path} onClick={() => openLink(p.path, p.external)} className="w-full border-l-[3px] border-transparent px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-[#ff9933] hover:bg-muted">
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {sectionLinks.map((link) => menuLink(link, () => goToSection(link)))}
          {pageOn('/products') && menuLink('Products', () => openLink('/products'), isActive('/products'))}
          {pageOn('/pdf-store') && menuLink('PDF Store', () => openLink('/pdf-store'), isActive('/pdf-store'))}
          {pageOn('/cyber-news') && menuLink('Cyber News', () => openLink('/cyber-news'), isActive('/cyber-news'))}
          {showAbout && pageOn('/about') && menuLink('About Us', () => openLink('/about'), isActive('/about'))}
        </div>
      </nav>
    </>
  );
};

const SCALES = [0.875, 1, 1.125];
const SCALE_KEY = 'tg_text_size';
const applyScale = (i: number) => { document.documentElement.style.fontSize = `${SCALES[i] * 100}%`; };

/** A- A A+ buttons, as on government portals. Remembered on this device. */
const TextSizeControls = () => {
  const [size, setSize] = useState(() => {
    try { const v = localStorage.getItem(SCALE_KEY); return v !== null && SCALES[Number(v)] ? Number(v) : 1; } catch { return 1; }
  });
  useEffect(() => {
    applyScale(size);
    try { localStorage.setItem(SCALE_KEY, String(size)); } catch { /* private mode */ }
  }, [size]);
  return (
    <span className="flex items-center gap-1" role="group" aria-label="Text size">
      {['A-', 'A', 'A+'].map((label, i) => (
        <button key={label} onClick={() => setSize(i)} aria-pressed={size === i} aria-label={['Smaller text', 'Normal text', 'Larger text'][i]}
          className={`grid h-6 min-w-6 place-items-center rounded px-1 font-semibold transition ${size === i ? 'bg-white/20 text-white' : 'opacity-80 hover:opacity-100'}`}>
          {label}
        </button>
      ))}
    </span>
  );
};

export default Navbar;
