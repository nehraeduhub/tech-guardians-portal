import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GraduationCap, Headset, MessageCircle, PlayCircle, ShieldCheck, ShoppingCart, Sparkles } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import PageHero from '@/components/pro/PageHero';
import SectionHeading from '@/components/pro/SectionHeading';
import ProductCard from '@/components/pro/ProductCard';
import ProductAds from '@/components/home/ProductAds';
import { STATUS_STYLE } from '@/components/pro/styles';
import PriceTag from '@/components/pro/PriceTag';
import ScrollReveal from '@/components/ScrollReveal';
import { iconFor } from '@/components/pro/icons';
import NotFound from '@/pages/NotFound';
import { useProducts, type Product } from '@/lib/catalog';
import { programPrice } from '@/lib/courses-store';
import { waLink } from '@/lib/site-settings';

const ctaFor = (p: Product) => {
  const priced = programPrice(p).sale > 0;
  if (p.cta === 'link' && /^(https?:\/\/|\/)/i.test(p.ctaLink)) return { label: 'Get it now', href: p.ctaLink, icon: ArrowRight, external: /^https?:/i.test(p.ctaLink) };
  if (p.cta === 'buy' && priced && p.status !== 'Coming soon') return { label: 'Buy now', href: `/courses/payment.html?product_item=${encodeURIComponent(p.id)}`, icon: ShoppingCart, external: false };
  const text = p.cta === 'demo' ? `Hi Tech Guardians, I would like a demo of ${p.name}.` : `Hi Tech Guardians, I am interested in ${p.name}.`;
  return { label: p.status === 'Coming soon' ? 'Join the early-access list' : p.cta === 'demo' ? 'Request a demo' : 'Get a quote', href: waLink(text), icon: p.cta === 'demo' ? PlayCircle : MessageCircle, external: true };
};

export const ProductList = () => {
  const products = useProducts().filter((p) => p.visible && p.name);
  const categories = Array.from(new Set(products.map((p) => p.category)));
  return (
    <SiteFrame>
      <PageHero
        variant="crystal"
        eyebrow="Products & Solutions"
        title="Security tools and services"
        accent="built for real-world defence"
        lead="Vulnerability assessment, Windows audit and hardening, secure website and app development — with hands-on product training for your team."
        actions={<>
          <a href="#catalogue" className="tg-btn-primary">See all products <ArrowRight className="h-4 w-4" /></a>
          <a href={waLink('Hi Tech Guardians, I would like to discuss a product or service.')} target="_blank" rel="noopener noreferrer" className="tg-btn-outline"><MessageCircle className="h-4 w-4" /> Talk to us</a>
        </>}
      />
      <ProductAds id="product-videos" />
      <div id="catalogue" className="scroll-mt-24">
        {categories.map((cat, ci) => (
          <section key={cat} className={`tg-section ${ci % 2 ? 'border-y border-border bg-card' : ''}`}>
            <div className="tg-container">
              <SectionHeading center={false} eyebrow={cat} title={cat === 'Security Tool' ? 'Security tools' : cat === 'Service' ? 'Services' : cat} />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.filter((p) => p.category === cat).map((p, i) => <ScrollReveal key={p.id} delay={i * 0.05}><ProductCard product={p} /></ScrollReveal>)}
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="tg-section">
        <div className="tg-container grid gap-5 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: 'Security first', d: 'Every tool and project is tested the way attackers would test it.' },
            { icon: GraduationCap, t: 'Training included', d: 'Your team learns to use each tool with live, hands-on sessions.' },
            { icon: Headset, t: 'Direct support', d: 'Reach the people who build the product on WhatsApp and email.' },
          ].map((x) => (
            <div key={x.t} className="tg-card p-6"><span className="tg-icon-tile"><x.icon className="h-6 w-6" /></span><h3 className="mt-4 font-bold">{x.t}</h3><p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p></div>
          ))}
        </div>
      </section>
    </SiteFrame>
  );
};

export const ProductDetail = () => {
  const { id = '' } = useParams();
  const products = useProducts();
  const p = products.find((x) => x.id === id && x.visible);
  if (!p) return <NotFound />;
  const cta = ctaFor(p);
  const Icon = iconFor(p.icon_name);
  const others = products.filter((x) => x.visible && x.id !== p.id && x.name).slice(0, 3);

  return (
    <SiteFrame>
      <PageHero
        variant="crystal"
        eyebrow={p.category}
        title={p.name}
        lead={p.tagline}
        actions={<>
          <a href={cta.href} {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="tg-btn-primary"><cta.icon className="h-4 w-4" />{cta.label}</a>
          <Link to="/products" className="tg-btn-outline">All products</Link>
        </>}
      >
        <span className={`mt-6 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[p.status] || ''}`}>{p.status}</span>
      </PageHero>

      <div className="tg-container grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-16">
        <div className="min-w-0 space-y-10">
          {p.image && <img src={p.image} alt="" className="aspect-[16/8] w-full rounded-2xl border border-border object-cover" />}
          <section>
            <h2 className="text-2xl font-extrabold">Overview</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{p.description}</p>
          </section>
          {!!p.features.length && (
            <section>
              <h2 className="text-2xl font-extrabold">What you get</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {p.features.map((f) => <li key={f} className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm"><CheckCircle2 className="h-5 w-5 shrink-0 text-[hsl(var(--cyber-green))]" />{f}</li>)}
              </ul>
            </section>
          )}
          {p.trainingIncluded && (
            <section className="tg-dark tg-band flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="h-6 w-6" /></span>
              <div className="flex-1"><h2 className="text-lg font-bold text-white">Product training included</h2><p className="text-sm text-muted-foreground">We train your team to install, use and report with {p.name}.</p></div>
            </section>
          )}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="tg-card p-6">
            <span className="tg-icon-tile !h-14 !w-14"><Icon className="h-7 w-7" /></span>
            <h2 className="mt-4 text-lg font-bold">{p.name}</h2>
            <div className="mt-3"><PriceTag price={p.price} offer={p.offer} note={p.priceNote || 'Price on request'} size="lg" /></div>
            {programPrice(p).sale > 0 && p.priceNote && <p className="mt-1 text-xs text-muted-foreground">{p.priceNote}</p>}
            <a href={cta.href} {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="tg-btn-primary mt-5 w-full !py-3.5"><cta.icon className="h-4 w-4" />{cta.label}</a>
            <a href={waLink(`Hi Tech Guardians, I have a question about ${p.name}.`)} target="_blank" rel="noopener noreferrer" className="tg-btn-outline mt-3 w-full"><MessageCircle className="h-4 w-4" />Ask a question</a>
            {p.status === 'Coming soon' && <p className="mt-4 flex gap-2 text-xs text-muted-foreground"><Sparkles className="h-4 w-4 shrink-0 text-primary" />This product is launching soon. Message us to get early access and launch pricing.</p>}
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="tg-section border-t border-border bg-card">
          <div className="tg-container">
            <SectionHeading center={false} eyebrow="More from Tech Guardians" title="Other products and services" />
            <div className="grid gap-6 md:grid-cols-3">{others.map((o) => <ProductCard key={o.id} product={o} />)}</div>
          </div>
        </section>
      )}
    </SiteFrame>
  );
};
