import { useEffect, useState } from 'react';
import {
  ArrowRight, Award, BookOpen, Bot, Brain, Bug, Clock, Code, Cpu, Database, Eye, FlaskConical, Globe, HardDrive, Key, MonitorPlay, Network,
  Search, Server, Shield, Skull, Smartphone, type LucideIcon,
} from 'lucide-react';
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
import { isCoursesHomeVisible, loadManagedCourses, programPrice, type ManagedCourse } from '@/lib/courses-store';
import { courseVisuals } from '@/lib/site-content';
import { portalIsExternal, portalOnHome, splitEvents, useEvents, usePortals, useProducts } from '@/lib/catalog';
import { useLayout } from '@/lib/layout';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

const COURSE_ICONS: Record<string, LucideIcon> = { Globe, Shield, Server, Bot, Key, Smartphone, BookOpen, Skull, Search, Brain, HardDrive, Eye, Bug, Code, Database, Cpu, Network };
/** Each card gets its own colour so neighbouring programs never look alike. */
const COURSE_TONES = ['#12408a', '#138808', '#e07b12', '#6d28d9', '#c62828', '#0e7490'];
const COURSE_PAGES = ['/courses/web-server-hosting.html', '/courses/sophos-firewall.html', '/courses/active-directory.html', '/courses/ai-agent.html', '/courses/password-cracking.html', '/courses/social-android-hacking.html'];
const courseImage = (page: string, i: number) => courseVisuals[COURSE_PAGES.indexOf(page)] || courseVisuals[i % courseVisuals.length];

/** One training program: photo, icon badge, key facts, price and a clear button. */
const ProgramCard = ({ course, index }: { course: ManagedCourse; index: number }) => {
  const tone = COURSE_TONES[index % COURSE_TONES.length];
  const Icon = COURSE_ICONS[course.icon_name] || BookOpen;
  const p = programPrice({ price: course.price, offer: course.offer });
  return (
    <a href={course.page} className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={courseImage(course.page, index)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <span className="absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow" style={{ background: tone }}>Training Program</span>
        {course.showPrice && p.discount > 0 && <span className="absolute right-3 top-3 rounded bg-[#ff9933] px-2 py-1 text-[11px] font-extrabold text-[#1a1206] shadow">{p.discount}% OFF</span>}
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[11px] font-semibold text-white"><Clock className="h-3.5 w-3.5" /> Live · Mentor-led</span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <span className="relative z-10 -mt-6 mb-3 grid h-12 w-12 place-items-center rounded-full text-white shadow-lg ring-4 ring-card" style={{ background: tone }} aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-primary">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
        <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold leading-tight text-foreground [&_li]:whitespace-nowrap">
          <li className="flex flex-col items-center gap-1 rounded-md bg-muted/70 px-1 py-2"><MonitorPlay className="h-4 w-4" style={{ color: tone }} />Live classes</li>
          <li className="flex flex-col items-center gap-1 rounded-md bg-muted/70 px-1 py-2"><FlaskConical className="h-4 w-4" style={{ color: tone }} />Hands-on</li>
          <li className="flex flex-col items-center gap-1 rounded-md bg-muted/70 px-1 py-2"><Award className="h-4 w-4" style={{ color: tone }} />Certificate</li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
          {course.showPrice ? <PriceTag price={course.price} offer={course.offer} note="Contact for fees" /> : <span className="text-sm font-medium text-muted-foreground">Contact for fees</span>}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md px-3.5 py-2 text-xs font-bold text-white transition group-hover:brightness-110" style={{ background: tone }}>
            View course <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
      <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: tone }} aria-hidden />
    </a>
  );
};

/** Training Programs (homepage section and the /training page). */
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
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((c, i) => (
            <ScrollReveal key={c.id} delay={(i % 3) * 0.05} className="h-full">
              <ProgramCard course={c} index={i} />
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
