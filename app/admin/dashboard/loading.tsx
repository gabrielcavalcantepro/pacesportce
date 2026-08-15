import Skeleton from '@/components/admin/Skeleton';

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[120px] w-full bg-[#1e1e1e] border border-[#2a2a2a]"
          />
        ))}
      </div>
    </div>
  );
}
