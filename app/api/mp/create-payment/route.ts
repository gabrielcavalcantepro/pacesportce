import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmailPedidoConfirmado } from '@/lib/email';
import { decrementStock } from '@/lib/queries/products';
import type { CartItem, CheckoutCustomer } from '@/lib/types';

type CreatePaymentBody = {
  orderNumber: string;
  customer: CheckoutCustomer;
  items: CartItem[];
  total: number;
  paymentType: string;
  formData: {
    payment_method_id?: string;
    token?: string;
    installments?: number;
    paymentTypeId?: string;
    payer?: { email?: string };
  };
};

type Metodo = 'pix' | 'boleto' | 'credit_card';

function detectarMetodo(paymentType: string, formData: CreatePaymentBody['formData']): Metodo {
  if (formData.payment_method_id === 'pix' || paymentType === 'bank_transfer') return 'pix';
  if (paymentType === 'ticket' || formData.payment_method_id?.startsWith('bol')) return 'boleto';
  return 'credit_card';
}

function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function mpHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Idempotency-Key': randomUUID(),
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE-PAYMENT INICIADO ===');
    console.log('TOKEN PRESENTE:', !!process.env.MP_ACCESS_TOKEN);

    const body = (await request.json()) as CreatePaymentBody;
    console.log('BODY RECEBIDO:', JSON.stringify(body, null, 2));

    const { orderNumber, customer, items, total, paymentType, formData } = body;

    const metodo = detectarMetodo(paymentType, formData);
    const amount = formatAmount(total);
    const cpfDigits = customer.cpf.replace(/\D/g, '');

    const nameParts = customer.name.trim().split(/\s+/);
    const first_name = nameParts[0] ?? '';
    const last_name = nameParts.slice(1).join(' ') || first_name;

    const payer = {
      email: formData.payer?.email ?? customer.email,
      first_name,
      last_name,
      identification: { type: 'CPF', number: cpfDigits },
      address: {
        street_name: customer.street,
        street_number: customer.number,
        zip_code: customer.cep.replace(/\D/g, ''),
        city: customer.city,
        state: customer.state,
      },
    };

    // A Orders API (/v1/orders) rejeita 'id' dentro de items, e não aceita
    // 'statement_descriptor' nem 'additional_info' (nenhuma sub-propriedade
    // testada — payer/shipments/items/ip_address — foi aceita, mesmo isolada).
    // Confirmado com chamadas de sonda diretas à API antes de remover esses campos.
    const orderItems = items.map((item) => ({
      title: item.name,
      description: item.name,
      category_id: 'others',
      quantity: item.quantity,
      unit_price: String((item.price / 100).toFixed(2)),
      external_code: item.slug,
    }));

    const commonFields = {
      items: orderItems,
    };

    let payload: Record<string, unknown>;

    if (metodo === 'pix') {
      payload = {
        type: 'online',
        processing_mode: 'automatic',
        total_amount: amount,
        external_reference: orderNumber,
        ...commonFields,
        transactions: {
          payments: [
            {
              amount,
              payment_method: { id: 'pix', type: 'bank_transfer' },
            },
          ],
        },
        payer,
      };
    } else if (metodo === 'boleto') {
      payload = {
        type: 'online',
        processing_mode: 'automatic',
        total_amount: amount,
        external_reference: orderNumber,
        ...commonFields,
        payer,
        transactions: {
          payments: [
            {
              amount,
              payment_method: { id: 'boleto', type: 'ticket' },
            },
          ],
        },
      };
    } else {
      payload = {
        type: 'online',
        processing_mode: 'automatic',
        total_amount: amount,
        external_reference: orderNumber,
        ...commonFields,
        payer,
        transactions: {
          payments: [
            {
              amount,
              payment_method: {
                id: formData.payment_method_id,
                type: formData.paymentTypeId,
                token: formData.token,
                installments: formData.installments ?? 1,
              },
            },
          ],
        },
      };
    }

    console.log('=== PAYLOAD ENVIADO AO MP:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: mpHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('=== RESPOSTA COMPLETA MP:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('ERRO MP Orders API:', JSON.stringify(result, null, 2));
      return NextResponse.json(
        { error: result.message || 'Erro ao processar pagamento' },
        { status: 500 }
      );
    }

    const payment = result.transactions?.payments?.[0];

    try {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_id: payment?.id != null ? String(payment.id) : undefined,
          payment_method: metodo,
          payment_status: payment?.status ?? 'pending',
          status: result.status === 'processed' ? 'confirmed' : 'pending',
        })
        .eq('order_number', orderNumber);
    } catch {
      // O webhook corrige o status de forma assíncrona caso esta atualização otimista falhe.
    }

    // Cartão pode ser aprovado instantaneamente (sem esperar o webhook) — dispara a
    // confirmação já aqui. PIX/boleto normalmente ficam 'pending' neste ponto e são
    // confirmados depois pelo webhook, que tem sua própria checagem de duplicidade.
    if (result.status === 'processed') {
      await decrementStock(items);
      await sendEmailPedidoConfirmado({
        to: customer.email,
        customerName: customer.name,
        orderNumber,
        items,
        total,
        paymentMethod: metodo,
      });
    }

    return NextResponse.json({
      order_id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      payment_id: payment?.id,
      payment_status: payment?.status,
      payment_status_detail: payment?.status_detail,
      // PIX
      pix_qr_code: payment?.payment_method?.qr_code,
      pix_qr_code_base64: payment?.payment_method?.qr_code_base64,
      pix_ticket_url: payment?.payment_method?.ticket_url,
      // Boleto
      boleto_ticket_url: payment?.payment_method?.ticket_url,
      boleto_barcode: payment?.payment_method?.barcode_content,
    });
  } catch (error: any) {
    console.error('=== ERRO DETALHADO ===');
    console.error('Mensagem:', error?.message);
    console.error('Causa:', error?.cause);
    console.error('Status:', error?.status);
    console.error('Error completo:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
