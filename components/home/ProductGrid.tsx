'use client';

import { useState } from 'react';
import CategoryBar from './CategoryBar';
import ProductCard from '@/components/product/ProductCard';
import { useSearch } from '@/context/SearchContext';
import type { Product, Category } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
}

export default function ProductGrid({ products, categories }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const { query: searchQuery } = useSearch();

  const search = searchQuery.trim().toLowerCase();

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'todos' || p.category?.slug === activeCategory;
    if (!search) return matchesCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(search) ||
      (p.description ?? '').toLowerCase().includes(search) ||
      p.tags.some((t) => t.toLowerCase().includes(search));

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
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          {search && (
            <p className="text-sm text-[#888888] mt-3">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-[#888888] py-16">Nenhum produto encontrado</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Mais Vendidos — only when no search active */}
        {!search && featured.length > 0 && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
