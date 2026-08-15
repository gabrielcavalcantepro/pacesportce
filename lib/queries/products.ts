'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';
import { generateSlug } from '@/lib/utils/slug';
import { normalizeVariants } from '@/lib/utils/variants';
import type { ActionResult, Product } from '@/lib/types';

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>;

export type ProductFilters = {
  status?: 'active' | 'inactive' | 'draft';
  category_id?: string;
  search?: string;
};

const PRODUCT_SELECT = '*, category:categories(*)';

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  let query = supabaseAdmin.from('products').select(PRODUCT_SELECT).order('created_at', {
    ascending: false,
  });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as Product[]).map((p) => ({ ...p, variants: normalizeVariants(p.variants) }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const product = data as unknown as Product;
  return { ...product, variants: normalizeVariants(product.variants) };
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const product = data as unknown as Product;
  return { ...product, variants: normalizeVariants(product.variants) };
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('featured', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as unknown as Product[]).map((p) => ({ ...p, variants: normalizeVariants(p.variants) }));
}

export async function createProduct(data: ProductInput): Promise<ActionResult<Product>> {
  try {
    await requireUser();

    const { data: row, error } = await supabaseAdmin
      .from('products')
      .insert(data)
      .select(PRODUCT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };

    const product = row as unknown as Product;
    revalidatePath('/admin/produtos');
    return { success: true, data: { ...product, variants: normalizeVariants(product.variants) } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function updateProduct(
  id: string,
  data: Partial<ProductInput>
): Promise<ActionResult<Product>> {
  try {
    await requireUser();

    const { data: row, error } = await supabaseAdmin
      .from('products')
      .update(data)
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };

    const product = row as unknown as Product;
    revalidatePath('/admin/produtos');
    return { success: true, data: { ...product, variants: normalizeVariants(product.variants) } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireUser();

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/produtos');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function duplicateProduct(id: string): Promise<ActionResult<Product>> {
  try {
    await requireUser();

    const { data: original, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) return { success: false, error: fetchError.message };

    const newName = `Cópia de ${original.name}`;
    const baseSlug = generateSlug(newName);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const {
      id: _id,
      created_at: _createdAt,
      updated_at: _updatedAt,
      ...rest
    } = original;
    void _id;
    void _createdAt;
    void _updatedAt;

    const { data: row, error } = await supabaseAdmin
      .from('products')
      .insert({
        ...rest,
        name: newName,
        slug: uniqueSlug,
        status: 'draft',
        variants: normalizeVariants(rest.variants),
      })
      .select(PRODUCT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };

    const product = row as unknown as Product;
    revalidatePath('/admin/produtos');
    return { success: true, data: { ...product, variants: normalizeVariants(product.variants) } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}
