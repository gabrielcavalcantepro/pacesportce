import type { Metadata } from 'next';
import { Montserrat, Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { SearchProvider } from '@/context/SearchContext';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'PaceSportce — Acessórios Esportivos',
  description:
    'Loja online de acessórios esportivos para bicicleta, natação e corrida. Qualidade, variedade e atendimento personalizado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${inter.variable}`}
    >
      <body className="bg-[#151515] text-[#f4f4f4] font-sans antialiased min-h-screen flex flex-col">
        <SearchProvider>
          <CartProvider>{children}</CartProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
