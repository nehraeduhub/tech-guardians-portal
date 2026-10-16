import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const CyberCrimeBanner = () => (
  <section className="py-6 px-4">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <Link
          to="/cyber-crime-support"
          className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border-2 border-red-500/60 bg-red-500/10 px-6 py-5 transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/80 hover:shadow-[0_8px_30px_hsl(0_80%_50%/0.15)] active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-red-500">
                🚨 Victim of Cyber Crime? Get Immediate Support
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Tech Guardians will help you report, recover, and protect yourself. Click here for expert assistance.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-display font-semibold tracking-wider uppercase text-white group-hover:bg-red-700 transition-colors">
            Get Help Now →
          </span>
        </Link>
      </ScrollReveal>
    </div>
  </section>
);

export default CyberCrimeBanner;
