import { waLink } from '@/lib/site-settings';
import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import { Star, MessageCircle } from 'lucide-react';

const testimonials = [
  { name: 'Priya Mehta', role: 'B.Tech Student, Mumbai', text: 'The practical hacking sessions were incredible. I learned more in one weekend than months of theory.', rating: 5 },
  { name: 'Rajesh Kumar', role: 'School Principal, Delhi', text: 'Tech Guardians conducted a brilliant awareness session for our students. Eye-opening and perfectly delivered.', rating: 5 },
  { name: 'Sneha Patil', role: 'Startup Founder, Pune', text: 'They built our AI agent and website flawlessly — professional, fast, and with great communication throughout.', rating: 5 },
];

const glowColors: ('blue' | 'green' | 'purple')[] = ['blue', 'green', 'purple'];

const TestimonialsSection = () => (
  <section className="section-padding relative">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">Testimonials</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Trusted by Students <span className="neon-text-green text-cyber-green">Across India</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <ScrollReveal key={t.name} delay={i * 0.1}>
            <GlassCard glowColor={glowColors[i]} className="h-full light-sweep">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[hsl(var(--cyber-orange))] text-[hsl(var(--cyber-orange))]" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-display text-xs font-bold text-primary">{t.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>

      {/* WhatsApp floating button */}
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyber-green flex items-center justify-center shadow-lg shadow-cyber-green/30 hover:shadow-cyber-green/50 transition-shadow hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-background" />
      </a>
    </div>
  </section>
);

export default TestimonialsSection;
