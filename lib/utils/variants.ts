import type { ProductVariants } from '@/lib/types';

const EMPTY_VARIANTS: ProductVariants = { dimensions: [], combinations: [] };

export function normalizeVariants(input: unknown): ProductVariants {
  if (
    input &&
    typeof input === 'object' &&
    !Array.isArray(input) &&
    Array.isArray((input as ProductVariants).dimensions) &&
    Array.isArray((input as ProductVariants).combinations)
  ) {
    return input as ProductVariants;
  }
  return EMPTY_VARIANTS;
}
