import { useEffect, useState } from 'react';
import { ImagePlus, RotateCcw, Save } from 'lucide-react';
import { uploadImage } from '@/lib/api';
import { DEFAULT_HOME_CONTENT, HomeContent, loadHomeContent, saveHomeContent } from '@/lib/home-content';

const inputClass = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';

const FIELDS: { key: Exclude<keyof HomeContent, 'heroImage'>; label: string; rows?: number }[] = [
  { key: 'topBar', label: 'Top bar text' },
  { key: 'heroBadge', label: 'Hero badge' },
  { key: 'heroTitle', label: 'Hero headline' },
  { key: 'heroTitleAccent', label: 'Hero headline, second line' },
  { key: 'heroText', label: 'Hero paragraph', rows: 3 },
  { key: 'footerAbout', label: 'Footer description', rows: 3 },
];

const shrinkImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The photo could not be read.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, 1600 / img.naturalWidth, 1200 / img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Photo processing is unavailable in this browser.')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let out = canvas.toDataURL('image/webp', 0.82);
        if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', 0.82);
        resolve(out);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });

const HomeContentPanel = ({ onPublish }: { onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void> }) => {
  const [content, setContent] = useState<HomeContent>(loadHomeContent);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setContent(loadHomeContent()); }, []);

  const set = (patch: Partial<HomeContent>) => { setContent((c) => ({ ...c, ...patch })); setSaved(false); };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const { url } = await uploadImage(await shrinkImage(file));
      set({ heroImage: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The photo could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="font-display text-lg font-semibold">Homepage text and photo</h2>
        <p className="text-sm text-muted-foreground">Changes appear on every open page within 15 seconds after you publish.</p>
      </div>
      {FIELDS.map((f) => (
        <label key={f.key} className="block space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
          {f.rows ? (
            <textarea id={`home-${f.key}`} rows={f.rows} value={content[f.key]} onChange={(e) => set({ [f.key]: e.target.value })} className={inputClass} />
          ) : (
            <input id={`home-${f.key}`} value={content[f.key]} onChange={(e) => set({ [f.key]: e.target.value })} className={inputClass} />
          )}
        </label>
      ))}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground">Hero photo</span>
        <div className="flex flex-wrap items-center gap-4">
          <img src={content.heroImage} alt="Current hero" className="h-24 w-32 rounded-lg border border-border object-contain bg-card" />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted">
            <ImagePlus className="h-4 w-4" /> {busy ? 'Uploading…' : 'Upload new photo'}
            <input id="home-hero-image" type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => void pickImage(e.target.files?.[0])} />
          </label>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button onClick={() => void onPublish(saveHomeContent(content), () => setSaved(true))} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Save className="h-4 w-4" /> Save & Publish
        </button>
        <button onClick={() => set(DEFAULT_HOME_CONTENT)} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground hover:bg-muted">
          <RotateCcw className="h-4 w-4" /> Restore original text
        </button>
        {saved && <span className="text-xs text-cyber-green">Published — the homepage is updated.</span>}
      </div>
    </div>
  );
};

export default HomeContentPanel;
