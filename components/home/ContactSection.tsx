'use client';

import { useState } from 'react';
import { MessageCircle, MapPin, Clock, Mail } from 'lucide-react';

export default function ContactSection() {
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Fase 1: apenas simula o envio
    setSent(true);
    setForm({ nome: '', email: '', mensagem: '' });
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <section id="contato" className="py-20 lg:py-28 bg-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#888888] uppercase tracking-widest">
            Fale conosco
          </span>
          <h2 className="font-display text-[22px] sm:text-[28px] lg:text-[36px] font-bold text-[#f4f4f4] mt-2">
            Contato
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            {sent ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#f4f4f4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={20} className="text-[#151515]" />
                  </div>
                  <p className="text-[#f4f4f4] font-semibold">Mensagem enviada!</p>
                  <p className="text-[#888888] text-sm mt-1">Retornaremos em breve.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1.5" htmlFor="nome">
                    Nome
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="w-full bg-[#151515] border border-[#2a2a2a] text-[#f4f4f4] placeholder-[#888888] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#888888] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1.5" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full bg-[#151515] border border-[#2a2a2a] text-[#f4f4f4] placeholder-[#888888] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#888888] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1.5" htmlFor="mensagem">
                    Mensagem
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    required
                    value={form.mensagem}
                    onChange={handleChange}
                    placeholder="Como podemos ajudar?"
                    rows={5}
                    className="w-full bg-[#151515] border border-[#2a2a2a] text-[#f4f4f4] placeholder-[#888888] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#888888] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#f4f4f4] text-[#151515] font-semibold py-3 rounded-lg hover:bg-white transition-colors"
                >
                  Enviar Mensagem
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-[#151515] border border-[#2a2a2a] rounded-lg hover:border-[#888888] transition-colors"
            >
              <div className="w-10 h-10 bg-[#25D366]/10 rounded-lg flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-[#25D366]" />
              </div>
              <div>
                <p className="font-semibold text-[#f4f4f4]">WhatsApp</p>
                <p className="text-sm text-[#888888]">Atendimento rápido via WhatsApp</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-5 bg-[#151515] border border-[#2a2a2a] rounded-lg">
              <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-[#f4f4f4]" />
              </div>
              <div>
                <p className="font-semibold text-[#f4f4f4] mb-1">Endereço</p>
                <p className="text-sm text-[#888888]">
                  Rua dos Esportes, 123<br />
                  Bairro Centro — Sua Cidade, CE<br />
                  CEP 00000-000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-[#151515] border border-[#2a2a2a] rounded-lg">
              <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center shrink-0">
                <Clock size={20} className="text-[#f4f4f4]" />
              </div>
              <div>
                <p className="font-semibold text-[#f4f4f4] mb-1">Horário de Funcionamento</p>
                <p className="text-sm text-[#888888]">
                  Segunda a Sexta: 9h – 18h<br />
                  Sábado: 9h – 13h<br />
                  Domingo: Fechado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
