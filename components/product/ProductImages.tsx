'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImagesProps {
  images: string[];
  name: string;
}

export default function ProductImages({ images, name }: ProductImagesProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg overflow-hidden">
        <Image
          src={images[selected]}
          alt={`${name} — imagem ${selected + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                selected === i ? 'border-[#f4f4f4]' : 'border-[#2a2a2a] hover:border-[#888888]'
              }`}
            >
              <Image
                src={src}
                alt={`${name} miniatura ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
