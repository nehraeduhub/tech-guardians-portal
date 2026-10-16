import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getFeaturedVideo, waLink } from '@/lib/site-settings';

const SocialHackingVideoSection = () => {
  const [active, setActive] = useState(false);
  const [training, setTraining] = useState(getFeaturedVideo);

  useEffect(() => {
    const refresh = () => {
      setTraining(getFeaturedVideo());
      setActive(false);
    };
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  return (
    <section id="videos" className="section-padding relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-cyber-green/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Featured Training
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
               {training.title}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-2xl mx-auto">
               {training.tagline}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ rotateX: -3, rotateY: 3, scale: 1.01 }}
            style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
            className="relative group"
          >
            {/* Glow ring */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 via-cyber-green/30 to-primary/40 blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Card */}
            <div
              className="relative rounded-2xl overflow-hidden border border-primary/40 bg-card/70 backdrop-blur-md shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.55)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* 3D depth corners */}
              <div className="pointer-events-none absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyber-green/70 rounded-tl-2xl" />
              <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyber-green/70 rounded-tr-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/70 rounded-bl-2xl" />
              <div className="pointer-events-none absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/70 rounded-br-2xl" />

              <div className="relative aspect-video">
                {active ? (
                  <iframe
                     src={`https://www.youtube.com/embed/${training.id}?autoplay=1&rel=0`}
                     title={training.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActive(true)}
                    className="absolute inset-0 w-full h-full group/play"
                     aria-label={`Play ${training.title}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <img
                       src={`https://i.ytimg.com/vi/${training.id}/maxresdefault.jpg`}
                      onError={(e) => {
                         (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${training.id}/hqdefault.jpg`;
                      }}
                       alt={training.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/play:scale-[1.04]"
                      loading="lazy"
                    />

                    {/* Scanline overlay */}
                    <div
                      className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, hsl(var(--primary)/0.25) 0 1px, transparent 1px 4px)',
                      }}
                    />

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

                    {/* Floating 3D play button */}
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ transform: 'translateZ(60px)' }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-cyber-red blur-2xl opacity-70 scale-125" />
                        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[hsl(var(--cyber-red,0_82%_61%))] to-[hsl(var(--cyber-red,0_82%_45%))] flex items-center justify-center shadow-[0_20px_60px_-10px_hsl(var(--cyber-red,0_82%_61%)/0.7)] ring-4 ring-white/20 group-hover/play:scale-110 transition-transform duration-300">
                          <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1.5" />
                        </div>
                        {/* Pulse rings */}
                        <span className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                      </div>
                    </motion.div>

                    {/* Bottom HUD label */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-red/15 border border-cyber-red/40 text-[10px] tracking-[0.25em] uppercase text-cyber-red font-display mb-3">
                        <ShieldAlert className="w-3 h-3" /> Live Demo
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                         {training.title}
                      </h3>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-10 flex justify-center">
            <a
              href={waLink('Hi Tech Guardians, I want to enrol in the Social Media Ethical Hacking training.')}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-btn group inline-flex items-center gap-2 px-8 py-3 text-sm tracking-[0.2em] uppercase font-display"
            >
              Enroll Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default SocialHackingVideoSection;
