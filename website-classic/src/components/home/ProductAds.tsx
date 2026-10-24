import { useEffect, useRef, useState } from 'react';
import { Pause, Play, ShoppingCart } from 'lucide-react';
import { PRODUCT_ADS, useList } from '@/lib/content-lists';
import { waLink } from '@/lib/site-settings';
import { safeLink } from '@/lib/utils';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Product video advertisements (Manage → Product Video Ads). Videos play
 * silently, one after another, on a navy stage that matches their own
 * background, with a single "Buy Now" call to action.
 */
const ProductAds = ({ id = 'product-ads' }: { id?: string }) => {
  const ads = (useList(PRODUCT_ADS) ?? PRODUCT_ADS.seed ?? [])
    .filter((r) => r.visible && str(r.video) && str(r.title))
    .map((r) => ({
      id: r.id, title: str(r.title), tagline: str(r.tagline), video: str(r.video), videoWebm: str(r.videoWebm), poster: str(r.poster),
      badge: str(r.badge), price: str(r.price), buttonText: str(r.buttonText) || 'Buy Now', buttonLink: str(r.buttonLink),
    }));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const count = ads.length;
  const ad = ads[Math.min(index, Math.max(count - 1, 0))];

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [count]);

  // Play only while visible on screen (saves data and battery).
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView && playing) void v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [inView, playing, index]);

  if (!count || !ad) return null;
  const select = (n: number) => { setIndex(n); setProgress(0); setPlaying(true); setPortrait(false); };
  const buyHref = ad.buttonLink ? safeLink(ad.buttonLink) : waLink(`Hi Tech Guardians, I want to buy ${ad.title}.`);
  const external = /^https?:/i.test(buyHref);

  return (
    <section id={id} className="tg-dark relative overflow-hidden py-16 md:py-20" style={{ background: 'radial-gradient(900px 520px at 25% 30%, #123a73 0%, #0a2147 55%, #050f24 100%)' }}>
      <div className="tg-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffb24d]">Product spotlight</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">See it in action. <span className="text-[#ffb24d]">Buy in one click.</span></h2>
          </div>
          {count > 1 && <p className="text-sm text-slate-300">{count} products · playing {index + 1} of {count}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr] lg:items-start">
          {/* Stage: the navy matches the videos, so they sit on the page without a visible frame */}
          <div ref={stage} className="relative min-w-0">
            <div className={`relative overflow-hidden rounded-xl ${portrait ? 'aspect-[4/5] sm:aspect-video' : 'aspect-video'}`} style={{ background: 'radial-gradient(60% 70% at 50% 40%, #0f2f5e, #071a38)' }}>
              <video
                key={ad.id}
                ref={video}
                poster={ad.poster || undefined}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-contain"
                onLoadedMetadata={(e) => setPortrait(e.currentTarget.videoHeight > e.currentTarget.videoWidth)}
                onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
                onEnded={() => (count > 1 ? select((index + 1) % count) : video.current && void video.current.play())}
                onClick={() => setPlaying((p) => !p)}
              >
                {/* MP4 for Safari and most browsers; the WebM copy for browsers without H.264. */}
                <source src={ad.video} type={/\.webm($|\?)/i.test(ad.video) ? 'video/webm' : 'video/mp4'} />
                {ad.videoWebm && <source src={ad.videoWebm} type="video/webm" />}
              </video>
              {ad.badge && <span className="absolute right-3 top-3 rounded bg-[#ff9933] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1a1206] shadow">{ad.badge}</span>}
              <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause video' : 'Play video'} className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10"><div className="h-full bg-[#ff9933] transition-[width] duration-200" style={{ width: `${progress * 100}%` }} /></div>
            </div>
          </div>

          {/* Details and Buy Now */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <h3 className="text-2xl font-extrabold leading-tight text-white">{ad.title}</h3>
              {ad.tagline && <p className="mt-2 text-sm leading-relaxed text-slate-300">{ad.tagline}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a href={buyHref} target={external ? '_blank' : undefined} rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff9933] px-7 py-3 text-base font-extrabold text-[#1a1206] shadow-[0_0_0_6px_rgba(255,153,51,.18),0_18px_40px_-12px_rgba(255,153,51,.7)] transition hover:-translate-y-0.5 hover:brightness-105">
                  <ShoppingCart className="h-5 w-5" /> {ad.buttonText}
                </a>
                {ad.price && <span className="text-2xl font-extrabold text-white">{ad.price}</span>}
              </div>
            </div>

            {count > 1 && (
              <ul className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="More product videos">
                {ads.map((a, n) => (
                  <li key={a.id} className="min-w-[15rem] lg:min-w-0">
                    <button onClick={() => select(n)} aria-current={n === index}
                      className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition ${n === index ? 'border-[#ff9933]/70 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}>
                      <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-[#071a38]">
                        {a.poster && <img src={a.poster} alt="" loading="lazy" className="h-full w-full object-contain" />}
                        {n === index && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#ff9933]" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-white">{a.title}</span>
                        <span className="block truncate text-xs text-slate-400">{n === index ? 'Now playing' : a.badge || 'Watch'}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductAds;
