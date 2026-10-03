import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { uploadImage } from '@/lib/api';
import { newRowId, readList, saveList, type ListDef, type ListRow } from '@/lib/content-lists';
import { seedRows } from '@/lib/local-content';
import { shrinkImageFile } from '@/lib/image-tools';

const inputClass = 'w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground';

/** Add / edit / delete / reorder / show-hide rows of one managed list. */
const ListEditor = ({ def, onPublish }: { def: ListDef; onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void> }) => {
  const [rows, setRows] = useState<ListRow[]>([]);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const existing = readList(def);
    if (existing) setRows(existing);
    else void seedRows(def).then((seed) => { if (active) setRows(seed); });
    return () => { active = false; };
  }, [def]);

  const change = (next: ListRow[]) => { setRows(next); setSaved(false); };
  const update = (id: string, patch: Partial<ListRow>) => change(rows.map((r) => (r.id === id ? { ...r, ...patch } as ListRow : r)));
  const move = (index: number, dir: -1 | 1) => {
    const next = [...rows];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    change(next);
  };
  const add = () => {
    const row: ListRow = { id: newRowId(), visible: true };
    for (const f of def.fields) row[f.key] = f.type === 'select' ? f.options?.[0] || '' : '';
    change([...rows, row]);
  };

  const upload = async (id: string, key: string, file: File | undefined) => {
    if (!file) return;
    setError('');
    setBusy(`${id}:${key}`);
    try {
      const { url } = await uploadImage(await shrinkImageFile(file));
      update(id, { [key]: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The photo could not be uploaded.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{def.title}</h2>
        <p className="text-sm text-muted-foreground">{def.description}</p>
      </div>

      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No {def.itemLabel}s yet. Click “Add {def.itemLabel}” to create the first one.
        </p>
      )}

      {rows.map((row, i) => (
        <div key={row.id} className={`rounded-xl border border-border bg-card/70 p-5 space-y-3 ${row.visible ? '' : 'opacity-60'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {def.itemLabel} {i + 1}{row.visible ? '' : ' · hidden from website'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" className="rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
              <button onClick={() => update(row.id, { visible: !row.visible })} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">
                {row.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {row.visible ? 'Shown' : 'Hidden'}
              </button>
              {confirmDelete === row.id ? (
                <>
                  <button onClick={() => { change(rows.filter((r) => r.id !== row.id)); setConfirmDelete(null); }} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Delete</button>
                  <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-border px-3 py-2 text-xs">Keep</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(row.id)} aria-label={`Delete ${def.itemLabel}`} className="rounded-lg border border-destructive/40 p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {def.fields.map((f) => {
              const value = typeof row[f.key] === 'string' ? (row[f.key] as string) : '';
              const id = `${def.key}-${row.id}-${f.key}`;
              return (
                <label key={f.key} className={`block space-y-1.5 ${f.type === 'textarea' || f.type === 'image' ? 'md:col-span-2' : ''}`}>
                  <span className="text-xs font-semibold text-muted-foreground">{f.label}</span>
                  {f.type === 'textarea' ? (
                    <textarea id={id} rows={3} value={value} placeholder={f.placeholder} onChange={(e) => update(row.id, { [f.key]: e.target.value })} className={inputClass} />
                  ) : f.type === 'select' ? (
                    <select id={id} value={value} onChange={(e) => update(row.id, { [f.key]: e.target.value })} className={inputClass}>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'image' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      {value && <img src={value} alt="" className="h-16 w-24 rounded-md border border-border object-cover" />}
                      <input id={id} value={value} placeholder="Image link, or upload" onChange={(e) => update(row.id, { [f.key]: e.target.value })} className={`${inputClass} flex-1 min-w-[12rem]`} />
                      <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">
                        <ImagePlus className="h-4 w-4" /> {busy === `${row.id}:${f.key}` ? 'Uploading…' : 'Upload'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(row.id, f.key, e.target.files?.[0])} />
                      </span>
                    </div>
                  ) : (
                    <input id={id} value={value} placeholder={f.placeholder} onChange={(e) => update(row.id, { [f.key]: e.target.value })} className={inputClass} />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button onClick={add} className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"><Plus className="h-4 w-4" /> Add {def.itemLabel}</button>
        <button onClick={() => void onPublish(saveList(def, rows), () => setSaved(true))} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save & Publish</button>
        {saved && <span className="text-xs text-cyber-green">Published — the website is updated.</span>}
      </div>
    </div>
  );
};

export default ListEditor;
