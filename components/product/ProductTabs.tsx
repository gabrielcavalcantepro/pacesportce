'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';

type Tab = 'descricao' | 'especificacoes';

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>('descricao');

  const tabClass = (active: boolean) =>
    `pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
      active ? 'border-[#f4f4f4] text-[#f4f4f4]' : 'border-transparent text-[#888888]'
    }`;

  return (
    <section className="mt-16">
      <div className="flex gap-6 border-b border-[#2a2a2a]">
        <button onClick={() => setTab('descricao')} className={tabClass(tab === 'descricao')}>
          Descrição
        </button>
        <button
          onClick={() => setTab('especificacoes')}
          className={tabClass(tab === 'especificacoes')}
        >
          Especificações
        </button>
      </div>

      <div className="py-8">
        {tab === 'descricao' &&
          (product.full_description ? (
            <p className="text-sm text-[#888888] leading-relaxed whitespace-pre-line">
              {product.full_description}
            </p>
          ) : (
            <p className="text-sm text-[#888888]">Sem descrição detalhada.</p>
          ))}

        {tab === 'especificacoes' &&
          (product.specifications.length > 0 ? (
            <div className="rounded-lg overflow-hidden border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
              {product.specifications.map((spec, i) => (
                <div
                  key={i}
                  className={`flex text-sm px-4 py-3 ${i % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#242424]'}`}
                >
                  <span className="w-2/5 text-[#888888] shrink-0">{spec.label}</span>
                  <span className="text-[#f4f4f4]">{spec.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#888888]">Sem especificações cadastradas.</p>
          ))}
      </div>
    </section>
  );
}
