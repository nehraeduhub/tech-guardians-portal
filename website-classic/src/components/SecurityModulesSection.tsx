import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ClipboardCheck, Clock, ExternalLink, ListChecks, MessageCircle, Printer, RotateCcw, ShieldAlert, Smartphone, Users, type LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import ScrollReveal from './ScrollReveal';
import { waLink } from '@/lib/site-settings';
import { safeLink } from '@/lib/utils';

// "Your Digital Defense Kit": four guides that open step by step.
// Progress is remembered on the visitor's device.

interface Step { title: string; detail: string; where?: string; link?: { label: string; href: string } }
interface Module {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  time: string;
  tone: string;
  intro: string;
  steps: Step[];
  tip: string;
}

const MODULES: Module[] = [
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Secure Your Mobile Phone',
    desc: 'Lock down your smartphone — screen lock, updates, app permissions and theft protection.',
    time: '15 min',
    tone: 'from-violet-500 to-indigo-600',
    intro: 'Your phone holds your bank, UPI, photos and OTPs. These steps work on Android and iPhone; menu names can differ slightly by brand.',
    steps: [
      { title: 'Set a strong screen lock', detail: 'Use a 6-digit (or longer) PIN plus fingerprint or face unlock. Avoid patterns, 1234 or your birth year.', where: 'Android: Settings → Security → Screen lock · iPhone: Settings → Face ID & Passcode' },
      { title: 'Install every update', detail: 'Updates fix security holes that attackers use. Turn on automatic updates for the phone and the apps.', where: 'Android: Settings → System → Software update · iPhone: Settings → General → Software Update' },
      { title: 'Install apps only from the official store', detail: 'Never install an APK sent on WhatsApp or SMS. Keep “Install unknown apps” turned off and Google Play Protect turned on.', where: 'Android: Settings → Apps → Special app access → Install unknown apps' },
      { title: 'Review app permissions', detail: 'Remove SMS, contacts, location, microphone and accessibility access from apps that do not need it. Delete apps you no longer use.', where: 'Android: Settings → Privacy → Permission manager · iPhone: Settings → Privacy & Security' },
      { title: 'Never allow screen-sharing apps for strangers', detail: 'If a caller asks you to install AnyDesk, TeamViewer or QuickSupport “to help”, it is a scam. Hang up.' },
      { title: 'Turn on Find My Device and note your IMEI', detail: 'Dial *#06# to see your IMEI and save it. If the phone is lost or stolen, block it on CEIR so it cannot be used.', where: 'Android: Find My Device · iPhone: Settings → [your name] → Find My', link: { label: 'Block a lost phone (CEIR)', href: 'https://sancharsaathi.gov.in/Home/ceir-services.jsp' } },
      { title: 'Check SIMs issued in your name', detail: 'Make sure no unknown mobile number is registered with your ID. Report any number you do not use.', link: { label: 'Check on Sanchar Saathi (TAFCOP)', href: 'https://tafcop.sancharsaathi.gov.in/' } },
      { title: 'Back up your phone', detail: 'Turn on automatic backup of photos and contacts, so a lost or locked phone does not mean lost memories.', where: 'Android: Settings → Google → Backup · iPhone: Settings → [your name] → iCloud' },
    ],
    tip: 'A locked, updated phone with official apps only stops most mobile frauds before they start.',
  },
  {
    id: 'social',
    icon: Users,
    title: 'Secure Social Media',
    desc: 'Two-step verification, privacy settings and safe habits on Instagram, Facebook, WhatsApp and Google.',
    time: '20 min',
    tone: 'from-sky-500 to-blue-600',
    intro: 'Hacked social accounts are used to cheat your friends and family. Lock each account once and it stays protected.',
    steps: [
      { title: 'Use a strong, different password for each account', detail: 'Use a long passphrase (12+ characters) and never reuse your email or bank password. A password manager makes this easy.' },
      { title: 'Turn on two-step verification on WhatsApp', detail: 'Set a 6-digit PIN that WhatsApp asks for when your number is registered on a new phone. This stops SIM-swap and OTP hijacks.', where: 'WhatsApp: Settings → Account → Two-step verification' },
      { title: 'Turn on two-factor authentication on Instagram and Facebook', detail: 'Prefer an authenticator app over SMS. Save the backup codes somewhere safe.', where: 'Instagram / Facebook: Settings → Accounts Centre → Password and security → Two-factor authentication' },
      { title: 'Secure your Google / Gmail account', detail: 'Your email resets every other password. Turn on 2-Step Verification and run the Security Checkup.', link: { label: 'Open Google Security Checkup', href: 'https://myaccount.google.com/security-checkup' } },
      { title: 'Check where you are logged in', detail: 'Log out of devices you do not recognise and unlink old WhatsApp Web sessions.', where: 'Accounts Centre → Password and security → Where you’re logged in · WhatsApp: Settings → Linked devices' },
      { title: 'Tighten privacy settings', detail: 'Make your profile private if you do not need it public, hide your phone number and email, and let only contacts add you to WhatsApp groups.', where: 'WhatsApp: Settings → Privacy → Groups → My contacts' },
      { title: 'Never share codes or click “verify” messages', detail: 'Messages about “copyright violation”, “blue tick verification” or “your account will be deleted” are phishing. Never share a 6-digit code with anyone.' },
      { title: 'Know how to recover a hacked account', detail: 'Use only the official recovery pages, then change the password, turn on 2FA and warn your friends.', link: { label: 'Instagram hacked account help', href: 'https://www.instagram.com/hacked/' } },
    ],
    tip: 'Two-step verification alone blocks the vast majority of account takeovers. Do it today.',
  },
  {
    id: 'india',
    icon: ShieldAlert,
    title: 'Cyber Awareness India',
    desc: 'Report cybercrime via 1930, know the official portals and the scams targeting Indians right now.',
    time: '10 min',
    tone: 'from-orange-500 to-red-600',
    intro: 'Know exactly where to go and what to do — before you need it. Save these numbers and links.',
    steps: [
      { title: 'Lost money? Call 1930 in the first hour', detail: '1930 is the national cyber fraud helpline. Reporting quickly lets banks freeze the money before it moves.', link: { label: 'Call 1930', href: 'tel:1930' } },
      { title: 'File a complaint on cybercrime.gov.in', detail: 'Report financial fraud and all other cybercrime. Cases involving women and children can be reported without giving your name.', link: { label: 'National Cyber Crime Reporting Portal', href: 'https://cybercrime.gov.in/' } },
      { title: 'Report fraud calls and SMS on Chakshu', detail: 'Report suspected fraud calls, SMS and WhatsApp messages so the numbers can be blocked.', link: { label: 'Sanchar Saathi — Chakshu', href: 'https://sancharsaathi.gov.in/sfc/' } },
      { title: 'Call your bank and block the card or UPI', detail: 'Use the number printed on your card or the bank’s official app, never a number from a search result or SMS.' },
      { title: 'Keep the evidence', detail: 'Save screenshots, transaction IDs, the caller’s number, chats and website links. Do not delete the messages.' },
      { title: 'Know today’s common scams', detail: '“Digital arrest” video calls, fake KYC and electricity-bill SMS, UPI collect requests (you never enter a PIN to receive money), part-time job and task scams, fake investment apps, sextortion and instant loan apps.' },
      { title: 'Escalate if the bank does not resolve it', detail: 'If your bank does not resolve a complaint within 30 days, file with the RBI Integrated Ombudsman.', link: { label: 'RBI Complaint Management System', href: 'https://cms.rbi.org.in/' } },
      { title: 'Follow official advisories', detail: 'CERT-In publishes alerts on new threats and vulnerabilities in India. Our Cyber News Portal collects them for you.', link: { label: 'CERT-In', href: 'https://www.cert-in.org.in/' } },
    ],
    tip: 'Police, CBI or courts never arrest anyone on a video call or ask for money to “clear your name”.',
  },
  {
    id: 'weekly',
    icon: ClipboardCheck,
    title: 'Weekly Security Checklist',
    desc: 'A 15-minute weekly routine — updates, statements, passwords, backups and more.',
    time: '15 min / week',
    tone: 'from-emerald-500 to-teal-600',
    intro: 'Pick one day a week. Tick each item as you go — your progress is saved on this device and you can reset it next week.',
    steps: [
      { title: 'Install pending updates', detail: 'Phone, laptop, browser and apps. Restart if asked.' },
      { title: 'Check bank and UPI statements', detail: 'Look for small unknown debits, mandates or subscriptions you did not set up.' },
      { title: 'Check if your email leaked', detail: 'See whether your email or phone appeared in a new data breach.', link: { label: 'Have I Been Pwned', href: 'https://haveibeenpwned.com/' } },
      { title: 'Change one weak or reused password', detail: 'Start with email, then banking, then social media.' },
      { title: 'Review logged-in devices', detail: 'Google, WhatsApp Linked devices and Instagram/Facebook Accounts Centre — remove anything unknown.' },
      { title: 'Clean up apps and browser extensions', detail: 'Delete apps you do not use and remove unknown browser extensions.' },
      { title: 'Back up photos and important files', detail: 'Keep at least one copy in the cloud or on an external drive.' },
      { title: 'Share one scam alert with your family', detail: 'Talk about one new scam this week. Awareness at home is the best protection.' },
    ],
    tip: 'Fifteen minutes a week keeps your digital life clean, updated and hard to attack.',
  },
];

const storeKey = (id: string) => `tg_defense_kit_${id}`;
const loadDone = (id: string): number[] => {
  try { const v = JSON.parse(localStorage.getItem(storeKey(id)) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
};
const saveDone = (id: string, done: number[]) => { try { localStorage.setItem(storeKey(id), JSON.stringify(done)); } catch { /* private mode */ } };

const Guide = ({ module: m, onClose }: { module: Module; onClose: () => void }) => {
  const [done, setDone] = useState<number[]>(() => loadDone(m.id));
  useEffect(() => { saveDone(m.id, done); }, [m.id, done]);
  const toggle = (i: number) => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
  const pct = Math.round((done.length / m.steps.length) * 100);

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 text-card-foreground sm:rounded-2xl [&>button:last-child]:text-white [&>button:last-child]:opacity-90">
        <div className={`bg-gradient-to-br ${m.tone} px-6 pb-5 pt-6 text-white print:bg-none print:text-black`}>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/20"><m.icon className="h-6 w-6" /></span>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-extrabold leading-tight text-white">{m.title}</DialogTitle>
              <p className="mt-0.5 flex items-center gap-3 text-xs text-white/85"><span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> {m.steps.length} steps</span><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.time}</span></p>
            </div>
          </div>
          <DialogDescription className="mt-3 text-sm leading-relaxed text-white/90">{m.intro}</DialogDescription>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-semibold text-white/90"><span>Your progress</span><span>{done.length} of {m.steps.length} done</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>

        <ol className="max-h-[52vh] space-y-3 overflow-y-auto px-6 py-5">
          {m.steps.map((s, i) => {
            const isDone = done.includes(i);
            return (
              <li key={s.title} className={`flex gap-4 rounded-xl border p-4 transition-colors ${isDone ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-background'}`}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={isDone}
                  aria-label={isDone ? `Mark step ${i + 1} as not done` : `Mark step ${i + 1} as done`}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-bold transition-colors ${isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-primary/40 text-primary hover:bg-primary/10'}`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                <div className="min-w-0">
                  <h4 className={`text-sm font-bold leading-snug ${isDone ? 'text-muted-foreground line-through decoration-emerald-500/60' : 'text-foreground'}`}>{s.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                  {s.where && (
                    <div className="mt-2 space-y-1 rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-foreground/80">
                      {s.where.split(' · ').map((w) => <p key={w}><span className="font-semibold text-foreground">Where:</span> {w}</p>)}
                    </div>
                  )}
                  {s.link && (
                    <a href={safeLink(s.link.href)} target={s.link.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                      {s.link.label} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
          <li className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-foreground"><strong className="text-primary">Tip: </strong>{m.tip}</li>
        </ol>

        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/40 px-6 py-4 print:hidden">
          <a href={waLink(`Hello Tech Guardians, I need help with: ${m.title}`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"><MessageCircle className="h-4 w-4" /> Need help? Ask us</a>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"><Printer className="h-4 w-4" /> Print</button>
          {done.length > 0 && <button type="button" onClick={() => setDone([])} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><RotateCcw className="h-4 w-4" /> Reset</button>}
          {pct === 100 && <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><Check className="h-4 w-4" /> All done — well protected!</span>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SecurityModulesSection = () => {
  const [open, setOpen] = useState<Module | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const refresh = () => setProgress(Object.fromEntries(MODULES.map((m) => [m.id, loadDone(m.id).length])));
  useEffect(refresh, []);

  return (
    <section id="security-modules" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <span className="mb-4 block font-display text-xs uppercase tracking-[0.3em] text-primary">Security Modules</span>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Your Digital <span className="neon-text text-primary">Defense Kit</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Four simple, step-by-step guides. Open one, follow the steps and tick them off — your progress is saved on this device.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m, i) => {
            const n = progress[m.id] || 0;
            return (
              <ScrollReveal key={m.id} delay={i * 0.08} className="h-full">
                <motion.button
                  type="button"
                  onClick={() => setOpen(m)}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="glass-card group flex h-full w-full flex-col p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-haspopup="dialog"
                >
                  <span className={`mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${m.tone} text-white shadow-lg`}><m.icon className="h-7 w-7" /></span>
                  <h3 className="mb-2 font-display text-base font-bold text-foreground">{m.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                  <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> {m.steps.length} steps</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.time}</span>
                  </div>
                  {n > 0 && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(n / m.steps.length) * 100}%` }} /></div>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {n > 0 ? `Continue (${n}/${m.steps.length})` : 'View step-by-step guide'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
      {open && <Guide module={open} onClose={() => { setOpen(null); refresh(); }} />}
    </section>
  );
};

export default SecurityModulesSection;
