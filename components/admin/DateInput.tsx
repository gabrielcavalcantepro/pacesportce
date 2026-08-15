'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function isoToDisplay(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
}

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function displayToIso(display: string): string | null {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${y}-${m}-${d}`;
}

export default function DateInput({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  className,
}: DateInputProps) {
  const [display, setDisplay] = useState(() => isoToDisplay(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDisplay(isoToDisplay(value));
    setInvalid(false);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInvalid(false);
    setDisplay(maskDate(e.target.value));
  }

  function handleBlur() {
    if (!display) {
      setInvalid(false);
      onChange('');
      return;
    }
    const iso = displayToIso(display);
    if (iso) {
      setInvalid(false);
      onChange(iso);
    } else {
      setInvalid(true);
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={
          className ??
          `w-full bg-[#1e1e1e] border rounded-lg pl-4 pr-10 py-3 text-sm text-[#f4f4f4] outline-none transition-colors ${
            invalid ? 'border-[#ef4444]' : 'border-[#2a2a2a] focus:border-[#f4f4f4]'
          }`
        }
      />
      <Calendar
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none"
      />
    </div>
  );
}
