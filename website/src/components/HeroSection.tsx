import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint, Activity } from 'lucide-react';
import HeroScene from './HeroScene';
import { useHomeContent } from '@/lib/home-content';

const HeroSection = () => {
  const home = useHomeContent();
  return (
    <section id="home" className="relative overflow-hidden">
      {/* Soft brand gradient wash */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[720px] h-[720px] rounded-full blur-3xl opacity-60"
          style={{ background: 'radial-gradient(circle, hsl(190 100% 50% / 0.18) 0%, transparent 65%)' }} />
        <div className="absolute -bottom-32 -left-32 w-[620px] h-[620px] rounded-full blur-3xl opacity-60"
          style={{ background: 'radial-gradient(circle, hsl(158 100% 50% / 0.14) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 opacity-45"><HeroScene /></div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 md:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="rl-pill"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {home.heroBadge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] text-foreground"
              style={{ textWrap: 'balance' }}
            >
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(100deg, hsl(190 100% 62%) 0%, hsl(158 100% 55%) 45%, hsl(280 90% 72%) 100%)' }}>
                {home.heroTitle}
              </span>
              <br className="hidden sm:block" />
              <span className="italic" style={{ color: 'hsl(35 100% 60%)' }}>{home.heroTitleAccent}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              {home.heroText}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> ISO-aligned practices</span>
              <span className="flex items-center gap-2"><Fingerprint className="w-4 h-4 text-primary" /> Privacy-first</span>
              <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> 24×7 threat intel</span>
            </motion.div>
          </div>

          {/* Right: visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-primary/30 bg-card shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.45)]">
              <img
                src={home.heroImage}
                alt="Tech Guardians cyber security awareness and training team"
                className="absolute inset-0 h-full w-full object-contain"
                loading="eager"
              />
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
