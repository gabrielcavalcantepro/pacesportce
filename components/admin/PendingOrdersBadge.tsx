import { getPendingOrdersCount } from '@/lib/queries/orders';

export default async function PendingOrdersBadge() {
  const count = await getPendingOrdersCount();
  if (count <= 0) return null;

  return (
    <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-semibold">
      {count}
    </span>
  );
}
