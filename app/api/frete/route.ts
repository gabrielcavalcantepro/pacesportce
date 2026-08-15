import { NextResponse, type NextRequest } from 'next/server';
import { calcularFrete, type FreteProdutoInput } from '@/lib/melhorenvio';

type FreteOpcaoSimples = {
  id: string;
  name: string;
  price: number;
  final_price: number;
  delivery_time: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cepDestino, produtos } = body as {
      cepDestino?: string;
      produtos?: FreteProdutoInput[];
    };

    const cepLimpo = String(cepDestino ?? '').replace(/\D/g, '');
    if (!/^\d{8}$/.test(cepLimpo)) {
      return NextResponse.json({ error: 'CEP inválido. Use 8 dígitos.' }, { status: 400 });
    }

    if (!Array.isArray(produtos) || produtos.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto informado.' }, { status: 400 });
    }

    if (cepLimpo.startsWith('60')) {
      return NextResponse.json({ gratis: true, mensagem: 'Frete grátis para Fortaleza!' });
    }

    const resultado = await calcularFrete({ cepDestino: cepLimpo, produtos });

    const opcoes: FreteOpcaoSimples[] = resultado
      .filter((opcao) => opcao.company.toLowerCase().includes('correios'))
      .map((opcao) => ({
        id: opcao.id,
        name: opcao.name.replace(opcao.company, '').trim() || opcao.name,
        price: opcao.price,
        final_price: opcao.final_price,
        delivery_time: opcao.delivery_time,
      }));

    return NextResponse.json({ gratis: false, opcoes });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao calcular frete.' },
      { status: 500 }
    );
  }
}
