'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { getActivePrice } from '@/lib/utils/price';
import type { Product } from '@/lib/types';

type VariantPriceContextValue = {
  selectedOptions: Record<string, string>;
  selectOption: (dimensionName: string, option: string) => void;
  effectivePrice: number;
  effectiveStock: number;
  isOverridden: boolean;
};

const VariantPriceContext = createContext<VariantPriceContextValue | null>(null);

export function VariantPriceProvider({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  function selectOption(dimensionName: string, option: string) {
    setSelectedOptions((prev) => ({ ...prev, [dimensionName]: option }));
  }

  const { effectivePrice, effectiveStock, isOverridden } = useMemo(() => {
    const { dimensions, combinations } = product.variants;
    const allSelected = dimensions.length > 0 && dimensions.every((d) => selectedOptions[d.name]);

    if (!allSelected) {
      return {
        effectivePrice: getActivePrice(product),
        effectiveStock: product.stock,
        isOverridden: false,
      };
    }

    const key = dimensions.map((d) => selectedOptions[d.name]).join('|');
    const combination = combinations.find((c) => c.key === key);

    return {
      effectivePrice:
        combination && combination.price != null ? combination.price : getActivePrice(product),
      effectiveStock:
        combination && combination.stock != null ? combination.stock : product.stock,
      isOverridden: Boolean(combination && combination.price != null),
    };
  }, [product, selectedOptions]);

  return (
    <VariantPriceContext.Provider
      value={{ selectedOptions, selectOption, effectivePrice, effectiveStock, isOverridden }}
    >
      {children}
    </VariantPriceContext.Provider>
  );
}

export function useVariantPrice() {
  const ctx = useContext(VariantPriceContext);
  if (!ctx) {
    throw new Error('useVariantPrice must be used within a VariantPriceProvider');
  }
  return ctx;
}
