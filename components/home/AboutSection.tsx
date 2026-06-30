import { ShieldCheck, Layers, Headphones } from 'lucide-react';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Qualidade',
    description:
      'Produtos rigorosamente selecionados de marcas confiáveis, com garantia e aprovação técnica.',
  },
  {
    icon: Layers,
    title: 'Variedade',
    description:
      'Do capacete ao tênis, da touca ao cinto de hidratação — tudo em um só lugar.',
  },
  {
    icon: Headphones,
    title: 'Atendimento',
    description:
      'Equipe especializada pronta para ajudar você a escolher o equipamento ideal.',
  },
];

export default function AboutSection() {
  return (
    <section id="sobre" className="py-20 lg:py-28 bg-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span className="text-xs font-semibold text-[#888888] uppercase tracking-widest">
              Quem somos
            </span>
            <h2 className="font-display text-[22px] sm:text-[28px] lg:text-[36px] font-bold text-[#f4f4f4] mt-2 mb-6">
              Sobre a PaceSportce
            </h2>
            <p className="text-sm lg:text-base text-[#888888] leading-relaxed mb-4">
              Nascemos da paixão pelo esporte e do desejo de tornar equipamentos de qualidade
              acessíveis a todos — do atleta iniciante ao competidor experiente.
            </p>
            <p className="text-sm lg:text-base text-[#888888] leading-relaxed">
              Trabalhamos com bicicletas, acessórios de natação e corrida, além de peças de
              reposição e bicicletas semi-novas revisadas. Cada produto passa por nossa curadoria
              antes de chegar até você.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid gap-6">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-5 bg-[#151515] border border-[#2a2a2a] rounded-lg"
              >
                <div className="shrink-0 w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                  <Icon size={20} className="text-[#f4f4f4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#f4f4f4] mb-1">{title}</h3>
                  <p className="text-sm text-[#888888] leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
