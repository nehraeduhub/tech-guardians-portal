import ScrollReveal from './ScrollReveal';
import type { ListRow } from '@/lib/content-lists';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** A homepage section the admin created in Manage → Custom sections. */
const CustomSection = ({ row }: { row: ListRow }) => {
  const title = str(row.title);
  const subtitle = str(row.subtitle);
  const body = str(row.body);
  const image = str(row.image);
  const buttonText = str(row.buttonText);
  const rawLink = str(row.buttonLink).trim();
  // Only web, site-relative or in-page links; never javascript: or data: URLs.
  const buttonLink = /^(https?:\/\/|\/|#)/i.test(rawLink) ? rawLink : '';
  const external = /^https?:\/\//i.test(buttonLink);

  return (
    <section id={`custom-${row.id}`} className="section-padding relative">
      <div className="container mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className={`grid gap-10 items-center ${image ? 'lg:grid-cols-2' : ''}`}>
            <div className={image ? '' : 'text-center max-w-3xl mx-auto'}>
              {subtitle && <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">{subtitle}</span>}
              {title && <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground" style={{ textWrap: 'balance' }}>{title}</h2>}
              {body && <p className="mt-5 text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>}
              {buttonText && buttonLink && (
                <a
                  href={buttonLink}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="mt-7 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  {buttonText}
                </a>
              )}
            </div>
            {image && (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <img src={image} alt={title || 'Section image'} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CustomSection;
