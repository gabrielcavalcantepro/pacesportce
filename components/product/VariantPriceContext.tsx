'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';

type VariantPriceContextValue = {
  selectedOptions: Record<string, string>;
  selectOption: (dimensionName: string, option: string) => void;
  effectivePrice: number;
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

  const { effectivePrice, isOverridden } = useMemo(() => {
    const { dimensions, combinations } = product.variants;
    const allSelected = dimensions.length > 0 && dimensions.every((d) => selectedOptions[d.name]);

    if (!allSelected) {
      return { effectivePrice: product.price, isOverridden: false };
    }

    const key = dimensions.map((d) => selectedOptions[d.name]).join('|');
    const combination = combinations.find((c) => c.key === key);

    if (combination && combination.price != null) {
      return { effectivePrice: combination.price, isOverridden: true };
    }

    return { effectivePrice: product.price, isOverridden: false };
  }, [product, selectedOptions]);

  return (
    <VariantPriceContext.Provider
      value={{ selectedOptions, selectOption, effectivePrice, isOverridden }}
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
