import { getSupabasePublicServerClient } from '@/lib/supabase-server';
import { Portfolio } from '@/types/portfolio';
import { ExploreDirectory } from '@/components/explore/ExploreDirectory';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AuthHeaderActions } from '@/components/auth/AuthHeaderActions';

async function getPortfolios(): Promise<Portfolio[]> {
  try {
    const supabase = getSupabasePublicServerClient();
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolios:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Explore fetch failed:', error);
    return [];
  }
}

export default async function ExplorePage() {
  const portfolios = await getPortfolios();

  // Extract unique skills for filter
  const allSkills = new Set<string>();
  portfolios.forEach((p) => {
    if (Array.isArray(p.skills)) {
      p.skills.forEach((s: { name: string }) => allSkills.add(s.name));
    }
  });

  return (
    <div className="min-h-screen bg-[#FEFCE8] text-slate-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-dashed border-stone-200 px-6 md:px-10 py-4 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-10 flex items-center justify-center bg-sky-100 text-indigo-600 rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight">buildfol.io</span>
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
        <ExploreDirectory portfolios={portfolios} allSkills={Array.from(allSkills).slice(0, 30)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-dashed border-stone-200 py-10 px-6 md:px-10 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">buildfol.io</span>
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
