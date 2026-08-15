'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/lib/types';

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + banners.length) % banners.length),
    [banners.length]
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      deltaX > 0 ? next() : prev();
    }
  }

  if (banners.length === 0) {
    return (
      <section className="relative h-[480px] sm:h-[560px] lg:h-[700px] flex items-center justify-center bg-[#1e1e1e] border-b border-[#2a2a2a]">
        <div className="text-center px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#f4f4f4] mb-6">
            PaceSportce
          </h1>
          <Link
            href="#produtos"
            className="inline-block bg-[#f4f4f4] text-[#151515] font-semibold px-8 py-3 rounded-lg hover:bg-white transition-colors"
          >
            Ver Produtos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden h-[480px] sm:h-[560px] lg:h-[700px] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={i !== current}
        >
          {banner.image_mobile_url ? (
            <>
              <Image
                src={banner.image_mobile_url}
                alt="Banner"
                fill
                className="object-cover object-center sm:hidden"
                priority={i === 0}
              />
              <Image
                src={banner.image_url}
                alt="Banner"
                fill
                className="object-cover object-center hidden sm:block"
                priority={i === 0}
              />
            </>
          ) : (
            <Image
              src={banner.image_url}
              alt="Banner"
              fill
              className="object-cover object-center"
              priority={i === 0}
            />
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition-colors items-center justify-center"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full transition-colors items-center justify-center"
            aria-label="Próximo slide"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
