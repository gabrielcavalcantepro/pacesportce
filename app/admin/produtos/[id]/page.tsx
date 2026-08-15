'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import { getCategories } from '@/lib/queries/categories';
import { getProductById, updateProduct, type ProductInput } from '@/lib/queries/products';
import type { Category, Product } from '@/lib/types';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    Promise.all([getCategories(), getProductById(id)])
      .then(([cats, prod]) => {
        setCategories(cats);
        setProduct(prod);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: ProductInput) {
    setSubmitting(true);
    setMessage(null);
    const result = await updateProduct(id, data);
    setSubmitting(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Produto atualizado com sucesso.' });
      if (result.data) setProduct(result.data);
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Erro ao atualizar produto.' });
    }
  }

  if (loading) {
    return <p className="text-[#888888] text-sm">Carregando...</p>;
  }

  if (!product) {
    return <p className="text-[#ef4444] text-sm">Produto não encontrado.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#f4f4f4]">Editar Produto</h1>
        <a
          href={`/produto/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-[#2a2a2a] text-[#f4f4f4] hover:bg-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          <ExternalLink size={16} />
          Visualizar na loja
        </a>
      </div>

      {message && (
        <div
          className={`text-sm rounded-lg px-4 py-3 mb-6 border ${
            message.type === 'success'
              ? 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]'
              : 'bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444]'
          }`}
        >
          {message.text}
        </div>
      )}

      <ProductForm
        defaultValues={product}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  );
}
