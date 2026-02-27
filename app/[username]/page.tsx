import { getSupabasePublicServerClient } from '@/lib/supabase-server';
import { PortfolioWithProjects } from '@/types/portfolio';
import { MinimalTemplate } from '@/components/templates/MinimalTemplate';
import { PastelTemplate } from '@/components/templates/PastelTemplate';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PortfolioPageProps {
  params: Promise<{ username: string }>;
}

async function getPortfolio(username: string): Promise<PortfolioWithProjects | null> {
  try {
    const supabase = getSupabasePublicServerClient();
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('username', username)
      .eq('is_public', true)
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
      title: 'Portfolio Not Found - buildfol.io',
    };
  }

  return {
    title: `${portfolio.full_name} - ${portfolio.job_title} | buildfol.io`,
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

  // Backward compatibility: old "pastel" values are now treated as "professional"
  const template = (portfolio as { template?: string }).template === 'pastel'
    ? 'professional'
    : portfolio.template;

  // Render the appropriate template
  switch (template) {
    case 'minimal':
      return <MinimalTemplate portfolio={portfolio} />;
    case 'professional':
      return <PastelTemplate portfolio={portfolio} />;
    default:
      return <MinimalTemplate portfolio={portfolio} />;
  }
}
