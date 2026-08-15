'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomSelect from '@/components/admin/CustomSelect';
import DateInput from '@/components/admin/DateInput';

type Props = {
  status: string;
  pagamento: string;
  dataInicial: string;
  dataFinal: string;
  busca: string;
  hasFilters: boolean;
};

const STATUS_OPTIONS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Aguardando', value: 'pending' },
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'Em Preparação', value: 'preparing' },
  { label: 'Enviado', value: 'shipped' },
  { label: 'Entregue', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' },
];

const PAGAMENTO_OPTIONS = [
  { label: 'Todos', value: 'todos' },
  { label: 'PIX', value: 'pix' },
  { label: 'Cartão', value: 'credit_card' },
  { label: 'Boleto', value: 'boleto' },
];

export default function PedidosFilters({
  status,
  pagamento,
  dataInicial,
  dataFinal,
  busca,
  hasFilters,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    status: status || 'todos',
    pagamento: pagamento || 'todos',
    dataInicial,
    dataFinal,
    busca,
  });

  function handleFilter() {
    const params = new URLSearchParams();
    if (form.status && form.status !== 'todos') params.set('status', form.status);
    if (form.pagamento && form.pagamento !== 'todos') params.set('pagamento', form.pagamento);
    if (form.dataInicial) params.set('dataInicial', form.dataInicial);
    if (form.dataFinal) params.set('dataFinal', form.dataFinal);
    if (form.busca) params.set('busca', form.busca);
    router.push(`/admin/pedidos${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 mb-6">
      <div>
        <label className="block text-xs text-[#888888] mb-1">Status</label>
        <CustomSelect
          value={form.status}
          onChange={(value) => setForm((f) => ({ ...f, status: value }))}
          options={STATUS_OPTIONS}
          className="w-44"
        />
      </div>

      <div>
        <label className="block text-xs text-[#888888] mb-1">Método de Pagamento</label>
        <CustomSelect
          value={form.pagamento}
          onChange={(value) => setForm((f) => ({ ...f, pagamento: value }))}
          options={PAGAMENTO_OPTIONS}
          className="w-40"
        />
      </div>

      <div>
        <label className="block text-xs text-[#888888] mb-1">Data inicial</label>
        <DateInput
          value={form.dataInicial}
          onChange={(value) => setForm((f) => ({ ...f, dataInicial: value }))}
          className="bg-[#151515] border border-[#2a2a2a] rounded-lg pl-3 pr-9 py-2 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors w-36"
        />
      </div>

      <div>
        <label className="block text-xs text-[#888888] mb-1">Data final</label>
        <DateInput
          value={form.dataFinal}
          onChange={(value) => setForm((f) => ({ ...f, dataFinal: value }))}
          className="bg-[#151515] border border-[#2a2a2a] rounded-lg pl-3 pr-9 py-2 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors w-36"
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-[#888888] mb-1">Buscar por número ou cliente</label>
        <input
          type="text"
          value={form.busca}
          onChange={(e) => setForm((f) => ({ ...f, busca: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleFilter}
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
    </div>
  );
}
