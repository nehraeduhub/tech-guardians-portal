import { MEDIA_LIST, PDF_LIST, VIDEO_LIST, newRowId, readList, type ListDef, type ListRow } from '@/lib/content-lists';

// Local folder-based content layer (replaces Supabase).
// All site content lives in /public/content/*.json and /public/(images|pdfs|media|videos)/.

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  content: string;
  is_published?: boolean;
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  page: string;
}

export interface PdfResource {
  id: string;
  title: string;
  category: string;
  description?: string;
  file_url: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
}

const fetchJson = async <T,>(path: string, fallback: T): Promise<T> => {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
};

export const loadBlogs = () => fetchJson<BlogPost[]>('/content/blogs.json', []);
export const loadCourses = () => fetchJson<CourseItem[]>('/content/courses.json', []);
// PDFs, media and videos can be managed in Manage; saved lists replace the JSON files.
const managed = <T,>(def: ListDef, map: (row: ListRow) => T): T[] | null => {
  const rows = readList(def);
  return rows ? rows.filter((r) => r.visible).map(map) : null;
};
const str = (v: unknown) => (typeof v === 'string' ? v : '');

export const loadPdfs = async () =>
  managed(PDF_LIST, (r) => ({ id: r.id, title: str(r.title), category: str(r.category), description: str(r.description), file_url: str(r.file_url) }))
  ?? fetchJson<PdfResource[]>('/content/pdfs.json', []);
export const loadMedia = async () =>
  managed(MEDIA_LIST, (r) => ({ id: r.id, title: str(r.title), type: (r.type === 'video' ? 'video' : 'image') as MediaItem['type'], url: str(r.url) }))
  ?? fetchJson<MediaItem[]>('/content/media.json', []);
export const loadVideos = async () =>
  managed(VIDEO_LIST, (r) => ({ id: str(r.id_youtube), title: str(r.title), description: str(r.description) }))
  ?? fetchJson<VideoItem[]>('/content/videos.json', []);

/** JSON-file rows in list-editor shape, used to prefill a list the admin has never saved. */
export const seedRows = async (def: ListDef): Promise<ListRow[]> => {
  if (def.key === PDF_LIST.key) return (await fetchJson<PdfResource[]>('/content/pdfs.json', [])).map((p) => ({ ...p, description: p.description || '', visible: true }));
  if (def.key === MEDIA_LIST.key) return (await fetchJson<MediaItem[]>('/content/media.json', [])).map((m) => ({ ...m, visible: true }));
  if (def.key === VIDEO_LIST.key) return (await fetchJson<VideoItem[]>('/content/videos.json', [])).map((v) => ({ id: newRowId(), id_youtube: v.id, title: v.title, description: v.description || '', visible: true }));
  return [];
};
