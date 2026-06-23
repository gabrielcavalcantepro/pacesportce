import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="relative bg-[#1e1e1e] overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #f4f4f4 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-semibold text-[#888888] uppercase tracking-widest mb-4 border border-[#2a2a2a] rounded-full px-3 py-1">
            Bicicleta · Natação · Corrida
          </span>
          <h1 className="font-display text-5xl lg:text-7xl font-extrabold text-[#f4f4f4] leading-tight mb-6">
            Equipe-se para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4f4f4] to-[#888888]">
              ir mais longe
            </span>
          </h1>
          <p className="text-lg text-[#888888] leading-relaxed mb-10 max-w-xl">
            Acessórios esportivos selecionados para atletas que levam o desempenho a sério.
            Qualidade, variedade e preço justo.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/#produtos"
              className="inline-flex items-center gap-2 bg-[#f4f4f4] text-[#151515] font-semibold px-8 py-3 rounded-lg hover:bg-white transition-colors"
            >
              Ver Produtos
            </Link>
            <Link
              href="/#sobre"
              className="inline-flex items-center gap-2 border border-[#2a2a2a] text-[#f4f4f4] font-semibold px-8 py-3 rounded-lg hover:border-[#f4f4f4] transition-colors"
            >
              Conheça a loja
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
