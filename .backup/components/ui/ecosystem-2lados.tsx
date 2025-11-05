"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Music, Coins } from "lucide-react";

function Ecosystem2Lados() {
  const ecosystemParts = [
    {
      icon: Building2,
      title: "2 LADOS: A Casa-Mãe",
      subtitle: "O pilar físico e técnico do ecossistema. Onde a ideia ganha corpo.",
      description: "A 2 LADOS é o estúdio criativo que disponibiliza:",
      features: [
        "Serviços visuais, sonoros e digitais (com ou sem IA)",
        "Aluguer de material técnico e estúdios profissionais",
        "Equipa humana especializada, com sensibilidade e escuta",
        "Rede de parceiros criativos em expansão"
      ],
      footer: "É o lugar onde a experiência humana encontra a inovação tecnológica. Onde trabalhas com pessoas reais que dominam tanto a arte quanto as ferramentas.",
      cta: "Saber Mais"
    },
    {
      icon: Music,
      title: "Kyntal: Distribuição Musical Global",
      subtitle: "Distribuição musical profissional. Lança a tua música nas principais plataformas globais.",
      description: "À medida que atinges metas na Kyntal, ganhas DUA Coin que podes reinvestir diretamente na tua carreira ou apoiar novos talentos. Recebes royalties tradicionais e DUA Coin, criando um ciclo único de valor à tua volta.",
      features: [],
      footer: "",
      cta: "Saber Mais"
    },
    {
      icon: Coins,
      title: "DUA Coin: A Economia Criativa",
      subtitle: "A DUA Coin é a moeda criativa do ecossistema 2 LADOS, um ativo real que apoia artistas e financia Bolsas Criativas.",
      description: "Crescimento Transparente:",
      features: [
        "Fase 1: €0.30 (Lançamento e primeiras bolsas)",
        "Fase 2: €0.60 (Expansão da comunidade)",
        "Fase 3: €1.20 (App própria KONEKTA + espaço físico 2 LADOS)"
      ],
      footer: "Cada DUA Coin movimenta talento, tecnologia e impacto social real.",
      cta: "Saber Mais"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 lg:space-y-28">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.2 }}
        className="text-center space-y-8"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white tracking-tight leading-[1.08] px-4">
          O Ecossistema 2 LADOS
        </h2>
        <p className="text-xl sm:text-2xl lg:text-3xl text-white/70 font-light max-w-4xl mx-auto leading-relaxed px-4">
          A DUA não trabalha sozinha. Faz parte de um ecossistema completo que te leva da ideia ao mercado.
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl text-white/60 font-light max-w-5xl mx-auto leading-relaxed px-4 pt-4">
          A 2 LADOS é um ecossistema criativo híbrido e lusófono, com raiz social e mentalidade de futuro. 
          Unimos inteligência artificial, talento humano e uma economia própria para transformar a criatividade 
          em valor real: para quem cria, para quem apoia e para quem precisa.
        </p>
      </motion.div>

      {/* Ecosystem Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {ecosystemParts.map((part, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1.3, 
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.15 
            }}
            viewport={{ once: true, amount: 0.2 }}
            className="group relative"
          >
            <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 lg:p-10 space-y-6 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-500">
                <part.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight leading-tight">
                  {part.title}
                </h3>
                <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed">
                  {part.subtitle}
                </p>
              </div>

              {/* Description */}
              {part.description && (
                <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                  {part.description}
                </p>
              )}

              {/* Features List */}
              {part.features.length > 0 && (
                <ul className="space-y-3 pt-2">
                  {part.features.map((feature, idx) => (
                    <li 
                      key={idx}
                      className="text-sm sm:text-base text-white/60 font-light leading-relaxed flex items-start gap-3"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer */}
              {part.footer && (
                <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed italic pt-2">
                  {part.footer}
                </p>
              )}

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="group/btn w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm font-light text-sm sm:text-base px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    {part.cta}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Button>
              </div>

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { Ecosystem2Lados };
