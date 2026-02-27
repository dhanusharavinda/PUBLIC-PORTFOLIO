import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Storage bucket helpers
export const StorageBuckets = {
  PROFILE_PHOTOS: 'profile-photos',
  PROJECT_IMAGES: 'project-images',
  RESUMES: 'resumes',
} as const;

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    return { url: null, error: new Error(error.message) };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { url: urlData.publicUrl, error: null };
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 60 * 60 // 1 hour
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    return { url: null, error: new Error(error.message) };
  }

  return { url: data.signedUrl, error: null };
}
