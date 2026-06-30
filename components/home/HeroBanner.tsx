'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { id: 1, alt: 'Banner 1' },
  { id: 2, alt: 'Banner 2' },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    // só dispara se for arrasto horizontal, não scroll vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      deltaX > 0 ? next() : prev();
    }
  }

  return (
    <section
      className="relative overflow-hidden h-[480px] sm:h-[560px] lg:h-[700px] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={i !== current}
        >
          <picture className="absolute inset-0">
            <source
              media="(max-width: 767px)"
              srcSet={`/assets/banner-${slide.id}-m.webp`}
              type="image/webp"
            />
            <img
              src={`/assets/banner-${slide.id}.webp`}
              alt={slide.alt}
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </picture>
        </div>
      ))}

      {/* Setas — ocultas no mobile, visíveis no sm+ */}
      {slides.length > 1 && (
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
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
