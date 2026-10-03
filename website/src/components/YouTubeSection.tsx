import { useEffect, useState } from 'react';
import { Play, Youtube } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { loadVideos, type VideoItem } from '@/lib/local-content';

const YouTubeSection = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    void loadVideos().then(setVideos);
  }, []);

  if (videos.length === 0) return null;

  return (
    <section id="videos" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">
              Video Training
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Watch &amp; Learn <span className="neon-text text-primary">Cyber Security</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
              Curated cybersecurity tutorials from trusted creators. Learn at your own pace.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <ScrollReveal key={v.id} delay={i * 0.05}>
              <div className="group relative rounded-xl overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-15px_hsl(var(--primary)/0.4)]">
                <div className="relative aspect-video bg-muted/40">
                  {active === v.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
                      title={v.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      onClick={() => setActive(v.id)}
                      className="absolute inset-0 w-full h-full"
                      aria-label={`Play ${v.title}`}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/80 via-background/10 to-transparent">
                        <div className="rounded-full bg-[hsl(var(--cyber-red,0_82%_61%))] p-4 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <Youtube className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <h3 className="font-display text-sm font-semibold text-foreground leading-snug">
                      {v.title}
                    </h3>
                  </div>
                  {v.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {v.description}
                    </p>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
