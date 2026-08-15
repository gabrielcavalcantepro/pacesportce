'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getCategories } from '@/lib/queries/categories';
import { createProduct, type ProductInput } from '@/lib/queries/products';
import type { Category } from '@/lib/types';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setLoadingCategories(false));
  }, []);

  async function handleSubmit(data: ProductInput) {
    setSubmitting(true);
    setError(null);
    const result = await createProduct(data);
    setSubmitting(false);

    if (result.success) {
      router.push('/admin/produtos');
    } else {
      setError(result.error ?? 'Erro ao criar produto.');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Novo Produto</h1>

      {error && (
        <div className="bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444] text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {loadingCategories ? (
        <p className="text-[#888888] text-sm">Carregando...</p>
      ) : (
        <ProductForm categories={categories} onSubmit={handleSubmit} isLoading={submitting} />
      )}
    </div>
  );
}
