import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/catalog';
import { iconFor } from './icons';
import PriceTag from './PriceTag';
import { STATUS_STYLE } from './styles';


const ProductCard = ({ product }: { product: Product }) => {
  const Icon = iconFor(product.icon_name);
  return (
    <Link to={`/products/${product.id}`} className="tg-card group flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="tg-icon-tile !h-14 !w-14 bg-gradient-to-br from-primary to-[hsl(var(--cyber-purple))] !text-white shadow-[0_12px_24px_-12px_hsl(var(--primary)/0.8)]"><Icon className="h-7 w-7" /></span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATUS_STYLE[product.status] || STATUS_STYLE['On request']}`}>{product.status}</span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary">{product.category}</p>
      <h3 className="mt-1 text-xl font-bold text-foreground group-hover:text-primary">{product.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
      <ul className="mt-4 space-y-2 text-sm text-foreground/85">
        {product.features.slice(0, 3).map((f) => <li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--cyber-green))]" />{f}</li>)}
      </ul>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
        <PriceTag price={product.price} offer={product.offer} note={product.priceNote || 'Price on request'} />
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
};

export default ProductCard;
