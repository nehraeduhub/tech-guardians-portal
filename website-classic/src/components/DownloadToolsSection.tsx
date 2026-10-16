import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { Shield, Smartphone, Lock, Fingerprint, Download } from 'lucide-react';

const tools = [
  {
    name: 'M-Kavach 2',
    desc: 'Official mobile security app by C-DAC India. Anti-malware, call blocking, and device security.',
    icon: Shield,
    url: 'https://play.google.com/store/apps/details?id=org.cdac.mkavach',
  },
  {
    name: 'eScan CERT-In',
    desc: 'Botnet scanning and cleaning tool recommended by CERT-In for Indian users.',
    icon: Smartphone,
    url: 'https://play.google.com/store/apps/details?id=com.eScanAV.certin',
  },
  {
    name: 'Avast Mobile Security',
    desc: 'Free antivirus, VPN, app lock, and Wi-Fi scanner for Android devices.',
    icon: Lock,
    url: 'https://play.google.com/store/apps/details?id=com.avast.android.mobilesecurity',
  },
  {
    name: 'Google Authenticator',
    desc: 'Generate 2FA verification codes for all your accounts — offline and secure.',
    icon: Fingerprint,
    url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
  },
];

const DownloadToolsSection = () => (
  <section id="tools" className="section-padding relative">
    <div className="container mx-auto max-w-5xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">Recommended</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Security <span className="neon-text-green text-cyber-green">Tools</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {tools.map((tool, i) => (
          <ScrollReveal key={tool.name} delay={i * 0.08}>
            <motion.div
              className="glass-card light-sweep p-6 flex items-start gap-4 h-full transition-all duration-500 hover:border-cyber-green/40 hover:shadow-[0_0_25px_hsl(160_100%_50%/0.15)]"
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-cyber-green/10 flex-shrink-0 flex items-center justify-center">
                <tool.icon className="w-6 h-6 text-cyber-green" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-semibold mb-1 text-foreground">{tool.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-display tracking-wider uppercase text-cyber-green hover:text-primary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Now
                </a>
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default DownloadToolsSection;
