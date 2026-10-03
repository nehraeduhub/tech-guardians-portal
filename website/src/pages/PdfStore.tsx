import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Download, FileText, Lock, ShieldCheck, ShoppingCart, X } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import { checkoutUrl, loadProduct, loadStore, rupees, salePrice, type StoreProduct } from '@/lib/store';

const Price = ({ p, large }: { p: StoreProduct; large?: boolean }) => {
  const sale = salePrice(p);
  const off = p.offerPrice > 0 && p.price > p.offerPrice ? Math.round((1 - p.offerPrice / p.price) * 100) : 0;
  return (
    <span className="flex flex-wrap items-baseline gap-2">
      <span className={`${large ? 'text-4xl' : 'text-2xl'} font-bold text-foreground tabular-nums`}>{rupees(sale)}</span>
      {off > 0 && <span className="text-sm text-muted-foreground line-through tabular-nums">{rupees(p.price)}</span>}
      {off > 0 && <span className="rounded-full bg-cyber-green/15 px-2 py-0.5 text-xs font-bold text-cyber-green">{off}% off</span>}
    </span>
  );
};

const Steps = () => (
  <ol className="grid gap-3 sm:grid-cols-3">
    {[
      [ShoppingCart, 'Pay by UPI', 'Scan the QR or pay from any UPI app.'],
      [ShieldCheck, 'Submit the transaction ID', 'We match it with our bank records.'],
      [Download, 'Download your PDF', 'Your private download link opens on your order page.'],
    ].map(([Icon, title, text], i) => {
      const I = Icon as typeof ShoppingCart;
      return (
        <li key={i} className="flex gap-3 rounded-xl border border-border bg-card/60 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"><I className="h-4 w-4" /></span>
          <span><span className="block text-sm font-semibold">{i + 1}. {title as string}</span><span className="block text-xs text-muted-foreground">{text as string}</span></span>
        </li>
      );
    })}
  </ol>
);

/** /pdf-store — every PDF for sale. */
export const PdfStore = () => {
  const [products, setProducts] = useState<StoreProduct[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { loadStore().then((d) => setProducts(d.products)).catch(() => setError('The store could not be loaded. Please refresh the page.')); }, []);

  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding">
        <div className="container mx-auto max-w-6xl space-y-10">
          <header className="max-w-2xl space-y-3">
            <span className="text-xs font-display uppercase tracking-[0.3em] text-primary">Tech Guardians PDF Store</span>
            <h1 className="font-display text-3xl font-bold md:text-5xl" style={{ textWrap: 'balance' }}>Practical cyber security guides you can keep</h1>
            <p className="text-muted-foreground">Field-tested handbooks written by our trainers. Look inside before you buy, pay by UPI, and download instantly once your payment is confirmed.</p>
          </header>

          {error && <p role="alert" className="text-destructive">{error}</p>}
          {!products && !error && <p className="text-muted-foreground">Loading PDFs…</p>}
          {products && products.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">New PDFs are coming soon.</p>}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map((p) => (
              <article key={p.id} className="glass-card flex flex-col overflow-hidden">
                <Link to={`/pdf-store/${p.id}`} className="group relative block aspect-[4/5] overflow-hidden bg-muted/40">
                  {p.cover ? <img src={p.cover} alt={`${p.title} cover`} className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    : <div className="grid h-full place-items-center"><FileText className="h-14 w-14 text-muted-foreground" /></div>}
                  {p.previews.length > 0 && <span className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold backdrop-blur">👁 {p.previews.length} preview pages</span>}
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {p.pages > 0 && <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{p.pages} pages</span>}
                    {p.tags.slice(0, 3).map((t) => <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>)}
                  </div>
                  <h2 className="font-display text-lg font-semibold leading-snug"><Link to={`/pdf-store/${p.id}`} className="hover:text-primary">{p.title}</Link></h2>
                  {p.subtitle && <p className="text-sm text-muted-foreground">{p.subtitle}</p>}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Price p={p} />
                    <span className="flex gap-2">
                      <Link to={`/pdf-store/${p.id}`} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">Preview</Link>
                      <a href={checkoutUrl(p)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Buy now</a>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">How buying works</h2>
            <Steps />
            <p className="text-sm text-muted-foreground">Already paid? Open the order link shown after payment (also saved in this browser under “My purchases” on the payment page) to download again any time.</p>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
};

/** /pdf-store/:id — one PDF with its preview gallery. */
export const PdfProduct = () => {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    loadProduct(id).then((d) => { setProduct(d.product); document.title = `${d.product.title} — Tech Guardians PDF Store`; })
      .catch((e) => setError(e instanceof Error ? e.message : 'This PDF is not available.'));
  }, [id]);
  const gallery = useMemo(() => (product ? [product.cover, ...product.previews].filter(Boolean) : []), [product]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % gallery.length));
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + gallery.length) % gallery.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, gallery.length]);

  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding">
        <div className="container mx-auto max-w-6xl space-y-8">
          <Link to="/pdf-store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> All PDFs</Link>
          {error && <p role="alert" className="rounded-xl border border-border p-8 text-center text-muted-foreground">{error} <Link to="/pdf-store" className="text-primary underline">Browse the store</Link></p>}
          {!product && !error && <p className="text-muted-foreground">Loading…</p>}
          {product && (
            <>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div className="space-y-3">
                  <button onClick={() => setOpen(0)} className="block w-full overflow-hidden rounded-2xl border border-border bg-muted/30" aria-label="Open cover">
                    {product.cover ? <img src={product.cover} alt={`${product.title} cover`} className="w-full object-cover" /> : <div className="grid aspect-[4/5] place-items-center"><FileText className="h-16 w-16 text-muted-foreground" /></div>}
                  </button>
                  {gallery.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {gallery.slice(1).map((src, i) => (
                        <button key={src} onClick={() => setOpen(i + 1)} className="overflow-hidden rounded-lg border border-border hover:border-primary" aria-label={`Open preview page ${i + 1}`}>
                          <img src={src} alt="" className="aspect-[3/4] w-full object-cover object-top" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{product.format}</span>
                      {product.pages > 0 && <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{product.pages} pages</span>}
                      {product.tags.map((t) => <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{t}</span>)}
                    </div>
                    <h1 className="font-display text-3xl font-bold md:text-4xl" style={{ textWrap: 'balance' }}>{product.title}</h1>
                    {product.subtitle && <p className="text-lg text-muted-foreground">{product.subtitle}</p>}
                  </div>
                  <div className="space-y-4 rounded-2xl border border-border bg-card/70 p-5">
                    <Price p={product} large />
                    <a href={checkoutUrl(product)} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90"><ShoppingCart className="h-5 w-5" /> Buy now · {rupees(salePrice(product))}</a>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Pay by UPI. Your private download link opens on your order page once the payment is confirmed.</p>
                  </div>
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><BookOpen className="h-5 w-5 text-primary" /> What’s inside</h2>
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{product.description}</p>
                  </div>
                </div>
              </div>
              <Steps />
            </>
          )}
        </div>
      </section>

      {product && open !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur" role="dialog" aria-label="Preview pages" onClick={() => setOpen(null)}>
          <button onClick={() => setOpen(null)} className="absolute right-4 top-4 rounded-full border border-border p-2" aria-label="Close"><X className="h-5 w-5" /></button>
          {gallery.length > 1 && <button onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + gallery.length) % gallery.length); }} className="absolute left-3 rounded-full border border-border bg-background/80 p-2" aria-label="Previous page"><ChevronLeft className="h-6 w-6" /></button>}
          <img src={gallery[open]} alt={`Page ${open + 1}`} className="max-h-[88vh] max-w-full rounded-lg border border-border shadow-2xl" onClick={(e) => e.stopPropagation()} />
          {gallery.length > 1 && <button onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % gallery.length); }} className="absolute right-3 rounded-full border border-border bg-background/80 p-2" aria-label="Next page"><ChevronRight className="h-6 w-6" /></button>}
          <span className="absolute bottom-4 rounded-full bg-background/85 px-3 py-1 text-xs">{open + 1} / {gallery.length} · Preview</span>
        </div>
      )}
    </SiteFrame>
  );
};
