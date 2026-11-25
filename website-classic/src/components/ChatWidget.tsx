import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { telegramLink, useChat, whatsappButtons } from '@/lib/chat-settings';
import { askAi, loadHistory, saveHistory, useAiInfo, type AiMessage } from '@/lib/ai-chat';
import { safeLink } from '@/lib/utils';
import tgLogo from '@/assets/tg-logo.png';

/** **bold**, https:// links and site paths like /pdf-store in a reply, without any HTML from the AI. */
const inline = (text: string, key: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|(?<![\w/])\/(?:pdf-store|ctf|training|cyber-portal|cyber-news|events|products|account\.html)[\w\-/]*)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <b key={`${key}-${i}`}>{part.slice(2, -2)}</b>;
    if (/^(https?:\/\/|\/)/.test(part)) {
      const href = safeLink(part.replace(/[.,;:]+$/, ''));
      return <a key={`${key}-${i}`} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2 break-all">{part}</a>;
    }
    return <Fragment key={`${key}-${i}`}>{part}</Fragment>;
  });

const Reply = ({ text }: { text: string }) => (
  <>{text.split('\n').map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-1.5" />;
    const bullet = /^([-*•]|\d+[.)])\s+/.exec(t);
    return bullet
      ? <div key={i} className="flex gap-1.5"><span className="shrink-0 text-primary">{/\d/.test(bullet[1]) ? bullet[1] : '•'}</span><span>{inline(t.slice(bullet[0].length), `l${i}`)}</span></div>
      : <p key={i}>{inline(t, `l${i}`)}</p>;
  })}</>
);

/** Floating chat button on every page: WhatsApp and (when set) the Telegram bot. */
const ChatWidget = () => {
  const chat = useChat();
  const ai = useAiInfo();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<AiMessage[]>(() => loadHistory());
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const aiOn = !!ai?.enabled;
  // With the AI assistant on, the WhatsApp / Telegram buttons stay hidden unless the admin shows them.
  const contacts = !aiOn || !!ai?.showContacts;

  useEffect(() => { saveHistory(msgs); list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' }); }, [msgs, busy, open]);
  const send = async () => {
    const q = text.trim();
    if (!q || busy) return;
    const next: AiMessage[] = [...msgs, { role: 'user', content: q.slice(0, 1000) }];
    setMsgs(next); setText(''); setErr(''); setBusy(true);
    try { setMsgs([...next, { role: 'assistant', content: await askAi(next) }]); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  };
  const tg = chat.telegram ? telegramLink(chat) : '';
  const was = chat.whatsapp ? whatsappButtons(chat) : [];
  const wa = was.length > 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!aiOn && (!chat.enabled || (!tg && !wa))) return null;

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
            className={`${aiOn ? 'flex max-h-[min(640px,calc(100vh-7rem))] w-[370px] flex-col' : 'w-[300px]'} max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[0_30px_70px_-25px_rgba(15,23,42,.55)]`}
          >
            <div className="tg-dark tg-band flex items-center gap-3 px-4 py-3">
              <img src={tgLogo} alt="" className="h-9 w-9 rounded-lg bg-white/90 object-contain p-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{aiOn ? ai?.botName : 'Tech Guardians'}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {aiOn ? 'AI assistant · replies instantly · Hindi / English' : 'Usually replies within a few hours'}</p>
              </div>
              {aiOn && msgs.length > 0 && (
                <button type="button" onClick={() => { setMsgs([]); setErr(''); }} aria-label="Start a new chat" title="New chat" className="ml-auto rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"><RotateCcw className="h-4 w-4" /></button>
              )}
            </div>
            {aiOn && (
              <>
                <div ref={list} className="min-h-[180px] flex-1 space-y-2.5 overflow-y-auto p-4 text-sm leading-relaxed" aria-live="polite">
                  <div className="flex gap-2"><Bot className="mt-1 h-4 w-4 shrink-0 text-primary" /><div className="rounded-xl rounded-tl-sm bg-muted px-3 py-2 text-foreground"><Reply text={ai?.welcome || ''} /></div></div>
                  {msgs.map((m, i) => m.role === 'user'
                    ? <div key={i} className="ml-8 rounded-xl rounded-tr-sm bg-primary px-3 py-2 text-primary-foreground whitespace-pre-wrap break-words">{m.content}</div>
                    : <div key={i} className="flex gap-2"><Bot className="mt-1 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0 space-y-1 rounded-xl rounded-tl-sm bg-muted px-3 py-2 text-foreground"><Reply text={m.content} /></div></div>)}
                  {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Typing…</div>}
                  {err && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</p>}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex items-end gap-2 border-t border-border p-3">
                  <label htmlFor="tg-ai-input" className="sr-only">Your question</label>
                  <textarea id="tg-ai-input" value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} rows={1} maxLength={1000}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                    placeholder="अपना सवाल लिखें / Type your question…"
                    className="max-h-28 min-h-[40px] flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
                </form>
                <p className="px-3 pb-2 text-[10.5px] leading-snug text-muted-foreground">AI guidance, not legal advice. Never share OTP, PIN or passwords. Lost money? Call <b>1930</b> or visit cybercrime.gov.in.</p>
              </>
            )}
            {contacts && <div className={aiOn ? 'flex gap-2 border-t border-border p-3' : 'space-y-3 p-4'}>
              {!aiOn && <p className="rounded-xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground">{chat.greeting}</p>}
              {aiOn && was.map((w, i) => <a key={w.id} href={w.href} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:border-emerald-500/60"><MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> {was.length > 1 ? `WhatsApp ${i + 1}` : 'WhatsApp a human'}</a>)}
              {tg && aiOn && <a href={tg} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:border-sky-500/60"><Send className="h-3.5 w-3.5 text-[#229ED9]" /> Telegram</a>}
              {!aiOn && was.map((w, i) => (
                <a key={w.id} href={w.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-semibold">Chat on WhatsApp{was.length > 1 ? ` ${i + 1}` : ''}</span><span className="block text-xs text-muted-foreground">Talk to our team</span></span>
                </a>
              ))}
              {tg && !aiOn && (
                <a href={tg} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-sky-500/60 hover:bg-sky-500/5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#229ED9] text-white"><Send className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-semibold">Chat with our Telegram bot</span><span className="block text-xs text-muted-foreground">Instant answers, 24×7</span></span>
                </a>
              )}
            </div>}
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
