interface SpecsTableProps {
  specifications: { label: string; value: string }[];
}

export default function SpecsTable({ specifications }: SpecsTableProps) {
  if (!specifications || specifications.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
      <h3 className="text-sm font-semibold text-[#f4f4f4] uppercase tracking-wider mb-3">
        Especificações
      </h3>
      <div className="rounded-lg overflow-hidden border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
        {specifications.map((spec, i) => (
          <div
            key={spec.label}
            className={`flex text-sm px-4 py-2.5 ${i % 2 === 0 ? 'bg-[#151515]' : 'bg-[#1e1e1e]'}`}
          >
            <span className="w-2/5 text-[#888888] shrink-0">{spec.label}</span>
            <span className="text-[#f4f4f4]">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
