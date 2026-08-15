import Skeleton from '@/components/admin/Skeleton';

const sectionClass = 'bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-4';

export default function ConfiguracoesLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-6" />

      <div className="space-y-6">
        <section className={sectionClass}>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </section>

        <section className={sectionClass}>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-24 w-full" />
        </section>

        <section className={sectionClass}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-11 w-full" />
        </section>
      </div>
    </div>
  );
}
