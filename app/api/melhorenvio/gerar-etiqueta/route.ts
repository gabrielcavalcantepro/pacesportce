import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Order } from '@/lib/types';

const BASE_URL = 'https://melhorenvio.com.br/api/v2';

// ATENÇÃO: phone, email e document ainda são placeholders (o "00000000000" não
// é um CPF/CNPJ real). Endereço já atualizado com os dados reais da PaceSportce.
// O Melhor Envio usa esses dados como remetente/retorno na etiqueta impressa —
// substitua phone/email/document pelos dados reais antes de gerar etiquetas de verdade.
const FROM = {
  name: 'PaceSportce',
  phone: '85999999999',
  email: 'contato@pacesportce.com.br',
  document: '00000000000',
  address: 'Rua Francisco Lima e Silva',
  complement: '',
  number: '399',
  district: 'Jangurussu',
  city: 'Fortaleza',
  country_id: 'BR',
  postal_code: '60821760',
  note: '',
};

function meHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.MELHORENVIO_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'PaceSportce/1.0 (contato@pacesportce.com.br)',
  };
}

function detectServiceId(shippingService: string | null | undefined): number {
  if (shippingService && shippingService.toLowerCase().includes('sedex')) return 2;
  return 1; // PAC (default)
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = (await request.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: 'orderId não informado.' }, { status: 400 });
    }

    // PASSO 1 — buscar pedido
    const { data: orderRow, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !orderRow) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    const order = orderRow as Order;

    // Guard: produtos whatsapp_only não usam Melhor Envio.
    const productIds = Array.from(new Set(order.items.map((item) => item.productId)));
    if (productIds.length > 0) {
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, whatsapp_only')
        .in('id', productIds);

      const hasWhatsappOnly = products?.some((p) => p.whatsapp_only);
      if (hasWhatsappOnly) {
        return NextResponse.json(
          {
            error:
              'Este pedido contém produtos que não usam Melhor Envio. Gere a etiqueta diretamente na transportadora.',
          },
          { status: 400 }
        );
      }
    }

    // Guard: endereço de entrega.
    if (!order.shipping_address) {
      return NextResponse.json({ error: 'Endereço de entrega não disponível.' }, { status: 400 });
    }

    let melhorEnvioOrderId = order.melhor_envio_order_id;

    // PASSO 2 — adicionar ao carrinho (pula se já tiver um order id salvo)
    if (!melhorEnvioOrderId) {
      const cartBody = {
        service: detectServiceId(order.shipping_service),
        agency: null,
        from: FROM,
        to: {
          name: order.customer_name,
          phone: order.customer_phone?.replace(/\D/g, '') ?? '',
          email: order.customer_email ?? '',
          document: '',
          address: order.shipping_address.street ?? '',
          complement: order.shipping_address.complement ?? '',
          number: order.shipping_address.number ?? '',
          district: order.shipping_address.neighborhood ?? '',
          city: order.shipping_address.city ?? '',
          state_abbr: order.shipping_address.state ?? '',
          country_id: 'BR',
          postal_code: order.shipping_address.cep?.replace(/\D/g, '') ?? '',
          note: '',
        },
        products: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitary_value: item.price / 100,
          weight: item.weight ?? 0.3,
          width: item.width ?? 12,
          height: item.height ?? 4,
          length: item.length ?? 17,
        })),
        volumes: [{ height: 4, width: 12, length: 17, weight: 0.3 }],
        options: {
          insurance_value: order.total / 100,
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false,
          invoice: { key: '' },
          platform: 'PaceSportce',
        },
      };

      const cartRes = await fetch(`${BASE_URL}/me/cart`, {
        method: 'POST',
        headers: meHeaders(),
        body: JSON.stringify(cartBody),
      });
      const cartData = await cartRes.json();

      if (!cartRes.ok) {
        console.error('MELHORENVIO CART ERRO:', JSON.stringify(cartData, null, 2));
        return NextResponse.json(
          {
            error: cartData.message ?? 'Erro ao adicionar ao carrinho do Melhor Envio.',
            details: cartData,
          },
          { status: 500 }
        );
      }

      melhorEnvioOrderId = cartData.id;

      await supabaseAdmin
        .from('orders')
        .update({ melhor_envio_order_id: melhorEnvioOrderId })
        .eq('id', orderId);
    }

    // PASSO 3 — checkout (paga com saldo da conta)
    const checkoutRes = await fetch(`${BASE_URL}/me/shipment/checkout`, {
      method: 'POST',
      headers: meHeaders(),
      body: JSON.stringify({ orders: [melhorEnvioOrderId] }),
    });
    const checkoutData = await checkoutRes.json();

    if (!checkoutRes.ok) {
      console.error('MELHORENVIO CHECKOUT ERRO:', JSON.stringify(checkoutData, null, 2));
      const raw = JSON.stringify(checkoutData).toLowerCase();
      const isInsufficientBalance = raw.includes('saldo') || raw.includes('insufficient');
      return NextResponse.json(
        {
          error: isInsufficientBalance
            ? 'Saldo insuficiente no Melhor Envio. Acesse sua conta para adicionar saldo.'
            : checkoutData.message ?? 'Erro ao finalizar compra do frete.',
          details: checkoutData,
        },
        { status: 500 }
      );
    }

    // PASSO 4 — gerar etiqueta
    const generateRes = await fetch(`${BASE_URL}/me/shipment/generate`, {
      method: 'POST',
      headers: meHeaders(),
      body: JSON.stringify({ orders: [melhorEnvioOrderId] }),
    });
    const generateData = await generateRes.json();

    if (!generateRes.ok) {
      console.error('MELHORENVIO GENERATE ERRO:', JSON.stringify(generateData, null, 2));
      return NextResponse.json(
        { error: generateData.message ?? 'Erro ao gerar etiqueta.', details: generateData },
        { status: 500 }
      );
    }

    // PASSO 5 — obter URL de impressão
    const printRes = await fetch(`${BASE_URL}/me/shipment/print`, {
      method: 'POST',
      headers: meHeaders(),
      body: JSON.stringify({ mode: 'public', orders: [melhorEnvioOrderId] }),
    });
    const printData = await printRes.json();

    if (!printRes.ok) {
      console.error('MELHORENVIO PRINT ERRO:', JSON.stringify(printData, null, 2));
      return NextResponse.json(
        { error: printData.message ?? 'Erro ao obter URL de impressão.', details: printData },
        { status: 500 }
      );
    }

    const labelUrl = printData.url;

    await supabaseAdmin
      .from('orders')
      .update({ label_url: labelUrl, status: 'preparing' })
      .eq('id', orderId);

    return NextResponse.json({ success: true, label_url: labelUrl });
  } catch (error) {
    console.error('MELHORENVIO ETIQUETA ERRO GERAL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao gerar etiqueta.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId não informado.' }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('label_url')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ label_url: order.label_url ?? null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar etiqueta.' },
      { status: 500 }
    );
  }
}
