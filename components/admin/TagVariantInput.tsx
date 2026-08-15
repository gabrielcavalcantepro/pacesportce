'use client';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { VariantDimension } from '@/lib/types';

type TagVariantInputProps = {
  value: VariantDimension;
  onChange: (dimension: VariantDimension) => void;
  onRemove: () => void;
};

export default function TagVariantInput({ value, onChange, onRemove }: TagVariantInputProps) {
  const [inputValue, setInputValue] = useState('');

  function addTag(raw: string) {
    const option = raw.trim();
    if (!option) return;
    if (value.options.includes(option)) {
      setInputValue('');
      return;
    }
    onChange({ ...value, options: [...value.options, option] });
    setInputValue('');
  }

  function removeTag(option: string) {
    onChange({ ...value, options: value.options.filter((o) => o !== option) });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Tab' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.options.length > 0) {
      removeTag(value.options[value.options.length - 1]);
    }
  }

  return (
    <div className="border border-[#2a2a2a] rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Nome (ex: Tamanho)"
          className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-2.5 text-[#888888] hover:text-[#ef4444] transition-colors shrink-0"
          aria-label="Remover variante"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 focus-within:border-[#f4f4f4] transition-colors">
        {value.options.map((option) => (
          <span
            key={option}
            className="flex items-center gap-1.5 bg-[#2a2a2a] text-[#f4f4f4] rounded-full px-3 py-1 text-sm"
          >
            {option}
            <button
              type="button"
              onClick={() => removeTag(option)}
              className="text-[#888888] hover:text-[#f4f4f4] transition-colors"
              aria-label={`Remover ${option}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.options.length === 0 ? 'Digite e pressione vírgula ou Tab...' : ''}
          aria-label="Adicionar opção de variante"
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[#f4f4f4] outline-none placeholder-[#888888]"
        />
      </div>
    </div>
  );
}
