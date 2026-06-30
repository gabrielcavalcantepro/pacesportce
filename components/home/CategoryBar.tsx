'use client';

import type { Category } from '@/lib/types';

export type FilterCategory = Category | 'todos';

interface CategoryBarProps {
  active: FilterCategory;
  onChange: (cat: FilterCategory) => void;
}

const categories: { value: FilterCategory; label: string }[] = [
  { value: 'todos',              label: 'Todos' },
  { value: 'acessorios-bike',   label: 'Acessórios Bike' },
  { value: 'acessorios-corrida', label: 'Acessórios Corrida' },
  { value: 'acessorios-natacao', label: 'Acessórios de Natação' },
  { value: 'suplementos',        label: 'Suplementos' },
  { value: 'pecas',              label: 'Peças' },
  { value: 'seminovas',          label: 'Oportunidades em Semi Novas' },
];

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            active === cat.value
              ? 'bg-[#f4f4f4] text-[#151515] border-[#f4f4f4]'
              : 'bg-transparent text-[#888888] border-[#2a2a2a] hover:text-[#f4f4f4] hover:border-[#888888]'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
