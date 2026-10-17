import { useRef, useState } from 'react';
import { Bold, Code2, Eye, Heading2, Heading3, Italic, Link2, List, ListOrdered, Minus, PenLine, Plus, Quote, Trash2 } from 'lucide-react';
import BlogBody from './BlogBody';
import { BLOG_CATEGORIES, countWords, readMinutes, type PostDraft } from '@/lib/blog-posts';

// Professional, text-only article editor: formatting toolbar (simple
// Markdown), write/preview, word count, labels and reference links.

const input = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';

const BlogEditor = ({ draft, onChange }: { draft: PostDraft; onChange: (d: PostDraft) => void }) => {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [tagText, setTagText] = useState(draft.tags.join(', '));
  const area = useRef<HTMLTextAreaElement>(null);
  const set = (patch: Partial<PostDraft>) => onChange({ ...draft, ...patch });
  const words = countWords(draft.body);

  /** Wrap the selection, or prefix each selected line. */
  const format = (kind: 'h2' | 'h3' | 'bold' | 'italic' | 'quote' | 'ul' | 'ol' | 'code' | 'link' | 'hr') => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e);
    let insert = '';
    let cursor: [number, number] | null = null;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const prefixLines = (p: (i: number) => string) => {
      const block = value.slice(lineStart, e) || '';
      const out = (block || 'Text').split('\n').map((l, i) => p(i) + l.replace(/^(#{1,3}\s|>\s?|[-*]\s|\d+\.\s)/, '')).join('\n');
      const next = value.slice(0, lineStart) + out + value.slice(e);
      set({ body: next });
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(lineStart, lineStart + out.length); });
    };
    switch (kind) {
      case 'h2': return prefixLines(() => '## ');
      case 'h3': return prefixLines(() => '### ');
      case 'quote': return prefixLines(() => '> ');
      case 'ul': return prefixLines(() => '- ');
      case 'ol': return prefixLines((i) => `${i + 1}. `);
      case 'bold': insert = `**${sel || 'bold text'}**`; cursor = [s + 2, s + insert.length - 2]; break;
      case 'italic': insert = `*${sel || 'italic text'}*`; cursor = [s + 1, s + insert.length - 1]; break;
      case 'code': insert = sel.includes('\n') ? `\n\`\`\`\n${sel}\n\`\`\`\n` : `\`${sel || 'command'}\``; break;
      case 'link': {
        const url = window.prompt('Paste the link (https://…)', 'https://');
        if (!url || !/^https?:\/\/\S+$/i.test(url)) return;
        insert = `[${sel || 'link text'}](${url})`;
        break;
      }
      case 'hr': insert = '\n\n---\n\n'; break;
    }
    const next = value.slice(0, s) + insert + value.slice(e);
    set({ body: next });
    requestAnimationFrame(() => { el.focus(); if (cursor) el.setSelectionRange(cursor[0], cursor[1]); else el.setSelectionRange(s + insert.length, s + insert.length); });
  };

  const tools: { k: Parameters<typeof format>[0]; icon: typeof Bold; label: string }[] = [
    { k: 'h2', icon: Heading2, label: 'Heading' }, { k: 'h3', icon: Heading3, label: 'Subheading' },
    { k: 'bold', icon: Bold, label: 'Bold' }, { k: 'italic', icon: Italic, label: 'Italic' },
    { k: 'quote', icon: Quote, label: 'Quote' }, { k: 'ul', icon: List, label: 'Bullet list' }, { k: 'ol', icon: ListOrdered, label: 'Numbered list' },
    { k: 'code', icon: Code2, label: 'Code / command' }, { k: 'link', icon: Link2, label: 'Link' }, { k: 'hr', icon: Minus, label: 'Divider' },
  ];
  const setRef = (i: number, patch: Partial<PostDraft['refs'][number]>) => set({ refs: draft.refs.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

  return (
    <div className="space-y-5">
      <input
        aria-label="Article title"
        value={draft.title}
        onChange={(e) => set({ title: e.target.value })}
        placeholder="Article title"
        maxLength={150}
        className="w-full border-0 border-b-2 border-border bg-transparent px-0 pb-3 font-display text-2xl font-extrabold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none md:text-3xl"
      />
      <div className="grid gap-3 md:grid-cols-[220px_1fr]">
        <label className="space-y-1"><span className="text-xs font-semibold text-muted-foreground">Category</span>
          <select className={input} value={draft.category} onChange={(e) => set({ category: e.target.value })}>
            {[...new Set([...BLOG_CATEGORIES, draft.category])].map((c) => <option key={c}>{c}</option>)}
          </select></label>
        <label className="space-y-1"><span className="text-xs font-semibold text-muted-foreground">Labels (comma separated, up to 8)</span>
          <input className={input} value={tagText} placeholder="e.g. UPI fraud, Phishing, Awareness"
            onChange={(e) => { setTagText(e.target.value); set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8) }); }} /></label>
      </div>
      <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">Short summary (optional — shown on the blog home page)</span>
        <textarea className={input} rows={2} maxLength={300} value={draft.excerpt} onChange={(e) => set({ excerpt: e.target.value })} placeholder="One or two sentences about what readers will learn." /></label>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
          <div className="mr-2 flex rounded-lg bg-background p-0.5">
            <button type="button" onClick={() => setMode('write')} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'write' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><PenLine className="h-3.5 w-3.5" /> Write</button>
            <button type="button" onClick={() => setMode('preview')} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><Eye className="h-3.5 w-3.5" /> Preview</button>
          </div>
          {mode === 'write' && tools.map((t) => (
            <button key={t.k} type="button" title={t.label} aria-label={t.label} onClick={() => format(t.k)} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"><t.icon className="h-4 w-4" /></button>
          ))}
          <span className="ml-auto px-2 text-xs text-muted-foreground">{words} words · {readMinutes(words)} min read</span>
        </div>
        {mode === 'write' ? (
          <textarea
            ref={area}
            aria-label="Article text"
            value={draft.body}
            onChange={(e) => set({ body: e.target.value })}
            placeholder={'Start writing your article…\n\nTips: use the toolbar for headings, lists, quotes and code. Leave an empty line between paragraphs.'}
            className="min-h-[420px] w-full resize-y bg-card px-5 py-4 font-serif text-[17px] leading-8 text-foreground focus:outline-none"
          />
        ) : (
          <div className="min-h-[420px] px-6 py-4 font-serif">
            {draft.title && <h1 className="mb-2 text-3xl font-extrabold">{draft.title}</h1>}
            {draft.body.trim() ? <BlogBody text={draft.body} /> : <p className="py-10 text-center text-muted-foreground">Nothing to preview yet.</p>}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold">References ({draft.refs.length})</h3>
          <button type="button" onClick={() => set({ refs: [...draft.refs, { title: '', url: 'https://' }] })} disabled={draft.refs.length >= 25} className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"><Plus className="h-3.5 w-3.5" /> Add reference</button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Credit your sources — official advisories, documentation, news reports. They appear as a numbered list under the article.</p>
        <ol className="mt-3 space-y-2">
          {draft.refs.map((r, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[24px_1fr_1.4fr_auto] sm:items-center">
              <span className="hidden text-sm font-semibold text-muted-foreground sm:block">{i + 1}.</span>
              <input aria-label={`Reference ${i + 1} title`} className={input} value={r.title} placeholder="Title, e.g. CERT-In advisory CIAD-2026-0012" onChange={(e) => setRef(i, { title: e.target.value })} />
              <input aria-label={`Reference ${i + 1} link`} className={`${input} ${r.url && !/^https?:\/\/\S+\.\S+/.test(r.url) ? 'border-destructive' : ''}`} value={r.url} placeholder="https://…" onChange={(e) => setRef(i, { url: e.target.value })} />
              <button type="button" aria-label={`Remove reference ${i + 1}`} onClick={() => set({ refs: draft.refs.filter((_, j) => j !== i) })} className="justify-self-start rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default BlogEditor;
