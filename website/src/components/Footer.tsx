import { useLocation, useNavigate } from 'react-router-dom';
import { toSectionId } from '@/lib/site-nav';
import tgLogo from '@/assets/tg-logo.png';
import { waLink } from '@/lib/site-settings';
import { useEffect, useState } from 'react';
import { loadOrganizationOfferings, type OrganizationOffering } from '@/lib/organization-offerings-store';
import { loadAboutVisibility } from '@/lib/about-settings';
import { useHomeContent } from '@/lib/home-content';
import { useLayout } from '@/lib/layout';

const HIDDEN_ORGANIZATION_PORTALS = new Set(['security-assessment', 'cyber-range']);

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [organizationPortals, setOrganizationPortals] = useState<OrganizationOffering[]>([]);
  const [showAbout, setShowAbout] = useState(true);
  const home = useHomeContent();
  const layout = useLayout();
  const pageOn = (path: string) => !layout.hiddenPages.includes(path.split(/[?#]/)[0]);

  useEffect(() => {
    const refresh = () => {
      setOrganizationPortals(loadOrganizationOfferings().filter((item) => item.menuVisible && !HIDDEN_ORGANIZATION_PORTALS.has(item.id)));
      setShowAbout(loadAboutVisibility().footerVisible);
    };
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  const portals: { label: string; path: string; external?: boolean }[] = [
    ...organizationPortals.map((item) => ({ label: item.title, path: item.page })),
    { label: 'Cyber News Portal', path: '/cyber-news' },
    { label: 'Threat Intel Hub', path: '/threat-intel' },
    { label: 'Cyber & Forensic Intelligence Hub', path: '/forensic-engine.html', external: true },
  ].filter((p) => pageOn(p.path));

  const handleSection = (label: string) => {
    const id = toSectionId(label);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <footer className="mt-24 border-t border-border bg-card/60 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={tgLogo} alt="Tech Guardians logo" className="w-8 h-8 rounded-md object-contain" />
              <span className="text-base font-semibold text-foreground">Tech Guardians</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {home.footerAbout}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-foreground mb-4">Our Portals</h4>
            <div className="flex flex-col gap-2.5">
              {showAbout && pageOn('/about') && <button onClick={() => navigate('/about')} className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">About Us</button>}
              {portals.map((p) => (
                <button
                  key={p.path}
                  onClick={() => (p.external ? (window.location.href = p.path) : navigate(p.path))}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-foreground mb-4">Follow</h4>
            <div className="flex flex-col gap-2.5">
              <a href="https://www.instagram.com/techguardianss/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Instagram</a>
              <a href="https://www.youtube.com/@TECHGUARDIANS_IT" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">YouTube</a>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">WhatsApp Support</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2026 Tech Guardians. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Keep Learning and Keep Sharing</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
