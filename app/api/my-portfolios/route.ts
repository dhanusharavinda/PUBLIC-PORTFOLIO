import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return apiError('Unauthorized', 401);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const userEmail = userData.user.email;

    const { data: portfolios, error: portfoliosError } = await supabaseAdmin
      .from('portfolios')
      .select('id, username, full_name, job_title, is_public, updated_at')
      .eq('email', userEmail)
      .order('updated_at', { ascending: false });

    if (portfoliosError) {
      console.error('My portfolios fetch error:', portfoliosError);
      return apiError('Failed to fetch portfolios', 500);
    }

    return NextResponse.json({
      success: true,
      portfolios: portfolios || [],
    });
  } catch (error) {
    console.error('My portfolios API error:', error);
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
