'use client';

import { formatPrice, getActivePrice, getOriginalPrice } from '@/lib/utils/price';
import { useVariantPrice } from './VariantPriceContext';
import type { Product } from '@/lib/types';

function PixDiscountBox({ price, cashDiscount }: { price: number; cashDiscount: number }) {
  if (cashDiscount <= 0) return null;
  const precoComDesconto = Math.round(price * (1 - cashDiscount / 100));

  return (
    <div className="mt-2 mb-6 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
      <p className="text-xs text-green-400 font-medium uppercase tracking-wide mb-1">
        Pagando com PIX
      </p>
      <p className="text-2xl font-bold text-green-400">{formatPrice(precoComDesconto)}</p>
      <p className="text-xs text-green-500 mt-0.5">{cashDiscount}% de desconto no PIX</p>
    </div>
  );
}

export default function ProductPrice({ product }: { product: Product }) {
  const { effectivePrice, isOverridden } = useVariantPrice();

  if (isOverridden) {
    return (
      <>
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-bold text-[#f4f4f4]">{formatPrice(effectivePrice)}</span>
        </div>
        <PixDiscountBox price={effectivePrice} cashDiscount={product.cash_discount} />
      </>
    );
  }

  const activePrice = getActivePrice(product);
  const originalPrice = getOriginalPrice(product);

  return (
    <>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-2xl font-bold text-[#f4f4f4]">{formatPrice(activePrice)}</span>
        {originalPrice && (
          <span className="text-base text-[#888888] line-through">
            {formatPrice(originalPrice)}
          </span>
        )}
        {originalPrice && (
          <span className="text-sm font-semibold text-[#f4f4f4] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
            -{Math.round((1 - activePrice / originalPrice) * 100)}% OFF
          </span>
        )}
      </div>
      <PixDiscountBox price={activePrice} cashDiscount={product.cash_discount} />
    </>
  );
}
