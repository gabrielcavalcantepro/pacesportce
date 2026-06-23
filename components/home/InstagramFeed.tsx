function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

const placeholders = [
  { text: 'Pedalada no parque' },
  { text: 'Treino de natação' },
  { text: 'Corrida matinal' },
  { text: 'Novo capacete' },
  { text: 'Trail running' },
  { text: 'Chegada na piscina' },
];

export default function InstagramFeed() {
  return (
    <section id="instagram" className="py-20 lg:py-28 bg-[#151515]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-[#888888] uppercase tracking-widest">
            Instagram
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#f4f4f4] mt-2 mb-2">
            @pacesportce
          </h2>
          <p className="text-[#888888]">Siga-nos para novidades, dicas e promoções exclusivas.</p>
        </div>

        {/* 3x2 grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
          {placeholders.map((item, i) => (
            <div
              key={i}
              className="relative aspect-square bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg overflow-hidden flex items-center justify-center group cursor-pointer"
            >
              <div className="absolute inset-0 bg-[#151515]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <InstagramIcon size={24} />
              </div>
              <span className="text-xs text-[#888888] text-center px-2">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://instagram.com/pacesportce"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#f4f4f4] text-[#f4f4f4] font-semibold px-8 py-3 rounded-lg hover:bg-[#f4f4f4] hover:text-[#151515] transition-colors"
          >
            <InstagramIcon size={18} />
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
