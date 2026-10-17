import { apiGet, apiPost } from '@/lib/api';
import { loadBlogs } from '@/lib/blogs-store';

// TG Blogs: posts written by students (approved by the admin) plus the
// admin's own articles from Manage → Blogs.

export interface BlogRef { title: string; url: string }
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  words: number;
  body?: string;
  refs?: BlogRef[];
}
export type PostStatus = 'draft' | 'pending' | 'published' | 'rejected';
export interface OwnPost extends BlogPost {
  status: PostStatus;
  review_note: string;
  updated_at: string;
  submitted_at: string;
  published_at: string;
  author_username?: string;
  user_id?: string;
}

export const BLOG_CATEGORIES = ['Cyber Awareness', 'Cyber Crime', 'Ethical Hacking', 'Network Security', 'SOC & Detection', 'Digital Forensics', 'Privacy', 'Cloud Security', 'AI & Security', 'Career & Learning', 'Tutorial'];

export const readMinutes = (words: number) => Math.max(1, Math.round(words / 200));
export const countWords = (text: string) => (text.trim().match(/\S+/g) || []).length;

/** The admin's own articles (Manage → Blogs), shown as TG Blogs posts. */
const adminArticles = (): BlogPost[] =>
  loadBlogs().filter((b) => b.enabled && b.title.trim()).map((b) => ({
    id: `tg-${b.id}`,
    slug: `tg-${b.id}`,
    title: b.title,
    excerpt: b.summary,
    category: b.language === 'hi' ? `${b.category} · हिन्दी` : b.category,
    tags: [],
    author: 'Tech Guardians',
    date: b.date,
    words: countWords(b.body),
    body: b.body,
    refs: [],
  }));

export async function loadPublishedPosts(): Promise<BlogPost[]> {
  const fromStudents = await apiGet<{ posts: BlogPost[] }>('posts.php').then((r) => r.posts).catch(() => [] as BlogPost[]);
  return [...fromStudents, ...adminArticles()].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function loadPost(slug: string): Promise<BlogPost | null> {
  if (slug.startsWith('tg-')) return adminArticles().find((p) => p.slug === slug) || null;
  return apiGet<{ post: BlogPost }>(`posts.php?slug=${encodeURIComponent(slug)}`).then((r) => r.post).catch(() => null);
}

export const postUrl = (slug: string) => `/tg-blogs/?post=${encodeURIComponent(slug)}`;

export interface PostDraft { id?: string; title: string; category: string; tags: string[]; excerpt: string; body: string; refs: BlogRef[] }
export const emptyDraft = (): PostDraft => ({ title: '', category: BLOG_CATEGORIES[0], tags: [], excerpt: '', body: '', refs: [] });
/** Drops empty reference rows before saving. */
export const cleanDraft = (d: PostDraft): PostDraft => ({ ...d, refs: d.refs.filter((r) => r.url.trim() && r.url.trim() !== 'https://').map((r) => ({ title: r.title.trim(), url: r.url.trim() })) });

export const loadMine = () => apiGet<{ user: { name: string; username: string } | null; canWrite?: boolean; reason?: string; posts?: OwnPost[] }>('posts.php?action=mine');
export const savePost = (draft: PostDraft, opts: { submit?: boolean; publish?: boolean }) =>
  apiPost<{ ok: boolean; post: OwnPost }>('posts.php?action=save', { ...draft, ...opts });
export const deletePost = (id: string) => apiPost('posts.php?action=delete', { id });

export interface Writer { id: string; name: string; username: string; email: string; mode: 'auto' | 'allow' | 'deny'; canWrite: boolean; reason: string; buyer: boolean; posts: number }
export interface BlogSettings { enabled: boolean; buyersOnly: boolean }
export const loadBlogAdmin = () => apiGet<{ posts: OwnPost[]; settings: BlogSettings; writers: Writer[] }>('posts.php?action=admin');
export const reviewPost = (id: string, decision: 'approve' | 'reject' | 'unpublish', note = '') => apiPost('posts.php?action=review', { id, decision, note });
export const saveBlogSettings = (s: BlogSettings) => apiPost('posts.php?action=settings', s);
export const setWriterAccess = (userId: string, blog: Writer['mode']) => apiPost('posts.php?action=access', { userId, blog });

export const formatDate = (d: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  const t = Date.parse(d);
  return Number.isNaN(t) ? d : new Date(t).toLocaleDateString('en-IN', opts);
};
