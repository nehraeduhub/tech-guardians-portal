import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Image as ImageIcon } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { Badge } from '@/components/ui/badge';
import { loadMedia, type MediaItem } from '@/lib/local-content';

const MediaGallerySection = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    const refresh = () => void loadMedia().then(setItems);
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <section id="media" className="section-padding relative overflow-hidden">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 px-4 py-1 text-primary">
              Gallery
            </Badge>
            <h2 className="font-display text-3xl font-bold md:text-4xl" style={{ textWrap: 'balance' as any }}>
              Media Gallery
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="flex justify-center gap-2 mb-10">
            {(['all', 'image', 'video'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium uppercase tracking-wider transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                }`}
              >
                {f === 'all' ? 'All' : f === 'image' ? 'Photos' : 'Videos'}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {filtered.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-16 text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-40" />
              <p>No media yet. Add photos in Manage → Media gallery.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((item, i) => (
              <ScrollReveal key={item.id} delay={0.04 * (i % 8)}>
                <motion.div
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted/30 border border-border/40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLightbox(item)}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.title || 'Gallery image'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="relative w-full h-full">
                      <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                        <div className="rounded-full bg-primary/90 p-3">
                          <Play className="h-6 w-6 text-primary-foreground fill-current" />
                        </div>
                      </div>
                    </div>
                  )}
                  {item.title && (
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                    </div>
                  )}
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 text-foreground/70 hover:text-foreground z-10" onClick={() => setLightbox(null)}>
              <X className="h-8 w-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl max-h-[85vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              {lightbox.type === 'image' ? (
                <img src={lightbox.url} alt={lightbox.title} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <video src={lightbox.url} controls autoPlay className="w-full max-h-[85vh] rounded-lg" />
              )}
              {lightbox.title && <p className="text-center mt-3 text-sm text-muted-foreground">{lightbox.title}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MediaGallerySection;
