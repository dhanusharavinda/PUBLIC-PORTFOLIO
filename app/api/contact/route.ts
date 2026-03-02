import { getSupabasePublicServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const supabase = getSupabasePublicServerClient() as any;

    // Find the portfolio by username
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, email, full_name')
      .eq('username', portfolio_username)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Insert the contact message using raw insert to bypass type checking
    const insertData = {
      portfolio_id: portfolio.id,
      sender_name: name,
      sender_email: email,
      message: message,
    };

    const query = supabase.from('contact_messages');
    const { error: insertError } = await query.insert(insertData);

    if (insertError) {
      console.error('Error inserting contact message:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Send email notification to portfolio owner
    if (process.env.RESEND_API_KEY && portfolio.email) {
      try {
        await resend.emails.send({
          from: 'Portlyfolio <contact@portlyfolio.site>',
          to: portfolio.email,
          subject: `New message from ${name} via your portfolio`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">New Message on Your Portfolio</h2>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background: #f3f4f6; padding: 16px; border-left: 4px solid #4f46e5; margin: 0;">
                ${message.replace(/\n/g, '<br>')}
              </blockquote>
              <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
              <p style="color: #6b7280; font-size: 14px;">
                Sent via <a href="https://portlyfolio.site/${portfolio_username}">portlyfolio.site</a>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails - the message is already saved
      }
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
