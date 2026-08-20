'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';
import { sendEmailPedidoCancelado } from '@/lib/email';
import type { ActionResult, CartItem, CheckoutCustomer, Order, Shipping } from '@/lib/types';

export type OrderFilters = {
  status?: Order['status'];
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  try {
    let query = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.paymentMethod) {
      query = query.eq('payment_method', filters.paymentMethod);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', `${filters.dateFrom}T00:00:00`);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
    }
    if (filters?.search) {
      const term = filters.search.replace(/[,()]/g, '');
      query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Order[];
  } catch {
    return [];
  }
}

export async function getPendingOrdersCount(): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw new Error(error.message);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as Order | null;
  } catch {
    return null;
  }
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PCS-${y}${m}${d}-${random}`;
}

export type CreateOrderInput = {
  customer: CheckoutCustomer;
  items: CartItem[];
  shipping: Shipping | null;
  total: number;
  paymentId?: string;
  paymentMethod?: string;
};

export async function createOrder(
  data: CreateOrderInput
): Promise<ActionResult<{ orderNumber: string }>> {
  try {
    const orderNumber = generateOrderNumber();

    const { error } = await supabaseAdmin.from('orders').insert({
      order_number: orderNumber,
      customer_name: data.customer.name,
      customer_email: data.customer.email,
      customer_phone: data.customer.phone,
      items: data.items,
      total: data.total,
      status: 'pending',
      payment_id: data.paymentId,
      payment_method: data.paymentMethod,
      shipping_address: {
        cep: data.customer.cep,
        street: data.customer.street,
        number: data.customer.number,
        complement: data.customer.complement,
        neighborhood: data.customer.neighborhood,
        city: data.customer.city,
        state: data.customer.state,
      },
      shipping_cost: data.shipping?.price ?? 0,
    });

    if (error) return { success: false, error: error.message };

    return { success: true, data: { orderNumber } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

async function notifyOrderCancelled(order: Order): Promise<void> {
  if (!order.customer_email) return;

  const { data: whatsappSetting } = await supabaseAdmin
    .from('store_settings')
    .select('value')
    .eq('key', 'whatsapp')
    .maybeSingle();

  await sendEmailPedidoCancelado({
    to: order.customer_email,
    customerName: order.customer_name,
    orderNumber: order.order_number,
    whatsapp: whatsappSetting?.value ?? '5585999999999',
  });
}

export type UpdateOrderInput = {
  status?: Order['status'];
  tracking_code?: string | null;
  notes?: string | null;
  shipping_carrier?: string | null;
  shipping_service?: string | null;
};

export async function updateOrder(
  id: string,
  data: UpdateOrderInput
): Promise<ActionResult<Order>> {
  try {
    await requireUser();

    // updateOrder() sempre envia 'status' (mesmo quando não mudou, ao salvar outros
    // campos do pedido), então buscamos o status anterior para só notificar o
    // cliente na transição real para 'cancelled', não em toda edição do pedido.
    let previousStatus: Order['status'] | null = null;
    if (data.status === 'cancelled') {
      const { data: existing } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', id)
        .maybeSingle();
      previousStatus = existing?.status ?? null;
    }

    const { data: row, error } = await supabaseAdmin
      .from('orders')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    if (data.status === 'cancelled' && previousStatus !== 'cancelled') {
      await notifyOrderCancelled(row as Order);
    }

    revalidatePath('/admin/pedidos');
    return { success: true, data: row as Order };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<ActionResult<Order>> {
  try {
    await requireUser();

    let previousStatus: Order['status'] | null = null;
    if (status === 'cancelled') {
      const { data: existing } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', id)
        .maybeSingle();
      previousStatus = existing?.status ?? null;
    }

    const { data: row, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await notifyOrderCancelled(row as Order);
    }

    revalidatePath('/admin/pedidos');
    return { success: true, data: row as Order };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}
