import { generateSlug } from '@/lib/utils/slug';
import type { Category } from '@/lib/types';

export interface ProdutoImportado {
  nome: string;
  sku: string | null;
  categoria: string; // slug de uma categoria real, resolvido a partir do texto da planilha
  condicao: 'new' | 'used';
  status: 'active' | 'inactive' | 'draft';
  preco: number | null; // em centavos
  preco_promo: number | null; // em centavos
  estoque: number;
  destaque: boolean;
  frete_gratis: boolean;
  whatsapp_only: boolean;
  peso: number | null;
  comprimento: number | null;
  largura: number | null;
  altura: number | null;
  descricao: string | null;
  descricao_full: string | null;
  especificacoes: { label: string; value: string }[];
  variantes: { name: string; options: string[] }[];
  tags: string[];
  slug: string;
  images: string[];
  erros: string[];
  linha: number;
}

// Booleano: aceita checkbox Excel (TRUE/FALSE), número (1/0) ou texto (sim/nao)
export function parseBoolean(valor: unknown): boolean {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor === 1;
  if (typeof valor === 'string') {
    const v = valor.toLowerCase().trim();
    return v === 'sim' || v === 'true' || v === 's' || v === '1';
  }
  return false;
}

// Número: aceita string com ponto ou vírgula decimal
export function parseNumber(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const str = String(valor).replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Preço em centavos
export function parsePreco(valor: unknown): number | null {
  const num = parseNumber(valor);
  return num !== null ? Math.round(num * 100) : null;
}

// Especificações: "Marca:Trek,Material:Alumínio" → [{label, value}]
export function parseEspecificacoes(valor: unknown): { label: string; value: string }[] {
  if (!valor) return [];
  return String(valor)
    .split(',')
    .map((s) => {
      const [label, ...rest] = s.split(':');
      return { label: label?.trim() ?? '', value: rest.join(':').trim() };
    })
    .filter((s) => s.label && s.value);
}

// Variantes: "Tamanho:P,M,G|Cor:Preto,Branco" → [{name, options}]
export function parseVariantes(valor: unknown): { name: string; options: string[] }[] {
  if (!valor) return [];
  return String(valor)
    .split('|')
    .map((grupo) => {
      const [name, opts] = grupo.split(':');
      return {
        name: name?.trim() ?? '',
        options: (opts || '').split(',').map((o) => o.trim()).filter(Boolean),
      };
    })
    .filter((v) => v.name && v.options.length > 0);
}

// Tags: "bike,mtb,corrida" → ["bike", "mtb", "corrida"]
export function parseTags(valor: unknown): string[] {
  if (!valor) return [];
  return String(valor)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function mapCondicao(valor: unknown): 'new' | 'used' {
  const v = String(valor ?? '').toLowerCase().trim();
  if (v === 'usado') return 'used';
  return 'new';
}

export function mapStatus(valor: unknown): 'active' | 'inactive' | 'draft' {
  const v = String(valor ?? '').toLowerCase().trim();
  if (v === 'ativo') return 'active';
  if (v === 'inativo') return 'inactive';
  return 'draft';
}

// A planilha tem texto livre (nome ou slug da categoria); casa contra as
// categorias reais cadastradas no admin em vez de uma lista fixa, já que as
// categorias da loja variam e não são "ciclismo/natacao/corrida".
export function matchCategoria(valor: string, categorias: Category[]): Category | null {
  const texto = valor.trim();
  if (!texto) return null;
  const normalizado = generateSlug(texto);
  return (
    categorias.find((c) => c.slug === normalizado) ??
    categorias.find((c) => generateSlug(c.name) === normalizado) ??
    categorias.find((c) => c.name.toLowerCase().trim() === texto.toLowerCase()) ??
    null
  );
}

export function gerarSlugUnico(nome: string, usados: Set<string>): string {
  const base = generateSlug(nome) || 'produto';
  let slug = base;
  let i = 2;
  while (usados.has(slug)) {
    slug = `${base}-${i}`;
    i++;
  }
  usados.add(slug);
  return slug;
}

export function validarProduto(
  produto: Pick<ProdutoImportado, 'nome' | 'categoria' | 'preco'>,
  categorias: Category[]
): string[] {
  const erros: string[] = [];

  if (!produto.nome || produto.nome.trim().length < 3) {
    erros.push('Nome obrigatório');
  }

  if (!categorias.some((c) => c.slug === produto.categoria)) {
    erros.push('Categoria inválida');
  }

  if (produto.preco === null || produto.preco <= 0) {
    erros.push('Preço obrigatório');
  }

  return erros;
}
