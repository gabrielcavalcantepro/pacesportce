'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';

export async function uploadImage(
  file: File,
  folder: 'products' | 'banners'
): Promise<string> {
  await requireUser();

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseAdmin.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
