'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import type { CartItem as CartItemType } from '@/lib/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-[#2a2a2a]">
      {/* Image */}
      <Link href={`/produto/${item.slug}`} className="shrink-0">
        <div className="relative w-20 h-20 bg-[#1e1e1e] rounded-lg overflow-hidden border border-[#2a2a2a]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/produto/${item.slug}`}>
          <h3 className="text-sm font-semibold text-[#f4f4f4] hover:text-white transition-colors line-clamp-2">
            {item.name}
          </h3>
        </Link>

        {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
          <p className="text-xs text-[#888888] mt-1">
            {Object.entries(item.selectedVariant)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')}
          </p>
        )}

        <p className="text-sm font-semibold text-[#f4f4f4] mt-1">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>

      {/* Quantity + Remove */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        <button
          onClick={() => removeItem(item.productId)}
          className="text-[#888888] hover:text-[#f4f4f4] transition-colors"
          aria-label="Remover item"
        >
          <Trash2 size={16} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center border border-[#2a2a2a] rounded text-[#f4f4f4] hover:border-[#888888] transition-colors"
          >
            <Minus size={12} />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-[#f4f4f4]">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center border border-[#2a2a2a] rounded text-[#f4f4f4] hover:border-[#888888] transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
