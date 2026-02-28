import { getSupabasePublicServerClient } from '@/lib/supabase-server';
import { ExploreDirectory } from '@/components/explore/ExploreDirectory';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AuthHeaderActions } from '@/components/auth/AuthHeaderActions';

interface ProjectWithPortfolio {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  tech_stack: string[];
  portfolio_id: string;
  portfolio_username: string;
  portfolio_full_name: string;
  portfolio_job_title: string;
  portfolio_profile_photo_url: string;
  portfolio_view_count: number;
  portfolio_created_at: string;
}

async function getPublicProjects(): Promise<ProjectWithPortfolio[]> {
  try {
    const supabase = getSupabasePublicServerClient();
    
    // Fetch projects from public portfolios
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        cover_image_url,
        tech_stack,
        portfolio_id,
        portfolios!inner(
          username,
          full_name,
          job_title,
          profile_photo_url,
          view_count,
          created_at,
          is_public
        )
      `)
      .eq('portfolios.is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    // Transform the data
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      cover_image_url: item.cover_image_url,
      tech_stack: item.tech_stack || [],
      portfolio_id: item.portfolio_id,
      portfolio_username: item.portfolios.username,
      portfolio_full_name: item.portfolios.full_name,
      portfolio_job_title: item.portfolios.job_title,
      portfolio_profile_photo_url: item.portfolios.profile_photo_url,
      portfolio_view_count: item.portfolios.view_count,
      portfolio_created_at: item.portfolios.created_at,
    }));
  } catch (error) {
    console.error('Explore fetch failed:', error);
    return [];
  }
}

export default async function ExplorePage() {
  const projects = await getPublicProjects();

  // Extract all unique skills for the filter dropdown
  const allSkills = new Set<string>();
  projects.forEach((project) => {
    project.tech_stack.forEach((skill) => allSkills.add(skill));
  });

  return (
    <div className="min-h-screen bg-[#FEFCE8] text-slate-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-dashed border-stone-200 px-6 md:px-10 py-4 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="size-10 flex items-center justify-center bg-sky-100 text-indigo-600 rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight">portoo.io</span>
          </Link>
          <div className="flex flex-1 justify-end sm:justify-center gap-2">
            <span className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full text-sm font-bold">
              Explore
            </span>
            <Link
              href="/"
              className="text-slate-500 hover:text-indigo-600 hover:bg-slate-50 px-4 py-2 rounded-full text-sm font-bold transition-all"
            >
              Create
            </Link>
            <AuthHeaderActions />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 md:px-10 py-12">
        <ExploreDirectory projects={projects} allSkills={Array.from(allSkills).sort()} />
      </main>

      {/* Footer */}
      <footer className="border-t border-dashed border-stone-200 py-10 px-6 md:px-10 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">portoo.io</span>
            <span className="text-slate-400 text-sm ml-2">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-8">
            <Link href="/" className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">
              Create Portfolio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
