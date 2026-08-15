'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Copy, Eye, Loader2, MoreVertical, Printer, RefreshCw } from 'lucide-react';
import { ORDER_STATUS_LABEL } from '@/lib/utils/orderLabels';
import type { Order } from '@/lib/types';

const STATUS_ORDER: Order['status'][] = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
];

type Props = {
  order: Order;
  onStatusChange: (status: Order['status']) => void;
};

export default function OrderRowActions({ order, onStatusChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [labelUrl, setLabelUrl] = useState<string | null>(order.label_url ?? null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setStatusMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleGerarEtiqueta() {
    setLabelLoading(true);
    setLabelError(null);
    try {
      const res = await fetch('/api/melhorenvio/gerar-etiqueta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setLabelError(data.error ?? 'Erro ao gerar etiqueta.');
        return;
      }
      setLabelUrl(data.label_url);
    } catch {
      setLabelError('Erro ao gerar etiqueta. Tente novamente.');
    } finally {
      setLabelLoading(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="text-[#888888] hover:text-[#f4f4f4] transition-colors p-1"
        aria-label="Mais ações"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 w-60 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-lg z-20 py-1">
          <Link
            href={`/admin/pedidos/${order.id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#f4f4f4] hover:bg-[#2a2a2a] transition-colors"
          >
            <Eye size={14} /> Ver detalhes
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#f4f4f4] hover:bg-[#2a2a2a] transition-colors w-full text-left"
            >
              <RefreshCw size={14} /> Mudar status
            </button>
            {statusMenuOpen && (
              <div className="absolute right-full top-0 mr-1 w-48 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-lg py-1">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onStatusChange(s);
                      setStatusMenuOpen(false);
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-[#f4f4f4] hover:bg-[#2a2a2a] transition-colors"
                  >
                    {ORDER_STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {labelUrl ? (
            <a
              href={labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#22c55e] hover:bg-[#2a2a2a] transition-colors"
            >
              <Printer size={14} /> Imprimir Etiqueta
            </a>
          ) : (
            <button
              type="button"
              onClick={handleGerarEtiqueta}
              disabled={labelLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#f4f4f4] hover:bg-[#2a2a2a] transition-colors w-full text-left disabled:opacity-60"
            >
              {labelLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Printer size={14} />
              )}
              Gerar Etiqueta
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#f4f4f4] hover:bg-[#2a2a2a] transition-colors w-full text-left"
          >
            <Copy size={14} /> {copied ? 'Copiado!' : 'Copiar número do pedido'}
          </button>

          {labelError && <p className="px-4 py-2 text-xs text-[#ef4444]">{labelError}</p>}
        </div>
      )}
    </div>
  );
}
