import { getSupabasePublicServerClient } from '@/lib/supabase-server';
import { ExploreDirectory } from '@/components/explore/ExploreDirectory';
import { ExploreShell } from '@/components/explore/ExploreShell';

interface ProjectWithPortfolio {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  tech_stack: string[];
  project_created_at: string;
  portfolio_id: string;
  portfolio_username: string;
  portfolio_full_name: string;
  portfolio_job_title: string;
  portfolio_profile_photo_url: string;
  portfolio_view_count: number;
}

async function getPublicProjects(): Promise<ProjectWithPortfolio[]> {
  try {
    const supabase = getSupabasePublicServerClient();

    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        cover_image_url,
        tech_stack,
        created_at,
        portfolio_id,
        portfolios!inner(
          username,
          full_name,
          job_title,
          profile_photo_url,
          view_count,
          is_public
        )
      `)
      .eq('portfolios.is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      cover_image_url: item.cover_image_url,
      tech_stack: item.tech_stack || [],
      project_created_at: item.created_at,
      portfolio_id: item.portfolio_id,
      portfolio_username: item.portfolios.username,
      portfolio_full_name: item.portfolios.full_name,
      portfolio_job_title: item.portfolios.job_title,
      portfolio_profile_photo_url: item.portfolios.profile_photo_url,
      portfolio_view_count: item.portfolios.view_count,
    }));
  } catch (error) {
    console.error('Explore fetch failed:', error);
    return [];
  }
}

export default async function ExplorePage() {
  const projects = await getPublicProjects();

  const allSkills = new Set<string>();
  projects.forEach((project) => {
    project.tech_stack.forEach((skill) => allSkills.add(skill));
  });

  return (
    <ExploreShell>
      <ExploreDirectory projects={projects} allSkills={Array.from(allSkills).sort()} />
    </ExploreShell>
  );
}
