import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return apiError('Username is required', 400);
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        success: true,
        available: false,
        error: 'Username can only contain lowercase letters, numbers, and hyphens',
      });
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({
        success: true,
        available: false,
        error: 'Username must be between 3 and 30 characters',
      });
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
      return NextResponse.json({
        success: true,
        available: false,
        error: 'This username is reserved',
      });
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
