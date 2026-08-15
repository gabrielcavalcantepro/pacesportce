import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { customerId, token } = (await request.json()) as {
      customerId?: string;
      token?: string;
    };

    if (!customerId || !token) {
      return NextResponse.json(
        { error: 'customerId e token são obrigatórios.' },
        { status: 400 }
      );
    }

    const res = await fetch(`https://api.mercadopago.com/v1/customers/${customerId}/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    const card = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: card.message ?? 'Erro ao salvar cartão.' }, { status: 500 });
    }

    return NextResponse.json({ cardId: card.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao salvar cartão.' },
      { status: 500 }
    );
  }
}
