import { FileText, Lock, RefreshCw, Scale, ShieldCheck, UserCheck } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import RichText from '@/components/RichText';
import { getWhatsAppNumber } from '@/lib/site-settings';
import { useLegal } from '@/lib/legal';

// Terms & Conditions, privacy and refund policy. Linked from the checkout,
// the student account page, the PDF store and the footer. Text is edited in
// Manage → Terms & Privacy.

const ICONS: Record<string, typeof FileText> = { privacy: Lock, account: UserCheck, payments: ShieldCheck, refunds: RefreshCw, use: FileText, law: Scale };

const Terms = () => {
  const wa = getWhatsAppNumber();
  const legal = useLegal();
  const sections = legal.sections.filter((s) => s.visible && s.title.trim());
  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding pb-8">
        <div className="container mx-auto max-w-4xl">
          <span className="rl-eyebrow">Legal</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-5xl">Terms &amp; Conditions</h1>
          <p className="mt-4 text-muted-foreground">{legal.intro}{legal.updated && ` Last updated: ${legal.updated}.`}</p>
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-xs">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="rounded-full border border-primary/30 px-3 py-1.5 text-primary hover:bg-primary/10">{s.title.split(/\s[—-]\s/)[0]}</a>
            ))}
          </nav>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl space-y-6 px-4 pb-24 md:px-8">
        {sections.map((s, i) => {
          const Icon = ICONS[s.id] || FileText;
          return (
            <ScrollReveal key={s.id}>
              <section id={s.id} className="glass-card scroll-mt-28 p-6 md:p-8">
                <h2 className="flex items-center gap-3 font-display text-xl font-bold text-foreground"><Icon className="h-6 w-6 text-primary" />{i + 1}. {s.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground [&_b]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
                  <RichText text={s.body} vars={{ whatsapp: wa }} />
                </div>
              </section>
            </ScrollReveal>
          );
        })}
      </div>
    </SiteFrame>
  );
};

export default Terms;
