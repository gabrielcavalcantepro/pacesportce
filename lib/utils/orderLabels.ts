import type { Order } from '@/lib/types';

export const ORDER_STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  preparing: 'Em Preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_CLASS: Record<Order['status'], string> = {
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  confirmed: 'bg-[#3b82f6]/15 text-[#3b82f6]',
  preparing: 'bg-[#a855f7]/15 text-[#a855f7]',
  shipped: 'bg-[#f97316]/15 text-[#f97316]',
  delivered: 'bg-[#22c55e]/15 text-[#22c55e]',
  cancelled: 'bg-[#ef4444]/15 text-[#ef4444]',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Cartão',
  debit_card: 'Cartão',
  debitCard: 'Cartão',
  pix: 'PIX',
  bank_transfer: 'PIX',
  boleto: 'Boleto',
  ticket: 'Boleto',
};

// Cobre tanto o vocabulário da antiga Payments API (approved/pending/...) quanto
// o vocabulário de nível "payment" retornado pela Orders API atual
// (processed/action_required/failed), já que o payment_status gravado no pedido
// pode vir de qualquer um dos dois caminhos (webhook ou create-payment).
export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  approved: 'Pago',
  processed: 'Pago',
  accredited: 'Pago',
  pending: 'Pendente',
  in_process: 'Pendente',
  action_required: 'Pendente',
  rejected: 'Recusado',
  cancelled: 'Recusado',
  refunded: 'Recusado',
  failed: 'Recusado',
};

export const PAYMENT_STATUS_CLASS: Record<string, string> = {
  approved: 'bg-[#22c55e]/15 text-[#22c55e]',
  processed: 'bg-[#22c55e]/15 text-[#22c55e]',
  accredited: 'bg-[#22c55e]/15 text-[#22c55e]',
  pending: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  in_process: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  action_required: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  rejected: 'bg-[#ef4444]/15 text-[#ef4444]',
  cancelled: 'bg-[#ef4444]/15 text-[#ef4444]',
  refunded: 'bg-[#ef4444]/15 text-[#ef4444]',
  failed: 'bg-[#ef4444]/15 text-[#ef4444]',
};
