'use client';

import { useEffect, useState } from 'react';
import { getSetting, updateSettings } from '@/lib/queries/settings';

export default function AdminFretePage() {
  const [enabled, setEnabled] = useState(false);
  const [valueReais, setValueReais] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    getSetting('free_shipping_threshold')
      .then((raw) => {
        const cents = parseInt(raw ?? '0', 10) || 0;
        setEnabled(cents > 0);
        setValueReais((cents / 100).toFixed(2));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const cents = enabled ? Math.round(parseFloat(valueReais || '0') * 100) : 0;

    const result = await updateSettings({ free_shipping_threshold: String(cents) });
    setSaving(false);

    setMessage(
      result.success
        ? { type: 'success', text: 'Configuração de frete salva com sucesso.' }
        : { type: 'error', text: result.error ?? 'Erro ao salvar.' }
    );
  }

  if (loading) {
    return <p className="text-[#888888] text-sm">Carregando...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#f4f4f4] mb-6">Frete</h1>

      {message && (
        <div
          className={`text-sm rounded-lg px-4 py-3 mb-6 border ${
            message.type === 'success'
              ? 'bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]'
              : 'bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444]'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-6 space-y-4 max-w-lg">
        <label className="flex items-center gap-2 text-sm text-[#f4f4f4] cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="accent-[#f4f4f4]"
          />
          Habilitar frete grátis por valor mínimo de pedido
        </label>

        {enabled && (
          <div>
            <label className="block text-sm text-[#888888] mb-1.5">Valor mínimo (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valueReais}
              onChange={(e) => setValueReais(e.target.value)}
              className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-3 text-sm disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="mt-6 bg-[#1e1e1e] border-l-4 border-[#f59e0b] border-y border-r border-y-[#2a2a2a] border-r-[#2a2a2a] rounded-xl p-6 max-w-lg">
        <p className="text-sm text-[#f4f4f4]">
          Produtos marcados individualmente como Frete Grátis sempre terão frete isento,
          independente do valor do pedido.
        </p>
      </div>
    </div>
  );
}
