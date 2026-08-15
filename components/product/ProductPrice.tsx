'use client';

import { formatPrice } from '@/lib/utils/price';
import { useVariantPrice } from './VariantPriceContext';
import type { Product } from '@/lib/types';

export default function ProductPrice({ product }: { product: Product }) {
  const { effectivePrice, isOverridden } = useVariantPrice();

  if (isOverridden) {
    return (
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-2xl font-bold text-[#f4f4f4]">{formatPrice(effectivePrice)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-3 mb-6">
      <span className="text-2xl font-bold text-[#f4f4f4]">{formatPrice(product.price)}</span>
      {product.compare_at_price && (
        <span className="text-base text-[#888888] line-through">
          {formatPrice(product.compare_at_price)}
        </span>
      )}
      {product.compare_at_price && (
        <span className="text-sm font-semibold text-[#f4f4f4] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
          -{Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
        </span>
      )}
    </div>
  );
}
