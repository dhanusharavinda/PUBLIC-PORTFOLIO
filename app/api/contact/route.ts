import { getSupabasePublicServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, portfolio_username } = body;

    // Validate required fields
    if (!name || !email || !message || !portfolio_username) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = getSupabasePublicServerClient();

    // Find the portfolio by username
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('username', portfolio_username)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Insert the contact message
    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        portfolio_id: portfolio.id,
        sender_name: name,
        sender_email: email,
        message: message,
      });

    if (insertError) {
      console.error('Error inserting contact message:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
