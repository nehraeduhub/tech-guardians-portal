import { useEffect, useState } from 'react';

/** The animated concept diagrams from /ctf-assets/anim.js. */
export const useAnimations = () => {
  const [ready, setReady] = useState(() => typeof (window as unknown as { animFigure?: unknown }).animFigure === 'function');
  useEffect(() => {
    if (!document.querySelector('link[data-ctf-anim]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = '/ctf-assets/anim.css'; l.dataset.ctfAnim = '1';
      document.head.appendChild(l);
    }
    if (ready) return;
    const done = () => setReady(true);
    const existing = document.querySelector<HTMLScriptElement>('script[data-ctf-anim]');
    if (existing) { existing.addEventListener('load', done); return () => existing.removeEventListener('load', done); }
    const s = document.createElement('script');
    s.src = '/ctf-assets/anim.js';
    s.dataset.ctfAnim = '1';
    s.onload = done;
    document.head.appendChild(s);
  }, [ready]);
  return ready ? (key: string) => (window as unknown as { animFigure: (k: string) => string }).animFigure(key) : null;
};

