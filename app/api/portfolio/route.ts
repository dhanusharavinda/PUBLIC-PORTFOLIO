import { NextRequest, NextResponse } from 'next/server';
import { portfolioSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { apiError } from '@/lib/api-response';
import { getPortfolioAccount } from '@/lib/portfolio-account';
import { isMissingExperiencesSchema, isMissingSectionVisibilityColumn, parseExperiences, parseProjects, portfolioUsernameError } from '@/lib/portfolio-write';

export async function POST(request: NextRequest) {
  try {
    const account = await getPortfolioAccount(request);
    if (!account) return apiError('Sign in to publish your portfolio', 401);

    const body = await request.json();
    const portfolioData = portfolioSchema.parse({
      ...body,
      template: body?.template === 'pastel' ? 'professional' : body?.template,
    });
    if (portfolioData.email.toLowerCase() !== account.email.toLowerCase()) {
      return apiError('Use your sign-in email to publish your portfolio', 403);
    }
    portfolioData.email = account.email;
    const { username } = portfolioData;
    const usernameError = portfolioUsernameError(username);
    if (usernameError) return apiError(usernameError, 400);

    const experiences = parseExperiences(body.experiences);
    const projects = parseProjects(body.projects);
    const supabaseAdmin = getSupabaseAdmin();
    const [byEmail, byUsername] = await Promise.all([
      supabaseAdmin.from('portfolios').select('username').eq('email', account.email).maybeSingle(),
      supabaseAdmin.from('portfolios').select('username').eq('username', username).maybeSingle(),
    ]);

    if (byEmail.error || byUsername.error) {
      console.error('Portfolio availability check failed:', byEmail.error || byUsername.error);
      return apiError('Could not check portfolio availability. Please try again.', 503);
    }
    if (byEmail.data) {
      return apiError('You already have a portfolio. Please edit it instead.', 409);
    }
    if (byUsername.data) {
      return apiError('This username is already taken. Please choose another.', 409);
    }

    let { data: portfolio, error: portfolioError } = await supabaseAdmin
      .from('portfolios')
      .insert(portfolioData as never)
      .select()
      .single();

    // Graceful fallback: if section_visibility column isn't migrated yet, retry without it
    if (portfolioError && isMissingSectionVisibilityColumn(portfolioError)) {
      const withoutVisibility = { ...portfolioData };
      delete withoutVisibility.section_visibility;
      ({ data: portfolio, error: portfolioError } = await supabaseAdmin
        .from('portfolios')
        .insert(withoutVisibility as never)
        .select()
        .single());
    }

    if (portfolioError?.code === '23505') {
      return apiError('This username or account already has a portfolio. Please check and try again.', 409);
    }
    if (portfolioError || !portfolio) {
      console.error('Portfolio insert error:', portfolioError);
      return apiError('Failed to create portfolio', 500);
    }

    const portfolioId = (portfolio as unknown as { id: string }).id;

    if (experiences?.length) {
      const { error } = await supabaseAdmin.from('experiences')
        .insert(experiences.map((row) => ({ ...row, portfolio_id: portfolioId })) as never[]);
      if (error && !isMissingExperiencesSchema(error)) {
        console.error('Experience insert error:', error);
        await supabaseAdmin.from('portfolios').delete().eq('id', portfolioId);
        return apiError('Failed to save experiences. Please try again.', 500);
      }
    }

    if (projects?.length) {
      const { error } = await supabaseAdmin.from('projects')
        .insert(projects.map((row) => ({ ...row, portfolio_id: portfolioId })) as never[]);
      if (error) {
        console.error('Project insert error:', error);
        await supabaseAdmin.from('portfolios').delete().eq('id', portfolioId);
        return apiError('Failed to save projects. Please try again.', 500);
      }
    }

    revalidatePath('/explore');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      username: (portfolio as unknown as { username: string }).username,
      portfolio_url: `${baseUrl}/${(portfolio as unknown as { username: string }).username}`,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError('Validation error', 400, error.issues);
    }

    if (error instanceof SyntaxError) return apiError('Invalid JSON', 400);
    console.error('Portfolio creation failed:', error);
    return apiError('Failed to create portfolio', 500);
  }
}
