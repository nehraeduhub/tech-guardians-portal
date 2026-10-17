import { useEffect, useState } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import SectionHeading from '@/components/pro/SectionHeading';
import SmartLink from '@/components/pro/SmartLink';
import ProductCard from '@/components/pro/ProductCard';
import EcoCarousel from '@/components/pro/EcoCarousel';
import EventTicket from '@/components/pro/EventTicket';
import PortalCard from '@/components/pro/PortalCard';
import PriceTag from '@/components/pro/PriceTag';
import { HOME_ECOSYSTEM, useList } from '@/lib/content-lists';
import { isCoursesHomeVisible, loadManagedCourses, type ManagedCourse } from '@/lib/courses-store';
import { courseVisuals } from '@/lib/site-content';
import { portalIsExternal, portalOnHome, splitEvents, useEvents, usePortals, useProducts } from '@/lib/catalog';
import { useLayout } from '@/lib/layout';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Training Programs (replaces the old "Hands-on Practical Classes" carousel). */
export const TrainingProgramsSection = () => {
  const [programs, setPrograms] = useState<ManagedCourse[]>([]);
  const [visible, setVisible] = useState(isCoursesHomeVisible());
  useEffect(() => {
    const refresh = () => void loadManagedCourses().then((rows) => { setPrograms(rows.filter((c) => c.enabled && c.title.trim())); setVisible(isCoursesHomeVisible()); });
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  if (!visible || !programs.length) return null;
  return (
    <section id="courses" className="tg-section relative">
      <div className="tg-container">
        <SectionHeading eyebrow="Training Programs" title={<>Practical <span className="neon-text-purple text-cyber-purple">Training Programs</span></>}
          lead="Live, mentor-led programs with hands-on labs and a certificate — with transparent offer prices." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((c, i) => (
            <ScrollReveal key={c.id} delay={(i % 3) * 0.05}>
              <a href={c.page} className="tg-card group flex h-full flex-col overflow-hidden p-0">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {courseVisuals[i % courseVisuals.length] && <img src={courseVisuals[i % courseVisuals.length]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">Training Program</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">{c.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/40 pt-4">
                    {c.showPrice ? <PriceTag price={c.price} offer={c.offer} note="Contact for fees" /> : <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><Clock className="h-3.5 w-3.5" />Live • Mentor-led</span>}
                    <span className="inline-flex shrink-0 items-center gap-1 font-display text-xs uppercase tracking-wider text-primary">Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                  </div>
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/** "Explore the Tech Guardians ecosystem": picture cards, incl. Products & Solutions. */
export const EcosystemSection = () => {
  const rows = (useList(HOME_ECOSYSTEM) ?? HOME_ECOSYSTEM.seed ?? []).filter((r) => r.visible && r.title);
  if (!rows.length) return null;
  return (
    <section id="ecosystem" className="tg-section relative overflow-hidden">
      <div className="tg-container">
        <SectionHeading eyebrow="Learn • Practice • Protect" title={<>Explore the <span className="neon-text text-primary">Tech Guardians</span> ecosystem</>} lead="Training, products, resources and awareness to help you stay secure in the digital world." />
        <EcoCarousel items={rows.map((r) => ({ id: r.id, eyebrow: str(r.eyebrow), title: str(r.title), text: str(r.text), image: str(r.image), buttonText: str(r.buttonText), buttonLink: str(r.buttonLink) }))} />
      </div>
    </section>
  );
};

/** Products & Solutions. */
export const ProductsSection = () => {
  const layout = useLayout();
  const products = useProducts().filter((p) => p.visible && p.name);
  if (layout.hiddenPages.includes('/products') || !products.length) return null;
  return (
    <section id="products" className="tg-section relative">
      <div className="tg-container">
        <SectionHeading eyebrow="Products & Solutions" title={<>Security <span className="neon-text text-primary">tools &amp; solutions</span></>}
          lead="VAPT tool, Windows audit & hardening, secure website and app development — with training for your team." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p, i) => <ScrollReveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></ScrollReveal>)}
        </div>
        <div className="mt-10 text-center"><Link to="/products" className="cyber-btn-outline">All products &amp; solutions <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </section>
  );
};

/** Events & Workshops. */
export const EventsSection = () => {
  const layout = useLayout();
  const { upcoming } = splitEvents(useEvents());
  if (layout.hiddenPages.includes('/events') || !upcoming.length) return null;
  return (
    <section id="events" className="tg-section relative">
      <div className="tg-container">
        <SectionHeading eyebrow="Events & Workshops" title={<>Join our next <span className="neon-text-green text-cyber-green">live session</span></>}
          lead="Live classes, webinars, bootcamps and awareness drives — online and on campus." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 3).map((e, i) => <ScrollReveal key={e.id} delay={i * 0.06} className="h-full"><EventTicket event={e} /></ScrollReveal>)}
        </div>
        <div className="mt-10 text-center"><Link to="/events" className="cyber-btn-outline">All events <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </section>
  );
};

/** Free tools for everyday cyber safety (portals, which can live on their own subdomains). */
export const FreeToolsSection = () => {
  const layout = useLayout();
  const portals = usePortals().filter((p) => p.visible && p.name && portalOnHome(p) && (portalIsExternal(p) || !layout.hiddenPages.includes(p.fallback)));
  if (!portals.length) return null;
  return (
    <section id="free-tools" className="tg-section relative">
      <div className="tg-container">
        <SectionHeading eyebrow="Tech Guardians Portals" title={<>Free tools for <span className="neon-text-green text-cyber-green">everyday cyber safety</span></>} lead="News, threat intelligence, forensic lookups and safety checks — open to everyone." />
        <div className={`grid gap-4 sm:grid-cols-2 ${portals.length > 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {portals.map((p, i) => <ScrollReveal key={p.id} delay={i * 0.04}><PortalCard portal={p} /></ScrollReveal>)}
        </div>
      </div>
    </section>
  );
};
