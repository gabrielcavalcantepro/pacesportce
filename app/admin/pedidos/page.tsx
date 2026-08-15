import Link from 'next/link';
import { getOrders } from '@/lib/queries/orders';
import type { Order } from '@/lib/types';
import OrderRow from './OrderRow';

type SearchParams = {
  status?: string;
  pagamento?: string;
  dataInicial?: string;
  dataFinal?: string;
  busca?: string;
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status, pagamento, dataInicial, dataFinal, busca } = await searchParams;

  const orders = await getOrders({
    status: status && status !== 'todos' ? (status as Order['status']) : undefined,
    paymentMethod: pagamento && pagamento !== 'todos' ? pagamento : undefined,
    dateFrom: dataInicial || undefined,
    dateTo: dataFinal || undefined,
    search: busca || undefined,
  });

  const hasFilters = Boolean(status || pagamento || dataInicial || dataFinal || busca);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Pedidos</h1>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 mb-6"
      >
        <div>
          <label className="block text-xs text-[#888888] mb-1">Status</label>
          <select
            name="status"
            defaultValue={status || 'todos'}
            className="bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          >
            <option value="todos">Todos</option>
            <option value="pending">Aguardando</option>
            <option value="confirmed">Confirmado</option>
            <option value="preparing">Em Preparação</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#888888] mb-1">Método de Pagamento</label>
          <select
            name="pagamento"
            defaultValue={pagamento || 'todos'}
            className="bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          >
            <option value="todos">Todos</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#888888] mb-1">Data inicial</label>
          <input
            type="date"
            name="dataInicial"
            defaultValue={dataInicial || ''}
            className="bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#888888] mb-1">Data final</label>
          <input
            type="date"
            name="dataFinal"
            defaultValue={dataFinal || ''}
            className="bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-[#888888] mb-1">Buscar por número ou cliente</label>
          <input
            type="text"
            name="busca"
            defaultValue={busca || ''}
            className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-[#2a2a2a] text-[#f4f4f4] rounded-lg px-4 py-2 text-sm hover:bg-[#3a3a3a] transition-colors"
        >
          Filtrar
        </button>

        {hasFilters && (
          <Link
            href="/admin/pedidos"
            className="text-sm text-[#888888] hover:text-[#f4f4f4] transition-colors px-2 py-2"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-left text-[#888888]">
              <th className="p-4 font-normal">Número</th>
              <th className="p-4 font-normal">Cliente</th>
              <th className="p-4 font-normal">Itens</th>
              <th className="p-4 font-normal">Total</th>
              <th className="p-4 font-normal">Pagamento</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Data</th>
              <th className="p-4 font-normal">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#888888]">
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
