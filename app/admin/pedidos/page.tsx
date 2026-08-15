import Link from 'next/link';
import { getOrders } from '@/lib/queries/orders';
import { formatPrice } from '@/lib/utils/price';
import type { Order } from '@/lib/types';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Aguardando confirmação',
  confirmed: 'Pedido confirmado',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_CLASS: Record<Order['status'], string> = {
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  confirmed: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  preparing: 'bg-[#a855f7]/15 text-[#a855f7]',
  shipped: 'bg-[#f97316]/15 text-[#f97316]',
  delivered: 'bg-[#22c55e]/15 text-[#22c55e]',
  cancelled: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export default async function AdminPedidosPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Pedidos</h1>

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-left text-[#888888]">
              <th className="p-4 font-normal">Número</th>
              <th className="p-4 font-normal">Cliente</th>
              <th className="p-4 font-normal">Total</th>
              <th className="p-4 font-normal">Itens</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Data</th>
              <th className="p-4 font-normal">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[#2a2a2a] last:border-0">
                <td className="p-4 text-[#f4f4f4]">{order.order_number}</td>
                <td className="p-4 text-[#f4f4f4]">{order.customer_name}</td>
                <td className="p-4 text-[#f4f4f4]">{formatPrice(order.total)}</td>
                <td className="p-4 text-[#888888]">{order.items.length}</td>
                <td className="p-4">
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_CLASS[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </td>
                <td className="p-4 text-[#888888]">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-[#888888] hover:text-[#f4f4f4] transition-colors text-xs"
                  >
                    Ver detalhes
                  </Link>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#888888]">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
