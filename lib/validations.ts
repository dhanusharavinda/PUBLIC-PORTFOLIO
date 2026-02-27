import * as z from 'zod';
import { TemplateType, AvailabilityStatus } from '@/types/portfolio';

const MAX_BIO_WORDS = 400;
const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(50, 'Skill name too long'),
  category: z.enum(['Languages', 'Tools', 'Frameworks', 'Other']),
});

export const experienceSchema = z.object({
  company: z.string().max(100, 'Company name too long').optional().or(z.literal('')),
  role: z.string().max(100, 'Role too long').optional().or(z.literal('')),
  location: z.string().max(100, 'Location too long').optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  is_current: z.boolean().optional().default(false),
  description: z.string().max(800, 'Description must be under 800 characters').optional().or(z.literal('')),
  order_index: z.number(),
});

export const projectSchema = z.object({
  name: z.string().max(100, 'Project name too long').optional().or(z.literal('')),
  cover_image_url: z.string().optional().or(z.literal('')),
  description: z.string().max(800, 'Description must be under 800 characters').optional().or(z.literal('')),
  tech_stack: z.array(z.string()).optional().default([]),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  demo_url: z.string().url('Invalid demo URL').optional().or(z.literal('')),
  is_featured: z.boolean(),
  order_index: z.number(),
});

export const portfolioSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens'),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  tagline: z.string().max(100, 'Tagline must be under 100 characters'),
  job_title: z.string().min(1, 'Job title is required').max(100, 'Job title too long'),
  location: z.string().max(100, 'Location too long').optional(),
  bio: z
    .string()
    .refine((value) => countWords(value) <= MAX_BIO_WORDS, `Bio must be ${MAX_BIO_WORDS} words or less`),
  email: z.string().email('Invalid email address'),
  profile_photo_url: z.string().optional(),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github_username: z.string().max(50, 'GitHub username too long').optional(),
  resume_url: z.string().optional(),
  availability_status: z.enum(['open_fulltime', 'freelance', 'not_looking']),
  open_to_work: z.boolean(),
  skills: z.array(skillSchema).max(30, 'Max 30 skills allowed'),
  template: z.enum(['minimal', 'professional']),
  is_public: z.boolean().default(true),
});

export const formDataSchema = z.object({
  // Step 1: Personal Info
  full_name: z.string().min(1, 'Full name is required'),
  tagline: z.string().max(100, 'Tagline must be under 100 characters'),
  job_title: z.string().min(1, 'Job title is required'),
  location: z.string(),
  bio: z
    .string()
    .refine((value) => countWords(value) <= MAX_BIO_WORDS, `Bio must be ${MAX_BIO_WORDS} words or less`),
  email: z.string().email('Invalid email address'),
  profile_photo_url: z.string(),
  linkedin_url: z.string().optional(),
  github_username: z.string().optional(),
  resume_url: z.string().optional(),
  availability_status: z.enum(['open_fulltime', 'freelance', 'not_looking']),
  open_to_work: z.boolean(),

  // Step 2: Skills
  skills: z.array(skillSchema).max(30, 'Max 30 skills'),

  // Step 3: Experience
  experiences: z.array(experienceSchema).max(10, 'Max 10 experiences'),

  // Step 4: Projects
  projects: z.array(projectSchema).max(10, 'Max 10 projects'),

  // Step 5: Template
  template: z.enum(['minimal', 'professional']),
});

export type PortfolioFormData = z.infer<typeof formDataSchema>;
