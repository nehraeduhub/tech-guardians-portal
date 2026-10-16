import { useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { uploadImage } from '@/lib/api';
import { shrinkImageFile } from '@/lib/image-tools';

// One editor for every admin list (Training Programs, Products, Portals, Events):
// add, edit, reorder, show/hide, delete, upload pictures, then Save & Publish.

const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none';

type Row = { id: string };

export interface RecordField<T> {
  key: keyof T & string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'image' | 'url' | 'date' | 'checkbox' | 'lines';
  options?: string[];
  placeholder?: string;
  hint?: string;
  wide?: boolean;
  rows?: number;
  /** For 'lines': how a stored value becomes text, and back. */
  format?: (value: unknown) => string;
  parse?: (text: string) => unknown;
}

interface Props<T extends Row> {
  title: string;
  description: ReactNode;
  itemLabel: string;
  rows: T[];
  fields: RecordField<T>[];
  visibleKey?: keyof T & string;
  heading: (row: T) => string;
  create: () => T;
  preview?: (row: T) => ReactNode;
  onSave: (rows: T[]) => Promise<unknown>;
  onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void>;
  extra?: ReactNode;
}

const toText = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

function RecordEditor<T extends Row>({ title, description, itemLabel, rows: initial, fields, visibleKey, heading, create, preview, onSave, onPublish, extra }: Props<T>) {
  const [rows, setRows] = useState<T[]>(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  // Text of "lines" fields while typing, so blank lines are not lost mid-edit.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => { setRows(initial); }, [initial]);

  const change = (next: T[]) => { setRows(next); setSaved(false); };
  const update = (id: string, patch: Partial<T>) => change(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...rows];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    change(next);
  };
  const upload = async (row: T, key: string, file?: File) => {
    if (!file) return;
    setBusy(`${row.id}:${key}`);
    setError('');
    try {
      const { url } = await uploadImage(await shrinkImageFile(file));
      update(row.id, { [key]: url } as Partial<T>);
    } catch (e) { setError(e instanceof Error ? e.message : 'The picture could not be uploaded.'); }
    finally { setBusy(''); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {extra}

      {rows.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No {itemLabel}s yet.</p>}

      {rows.map((row, i) => {
        const visible = visibleKey ? Boolean(row[visibleKey]) : true;
        const expanded = open === row.id;
        return (
          <div key={row.id} className={`rounded-xl border border-border bg-card ${visible ? '' : 'opacity-70'}`}>
            <div className="flex flex-wrap items-center gap-2 p-3">
              <button onClick={() => setOpen(expanded ? null : row.id)} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted" aria-expanded={expanded}>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                <span className="truncate font-semibold">{heading(row) || `New ${itemLabel}`}</span>
                {!visible && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">hidden</span>}
              </button>
              {preview && <span className="hidden text-sm sm:inline">{preview(row)}</span>}
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
              {visibleKey && (
                <button onClick={() => update(row.id, { [visibleKey]: !visible } as Partial<T>)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">
                  {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{visible ? 'Shown' : 'Hidden'}
                </button>
              )}
              {confirm === row.id ? (
                <>
                  <button onClick={() => { change(rows.filter((r) => r.id !== row.id)); setConfirm(null); }} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Delete</button>
                  <button onClick={() => setConfirm(null)} className="rounded-lg border border-border px-3 py-2 text-xs">Keep</button>
                </>
              ) : (
                <button onClick={() => setConfirm(row.id)} aria-label={`Delete ${itemLabel}`} className="rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
            {expanded && (
              <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
                {preview && <div className="md:col-span-2 sm:hidden">{preview(row)}</div>}
                {fields.map((f) => {
                  const id = `rec-${row.id}-${f.key}`;
                  const raw = row[f.key];
                  const wide = f.wide || f.type === 'textarea' || f.type === 'lines' || f.type === 'image';
                  if (f.type === 'checkbox') {
                    return (
                      <label key={f.key} className="flex items-center gap-2 text-sm md:col-span-1">
                        <input id={id} type="checkbox" checked={Boolean(raw)} onChange={(e) => update(row.id, { [f.key]: e.target.checked } as Partial<T>)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                        {f.label}
                      </label>
                    );
                  }
                  const draftKey = `${row.id}:${f.key}`;
                  const value = f.type === 'lines' ? (drafts[draftKey] ?? (f.format ? f.format(raw) : toText(raw))) : toText(raw);
                  const set = (text: string) => {
                    if (f.type === 'lines') {
                      setDrafts((d) => ({ ...d, [draftKey]: text }));
                      update(row.id, { [f.key]: f.parse ? f.parse(text) : text } as Partial<T>);
                    } else update(row.id, { [f.key]: text } as Partial<T>);
                  };
                  return (
                    <label key={f.key} className={`block space-y-1.5 ${wide ? 'md:col-span-2' : ''}`}>
                      <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
                      {f.type === 'textarea' || f.type === 'lines' ? (
                        <textarea id={id} rows={f.rows || (f.type === 'lines' ? 5 : 3)} value={value} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} className={`${inputClass} ${f.type === 'lines' ? 'font-mono text-[13px]' : ''}`} />
                      ) : f.type === 'select' ? (
                        <select id={id} value={value} onChange={(e) => set(e.target.value)} className={inputClass}>
                          {!f.options?.includes(value) && value && <option value={value}>{value}</option>}
                          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : f.type === 'image' ? (
                        <div className="flex flex-wrap items-center gap-3">
                          {value && <img src={value} alt="" className="h-16 w-24 rounded-md border border-border object-cover" />}
                          <input id={id} value={value} placeholder="Picture link, or upload" onChange={(e) => set(e.target.value)} className={`${inputClass} min-w-[12rem] flex-1`} />
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">
                            <ImagePlus className="h-4 w-4" />{busy === `${row.id}:${f.key}` ? 'Uploading…' : 'Upload'}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(row, f.key, e.target.files?.[0])} />
                          </span>
                        </div>
                      ) : (
                        <input id={id} type={f.type === 'date' ? 'date' : 'text'} value={value} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} className={inputClass} />
                      )}
                      {f.hint && <span className="block text-xs text-muted-foreground">{f.hint}</span>}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button onClick={() => { const r = create(); change([...rows, r]); setOpen(r.id); }} className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add {itemLabel}</button>
        <button onClick={() => void onPublish(onSave(rows), () => setSaved(true))} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save & Publish</button>
        {saved && <span className="text-xs text-[hsl(var(--cyber-green))]">Published — the website is updated.</span>}
      </div>
    </div>
  );
}

export default RecordEditor;
