import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/supabase/requireUser';
import type { ProdutoImportado } from '@/lib/utils/importacao';

async function getCategoryIdBySlug(slug: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  return data?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { produtos } = (await request.json()) as { produtos: ProdutoImportado[] };

    if (!Array.isArray(produtos) || produtos.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto para importar.' }, { status: 400 });
    }

    let importados = 0;
    const falhas: { slug: string; nome: string; erro: string }[] = [];
    // Não pedido na especificação original, mas necessário para a tela de
    // resultado linkar "Editar" em /admin/produtos/{id} — sem isso o id nunca
    // fica disponível no cliente.
    const sucesso: { id: string; nome: string; slug: string }[] = [];

    for (const produto of produtos) {
      try {
        const category_id = await getCategoryIdBySlug(produto.categoria);

        const { data, error } = await supabaseAdmin
          .from('products')
          .upsert(
            {
              name: produto.nome,
              slug: produto.slug,
              sku: produto.sku,
              description: produto.descricao,
              full_description: produto.descricao_full,
              price: produto.preco,
              compare_at_price: produto.preco_promo,
              cash_discount: produto.desconto_vista,
              stock: produto.estoque,
              featured: produto.destaque,
              free_shipping: produto.frete_gratis,
              whatsapp_only: produto.whatsapp_only,
              status: produto.status,
              condition: produto.condicao,
              weight: produto.peso,
              length: produto.comprimento,
              width: produto.largura,
              height: produto.altura,
              specifications: produto.especificacoes,
              variants: { dimensions: produto.variantes, combinations: [] },
              tags: produto.tags,
              images: produto.images,
              category_id,
            },
            { onConflict: 'slug' }
          )
          .select('id, name, slug')
          .single();

        if (error || !data) {
          falhas.push({
            slug: produto.slug,
            nome: produto.nome,
            erro: error?.message ?? 'Erro desconhecido.',
          });
        } else {
          importados++;
          sucesso.push({ id: data.id, nome: data.name, slug: data.slug });
        }
      } catch (e) {
        falhas.push({
          slug: produto.slug,
          nome: produto.nome,
          erro: e instanceof Error ? e.message : 'Erro desconhecido.',
        });
      }
    }

    return NextResponse.json({ importados, falhas, sucesso });
  } catch (error) {
    console.error('SALVAR PRODUTOS ERRO:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar produtos.' },
      { status: 500 }
    );
  }
}
