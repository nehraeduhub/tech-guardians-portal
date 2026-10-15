import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Settings2, ShieldCheck, Users } from 'lucide-react';
import { useHomeContent } from '@/lib/home-content';
import HomeHeroVisual from './pro/HomeHeroVisual';
import SmartLink from './pro/SmartLink';

const POINT_ICONS = [BookOpen, Settings2, ShieldCheck, Users];

const HeroSection = () => {
  const home = useHomeContent();
  const points = home.heroPoints.split('|').map((p) => p.trim()).filter(Boolean).slice(0, 4);
  return (
    <section id="home" className="tg-dark tg-band relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(hsl(216_100%_60%/.07)_1px,transparent_1px),linear-gradient(90deg,hsl(216_100%_60%/.07)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_40%,#000_25%,transparent_75%)]" />
      <div className="tg-container relative grid items-center gap-6 pb-12 pt-10 md:pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-4 lg:pb-16">
        <div className="relative z-10">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-300 md:text-xs">
            {home.heroBadge}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.05 }}
            className="mt-5 text-[2.75rem] font-extrabold leading-[1.02] text-white sm:text-6xl xl:text-[4.25rem]" style={{ textWrap: 'balance' }}>
            {home.heroTitle}
            <span className="block bg-gradient-to-r from-[#3b8bff] via-[#2f7bff] to-[#5aa9ff] bg-clip-text pb-2 text-transparent">{home.heroTitleAccent}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.12 }}
            className="mt-4 max-w-xl text-lg leading-relaxed text-slate-200 md:text-xl">
            {home.heroText}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }} className="mt-8 flex flex-wrap gap-3">
            <SmartLink item={{ href: home.heroPrimaryLink || '/training' }} className="tg-btn-primary !px-6 !py-3.5 !text-base"><GraduationCap className="h-5 w-5" />{home.heroPrimaryText}<ArrowRight className="h-4 w-4" /></SmartLink>
            <SmartLink item={{ href: home.heroSecondaryLink || '/products' }} className="tg-btn-outline !border-white/50 !px-6 !py-3.5 !text-base !text-white">{home.heroSecondaryText}</SmartLink>
          </motion.div>
          {points.length > 0 && (
            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.6 }} className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
              {points.map((p, i) => {
                const Icon = POINT_ICONS[i] || CheckCircle2;
                return <li key={p} className="inline-flex items-center gap-2"><Icon className="h-[18px] w-[18px] text-[#34d399]" />{p}</li>;
              })}
            </motion.ul>
          )}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative">
          <HomeHeroVisual />
          <p aria-hidden className="pointer-events-none absolute -bottom-2 right-0 hidden -rotate-12 font-['Caveat',cursive] text-3xl leading-8 text-white/90 lg:block">
            Keep Learning<br />&nbsp;&nbsp;Keep Sharing
            <span className="mt-1 block h-1 w-40 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-emerald-300" />
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
