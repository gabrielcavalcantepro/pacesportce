import Link from 'next/link';
import Image from 'next/image';
import { Plus, Check, Minus } from 'lucide-react';
import { getProducts } from '@/lib/queries/products';
import { getCategories } from '@/lib/queries/categories';
import { formatPrice } from '@/lib/utils/price';
import ProductRowActions from './ProductRowActions';

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  draft: 'Rascunho',
};

const STATUS_CLASS: Record<string, string> = {
  active: 'bg-[#22c55e]/15 text-[#22c55e]',
  inactive: 'bg-[#888888]/15 text-[#888888]',
  draft: 'bg-[#f59e0b]/15 text-[#f59e0b]',
};

type SearchParams = { status?: string; categoria?: string; busca?: string };

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status, categoria, busca } = await searchParams;

  const [products, categories] = await Promise.all([
    getProducts({
      status: status && status !== 'todos' ? (status as 'active' | 'inactive' | 'draft') : undefined,
      category_id: categoria || undefined,
      search: busca || undefined,
    }),
    getCategories(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#f4f4f4]">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-4 py-2.5 text-sm"
        >
          <Plus size={16} />
          Novo Produto
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 mb-6"
      >
        <div>
          <label className="block text-xs text-[#888888] mb-1">Status</label>
          <select
            name="status"
            defaultValue={status || 'todos'}
            className="bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          >
            <option value="todos">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="draft">Rascunho</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#888888] mb-1">Categoria</label>
          <select
            name="categoria"
            defaultValue={categoria || ''}
            className="bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-[#888888] mb-1">Buscar por nome ou SKU</label>
          <input
            type="text"
            name="busca"
            defaultValue={busca || ''}
            className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#f4f4f4] outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-[#2a2a2a] text-[#f4f4f4] rounded-lg px-4 py-2 text-sm hover:bg-[#3a3a3a] transition-colors"
        >
          Filtrar
        </button>
      </form>

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-left text-[#888888]">
              <th className="p-4 font-normal">Imagem</th>
              <th className="p-4 font-normal">Produto</th>
              <th className="p-4 font-normal">SKU</th>
              <th className="p-4 font-normal">Categoria</th>
              <th className="p-4 font-normal">Preço</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Estoque</th>
              <th className="p-4 font-normal">Frete grátis</th>
              <th className="p-4 font-normal">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[#2a2a2a] last:border-0">
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#151515] border border-[#2a2a2a] relative">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-[#f4f4f4]">{product.name}</p>
                  <p className="text-xs text-[#888888]">{product.slug}</p>
                </td>
                <td className="p-4 text-[#888888]">{product.sku ?? '—'}</td>
                <td className="p-4 text-[#888888]">{product.category?.name ?? '—'}</td>
                <td className="p-4 text-[#f4f4f4]">{formatPrice(product.price)}</td>
                <td className="p-4">
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_CLASS[product.status]}`}
                  >
                    {STATUS_LABEL[product.status]}
                  </span>
                </td>
                <td className={`p-4 ${product.stock === 0 ? 'text-[#ef4444]' : 'text-[#f4f4f4]'}`}>
                  {product.stock}
                </td>
                <td className="p-4">
                  {product.free_shipping ? (
                    <Check size={16} className="text-[#22c55e]" />
                  ) : (
                    <Minus size={16} className="text-[#888888]" />
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className="text-[#888888] hover:text-[#f4f4f4] transition-colors text-xs"
                    >
                      Editar
                    </Link>
                    <ProductRowActions productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-[#888888]">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
