import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { checkoutUrl, loadStore, rupees, salePrice, type StoreProduct } from '@/lib/store';

/** Homepage section showing the PDFs for sale. */
const PdfStoreSection = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  useEffect(() => { loadStore().then((d) => setProducts(d.products)).catch(() => undefined); }, []);
  if (!products.length) return null;

  return (
    <section id="pdf-store" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-3 block text-xs font-display uppercase tracking-[0.3em] text-primary">PDF Store</span>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Handbooks by our trainers</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">Look inside, pay by UPI, and download your copy once payment is confirmed.</p>
            </div>
            <Link to="/pdf-store" className="rounded-full border border-primary/50 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">View all PDFs</Link>
          </div>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p) => (
            <article key={p.id} className="glass-card flex flex-col overflow-hidden">
              <Link to={`/pdf-store/${p.id}`} className="block aspect-[4/3] overflow-hidden bg-muted/40">
                {p.cover ? <img src={p.cover} alt={`${p.title} cover`} className="h-full w-full object-cover object-top" loading="lazy" /> : <div className="grid h-full place-items-center"><FileText className="h-12 w-12 text-muted-foreground" /></div>}
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-base font-semibold leading-snug">{p.title}</h3>
                {p.subtitle && <p className="text-sm text-muted-foreground">{p.subtitle}</p>}
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <span className="text-xl font-bold tabular-nums">{rupees(salePrice(p))}{p.offerPrice > 0 && p.price > p.offerPrice && <span className="ml-2 text-sm font-normal text-muted-foreground line-through">{rupees(p.price)}</span>}</span>
                  <a href={checkoutUrl(p)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Buy now</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PdfStoreSection;
