'use client';

import { useState } from 'react';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useVariantPrice } from './VariantPriceContext';
import FreteCalculator from '@/components/cart/FreteCalculator';
import type { Product, ProductVariants } from '@/lib/types';

interface AddToCartProps {
  product: Product;
  whatsapp_only: boolean;
  whatsapp_number: string;
  product_name: string;
  variants: ProductVariants;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
      <path
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
    -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475
    -.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
    .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
    -.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
    -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2
    5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085
    1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m
    -5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648
    -.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0
    5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885
    9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0
    2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005
    c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

export default function AddToCart({
  product,
  whatsapp_only,
  whatsapp_number,
  product_name,
  variants,
}: AddToCartProps) {
  const { addItem } = useCart();
  const { selectedOptions, selectOption, effectivePrice } = useVariantPrice();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const allSelected = variants.dimensions.every((d) => selectedOptions[d.name]);
    if (!allSelected) {
      alert('Por favor, selecione todas as opções antes de adicionar ao carrinho.');
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: effectivePrice,
      image: product.images[0],
      quantity,
      selectedVariant: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
      weight: product.weight,
      length: product.length,
      width: product.width,
      height: product.height,
      free_shipping: product.free_shipping,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleWhatsapp() {
    const allSelected = variants.dimensions.every((d) => selectedOptions[d.name]);
    if (!allSelected) {
      alert('Selecione todas as opções antes de continuar');
      return;
    }

    const variantText =
      variants.dimensions.length > 0
        ? '\n' +
          variants.dimensions
            .map((d) => `${d.name}: ${selectedOptions[d.name] || 'não selecionado'}`)
            .join('\n')
        : '';

    const mensagem =
      `Olá! Gostaria de comprar:\n\n` +
      `Produto: ${product_name}` +
      variantText +
      `\n\nPoderia me ajudar a finalizar o pedido?`;

    window.open(`https://wa.me/${whatsapp_number}?text=${encodeURIComponent(mensagem)}`, '_blank');
  }

  return (
    <div className="space-y-6">
      {/* Variant dimension selectors */}
      {variants.dimensions.map((dimension) => (
        <div key={dimension.name}>
          <p className="text-sm font-medium text-[#f4f4f4] mb-2">
            {dimension.name}
            {selectedOptions[dimension.name] && (
              <span className="ml-2 text-[#888888] font-normal">
                {selectedOptions[dimension.name]}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {dimension.options.map((option) => (
              <button
                key={option}
                onClick={() => selectOption(dimension.name, option)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  selectedOptions[dimension.name] === option
                    ? 'bg-[#f4f4f4] text-[#151515] border-[#f4f4f4]'
                    : 'bg-transparent text-[#888888] border-[#2a2a2a] hover:border-[#888888] hover:text-[#f4f4f4]'
                }`}
              >
                {option}
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

      {/* Shipping simulator */}
      {!product.free_shipping && (
        <div className="border-t border-[#2a2a2a] pt-4 mt-4">
          <p className="text-sm font-medium text-[#f4f4f4] mb-3">Simular Frete</p>
          {product.weight && product.width && product.height && product.length ? (
            <FreteCalculator
              produtos={[
                {
                  weight: product.weight,
                  width: product.width,
                  height: product.height,
                  length: product.length,
                  quantity: 1,
                  insurance_value: product.price / 100,
                },
              ]}
              selectable={false}
            />
          ) : (
            <p className="text-[#888888] text-sm">
              Dimensões não cadastradas. Consulte o frete pelo carrinho.
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      {whatsapp_only ? (
        <button
          onClick={handleWhatsapp}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-500 text-white transition-colors"
        >
          <WhatsAppIcon />
          Finalizar pelo WhatsApp
        </button>
      ) : (
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
      )}
    </div>
  );
}
