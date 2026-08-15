'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils/price';
import { prazoTexto } from '@/lib/utils/frete';

export default function CartSummary() {
  const { items, total, shipping } = useCart();
  const router = useRouter();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allFreeShipping = items.length > 0 && items.every((i) => i.free_shipping);
  const freteGratis = allFreeShipping || shipping?.company === 'Grátis';

  function handleFinalize() {
    router.push('/checkout');
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-6 space-y-4">
      <h2 className="font-semibold text-[#f4f4f4] text-lg">Resumo do Pedido</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#888888]">Subtotal</span>
          <span className="text-[#f4f4f4]">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={freteGratis ? 'text-[#22c55e] font-medium' : 'text-[#888888]'}>
            {freteGratis
              ? 'Frete'
              : shipping
              ? `Frete — ${shipping.company} (${prazoTexto(shipping.service, shipping.delivery_time)})`
              : 'Frete'}
          </span>
          <span
            className={
              freteGratis
                ? 'text-[#22c55e] font-medium shrink-0'
                : shipping
                ? 'text-[#f4f4f4] shrink-0'
                : 'text-[#888888] shrink-0'
            }
          >
            {freteGratis ? 'Grátis' : shipping ? formatPrice(shipping.price) : 'A calcular'}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#2a2a2a] flex justify-between font-bold">
        <span className="text-[#f4f4f4]">Total</span>
        <span className="text-[#f4f4f4] text-lg">{formatPrice(total)}</span>
      </div>

      <button
        onClick={handleFinalize}
        className="w-full bg-[#f4f4f4] text-[#151515] font-semibold py-3 rounded-lg hover:bg-white transition-colors"
      >
        Finalizar Compra
      </button>
    </div>
  );
}
