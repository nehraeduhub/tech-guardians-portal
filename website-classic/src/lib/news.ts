import { useQuery } from '@tanstack/react-query';
import { newsUrl } from '@/lib/api';

// Headlines from the Cyber News Portal feeds (api/news.php), for homepage widgets.

export interface NewsHeadline { title: string; url: string; source: string; date?: string; category?: string }

const loadFeed = async (feed: 'india' | 'global') => {
  const res = await fetch(newsUrl(feed), { cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `News could not be loaded (${res.status})`);
  return (data?.items ?? []) as NewsHeadline[];
};

const time = (n: NewsHeadline) => new Date(n.date || 0).getTime() || 0;

/** Newest India cyber-crime headlines first, topped up with global news; no repeats. */
export const useTopNews = (limit = 6) => useQuery({
  queryKey: ['top-news', limit],
  staleTime: 10 * 60 * 1000,
  queryFn: async () => {
    const [india, global] = await Promise.all([loadFeed('india').catch(() => []), loadFeed('global').catch(() => [])]);
    const seen = new Set<string>();
    const pick = (rows: NewsHeadline[]) => rows.filter((n) => n.title && n.url && !seen.has(n.title) && seen.add(n.title)).sort((a, b) => time(b) - time(a));
    return [...pick(india), ...pick(global)].slice(0, limit);
  },
});

export const timeAgo = (iso?: string) => {
  const t = iso ? new Date(iso).getTime() : 0;
  if (!t) return 'Today';
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 60) return `${Math.max(m, 1)} min ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} hr ago` : `${Math.floor(h / 24)} d ago`;
};
