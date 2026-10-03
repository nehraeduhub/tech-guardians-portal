import { waLink } from "@/lib/site-settings";
import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { Send, User, Phone, Mail, MessageSquare, ShieldCheck, Clock, Globe } from 'lucide-react';

const EnrollFormSection = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [focused, setFocused] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(waLink(`Hi Tech Guardians,\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nMessage: ${form.message}`), '_blank');
    setForm({ name: '', phone: '', email: '', message: '' });
  };

  const inputClass = (field: string) =>
    `w-full bg-muted/30 border rounded-lg px-4 py-3.5 pl-11 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 outline-none ${
      focused === field
        ? 'border-primary/60 ring-2 ring-primary/20 bg-muted/50'
        : 'border-border hover:border-primary/30'
    }`;

  return (
    <section id="contact" className="section-padding relative">
      <div className="container mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">Secure Channel</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              <span className="neon-text text-primary">Contact</span> Us
            </h2>
            <p className="text-sm text-muted-foreground mt-3">Keep Learning and Keep Sharing — our team replies within a few hours.</p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-2">
            <ScrollReveal delay={0.05}>
            <div className="flex flex-col gap-4">
              {[
                { icon: ShieldCheck, title: 'Verified Experts', desc: 'Certified trainers in security, forensics and awareness.' },
                { icon: Clock, title: 'Fast Response', desc: 'Priority handling for active cyber-fraud incidents.' },
                { icon: Globe, title: 'Online & On-site', desc: 'Sessions and support anywhere across India.' },
              ].map((i) => (
                <div key={i.title} className="glass-card p-5 flex gap-4">
                  <i.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{i.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{i.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            </ScrollReveal>
          </div>

        <div className="lg:col-span-3">
        <ScrollReveal delay={0.1}>
          <div className="rounded-2xl border border-primary/25 bg-card/70 backdrop-blur overflow-hidden shadow-[0_0_70px_-30px_hsl(var(--primary))]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/20 bg-primary/5">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-orange/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/70" />
              <span className="ml-3 text-[11px] font-mono tracking-widest uppercase text-primary/80">secure-contact.sh</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-8 md:p-10">
              {/* Name */}
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  required
                  maxLength={100}
                  className={inputClass('name')}
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused('')}
                    required
                    maxLength={20}
                    className={inputClass('phone')}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    required
                    maxLength={255}
                    className={inputClass('email')}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <textarea
                  placeholder="Your Message (optional)"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused('')}
                  maxLength={1000}
                  className={`${inputClass('message')} resize-none`}
                />
              </div>

              <motion.button
                type="submit"
                className="cyber-btn-primary w-full flex items-center justify-center gap-2 py-4"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                <Send className="w-4 h-4" />
                Send Message
              </motion.button>
            </form>
          </div>
        </ScrollReveal>
        </div>
        </div>
      </div>
    </section>
  );
};

export default EnrollFormSection;
