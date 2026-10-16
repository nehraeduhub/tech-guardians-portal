import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Save } from 'lucide-react';
import { HOME_SECTIONS, SITE_PAGES, loadLayout, orderedSectionIds, saveLayout, type SiteLayout } from '@/lib/layout';
import { CUSTOM_SECTIONS, readList } from '@/lib/content-lists';

/** Show / hide / reorder homepage sections and switch whole pages on or off. */
const LayoutPanel = ({ onPublish }: { onPublish: (job: Promise<unknown>, onSuccess?: () => void) => Promise<void> }) => {
  const [layout, setLayout] = useState<SiteLayout>(loadLayout);
  const [saved, setSaved] = useState(false);
  const custom = useMemo(() => readList(CUSTOM_SECTIONS) || [], []);

  useEffect(() => { setLayout(loadLayout()); }, []);

  const order = orderedSectionIds(layout, custom.map((c) => c.id));
  const labelFor = (id: string) => {
    if (id.startsWith('custom:')) {
      const row = custom.find((c) => `custom:${c.id}` === id);
      return `Custom: ${typeof row?.title === 'string' && row.title ? row.title : 'untitled'}`;
    }
    return HOME_SECTIONS.find((s) => s.id === id)?.label || id;
  };
  const change = (next: SiteLayout) => { setLayout(next); setSaved(false); };
  const toggle = (list: 'hidden' | 'hiddenPages', id: string) =>
    change({ ...layout, [list]: layout[list].includes(id) ? layout[list].filter((x) => x !== id) : [...layout[list], id] });
  const move = (index: number, dir: -1 | 1) => {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    change({ ...layout, order: next });
  };
  const allSections = (show: boolean) => change({ ...layout, hidden: show ? [] : [...order] });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Homepage sections</h2>
            <p className="text-sm text-muted-foreground">Show, hide and reorder every section of the homepage.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => allSections(true)} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">Show all</button>
            <button onClick={() => allSections(false)} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted">Hide all</button>
          </div>
        </div>
        <ol className="divide-y divide-border rounded-xl border border-border bg-card/70">
          {order.map((id, i) => {
            const isHidden = layout.hidden.includes(id);
            return (
              <li key={id} className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 ${isHidden ? 'opacity-60' : ''}`}>
                <span className="text-sm text-foreground"><span className="mr-2 text-xs text-muted-foreground tabular-nums">{i + 1}.</span>{labelFor(id)}</span>
                <span className="flex gap-2">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-lg border border-border p-1.5 hover:bg-muted disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                  <button onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Move down" className="rounded-lg border border-border p-1.5 hover:bg-muted disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => toggle('hidden', id)} className="inline-flex w-24 items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted">
                    {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {isHidden ? 'Hidden' : 'Shown'}
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Pages</h2>
          <p className="text-sm text-muted-foreground">A hidden page disappears from the menus and shows “not found” if someone opens its link.</p>
        </div>
        <ul className="divide-y divide-border rounded-xl border border-border bg-card/70">
          {SITE_PAGES.map((p) => {
            const isHidden = layout.hiddenPages.includes(p.path);
            return (
              <li key={p.path} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${isHidden ? 'opacity-60' : ''}`}>
                <span className="text-sm">{p.label} <span className="text-xs text-muted-foreground">{p.path}</span></span>
                <button onClick={() => toggle('hiddenPages', p.path)} className="inline-flex w-24 items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted">
                  {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {isHidden ? 'Hidden' : 'Shown'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => void onPublish(saveLayout({ ...layout, order }), () => setSaved(true))} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save & Publish</button>
        {saved && <span className="text-xs text-cyber-green">Published — the website is updated.</span>}
      </div>
    </div>
  );
};

export default LayoutPanel;
