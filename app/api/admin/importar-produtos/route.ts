import { NextResponse, type NextRequest } from 'next/server';
import * as XLSX from 'xlsx';
import { requireUser } from '@/lib/supabase/requireUser';
import { getCategories } from '@/lib/queries/categories';
import {
  parseBoolean,
  parseNumber,
  parsePreco,
  parseCashDiscount,
  parseEspecificacoes,
  parseVariantes,
  parseTags,
  mapCondicao,
  mapStatus,
  matchCategoria,
  gerarSlugUnico,
  validarProduto,
  type ProdutoImportado,
} from '@/lib/utils/importacao';

const MAX_PRODUTOS = 100;

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames.includes('Produtos')
      ? 'Produtos'
      : workbook.SheetNames[0];
    const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;

    if (!sheet) {
      return NextResponse.json({ error: 'Planilha vazia ou inválida.' }, { status: 400 });
    }

    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: true,
      defval: '',
    });

    // Linha 1 (índice 0) = título mesclado, linha 2 (índice 1) = cabeçalho.
    let dataRows = rows.slice(2);

    // A primeira linha de dados pode ser um exemplo marcado com "▶" na coluna A.
    if (dataRows.length > 0 && String(dataRows[0]?.[0] ?? '').trim().startsWith('▶')) {
      dataRows = dataRows.slice(1);
    }

    const categorias = await getCategories();
    const slugsUsados = new Set<string>();
    const produtos: ProdutoImportado[] = [];

    for (let i = 0; i < dataRows.length && produtos.length < MAX_PRODUTOS; i++) {
      const row = dataRows[i] ?? [];
      const nome = String(row[0] ?? '').trim();

      // As linhas em branco do modelo trazem os checkboxes com valor padrão
      // "false" (não vazio), então checar todas as células ficaria sempre
      // "não vazio". O nome (coluna A) é o sinal confiável de fim dos dados.
      if (!nome) break;

      const categoriaTexto = String(row[2] ?? '').trim();
      const categoriaMatch = matchCategoria(categoriaTexto, categorias);

      const produto: ProdutoImportado = {
        nome,
        sku: row[1] ? String(row[1]).trim() : null,
        categoria: categoriaMatch?.slug ?? categoriaTexto,
        condicao: mapCondicao(row[3]),
        status: mapStatus(row[4]),
        preco: parsePreco(row[5]),
        preco_promo: parsePreco(row[6]),
        desconto_vista: parseCashDiscount(row[7]),
        estoque: parseNumber(row[8]) ?? 0,
        destaque: parseBoolean(row[9]),
        frete_gratis: parseBoolean(row[10]),
        whatsapp_only: parseBoolean(row[11]),
        peso: parseNumber(row[12]),
        comprimento: parseNumber(row[13]),
        largura: parseNumber(row[14]),
        altura: parseNumber(row[15]),
        descricao: row[16] ? String(row[16]).trim() : null,
        descricao_full: row[17] ? String(row[17]).trim() : null,
        especificacoes: parseEspecificacoes(row[18]),
        variantes: parseVariantes(row[19]),
        tags: parseTags(row[20]),
        slug: '',
        images: [],
        erros: [],
        // +3 porque a planilha começa em 1 e pulamos título + cabeçalho antes deste loop.
        linha: i + 3,
      };

      produto.slug = gerarSlugUnico(nome || `produto-${produto.linha}`, slugsUsados);
      produto.erros = validarProduto(produto);

      produtos.push(produto);
    }

    const validos = produtos.filter((p) => p.erros.length === 0).length;

    return NextResponse.json({
      total: produtos.length,
      validos,
      comErros: produtos.length - validos,
      produtos,
    });
  } catch (error) {
    console.error('IMPORTAR PRODUTOS ERRO:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar planilha.' },
      { status: 500 }
    );
  }
}
