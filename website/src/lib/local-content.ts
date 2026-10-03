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
export const loadPdfs = () => fetchJson<PdfResource[]>('/content/pdfs.json', []);
export const loadMedia = () => fetchJson<MediaItem[]>('/content/media.json', []);
export const loadVideos = () => fetchJson<VideoItem[]>('/content/videos.json', []);
