import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import { Shield } from 'lucide-react';
import founderDkJha from '@/assets/founder-dk-jha.jpg';
import founderRjNehra from '@/assets/founder-rj-nehra.jpg';

const founders = [
  {
    name: 'D K Jha',
    role: 'Founder',
    photo: founderDkJha,
    description: 'A visionary leader and cybersecurity expert, D K Jha founded Tech Guardians with a mission to make cybersecurity education accessible to every Indian. He is a passionate technologist and educator.',
  },
  {
    name: 'RJ Nehra',
    role: 'Co-Founder',
    photo: founderRjNehra,
    description: 'Dedicated to building India\'s cyber-aware generation, RJ Nehra co-leads Tech Guardians with a focus on practical training, community outreach, and digital empowerment.',
  },
];

const FoundersSection = () => (
  <section id="founders" className="section-padding relative">
    <div className="container mx-auto max-w-4xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">Leadership</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Meet the <span className="neon-text text-primary">Guardians</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {founders.map((f, i) => (
          <ScrollReveal key={f.name} delay={i * 0.15}>
            <GlassCard glowColor={i === 0 ? 'blue' : 'purple'} className="text-center">
              <div className="relative w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden border-2 border-primary/30">
                <img
                  src={f.photo}
                  alt={f.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={512}
                  height={512}
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{f.name}</h3>
              <p className="text-xs font-display tracking-wider uppercase text-primary mb-4">{f.role} — Tech Guardians</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default FoundersSection;
