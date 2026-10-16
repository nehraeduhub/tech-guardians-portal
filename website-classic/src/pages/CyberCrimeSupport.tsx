import { waLink } from '@/lib/site-settings';
import { useState } from 'react';
import { Send, ShieldAlert, Phone, AlertTriangle } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SiteFrame from '@/components/SiteFrame';

const CyberCrimeSupport = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    crimeType: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `🚨 Cyber Crime Support Request\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nType of Crime: ${form.crimeType}\nDescription: ${form.description}`;
    window.open(waLink(text), '_blank');
    setForm({ name: '', email: '', phone: '', crimeType: '', description: '' });
  };

  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl">
          {/* Emergency Banner */}
          <ScrollReveal>
            <div className="mb-10 rounded-xl border-2 border-red-500/60 bg-red-500/10 p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 mb-4">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-red-500 mb-3" style={{ lineHeight: 1.1 }}>
                Cyber Crime Support
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Have you been a victim of online fraud, hacking, identity theft, or any cyber crime?
                <strong className="text-foreground"> Tech Guardians is here to help.</strong> Our experts will guide you through the process of reporting, recovering, and protecting yourself.
              </p>
            </div>
          </ScrollReveal>

          {/* How we help */}
          <ScrollReveal delay={0.08}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {[
                { icon: AlertTriangle, title: 'Report & Guidance', desc: 'We help you report the incident to the correct authorities and guide you step by step.' },
                { icon: ShieldAlert, title: 'Recovery Assistance', desc: 'Our team assists with account recovery, data protection, and damage control.' },
                { icon: Phone, title: 'Direct Expert Support', desc: 'Connect directly with our cybersecurity professionals via WhatsApp for immediate help.' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-red-500/30 bg-card/60 p-5 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 mb-3">
                    <item.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal delay={0.14}>
            <form onSubmit={handleSubmit} className="rounded-xl border-2 border-red-500/40 bg-card/60 p-8 space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground text-center mb-2">
                Fill the Form — We Will Contact You Immediately
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  maxLength={255}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  maxLength={20}
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
                <select
                  value={form.crimeType}
                  onChange={(e) => setForm({ ...form, crimeType: e.target.value })}
                  required
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                >
                  <option value="">Select Crime Type</option>
                  <option value="Online Fraud / Scam">Online Fraud / Scam</option>
                  <option value="Hacking / Unauthorised Access">Hacking / Unauthorised Access</option>
                  <option value="Identity Theft">Identity Theft</option>
                  <option value="Cyberbullying / Harassment">Cyberbullying / Harassment</option>
                  <option value="Social Media Account Hacked">Social Media Account Hacked</option>
                  <option value="Financial Fraud (UPI/Banking)">Financial Fraud (UPI/Banking)</option>
                  <option value="Data Breach / Privacy Violation">Data Breach / Privacy Violation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <textarea
                placeholder="Describe what happened — share as much detail as you can so we can help you effectively."
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                maxLength={2000}
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all resize-none"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-display text-sm font-semibold tracking-wider uppercase px-6 py-3.5 transition-colors active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Send via WhatsApp
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Your information is safe with us. We will never share your details without your consent.
              </p>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </SiteFrame>
  );
};

export default CyberCrimeSupport;
