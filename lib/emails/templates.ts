import type { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils/price';
import { PAYMENT_METHOD_LABELS } from '@/lib/utils/orderLabels';

const RASTREIO_URL = 'https://pacesportsce.vercel.app/rastreio';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PaceSportce</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0f0f0f;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#1e1e1e;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;text-align:center;border-bottom:1px solid #2a2a2a;">
                <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">PaceSportce</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #2a2a2a;text-align:center;">
                <p style="margin:0;font-size:12px;color:#555555;">PaceSportce | contato@pacesportsce.com.br</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
    <tr>
      <td style="border-radius:8px;background-color:#f4f4f4;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#151515;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function iconBadge(symbol: string, color: string): string {
  return `<div style="width:56px;height:56px;line-height:56px;border-radius:50%;background-color:${color}1a;color:${color};font-size:26px;font-weight:700;margin:0 auto 16px;text-align:center;">${symbol}</div>`;
}

export function emailPedidoConfirmado(data: {
  customerName: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
}): string {
  const itemsRows = data.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#f4f4f4;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#888888;text-align:center;white-space:nowrap;">${item.quantity}x</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#f4f4f4;text-align:right;white-space:nowrap;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const paymentLabel = PAYMENT_METHOD_LABELS[data.paymentMethod] ?? 'Outro';

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      ${iconBadge('&#10003;', '#22c55e')}
      <h1 style="margin:0 0 8px;font-size:22px;color:#f4f4f4;">Pedido Confirmado!</h1>
      <p style="margin:0;font-size:14px;color:#888888;">Olá, ${escapeHtml(data.customerName)}! Seu pedido foi recebido e o pagamento confirmado.</p>
    </div>

    <div style="background-color:#151515;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#888888;">Número do pedido</p>
      <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#f4f4f4;">${escapeHtml(data.orderNumber)}</p>
      <p style="margin:0 0 4px;font-size:12px;color:#888888;">Forma de pagamento</p>
      <p style="margin:0;font-size:14px;color:#f4f4f4;">${escapeHtml(paymentLabel)}</p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsRows}
      <tr>
        <td style="padding-top:14px;font-size:16px;font-weight:700;color:#f4f4f4;">Total</td>
        <td></td>
        <td style="padding-top:14px;font-size:18px;font-weight:700;color:#f4f4f4;text-align:right;">${formatPrice(data.total)}</td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:#888888;text-align:center;">Em breve seu pedido será preparado e enviado.</p>
    <div style="text-align:center;">${button('Acompanhar meu pedido', RASTREIO_URL)}</div>
  `;

  return emailLayout(content);
}

export function emailPedidoEnviado(data: {
  customerName: string;
  orderNumber: string;
  trackingCode: string;
  carrier: string;
}): string {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;line-height:1;margin-bottom:16px;">&#128230;</div>
      <h1 style="margin:0 0 8px;font-size:22px;color:#f4f4f4;">Seu pedido foi enviado!</h1>
      <p style="margin:0;font-size:14px;color:#888888;">Olá, ${escapeHtml(data.customerName)}! Seu pedido ${escapeHtml(data.orderNumber)} saiu para entrega.</p>
    </div>

    <div style="background-color:#151515;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin-bottom:8px;">
      <p style="margin:0 0 4px;font-size:12px;color:#888888;">Transportadora</p>
      <p style="margin:0 0 12px;font-size:14px;color:#f4f4f4;">${escapeHtml(data.carrier)}</p>
      <p style="margin:0 0 4px;font-size:12px;color:#888888;">Código de rastreio</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:#f4f4f4;font-family:'Courier New', Courier, monospace;letter-spacing:1px;">${escapeHtml(data.trackingCode)}</p>
    </div>

    <p style="margin:24px 0 0;font-size:13px;color:#888888;text-align:center;">Digite o número do pedido (${escapeHtml(data.orderNumber)}) na página de rastreio.</p>
    <div style="text-align:center;">${button('Rastrear meu pedido', RASTREIO_URL)}</div>
  `;

  return emailLayout(content);
}

export function emailPedidoCancelado(data: {
  customerName: string;
  orderNumber: string;
  whatsapp: string;
}): string {
  const whatsappDigits = data.whatsapp.replace(/\D/g, '');

  const content = `
    <div style="text-align:center;">
      ${iconBadge('&#10005;', '#ef4444')}
      <h1 style="margin:0 0 16px;font-size:22px;color:#f4f4f4;">Pedido Cancelado</h1>
      <p style="margin:0 0 8px;font-size:14px;color:#888888;">Olá, ${escapeHtml(data.customerName)}. Seu pedido ${escapeHtml(data.orderNumber)} foi cancelado.</p>
      <p style="margin:0;font-size:14px;color:#888888;">Dúvidas? Entre em contato pelo WhatsApp.</p>
      ${button('Falar no WhatsApp', `https://wa.me/${whatsappDigits}`)}
    </div>
  `;

  return emailLayout(content);
}
