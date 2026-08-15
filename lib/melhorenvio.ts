const BASE_URL = 'https://melhorenvio.com.br/api/v2';

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.MELHORENVIO_TOKEN}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'PaceSportce/1.0 (contato@pacesportce.com.br)',
  };
}

export type FreteProdutoInput = {
  weight: number;
  width: number;
  height: number;
  length: number;
  quantity: number;
  insurance_value: number;
};

export type FreteOpcao = {
  id: string;
  name: string;
  company: string;
  price: number;
  discount: number;
  final_price: number;
  delivery_time: number;
  error?: string;
};

export async function calcularFrete(params: {
  cepDestino: string;
  produtos: FreteProdutoInput[];
}): Promise<FreteOpcao[]> {
  const { cepDestino, produtos } = params;

  const weight = produtos.reduce((sum, p) => sum + p.weight * p.quantity, 0);
  const width = Math.max(...produtos.map((p) => p.width));
  const height = Math.max(...produtos.map((p) => p.height));
  const length = Math.max(...produtos.map((p) => p.length));
  const insurance_value = produtos.reduce((sum, p) => sum + p.insurance_value * p.quantity, 0);

  const body = {
    from: { postal_code: process.env.MELHORENVIO_CEP_ORIGEM },
    to: { postal_code: cepDestino },
    package: { weight, width, height, length },
    options: { insurance_value, receipt: false, own_hand: false },
    services: '',
  };

  const response = await fetch(`${BASE_URL}/me/shipment/calculate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Melhor Envio: erro ao calcular frete (HTTP ${response.status}) ${text}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Melhor Envio: resposta inesperada ao calcular frete.');
  }

  return data
    .filter((item) => !item.error && item.price != null)
    .map((item): FreteOpcao => {
      const price = parseFloat(item.price);
      const discount = parseFloat(item.discount ?? '0') || 0;
      return {
        id: String(item.id),
        name: `${item.company?.name ?? ''} ${item.name ?? ''}`.trim(),
        company: item.company?.name ?? '',
        price,
        discount,
        final_price: price - discount,
        delivery_time: item.delivery_time ?? item.custom_delivery_time ?? 0,
      };
    })
    .sort((a, b) => a.final_price - b.final_price);
}

export type RastreioEvento = {
  status: string;
  description: string;
  date: string;
  location: string;
};

export type RastreioResultado = {
  tracking: string;
  status: string;
  events: RastreioEvento[];
};

function formatTrackingDate(raw: string): string {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function rastrearPedido(trackingCode: string): Promise<RastreioResultado | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/me/shipment/tracking?orders[]=${encodeURIComponent(trackingCode)}`,
      { headers: getHeaders() }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const entry = data?.[trackingCode];
    if (!entry) return null;

    const rawEvents = entry.tracking_events ?? entry.events ?? entry.trackings ?? [];

    const events: RastreioEvento[] = (Array.isArray(rawEvents) ? rawEvents : []).map((ev) => ({
      status: ev.status ?? ev.title ?? '',
      description: ev.description ?? ev.message ?? '',
      date: formatTrackingDate(ev.date ?? ev.occurred_at ?? ev.created_at ?? ''),
      location: ev.location ?? ev.city ?? '',
    }));

    return {
      tracking: entry.tracking ?? trackingCode,
      status: entry.status ?? '',
      events,
    };
  } catch {
    return null;
  }
}
