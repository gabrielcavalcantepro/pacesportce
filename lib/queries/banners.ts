'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';
import type { ActionResult, Banner } from '@/lib/types';

export type BannerInput = Omit<Banner, 'id' | 'created_at'>;

export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Banner[];
}

export async function getActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Banner[];
}

export async function createBanner(data: BannerInput): Promise<ActionResult<Banner>> {
  try {
    await requireUser();

    const { data: row, error } = await supabaseAdmin
      .from('banners')
      .insert(data)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/banners');
    return { success: true, data: row as Banner };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function updateBanner(
  id: string,
  data: Partial<BannerInput>
): Promise<ActionResult<Banner>> {
  try {
    await requireUser();

    const { data: row, error } = await supabaseAdmin
      .from('banners')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/banners');
    return { success: true, data: row as Banner };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  try {
    await requireUser();

    const { error } = await supabaseAdmin.from('banners').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/banners');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}
