import { z } from 'zod';
import { experienceSchema, projectSchema } from '@/lib/validations';

const reserved = new Set([
  'admin', 'api', 'auth', 'login', 'logout', 'signup', 'register',
  'explore', 'search', 'user', 'users', 'portfolio', 'portfolios',
  'settings', 'profile', 'dashboard', 'app', 'www', 'mail', 'ftp',
  'localhost', 'test', 'demo', 'support', 'help', 'about', 'contact',
  'terms', 'privacy', 'legal', 'blog', 'news', 'careers', 'jobs',
  'api-docs', 'documentation', 'docs', 'status', 'health', 'ping',
  'robots', 'sitemap', 'favicon', 'assets', 'static', 'public',
  'create', 'edit', 'delete', 'new', 'success', 'cancel', 'reset-password',
]);

export function portfolioUsernameError(username: string) {
  if (!/^[a-z0-9-]+$/.test(username)) return 'Username can only contain lowercase letters, numbers, and hyphens';
  if (username.length < 3 || username.length > 30) return 'Username must be between 3 and 30 characters';
  if (reserved.has(username)) return 'This username is reserved';
  return null;
}

const rows = z.array(z.record(z.string(), z.unknown()));
const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

export function parseExperiences(value: unknown) {
  if (value === undefined) return undefined;
  return rows.parse(value)
    .filter((row) => [row.company, row.role, row.description].some(hasText))
    .map((row, index) => experienceSchema.parse({
      company: '', role: '', location: '', start_date: '', end_date: '', description: '',
      ...row,
      order_index: index,
    }));
}

export function parseProjects(value: unknown) {
  if (value === undefined) return undefined;
  return rows.parse(value)
    .filter((row) => [row.name, row.description, row.github_url, row.demo_url].some(hasText))
    .map((row, index) => projectSchema.parse({
      name: '', label: '', cover_image_url: '', description: '', github_url: '', demo_url: '', is_featured: false,
      ...row,
      order_index: index,
    }));
}

export function isMissingExperiencesSchema(error: { code: string; message: string } | null) {
  return Boolean(error && ['42P01', 'PGRST205'].includes(error.code) && error.message.includes('experiences'));
}

export function isMissingSectionVisibilityColumn(error: { code: string; message: string }) {
  return ['42703', 'PGRST204'].includes(error.code) && error.message.includes('section_visibility');
}
