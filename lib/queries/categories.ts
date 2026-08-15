'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';
import type { ActionResult, Category } from '@/lib/types';

export type CategoryInput = {
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
};

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function getActiveCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function createCategory(
  data: CategoryInput
): Promise<ActionResult<Category>> {
  try {
    await requireUser();

    const { data: row, error } = await supabaseAdmin
      .from('categories')
      .insert(data)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categorias');
    return { success: true, data: row as Category };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryInput>
): Promise<ActionResult<Category>> {
  try {
    await requireUser();

    const { data: row, error } = await supabaseAdmin
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categorias');
    return { success: true, data: row as Category };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function updateCategoriesOrder(ids: string[]): Promise<ActionResult> {
  try {
    await requireUser();

    const results = await Promise.all(
      ids.map((id, index) =>
        supabaseAdmin.from('categories').update({ display_order: index }).eq('id', id)
      )
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) return { success: false, error: failed.error.message };

    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireUser();

    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) return { success: false, error: countError.message };
    if (count && count > 0) {
      return { success: false, error: 'Categoria possui produtos vinculados.' };
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}
