export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      portfolios: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          tagline: string;
          job_title: string;
          location: string;
          bio: string;
          email: string;
          profile_photo_url: string | null;
          linkedin_url: string | null;
          github_username: string | null;
          resume_url: string | null;
          availability_status: 'open_fulltime' | 'freelance' | 'not_looking';
          open_to_work: boolean;
          skills: Json;
          template: 'minimal' | 'pastel' | 'professional';
          is_public: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          full_name: string;
          tagline?: string;
          job_title: string;
          location?: string;
          bio?: string;
          email: string;
          profile_photo_url?: string | null;
          linkedin_url?: string | null;
          github_username?: string | null;
          resume_url?: string | null;
          availability_status?: 'open_fulltime' | 'freelance' | 'not_looking';
          open_to_work?: boolean;
          skills?: Json;
          template?: 'minimal' | 'pastel' | 'professional';
          is_public?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          tagline?: string;
          job_title?: string;
          location?: string;
          bio?: string;
          email?: string;
          profile_photo_url?: string | null;
          linkedin_url?: string | null;
          github_username?: string | null;
          resume_url?: string | null;
          availability_status?: 'open_fulltime' | 'freelance' | 'not_looking';
          open_to_work?: boolean;
          skills?: Json;
          template?: 'minimal' | 'pastel' | 'professional';
          is_public?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          portfolio_id: string;
          name: string;
          impact_stat: string | null;
          cover_image_url: string;
          carousel_images: string[] | null;
          description: string;
          tech_stack: string[] | null;
          github_url: string | null;
          demo_url: string | null;
          is_featured: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          name: string;
          impact_stat?: string | null;
          cover_image_url: string;
          carousel_images?: string[] | null;
          description?: string;
          tech_stack?: string[] | null;
          github_url?: string | null;
          demo_url?: string | null;
          is_featured?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          name?: string;
          impact_stat?: string | null;
          cover_image_url?: string;
          carousel_images?: string[] | null;
          description?: string;
          tech_stack?: string[] | null;
          github_url?: string | null;
          demo_url?: string | null;
          is_featured?: boolean;
          order_index?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      availability_status: 'open_fulltime' | 'freelance' | 'not_looking';
      template_type: 'minimal' | 'pastel' | 'professional';
    };
  };
}
