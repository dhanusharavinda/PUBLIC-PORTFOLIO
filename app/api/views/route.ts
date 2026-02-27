import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { username } = await request.json();

    if (!username) {
      return apiError('Username is required', 400);
    }

    // Try RPC first
    try {
      const { data, error } = await supabaseAdmin.rpc('increment_view_count', {
        target_username: username,
      } as never);

      if (!error && data !== null) {
        return NextResponse.json({ count: data });
      }
    } catch (rpcError) {
      // RPC failed, fall back to manual update
    }

    // Manual view count increment
    const { data: portfolio } = await supabaseAdmin
      .from('portfolios')
      .select('view_count')
      .eq('username', username)
      .single();

    if (portfolio) {
      const currentCount = (portfolio as { view_count: number }).view_count || 0;
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('portfolios')
        .update({ view_count: currentCount + 1 } as never)
        .eq('username', username)
        .select('view_count')
        .single();

      if (updateError) {
        throw updateError;
      }

      const newCount = updated ? (updated as { view_count: number }).view_count : currentCount + 1;
      return NextResponse.json({ count: newCount });
    }

    return NextResponse.json({ count: 0 });
  } catch (error) {
    console.error('API error:', error);
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
