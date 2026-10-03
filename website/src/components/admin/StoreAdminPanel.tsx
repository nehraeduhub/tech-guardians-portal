import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, ImagePlus, Link2, Plus, Save, Trash2, X } from 'lucide-react';
import { uploadImage } from '@/lib/api';
import { shrinkImageFile } from '@/lib/image-tools';
import { loadStoreAdmin, saveStoreAdmin, type PaymentSettings, type StoreProduct } from '@/lib/store';

const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const label = 'text-xs font-semibold text-muted-foreground';

const APPS_SCRIPT = `// Google Sheet → Extensions → Apps Script. Add this, then Deploy → Manage deployments → New version.
// It lets the website read the sheet (action=list). Your existing doPost stays as it is.
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var values = sheet.getDataRange().getDisplayValues();
  return ContentService.createTextOutput(JSON.stringify(values))
    .setMimeType(ContentService.MimeType.JSON);
}`;

const blankProduct = (): StoreProduct => ({
  id: `pdf-${Date.now().toString(36)}`, title: '', subtitle: '', description: '', pages: 0, format: 'PDF',
  price: 0, offerPrice: 0, cover: '', previews: [], tags: [], driveLink: '', visible: false,
});

/** Admin: sell PDFs and set how buyers pay and receive them. */
const StoreAdminPanel = ({ onPublish }: { onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void> }) => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStoreAdmin()
      .then((d) => { setSettings(d.settings); setProducts(d.products); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the store.'));
  }, []);

  if (!settings) return <p className="text-sm text-muted-foreground">{error || 'Loading store…'}</p>;

  const dirty = () => setSaved(false);
  const setS = (patch: Partial<PaymentSettings>) => { setSettings({ ...settings, ...patch }); dirty(); };
  const setP = (id: string, patch: Partial<StoreProduct>) => { setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p))); dirty(); };
  const move = (i: number, d: -1 | 1) => {
    const next = [...products]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]]; setProducts(next); dirty();
  };
  const upload = async (key: string, file: File | undefined, done: (url: string) => void) => {
    if (!file) return;
    setError(''); setBusy(key);
    try { const { url } = await uploadImage(await shrinkImageFile(file, 1400, 1800)); done(url); }
    catch (e) { setError(e instanceof Error ? e.message : 'The image could not be uploaded.'); }
    finally { setBusy(''); }
  };
  const save = () => onPublish(saveStoreAdmin({ settings, products }), () => setSaved(true));

  return (
    <div className="space-y-8">
      {/* Payment settings */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/70 p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Payment & delivery settings</h2>
          <p className="text-sm text-muted-foreground">Used by the payment page for courses and PDFs.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <fieldset className="md:col-span-2 space-y-2">
            <legend className={label}>When can a PDF buyer download?</legend>
            {([
              ['approval', 'After I approve the payment (recommended)', 'You check the UPI payment in your bank app, then click Approve in Payment History. The buyer’s order page unlocks the download.'],
              ['instant', 'Immediately after they submit the transaction ID', 'Faster for buyers, but someone could enter a fake transaction ID. You can still reject it later.'],
            ] as const).map(([value, title, hint]) => (
              <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${settings.delivery === value ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input type="radio" name="delivery" checked={settings.delivery === value} onChange={() => setS({ delivery: value })} className="mt-1 accent-primary" />
                <span><span className="block text-sm font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{hint}</span></span>
              </label>
            ))}
          </fieldset>
          <label className="space-y-1.5"><span className={label}>Payee name shown to buyers</span>
            <input id="pay-payee" className={input} value={settings.payeeName} onChange={(e) => setS({ payeeName: e.target.value })} /></label>
          <label className="space-y-1.5"><span className={label}>UPI ID (optional, enables “Pay with UPI app” on phones)</span>
            <input id="pay-upi" className={input} placeholder="yourname@okaxis" value={settings.upiId} onChange={(e) => setS({ upiId: e.target.value.trim() })} /></label>
          <label className="space-y-1.5"><span className={label}>WhatsApp number for support (with country code)</span>
            <input id="pay-wa" className={input} value={settings.whatsapp} onChange={(e) => setS({ whatsapp: e.target.value })} /></label>
          <label className="space-y-1.5"><span className={label}>Support email</span>
            <input id="pay-email" className={input} value={settings.email} onChange={(e) => setS({ email: e.target.value })} /></label>
          <div className="md:col-span-2 space-y-1.5">
            <span className={label}>Payment QR code</span>
            <div className="flex flex-wrap items-center gap-4">
              {settings.qrImage && <img src={settings.qrImage} alt="Payment QR" className="h-28 w-28 rounded-lg border border-border bg-white object-contain p-1" />}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                <ImagePlus className="h-4 w-4" /> {busy === 'qr' ? 'Uploading…' : 'Upload new QR'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload('qr', e.target.files?.[0], (url) => setS({ qrImage: url }))} />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Google Sheet */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/70 p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Google Sheet (Excel) sync</h2>
          <p className="text-sm text-muted-foreground">Every new order is also added to your sheet, and rows from the sheet appear in Payment History automatically (checked at most once a minute).</p>
        </div>
        <label className="block space-y-1.5"><span className={label}>Apps Script web app link, or a “Publish to web” CSV link</span>
          <input id="pay-sheet" className={input} value={settings.sheetUrl || ''} placeholder="https://script.google.com/macros/s/…/exec" onChange={(e) => setS({ sheetUrl: e.target.value.trim() })} /></label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-primary" checked={!!settings.sheetSync} onChange={(e) => setS({ sheetSync: e.target.checked })} />
          Automatically bring sheet rows into Payment History
        </label>
        <details className="rounded-xl border border-border p-3 text-sm">
          <summary className="cursor-pointer font-semibold">Sheet rows not showing? Add this to your Apps Script</summary>
          <p className="mt-2 text-muted-foreground">Your script already receives orders. To let the website read the rows, add this function, then deploy a new version (Execute as: Me, Who has access: Anyone). Or use File → Share → Publish to web → CSV and paste that link above instead.</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/40 p-3 text-xs"><code>{APPS_SCRIPT}</code></pre>
          <button
            type="button"
            onClick={() => { void navigator.clipboard?.writeText(APPS_SCRIPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => undefined); }}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
          ><Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy code'}</button>
        </details>
      </section>

      {/* Products */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold">PDFs for sale</h2>
          <p className="text-sm text-muted-foreground">Visitors see the cover, preview pages and price. The Google Drive link stays private and only opens for buyers whose payment is approved. In Drive, set the file to “Anyone with the link can view”.</p>
        </div>
        {products.length === 0 && <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No PDFs yet. Click “Add PDF”.</p>}
        {products.map((p, i) => (
          <div key={p.id} className={`space-y-4 rounded-2xl border border-border bg-card/70 p-5 ${p.visible ? '' : 'opacity-70'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">{p.title || 'Untitled PDF'}{p.visible ? '' : ' · hidden from website'}</span>
              <div className="flex flex-wrap gap-2">
                {!p.driveLink && <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">No download link yet</span>}
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === products.length - 1} aria-label="Move down" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => setP(p.id, { visible: !p.visible })} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">
                  {p.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {p.visible ? 'Shown' : 'Hidden'}
                </button>
                {confirmDelete === p.id ? (
                  <>
                    <button onClick={() => { setProducts(products.filter((x) => x.id !== p.id)); setConfirmDelete(null); dirty(); }} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-border px-3 py-2 text-xs">Keep</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDelete(p.id)} aria-label="Delete PDF" className="rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                <span className={label}>Cover</span>
                <div className="aspect-[3/4] w-full max-w-[180px] overflow-hidden rounded-lg border border-border bg-muted/30">
                  {p.cover ? <img src={p.cover} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-muted-foreground">No cover</div>}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
                  <ImagePlus className="h-3.5 w-3.5" /> {busy === `${p.id}:cover` ? 'Uploading…' : 'Upload cover'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(`${p.id}:cover`, e.target.files?.[0], (url) => setP(p.id, { cover: url }))} />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2"><span className={label}>Title</span>
                  <input id={`p-${p.id}-title`} className={input} value={p.title} onChange={(e) => setP(p.id, { title: e.target.value })} /></label>
                <label className="space-y-1.5 md:col-span-2"><span className={label}>Subtitle</span>
                  <input id={`p-${p.id}-subtitle`} className={input} value={p.subtitle} onChange={(e) => setP(p.id, { subtitle: e.target.value })} /></label>
                <label className="space-y-1.5 md:col-span-2"><span className={label}>Description (what buyers get)</span>
                  <textarea id={`p-${p.id}-desc`} rows={5} className={input} value={p.description} onChange={(e) => setP(p.id, { description: e.target.value })} /></label>
                <label className="space-y-1.5"><span className={label}>Price (₹, shown crossed out when there is an offer)</span>
                  <input id={`p-${p.id}-price`} type="number" min={0} className={input} value={p.price || ''} onChange={(e) => setP(p.id, { price: Number(e.target.value) })} /></label>
                <label className="space-y-1.5"><span className={label}>Offer price (₹, what buyers pay; leave empty for none)</span>
                  <input id={`p-${p.id}-offer`} type="number" min={0} className={input} value={p.offerPrice || ''} onChange={(e) => setP(p.id, { offerPrice: Number(e.target.value) })} /></label>
                <label className="space-y-1.5"><span className={label}>Pages</span>
                  <input id={`p-${p.id}-pages`} type="number" min={0} className={input} value={p.pages || ''} onChange={(e) => setP(p.id, { pages: Number(e.target.value) })} /></label>
                <label className="space-y-1.5"><span className={label}>Tags (comma separated)</span>
                  <input id={`p-${p.id}-tags`} className={input} value={p.tags.join(', ')} onChange={(e) => setP(p.id, { tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} /></label>
                <label className="space-y-1.5 md:col-span-2"><span className={`${label} inline-flex items-center gap-1.5`}><Link2 className="h-3.5 w-3.5" /> Google Drive download link (private)</span>
                  <input id={`p-${p.id}-drive`} className={input} placeholder="https://drive.google.com/file/d/…/view" value={p.driveLink || ''} onChange={(e) => setP(p.id, { driveLink: e.target.value.trim() })} /></label>
              </div>
            </div>
            <div className="space-y-2">
              <span className={label}>Preview pages ({p.previews.length}) — shown as a gallery before buying</span>
              <div className="flex flex-wrap gap-3">
                {p.previews.map((src, k) => (
                  <div key={src + k} className="relative h-32 w-24 overflow-hidden rounded-lg border border-border">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => setP(p.id, { previews: p.previews.filter((_, x) => x !== k) })} aria-label="Remove preview" className="absolute right-1 top-1 rounded-full bg-background/90 p-1"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                <label className="grid h-32 w-24 cursor-pointer place-items-center rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground hover:bg-muted">
                  <span><ImagePlus className="mx-auto mb-1 h-5 w-5" />{busy === `${p.id}:prev` ? 'Uploading…' : 'Add page'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(`${p.id}:prev`, e.target.files?.[0], (url) => setP(p.id, { previews: [...p.previews, url] }))} />
                </label>
              </div>
            </div>
          </div>
        ))}
      </section>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => { setProducts([...products, blankProduct()]); dirty(); }} className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add PDF</button>
        <button onClick={() => void save()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save & Publish</button>
        {saved && <span className="text-xs text-cyber-green">Saved — the store and payment page are updated.</span>}
      </div>
    </div>
  );
};

export default StoreAdminPanel;
