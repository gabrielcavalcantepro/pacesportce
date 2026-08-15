import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PendingOrdersBadge from '@/components/admin/PendingOrdersBadge';

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

  // The pending-orders count is wrapped in its own Suspense boundary so this
  // uncached fetch doesn't block navigation into <main> — the sidebar renders
  // immediately and the badge streams in once the count resolves.
  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-[#f4f4f4]">
      <AdminSidebar
        pendingOrdersBadge={
          <Suspense fallback={null}>
            <PendingOrdersBadge />
          </Suspense>
        }
      />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
