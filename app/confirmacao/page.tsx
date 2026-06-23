'use client';

import Link from 'next/link';
import { CheckCircle, MessageCircle, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import { useEffect, useState } from 'react';
import type { CartItem } from '@/lib/types';

export default function ConfirmationPage() {
  const { items, total, clearCart } = useCart();
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [savedTotal, setSavedTotal] = useState(0);

  // Save cart snapshot then clear
  useEffect(() => {
    if (items.length > 0) {
      setSavedItems(items);
      setSavedTotal(total);
      clearCart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const whatsappMessage = encodeURIComponent(
    `Olá! Acabei de fazer um pedido na PaceSportce. Gostaria de confirmar o recebimento. Total: ${formatPrice(savedTotal)}`
  );

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Success icon */}
        <div className="flex items-center justify-center w-20 h-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full mx-auto mb-6">
          <CheckCircle size={40} className="text-[#f4f4f4]" />
        </div>

        <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
          Pedido Recebido!
        </h1>
        <p className="text-[#888888] mb-10 leading-relaxed">
          Obrigado pela sua compra. Entraremos em contato em breve para confirmar os detalhes e
          combinar a entrega ou retirada.
        </p>

        {/* Order summary */}
        {savedItems.length > 0 && (
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-[#f4f4f4] mb-4">Resumo do Pedido</h2>
            <div className="space-y-3">
              {savedItems.map((item) => (
                <div
                  key={`${item.productId}-${JSON.stringify(item.selectedVariant)}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-[#888888]">
                    {item.name}
                    {item.selectedVariant &&
                      ` (${Object.values(item.selectedVariant).join(', ')})`}{' '}
                    × {item.quantity}
                  </span>
                  <span className="text-[#f4f4f4] font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex justify-between font-bold">
              <span className="text-[#f4f4f4]">Total</span>
              <span className="text-[#f4f4f4]">{formatPrice(savedTotal)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://wa.me/5500000000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#20ba59] transition-colors"
          >
            <MessageCircle size={18} />
            Confirmar via WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-[#2a2a2a] text-[#f4f4f4] font-semibold px-8 py-3 rounded-lg hover:border-[#888888] transition-colors"
          >
            <ShoppingBag size={18} />
            Voltar à Loja
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
