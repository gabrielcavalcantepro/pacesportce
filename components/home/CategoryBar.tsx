'use client';

import type { Category } from '@/lib/types';

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

export default function CategoryBar({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange('todos')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
          activeCategory === 'todos'
            ? 'bg-[#f4f4f4] text-[#151515] border-[#f4f4f4]'
            : 'bg-transparent text-[#888888] border-[#2a2a2a] hover:text-[#f4f4f4] hover:border-[#888888]'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.slug)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            activeCategory === cat.slug
              ? 'bg-[#f4f4f4] text-[#151515] border-[#f4f4f4]'
              : 'bg-transparent text-[#888888] border-[#2a2a2a] hover:text-[#f4f4f4] hover:border-[#888888]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
