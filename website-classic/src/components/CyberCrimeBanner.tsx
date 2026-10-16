import { Link } from 'react-router-dom';
import { ArrowRight, Globe2, LifeBuoy, PhoneCall, ShieldAlert } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ACTIONS = [
  { icon: PhoneCall, title: 'Call 1930', text: 'National cyber crime helpline. Call within the first hour of a money fraud to freeze the transaction.', href: 'tel:1930', cta: 'Call now', external: true },
  { icon: Globe2, title: 'Report online', text: 'File a complaint on the National Cyber Crime Reporting Portal, cybercrime.gov.in.', href: 'https://cybercrime.gov.in/', cta: 'Open portal', external: true },
  { icon: LifeBuoy, title: 'Get help from us', text: 'Step-by-step guidance from Tech Guardians to report, recover accounts and stay safe.', href: '/cyber-crime-support', cta: 'Get support', external: false },
];

/** "Victim of cyber crime?" — report and get-help actions on the homepage. */
const CyberCrimeBanner = () => (
  <section id="report-cyber-crime" className="relative px-4 py-16 md:px-8">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/60 via-[hsl(222_60%_6%)] to-[hsl(222_60%_5%)] p-6 shadow-[0_30px_80px_-40px_rgba(239,68,68,.7)] md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-red-500/50 bg-red-500/15">
                <span className="absolute inset-0 animate-ping rounded-2xl bg-red-500/20 motion-reduce:animate-none" aria-hidden />
                <ShieldAlert className="relative h-7 w-7 text-red-400" />
              </span>
              <div>
                <p className="font-display text-xs uppercase tracking-[0.3em] text-red-400">Report a cyber crime</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Victim of cyber crime? Act now.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Online fraud, hacked account, sextortion or a fake “digital arrest” call — the faster you report, the better the chance of recovery.</p>
              </div>
            </div>
          </div>
          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            {ACTIONS.map((a) => {
              const body = (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/15 text-red-300 transition-colors group-hover:bg-red-500 group-hover:text-white"><a.icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">{a.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{a.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red-300">{a.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </>
              );
              const cls = 'group flex h-full flex-col rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-red-400/60';
              return a.external
                ? <a key={a.title} href={a.href} target={a.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>{body}</a>
                : <Link key={a.title} to={a.href} className={cls}>{body}</Link>;
            })}
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default CyberCrimeBanner;
