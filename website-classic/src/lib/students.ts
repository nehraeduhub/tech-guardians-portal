import { apiGet, apiPost } from '@/lib/api';

// Student accounts (api/users.php). Students request an account on /account.html;
// the admin approves it and chooses which courses and PDF books it can open.

export type StudentStatus = 'pending' | 'approved' | 'rejected' | 'disabled';

export interface Student {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  status: StudentStatus;
  courses: string[];
  pdfs: string[];
  note: string;
  created_at: string;
  approved_at: string;
  last_login: string;
  logins: number;
  history?: { at: string; event: string }[];
  /** Found automatically from approved payments made with the same email or mobile. */
  bought: { courses: string[]; pdfs: string[] };
}

export interface CatalogItem { id: string; title: string; page?: string }
export type CourseMaterials = Record<string, { link: string; note: string }>;

export interface StudentsData {
  users: Student[];
  courses: CatalogItem[];
  pdfs: CatalogItem[];
  materials: CourseMaterials;
}

export interface NewStudent { username: string; name: string; email: string; phone: string; password: string }

export const loadStudents = () => apiGet<StudentsData>('users.php?action=list');
export const updateStudent = (id: string, changes: Partial<Pick<Student, 'status' | 'courses' | 'pdfs' | 'name' | 'email' | 'phone' | 'note'>>) =>
  apiPost('users.php?action=update', { id, ...changes });
export const createStudent = (s: NewStudent) => apiPost('users.php?action=create', s);
export const resetStudentPassword = (id: string, password: string) => apiPost('users.php?action=reset', { id, password });
export const deleteStudent = (id: string) => apiPost('users.php?action=delete', { id });
export const saveCourseMaterials = (materials: CourseMaterials) => apiPost('users.php?action=materials', { materials });
