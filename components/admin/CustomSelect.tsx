'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-[#1e1e1e] border border-[#2a2a2a] text-[#f4f4f4] rounded-lg px-4 py-3 text-sm cursor-pointer outline-none focus:border-[#f4f4f4] transition-colors"
      >
        <span className={selected ? 'text-[#f4f4f4]' : 'text-[#888888]'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#888888] shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`absolute left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto transition-all duration-150 ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-sm text-[#f4f4f4] hover:bg-[#2a2a2a] transition-colors ${
                isSelected ? 'font-medium' : ''
              }`}
            >
              {option.label}
              {isSelected && <Check size={14} className="text-[#f4f4f4] shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
