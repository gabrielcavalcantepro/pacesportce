import { getOrders } from '@/lib/queries/orders';
import type { Order } from '@/lib/types';
import OrderRow from './OrderRow';
import PedidosFilters from './PedidosFilters';

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

      <PedidosFilters
        status={status || ''}
        pagamento={pagamento || ''}
        dataInicial={dataInicial || ''}
        dataFinal={dataFinal || ''}
        busca={busca || ''}
        hasFilters={hasFilters}
      />

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
