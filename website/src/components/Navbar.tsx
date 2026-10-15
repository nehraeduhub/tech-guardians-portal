import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ExternalLink, Menu, Search, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import tgLogo from '@/assets/tg-logo.png';
import { useSiteMenus } from '@/lib/site-nav';
import { useLayout } from '@/lib/layout';
import { iconFor } from '@/components/pro/icons';
import SiteSearch from '@/components/pro/SiteSearch';
import SmartLink from '@/components/pro/SmartLink';

const Navbar = () => {
  const menus = useSiteMenus();
  const layout = useLayout();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const accountOn = !layout.hiddenPages.includes('/account');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(null); setMobile(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (bar.current && !bar.current.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobile]);

  const goContact = () => {
    setMobile(false);
    if (location.pathname === '/') document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    else navigate('/#contact');
  };
  const active = (href: string) => href !== '/' && location.pathname.startsWith(href);
  const menuActive = (id: string) => menus.find((m) => m.id === id)?.items.some((i) => active(i.href)) || (id === 'training' && active('/training')) || (id === 'products' && active('/products'));

  const linkCls = (on: boolean) => `relative inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[14.5px] font-medium transition-colors ${on ? 'text-white' : 'text-slate-300 hover:text-white'}`;

  return (
    <header className="tg-dark fixed inset-x-0 top-0 z-50">
      <div ref={bar} className={`border-b transition-[background,box-shadow] duration-300 ${scrolled ? 'border-white/10 bg-[#061330]/95 shadow-[0_10px_30px_-18px_rgba(0,0,0,.8)] backdrop-blur-xl' : 'border-white/5 bg-[#061330]'}`}>
        <nav className="tg-container flex h-[72px] items-center justify-between gap-4" aria-label="Main">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Tech Guardians home">
            <img src={tgLogo} alt="" className="h-11 w-11 object-contain" />
            <span className="leading-tight">
              <span className="block font-display text-[19px] font-extrabold tracking-tight text-white">Tech <span className="text-[#3b8bff]">Guardians</span></span>
              <span className="block text-[11px] font-medium tracking-wide text-slate-400">Keep Learning Keep Sharing</span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            <Link to="/" className={linkCls(location.pathname === '/')}>
              Home{location.pathname === '/' && <span className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded bg-[#3b8bff]" />}
            </Link>
            {menus.map((m) => (
              <div key={m.id} className="relative">
                <button
                  type="button"
                  className={linkCls(open === m.id || !!menuActive(m.id))}
                  aria-expanded={open === m.id}
                  aria-haspopup="true"
                  onClick={() => setOpen(open === m.id ? null : m.id)}
                  onMouseEnter={() => open && setOpen(m.id)}
                >
                  {m.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === m.id ? 'rotate-180' : ''}`} />
                  {menuActive(m.id) && <span className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded bg-[#3b8bff]" />}
                </button>
                <AnimatePresence>
                  {open === m.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.16 }}
                      className={`absolute left-1/2 top-[calc(100%+14px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0a1a3d] p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] ${m.items.length > 5 ? 'w-[620px]' : 'w-[340px]'}`}
                    >
                      <div className={`grid gap-1 ${m.items.length > 5 ? 'grid-cols-2' : ''}`}>
                        {m.items.map((item) => {
                          const Icon = iconFor(item.icon);
                          return (
                            <SmartLink key={item.href + item.label} item={item} className="group flex items-start gap-3 rounded-xl p-3 hover:bg-white/5" onClick={() => setOpen(null)}>
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1d4ed8]/25 text-[#60a5fa] group-hover:bg-[#2563eb] group-hover:text-white"><Icon className="h-[18px] w-[18px]" /></span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-1 text-sm font-semibold text-white">{item.label}{item.external && <ExternalLink className="h-3 w-3 text-slate-400" />}</span>
                                {item.description && <span className="mt-0.5 block text-xs leading-snug text-slate-400">{item.description}</span>}
                              </span>
                            </SmartLink>
                          );
                        })}
                      </div>
                      {m.footer && (
                        <SmartLink item={m.footer} className="mt-1 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-[#60a5fa] hover:bg-white/10" onClick={() => setOpen(null)}>
                          {m.footer.label}<ArrowRight className="h-4 w-4" />
                        </SmartLink>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <button type="button" onClick={goContact} className={linkCls(false)}>Contact</button>
          </div>

          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setSearching(true)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/5 hover:text-white" aria-label="Search the website">
              <Search className="h-5 w-5" />
            </button>
            {accountOn && <a href="/account.html" className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white md:inline-flex xl:hidden 2xl:inline-flex">My Account</a>}
            <Link to="/training" className="tg-btn-primary hidden whitespace-nowrap !py-2.5 sm:inline-flex">Explore Training <ArrowRight className="h-4 w-4" /></Link>
            <button type="button" onClick={() => setMobile(true)} className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/5 xl:hidden" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div className="fixed inset-0 z-50 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setMobile(false)} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
              className="absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col overflow-y-auto bg-[#071633] p-4"
              aria-label="Menu"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-white">Menu</span>
                <button onClick={() => setMobile(false)} className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/5" aria-label="Close menu"><X className="h-6 w-6" /></button>
              </div>
              <Link to="/" className="rounded-xl px-3 py-3 font-semibold text-white hover:bg-white/5">Home</Link>
              {menus.map((m) => (
                <div key={m.id} className="border-t border-white/5">
                  <button onClick={() => setMobileSection(mobileSection === m.id ? null : m.id)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 font-semibold text-white hover:bg-white/5" aria-expanded={mobileSection === m.id}>
                    {m.label}<ChevronDown className={`h-4 w-4 transition-transform ${mobileSection === m.id ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileSection === m.id && (
                    <div className="pb-2 pl-2">
                      {[...m.items, ...(m.footer ? [m.footer] : [])].map((item) => (
                        <SmartLink key={item.href + item.label} item={item} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => setMobile(false)}>
                          {item.label}{item.external && <ExternalLink className="h-3 w-3" />}
                        </SmartLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button onClick={goContact} className="border-t border-white/5 px-3 py-3 text-left font-semibold text-white hover:bg-white/5">Contact</button>
              <div className="mt-auto grid gap-2 pt-6">
                {accountOn && <a href="/account.html" className="tg-btn-outline">My Account</a>}
                <Link to="/training" className="tg-btn-primary" onClick={() => setMobile(false)}>Explore Training <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteSearch open={searching} onClose={() => setSearching(false)} />
    </header>
  );
};

export default Navbar;
