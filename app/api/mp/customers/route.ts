import { NextResponse, type NextRequest } from 'next/server';

function mpHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: 'E-mail não informado.' }, { status: 400 });
    }

    const searchRes = await fetch(
      `https://api.mercadopago.com/v1/customers/search?email=${encodeURIComponent(email)}`,
      { headers: mpHeaders() }
    );
    const searchData = await searchRes.json();

    if (searchData.results?.length > 0) {
      return NextResponse.json({
        customerId: searchData.results[0].id,
        cards: searchData.results[0].cards ?? [],
      });
    }

    const createRes = await fetch('https://api.mercadopago.com/v1/customers', {
      method: 'POST',
      headers: mpHeaders(),
      body: JSON.stringify({ email }),
    });
    const customer = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json(
        { error: customer.message ?? 'Erro ao criar cliente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ customerId: customer.id, cards: [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao buscar cliente.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get('customerId');
    if (!customerId) {
      return NextResponse.json({ error: 'customerId não informado.' }, { status: 400 });
    }

    const cardsRes = await fetch(`https://api.mercadopago.com/v1/customers/${customerId}/cards`, {
      headers: mpHeaders(),
    });
    const cards = await cardsRes.json();

    if (!cardsRes.ok) {
      return NextResponse.json({ error: 'Erro ao buscar cartões.' }, { status: 500 });
    }

    return NextResponse.json({ cards });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao buscar cartões.' },
      { status: 500 }
    );
  }
}
