import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const validBuckets = ['profile-photos', 'project-images', 'resumes'] as const;
type Bucket = typeof validBuckets[number];

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const path = formData.get('path') as string;

    if (!file || !bucket || !path) {
      return apiError('File, bucket, and path are required', 400);
    }

    // Validate bucket
    if (!validBuckets.includes(bucket as Bucket)) {
      return apiError('Invalid bucket', 400);
    }

    // Upload file
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
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
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
