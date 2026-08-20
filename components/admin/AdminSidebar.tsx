'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  Image as ImageIcon,
  Truck,
  Settings,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getPendingOrdersCount } from '@/lib/queries/orders';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/categorias', label: 'Categorias', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/frete', label: 'Frete', icon: Truck },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

const PEDIDOS_HREF = '/admin/pedidos';
const LAST_SEEN_STORAGE_KEY = 'pacesportce_pedidos_last_seen_count';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [badgeCount, setBadgeCount] = useState(0);

  const isOnPedidos = pathname === PEDIDOS_HREF || pathname.startsWith(`${PEDIDOS_HREF}/`);

  // O badge mostra pedidos pendentes ainda não vistos: some assim que o admin
  // visita a aba Pedidos (guarda a contagem atual como "vista") e só volta a
  // aparecer se novos pedidos pendentes chegarem depois disso — não a cada
  // navegação repetindo o mesmo total que ele já conferiu.
  useEffect(() => {
    let cancelled = false;

    getPendingOrdersCount().then((count) => {
      if (cancelled) return;

      if (isOnPedidos) {
        localStorage.setItem(LAST_SEEN_STORAGE_KEY, String(count));
        setBadgeCount(0);
        return;
      }

      const lastSeen = parseInt(localStorage.getItem(LAST_SEEN_STORAGE_KEY) ?? '0', 10);
      setBadgeCount(count > lastSeen ? count : 0);
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, isOnPedidos]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-[240px] shrink-0 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col h-screen sticky top-0">
      <div className="flex items-center px-6 h-16 border-b border-[#2a2a2a]">
        <Image
          src="/assets/logo-branco.webp"
          alt="PaceSportce"
          width={120}
          height={34}
          className="h-6 w-auto object-contain"
          priority
        />
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-6 py-3 text-sm border-l-2 transition-colors ${
                isActive
                  ? 'bg-[#2a2a2a] border-[#f4f4f4] text-[#f4f4f4] font-medium'
                  : 'border-transparent text-[#888888] hover:text-[#f4f4f4]'
              }`}
            >
              <Icon size={18} />
              {item.label}
              {item.href === PEDIDOS_HREF && badgeCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-semibold">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#2a2a2a] py-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-3 text-sm text-[#888888] hover:text-[#f4f4f4] transition-colors w-full"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
