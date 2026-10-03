import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import { courseVisuals } from '@/lib/site-content';
import { Globe, Shield, Server, Bot, Key, Smartphone, BookOpen, Skull, Search, Brain, HardDrive, Eye, Bug, Code, Database, Cpu, Network } from 'lucide-react';
import { isCoursesHomeVisible, loadManagedCourses, type ManagedCourse } from '@/lib/courses-store';

const iconMap: Record<string, React.ComponentType<any>> = {
  Globe, Shield, Server, Bot, Key, Smartphone, BookOpen, Skull, Search, Brain, HardDrive, Eye, Bug, Code, Database, Cpu, Network,
};

const base = (id: string, title: string, description: string, icon_name: string, page: string): ManagedCourse => ({
  id, title, description, icon_name, page, price: '', offer: '', showPrice: false, enabled: true,
});

const fallbackCourses: ManagedCourse[] = [
  base('web-server-hosting', 'Learn Web Server & Web Hosting', 'Master web server setup, domain management, and secure hosting from scratch.', 'Globe', '/courses/web-server-hosting.html'),
  base('ai-agent', 'Build Your First AI Agent', 'Create intelligent AI agents to automate tasks and power smart workflows.', 'Bot', '/courses/ai-agent.html'),
  base('social-android-hacking', 'Learn Social Media & Android Hacking', 'Explore social engineering, Android security testing, and mobile threat analysis.', 'Smartphone', '/courses/social-android-hacking.html'),
];

const glowColors: ('blue' | 'green' | 'purple')[] = ['blue', 'green', 'purple'];

const CoursesSection = () => {
  const [courses, setCourses] = useState<ManagedCourse[]>(fallbackCourses);
  const [visible, setVisible] = useState(() => isCoursesHomeVisible());
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const refresh = () => void loadManagedCourses().then(data => {
      const rows = data.filter(c => c.enabled && c.title.trim());
      setCourses(rows);
      setVisible(isCoursesHomeVisible());
    });
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <section id="courses" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-purple mb-4 block">Curriculum</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Hands-on Practical <span className="neon-text-purple text-cyber-purple">Classes</span>
            </h2>
          </div>
        </ScrollReveal>

        <div
          className="relative -mx-4 px-4"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div ref={scrollerRef} className="overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
            <div className="flex gap-6 pb-4 min-w-max">
          {courses.map((c, i) => {
            const Icon = iconMap[c.icon_name] || BookOpen;
            const glow = glowColors[i % 3];
            const glowVar = glow === 'blue' ? '--cyber-blue' : glow === 'green' ? '--cyber-green' : '--cyber-purple';
            return (
              <ScrollReveal key={c.id} delay={i * 0.05}>
                <a href={c.page} className="block h-full group w-[280px] sm:w-[320px] shrink-0 snap-start">
                  <GlassCard
                    glowColor={glow}
                    className="relative h-full p-0 overflow-hidden cursor-pointer border-border/40 group-hover:border-primary/50 transition-all duration-500"
                  >
                    <span className="pointer-events-none absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 rounded-tl-xl opacity-60 group-hover:opacity-100 transition-opacity" style={{ borderColor: `hsl(var(${glowVar}))` }} />
                    <span className="pointer-events-none absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 rounded-br-xl opacity-60 group-hover:opacity-100 transition-opacity" style={{ borderColor: `hsl(var(${glowVar}))` }} />

                    {courseVisuals[i] && (
                      <div className="relative overflow-hidden">
                        <img
                          src={courseVisuals[i]}
                          alt={`${c.title} training visual`}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          width={800}
                          height={500}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        <span
                          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-display tracking-[0.2em] uppercase backdrop-blur-md border"
                          style={{
                            background: `hsl(var(${glowVar}) / 0.12)`,
                            borderColor: `hsl(var(${glowVar}) / 0.4)`,
                            color: `hsl(var(${glowVar}))`,
                          }}
                        >
                          Live Course
                        </span>
                        <div
                          className="absolute -bottom-5 left-5 inline-flex items-center justify-center w-12 h-12 rounded-xl border backdrop-blur-md"
                          style={{
                            background: `hsl(var(${glowVar}) / 0.15)`,
                            borderColor: `hsl(var(${glowVar}) / 0.5)`,
                            boxShadow: `0 0 20px hsl(var(${glowVar}) / 0.35)`,
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: `hsl(var(${glowVar}))` }} />
                        </div>
                      </div>
                    )}

                    <div className="px-6 pt-8 pb-6">
                      <h3 className="font-display text-base font-semibold mb-2 text-foreground leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                        {c.description}
                      </p>
                      {c.showPrice && (c.offer || c.price) && (
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-lg font-display font-bold" style={{ color: `hsl(var(${glowVar}))` }}>
                            {c.offer || c.price}
                          </span>
                          {c.offer && c.price && (
                            <span className="text-xs text-muted-foreground line-through">{c.price}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground">
                          Hands-on • Mentor-led
                        </span>
                        <span
                          className="text-xs font-display tracking-wider uppercase inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{ color: `hsl(var(${glowVar}))` }}
                        >
                          Explore <span aria-hidden>→</span>
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </a>
              </ScrollReveal>
            );
          })}
            </div>
          </div>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Scroll courses right"
            className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center bg-card/95 border border-border shadow-lg text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 ${hovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">← Scroll to explore all courses →</p>
      </div>
    </section>
  );
};

export default CoursesSection;
