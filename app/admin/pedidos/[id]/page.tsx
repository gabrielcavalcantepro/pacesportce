'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getOrderById, updateOrder } from '@/lib/queries/orders';
import { formatPrice } from '@/lib/utils/price';
import type { Order } from '@/lib/types';

const STATUS_OPTIONS: { value: Order['status']; label: string }[] = [
  { value: 'pending', label: 'Aguardando confirmação' },
  { value: 'confirmed', label: 'Pedido confirmado' },
  { value: 'preparing', label: 'Em preparação' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  debitCard: 'Cartão de Débito',
  pix: 'PIX',
  bank_transfer: 'PIX',
  boleto: 'Boleto',
  ticket: 'Boleto',
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  approved: { label: 'Aprovado', className: 'bg-[#22c55e]/15 text-[#22c55e]' },
  pending: { label: 'Pendente', className: 'bg-[#f59e0b]/15 text-[#f59e0b]' },
  in_process: { label: 'Em análise', className: 'bg-[#f59e0b]/15 text-[#f59e0b]' },
  rejected: { label: 'Rejeitado', className: 'bg-[#ef4444]/15 text-[#ef4444]' },
  cancelled: { label: 'Cancelado', className: 'bg-[#ef4444]/15 text-[#ef4444]' },
  refunded: { label: 'Reembolsado', className: 'bg-[#ef4444]/15 text-[#ef4444]' },
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Order['status']>('pending');
  const [trackingCode, setTrackingCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    getOrderById(id).then((data) => {
      setOrder(data);
      if (data) {
        setStatus(data.status);
        setTrackingCode(data.tracking_code ?? '');
        setNotes(data.notes ?? '');
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const result = await updateOrder(id, {
      status,
      tracking_code: trackingCode.trim() || null,
      notes: notes.trim() || null,
    });

    setSaving(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Alterações salvas com sucesso.' });
      if (result.data) setOrder(result.data);
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Erro ao salvar alterações.' });
    }
  }

  if (loading) {
    return <p className="text-[#888888] text-sm">Carregando...</p>;
  }

  if (!order) {
    return <p className="text-[#ef4444] text-sm">Pedido não encontrado.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Pedido {order.order_number}</h1>

      {message && (
        <div
          className={`text-sm rounded-lg px-4 py-3 mb-6 border ${
            message.type === 'success'
              ? 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]'
              : 'bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444]'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-1.5">
            <h2 className="text-base font-semibold text-[#f4f4f4] mb-2">Cliente</h2>
            <p className="text-sm text-[#f4f4f4]">{order.customer_name}</p>
            {order.customer_email && (
              <p className="text-sm text-[#888888]">{order.customer_email}</p>
            )}
            {order.customer_phone && (
              <p className="text-sm text-[#888888]">{order.customer_phone}</p>
            )}
          </section>

          <section className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6">
            <h2 className="text-base font-semibold text-[#f4f4f4] mb-4">Itens</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#151515] border border-[#2a2a2a] shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f4f4f4]">{item.name}</p>
                    {item.selectedVariant && Object.keys(item.selectedVariant).length > 0 && (
                      <p className="text-xs text-[#888888]">
                        {Object.entries(item.selectedVariant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-[#888888]">Qtd: {item.quantity}</p>
                  </div>
                  <p className="text-sm text-[#f4f4f4] shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 mt-4 border-t border-[#2a2a2a]">
              <span className="text-sm font-semibold text-[#f4f4f4]">Total</span>
              <span className="text-sm font-semibold text-[#f4f4f4]">
                {formatPrice(order.total)}
              </span>
            </div>
          </section>

          <section className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-[#f4f4f4] mb-2">
              Informações de Pagamento
            </h2>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[#888888]">Método</span>
              <span className="text-sm text-[#f4f4f4]">
                {order.payment_method
                  ? PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method
                  : 'Não informado'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[#888888]">Status do pagamento</span>
              {order.payment_status ? (
                <span
                  className={`text-xs font-medium rounded-full px-3 py-1 ${
                    PAYMENT_STATUS_CONFIG[order.payment_status]?.className ??
                    'bg-[#2a2a2a] text-[#888888]'
                  }`}
                >
                  {PAYMENT_STATUS_CONFIG[order.payment_status]?.label ?? order.payment_status}
                </span>
              ) : (
                <span className="text-sm text-[#888888]">Não informado</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[#888888]">ID da transação MP</span>
              <span className="text-sm text-[#f4f4f4]">{order.payment_id ?? 'Não informado'}</span>
            </div>
          </section>
        </div>

        <section className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-4 h-fit">
          <h2 className="text-base font-semibold text-[#f4f4f4]">Status do pedido</h2>

          <div>
            <label className="block text-sm text-[#888888] mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order['status'])}
              className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#888888] mb-1.5">Código de rastreio</label>
            <input
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Ex: BR1234567890"
              className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[#888888] mb-1.5">Observações internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#f4f4f4] text-[#151515] font-medium rounded-lg py-2.5 text-sm disabled:opacity-60 transition-opacity"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </section>
      </div>
    </div>
  );
}
