'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const sections = [
  {
    title: 'Política de Privacidade',
    content: `
**Coleta de Dados**
A PaceSportce coleta apenas os dados necessários para a realização de pedidos e atendimento ao cliente, como nome, e-mail, telefone e endereço de entrega. Não compartilhamos seus dados com terceiros sem consentimento, exceto quando necessário para entrega de produtos.

**Uso dos Dados**
Seus dados são utilizados exclusivamente para: processar pedidos, enviar confirmações, responder dúvidas e, com sua autorização, enviar comunicações sobre promoções e novidades.

**Cookies**
Utilizamos cookies técnicos essenciais para o funcionamento do site. Não utilizamos cookies de rastreamento de terceiros para fins publicitários.

**Seus Direitos**
Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail contato@pacesportce.com.br.

**Segurança**
Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado.
    `.trim(),
  },
  {
    title: 'Política de Troca e Devolução',
    content: `
**Prazo para Troca ou Devolução**
Você tem até 7 dias corridos após o recebimento do produto para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor (Lei 8.078/90).

**Condições do Produto**
O produto deve ser devolvido em perfeito estado, sem sinais de uso, com embalagem original, acompanhado da nota fiscal.

**Como Solicitar**
Entre em contato conosco via WhatsApp ou e-mail informando o número do pedido, o motivo da devolução e fotos do produto. Responderemos em até 2 dias úteis com as instruções para envio.

**Frete de Devolução**
Em caso de produto com defeito ou envio incorreto, o frete de devolução é por nossa conta. Em caso de arrependimento, o frete de retorno é de responsabilidade do cliente.

**Reembolso**
Após recebimento e análise do produto, o reembolso será processado em até 7 dias úteis, via o mesmo meio de pagamento utilizado na compra.

**Produtos Não Elegíveis**
Não aceitamos trocas de equipamentos de proteção individual (EPI) que tenham sido utilizados.
    `.trim(),
  },
  {
    title: 'Política de Entrega e Frete',
    content: `
**Prazo de Envio**
Os pedidos são processados em até 1 dia útil após a confirmação do pagamento. O prazo de entrega varia conforme a modalidade de frete escolhida e o CEP de destino.

**Modalidades de Frete**
Trabalhamos com os Correios (PAC e SEDEX) e transportadoras parceiras. O valor e prazo do frete são calculados no momento da finalização do pedido.

**Retirada em Loja**
Você pode optar por retirar seu pedido diretamente em nossa loja física, sem custo de frete. A retirada pode ser feita em horário comercial após confirmação de disponibilidade.

**Rastreamento**
Após o envio, você receberá o código de rastreamento por e-mail para acompanhar a entrega.

**Avarias no Transporte**
Ao receber seu pedido, verifique se a embalagem está intacta antes de assinar. Em caso de avaria, recuse o recebimento e entre em contato conosco imediatamente.

**Entrega em Área de Risco**
Para endereços em áreas classificadas como risco pelos Correios, pode ser necessário retirar o produto na agência mais próxima.
    `.trim(),
  },
];

function Accordion({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-[#f4f4f4] font-semibold hover:bg-[#1e1e1e] transition-colors"
      >
        {title}
        <ChevronDown
          size={18}
          className={`text-[#888888] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 bg-[#1e1e1e]">
          {content.split('\n\n').map((para, i) => {
            if (para.startsWith('**') && para.indexOf('**', 2) > 2) {
              const end = para.indexOf('**', 2);
              const heading = para.slice(2, end);
              const rest = para.slice(end + 2).trim();
              return (
                <div key={i} className="mt-4 first:mt-0">
                  <p className="text-sm font-semibold text-[#f4f4f4] mb-1">{heading}</p>
                  {rest && <p className="text-sm text-[#888888] leading-relaxed">{rest}</p>}
                </div>
              );
            }
            return (
              <p key={i} className="text-sm text-[#888888] leading-relaxed mt-3">
                {para}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#888888] hover:text-[#f4f4f4] transition-colors">
            ← Voltar à loja
          </Link>
        </div>

        <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#f4f4f4] mb-2">
          Políticas
        </h1>
        <p className="text-[#888888] mb-8">
          Informações sobre privacidade, trocas e entrega da PaceSportce.
        </p>

        <div className="space-y-3">
          {sections.map((section) => (
            <Accordion key={section.title} title={section.title} content={section.content} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
