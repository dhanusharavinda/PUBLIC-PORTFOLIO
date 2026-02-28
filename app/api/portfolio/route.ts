import { NextRequest, NextResponse } from 'next/server';
import { portfolioSchema, projectSchema, experienceSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { apiError } from '@/lib/api-response';

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

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const normalizedBody = {
      ...body,
      template: body?.template === 'pastel' ? 'professional' : body?.template,
    };

    // Validate the portfolio data
    const validatedPortfolio = portfolioSchema.parse(normalizedBody);

    // Check if user already has a portfolio (one portfolio per email policy)
    const { data: existingPortfolioByEmail } = await supabaseAdmin
      .from('portfolios')
      .select('username')
      .eq('email', validatedPortfolio.email)
      .maybeSingle();

    if (existingPortfolioByEmail) {
      return apiError(
        `You already have a portfolio (@${existingPortfolioByEmail.username}). You can only have one portfolio. Please edit your existing portfolio instead.`,
        409
      );
    }

    // Validate username format
    const username = validatedPortfolio.username;
    if (!username || username.length < 3) {
      return apiError('Username must be at least 3 characters long', 400);
    }

    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      return apiError('Username can only contain lowercase letters, numbers, and hyphens', 400);
    }

    // Check reserved usernames
    const reservedUsernames = [
      'admin', 'api', 'auth', 'login', 'logout', 'signup', 'register',
      'explore', 'search', 'user', 'users', 'portfolio', 'portfolios',
      'settings', 'profile', 'dashboard', 'app', 'www', 'mail', 'ftp',
      'localhost', 'test', 'demo', 'support', 'help', 'about', 'contact',
      'terms', 'privacy', 'legal', 'blog', 'news', 'careers', 'jobs',
      'api-docs', 'documentation', 'docs', 'status', 'health', 'ping',
      'robots', 'sitemap', 'favicon', 'assets', 'static', 'public',
      'create', 'edit', 'delete', 'new', 'success', 'cancel',
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      return apiError('This username is reserved and cannot be used', 400);
    }

    // Check if username is already taken
    const { data: existingUser } = await supabaseAdmin
      .from('portfolios')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return apiError(
        `The username "@${username}" is already taken. Please choose a different one.`,
        409
      );
    }

    // Insert portfolio with user-provided username
    const portfolioData = {
      ...validatedPortfolio,
      username,
    };

    const { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from('portfolios')
      .insert(portfolioData as never)
      .select()
      .single();

    if (portfolioError) {
      console.error('Portfolio insert error:', portfolioError);
      return apiError('Failed to create portfolio', 500);
    }

    const portfolioId = (portfolio as { id: string }).id;

    // Insert experiences if any (filter out empty entries)
    if (normalizedBody.experiences && normalizedBody.experiences.length > 0) {
      const nonEmptyExperiences = (normalizedBody.experiences as Record<string, unknown>[]).filter((exp) => {
        const hasCompany = typeof exp.company === 'string' && exp.company.trim() !== '';
        const hasRole = typeof exp.role === 'string' && exp.role.trim() !== '';
        const hasDescription = typeof exp.description === 'string' && exp.description.trim() !== '';
        return hasCompany || hasRole || hasDescription;
      });

      if (nonEmptyExperiences.length > 0) {
        const validatedExperiences = nonEmptyExperiences.map((exp, index: number) => {
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

        const { error: experiencesError } = await supabaseAdmin
          .from('experiences')
          .insert(validatedExperiences as never[]);

        if (experiencesError) {
          if (isMissingExperiencesSchema(experiencesError)) {
            console.warn(
              'Experiences table/schema is missing in Supabase. Continuing without saving experiences.',
              experiencesError
            );
          } else {
            console.error('Experiences insert error:', experiencesError);
            await supabaseAdmin.from('portfolios').delete().eq('id', portfolioId);
            return apiError('Failed to save experiences. Please check experience details and try again.', 500);
          }
        }
      }
    }

    // Insert projects if any (filter out empty entries)
    if (normalizedBody.projects && normalizedBody.projects.length > 0) {
      const nonEmptyProjects = (normalizedBody.projects as Record<string, unknown>[]).filter((project) => {
        const hasName = typeof project.name === 'string' && project.name.trim() !== '';
        const hasDescription = typeof project.description === 'string' && project.description.trim() !== '';
        const hasUrl = typeof project.github_url === 'string' && project.github_url.trim() !== '';
        const hasDemo = typeof project.demo_url === 'string' && project.demo_url.trim() !== '';
        return hasName || hasDescription || hasUrl || hasDemo;
      });

      if (nonEmptyProjects.length > 0) {
        const validatedProjects = nonEmptyProjects.map((project, index: number) => {
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

        const { error: projectsError } = await supabaseAdmin
          .from('projects')
          .insert(validatedProjects as never[]);

        if (projectsError) {
          console.error('Projects insert error:', projectsError);
          await supabaseAdmin.from('portfolios').delete().eq('id', portfolioId);
          return apiError('Failed to save projects. Please check project details and try again.', 500);
        }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      username: (portfolio as { username: string }).username,
      portfolio_url: `${baseUrl}/${(portfolio as { username: string }).username}`,
    });
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof ZodError) {
      return apiError('Validation error', 400, error.issues);
    }

    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
