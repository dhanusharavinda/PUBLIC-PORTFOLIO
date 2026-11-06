import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getPortfolioAccount } from '@/lib/portfolio-account';
import { MAX_PORTFOLIO_UPLOAD_BYTES } from '@/lib/upload-limit';
import { randomUUID } from 'node:crypto';

const validBuckets = ['profile-photos', 'project-images', 'resumes'] as const;
type Bucket = typeof validBuckets[number];
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/bmp']);

export async function POST(request: NextRequest) {
  try {
    const account = await getPortfolioAccount(request);
    if (!account) return apiError('Sign in to upload portfolio files', 401);

    const supabaseAdmin = getSupabaseAdmin();
    const formData = await request.formData().catch(() => null);
    const file = formData?.get('file');
    const bucket = formData?.get('bucket');

    if (!(file instanceof File) || !file.size || typeof bucket !== 'string') {
      return apiError('Choose a nonempty file and a valid upload type', 400);
    }
    if (!validBuckets.includes(bucket as Bucket)) {
      return apiError('Invalid bucket', 400);
    }
    if (file.size > MAX_PORTFOLIO_UPLOAD_BYTES) {
      return apiError('Choose a file under 4 MB', 413);
    }
    if (bucket === 'resumes' ? file.type !== 'application/pdf' : !imageTypes.has(file.type)) {
      return apiError(bucket === 'resumes' ? 'Choose a PDF résumé' : 'Choose a supported image file', 415);
    }
    const name = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(-120);
    const path = [account.id, randomUUID() + '-' + name].join('/');

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return apiError('Failed to upload file', 500);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('API error:', error);
    return apiError('Could not upload this file. Please try again.', 500);
  }
}
