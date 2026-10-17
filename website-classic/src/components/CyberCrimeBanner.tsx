import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Globe2, LifeBuoy, PhoneCall, ShieldAlert } from 'lucide-react';

const ACTIONS = [
  { icon: PhoneCall, title: 'Call 1930', text: 'National cyber crime helpline. Call within the first hour of a money fraud to freeze the transaction.', href: 'tel:1930', cta: 'Call now', external: true },
  { icon: Globe2, title: 'Report online', text: 'File a complaint on the National Cyber Crime Reporting Portal, cybercrime.gov.in.', href: 'https://cybercrime.gov.in/', cta: 'Open portal', external: true },
  { icon: LifeBuoy, title: 'Get help from us', text: 'Step-by-step guidance from Tech Guardians to report, recover accounts and stay safe.', href: '/cyber-crime-support', cta: 'Get support', external: false },
];

/** "Victim of cyber crime?" — a compact bar that opens to the report and help options. */
const CyberCrimeBanner = () => {
  const [open, setOpen] = useState(false);
  return (
    <section id="report-cyber-crime" className="relative px-4 py-10 md:px-8">
      <div className="container mx-auto max-w-5xl">
        <div className="tg-dark relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/80 via-[hsl(var(--tg-navy))] to-[hsl(var(--tg-navy))] shadow-[0_24px_60px_-36px_rgba(239,68,68,.8)]">
          <div className="flex flex-wrap items-center gap-4 p-4 md:p-5">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-500/50 bg-red-500/15">
              <span className="absolute inset-0 animate-ping rounded-xl bg-red-500/20 motion-reduce:animate-none" aria-hidden />
              <ShieldAlert className="relative h-5 w-5 text-red-400" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-bold text-white md:text-lg">Victim of cyber crime? Act now.</h2>
              <p className="text-xs text-slate-300 md:text-sm">Report within the first hour — the faster you act, the better the chance of recovery.</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <a href="tel:1930" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 sm:flex-none"><PhoneCall className="h-4 w-4" /> Call 1930</a>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="report-options"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:flex-none"
              >
                {open ? 'Show less' : 'Explore more'} <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id="report-options"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-3 md:p-5">
                  {ACTIONS.map((a) => {
                    const body = (
                      <>
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/15 text-red-300 transition-colors group-hover:bg-red-500 group-hover:text-white"><a.icon className="h-5 w-5" /></span>
                        <h3 className="mt-3 font-display text-base font-bold text-white">{a.title}</h3>
                        <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-400">{a.text}</p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-300">{a.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                      </>
                    );
                    const cls = 'group flex h-full flex-col rounded-xl border border-white/10 bg-black/25 p-4 transition-all hover:-translate-y-0.5 hover:border-red-400/60';
                    return a.external
                      ? <a key={a.title} href={a.href} target={a.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>{body}</a>
                      : <Link key={a.title} to={a.href} className={cls}>{body}</Link>;
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default CyberCrimeBanner;
