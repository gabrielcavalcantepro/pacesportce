'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from '@/components/admin/CustomSelect';
import type { Category } from '@/lib/types';

type Props = {
  status: string;
  categoria: string;
  busca: string;
  categories: Category[];
};

const STATUS_OPTIONS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Rascunho', value: 'draft' },
];

export default function ProdutosFilters({ status, categoria, busca, categories }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ status: status || 'todos', categoria, busca });

  const categoriaOptions = [
    { label: 'Todas', value: '' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ];

  function handleFilter() {
    const params = new URLSearchParams();
    if (form.status && form.status !== 'todos') params.set('status', form.status);
    if (form.categoria) params.set('categoria', form.categoria);
    if (form.busca) params.set('busca', form.busca);
    router.push(`/admin/produtos${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 mb-6">
      <div>
        <label className="block text-xs text-[#888888] mb-1">Status</label>
        <CustomSelect
          value={form.status}
          onChange={(value) => setForm((f) => ({ ...f, status: value }))}
          options={STATUS_OPTIONS}
          className="w-40"
        />
      </div>

      <div>
        <label className="block text-xs text-[#888888] mb-1">Categoria</label>
        <CustomSelect
          value={form.categoria}
          onChange={(value) => setForm((f) => ({ ...f, categoria: value }))}
          options={categoriaOptions}
          className="w-48"
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-[#888888] mb-1">Buscar por nome ou SKU</label>
        <input
          type="text"
          value={form.busca}
          onChange={(e) => setForm((f) => ({ ...f, busca: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleFilter}
        className="bg-[#2a2a2a] text-[#f4f4f4] rounded-lg px-4 py-2 text-sm hover:bg-[#3a3a3a] transition-colors"
      >
        Filtrar
      </button>
    </div>
  );
}
