'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getOrderByNumber } from '@/lib/queries/public';
import { formatPrice } from '@/lib/utils/price';
import type { Order } from '@/lib/types';
import type { RastreioResultado } from '@/lib/melhorenvio';

const STATUS_CONFIG: Record<Order['status'], { label: string; className: string }> = {
  pending: { label: 'Aguardando confirmação', className: 'bg-[#f59e0b]/15 text-[#f59e0b]' },
  confirmed: { label: 'Pedido confirmado', className: 'bg-[#3b82f6]/15 text-[#3b82f6]' },
  preparing: { label: 'Em preparação', className: 'bg-[#a855f7]/15 text-[#a855f7]' },
  shipped: { label: 'Enviado', className: 'bg-[#f97316]/15 text-[#f97316]' },
  delivered: { label: 'Entregue', className: 'bg-[#22c55e]/15 text-[#22c55e]' },
  cancelled: { label: 'Cancelado', className: 'bg-[#ef4444]/15 text-[#ef4444]' },
};

export default function RastreioPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tracking, setTracking] = useState<RastreioResultado | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setSearched(true);
    setTracking(null);
    const result = await getOrderByNumber(orderNumber.trim());
    setOrder(result);
    setLoading(false);

    if (result?.tracking_code) {
      setTrackingLoading(true);
      try {
        const res = await fetch(`/api/rastreio?codigo=${encodeURIComponent(result.tracking_code)}`);
        const data = await res.json();
        setTracking(res.ok && !data.error ? data : null);
      } catch {
        setTracking(null);
      } finally {
        setTrackingLoading(false);
      }
    }
  }

  async function handleCopy() {
    if (!order?.tracking_code) return;
    await navigator.clipboard.writeText(order.tracking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header />
      <main className="flex-1 w-full min-h-screen bg-[#151515] flex flex-col items-center px-4 py-16">
        <h1 className="font-display text-2xl font-bold text-[#f4f4f4] mb-8">Rastrear Pedido</h1>

        <div className="w-full max-w-lg bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm text-[#888888] mb-1.5">
                Digite o número do pedido
              </label>
              <input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="PCS-20250601-1234"
                className="w-full bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f4] outline-none focus:border-[#f4f4f4] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f4f4f4] text-[#151515] font-medium rounded-lg py-2.5 text-sm disabled:opacity-60 transition-opacity"
            >
              {loading ? 'Buscando...' : 'Rastrear'}
            </button>
          </form>

          {searched && !loading && !order && (
            <p className="text-sm text-[#ef4444] mt-4">
              Pedido não encontrado. Verifique o número e tente novamente.
            </p>
          )}
        </div>

        {order && (
          <div className="w-full max-w-lg bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-8 mt-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#888888]">Pedido</p>
                <p className="text-lg font-semibold text-[#f4f4f4]">{order.order_number}</p>
              </div>
              <span
                className={`text-xs font-medium rounded-full px-3 py-1.5 shrink-0 ${STATUS_CONFIG[order.status].className}`}
              >
                {STATUS_CONFIG[order.status].label}
              </span>
            </div>

            {order.tracking_code && (
              <div>
                <p className="text-xs text-[#888888] mb-1.5">Código de rastreio</p>
                <div className="flex items-center gap-2 bg-[#151515] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
                  <span className="flex-1 text-sm text-[#f4f4f4]">{order.tracking_code}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-[#888888] hover:text-[#f4f4f4] transition-colors"
                    aria-label="Copiar código de rastreio"
                  >
                    {copied ? <Check size={16} className="text-[#22c55e]" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-[#888888] mb-1">Data do pedido</p>
              <p className="text-sm text-[#f4f4f4]">
                {new Date(order.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#888888] mb-2">Itens</p>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm gap-4">
                    <span className="text-[#f4f4f4]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-[#888888] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#2a2a2a]">
              <span className="text-sm font-semibold text-[#f4f4f4]">Total</span>
              <span className="text-sm font-semibold text-[#f4f4f4]">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        {order && (
          <div className="w-full max-w-lg bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-8 mt-6">
            <h2 className="text-base font-semibold text-[#f4f4f4] mb-6">
              Histórico de Rastreamento
            </h2>

            {!order.tracking_code ? (
              <p className="text-sm text-[#888888]">
                Código de rastreio ainda não disponível. Acompanhe seu email para atualizações.
              </p>
            ) : trackingLoading ? (
              <p className="text-sm text-[#888888]">Buscando informações de rastreio...</p>
            ) : tracking && tracking.events.length > 0 ? (
              <div className="border-l-2 border-[#2a2a2a] ml-3 space-y-6">
                {tracking.events.map((event, i) => (
                  <div key={i} className="relative pl-6">
                    <span
                      className={`absolute -left-[7px] top-0.5 w-3 h-3 rounded-full border-2 border-[#1e1e1e] ${
                        i === 0 ? 'bg-[#f4f4f4]' : 'bg-[#2a2a2a]'
                      }`}
                    />
                    <p className="text-sm font-medium text-[#f4f4f4]">{event.status}</p>
                    {event.description && (
                      <p className="text-sm text-[#888888] mt-0.5">{event.description}</p>
                    )}
                    <p className="text-xs text-[#888888] mt-1">
                      {event.date}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#888888]">
                Nenhuma atualização de rastreio disponível no momento.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
