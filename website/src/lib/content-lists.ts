import { useEffect, useState } from 'react';
import { publishSetting, readSetting } from '@/lib/shared-settings';

// Admin-managed lists (custom sections, PDFs, media, videos, testimonials).
// Each row has an id and a `visible` flag; the website shows visible rows only.

export interface ListRow { id: string; visible: boolean; [field: string]: string | boolean }

export interface ListField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'image' | 'url' | 'select';
  options?: string[];
  placeholder?: string;
}

export interface ListDef {
  key: string;
  title: string;
  description: string;
  itemLabel: string;
  fields: ListField[];
}

export const CUSTOM_SECTIONS: ListDef = {
  key: 'tg_custom_sections',
  title: 'Custom sections',
  description: 'Add your own homepage sections. Position them in Sections & Pages.',
  itemLabel: 'section',
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Small label above the title' },
    { key: 'body', label: 'Text', type: 'textarea' },
    { key: 'image', label: 'Image', type: 'image' },
    { key: 'buttonText', label: 'Button text' },
    { key: 'buttonLink', label: 'Button link', type: 'url', placeholder: 'https://… or /courses/…' },
  ],
};

export const PDF_LIST: ListDef = {
  key: 'tg_pdfs',
  title: 'PDF library',
  description: 'Downloadable guides shown in the PDF library section.',
  itemLabel: 'PDF',
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'file_url', label: 'PDF link', type: 'url', placeholder: 'https://… or /pdfs/file.pdf' },
  ],
};

export const MEDIA_LIST: ListDef = {
  key: 'tg_media',
  title: 'Media gallery',
  description: 'Photos and videos shown in the media gallery section.',
  itemLabel: 'media item',
  fields: [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type', type: 'select', options: ['image', 'video'] },
    { key: 'url', label: 'Image', type: 'image' },
  ],
};

export const VIDEO_LIST: ListDef = {
  key: 'tg_videos',
  title: 'YouTube videos',
  description: 'Videos shown in the YouTube section. Use the YouTube video id (the part after v=).',
  itemLabel: 'video',
  fields: [
    { key: 'id_youtube', label: 'YouTube video id', placeholder: 'dQw4w9WgXcQ' },
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
};

export const MANAGED_LISTS = [CUSTOM_SECTIONS, PDF_LIST, MEDIA_LIST, VIDEO_LIST];

export const newRowId = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Saved rows, or null when the admin has never saved this list. */
export const readList = (def: ListDef): ListRow[] | null => {
  const rows = readSetting<ListRow[] | null>(def.key, null);
  return Array.isArray(rows) ? rows : null;
};

export const saveList = (def: ListDef, rows: ListRow[]) => publishSetting(def.key, rows);

/** Visible rows of a list, live. */
export const useList = (def: ListDef) => {
  const [rows, setRows] = useState<ListRow[] | null>(() => readList(def));
  useEffect(() => {
    const refresh = () => setRows(readList(def));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, [def]);
  return rows;
};
