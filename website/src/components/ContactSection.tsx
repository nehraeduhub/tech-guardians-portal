import { waLink } from "@/lib/site-settings";
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { Send, MessageCircle, ShieldCheck, Clock, Globe } from 'lucide-react';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const contactLink = waLink();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(waLink(`Hi Tech Guardians,\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nMessage: ${form.message}`), '_blank');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  const inputClass =
    'w-full bg-background/70 border border-primary/20 rounded-lg px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all';

  return (
    <section id="contact" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">Secure Channel</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Talk to <span className="neon-text text-primary">Tech Guardians</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-3">Keep Learning and Keep Sharing — we usually reply within a few hours.</p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <ScrollReveal delay={0.1}>
            <div className="lg:col-span-2 flex flex-col gap-4">
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

          <ScrollReveal delay={0.15}>
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-primary/25 bg-card/70 backdrop-blur overflow-hidden shadow-[0_0_70px_-30px_hsl(var(--primary))]">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/20 bg-primary/5">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-orange/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/70" />
                  <span className="ml-3 text-[11px] font-mono tracking-widest uppercase text-primary/80">secure-contact.sh</span>
                </div>
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} className={inputClass} />
                    <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} className={inputClass} />
                  </div>
                  <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} className={inputClass} />
                  <textarea placeholder="Describe your requirement or incident" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={1000} className={`${inputClass} resize-none`} />
                  <button type="submit" className="cyber-btn-primary w-full flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Securely via WhatsApp
                  </button>
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* WhatsApp floating button */}
        <a
          href={contactLink}
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
};

export default ContactSection;
