import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Check, Copy, Download, ExternalLink, MessageCircle, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { deleteOrder, loadOrders, setOrderStatus, sheetSyncStatus, syncSheet, type Order, type SheetSyncStatus } from '@/lib/store';

type Filter = 'all' | 'pending' | 'approved' | 'rejected' | 'pdf' | 'course' | 'sheet';
const FILTERS: [Filter, string][] = [
  ['all', 'All'], ['pending', 'Waiting for approval'], ['approved', 'Approved'], ['rejected', 'Rejected'],
  ['pdf', 'PDF sales'], ['course', 'Courses'], ['sheet', 'From Google Sheet'],
];
const STATUS_STYLE: Record<Order['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/40',
  recorded: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
};
const STATUS_LABEL: Record<Order['status'], string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', recorded: 'From sheet' };

const amountNumber = (a?: string) => Number(String(a || '').replace(/[^\d.]/g, '')) || 0;
const ago = (unix: number) => {
  if (!unix) return 'never';
  const s = Math.max(0, Math.round(Date.now() / 1000 - unix));
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)} min ago` : new Date(unix * 1000).toLocaleString('en-IN');
};

/** Admin: every course and PDF order, plus rows synced from the Google Sheet. */
const PaymentsPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sync, setSync] = useState<SheetSyncStatus | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [shot, setShot] = useState<string | null>(null);
  const [copied, setCopied] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setOrders(await loadOrders());
      setSync(await sheetSyncStatus());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load payments.');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const shown = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return orders.filter((o) => {
      if (filter === 'pdf' || filter === 'course' || filter === 'sheet') { if ((o.type || 'course') !== filter) return false; }
      else if (filter !== 'all' && o.status !== filter) return false;
      const hay = [o.name, o.email, o.phone, o.course, o.utr, o.amount].join(' ').toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [orders, filter, q]);

  const counts = useMemo(() => ({
    pending: orders.filter((o) => o.status === 'pending').length,
    approvedTotal: orders.filter((o) => o.status === 'approved' || o.status === 'recorded').reduce((s, o) => s + amountNumber(o.amount), 0),
    pdf: orders.filter((o) => o.type === 'pdf' && o.status === 'approved').length,
  }), [orders]);

  const act = async (id: string, job: () => Promise<unknown>) => {
    setBusy(id);
    try { await job(); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'That did not work. Try again.'); }
    finally { setBusy(''); }
  };
  const runSync = async () => {
    setBusy('sync');
    try { setSync(await syncSheet()); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Sync failed.'); }
    finally { setBusy(''); }
  };
  const fullLink = (o: Order) => (o.orderUrl ? `${window.location.origin}${o.orderUrl}` : '');
  const copyLink = (o: Order) => {
    void navigator.clipboard?.writeText(fullLink(o)).then(() => { setCopied(o.id); setTimeout(() => setCopied(''), 1600); }).catch(() => undefined);
  };
  const waLink = (o: Order) => {
    const phone = String(o.phone || '').replace(/\D/g, '');
    const to = phone.length === 10 ? `91${phone}` : phone;
    const msg = o.type === 'pdf'
      ? `Hi ${o.name?.split(' ')[0] || ''}, thank you for buying "${o.course}" from Tech Guardians. Your payment is confirmed. Download your PDF here: ${fullLink(o)}`
      : `Hi ${o.name?.split(' ')[0] || ''}, your payment for "${o.course}" is confirmed. Welcome to Tech Guardians! Your order: ${fullLink(o)}`;
    return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
  };
  const exportExcel = () => {
    const rows = shown.map((o) => ({
      Date: o.date || o.received_at || '', Name: o.name || '', Email: o.email || '', Phone: o.phone || '',
      Item: o.course || '', Type: o.type, Amount: o.amount || '', 'UTR / Transaction ID': o.utr || '', Status: STATUS_LABEL[o.status] || o.status,
      Downloads: o.downloads || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'tech-guardians-payments.xlsx');
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"><div className="text-2xl font-bold tabular-nums">{counts.pending}</div><div className="text-xs text-muted-foreground">Waiting for your approval</div></div>
        <div className="rounded-xl border border-border bg-card/70 p-4"><div className="text-2xl font-bold tabular-nums">₹{counts.approvedTotal.toLocaleString('en-IN')}</div><div className="text-xs text-muted-foreground">Approved and sheet payments</div></div>
        <div className="rounded-xl border border-border bg-card/70 p-4"><div className="text-2xl font-bold tabular-nums">{counts.pdf}</div><div className="text-xs text-muted-foreground">PDFs sold</div></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/70 px-4 py-3 text-sm">
        <span>
          <strong>Google Sheet:</strong>{' '}
          {!sync || sync.enabled === false ? 'automatic sync is off (turn it on in PDF Store → Google Sheet).'
            : sync.ok === false ? <span className="text-destructive">last sync failed — {sync.error}</span>
              : `synced ${ago(sync.at)}${typeof sync.rows === 'number' ? ` · ${sync.rows} rows in sheet` : ''}`}
        </span>
        <span className="flex flex-wrap gap-2">
          <button onClick={() => void runSync()} disabled={busy === 'sync'} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs hover:bg-muted disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${busy === 'sync' ? 'animate-spin' : ''}`} /> Sync sheet now</button>
          <button onClick={exportExcel} disabled={!shown.length} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs hover:bg-muted disabled:opacity-50"><Download className="h-3.5 w-3.5" /> Export Excel</button>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input id="pay-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, UTR, item…" className="w-full rounded-lg border border-border bg-muted/30 py-2 pl-9 pr-3 text-sm" />
        </label>
        {FILTERS.map(([id, text]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === id ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
            {text}{id === 'pending' && counts.pending ? ` (${counts.pending})` : ''}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <div className="space-y-3">
        {shown.length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No payments here yet. New orders appear automatically.</p>}
        {shown.map((o) => (
          <div key={o.id} className="grid gap-3 rounded-xl border border-border bg-card/70 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex min-w-0 gap-3">
              {o.shot ? (
                <button onClick={() => setShot(o.shot || null)} className="shrink-0" aria-label="View payment screenshot"><img src={o.shot} alt="" className="h-14 w-14 rounded-lg border border-border object-cover" /></button>
              ) : <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-dashed border-border text-[10px] text-muted-foreground">No image</div>}
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{o.name || 'Unknown'}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{o.type === 'pdf' ? 'PDF' : o.type === 'sheet' ? 'Sheet' : 'Course'}</span>
                  {o.type === 'pdf' && o.status === 'approved' && <span className="text-[11px] text-muted-foreground">downloaded {o.downloads || 0}×</span>}
                </div>
                <div className="truncate text-sm">{o.course || '—'} · <strong className="tabular-nums">{o.amount || '—'}</strong></div>
                <div className="text-xs text-muted-foreground break-all">
                  UTR <span className="font-mono">{o.utr || '—'}</span> · {o.phone || 'no phone'} · {o.email || 'no email'} · {o.date || (o.received_at ? new Date(o.received_at).toLocaleString('en-IN') : '')}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              {o.type !== 'sheet' && o.status !== 'approved' && (
                <button disabled={busy === o.id} onClick={() => void act(o.id, () => setOrderStatus(o.id, 'approved'))} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"><Check className="h-4 w-4" /> Approve</button>
              )}
              {o.type !== 'sheet' && o.status !== 'rejected' && (
                <button disabled={busy === o.id} onClick={() => void act(o.id, () => setOrderStatus(o.id, 'rejected'))} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"><X className="h-4 w-4" /> Reject</button>
              )}
              {o.orderUrl && (
                <>
                  <a href={waLink(o)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><MessageCircle className="h-4 w-4" /> WhatsApp buyer</a>
                  <button onClick={() => copyLink(o)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"><Copy className="h-4 w-4" /> {copied === o.id ? 'Copied' : 'Order link'}</button>
                  <a href={o.orderUrl} target="_blank" rel="noopener noreferrer" aria-label="Open order page" className="rounded-lg border border-border p-2 hover:bg-muted"><ExternalLink className="h-4 w-4" /></a>
                </>
              )}
              {confirmDelete === o.id ? (
                <>
                  <button onClick={() => { setConfirmDelete(null); void act(o.id, () => deleteOrder(o.id)); }} className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Delete</button>
                  <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-border px-3 py-2 text-xs">Keep</button>
                </>
              ) : (
                <button onClick={() => setConfirmDelete(o.id)} aria-label="Delete record" className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {shot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm" onClick={() => setShot(null)}>
          <img src={shot} alt="Payment screenshot" className="max-h-[85vh] max-w-full rounded-xl border border-border" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default PaymentsPanel;
