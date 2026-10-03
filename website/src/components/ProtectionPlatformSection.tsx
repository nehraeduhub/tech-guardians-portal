import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Ban, DatabaseZap, ScanLine, Lock, Fish, Globe, Baby, Filter } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import GlobeScene from './GlobeScene';
import identityImg from '@/assets/Identity_you_can_trust.png.asset.json';
import breachImg from '@/assets/Know_the_moment.png.asset.json';
import antivirusImg from '@/assets/AI_powered_protection.png.asset.json';
import vpnImg from '@/assets/Private_by_default.png.asset.json';
import phishingImg from '@/assets/Phising_link.png.asset.json';
import browserImg from '@/assets/A_safer_browser.png.asset.json';
import parentalImg from '@/assets/peace_of_mind.png.asset.json';
import filteringImg from '@/assets/cleaner_safe_web.png.asset.json';

const pillars = [
  {
    key: 'identity',
    label: 'Identity Protection',
    icon: ShieldCheck,
    image: identityImg.url,
    title: 'Identity you can trust',
    body: 'Continuous monitoring of your personal data across the surface, deep, and dark web — with instant alerts when your identity is at risk.',
  },
  {
    key: 'anti_scam',
    label: 'Anti-Scam',
    icon: Ban,
    image: null,
    title: 'Stop scams before they land',
    body: 'AI-driven scam detection filters out fraudulent calls, messages, and websites the moment they reach your device.',
  },
  {
    key: 'data_breach',
    label: 'Data Breach Protection',
    icon: DatabaseZap,
    image: breachImg.url,
    title: 'Know the moment you are exposed',
    body: 'Real-time breach intelligence tells you exactly what leaked, where, and what to do next — with guided remediation.',
  },
  {
    key: 'antivirus',
    label: 'Next-Gen Antivirus',
    icon: ScanLine,
    image: antivirusImg.url,
    title: 'AI-powered protection',
    body: 'Old antivirus no longer cuts it. Get EDR-grade security and know you are protected from malware, even if you are patient zero.',
  },
  {
    key: 'vpn',
    label: 'VPN',
    icon: Lock,
    image: vpnImg.url,
    title: 'Private by default',
    body: 'A fast, no-log VPN that shields your browsing, banking, and communications on any network you connect to.',
  },
  {
    key: 'phishing',
    label: 'Anti-Phishing',
    icon: Fish,
    image: phishingImg.url,
    title: 'Phishing links blocked in real time',
    body: 'Zero-hour phishing intelligence blocks malicious links across email, chat, and social — before you can even click.',
  },
  {
    key: 'browser',
    label: 'Browser Protection',
    icon: Globe,
    image: browserImg.url,
    title: 'A safer browser experience',
    body: 'Isolates risky pages, blocks trackers, and hardens your browser against exploits and drive-by downloads.',
  },
  {
    key: 'parental',
    label: 'Parental Control',
    icon: Baby,
    image: parentalImg.url,
    title: 'Peace of mind for families',
    body: 'Age-appropriate content controls, screen-time management, and location awareness — designed with parents, for kids.',
  },
  {
    key: 'filtering',
    label: 'Web Filtering',
    icon: Filter,
    image: filteringImg.url,
    title: 'Cleaner, safer web access',
    body: 'Category-based filtering for homes, schools, and small businesses — blocks unsafe or unwanted content by policy.',
  },
];

const ProtectionPlatformSection = () => {
  const [active, setActive] = useState(pillars[3].key);
  const current = pillars.find((p) => p.key === active) ?? pillars[0];
  const Icon = current.icon;

  return (
    <section className="section-padding relative overflow-hidden">
      <GlobeScene />
      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="rl-pill mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Online Security Platform
            </span>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-foreground" style={{ textWrap: 'balance' }}>
              Protect what matters most with the <br className="hidden md:block" />
              <span className="italic text-primary">Online Security Platform.</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-5 gap-6 md:gap-10 items-start">
          <div className="md:col-span-2">
            <div className="flex flex-col border-l-2 border-primary/20">
              {pillars.map((p) => {
                const isActive = p.key === active;
                return (
                  <button
                    key={p.key}
                    onClick={() => setActive(p.key)}
                    className={`relative w-full text-left pl-8 pr-4 py-3 text-[15px] transition-colors ${
                      isActive ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="pillar-active"
                        className="absolute -left-[2px] top-0 bottom-0 w-[6px] rounded-r bg-primary"
                      />
                    )}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="glass-card w-full px-4 md:px-8 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center gap-6"
                >
                  <div className="w-full rounded-xl overflow-hidden border border-primary/20 bg-background/40">
                    {current.image ? (
                      <img
                        src={current.image}
                        alt={current.title}
                        loading="lazy"
                        className="w-full h-auto block object-contain"
                      />
                    ) : (
                      <div className="aspect-[100/65] flex items-center justify-center">
                        <Icon className="w-24 h-24 text-primary" strokeWidth={1.4} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 max-w-md">
                    <div className="text-lg md:text-xl font-semibold text-foreground">{current.title}</div>
                    <div className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">{current.body}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtectionPlatformSection;
