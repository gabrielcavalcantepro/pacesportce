import Skeleton from '@/components/admin/Skeleton';

export default function PedidosLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="flex flex-wrap items-end gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 mb-6">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-36" />
        <Skeleton className="h-12 w-36" />
        <Skeleton className="h-12 flex-1 min-w-[180px]" />
      </div>

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b border-[#2a2a2a] last:border-0"
          >
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
