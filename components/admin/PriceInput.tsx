'use client';

type PriceInputProps = {
  value: number;
  onChange: (centavos: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};

function formatCents(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const reaisFormatted = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${reaisFormatted},${String(centavos).padStart(2, '0')}`;
}

const defaultClass =
  'w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors';

export default function PriceInput({ value, onChange, placeholder = '0,00', className, id }: PriceInputProps) {
  const displayValue = value === 0 ? '' : formatCents(value);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const digits = String(value).slice(0, -1);
      onChange(digits === '' ? 0 : parseInt(digits, 10));
      return;
    }

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digits = (value === 0 ? '' : String(value)) + e.key;
      onChange(parseInt(digits, 10));
      return;
    }

    // Let control/navigation keys (Tab, arrows, Delete, shortcuts...) through untouched;
    // block any other printable character since only digits are valid here.
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
    }
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={() => {}}
      onKeyDown={handleKeyDown}
      onPaste={(e) => e.preventDefault()}
      placeholder={placeholder}
      className={className ?? defaultClass}
    />
  );
}
