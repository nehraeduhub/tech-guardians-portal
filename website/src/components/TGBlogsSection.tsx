import { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { loadBlogs, type TGBlog } from '@/lib/blogs-store';

const TGBlogsSection = () => {
  const [blogs, setBlogs] = useState<TGBlog[]>([]);
  const [open, setOpen] = useState<TGBlog | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    const refresh = () => setBlogs(loadBlogs().filter((b) => b.enabled && b.title.trim()));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  if (!blogs.length) return null;
  const visibleBlogs = blogs.filter((blog) => (blog.language || 'en') === language);

  return (
    <section id="tg-blogs" className="section-padding relative">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-cyber-green mb-4 block">TG Blogs</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Cyber Security <span className="neon-text-green text-cyber-green">Reads</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Practical guidance from our trainers and investigators — Keep Learning and Keep Sharing.
            </p>
          </div>
        </ScrollReveal>

        <div className="mb-8 flex justify-center" role="group" aria-label="Blog language">
          <div className="inline-flex rounded-lg border border-border bg-card/70 p-1">
            <button onClick={() => setLanguage('en')} className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${language === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>English</button>
            <button onClick={() => setLanguage('hi')} className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${language === 'hi' ? 'bg-cyber-green text-background' : 'text-muted-foreground hover:text-foreground'}`}>हिन्दी</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleBlogs.map((b, i) => (
            <ScrollReveal key={b.id} delay={i * 0.06}>
              <article className="glass-card overflow-hidden h-full flex flex-col hover:border-cyber-green/40 transition-colors">
                <div className="h-40 bg-muted/20 overflow-hidden">
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-cyber-green">{b.category}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground mt-2 leading-snug">{b.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">{b.summary}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[11px] text-muted-foreground">{b.date}</span>
                    <button
                      onClick={() => setOpen(b)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                    >
                      <BookOpen className="w-4 h-4" /> {language === 'hi' ? 'पढ़ें' : 'Read'}
                    </button>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(null)}
        >
          <div
            className="glass-card max-w-2xl w-full my-8 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-48 bg-muted/20">
              <img src={open.image} alt={open.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-cyber-green">{open.category}</span>
                  <h3 className="font-display text-xl font-bold text-foreground mt-1">{open.title}</h3>
                  <span className="text-[11px] text-muted-foreground">{open.date}</span>
                </div>
                <button onClick={() => setOpen(null)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground leading-7 whitespace-pre-line">{open.body}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TGBlogsSection;
