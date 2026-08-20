'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import FreteCalculator from '@/components/cart/FreteCalculator';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items } = useCart();

  const allFreeShipping = items.length > 0 && items.every((item) => item.free_shipping);

  // Itens com frete grátis (configurado por produto no admin) não entram no cálculo
  // de frete — mesmo num carrinho misto, só cobra o frete da parte não-grátis.
  const produtosFrete = items
    .filter(
      (item) =>
        !item.free_shipping &&
        item.weight != null && item.width != null && item.height != null && item.length != null
    )
    .map((item) => ({
      weight: item.weight!,
      width: item.width!,
      height: item.height!,
      length: item.length!,
      quantity: item.quantity,
      insurance_value: item.price / 100,
    }));

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-8">
          Carrinho
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag size={48} className="text-[#2a2a2a] mb-4" />
            <h2 className="text-xl font-semibold text-[#f4f4f4] mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-[#888888] mb-8">
              Adicione produtos para continuar.
            </p>
            <Link
              href="/#produtos"
              className="bg-[#f4f4f4] text-[#151515] font-semibold px-8 py-3 rounded-lg hover:bg-white transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2">
              <div>
                {items.map((item) => (
                  <CartItem key={`${item.productId}-${JSON.stringify(item.selectedVariant)}`} item={item} />
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-[#2a2a2a]">
                <h2 className="font-semibold text-[#f4f4f4] text-lg mb-4">Calcular Frete</h2>
                {allFreeShipping ? (
                  <p className="text-sm text-[#22c55e] font-medium">
                    Você tem frete grátis!
                  </p>
                ) : produtosFrete.length > 0 ? (
                  <FreteCalculator produtos={produtosFrete} selectable />
                ) : (
                  <p className="text-sm text-[#888888]">
                    Não foi possível calcular o frete: um ou mais produtos não têm dimensões
                    cadastradas. Entre em contato para calcular manualmente.
                  </p>
                )}
              </div>

              <Link
                href="/#produtos"
                className="inline-block mt-6 text-sm text-[#888888] hover:text-[#f4f4f4] transition-colors underline underline-offset-2"
              >
                ← Continuar Comprando
              </Link>
            </div>

            {/* Summary */}
            <div>
              <CartSummary />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
