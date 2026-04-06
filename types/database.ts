export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  locale: SupportedLocale;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type SupportedLocale = 'en' | 'he' | 'es' | 'fr' | 'de';
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'he', 'es', 'fr', 'de'];
export const RTL_LOCALES: SupportedLocale[] = ['he'];

export function isRtlLocale(locale: SupportedLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

export interface AiInterpretationResult {
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
}
