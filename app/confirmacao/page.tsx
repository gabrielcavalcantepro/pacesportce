'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  CheckCircle,
  Copy,
  ExternalLink,
  FileText,
  MessageCircle,
  QrCode,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getOrderByNumber, getPublicSettings } from '@/lib/queries/public';
import { formatPrice } from '@/lib/utils/price';
import type { Order } from '@/lib/types';

type PixData = {
  qr_code?: string;
  qr_code_base64?: string;
  ticket_url?: string;
};

type BoletoData = {
  ticket_url?: string;
  barcode?: string;
};

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center w-20 h-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full mx-auto mb-6">
      {children}
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="text-[#888888]">Carregando...</p>
          </main>
          <Footer />
        </>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const method = searchParams.get('method');
  const status = searchParams.get('status');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [copied, setCopied] = useState<'pix' | 'boleto' | null>(null);

  useEffect(() => {
    const storedPix = sessionStorage.getItem('pix_data');
    if (storedPix) {
      setPixData(JSON.parse(storedPix));
      sessionStorage.removeItem('pix_data');
    }
    const storedBoleto = sessionStorage.getItem('boleto_data');
    if (storedBoleto) {
      setBoletoData(JSON.parse(storedBoleto));
      sessionStorage.removeItem('boleto_data');
    }
  }, []);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    Promise.all([getOrderByNumber(orderNumber), getPublicSettings()]).then(([o, settings]) => {
      setOrder(o);
      setWhatsapp(settings.whatsapp ?? '');
      setLoading(false);
    });
  }, [orderNumber]);

  const isPix = method === 'pix' || method === 'bank_transfer';
  const isBoleto = method === 'boleto' || method === 'ticket';
  const isPaid = order
    ? ['approved', 'processed', 'accredited'].includes(order.payment_status ?? '')
    : false;

  // PIX e boleto confirmam de forma assíncrona (via webhook), então a página fica
  // consultando o pedido periodicamente até o pagamento aparecer confirmado —
  // sem isso, a tela ficava presa em "Aguardando pagamento" mesmo depois de pago.
  useEffect(() => {
    if (!orderNumber || (!isPix && !isBoleto) || isPaid) return;

    const interval = setInterval(() => {
      getOrderByNumber(orderNumber).then((updated) => {
        if (updated) setOrder(updated);
      });
    }, 4000);

    // Para de verificar depois de 5 minutos para não consultar pra sempre numa
    // aba esquecida aberta.
    const timeout = setTimeout(() => clearInterval(interval), 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderNumber, isPix, isBoleto, isPaid]);

  async function handleCopy(text: string, which: 'pix' | 'boleto') {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  const whatsappMessage = encodeURIComponent(
    `Olá! Acabei de fazer o pedido ${orderNumber ?? ''} na PaceSportce. Gostaria de tirar uma dúvida.`
  );

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-[#888888]">Carregando...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!orderNumber || !order) {
    return (
      <>
        <Header />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="font-display text-2xl font-bold text-[#f4f4f4] mb-3">
            Pedido não encontrado
          </h1>
          <p className="text-[#888888] mb-8">
            Não foi possível localizar os detalhes deste pedido.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#f4f4f4] text-[#151515] font-semibold px-8 py-3 rounded-lg hover:bg-white transition-colors"
          >
            <ShoppingBag size={18} />
            Voltar à Loja
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const isCard = method === 'credit_card' || method === 'debitCard';
  const cardApproved = isCard && ['processed', 'accredited', 'approved'].includes(status ?? '');
  const cardNotApproved = isCard && !cardApproved;

  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {isPix && isPaid && (
          <>
            <IconWrap>
              <CheckCircle size={40} className="text-[#22c55e]" />
            </IconWrap>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
              Pagamento confirmado!
            </h1>
            <span className="inline-block text-xs font-medium text-[#22c55e] bg-[#22c55e]/15 px-3 py-1.5 rounded-full mb-10">
              Pagamento Aprovado
            </span>
          </>
        )}

        {isPix && !isPaid && (
          <>
            <IconWrap>
              <QrCode size={40} className="text-[#f4f4f4]" />
            </IconWrap>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
              Pedido realizado! Pague via PIX para confirmar.
            </h1>

            {pixData?.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                alt="QR Code PIX"
                className="w-48 h-48 mx-auto mb-4 rounded-lg border border-[#2a2a2a] bg-white p-2"
              />
            )}

            {pixData?.qr_code && (
              <div className="text-left mb-4">
                <p className="text-xs text-[#888888] mb-1.5">Código Copia e Cola</p>
                <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
                  <span className="flex-1 text-xs text-[#f4f4f4] font-mono truncate">
                    {pixData.qr_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(pixData.qr_code!, 'pix')}
                    className="text-[#888888] hover:text-[#f4f4f4] transition-colors shrink-0"
                    aria-label="Copiar código PIX"
                  >
                    {copied === 'pix' ? (
                      <Check size={16} className="text-[#22c55e]" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {pixData?.ticket_url && (
              <a
                href={pixData.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#f4f4f4] text-[#151515] font-semibold px-8 py-3 rounded-lg hover:bg-white transition-colors mb-4"
              >
                <ExternalLink size={18} />
                Abrir no app do banco
              </a>
            )}

            <p className="text-[#888888] mb-4 leading-relaxed">
              Abra o app do seu banco, acesse a área PIX e escolha &quot;Pagar com QR Code ou Copia
              e Cola&quot; para concluir o pagamento.
            </p>
            <span className="inline-block text-xs font-medium text-[#f59e0b] bg-[#f59e0b]/15 px-3 py-1.5 rounded-full mb-4">
              Aguardando pagamento
            </span>
            <p className="text-xs text-[#888888] mb-10">
              O pedido será confirmado automaticamente após o pagamento.
            </p>
          </>
        )}

        {cardApproved && (
          <>
            <IconWrap>
              <CheckCircle size={40} className="text-[#22c55e]" />
            </IconWrap>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
              Seu pedido foi confirmado!
            </h1>
            <span className="inline-block text-xs font-medium text-[#22c55e] bg-[#22c55e]/15 px-3 py-1.5 rounded-full mb-10">
              Pagamento Aprovado
            </span>
          </>
        )}

        {cardNotApproved && (
          <>
            <IconWrap>
              <XCircle size={40} className="text-[#ef4444]" />
            </IconWrap>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
              Pagamento não aprovado. Tente outro cartão ou meio de pagamento.
            </h1>
            <span className="inline-block text-xs font-medium text-[#ef4444] bg-[#ef4444]/15 px-3 py-1.5 rounded-full mb-6">
              Não aprovado
            </span>
            <div>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 bg-[#f4f4f4] text-[#151515] font-semibold px-8 py-3 rounded-lg hover:bg-white transition-colors mb-10"
              >
                Tentar novamente
              </Link>
            </div>
          </>
        )}

        {isBoleto && isPaid && (
          <>
            <IconWrap>
              <CheckCircle size={40} className="text-[#22c55e]" />
            </IconWrap>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
              Pagamento confirmado!
            </h1>
            <span className="inline-block text-xs font-medium text-[#22c55e] bg-[#22c55e]/15 px-3 py-1.5 rounded-full mb-10">
              Pagamento Aprovado
            </span>
          </>
        )}

        {isBoleto && !isPaid && (
          <>
            <IconWrap>
              <FileText size={40} className="text-[#f4f4f4]" />
            </IconWrap>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
              Boleto gerado!
            </h1>

            {boletoData?.ticket_url && (
              <a
                href={boletoData.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#f4f4f4] text-[#151515] font-semibold px-8 py-3 rounded-lg hover:bg-white transition-colors mb-4"
              >
                <ExternalLink size={18} />
                Visualizar Boleto
              </a>
            )}

            {boletoData?.barcode && (
              <div className="text-left mb-4">
                <p className="text-xs text-[#888888] mb-1.5">Código de barras</p>
                <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
                  <span className="flex-1 text-xs text-[#f4f4f4] font-mono break-all">
                    {boletoData.barcode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(boletoData.barcode!, 'boleto')}
                    className="text-[#888888] hover:text-[#f4f4f4] transition-colors shrink-0"
                    aria-label="Copiar código de barras"
                  >
                    {copied === 'boleto' ? (
                      <Check size={16} className="text-[#22c55e]" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[#888888] mb-4 leading-relaxed">
              Pague o boleto em qualquer banco ou lotérica em até 3 dias úteis.
            </p>
            <span className="inline-block text-xs font-medium text-[#f59e0b] bg-[#f59e0b]/15 px-3 py-1.5 rounded-full mb-10">
              Aguardando pagamento
            </span>
          </>
        )}

        {!isPix && !isBoleto && !isCard && (
          <>
            <IconWrap>
              <CheckCircle size={40} className="text-[#f4f4f4]" />
            </IconWrap>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-3">
              Pedido recebido!
            </h1>
            <p className="text-[#888888] mb-10 leading-relaxed">
              Obrigado pela sua compra. Acompanhe as atualizações do seu pedido em breve.
            </p>
          </>
        )}

        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-6 mb-8 text-left">
          <p className="text-xs text-[#888888] mb-1">Número do pedido</p>
          <p className="text-lg font-semibold text-[#f4f4f4] mb-6">{order.order_number}</p>

          <h2 className="font-semibold text-[#f4f4f4] mb-4">Itens do Pedido</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-[#151515] border border-[#2a2a2a] shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f4f4f4] truncate">
                    {item.name} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm text-[#f4f4f4] shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex justify-between font-bold">
            <span className="text-[#f4f4f4]">Total</span>
            <span className="text-[#f4f4f4]">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://wa.me/${whatsapp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#20ba59] transition-colors"
          >
            <MessageCircle size={18} />
            Dúvidas? Fale pelo WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-[#2a2a2a] text-[#f4f4f4] font-semibold px-8 py-3 rounded-lg hover:border-[#888888] transition-colors"
          >
            <ShoppingBag size={18} />
            Continuar comprando
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
