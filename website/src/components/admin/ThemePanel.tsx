import { useEffect, useState } from 'react';
import { Check, Eye, Palette } from 'lucide-react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

interface ThemeInfo {
  id: string;
  name: string;
  tagline: string;
  swatch: string[];
  fonts: { head: string; body: string; mono: string };
  light: boolean;
  original: boolean;
}
interface ThemeEngine {
  themes: ThemeInfo[];
  current(): string;
  apply(id: string): string;
  preview(id: string): string;
  endPreview(): Promise<void>;
}

export const THEME_KEY = 'tg_theme';
const engine = () => (window as unknown as { tgTheme?: ThemeEngine }).tgTheme;
const fontName = (stack: string) => stack.split(',')[0].replace(/['"]/g, '').trim();

/** Pick the website theme. One click restyles every page for every visitor. */
const ThemePanel = ({ onPublish }: { onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void> }) => {
  const themes = engine()?.themes || [];
  const [live, setLive] = useState(() => readSetting<string>(THEME_KEY, 'cyber-neon'));
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setLive(readSetting<string>(THEME_KEY, 'cyber-neon'));
    window.addEventListener('tg-settings-changed', refresh);
    return () => {
      window.removeEventListener('tg-settings-changed', refresh);
      // Leaving the tab ends a preview.
      void engine()?.endPreview();
    };
  }, []);

  if (!themes.length) {
    return <p className="text-sm text-destructive">The theme engine did not load. Check that /js/tg-theme.js was uploaded.</p>;
  }

  const preview = (id: string) => { engine()?.preview(id); setPreviewing(id); };
  const cancelPreview = () => { void engine()?.endPreview(); setPreviewing(null); };
  const applyLive = (id: string) =>
    onPublish(publishSetting(THEME_KEY, id), () => { engine()?.apply(id); setLive(id); setPreviewing(null); });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Website theme</h2>
        <p className="text-sm text-muted-foreground">
          Each theme changes colours, fonts, cards and the animated 3D background on every page, including course and payment pages.
          Preview shows it only to you; Apply makes it live for all visitors within 15 seconds.
        </p>
      </div>
      {previewing && previewing !== live && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
          <span>Previewing <strong>{themes.find((t) => t.id === previewing)?.name}</strong>. Visitors still see {themes.find((t) => t.id === live)?.name}.</span>
          <button onClick={() => void applyLive(previewing)} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Apply to website</button>
          <button onClick={cancelPreview} className="rounded-full border border-border px-4 py-1.5 text-xs">Cancel preview</button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((t) => {
          const isLive = t.id === live;
          return (
            <div key={t.id} className={`flex flex-col overflow-hidden rounded-2xl border bg-card/80 ${isLive ? 'border-primary ring-2 ring-primary/40' : 'border-border'}`}>
              <div className="relative h-28" style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 0%, ${t.swatch[0]} 45%, ${t.swatch[1]} 140%)` }}>
                <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
                  <span className="text-2xl font-bold leading-none" style={{ fontFamily: t.fonts.head, color: t.light ? '#0f172a' : '#fff' }}>Aa</span>
                  <span className="flex gap-1.5">
                    {t.swatch.map((c) => <span key={c} className="h-5 w-5 rounded-full border border-white/40 shadow" style={{ background: c }} />)}
                  </span>
                </div>
                {isLive && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"><Check className="h-3 w-3" /> Live</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-base font-semibold text-foreground">{t.name}{t.original ? ' (original)' : ''}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.tagline}</p>
                <p className="text-[11px] text-muted-foreground">Fonts: {fontName(t.fonts.head)} / {fontName(t.fonts.body)}{t.light ? ' · light' : ' · dark'}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <button onClick={() => preview(t.id)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"><Eye className="h-3.5 w-3.5" /> Preview</button>
                  <button onClick={() => void applyLive(t.id)} disabled={isLive} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                    <Check className="h-3.5 w-3.5" /> {isLive ? 'Live now' : 'Apply to website'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemePanel;
