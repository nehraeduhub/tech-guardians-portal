import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, User, Clock, Search } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SiteFrame from '@/components/SiteFrame';
import { Badge } from '@/components/ui/badge';
import { loadBlogs, type BlogPost } from '@/lib/local-content';

const formatDate = (value?: string | null) => {
  if (!value) return 'Coming soon';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void loadBlogs().then(data => { setPosts(data); setLoading(false); });
  }, []);

  const displayPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt ?? '').toLowerCase().includes(q));
  }, [posts, search]);

  const featuredPost = displayPosts[0];
  const remainingPosts = displayPosts.slice(1);

  return (
    <SiteFrame mainClassName="pt-24">
      <section className="section-padding pb-10">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 px-4 py-1 text-primary">
                  Tech Guardians Blog
                </Badge>
                <h1 className="font-display text-3xl font-bold leading-[1.05] md:text-5xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
                  Insights, tutorials &amp; cyber awareness
                </h1>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>
          </ScrollReveal>

          {featuredPost && (
            <ScrollReveal delay={0.06}>
              <Link to={`/blog/${featuredPost.slug}`} className="group mb-12 block overflow-hidden rounded-xl border border-border/70 bg-card/60 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_hsl(var(--background)/0.5)]">
                <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                  {featuredPost.cover_image && (
                    <div className="relative min-h-[280px] border-b border-border/60 bg-muted/30 lg:min-h-[380px] lg:border-b-0 lg:border-r overflow-hidden">
                      <img src={featuredPost.cover_image} alt={featuredPost.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="eager" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center p-8 md:p-10">
                    <Badge className="mb-4 w-fit bg-primary/10 text-primary border-primary/30">Featured</Badge>
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-primary" />{formatDate(featuredPost.published_at)}</span>
                      <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-cyber-green" />Tech Guardians</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyber-purple" />{Math.max(1, Math.ceil(featuredPost.content.length / 1200))} min</span>
                    </div>
                    <h2 className="font-display text-2xl font-bold leading-[1.1] md:text-3xl group-hover:text-primary transition-colors">{featuredPost.title}</h2>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">{featuredPost.excerpt ?? featuredPost.content.slice(0, 200)}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyber-green">Read full article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          )}

          <div className="space-y-6">
            {remainingPosts.map((post, index) => (
              <ScrollReveal key={post.slug} delay={0.04 * index}>
                <Link to={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60 transition-[transform,box-shadow,border-color] duration-300 hover:border-primary/40 hover:shadow-[0_12px_35px_hsl(var(--background)/0.4)] sm:flex-row active:scale-[0.99]">
                  {post.cover_image && (
                    <div className="w-full shrink-0 overflow-hidden border-b border-border/60 bg-muted/40 sm:w-56 sm:border-b-0 sm:border-r md:w-72">
                      <img src={post.cover_image} alt={post.title} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-full" loading="lazy" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-primary" />{formatDate(post.published_at)}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyber-purple" />{Math.max(1, Math.ceil(post.content.length / 1200))} min read</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors md:text-xl">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt ?? post.content.slice(0, 160)}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-cyber-green">Read more <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {displayPosts.length === 0 && !loading && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              {search ? 'No articles match your search.' : 'No articles published yet.'}
            </p>
          )}
        </div>
      </section>
    </SiteFrame>
  );
};

export default Blog;
