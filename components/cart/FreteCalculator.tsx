'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils/price';
import { prazoTexto } from '@/lib/utils/frete';
import type { FreteProdutoInput } from '@/lib/melhorenvio';

type FreteOpcaoSimples = {
  id: string;
  name: string;
  price: number;
  final_price: number;
  delivery_time: number;
};

type FreteResponse =
  | { gratis: true; mensagem: string }
  | { gratis: false; opcoes: FreteOpcaoSimples[] };

type FreteCalculatorProps = {
  produtos: FreteProdutoInput[];
  selectable?: boolean;
};

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function FreteCalculator({ produtos, selectable = true }: FreteCalculatorProps) {
  const { shipping, setShipping } = useCart();
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<FreteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      setError('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const response = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cepDestino: cepLimpo, produtos }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error ?? 'Erro ao calcular frete.');
        return;
      }

      setResultado(data as FreteResponse);

      if (data.gratis) {
        setShipping({
          company: 'Grátis',
          service: 'Frete Grátis',
          price: 0,
          delivery_time: 0,
          cep: cepLimpo,
        });
      }
    } catch {
      setError('Erro ao calcular frete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(opcao: FreteOpcaoSimples) {
    setShipping({
      company: 'Correios',
      service: opcao.name,
      price: Math.round(opcao.final_price * 100),
      delivery_time: opcao.delivery_time,
      cep: cep.replace(/\D/g, ''),
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={cep}
          onChange={(e) => setCep(maskCep(e.target.value))}
          placeholder="00000-000"
          inputMode="numeric"
          className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#f4f4f4] text-[#151515] font-medium rounded-lg px-6 py-2.5 text-sm disabled:opacity-60 transition-opacity shrink-0"
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>
      </form>

      {error && <p className="text-sm text-[#ef4444] mt-3">{error}</p>}

      {resultado?.gratis === true && (
        <div className="bg-green-900/30 border border-green-500 text-green-400 rounded-lg p-4 mt-4 font-medium text-sm">
          ✓ Frete Grátis para Fortaleza!
        </div>
      )}

      {resultado?.gratis === false && resultado.opcoes.length === 0 && (
        <p className="text-sm text-[#888888] mt-3">
          Não foi possível calcular o frete para este CEP. Entre em contato via WhatsApp.
        </p>
      )}

      {resultado?.gratis === false && resultado.opcoes.length > 0 && (
        <div className="space-y-3 mt-4">
          {resultado.opcoes.map((opcao) => {
            const isSelected =
              selectable &&
              shipping?.service === opcao.name &&
              shipping?.cep === cep.replace(/\D/g, '');

            return (
              <div
                key={opcao.id}
                className={`bg-[#1e1e1e] border rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap ${
                  isSelected ? 'border-[#f4f4f4]' : 'border-[#2a2a2a]'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-[#f4f4f4]">{opcao.name}</p>
                  <p className="text-xs text-[#888888]">
                    {prazoTexto(opcao.name, opcao.delivery_time)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-[#f4f4f4]">
                    {formatPrice(Math.round(opcao.final_price * 100))}
                  </span>

                  {selectable && (
                    <button
                      type="button"
                      onClick={() => handleSelect(opcao)}
                      disabled={isSelected}
                      className="text-xs font-medium border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#f4f4f4] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                    >
                      {isSelected ? 'Selecionado' : 'Selecionar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
