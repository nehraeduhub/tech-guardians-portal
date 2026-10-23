import { inr, programPrice } from '@/lib/courses-store';

/** Sale price, crossed-out regular price and the real discount (never a fixed "50%"). */
const PriceTag = ({ price, offer, note, size = 'md' }: { price: string; offer: string; note?: string; size?: 'md' | 'lg' }) => {
  const p = programPrice({ price, offer });
  if (!p.sale) return note ? <span className="text-sm font-medium text-muted-foreground">{note}</span> : null;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-display font-extrabold text-foreground ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>{inr(p.sale)}</span>
      {p.regular > 0 && <s className="text-sm text-muted-foreground">{inr(p.regular)}</s>}
      {p.discount > 0 && <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 [.tg-dark_&]:text-emerald-300">{p.discount}% OFF</span>}
    </span>
  );
};

export default PriceTag;
