import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { Zap } from 'lucide-react';

const EnrollSection = () => {
  const handleEnroll = () => {
    const subject = encodeURIComponent('Enroll in Cyber Security Training');
    const body = encodeURIComponent('Hi Tech Guardians,\n\nI would like to enroll in your cybersecurity training program.\n\nPlease share the details.\n\nThank you.');
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=ittechguardians@gmail.com&su=${subject}&body=${body}`, '_self');
  };

  return (
    <section id="enroll" className="py-20 md:py-28 px-4 md:px-8 relative">
      {/* Glow backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-destructive/5 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-3xl relative z-10">
        <ScrollReveal>
          <div className="glass-card p-10 md:p-16 text-center neon-border-red">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
                <Zap className="w-8 h-8 text-destructive" />
              </div>

              <h2 className="font-display text-2xl md:text-4xl font-bold mb-4" style={{ textWrap: 'balance' }}>
                Want Practical Cyber Security Skills?
              </h2>

              <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto mb-8" style={{ textWrap: 'pretty' }}>
                Join our hands-on training program. Learn ethical hacking, network security, AI agents, and more from industry experts.
              </p>

              <motion.button
                onClick={handleEnroll}
                className="cyber-btn-red text-lg px-12 py-4 animate-pulse-red"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                👉 Enroll Now
              </motion.button>

              <p className="text-xs text-muted-foreground mt-4">
                Or email us directly at{' '}
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ittechguardians@gmail.com" className="text-primary hover:underline">
                  ittechguardians@gmail.com
                </a>
              </p>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EnrollSection;
