'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';
import type { ActionResult } from '@/lib/types';

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin.from('store_settings').select('key, value');

  if (error) throw new Error(error.message);

  return (data ?? []).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value ?? '';
    return acc;
  }, {});
}

export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.value ?? null;
}

export async function updateSettings(data: Record<string, string>): Promise<ActionResult> {
  try {
    await requireUser();

    const rows = Object.entries(data).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseAdmin
      .from('store_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/configuracoes');
    revalidatePath('/admin/frete');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}
