import ScrollReveal from './ScrollReveal';
import { CheckCircle2 } from 'lucide-react';

const badges = [
  'Expert-Led Sessions',
  'Free Awareness for All',
  'Certified Curriculum',
  'Real-World Practical Labs',
  '1-on-1 Mentoring',
  'Trusted by Schools & Colleges',
  'Government Cybercrime Awareness Aligned',
];

const TrustSection = () => (
  <section className="section-padding relative">
    <div className="container mx-auto max-w-4xl">
      <ScrollReveal>
        <div className="text-center mb-12">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">Trust</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Why Trust <span className="neon-text text-primary">Tech Guardians</span>?
          </h2>
          <p className="text-muted-foreground text-sm mt-4">Trusted by Students Across India</p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="glass-card p-8 md:p-10 neon-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyber-green flex-shrink-0" />
                <span className="text-sm text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default TrustSection;
