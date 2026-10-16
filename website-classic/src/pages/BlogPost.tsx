import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, User, Clock, ArrowRight, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import SiteFrame from '@/components/SiteFrame';
import { Badge } from '@/components/ui/badge';
import { loadBlogs, type BlogPost } from '@/lib/local-content';

const formatDate = (value?: string | null) => {
  if (!value) return 'Coming soon';
  return new Date(value).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/techguardianss/' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@TECHGUARDIANS_IT' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/techguardians' },
  { icon: Twitter, label: 'X (Twitter)', href: 'https://twitter.com/techguardians_' },
];

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadBlogs().then(data => { setAllPosts(data); setLoading(false); });
  }, []);

  const displayPost = allPosts.find(p => p.slug === slug) ?? null;
  const recentPosts = allPosts.filter(p => p.slug !== slug).slice(0, 5);

  if (loading) {
    return (
      <SiteFrame mainClassName="pt-24">
        <div className="container mx-auto max-w-3xl section-padding text-center text-muted-foreground">Loading...</div>
      </SiteFrame>
    );
  }

  if (!displayPost) {
    return (
      <SiteFrame mainClassName="pt-24">
        <div className="container mx-auto max-w-3xl section-padding text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
        </div>
      </SiteFrame>
    );
  }

  return (
    <SiteFrame mainClassName="pt-24">
      <article className="section-padding pb-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0">
              <ScrollReveal>
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                  <ArrowLeft className="h-4 w-4" /> Back to Blog
                </Link>
              </ScrollReveal>

              <ScrollReveal delay={0.05}>
                <h1 className="font-display text-3xl font-bold leading-[1.08] md:text-4xl lg:text-5xl mb-6" style={{ textWrap: 'balance' } as React.CSSProperties}>
                  {displayPost.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border/60">
                  <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(displayPost.published_at)}</span>
                  <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-cyber-green" />Tech Guardians</span>
                  <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-cyber-purple" />{Math.max(1, Math.ceil(displayPost.content.length / 1200))} min read</span>
                </div>
              </ScrollReveal>

              {displayPost.cover_image && (
                <ScrollReveal delay={0.1}>
                  <div className="mb-8 overflow-hidden rounded-xl border border-border/60">
                    <img src={displayPost.cover_image} alt={displayPost.title} className="w-full aspect-[16/9] object-cover" loading="eager" />
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal delay={0.12}>
                <div className="prose prose-lg prose-invert max-w-none text-foreground/90 leading-8 whitespace-pre-line">
                  {displayPost.content}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <div className="mt-10 pt-6 border-t border-border/60 flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-primary/30 text-primary">Cybersecurity</Badge>
                  <Badge variant="outline" className="border-primary/30 text-primary">Awareness</Badge>
                  <Badge variant="outline" className="border-primary/30 text-primary">Learning</Badge>
                </div>
              </ScrollReveal>
            </div>

            <aside className="hidden lg:block">
              <ScrollReveal delay={0.1}>
                <div className="sticky top-24 space-y-5">
                  <div className="rounded-xl border border-border/70 bg-card/60 p-5">
                    <h3 className="font-display text-sm font-semibold mb-3 text-foreground">About Tech Guardians</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground mb-4">
                      Tech Guardians is a cybersecurity awareness and education organisation dedicated to making India digitally safe.
                    </p>
                    <Link to="/#contact" className="inline-block text-xs font-medium text-primary hover:text-cyber-green transition-colors">
                      Contact Us →
                    </Link>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-card/60 p-5">
                    <h3 className="font-display text-xs font-semibold tracking-wider uppercase text-foreground mb-3">Follow Us</h3>
                    <div className="flex flex-wrap gap-2">
                      {socialLinks.map((s) => (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                          <s.icon className="h-3.5 w-3.5" />{s.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {recentPosts.length > 0 && (
                    <div className="rounded-xl border border-border/70 bg-card/60 p-5">
                      <h3 className="font-display text-xs font-semibold tracking-wider uppercase text-foreground mb-4">Recent Posts</h3>
                      <div className="space-y-3">
                        {recentPosts.map((rp) => (
                          <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group block">
                            <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{rp.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(rp.published_at)}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </aside>
          </div>

          {recentPosts.length > 0 && (
            <ScrollReveal delay={0.15}>
              <div className="mt-12 pt-8 border-t border-border/60 lg:hidden">
                <h3 className="font-display text-xl font-bold mb-6">More Articles</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {recentPosts.slice(0, 4).map((rp) => (
                    <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group rounded-xl border border-border/70 bg-card/60 overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 active:scale-[0.98]">
                      {rp.cover_image && (
                        <div className="aspect-[16/9] overflow-hidden border-b border-border/60 bg-muted/40">
                          <img src={rp.cover_image} alt={rp.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                        </div>
                      )}
                      <div className="p-5">
                        <p className="text-xs text-muted-foreground mb-2">{formatDate(rp.published_at)}</p>
                        <h4 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{rp.title}</h4>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-cyber-green">Read more <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </article>
    </SiteFrame>
  );
};

export default BlogPostPage;
