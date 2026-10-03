import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import { Globe, Monitor, BookOpen } from 'lucide-react';
import handsOnImg from '@/assets/hands-on-practical.jpg';
import awarenessImg from '@/assets/pillar-awareness.jpg';
import pdfLibImg from '@/assets/pillar-pdf-library.jpg';

const features = [
  {
    icon: Globe,
    title: 'Free Online Awareness Sessions',
    description: 'We conduct free cybersecurity awareness sessions on platforms such as Google Meet and Zoom — open to everyone. Learn about cyber threats, online safety, and digital hygiene from industry experts.',
    glow: 'blue' as const,
    image: awarenessImg,
    link: '/#contact',
  },
  {
    icon: Monitor,
    title: 'Hands-On Practical Classes',
    description: 'Weekend practical batches covering Networking, Ethical Hacking, Cyber Forensics, Cybercrime Investigation, and more. Real tools, real labs, real skills.',
    glow: 'green' as const,
    image: handsOnImg,
    link: '/#courses',
  },
  {
    icon: BookOpen,
    title: 'PDF Library + Live 1-on-1 Classes',
    description: 'Access our curated PDF library covering all cybersecurity domains. Combine it with live one-on-one video sessions for personalised mentoring.',
    glow: 'purple' as const,
    image: pdfLibImg,
    link: '/#pdf-library',
  },
];

const FeaturesSection = () => (
  <section id="programs" className="section-padding relative">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">Core Programs</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            3 Pillars of <span className="neon-text-green text-cyber-green">Cyber Education</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <ScrollReveal key={f.title} delay={i * 0.1}>
            <a href={f.link} className="block h-full">
              <GlassCard glowColor={f.glow} className="h-full cursor-pointer hover:border-primary/40 transition-colors">
                <div className="mb-5 overflow-hidden rounded-xl border border-border/60">
                  <img src={f.image} alt={f.title} className="aspect-[3/2] w-full object-cover" loading="lazy" width={960} height={640} />
                </div>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 ${
                  f.glow === 'blue' ? 'bg-primary/10' : f.glow === 'green' ? 'bg-cyber-green/10' : 'bg-cyber-purple/10'
                }`}>
                  <f.icon className={`w-6 h-6 ${
                    f.glow === 'blue' ? 'text-primary' : f.glow === 'green' ? 'text-cyber-green' : 'text-cyber-purple'
                  }`} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-3 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </GlassCard>
            </a>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
