import { Resend } from 'resend';
import {
  emailPedidoConfirmado,
  emailPedidoEnviado,
  emailPedidoCancelado,
} from './emails/templates';
import type { CartItem } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? 'contato@pacesportsce.com.br';

export async function sendEmailPedidoConfirmado(data: {
  to: string;
  customerName: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
}) {
  try {
    const { error } = await resend.emails.send({
      from: `PaceSportce <${FROM}>`,
      to: data.to,
      subject: `Pedido ${data.orderNumber} confirmado! ✓`,
      html: emailPedidoConfirmado(data),
    });
    if (error) console.error('Erro ao enviar e-mail de confirmação:', error);
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação:', error);
  }
}

export async function sendEmailPedidoEnviado(data: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingCode: string;
  carrier: string;
}) {
  try {
    const { error } = await resend.emails.send({
      from: `PaceSportce <${FROM}>`,
      to: data.to,
      subject: `Seu pedido ${data.orderNumber} foi enviado! 📦`,
      html: emailPedidoEnviado(data),
    });
    if (error) console.error('Erro ao enviar e-mail de envio:', error);
  } catch (error) {
    console.error('Erro ao enviar e-mail de envio:', error);
  }
}

export async function sendEmailPedidoCancelado(data: {
  to: string;
  customerName: string;
  orderNumber: string;
  whatsapp: string;
}) {
  try {
    const { error } = await resend.emails.send({
      from: `PaceSportce <${FROM}>`,
      to: data.to,
      subject: `Pedido ${data.orderNumber} cancelado`,
      html: emailPedidoCancelado(data),
    });
    if (error) console.error('Erro ao enviar e-mail de cancelamento:', error);
  } catch (error) {
    console.error('Erro ao enviar e-mail de cancelamento:', error);
  }
}
