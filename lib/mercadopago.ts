import type { Order } from '@/lib/types';

// Vocabulário da Orders API (status no nível do order).
export const MP_ORDER_STATUS_MAP: Record<string, { status: Order['status']; payment_status: string }> = {
  processed: { status: 'confirmed', payment_status: 'approved' },
  action_required: { status: 'pending', payment_status: 'pending' },
  cancelled: { status: 'cancelled', payment_status: 'cancelled' },
  failed: { status: 'pending', payment_status: 'rejected' },
};
