import crypto from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MP_ORDER_STATUS_MAP } from '@/lib/mercadopago';
import { sendEmailPedidoConfirmado } from '@/lib/email';
import type { Order } from '@/lib/types';

function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): boolean {
  const parts = Object.fromEntries(xSignature.split(',').map((p) => p.split('=')));
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  // A documentação da MP exige que o data.id seja convertido para minúsculo no
  // manifest quando for alfanumérico (caso dos IDs da Orders API, ex: ORD.../PAY...) —
  // sem isso, a assinatura calculada nunca bate com a que a MP enviou.
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  // Comparação em tempo constante para evitar timing attack sobre a assinatura.
  const hashBuffer = Buffer.from(hash, 'hex');
  const v1Buffer = Buffer.from(v1, 'hex');
  if (hashBuffer.length !== v1Buffer.length) return false;

  return crypto.timingSafeEqual(hashBuffer, v1Buffer);
}

function mpHeaders(): HeadersInit {
  return { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` };
}

export async function POST(request: NextRequest) {
  try {
    const xSignature = request.headers.get('x-signature') ?? '';
    const xRequestId = request.headers.get('x-request-id') ?? '';
    const dataId = request.nextUrl.searchParams.get('data.id') ?? '';
    const secret = process.env.MP_WEBHOOK_SECRET ?? '';

    // Validar assinatura apenas quando o secret está configurado (produção);
    // ignora em dev/local onde MP_WEBHOOK_SECRET normalmente não está setado.
    if (secret && dataId) {
      const isValid = validateWebhookSignature(xSignature, xRequestId, dataId, secret);
      if (!isValid) {
        console.error('WEBHOOK: assinatura inválida');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const body = await request.json();
    console.log('WEBHOOK RECEBIDO:', JSON.stringify(body, null, 2));

    // Processar apenas eventos de order.
    if (body?.type !== 'order') {
      return new NextResponse('OK', { status: 200 });
    }

    const orderId = body.data?.id;
    if (!orderId) return new NextResponse('OK', { status: 200 });

    // Buscar order no MP.
    const mpRes = await fetch(`https://api.mercadopago.com/v1/orders/${orderId}`, {
      headers: mpHeaders(),
    });
    const order = await mpRes.json();
    console.log('WEBHOOK ORDER:', JSON.stringify(order, null, 2));

    const mapped = order.status
      ? MP_ORDER_STATUS_MAP[order.status] ?? { status: 'pending', payment_status: order.status }
      : { status: 'pending', payment_status: 'pending' };

    // Buscar o pedido antes de atualizar: precisamos do status anterior para só
    // disparar o e-mail de confirmação na transição para 'confirmed' (o MP pode
    // reenviar o mesmo webhook várias vezes) e dos dados do pedido para o e-mail.
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', order.external_reference)
      .maybeSingle();

    // Atualizar pedido no Supabase.
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: mapped.status,
        payment_status: mapped.payment_status,
        payment_id: order.transactions?.payments?.[0]?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_number', order.external_reference);

    if (error) {
      console.error('WEBHOOK: erro ao atualizar pedido', error);
    } else {
      console.log(`WEBHOOK: pedido ${order.external_reference} atualizado → ${mapped.status}`);
    }

    const previousOrder = existingOrder as Order | null;
    if (
      !error &&
      mapped.status === 'confirmed' &&
      previousOrder &&
      previousOrder.status !== 'confirmed' &&
      previousOrder.customer_email
    ) {
      await sendEmailPedidoConfirmado({
        to: previousOrder.customer_email,
        customerName: previousOrder.customer_name,
        orderNumber: previousOrder.order_number,
        items: previousOrder.items,
        total: previousOrder.total,
        paymentMethod: previousOrder.payment_method ?? 'outro',
      });
    }

    // Sempre retornar 200 para o MP não retentar.
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('WEBHOOK: erro geral', error);
    // Retornar 200 mesmo com erro para evitar retentativas desnecessárias.
    return new NextResponse('OK', { status: 200 });
  }
}
