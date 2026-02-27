import { NextRequest, NextResponse } from 'next/server';
import { PortfolioWithProjects } from '@/types/portfolio';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { apiError } from '@/lib/api-response';
import { projectSchema, experienceSchema } from '@/lib/validations';

function isMissingExperiencesSchema(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error && typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code
    : '';
  const message = 'message' in error && typeof (error as { message?: unknown }).message === 'string'
    ? (error as { message: string }).message.toLowerCase()
    : '';
  return code === '42P01' || message.includes('relation') || message.includes('experiences');
}

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { username } = await params;

    // Fetch portfolio
    const { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from('portfolios')
      .select('*')
      .eq('username', username)
      .eq('is_public', true)
      .single();

    if (portfolioError || !portfolio) {
      return apiError('Portfolio not found', 404);
    }

    const portfolioData = portfolio as PortfolioWithProjects;
    const portfolioId = portfolioData.id as string;

    // Fetch experiences
    const { data: experiences, error: experiencesError } = await supabaseAdmin
      .from('experiences')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('order_index', { ascending: true });

    if (experiencesError) {
      console.error('Experiences fetch error:', experiencesError);
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('order_index', { ascending: true });

    if (projectsError) {
      console.error('Projects fetch error:', projectsError);
    }

    return NextResponse.json({
      ...portfolioData,
      experiences: experiences || [],
      projects: projects || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { username } = await params;
    const body = await request.json();

    const { data: existingPortfolio, error: existingError } = await supabaseAdmin
      .from('portfolios')
      .select('id')
      .eq('username', username)
      .single();

    if (existingError || !existingPortfolio) {
      return apiError('Portfolio not found', 404);
    }

    const portfolioId = (existingPortfolio as { id: string }).id;
    const { experiences, projects, ...portfolioUpdates } = body as { experiences?: Record<string, unknown>[]; projects?: Record<string, unknown>[] };

    // Update portfolio
    const updateData = {
      ...portfolioUpdates,
      template: (portfolioUpdates as { template?: string }).template === 'pastel'
        ? 'professional'
        : (portfolioUpdates as { template?: string }).template,
      updated_at: new Date().toISOString(),
    };

    const { data: portfolio, error } = await supabaseAdmin
      .from('portfolios')
      .update(updateData as never)
      .eq('username', username)
      .select()
      .single();

    if (error) {
      console.error('Portfolio update error:', error);
      return apiError('Failed to update portfolio', 500);
    }

    // Update experiences if provided (filter out empty entries)
    if (Array.isArray(experiences)) {
      const nonEmptyExperiences = experiences.filter((exp) => {
        const hasCompany = typeof exp.company === 'string' && exp.company.trim() !== '';
        const hasRole = typeof exp.role === 'string' && exp.role.trim() !== '';
        const hasDescription = typeof exp.description === 'string' && exp.description.trim() !== '';
        return hasCompany || hasRole || hasDescription;
      });

      const { error: deleteExpError } = await supabaseAdmin
        .from('experiences')
        .delete()
        .eq('portfolio_id', portfolioId);

      if (deleteExpError) {
        if (isMissingExperiencesSchema(deleteExpError)) {
          console.warn(
            'Experiences table/schema is missing in Supabase. Continuing without updating experiences.',
            deleteExpError
          );
        } else {
          console.error('Experience delete error:', deleteExpError);
          return apiError('Failed to update experiences', 500);
        }
      }

      if (nonEmptyExperiences.length > 0 && !isMissingExperiencesSchema(deleteExpError)) {
        const validatedExperiences = nonEmptyExperiences.map((exp, index) => {
          // Provide defaults for optional fields
          const expWithDefaults = {
            company: exp.company || '',
            role: exp.role || '',
            location: exp.location || '',
            start_date: exp.start_date || '',
            end_date: exp.end_date || '',
            is_current: exp.is_current ?? false,
            description: exp.description || '',
            order_index: index,
          };
          const parsed = experienceSchema.parse(expWithDefaults);
          return {
            ...parsed,
            portfolio_id: portfolioId,
          };
        });

        const { error: insertExpError } = await supabaseAdmin
          .from('experiences')
          .insert(validatedExperiences as never[]);

        if (insertExpError) {
          if (isMissingExperiencesSchema(insertExpError)) {
            console.warn(
              'Experiences table/schema is missing in Supabase. Continuing without saving experiences.',
              insertExpError
            );
          } else {
            console.error('Experience insert error:', insertExpError);
            return apiError('Failed to update experiences', 500);
          }
        }
      }
    }

    // Update projects if provided (filter out empty entries)
    if (Array.isArray(projects)) {
      const nonEmptyProjects = projects.filter((project) => {
        const hasName = typeof project.name === 'string' && project.name.trim() !== '';
        const hasDescription = typeof project.description === 'string' && project.description.trim() !== '';
        const hasUrl = typeof project.github_url === 'string' && project.github_url.trim() !== '';
        const hasDemo = typeof project.demo_url === 'string' && project.demo_url.trim() !== '';
        return hasName || hasDescription || hasUrl || hasDemo;
      });

      const { error: deleteError } = await supabaseAdmin
        .from('projects')
        .delete()
        .eq('portfolio_id', portfolioId);

      if (deleteError) {
        console.error('Project delete error:', deleteError);
        return apiError('Failed to update projects', 500);
      }

      if (nonEmptyProjects.length > 0) {
        const validatedProjects = nonEmptyProjects.map((project, index) => {
          // Provide defaults for optional fields
          const projectWithDefaults = {
            name: project.name || '',
            cover_image_url: project.cover_image_url || '',
            description: project.description || '',
            tech_stack: project.tech_stack || [],
            github_url: project.github_url || '',
            demo_url: project.demo_url || '',
            is_featured: project.is_featured ?? false,
            order_index: index,
          };
          const parsed = projectSchema.parse(projectWithDefaults);
          return {
            ...parsed,
            portfolio_id: portfolioId,
          };
        });

        const { error: insertError } = await supabaseAdmin
          .from('projects')
          .insert(validatedProjects as never[]);

        if (insertError) {
          console.error('Project insert error:', insertError);
          return apiError('Failed to update projects', 500);
        }
      }
    }

    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    console.error('API error:', error);
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
