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
interface ColorConfig { palette: string; primary?: string; accent?: string; navy?: string }
interface Palette { id: string; name: string; primary: string; accent: string; navy: string }
interface ThemeEngine {
  themes: ThemeInfo[];
  current(): string;
  apply(id: string): string;
  preview(id: string): string;
  endPreview(): Promise<void>;
  palettes?: Palette[];
  previewColors?(cfg: ColorConfig | null): void;
  applyColors?(cfg: ColorConfig | null): void;
}
export const COLORS_KEY = 'tg_theme_colors';

export const THEME_KEY = 'tg_theme_v2';
const engine = () => (window as unknown as { tgTheme?: ThemeEngine }).tgTheme;
const fontName = (stack: string) => stack.split(',')[0].replace(/['"]/g, '').trim();

/** Pick the website theme. One click restyles every page for every visitor. */
const ThemePanel = ({ onPublish }: { onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void> }) => {
  const themes = engine()?.themes || [];
  const [live, setLive] = useState(() => readSetting<string>(THEME_KEY, 'reason-pro'));
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setLive(readSetting<string>(THEME_KEY, 'reason-pro'));
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
      <ColorsPanel onPublish={onPublish} />
      <h3 className="pt-2 font-display text-base font-semibold">Themes</h3>
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

/** Website colours: ready-made palettes or your own three colours, on top of the theme. */
const ColorsPanel = ({ onPublish }: { onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void> }) => {
  const palettes = engine()?.palettes || [];
  const savedCfg = () => readSetting<ColorConfig | null>(COLORS_KEY, null) || { palette: 'theme' };
  const [cfg, setCfg] = useState<ColorConfig>(savedCfg);
  const [live, setLive] = useState<ColorConfig>(savedCfg);
  const [previewing, setPreviewing] = useState(false);
  const custom = { primary: cfg.primary || '#5b3df5', accent: cfg.accent || '#0ea5e9', navy: cfg.navy || '#0b1030' };

  const show = (next: ColorConfig) => { setCfg(next); engine()?.previewColors?.(next); setPreviewing(true); };
  const apply = () => onPublish(publishSetting(COLORS_KEY, cfg), () => { engine()?.applyColors?.(cfg); setLive(cfg); setPreviewing(false); });
  const cancel = () => { void engine()?.endPreview(); setCfg(live); setPreviewing(false); };
  const same = JSON.stringify(cfg) === JSON.stringify(live);

  if (!palettes.length) return null;
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card/70 p-5">
      <div>
        <h3 className="font-display text-base font-semibold">Website colours</h3>
        <p className="text-sm text-muted-foreground">Change the main colours of the whole website — buttons, links, highlights and the navy hero and footer bands — on every page, including course and payment pages. Click a palette to preview it, then apply.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {palettes.map((p) => {
          const on = cfg.palette === p.id;
          const sw = p.id === 'theme' ? ['#5b3df5', '#0ea5e9', '#0b1030'] : [p.primary, p.accent, p.navy];
          return (
            <button key={p.id} type="button" onClick={() => show({ palette: p.id })} aria-pressed={on}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${on ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40'}`}>
              <span className="flex -space-x-1.5">{sw.map((c) => <span key={c} className="h-7 w-7 rounded-full border-2 border-white shadow" style={{ background: c }} />)}</span>
              <span className="min-w-0"><span className="block text-sm font-semibold">{p.name}</span>{live.palette === p.id && <span className="text-[11px] font-semibold text-primary">Live</span>}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => show({ palette: 'custom', ...custom })} aria-pressed={cfg.palette === 'custom'}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left ${cfg.palette === 'custom' ? 'border-primary ring-2 ring-primary/30' : 'border-dashed border-border hover:border-primary/40'}`}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-pink-500 via-amber-400 to-sky-500 text-xs font-bold text-white">+</span>
          <span className="text-sm font-semibold">Your own colours{live.palette === 'custom' && <span className="block text-[11px] font-semibold text-primary">Live</span>}</span>
        </button>
      </div>
      {cfg.palette === 'custom' && (
        <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-3">
          {([['primary', 'Main colour (buttons, links)'], ['accent', 'Second colour (highlights)'], ['navy', 'Dark band colour (hero, footer)']] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-3 text-sm">
              <input type="color" value={custom[k]} onChange={(e) => show({ ...cfg, ...custom, palette: 'custom', [k]: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent" />
              <span><span className="block font-medium">{l}</span><span className="font-mono text-xs text-muted-foreground">{custom[k]}</span></span>
            </label>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-3">Very light main colours are darkened automatically so white button text stays readable.</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void apply()} disabled={same && !previewing} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Check className="h-4 w-4" /> Apply colours to website</button>
        {previewing && <button type="button" onClick={cancel} className="rounded-full border border-border px-5 py-2.5 text-sm">Cancel preview</button>}
        {previewing && <span className="text-xs text-muted-foreground">Preview is shown only to you until you apply.</span>}
      </div>
    </section>
  );
};
