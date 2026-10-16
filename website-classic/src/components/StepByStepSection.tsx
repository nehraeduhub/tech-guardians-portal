import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { Smartphone, Shield, Lock, Eye, RefreshCw, Download, CheckCircle2 } from 'lucide-react';

const mobileSteps = [
  { icon: Lock, text: 'Enable screen lock & biometric authentication' },
  { icon: Download, text: 'Install apps only from official stores' },
  { icon: RefreshCw, text: 'Keep OS and apps updated regularly' },
  { icon: Eye, text: 'Review app permissions monthly' },
  { icon: Shield, text: 'Enable device encryption' },
];

const socialSteps = [
  { icon: Lock, text: 'Enable 2FA on all social accounts' },
  { icon: Eye, text: 'Set profiles to private by default' },
  { icon: Shield, text: 'Review connected third-party apps' },
  { icon: RefreshCw, text: 'Change passwords every 90 days' },
  { icon: CheckCircle2, text: 'Verify links before clicking' },
];

const TimelineCard = ({ title, icon: TitleIcon, steps, delay, color }: { title: string; icon: any; steps: typeof mobileSteps; delay: number; color: string }) => (
  <ScrollReveal delay={delay}>
    <div className="glass-card p-8 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'blue' ? 'bg-primary/10' : 'bg-cyber-green/10'}`}>
          <TitleIcon className={`w-6 h-6 ${color === 'blue' ? 'text-primary' : 'text-cyber-green'}`} />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.text}
            className="flex items-start gap-3 group"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: delay + i * 0.08, duration: 0.4 }}
          >
            <div className={`mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${color === 'blue' ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-cyber-green/10 group-hover:bg-cyber-green/20'} transition-colors`}>
              <step.icon className={`w-4 h-4 ${color === 'blue' ? 'text-primary' : 'text-cyber-green'}`} />
            </div>
            <div className="flex-1">
              <div className={`w-0.5 h-3 ${color === 'blue' ? 'bg-primary/20' : 'bg-cyber-green/20'} ml-3 -mt-3 mb-1 hidden first:hidden`} />
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </ScrollReveal>
);

const StepByStepSection = () => (
  <section id="guides" className="section-padding relative">
    <div className="container mx-auto max-w-5xl">
      <ScrollReveal>
        <div className="text-center mb-16">
          <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">Step-by-Step</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Security <span className="neon-text-green text-cyber-green">Guides</span>
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimelineCard title="Mobile Security" icon={Smartphone} steps={mobileSteps} delay={0.1} color="blue" />
        <TimelineCard title="Social Media Safety" icon={Shield} steps={socialSteps} delay={0.2} color="green" />
      </div>
    </div>
  </section>
);

export default StepByStepSection;
