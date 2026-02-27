export type TemplateType = 'minimal' | 'professional';
export type AvailabilityStatus = 'open_fulltime' | 'freelance' | 'not_looking';

export interface Skill {
  name: string;
  category: 'Languages' | 'Tools' | 'Frameworks' | 'Other';
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Experience {
  id?: string;
  portfolio_id?: string;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  order_index: number;
  created_at?: string;
}

export interface FormExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

export interface Project {
  id?: string;
  portfolio_id?: string;
  name: string;
  impact_stat?: string;
  cover_image_url: string;
  carousel_images: string[];
  description: string;
  tech_stack: string[];
  github_url: string;
  demo_url?: string;
  is_featured: boolean;
  order_index: number;
  created_at?: string;
}

export interface Portfolio {
  id?: string;
  username: string;
  full_name: string;
  tagline: string;
  job_title: string;
  location: string;
  bio: string;
  email: string;
  profile_photo_url: string;
  linkedin_url?: string;
  github_username?: string;
  resume_url?: string;
  availability_status: AvailabilityStatus;
  open_to_work: boolean;
  skills: Skill[];
  template: TemplateType;
  is_public: boolean;
  view_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioWithProjects extends Portfolio {
  projects: Project[];
  experiences: Experience[];
}

export interface FormData {
  // Step 1: Personal Info
  full_name: string;
  tagline: string;
  job_title: string;
  location: string;
  bio: string;
  email: string;
  profile_photo?: File | null;
  profile_photo_url: string;
  linkedin_url: string;
  github_username: string;
  resume?: File | null;
  resume_url: string;
  availability_status: AvailabilityStatus;
  open_to_work: boolean;

  // Step 2: Skills
  skills: Skill[];

  // Step 3: Experience
  experiences: FormExperience[];

  // Step 4: Projects
  projects: FormProject[];

  // Step 5: Template
  template: TemplateType;
}

export interface FormProject {
  id: string;
  name: string;
  cover_image?: File | null;
  cover_image_url: string;
  carousel_images: (File | null)[];
  carousel_image_urls: string[];
  description: string;
  tech_stack: string[];
  github_url: string;
  demo_url: string;
  is_featured: boolean;
}

export interface ExploreFilters {
  search: string;
  skills: string[];
  availability: AvailabilityStatus | 'all';
  sort: 'newest' | 'most_viewed';
}
