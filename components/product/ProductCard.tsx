import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.compareAtPrice
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg overflow-hidden hover:border-[#888888] transition-colors">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#2a2a2a]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-[#f4f4f4] text-[#151515] text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.condition === 'used' && (
            <span className="absolute top-3 right-3 bg-[#2a2a2a] text-[#888888] text-xs font-medium px-2 py-0.5 rounded-full border border-[#2a2a2a]">
              Semi-nova
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-[#888888] uppercase tracking-wide mb-1 capitalize">
            {product.category.replace('-', ' ')}
          </p>
          <h3 className="text-sm font-semibold text-[#f4f4f4] mb-2 line-clamp-2 group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#f4f4f4]">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-[#888888] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
