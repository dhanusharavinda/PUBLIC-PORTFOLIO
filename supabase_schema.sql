-- portoo.io Supabase Schema
-- Run this in your Supabase SQL Editor

-- Create portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  tagline TEXT,
  job_title TEXT NOT NULL,
  location TEXT,
  bio TEXT,
  email TEXT NOT NULL UNIQUE,  -- One portfolio per email enforced
  profile_photo_url TEXT,
  linkedin_url TEXT,
  github_username TEXT,
  resume_url TEXT,
  availability_status TEXT CHECK (availability_status IN ('open_fulltime', 'freelance', 'not_looking')) DEFAULT 'open_fulltime',
  open_to_work BOOLEAN DEFAULT true,
  skills JSONB DEFAULT '[]'::jsonb,
  template TEXT CHECK (template IN ('minimal', 'professional')) DEFAULT 'minimal',
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  impact_stat TEXT,
  cover_image_url TEXT,
  carousel_images TEXT[],
  description TEXT,
  tech_stack TEXT[],
  github_url TEXT,
  demo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create experiences table
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_portfolios_username ON portfolios(username);
CREATE INDEX idx_portfolios_public ON portfolios(is_public);
CREATE INDEX idx_portfolios_created ON portfolios(created_at);
CREATE INDEX idx_projects_portfolio_id ON projects(portfolio_id);
CREATE INDEX idx_projects_order ON projects(portfolio_id, order_index);
CREATE INDEX idx_experiences_portfolio_id ON experiences(portfolio_id);
CREATE INDEX idx_experiences_order ON experiences(portfolio_id, order_index);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to portfolios" ON portfolios
  FOR SELECT USING (is_public = true);

CREATE POLICY "Allow public read access to projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to experiences" ON experiences
  FOR SELECT USING (true);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(target_username TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE portfolios
  SET view_count = view_count + 1, updated_at = now()
  WHERE username = target_username
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolios_updated_at 
  BEFORE UPDATE ON portfolios 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Storage buckets configuration (run in Storage section of Supabase dashboard):
-- 1. Create bucket 'profile-photos' - set to public
-- 2. Create bucket 'project-images' - set to public  
-- 3. Create bucket 'resumes' - keep private (requires signed URLs)

-- Storage policies (run in Storage Policies section):
-- Allow anonymous uploads for portfolio creation
CREATE POLICY "Allow anonymous uploads to profile-photos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Allow anonymous uploads to project-images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Allow anonymous uploads to resumes" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Allow public access to profile-photos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow public access to project-images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'project-images');

-- Create contact_messages table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_contact_messages_portfolio_id ON contact_messages(portfolio_id);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);

-- Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow portfolio owner to view their messages
CREATE POLICY "Allow portfolio owner to view their messages" 
  ON contact_messages FOR SELECT 
  USING (portfolio_id IN (
    SELECT id FROM portfolios WHERE email = auth.jwt()->>'email'
  ));

-- Allow anyone to insert messages (for contact form)
CREATE POLICY "Allow anyone to send messages" 
  ON contact_messages FOR INSERT 
  WITH CHECK (true);
