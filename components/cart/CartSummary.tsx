'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';

export default function CartSummary() {
  const { total, clearCart } = useCart();
  const router = useRouter();

  function handleFinalize() {
    router.push('/confirmacao');
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-6 space-y-4">
      <h2 className="font-semibold text-[#f4f4f4] text-lg">Resumo do Pedido</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#888888]">Subtotal</span>
          <span className="text-[#f4f4f4]">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#888888]">Frete</span>
          <span className="text-[#888888]">A calcular</span>
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
        Finalizar Pedido
      </button>

      <p className="text-xs text-center text-[#888888]">
        Pagamento e frete calculados na próxima etapa
      </p>
    </div>
  );
}
