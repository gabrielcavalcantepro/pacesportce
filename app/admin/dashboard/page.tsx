import { Package, Tag, Image as ImageIcon, AlertTriangle, ShoppingBag } from 'lucide-react';
import { getProducts } from '@/lib/queries/products';
import { getCategories } from '@/lib/queries/categories';
import { getBanners } from '@/lib/queries/banners';
import { getOrders } from '@/lib/queries/orders';

export default async function AdminDashboardPage() {
  const [products, categories, banners, orders] = await Promise.all([
    getProducts(),
    getCategories(),
    getBanners(),
    getOrders(),
  ]);

  const activeProducts = products.filter((p) => p.status === 'active');
  const activeCategories = categories.filter((c) => c.active);
  const activeBanners = banners.filter((b) => b.active);
  const outOfStock = products.filter((p) => p.stock === 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const cards = [
    { label: 'Produtos ativos', value: activeProducts.length, icon: Package },
    { label: 'Pedidos pendentes', value: pendingOrders.length, icon: ShoppingBag, alert: true },
    { label: 'Categorias ativas', value: activeCategories.length, icon: Tag },
    { label: 'Banners ativos', value: activeBanners.length, icon: ImageIcon },
    { label: 'Produtos sem estoque', value: outOfStock.length, icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isAlert = card.alert && card.value > 0;
          return (
            <div
              key={card.label}
              className={`bg-[#1e1e1e] border rounded-xl p-6 flex items-center gap-4 ${
                isAlert ? 'border-[#f59e0b]/40' : 'border-[#2a2a2a]'
              }`}
            >
              <div
                className={`rounded-lg p-3 ${
                  isAlert ? 'bg-[#f59e0b]/15' : 'bg-[#151515] border border-[#2a2a2a]'
                }`}
              >
                <Icon size={22} className={isAlert ? 'text-[#f59e0b]' : 'text-[#f4f4f4]'} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#f4f4f4]">{card.value}</p>
                <p className="text-sm text-[#888888]">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {outOfStock.length > 0 && (
        <div className="mt-6 bg-[#1e1e1e] border-l-4 border-[#f59e0b] border-y border-r border-y-[#2a2a2a] border-r-[#2a2a2a] rounded-xl p-6">
          <p className="text-sm font-medium text-[#f59e0b] mb-3">
            Produtos com estoque zerado
          </p>
          <ul className="space-y-1">
            {outOfStock.map((p) => (
              <li key={p.id} className="text-sm text-[#f4f4f4]">
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
