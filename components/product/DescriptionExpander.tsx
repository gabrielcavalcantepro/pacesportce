'use client';

import { useState } from 'react';

interface DescriptionExpanderProps {
  description: string;
  fullDescription: string;
}

export default function DescriptionExpander({ description, fullDescription }: DescriptionExpanderProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-8">
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? '800px' : '4.5rem' }}
      >
        <p className="text-sm text-[#888888] leading-relaxed">
          {description}
        </p>
        {fullDescription && (
          <p className="text-sm text-[#888888] leading-relaxed mt-3 whitespace-pre-line">
            {fullDescription}
          </p>
        )}
      </div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-sm text-[#f4f4f4] underline underline-offset-2 mt-2 hover:text-white transition-colors"
      >
        {expanded ? 'Ler menos ↑' : 'Ler mais ↓'}
      </button>
    </div>
  );
}
