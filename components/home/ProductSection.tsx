'use client';

import { useState } from 'react';
import CategoryBar, { type FilterCategory } from './CategoryBar';
import ProductGrid from './ProductGrid';
import { useSearch } from '@/context/SearchContext';
import type { Product } from '@/lib/types';

interface ProductSectionProps {
  products: Product[];
}

export default function ProductSection({ products }: ProductSectionProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('todos');
  const { query } = useSearch();

  const searchLower = query.trim().toLowerCase();

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'todos' || p.category === activeCategory;
    if (!searchLower) return matchesCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some((t) => t.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section id="produtos" className="py-20 lg:py-28 bg-[#151515]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#888888] uppercase tracking-widest">
            Catálogo
          </span>
          <h2 className="font-display text-[22px] sm:text-[28px] lg:text-[36px] font-bold text-[#f4f4f4] mt-2 mb-6">
            Nossos Produtos
          </h2>
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
          {searchLower && (
            <p className="text-sm text-[#888888] mt-3">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
            </p>
          )}
        </div>

        <ProductGrid products={filtered} />

        {/* Mais Vendidos — only when no search active */}
        {!searchLower && (
          <>
            <div className="my-14 border-t border-[#2a2a2a]" />
            <div className="mb-8">
              <span className="text-xs font-semibold text-[#888888] uppercase tracking-widest">
                Destaques
              </span>
              <h3 className="font-display text-[20px] sm:text-[24px] lg:text-[28px] font-bold text-[#f4f4f4] mt-2">
                Mais Vendidos
              </h3>
            </div>
            <ProductGrid products={featured} />
          </>
        )}
      </div>
    </section>
  );
}
