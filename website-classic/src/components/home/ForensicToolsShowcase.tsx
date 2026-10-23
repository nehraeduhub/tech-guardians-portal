import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, ExternalLink } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SectionHeading from '@/components/pro/SectionHeading';
import { readSetting } from '@/lib/shared-settings';
import { useLayout } from '@/lib/layout';

// A taste of the Cyber & Forensic Hub: one tool from each category.
// Uses the admin's list (Manage → Forensic Hub Tools) or the built-in one.

interface Cat { id: string; name: string; icon: string }
interface Tool { c: string; i: string; t: string; d: string; u: string; h?: string; g?: boolean; x?: boolean }
interface Data { cats: Cat[]; tools: Tool[] }

const HUB = '/forensic-engine.html';
const valid = (d: unknown): d is Data => !!d && Array.isArray((d as Data).cats) && Array.isArray((d as Data).tools);

const useForensicData = () => {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    const pick = () => {
      const own = readSetting<Data | null>('tg_forensic_tools', null);
      if (valid(own)) { setData(own); return true; }
      return false;
    };
    if (!pick()) fetch('/content/forensic-tools.json').then((r) => r.json()).then((d) => { if (valid(d)) setData((cur) => cur || d); }).catch(() => undefined);
    const refresh = () => { pick(); };
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);
  return data;
};

const ForensicToolsShowcase = () => {
  const layout = useLayout();
  const data = useForensicData();
  if (layout.hiddenPages.includes(HUB) || !data) return null;
  const tools = data.tools.filter((t) => t.t && t.u && !t.x);
  const featured = data.cats.map((c) => tools.find((t) => t.c === c.id)).filter((t): t is Tool => !!t).slice(0, 8);
  if (!featured.length) return null;
  const catName = (id: string) => data.cats.find((c) => c.id === id)?.name || '';

  return (
    <section id="forensic-tools" className="tg-section relative">
      <div className="tg-container">
        <SectionHeading center={false} eyebrow="Cyber & Forensic Hub" title="Free forensic & cyber safety tools"
          lead={`${tools.length} verified tools for citizens, investigators and analysts — complaint portals, breach checks, deepfake detection, OSINT and more.`}
          action={<a href={HUB} className="cyber-btn-primary">View all {tools.length} tools <ArrowRight className="h-4 w-4" /></a>} />

        <div className="mb-6 flex flex-wrap gap-2">
          {data.cats.map((c) => (
            <a key={c.id} href={`${HUB}#cat=${c.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary">
              <span aria-hidden>{c.icon}</span>{c.name}
              <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">{tools.filter((t) => t.c === c.id).length}</span>
            </a>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t, i) => (
            <ScrollReveal key={t.u} delay={(i % 4) * 0.05} className="h-full">
              <a href={t.u} target="_blank" rel="noopener noreferrer" className="tg-card group flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-2xl" aria-hidden>{t.i}</span>
                  {t.g && <span className="inline-flex items-center gap-1 rounded bg-[#138808]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#138808]"><BadgeCheck className="h-3 w-3" />Official</span>}
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-accent">{catName(t.c)}</p>
                <h3 className="mt-1 font-bold leading-snug text-foreground group-hover:text-primary">{t.t}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{t.d}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-primary">Open {t.h || 'tool'} <ExternalLink className="h-3.5 w-3.5" /></span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForensicToolsShowcase;
