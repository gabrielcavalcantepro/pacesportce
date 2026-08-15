'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/lib/queries/orders';
import { formatPrice } from '@/lib/utils/price';
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
} from '@/lib/utils/orderLabels';
import type { Order } from '@/lib/types';
import OrderRowActions from './OrderRowActions';

export default function OrderRow({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status);

  async function handleStatusChange(newStatus: Order['status']) {
    const previous = status;
    setStatus(newStatus);

    const result = await updateOrderStatus(order.id, newStatus);
    if (!result.success) {
      setStatus(previous);
      alert(result.error ?? 'Erro ao atualizar status.');
    }
  }

  return (
    <tr className="border-b border-[#2a2a2a] last:border-0">
      <td className="p-4 text-[#f4f4f4]">{order.order_number}</td>
      <td className="p-4 text-[#f4f4f4]">{order.customer_name}</td>
      <td className="p-4 text-[#888888]">{order.items.length}</td>
      <td className="p-4 text-[#f4f4f4]">{formatPrice(order.total)}</td>
      <td className="p-4">
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xs text-[#f4f4f4]">
            {order.payment_method
              ? PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method
              : '—'}
          </span>
          {order.payment_status && (
            <span
              className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                PAYMENT_STATUS_CLASS[order.payment_status] ?? 'bg-[#2a2a2a] text-[#888888]'
              }`}
            >
              {PAYMENT_STATUS_LABEL[order.payment_status] ?? order.payment_status}
            </span>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${ORDER_STATUS_CLASS[status]}`}>
          {ORDER_STATUS_LABEL[status]}
        </span>
      </td>
      <td className="p-4 text-[#888888]">
        {new Date(order.created_at).toLocaleDateString('pt-BR')}
      </td>
      <td className="p-4">
        <OrderRowActions order={{ ...order, status }} onStatusChange={handleStatusChange} />
      </td>
    </tr>
  );
}
