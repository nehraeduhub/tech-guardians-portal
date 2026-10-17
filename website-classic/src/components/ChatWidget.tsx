import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { telegramLink, useChat, whatsappLink } from '@/lib/chat-settings';
import tgLogo from '@/assets/tg-logo.png';

/** Floating chat button on every page: WhatsApp and (when set) the Telegram bot. */
const ChatWidget = () => {
  const chat = useChat();
  const [open, setOpen] = useState(false);
  const tg = chat.telegram ? telegramLink(chat) : '';
  const wa = chat.whatsapp ? whatsappLink(chat) : '';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!chat.enabled || (!tg && !wa)) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            id="tg-chat-panel"
            role="dialog"
            aria-label="Chat with Tech Guardians"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-[300px] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[0_30px_70px_-25px_rgba(15,23,42,.55)]"
          >
            <div className="tg-dark tg-band flex items-center gap-3 px-4 py-3">
              <img src={tgLogo} alt="" className="h-9 w-9 rounded-lg bg-white/90 object-contain p-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Tech Guardians</p>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Usually replies within a few hours</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <p className="rounded-xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground">{chat.greeting}</p>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-semibold">Chat on WhatsApp</span><span className="block text-xs text-muted-foreground">Talk to our team</span></span>
                </a>
              )}
              {tg && (
                <a href={tg} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-sky-500/60 hover:bg-sky-500/5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#229ED9] text-white"><Send className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-semibold">Chat with our Telegram bot</span><span className="block text-xs text-muted-foreground">Instant answers, 24×7</span></span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="tg-chat-panel"
        aria-label={open ? 'Close chat' : 'Chat with Tech Guardians'}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_16px_36px_-12px_hsl(var(--primary))] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatWidget;
