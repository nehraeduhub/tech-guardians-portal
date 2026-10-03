import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { ShieldAlert, Phone, AlertTriangle, FileWarning, CreditCard, Building2 } from 'lucide-react';

const trustItems = [
  { icon: ShieldAlert, title: 'CERT-In Awareness', desc: 'Indian Computer Emergency Response Team — official guidelines for cyber threats & vulnerability disclosure.' },
  { icon: Building2, title: 'Cyber Swachhta Kendra', desc: 'Botnet cleaning and malware analysis centre backed by MeitY for a secure Indian cyberspace.' },
  { icon: Phone, title: 'Helpline: 1930', desc: 'National Cybercrime Helpline — report financial fraud and cyber crime immediately for quick action.' },
];

const scamAlerts = [
  { icon: CreditCard, title: 'OTP Fraud', desc: 'Never share OTP with anyone. Banks will never call asking for OTP or PIN.' },
  { icon: FileWarning, title: 'KYC Scams', desc: 'Fake KYC update messages trick you into sharing Aadhaar/PAN details. Always verify via official apps.' },
  { icon: AlertTriangle, title: 'Loan App Scams', desc: 'Predatory loan apps steal contacts & photos. Only use RBI-registered lending platforms.' },
];

const IndianCyberSection = () => (
  <section id="india-cyber" className="section-padding relative">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-[hsl(var(--cyber-orange))] mb-4 block">India Cyber Awareness</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Protecting <span className="neon-text-orange text-[hsl(var(--cyber-orange))]">Digital India</span>
          </h2>
        </div>
      </ScrollReveal>

      {/* Trust builders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {trustItems.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 0.08}>
            <motion.div
              className="glass-card p-6 h-full light-sweep transition-all duration-500 hover:border-[hsl(var(--cyber-orange)/0.4)] hover:shadow-[0_0_30px_hsl(33_100%_55%/0.15)]"
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--cyber-orange)/0.1)] flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-[hsl(var(--cyber-orange))]" />
              </div>
              <h3 className="font-display text-sm font-semibold mb-2 text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>

      {/* Scam Alerts */}
      <ScrollReveal delay={0.15}>
        <div className="mb-8 text-center">
          <h3 className="font-display text-xl font-bold text-destructive neon-text-red">⚠ Active Scam Alerts</h3>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scamAlerts.map((alert, i) => (
          <ScrollReveal key={alert.title} delay={0.2 + i * 0.08}>
            <motion.div
              className="glass-card p-6 h-full border-destructive/20 hover:border-destructive/50 transition-all duration-500 hover:shadow-[0_0_25px_hsl(0_100%_62%/0.15)]"
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <alert.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-display text-sm font-semibold mb-2 text-destructive">{alert.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{alert.desc}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default IndianCyberSection;
