import { ArrowRight, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';
import SectionHeading from '@/components/pro/SectionHeading';
import SmartLink from '@/components/pro/SmartLink';
import ProgramCard from '@/components/pro/ProgramCard';
import ProductCard from '@/components/pro/ProductCard';
import EventCard from '@/components/pro/EventCard';
import PortalCard from '@/components/pro/PortalCard';
import { iconFor } from '@/components/pro/icons';
import { HOME_ECOSYSTEM, HOME_HIGHLIGHTS, useList } from '@/lib/content-lists';
import { isCoursesHomeVisible, usePrograms } from '@/lib/courses-store';
import { portalIsExternal, splitEvents, useEvents, usePortals, useProducts } from '@/lib/catalog';
import { useHomeContent } from '@/lib/home-content';
import { useLayout } from '@/lib/layout';
import { waLink } from '@/lib/site-settings';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** Four service cards overlapping the bottom of the hero. */
export const HighlightsSection = () => {
  const rows = (useList(HOME_HIGHLIGHTS) ?? HOME_HIGHLIGHTS.seed ?? []).filter((r) => r.visible && r.title);
  if (!rows.length) return null;
  return (
    <section aria-label="What we do" className="relative z-10 -mt-px bg-background pt-8 md:pt-10">
      <div className="tg-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r, i) => {
          const Icon = iconFor(str(r.icon));
          return (
            <ScrollReveal key={r.id} delay={i * 0.05}>
              <SmartLink item={{ href: str(r.link) || '/' }} className="tg-card group flex h-full flex-col p-6">
                <span className="flex items-center justify-between">
                  <span className="tg-icon-tile"><Icon className="h-6 w-6" /></span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-white"><ArrowRight className="h-4 w-4" /></span>
                </span>
                <span className="mt-4 block text-lg font-bold text-foreground">{str(r.title)}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{str(r.text)}</span>
              </SmartLink>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
};

/** "Explore the Tech Guardians ecosystem": three large picture cards. */
export const EcosystemSection = () => {
  const rows = (useList(HOME_ECOSYSTEM) ?? HOME_ECOSYSTEM.seed ?? []).filter((r) => r.visible && r.title);
  if (!rows.length) return null;
  return (
    <section id="ecosystem" className="tg-section bg-background">
      <div className="tg-container">
        <SectionHeading eyebrow="Learn • Practice • Protect" title="Explore the Tech Guardians ecosystem" lead="Training, resources and solutions to help you stay secure in the digital world." />
        <div className="grid gap-5 md:grid-cols-3">
          {rows.map((r, i) => (
            <ScrollReveal key={r.id} delay={i * 0.06}>
              <article className="tg-dark group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-6 shadow-[0_24px_50px_-28px_rgba(2,8,23,.8)]">
                {str(r.image) && <img src={str(r.image)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-r from-[#061330] via-[#061330]/85 to-[#061330]/30" />
                <div className="relative max-w-[85%]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#60a5fa]">{str(r.eyebrow)}</p>
                  <h3 className="mt-2 text-2xl font-extrabold leading-tight text-white">{str(r.title)}</h3>
                  {str(r.text) && <p className="mt-2 text-sm leading-relaxed text-slate-300">{str(r.text)}</p>}
                  {str(r.buttonText) && (
                    <SmartLink item={{ href: str(r.buttonLink) || '/' }} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#061330]">
                      {str(r.buttonText)} <ArrowRight className="h-4 w-4" />
                    </SmartLink>
                  )}
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/** Featured Training Programs. */
export const ProgramsSection = () => {
  const programs = usePrograms();
  if (!isCoursesHomeVisible() || !programs?.length) return null;
  const featured = (programs.some((p) => p.featured) ? programs.filter((p) => p.featured) : programs).slice(0, 3);
  return (
    <section id="courses" className="tg-section border-t border-border bg-card">
      <div className="tg-container">
        <SectionHeading center={false} eyebrow="Training Programs" title="Learn by doing, with live mentors" lead="Practical programs with live sessions, labs and a certificate — priced fairly with transparent offers."
          action={<Link to="/training" className="tg-btn-outline">All {programs.length} programs <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <ScrollReveal key={p.id} delay={i * 0.06}><ProgramCard program={p} /></ScrollReveal>)}
        </div>
      </div>
    </section>
  );
};

/** Products and services. */
export const ProductsSection = () => {
  const layout = useLayout();
  const products = useProducts().filter((p) => p.visible && p.name);
  if (layout.hiddenPages.includes('/products') || !products.length) return null;
  const featured = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products).slice(0, 3);
  return (
    <section id="products" className="tg-section bg-background">
      <div className="tg-container">
        <SectionHeading center={false} eyebrow="Products & Solutions" title="Security tools and services built by Tech Guardians"
          lead="From vulnerability assessment to Windows hardening and secure development — with training for your team."
          action={<Link to="/products" className="tg-btn-outline">All products <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <ScrollReveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></ScrollReveal>)}
        </div>
      </div>
    </section>
  );
};

/** Next three events. */
export const EventsSection = () => {
  const layout = useLayout();
  const { upcoming } = splitEvents(useEvents());
  if (layout.hiddenPages.includes('/events') || !upcoming.length) return null;
  return (
    <section id="events" className="tg-section border-t border-border bg-card">
      <div className="tg-container">
        <SectionHeading center={false} eyebrow="Events & Workshops" title="Join our next live session"
          action={<Link to="/events" className="tg-btn-outline">All events <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 3).map((e, i) => <ScrollReveal key={e.id} delay={i * 0.06}><EventCard event={e} /></ScrollReveal>)}
        </div>
      </div>
    </section>
  );
};

/** Portals strip on a navy band. */
export const PortalsSection = () => {
  const layout = useLayout();
  const portals = usePortals().filter((p) => p.visible && p.name && (portalIsExternal(p) || !layout.hiddenPages.includes(p.fallback)));
  if (!portals.length) return null;
  return (
    <section id="portals" className="tg-dark tg-band tg-section">
      <div className="tg-container">
        <SectionHeading eyebrow="Tech Guardians Portals" title="Free tools for everyday cyber safety" lead="News, threat intelligence, forensic lookups and safety checks — open to everyone." />
        <div className={`grid gap-4 sm:grid-cols-2 ${portals.length > 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {portals.map((p, i) => <ScrollReveal key={p.id} delay={i * 0.04}><PortalCard portal={p} /></ScrollReveal>)}
        </div>
      </div>
    </section>
  );
};

/** Closing call-to-action and contact. */
export const CtaSection = () => {
  const home = useHomeContent();
  return (
    <section id="contact" className="tg-section bg-background">
      <div className="tg-container">
        <div className="tg-dark relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2a6b] via-[#0a1f4d] to-[#061330] p-8 md:p-12">
          <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2563eb]/40 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="tg-eyebrow text-[#60a5fa]">Contact us</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl" style={{ textWrap: 'balance' }}>{home.ctaTitle}</h2>
              <p className="mt-3 max-w-xl text-slate-300">{home.ctaText}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a href={waLink('Hi Tech Guardians, I would like to know more.')} target="_blank" rel="noopener noreferrer" className="tg-btn !justify-start !rounded-xl bg-[#22c55e] !py-4 text-white hover:brightness-110">
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>
              <a href="mailto:ittechguardians@gmail.com" className="tg-btn !justify-start !rounded-xl border border-white/30 !py-4 text-white hover:bg-white/10">
                <Mail className="h-5 w-5" /> ittechguardians@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
