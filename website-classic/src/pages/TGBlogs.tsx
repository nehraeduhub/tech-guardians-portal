import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Copy, ExternalLink, Linkedin, MessageCircle, PenLine, Search, ShieldCheck, Tag, Twitter, User } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import BlogBody from '@/components/blog/BlogBody';
import { formatDate, loadPost, loadPublishedPosts, postUrl, readMinutes, type BlogPost } from '@/lib/blog-posts';
import { safeLink } from '@/lib/utils';

// TG Blogs — a clean, text-first blog in the style of Blogger: posts by
// Tech Guardians and by students (published after admin approval).

const PAGE = 8;

const Sidebar = ({ posts, label, setLabel, q, setQ }: { posts: BlogPost[]; label: string; setLabel: (l: string) => void; q: string; setQ: (s: string) => void }) => {
  const labels = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => [p.category, ...p.tags].filter(Boolean).forEach((l) => m.set(l, (m.get(l) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24);
  }, [posts]);
  const archive = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    posts.forEach((p) => {
      const t = Date.parse(p.date);
      if (Number.isNaN(t)) return;
      const d = new Date(t);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const cur = m.get(key) || { label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), n: 0 };
      cur.n++; m.set(key, cur);
    });
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [posts]);
  return (
    <aside className="space-y-8 lg:sticky lg:top-28">
      <div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search this blog" aria-label="Search this blog" className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </label>
      </div>
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><PenLine className="h-4 w-4" /> Write for TG Blogs</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tech Guardians learners can write articles. Every post is reviewed by our team before it is published.</p>
        <a href="/write/" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110">Start writing</a>
      </div>
      {labels.length > 0 && (
        <div>
          <h3 className="border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-foreground">Labels</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {labels.map(([l, n]) => (
              <li key={l}><button type="button" onClick={() => setLabel(label === l ? '' : l)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${label === l ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'}`}>{l} ({n})</button></li>
            ))}
          </ul>
        </div>
      )}
      {archive.length > 0 && (
        <div>
          <h3 className="border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-foreground">Blog archive</h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {archive.map(([k, v]) => <li key={k} className="flex justify-between text-muted-foreground"><span>{v.label}</span><span>({v.n})</span></li>)}
          </ul>
        </div>
      )}
      <div>
        <h3 className="border-b border-border pb-2 text-sm font-bold uppercase tracking-wider text-foreground">About</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Practical cyber security articles from Tech Guardians trainers, investigators and learners. Keep Learning and Keep Sharing.</p>
      </div>
    </aside>
  );
};

const PostList = ({ posts }: { posts: BlogPost[] }) => {
  const [q, setQ] = useState('');
  const [label, setLabel] = useState('');
  const [shown, setShown] = useState(PAGE);
  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return posts.filter((p) => (!label || p.category === label || p.tags.includes(label))
      && words.every((w) => `${p.title} ${p.excerpt} ${p.author} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(w)));
  }, [posts, q, label]);
  useEffect(() => setShown(PAGE), [q, label]);

  let lastDay = '';
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
      <div>
        {label && <p className="mb-6 rounded-lg bg-muted px-4 py-3 text-sm">Showing posts with label <strong>{label}</strong>. <button type="button" onClick={() => setLabel('')} className="font-semibold text-primary underline">Show all posts</button></p>}
        {list.length === 0 && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">No posts found.</p>}
        {list.slice(0, shown).map((p) => {
          const day = formatDate(p.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <article key={p.id} className="border-b border-border pb-10 pt-2 [&+article]:pt-10">
              {showDay && <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{day}</h2>}
              <h3 className="text-2xl font-extrabold leading-tight text-foreground md:text-[28px]">
                <Link to={postUrl(p.slug)} className="hover:text-primary">{p.title}</Link>
              </h3>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {p.author}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {readMinutes(p.words)} min read</span>
              </p>
              <p className="mt-4 font-serif text-[17px] leading-8 text-foreground/80">{p.excerpt}{p.excerpt.length >= 200 ? '…' : ''}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link to={postUrl(p.slug)} className="text-sm font-bold text-primary hover:underline">Read more »</Link>
                <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><Tag className="h-3.5 w-3.5" /> {[p.category, ...p.tags].filter(Boolean).join(', ')}</span>
              </div>
            </article>
          );
        })}
        {shown < list.length && (
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:border-primary/50 hover:text-primary">Older posts</button>
          </div>
        )}
      </div>
      <Sidebar posts={posts} label={label} setLabel={setLabel} q={q} setQ={setQ} />
    </div>
  );
};

const Share = ({ post }: { post: BlogPost }) => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = encodeURIComponent(`${post.title} — TG Blogs`);
  const u = encodeURIComponent(url);
  const cls = 'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Share</span>
      <a className={cls} href={`https://wa.me/?text=${text}%20${u}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
      <a className={cls} href={`https://twitter.com/intent/tweet?text=${text}&url=${u}`} target="_blank" rel="noopener noreferrer"><Twitter className="h-3.5 w-3.5" /> X</a>
      <a className={cls} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</a>
      <button type="button" className={cls} onClick={() => { void navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => undefined); }}><Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy link'}</button>
    </div>
  );
};

const Article = ({ slug, posts }: { slug: string; posts: BlogPost[] }) => {
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    setPost(undefined);
    void loadPost(slug).then((p) => { if (alive) setPost(p); });
    window.scrollTo(0, 0);
    return () => { alive = false; };
  }, [slug]);
  useEffect(() => {
    if (post) document.title = `${post.title} — TG Blogs`;
    return () => { document.title = 'Tech Guardians – Cybersecurity Training & Awareness'; };
  }, [post]);

  if (post === undefined) return <p className="py-20 text-center text-muted-foreground">Loading article…</p>;
  if (!post) return (
    <div className="py-20 text-center">
      <p className="text-lg font-semibold">This article is not available.</p>
      <Link to="/tg-blogs/" className="mt-4 inline-flex items-center gap-2 text-primary underline"><ArrowLeft className="h-4 w-4" /> Back to TG Blogs</Link>
    </div>
  );
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
      <article className="min-w-0">
        <Link to="/tg-blogs/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> TG Blogs</Link>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{formatDate(post.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-foreground md:text-[40px]" style={{ textWrap: 'balance' }}>{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 font-bold text-primary">{post.author.charAt(0).toUpperCase()}</span> <span>by <strong className="text-foreground">{post.author}</strong></span></span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {readMinutes(post.words)} min read</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {post.category}</span>
        </div>

        <div className="mx-auto max-w-[720px] pt-4 font-serif">
          <BlogBody text={post.body || post.excerpt} />
        </div>

        {post.refs && post.refs.length > 0 && (
          <section className="mx-auto mt-10 max-w-[720px] rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">References</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm marker:text-muted-foreground">
              {post.refs.map((r, i) => (
                <li key={i} className="pl-1">
                  <a href={safeLink(r.url)} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-start gap-1 break-all font-medium text-primary hover:underline">{r.title || r.url} <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /></a>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mx-auto mt-8 max-w-[720px] space-y-5">
          {post.tags.length > 0 && <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Tag className="h-3.5 w-3.5" /> Labels: {post.tags.map((t) => <span key={t} className="rounded-full border border-border px-2.5 py-0.5">{t}</span>)}</p>}
          <Share post={post} />
          <p className="flex items-start gap-2 rounded-lg bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {post.author === 'Tech Guardians' ? 'Published by Tech Guardians.' : 'Written by a Tech Guardians learner and reviewed by our team before publishing. Techniques are shared for awareness and authorised testing only.'}</p>
        </div>

        {more.length > 0 && (
          <section className="mx-auto mt-12 max-w-[720px] border-t border-border pt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">More from TG Blogs</h2>
            <ul className="mt-4 divide-y divide-border">
              {more.map((p) => (
                <li key={p.id} className="py-3">
                  <Link to={postUrl(p.slug)} className="font-semibold text-foreground hover:text-primary">{p.title}</Link>
                  <p className="text-xs text-muted-foreground">{p.author} · {formatDate(p.date)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><PenLine className="h-4 w-4" /> Write for TG Blogs</h3>
          <p className="mt-2 text-sm text-muted-foreground">Share what you learned with thousands of readers.</p>
          <a href="/write/" className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Start writing</a>
        </div>
        <div>
          <h3 className="border-b border-border pb-2 text-sm font-bold uppercase tracking-wider">Recent posts</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {posts.slice(0, 6).map((p) => <li key={p.id}><Link to={postUrl(p.slug)} className={`hover:text-primary ${p.slug === post.slug ? 'font-bold text-primary' : 'text-foreground'}`}>{p.title}</Link></li>)}
          </ul>
        </div>
      </aside>
    </div>
  );
};

const TGBlogs = () => {
  const [params] = useSearchParams();
  const slug = params.get('post') || '';
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  useEffect(() => {
    const load = () => void loadPublishedPosts().then(setPosts);
    load();
    window.addEventListener('tg-settings-changed', load);
    return () => window.removeEventListener('tg-settings-changed', load);
  }, []);

  return (
    <SiteFrame mainClassName="pt-24">
      {!slug && (
        <header className="border-b border-border bg-card">
          <div className="container mx-auto max-w-6xl px-4 py-12 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Tech Guardians</p>
            <h1 className="mt-2 text-4xl font-extrabold text-foreground md:text-5xl">TG Blogs</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">Practical cyber security writing from our trainers, investigators and learners — Keep Learning and Keep Sharing.</p>
          </div>
        </header>
      )}
      <div className="container mx-auto max-w-6xl px-4 py-12 md:px-8">
        {posts === null ? <p className="py-20 text-center text-muted-foreground">Loading posts…</p>
          : slug ? <Article slug={slug} posts={posts} /> : <PostList posts={posts} />}
      </div>
    </SiteFrame>
  );
};

export default TGBlogs;
