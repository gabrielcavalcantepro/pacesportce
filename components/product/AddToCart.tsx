'use client';

import { useState } from 'react';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/types';

interface AddToCartProps {
  product: Product;
}

export default function AddToCart({ product }: AddToCartProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  function selectVariant(variantName: string, option: string) {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  }

  function handleAdd() {
    const allSelected = !product.variants || product.variants.every((v) => selectedVariants[v.name]);
    if (!allSelected) {
      // Highlight missing variants (simple approach: alert)
      alert('Por favor, selecione todas as opções antes de adicionar ao carrinho.');
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      selectedVariant: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Variants */}
      {product.variants?.map((variant) => (
        <div key={variant.id}>
          <p className="text-sm font-medium text-[#f4f4f4] mb-2">
            {variant.name}
            {selectedVariants[variant.name] && (
              <span className="ml-2 text-[#888888] font-normal">
                {selectedVariants[variant.name]}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((opt) => (
              <button
                key={opt}
                onClick={() => selectVariant(variant.name, opt)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  selectedVariants[variant.name] === opt
                    ? 'bg-[#f4f4f4] text-[#151515] border-[#f4f4f4]'
                    : 'bg-transparent text-[#888888] border-[#2a2a2a] hover:border-[#888888] hover:text-[#f4f4f4]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quantity */}
      <div>
        <p className="text-sm font-medium text-[#f4f4f4] mb-2">Quantidade</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center border border-[#2a2a2a] rounded-lg text-[#f4f4f4] hover:border-[#888888] transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-semibold text-[#f4f4f4]">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="w-9 h-9 flex items-center justify-center border border-[#2a2a2a] rounded-lg text-[#f4f4f4] hover:border-[#888888] transition-colors"
          >
            <Plus size={14} />
          </button>
          <span className="text-xs text-[#888888]">{product.stock} em estoque</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
          product.stock === 0
            ? 'bg-[#2a2a2a] text-[#888888] cursor-not-allowed'
            : added
            ? 'bg-[#888888] text-[#f4f4f4]'
            : 'bg-[#f4f4f4] text-[#151515] hover:bg-white'
        }`}
      >
        {added ? (
          <>
            <Check size={18} />
            Adicionado!
          </>
        ) : product.stock === 0 ? (
          'Sem estoque'
        ) : (
          <>
            <ShoppingCart size={18} />
            Adicionar ao Carrinho
          </>
        )}
      </button>
    </div>
  );
}
