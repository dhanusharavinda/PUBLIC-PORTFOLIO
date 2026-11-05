import { getSupabaseAdmin } from '@/lib/supabase-server';
import { PortfolioWithProjects } from '@/types/portfolio';
import { EditorialPortfolio } from '@/components/portfolio/EditorialPortfolio';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PortfolioPageProps {
  params: Promise<{ username: string }>;
}

async function getPortfolio(username: string): Promise<PortfolioWithProjects | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('username', username)
      .single();

    if (portfolioError || !portfolio) {
      return null;
    }

    const portfolioId = (portfolio as { id: string }).id;

    const { data: experiences, error: experiencesError } = await supabase
      .from('experiences')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('order_index', { ascending: true });

    if (experiencesError) {
      console.error('Error fetching experiences:', experiencesError);
    }

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('order_index', { ascending: true });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    }

    return {
      ...(portfolio as PortfolioWithProjects),
      experiences: experiences || [],
      projects: projects || [],
    };
  } catch (error) {
    console.error('Portfolio fetch failed:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  const portfolio = await getPortfolio(username);

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found - portlyfolio.site',
    };
  }

  return {
    title: `${portfolio.full_name} - ${portfolio.job_title} | portlyfolio.site`,
    description: portfolio.bio,
    openGraph: {
      title: `${portfolio.full_name} - ${portfolio.job_title}`,
      description: portfolio.bio,
      images: portfolio.profile_photo_url ? [portfolio.profile_photo_url] : [],
    },
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { username } = await params;
  const portfolio = await getPortfolio(username);

  if (!portfolio) {
    notFound();
  }

  return <main><EditorialPortfolio key={username} portfolio={portfolio} /></main>;
}
