'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';
import type { ActionResult, CartItem, CheckoutCustomer, Order, Shipping } from '@/lib/types';

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Order[];
  } catch {
    return [];
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

export type UpdateOrderInput = {
  status?: Order['status'];
  tracking_code?: string | null;
  notes?: string | null;
};

export async function updateOrder(
  id: string,
  data: UpdateOrderInput
): Promise<ActionResult<Order>> {
  try {
    await requireUser();

    const { data: row, error } = await supabaseAdmin
      .from('orders')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/pedidos');
    return { success: true, data: row as Order };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido.' };
  }
}
