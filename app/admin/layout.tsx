import { createClient } from '@/lib/supabase/server';
import { getPendingOrdersCount } from '@/lib/queries/orders';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session: proxy.ts already guarantees the only /admin/* route
  // reachable in this state is /admin/login, so render it bare —
  // it has its own full-screen layout, not the sidebar chrome.
  if (!user) {
    return <div className="min-h-screen bg-[#0f0f0f]">{children}</div>;
  }

  const pendingOrdersCount = await getPendingOrdersCount();

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-[#f4f4f4]">
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
