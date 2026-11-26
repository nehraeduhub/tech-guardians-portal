import { useEffect, useState } from 'react';
import { Download, Save, Smartphone } from 'lucide-react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;
export const APP_KEY = 'tg_app';
interface AppCfg { packageId: string; sha256: string; appName: string }
const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const label = 'block text-xs font-semibold text-muted-foreground';
const PKG = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i;
const FP = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i;

/** Manage -> Mobile App: installable app (PWA) status and the Android package settings. */
const MobileAppAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [cfg, setCfg] = useState<AppCfg>(() => ({ packageId: '', sha256: '', appName: 'Tech Guardians', ...readSetting<Partial<AppCfg>>(APP_KEY, {}) }));
  const [links, setLinks] = useState<'checking' | 'ok' | 'empty'>('checking');
  useEffect(() => { fetch('/.well-known/assetlinks.json', { cache: 'no-store' }).then((r) => r.json()).then((d) => setLinks(Array.isArray(d) && d.length ? 'ok' : 'empty'), () => setLinks('empty')); }, [cfg]);
  const prints = cfg.sha256.split(/[\s,]+/).filter(Boolean);
  const valid = PKG.test(cfg.packageId) && prints.length > 0 && prints.every((f) => FP.test(f));
  const host = window.location.host;
  const twa = {
    packageId: cfg.packageId, host, name: cfg.appName, launcherName: cfg.appName.slice(0, 12), display: 'standalone', themeColor: '#0b1b33', navigationColor: '#0b1b33',
    backgroundColor: '#0b1b33', enableNotifications: false, startUrl: '/app?source=twa', iconUrl: `https://${host}/icons/icon-512.png`, maskableIconUrl: `https://${host}/icons/maskable-512.png`,
    appVersion: '1.0.0', appVersionCode: 1, webManifestUrl: `https://${host}/manifest.webmanifest`, fullScopeUrl: `https://${host}/`, minSdkVersion: 21, signingKey: { path: './android.keystore', alias: 'techguardians' },
  };
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(twa, null, 2)], { type: 'application/json' }));
    a.download = 'twa-manifest.json'; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <div className="grid max-w-3xl gap-5">
      <div className="rounded-2xl border border-border p-5">
        <h3 className="flex items-center gap-2 font-bold text-foreground"><Smartphone className="h-5 w-5 text-primary" /> Mobile app (installable)</h3>
        <p className="mt-2 text-sm text-muted-foreground">The website is already an installable app. Students open <b>{host}/app</b>, tap <b>Install</b> and it opens full-screen like a normal app (no browser bars), with the student login, daily tip, courses, PDFs, events, news and tools.</p>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground"><li>Android Chrome: the Install banner appears on /app.</li><li>iPhone Safari: Share → Add to Home Screen.</li><li>Need a real APK / Play Store app? Fill the box below, then follow the steps.</li></ul>
      </div>
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 grid gap-3">
        <h3 className="font-bold text-foreground">Generate the APK (admin)</h3>
        <p className="text-sm text-muted-foreground">One click opens the free PWABuilder tool with your app already filled in. Press <b>Package for stores → Android</b>, use the Package ID below, and download the zip with the APK, AAB and signing fingerprint.</p>
        <div className="flex flex-wrap gap-2">
          <a className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(`https://${host}/app`)}`} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /> Generate APK (PWABuilder)</a>
          <a className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold" href="/app" target="_blank" rel="noopener noreferrer"><Smartphone className="h-4 w-4" /> Open the app page</a>
        </div>
        <p className="text-xs text-muted-foreground">The APK is built by PWABuilder (Microsoft), not on this server, so your hosting stays safe. The site must be live on https for it to work.</p>
      </div>
      <div className="rounded-2xl border border-border p-5 grid gap-3">
        <h3 className="font-bold text-foreground">Android app package (APK / Play Store)</h3>
        <div><span className={label}>App name</span><input className={input} value={cfg.appName} onChange={(e) => setCfg({ ...cfg, appName: e.target.value })} /></div>
        <div><span className={label}>Package ID (you choose, e.g. in.techguardians.app)</span><input className={input} value={cfg.packageId} onChange={(e) => setCfg({ ...cfg, packageId: e.target.value.trim() })} /></div>
        <div><span className={label}>SHA-256 certificate fingerprint(s) (from PWABuilder / Play Console, format AB:CD:…)</span><textarea className={input} rows={2} value={cfg.sha256} onChange={(e) => setCfg({ ...cfg, sha256: e.target.value })} /></div>
        {!valid && (cfg.packageId || cfg.sha256) && <p className="text-sm text-amber-600">Package ID or fingerprint looks wrong.</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50" disabled={!valid} onClick={() => void onPublish(publishSetting(APP_KEY, cfg))}><Save className="h-4 w-4" /> Save</button>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50" disabled={!PKG.test(cfg.packageId)} onClick={download}><Download className="h-4 w-4" /> twa-manifest.json</button>
        </div>
        <p className="text-sm text-muted-foreground">Digital Asset Links at /.well-known/assetlinks.json: <b className={links === 'ok' ? 'text-green-600' : 'text-amber-600'}>{links === 'ok' ? 'active' : links === 'checking' ? 'checking…' : 'not set yet'}</b></p>
      </div>
      <ol className="list-decimal rounded-2xl border border-border p-5 pl-9 text-sm text-muted-foreground grid gap-2">
        <li>Open <b>pwabuilder.com</b>, enter <b>https://{host}/app</b>, click Start → Package for stores → Android.</li>
        <li>Use the same Package ID as above. Download the zip: it has the signed APK/AAB and a <b>signing-key fingerprint</b> (SHA-256).</li>
        <li>Paste that fingerprint here and Save. The address bar then disappears inside the app.</li>
        <li>Upload the AAB to Google Play Console (one-time ₹2,100 fee), or share the APK directly.</li>
        <li>Advanced: <code>npm i -g @bubblewrap/cli</code> then <code>bubblewrap init --manifest=https://{host}/manifest.webmanifest</code>; the downloaded twa-manifest.json has all values ready.</li>
      </ol>
    </div>
  );
};

export default MobileAppAdmin;
