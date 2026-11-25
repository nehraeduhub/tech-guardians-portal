import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useInstall } from '@/lib/pwa';

/** Small "Install app" banner: Android uses the real install prompt, iPhone gets the Add to Home Screen steps. */
const InstallPrompt = ({ className = '' }: { className?: string }) => {
  const { installed, canPrompt, ios, install } = useInstall();
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem('tg-install-hidden') === '1'; } catch { return false; } });
  if (installed || hidden || (!canPrompt && !ios)) return null;
  const close = () => { setHidden(true); try { sessionStorage.setItem('tg-install-hidden', '1'); } catch { /* ignore */ } };
  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-3 text-sm ${className}`} role="region" aria-label="Install the app">
      <Download className="h-5 w-5 shrink-0 text-primary" />
      <p className="flex-1 text-foreground">
        {canPrompt ? 'Install the Tech Guardians app for one-tap access.' : <>Install: tap <Share className="mx-0.5 inline h-4 w-4" /> Share, then <b>Add to Home Screen</b>.</>}
      </p>
      {canPrompt && <button type="button" onClick={() => void install()} className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">Install</button>}
      <button type="button" onClick={close} aria-label="Dismiss" className="text-muted-foreground"><X className="h-4 w-4" /></button>
    </div>
  );
};

export default InstallPrompt;
