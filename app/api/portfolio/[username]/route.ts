import { NextRequest, NextResponse } from 'next/server';
import { PortfolioWithProjects } from '@/types/portfolio';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { apiError } from '@/lib/api-response';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { portfolioSchema } from '@/lib/validations';
import { getPortfolioAccount } from '@/lib/portfolio-account';
import { isMissingExperiencesSchema, isMissingSectionVisibilityColumn, parseExperiences, parseProjects } from '@/lib/portfolio-write';

const updateSchema = portfolioSchema.omit({ username: true, email: true, is_public: true }).partial()
  .extend({ is_public: z.boolean().optional() });

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
      .single();

    if (portfolioError || !portfolio) {
      return apiError('Portfolio not found', 404);
    }

    const portfolioData = portfolio as PortfolioWithProjects;
    const portfolioId = portfolioData.id as string;

    const [experiences, projects] = await Promise.all([
      supabaseAdmin.from('experiences').select('*').eq('portfolio_id', portfolioId).order('order_index'),
      supabaseAdmin.from('projects').select('*').eq('portfolio_id', portfolioId).order('order_index'),
    ]);
    if (projects.error || (experiences.error && !isMissingExperiencesSchema(experiences.error))) {
      console.error('Portfolio sections fetch failed:', projects.error || experiences.error);
      return apiError('Could not load all portfolio sections. Please try again.', 503);
    }

    return NextResponse.json({
      ...portfolioData,
      experiences: experiences.data || [],
      projects: projects.data || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const account = await getPortfolioAccount(request);
    if (!account) return apiError('Sign in to edit your portfolio', 401);

    const supabaseAdmin = getSupabaseAdmin();
    const { username } = await params;
    const { data: row, error: existingError } = await supabaseAdmin
      .from('portfolios')
      .select('id, email')
      .eq('username', username)
      .maybeSingle();
    const existing = row as { id: string; email: string } | null;

    if (existingError) {
      console.error('Portfolio ownership lookup failed:', existingError);
      return apiError('Could not load portfolio. Please try again.', 503);
    }
    if (!existing) return apiError('Portfolio not found', 404);
    if (existing.email.toLowerCase() !== account.email.toLowerCase()) {
      return apiError('You can only edit your own portfolio', 403);
    }

    const body = await request.json();
    const updateData = updateSchema.parse({
      ...body,
      template: body?.template === 'pastel' ? 'professional' : body?.template,
    });
    const experiences = parseExperiences(body?.experiences);
    const projects = parseProjects(body?.projects);
    const portfolioId = existing.id;
    const patch = { ...updateData, updated_at: new Date().toISOString() };

    let { data: portfolio, error } = await supabaseAdmin
      .from('portfolios')
      .update(patch as never)
      .eq('id', portfolioId)
      .eq('email', existing.email)
      .select()
      .single();

    // Graceful fallback: if section_visibility column isn't migrated yet, retry without it
    if (error && isMissingSectionVisibilityColumn(error)) {
      const withoutVisibility = { ...patch };
      delete withoutVisibility.section_visibility;
      ({ data: portfolio, error } = await supabaseAdmin
        .from('portfolios')
        .update(withoutVisibility as never)
        .eq('id', portfolioId)
        .eq('email', existing.email)
        .select()
        .single());
    }

    if (error) {
      console.error('Portfolio update error:', error);
      return apiError('Failed to update portfolio', 500);
    }

    if (experiences) {
      const { error } = await supabaseAdmin.from('experiences').delete().eq('portfolio_id', portfolioId);
      if (error && !isMissingExperiencesSchema(error)) {
        console.error('Experience delete error:', error);
        return apiError('Failed to update experiences', 500);
      }
      if (!error && experiences.length) {
        const { error: insertError } = await supabaseAdmin.from('experiences')
          .insert(experiences.map((row) => ({ ...row, portfolio_id: portfolioId })) as never[]);
        if (insertError) {
          console.error('Experience insert error:', insertError);
          return apiError('Failed to update experiences', 500);
        }
      }
    }

    if (projects) {
      const { error } = await supabaseAdmin.from('projects').delete().eq('portfolio_id', portfolioId);
      if (error) {
        console.error('Project delete error:', error);
        return apiError('Failed to update projects', 500);
      }
      if (projects.length) {
        const { error: insertError } = await supabaseAdmin.from('projects')
          .insert(projects.map((row) => ({ ...row, portfolio_id: portfolioId })) as never[]);
        if (insertError) {
          console.error('Project insert error:', insertError);
          return apiError('Failed to update projects', 500);
        }
      }
    }

    revalidatePath('/explore');
    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    if (error instanceof z.ZodError) return apiError('Validation error', 400, error.issues);
    if (error instanceof SyntaxError) return apiError('Invalid JSON', 400);
    console.error('Portfolio update failed:', error);
    return apiError('Failed to update portfolio', 500);
  }
}
