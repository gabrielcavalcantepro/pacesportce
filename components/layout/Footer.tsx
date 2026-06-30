import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1e1e1e] border-t border-[#2a2a2a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Image
              src="/assets/logo-branco.webp"
              alt="PaceSportce"
              width={130}
              height={36}
              className="h-8 w-auto object-contain mb-4"
            />
            <p className="text-sm text-[#888888] leading-relaxed">
              Sua loja de acessórios esportivos para bicicleta, natação e corrida.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#f4f4f4] uppercase tracking-wider mb-4">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm text-[#888888]">
              <li><Link href="/#produtos" className="hover:text-[#f4f4f4] transition-colors">Produtos</Link></li>
              <li><Link href="/#sobre" className="hover:text-[#f4f4f4] transition-colors">Sobre nós</Link></li>
              <li><Link href="/#contato" className="hover:text-[#f4f4f4] transition-colors">Contato</Link></li>
              <li><Link href="/politicas" className="hover:text-[#f4f4f4] transition-colors">Políticas</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-[#f4f4f4] uppercase tracking-wider mb-4">
              Redes Sociais
            </h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[#2a2a2a] text-[#888888] hover:text-[#f4f4f4] hover:border-[#f4f4f4] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[#2a2a2a] text-[#888888] hover:text-[#f4f4f4] hover:border-[#f4f4f4] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-[#2a2a2a] text-[#888888] hover:text-[#f4f4f4] hover:border-[#f4f4f4] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#888888]">
          <p>© {year} PaceSportce. Todos os direitos reservados.</p>
          <Link href="/politicas" className="hover:text-[#f4f4f4] transition-colors">
            Políticas de Privacidade, Troca e Frete
          </Link>
        </div>
      </div>
    </footer>
  );
}
