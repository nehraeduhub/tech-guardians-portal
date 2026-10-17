import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, ImagePlus, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { apiGet, uploadImage } from '@/lib/api';
import { shrinkImageFile } from '@/lib/image-tools';
import { publishSetting, readSetting } from '@/lib/shared-settings';
import { DEFAULT_LEGAL, loadLegal, saveLegal, type LegalContent, type LegalSection } from '@/lib/legal';
import {
  DEFAULT_ABOUT_CONTENT, loadAboutContent, loadAboutVisibility, saveAboutContent, saveAboutVisibility,
  type AboutContent,
} from '@/lib/about-settings';
import { cleanBotName, loadChat, saveChat, type ChatSettings } from '@/lib/chat-settings';

// Admin panels for the Terms & Privacy page, the About page and the
// Cyber Crime News Portal sources.

type Publish = (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;

const input = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';
const label = 'text-xs font-semibold text-muted-foreground';
const card = 'space-y-4 rounded-2xl border border-border bg-card/70 p-5';

const SaveBar = ({ onSave, saved, onReset, extra }: { onSave: () => void; saved: boolean; onReset?: () => void; extra?: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3 pt-2">
    {extra}
    <button onClick={onSave} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save & Publish</button>
    {onReset && <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"><RefreshCw className="h-4 w-4" /> Restore default text</button>}
    {saved && <span className="text-xs text-cyber-green">Published — the website is updated.</span>}
  </div>
);

/* ---------------------------------------------------------------- Terms */

export const LegalAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [legal, setLegal] = useState<LegalContent>(loadLegal);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const set = (patch: Partial<LegalContent>) => { setLegal({ ...legal, ...patch }); setSaved(false); };
  const setSection = (id: string, patch: Partial<LegalSection>) => set({ sections: legal.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const move = (i: number, d: -1 | 1) => {
    const next = [...legal.sections]; const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]]; set({ sections: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Terms & Privacy</h2>
        <p className="text-sm text-muted-foreground">
          Edit the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">Terms &amp; Conditions page</a> and the privacy note buyers see at checkout and registration.
          Formatting: leave an empty line for a new paragraph, start a line with <code>- </code> for a bullet, wrap words in <code>**double stars**</code> for bold, and write <code>{'{whatsapp}'}</code> for your WhatsApp number. Links and emails become clickable automatically.
        </p>
      </div>

      <section className={card}>
        <label className="block space-y-1.5"><span className={label}>Privacy note on the payment page and student registration (dummy-details message)</span>
          <textarea id="legal-note" rows={4} className={input} value={legal.note} onChange={(e) => set({ note: e.target.value })} /></label>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="block space-y-1.5"><span className={label}>Introduction at the top of the Terms page</span>
            <textarea id="legal-intro" rows={2} className={input} value={legal.intro} onChange={(e) => set({ intro: e.target.value })} /></label>
          <label className="block space-y-1.5"><span className={label}>Last updated</span>
            <input id="legal-updated" className={input} value={legal.updated} onChange={(e) => set({ updated: e.target.value })} />
            <button type="button" onClick={() => set({ updated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) })} className="text-xs text-primary underline">Set to today</button>
          </label>
        </div>
      </section>

      {legal.sections.map((s, i) => (
        <section key={s.id} className={`${card} ${s.visible ? '' : 'opacity-60'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Section {i + 1} · link <code>/terms#{s.id}</code>{s.visible ? '' : ' · hidden'}</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === legal.sections.length - 1} aria-label="Move down" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
              <button onClick={() => setSection(s.id, { visible: !s.visible })} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">
                {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {s.visible ? 'Shown' : 'Hidden'}
              </button>
              {confirmDelete === s.id ? (
                <>
                  <button onClick={() => { set({ sections: legal.sections.filter((x) => x.id !== s.id) }); setConfirmDelete(null); }} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Delete</button>
                  <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-border px-3 py-2 text-xs">Keep</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(s.id)} aria-label="Delete section" className="rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          </div>
          <label className="block space-y-1.5"><span className={label}>Heading</span>
            <input id={`legal-${s.id}-title`} className={input} value={s.title} onChange={(e) => setSection(s.id, { title: e.target.value })} /></label>
          <label className="block space-y-1.5"><span className={label}>Text</span>
            <textarea id={`legal-${s.id}-body`} rows={8} className={`${input} font-mono text-xs leading-6`} value={s.body} onChange={(e) => setSection(s.id, { body: e.target.value })} /></label>
        </section>
      ))}

      <SaveBar
        saved={saved}
        onSave={() => void onPublish(saveLegal(legal), () => setSaved(true))}
        onReset={() => set({ ...DEFAULT_LEGAL })}
        extra={<button onClick={() => set({ sections: [...legal.sections, { id: `section-${Date.now().toString(36)}`, title: '', body: '', visible: true }] })} className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add section</button>}
      />
    </div>
  );
};

/* ---------------------------------------------------------------- About */

const ABOUT_FIELDS: { key: Exclude<keyof AboutContent, 'stats' | 'photo'>; label: string; rows?: number }[] = [
  { key: 'heroTitle', label: 'Main heading' },
  { key: 'heroHighlight', label: 'Highlighted end of the heading (neon colour)' },
  { key: 'heroText', label: 'Introduction', rows: 4 },
  { key: 'motto', label: 'Motto (bold, after the introduction)' },
  { key: 'photoCaption', label: 'Photo caption' },
  { key: 'storyTitle', label: '“Who we are” heading' },
  { key: 'story', label: '“Who we are” story (empty line = new paragraph)', rows: 9 },
  { key: 'mission', label: 'Our mission', rows: 3 },
  { key: 'vision', label: 'Our vision', rows: 3 },
  { key: 'ctaTitle', label: 'Closing call-to-action heading' },
  { key: 'ctaText', label: 'Closing call-to-action text', rows: 3 },
];

export const AboutAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [content, setContent] = useState<AboutContent>(loadAboutContent);
  const [visibility, setVisibility] = useState(loadAboutVisibility);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<AboutContent>) => { setContent({ ...content, ...patch }); setSaved(false); };
  const setStat = (i: number, patch: Partial<AboutContent['stats'][number]>) => set({ stats: content.stats.map((s, k) => (k === i ? { ...s, ...patch } : s)) });

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(''); setBusy(true);
    try { const { url } = await uploadImage(await shrinkImageFile(file)); set({ photo: url }); }
    catch (e) { setError(e instanceof Error ? e.message : 'The photo could not be uploaded.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">About Us page</h2>
        <p className="text-sm text-muted-foreground">Edit the text, photo and numbers on the <a href="/about" target="_blank" rel="noopener noreferrer" className="text-primary underline">About page</a>, and where its link appears.</p>
      </div>

      <section className={card}>
        <h3 className="font-semibold">Menu links</h3>
        {(['headerVisible', 'footerVisible'] as const).map((field) => (
          <label key={field} className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
            <span>Show “About Us” in the {field === 'headerVisible' ? 'header (desktop and mobile)' : 'footer'}</span>
            <input type="checkbox" checked={visibility[field]} onChange={(e) => { setVisibility({ ...visibility, [field]: e.target.checked }); setSaved(false); }} className="h-5 w-5 accent-primary" />
          </label>
        ))}
      </section>

      <section className={card}>
        <h3 className="font-semibold">Photo</h3>
        <div className="flex flex-wrap items-center gap-4">
          {content.photo ? <img src={content.photo} alt="" className="h-24 w-32 rounded-lg border border-border object-cover" /> : <span className="text-xs text-muted-foreground">Using the default training photo.</span>}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
            <ImagePlus className="h-4 w-4" /> {busy ? 'Uploading…' : 'Upload photo'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} />
          </label>
          {content.photo && <button onClick={() => set({ photo: '' })} className="text-xs text-destructive underline">Use default photo</button>}
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </section>

      <section className={card}>
        <h3 className="font-semibold">Numbers strip</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {content.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input aria-label={`Number ${i + 1}`} className={`${input} w-28`} value={s.value} onChange={(e) => setStat(i, { value: e.target.value })} />
              <input aria-label={`Label ${i + 1}`} className={input} value={s.label} onChange={(e) => setStat(i, { label: e.target.value })} />
              <button onClick={() => set({ stats: content.stats.filter((_, k) => k !== i) })} aria-label="Remove number" className="rounded-lg border border-destructive/40 px-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        {content.stats.length < 4 && <button onClick={() => set({ stats: [...content.stats, { value: '', label: '' }] })} className="inline-flex items-center gap-1.5 text-xs text-primary"><Plus className="h-3.5 w-3.5" /> Add number</button>}
      </section>

      <section className={card}>
        <h3 className="font-semibold">Text</h3>
        {ABOUT_FIELDS.map((f) => (
          <label key={f.key} className="block space-y-1.5"><span className={label}>{f.label}</span>
            {f.rows ? <textarea id={`about-${f.key}`} rows={f.rows} className={input} value={content[f.key]} onChange={(e) => set({ [f.key]: e.target.value })} />
              : <input id={`about-${f.key}`} className={input} value={content[f.key]} onChange={(e) => set({ [f.key]: e.target.value })} />}
          </label>
        ))}
        <p className="text-xs text-muted-foreground">An empty field shows the default text. The services, approach, values and founders sections stay as designed.</p>
      </section>

      <SaveBar
        saved={saved}
        onSave={() => void onPublish(Promise.all([saveAboutContent(content), saveAboutVisibility(visibility)]), () => setSaved(true))}
        onReset={() => set({ ...DEFAULT_ABOUT_CONTENT })}
      />
    </div>
  );
};

/* ---------------------------------------------------------- News sources */

export const NEWS_SOURCES_KEY = 'tg_news_sources';
interface BuiltInSource { feed: 'india' | 'global'; url: string; name: string; category: string | null }
interface CustomSource { id: string; feed: 'india' | 'global'; url: string; name: string; category: string; enabled: boolean }
interface NewsConfig { disabled: string[]; custom: CustomSource[] }

const DESK = { india: 'India desk', global: 'Global desk' } as const;

export const NewsSourcesAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [builtIn, setBuiltIn] = useState<BuiltInSource[] | null>(null);
  const [cfg, setCfg] = useState<NewsConfig>(() => {
    const saved = readSetting<Partial<NewsConfig> | null>(NEWS_SOURCES_KEY, null) || {};
    return { disabled: Array.isArray(saved.disabled) ? saved.disabled : [], custom: Array.isArray(saved.custom) ? saved.custom : [] };
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<BuiltInSource[]>('news.php?action=sources').then(setBuiltIn).catch(() => setError('Could not load the source list.'));
  }, []);

  const set = (patch: Partial<NewsConfig>) => { setCfg({ ...cfg, ...patch }); setSaved(false); };
  const keyOf = (s: BuiltInSource) => `${s.feed}|${s.url}`;
  const toggle = (k: string) => set({ disabled: cfg.disabled.includes(k) ? cfg.disabled.filter((x) => x !== k) : [...cfg.disabled, k] });
  const setCustom = (id: string, patch: Partial<CustomSource>) => set({ custom: cfg.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const save = () => {
    const bad = cfg.custom.find((c) => c.url.trim() && !/^https?:\/\/\S+$/i.test(c.url.trim()));
    if (bad) { setError(`“${bad.url}” is not a valid feed link. It must start with https://`); return; }
    setError('');
    const clean = { ...cfg, custom: cfg.custom.filter((c) => c.url.trim()).map((c) => ({ ...c, url: c.url.trim() })) };
    void onPublish(publishSetting(NEWS_SOURCES_KEY, clean), () => { setCfg(clean); setSaved(true); });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">News Portal sources</h2>
        <p className="text-sm text-muted-foreground">
          The <a href="/cyber-news" target="_blank" rel="noopener noreferrer" className="text-primary underline">Cyber Crime News Portal</a> collects stories from these feeds every 5 minutes. Switch a source off if it shows unrelated news, or add any website’s RSS/Atom feed or a Google News search feed.
          Changes appear on the portal within a minute.
        </p>
      </div>

      <section className={card}>
        <h3 className="font-semibold">Your own feeds</h3>
        <p className="text-xs text-muted-foreground">Tip: for a Google News topic use <code>https://news.google.com/rss/search?q=your+words+india+when:2d&amp;hl=en-IN&amp;gl=IN&amp;ceid=IN:en</code></p>
        {cfg.custom.length === 0 && <p className="text-sm text-muted-foreground">No custom feeds yet.</p>}
        {cfg.custom.map((c) => (
          <div key={c.id} className={`grid gap-3 rounded-xl border border-border p-4 md:grid-cols-12 ${c.enabled ? '' : 'opacity-60'}`}>
            <input aria-label="Feed link" placeholder="https://example.com/feed/" className={`${input} md:col-span-12`} value={c.url} onChange={(e) => setCustom(c.id, { url: e.target.value })} />
            <input aria-label="Source name" placeholder="Source name" className={`${input} md:col-span-4`} value={c.name} onChange={(e) => setCustom(c.id, { name: e.target.value })} />
            <select aria-label="Desk" className={`${input} md:col-span-3`} value={c.feed} onChange={(e) => setCustom(c.id, { feed: e.target.value as CustomSource['feed'] })}>
              <option value="india">India desk</option><option value="global">Global desk</option>
            </select>
            <input aria-label="Category" placeholder={c.feed === 'india' ? 'Category, e.g. Cyber Fraud' : 'Category (India desk only)'} disabled={c.feed !== 'india'} className={`${input} md:col-span-3`} value={c.category} onChange={(e) => setCustom(c.id, { category: e.target.value })} />
            <div className="flex gap-2 md:col-span-2 md:justify-end">
              <button onClick={() => setCustom(c.id, { enabled: !c.enabled })} aria-label={c.enabled ? 'Turn off' : 'Turn on'} className="rounded-lg border border-border px-3 hover:bg-muted">{c.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
              <button onClick={() => set({ custom: cfg.custom.filter((x) => x.id !== c.id) })} aria-label="Delete feed" className="rounded-lg border border-destructive/40 px-3 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        <button onClick={() => set({ custom: [...cfg.custom, { id: `n${Date.now().toString(36)}`, feed: 'india', url: '', name: '', category: '', enabled: true }] })} className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add feed</button>
      </section>

      {(['india', 'global'] as const).map((feed) => (
        <section key={feed} className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Built-in sources · {DESK[feed]}</h3>
            {builtIn && <span className="text-xs text-muted-foreground">{builtIn.filter((s) => s.feed === feed && !cfg.disabled.includes(keyOf(s))).length} of {builtIn.filter((s) => s.feed === feed).length} on</span>}
          </div>
          {!builtIn ? <p className="text-sm text-muted-foreground">{error || 'Loading…'}</p> : (
            <ul className="divide-y divide-border">
              {builtIn.filter((s) => s.feed === feed).map((s) => {
                const k = keyOf(s); const on = !cfg.disabled.includes(k);
                return (
                  <li key={k} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className={`min-w-0 ${on ? '' : 'opacity-50'}`}>
                      <span className="font-medium">{s.name}</span>{s.category && <span className="text-muted-foreground"> · {s.category}</span>}
                      <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${s.name} feed`} className="ml-2 inline-flex text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" /></a>
                    </span>
                    <label className="inline-flex shrink-0 items-center gap-2 text-xs">
                      {on ? 'On' : 'Off'}
                      <input type="checkbox" checked={on} onChange={() => toggle(k)} className="h-5 w-5 accent-primary" />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}

      {error && builtIn && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <SaveBar saved={saved} onSave={save} />
    </div>
  );
};

/* ------------------------------------------------------------ Chat button */

export const ChatAdmin = ({ onPublish }: { onPublish: Publish }) => {
  const [chat, setChat] = useState<ChatSettings>(loadChat);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<ChatSettings>) => { setChat({ ...chat, ...patch }); setSaved(false); };
  const bot = cleanBotName(chat.telegramBot);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Chat button &amp; Telegram bot</h2>
        <p className="text-sm text-muted-foreground">The round chat button at the bottom-right of every page. Visitors pick WhatsApp or your Telegram bot. WhatsApp uses the number in the “WhatsApp Number” tab.</p>
      </div>
      <section className={card}>
        <label className="flex items-center justify-between gap-4 text-sm font-semibold">Show the chat button on the website
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={chat.enabled} onChange={(e) => set({ enabled: e.target.checked })} /></label>
        <label className="block space-y-1.5"><span className={label}>Greeting shown when the chat opens</span>
          <textarea id="chat-greeting" rows={2} className={input} value={chat.greeting} onChange={(e) => set({ greeting: e.target.value })} /></label>
      </section>
      <section className={card}>
        <label className="flex items-center justify-between gap-4 text-sm font-semibold">WhatsApp chat
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={chat.whatsapp} onChange={(e) => set({ whatsapp: e.target.checked })} /></label>
        <label className="block space-y-1.5"><span className={label}>Message typed for the visitor when WhatsApp opens</span>
          <input id="chat-wa-text" className={input} value={chat.whatsappText} onChange={(e) => set({ whatsappText: e.target.value })} /></label>
      </section>
      <section className={card}>
        <label className="flex items-center justify-between gap-4 text-sm font-semibold">Telegram bot
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={chat.telegram} onChange={(e) => set({ telegram: e.target.checked })} /></label>
        <label className="block space-y-1.5"><span className={label}>Bot username (from @BotFather), e.g. TechGuardiansBot</span>
          <input id="chat-tg-bot" className={input} placeholder="TechGuardiansBot" value={chat.telegramBot} onChange={(e) => set({ telegramBot: e.target.value })} /></label>
        {bot ? <a href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline">Test t.me/{bot} <ExternalLink className="h-3.5 w-3.5" /></a>
          : <p className="text-xs text-muted-foreground">Leave empty to show WhatsApp only. To create a bot: open Telegram, message <b>@BotFather</b>, send <code>/newbot</code>, choose a name and a username ending in “bot”, then paste that username here. The bot’s replies are set up in Telegram (or a bot service); this button opens a chat with it.</p>}
      </section>
      <SaveBar saved={saved} onSave={() => void onPublish(saveChat(chat), () => setSaved(true))} />
    </div>
  );
};
