import ScrollReveal from './ScrollReveal';

const AboutSection = () => (
  <section id="about" className="section-padding relative">
    <div className="container mx-auto max-w-5xl">
      <ScrollReveal>
        <div className="text-center">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">About Us</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6" style={{ textWrap: 'balance' }}>
            About <span className="neon-text text-primary">Tech Guardians</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed" style={{ textWrap: 'pretty' }}>
            Tech Guardians is a cybersecurity awareness and education organization dedicated to making India digitally safe.
            We provide free online awareness sessions, hands-on practical training, and a rich PDF library — all designed
            to build real-world cyber skills.
          </p>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default AboutSection;
