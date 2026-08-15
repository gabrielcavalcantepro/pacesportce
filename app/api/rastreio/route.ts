import { NextResponse, type NextRequest } from 'next/server';
import { rastrearPedido } from '@/lib/melhorenvio';

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get('codigo');

  if (!codigo) {
    return NextResponse.json({ error: 'Código de rastreio não informado.' }, { status: 400 });
  }

  const resultado = await rastrearPedido(codigo);

  if (!resultado) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  return NextResponse.json(resultado);
}
