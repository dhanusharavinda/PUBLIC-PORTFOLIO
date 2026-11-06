import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { portfolioUsernameError } from '@/lib/portfolio-write';
import { apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return apiError('Username is required', 400);
    }

    const usernameError = portfolioUsernameError(username);
    if (usernameError) {
      return NextResponse.json({ success: true, available: false, error: usernameError });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if username exists
    const { data: existing, error } = await supabaseAdmin
      .from('portfolios')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error('Username check error:', error);
      return apiError('Failed to check username availability', 500);
    }

    return NextResponse.json({
      success: true,
      available: !existing,
      error: existing ? 'Username is already taken' : null,
    });
  } catch (error) {
    console.error('Check username API error:', error);
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
