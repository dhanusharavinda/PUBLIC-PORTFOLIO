import { getSupabaseAdmin } from '@/lib/supabase-server';
import { PortfolioWithProjects } from '@/types/portfolio';
import { EditorialPortfolio } from '@/components/portfolio/EditorialPortfolio';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cache } from 'react';
import { isMissingExperiencesSchema } from '@/lib/portfolio-write';

interface PortfolioPageProps {
  params: Promise<{ username: string }>;
}

const getPortfolio = cache(async (username: string) => {
  const { data, error } = await getSupabaseAdmin().from('portfolios')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('Portfolio fetch failed:', error);
    throw new Error('Could not load portfolio');
  }
  return data as (Omit<PortfolioWithProjects, 'experiences' | 'projects'> & { id: string }) | null;
});

async function getPortfolioSections(portfolioId: string) {
  const supabase = getSupabaseAdmin();
  const [experiences, projects] = await Promise.all([
    supabase.from('experiences').select('*').eq('portfolio_id', portfolioId).order('order_index'),
    supabase.from('projects').select('*').eq('portfolio_id', portfolioId).order('order_index'),
  ]);

  if (projects.error || (experiences.error && !isMissingExperiencesSchema(experiences.error))) {
    console.error('Portfolio sections fetch failed:', projects.error || experiences.error);
    throw new Error('Could not load portfolio sections');
  }
  return { experiences: experiences.data || [], projects: projects.data || [] };
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

  const sections = await getPortfolioSections(portfolio.id);
  return <main><EditorialPortfolio key={username} portfolio={{ ...portfolio, ...sections }} /></main>;
}
