'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeVariants } from '@/lib/utils/variants';
import type { ActionResult, Banner, Category, Order, Product, Review } from '@/lib/types';

const PRODUCT_SELECT = '*, category:categories(*)';

export async function getPublicProducts(filters?: {
  category_slug?: string;
  search?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const supabase = await createClient();
  const needsInnerJoin = Boolean(filters?.category_slug);

  let query = supabase
    .from('products')
    .select(needsInnerJoin ? '*, category:categories!inner(*)' : PRODUCT_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (filters?.category_slug) {
    query = query.eq('category.slug', filters.category_slug);
  }
  if (filters?.featured) {
    query = query.eq('featured', true);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as Product[]).map((p) => ({ ...p, variants: normalizeVariants(p.variants) }));
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Review[];
  } catch {
    return [];
  }
}

export type ReviewInput = {
  product_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
};

export async function createReview(data: ReviewInput): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('reviews').insert({ ...data, approved: false });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_order_by_number', {
      p_order_number: orderNumber,
    });

    if (error) throw new Error(error.message);
    const rows = data as Order[] | null;
    return rows && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
}

export async function getPublicProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const product = data as unknown as Product;
  return { ...product, variants: normalizeVariants(product.variants) };
}

export async function getPublicCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function getPublicBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Banner[];
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('store_settings').select('key, value');

  if (error) throw new Error(error.message);

  return (data ?? []).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value ?? '';
    return acc;
  }, {});
}

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .neq('slug', excludeSlug)
    .limit(4);

  if (error) throw new Error(error.message);
  return (data as unknown as Product[]).map((p) => ({ ...p, variants: normalizeVariants(p.variants) }));
}
