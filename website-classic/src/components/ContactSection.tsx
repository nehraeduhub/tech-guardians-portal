import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Clock, Globe, Mail, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { waLink } from '@/lib/site-settings';
import { telegramLink, useChat } from '@/lib/chat-settings';

const EMAIL = 'ittechguardians@gmail.com';

/** "Talk to Tech Guardians": compact contact card; the message form opens on demand. */
const ContactSection = () => {
  const chat = useChat();
  const tg = telegramLink(chat);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(waLink(`Hi Tech Guardians,\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nMessage: ${form.message}`), '_blank');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60';

  return (
    <section id="contact" className="relative px-4 py-14 md:px-8">
      <div className="container mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_hsl(var(--foreground)/0.05),0_24px_50px_-32px_hsl(var(--primary)/0.45)]">
          <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:items-center md:p-8">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">Contact us</p>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">Talk to <span className="text-primary">Tech Guardians</span></h2>
              <p className="mt-2 text-sm text-muted-foreground">Training, awareness sessions, products or help after a cyber crime — we usually reply within a few hours.</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Verified experts</li>
                <li className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> Fast response</li>
                <li className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" /> Online &amp; on-site</li>
              </ul>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <a href={waLink('Hello Tech Guardians, I would like to talk to you.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:brightness-105"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              {tg
                ? <a href={tg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-4 py-2.5 text-sm font-bold text-white hover:brightness-105"><Send className="h-4 w-4" /> Telegram</a>
                : <a href={`mailto:${EMAIL}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary"><Mail className="h-4 w-4" /> Email us</a>}
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 sm:col-span-2 md:col-span-1 lg:col-span-2"
              >
                {open ? 'Hide the form' : 'Send us a message'} <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div id="contact-form" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <form onSubmit={handleSubmit} className="grid gap-3 border-t border-border bg-muted/30 p-6 sm:grid-cols-2 md:p-8">
                  <input type="text" aria-label="Your name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} className={inputClass} />
                  <input type="email" aria-label="Email address" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} className={inputClass} />
                  <input type="tel" aria-label="Phone number" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} className={`${inputClass} sm:col-span-2`} />
                  <textarea aria-label="Message" placeholder="Describe your requirement or incident" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={1000} className={`${inputClass} resize-none sm:col-span-2`} />
                  <button type="submit" className="cyber-btn-primary sm:col-span-2"><Send className="h-4 w-4" /> Send via WhatsApp</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
