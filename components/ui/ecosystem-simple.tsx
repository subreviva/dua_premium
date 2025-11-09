"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Music, Coins } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface EcosystemPillar {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  phase?: string;
}

interface EcosystemSimpleProps {
  pillars: EcosystemPillar[];
}

export const EcosystemSimple = ({ pillars }: EcosystemSimpleProps) => {
  const [mounted, setMounted] = React.useState(false);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight text-white tracking-tight leading-[1.08]">
            O Ecossistema 2 LADOS
          </h2>
          <p className="text-xl sm:text-2xl text-white/70 font-light max-w-4xl mx-auto leading-relaxed">
            A DUA não trabalha sozinha. Faz parte de um ecossistema completo que te leva da ideia ao mercado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-left md:text-center space-y-6 sm:space-y-8 mb-10 sm:mb-12 lg:mb-16 px-4 md:px-0">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-extralight text-white tracking-tight leading-[0.9]"
        >
          <span className="block bg-gradient-to-br from-white via-white/95 to-white/80 bg-clip-text text-transparent md:bg-none md:text-white">
            O Ecossistema 2 LADOS
          </span>
        </motion.h2>
        
        {/* Underline - mobile only */}
        <div className="h-1.5 w-40 bg-gradient-to-r from-white/80 via-white/50 to-transparent rounded-full md:hidden" />
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-white/70 font-light max-w-3xl md:max-w-4xl md:mx-auto leading-relaxed"
        >
          A DUA não trabalha sozinha. Faz parte de um ecossistema completo que te leva da ideia ao mercado.
        </motion.p>
      </div>

      {/* MOBILE VERSION - Carrossel horizontal */}
      <div className="md:hidden mb-10">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
            skipSnaps: false,
          }}
          className="w-full touch-pan-x"
        >
          <CarouselContent className="ml-4">
            {pillars.map((pillar, index) => (
              <CarouselItem key={index} className="pl-4 basis-[90%] sm:basis-[85%]">
                <motion.a
                  href="#"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1],
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-500 hover:bg-white/10 hover:border-white/20 shadow-2xl h-[580px]"
                >
                  {/* Image */}
                  <div className="relative h-[280px] overflow-hidden flex-shrink-0">
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

                    {/* Icon Badge */}
                    <div className="absolute top-4 left-4 w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">
                      <pillar.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Phase Badge */}
                    {pillar.phase && (
                      <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-sm font-light text-white shadow-lg">
                        {pillar.phase}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1 justify-between">
                    <div className="space-y-5">
                      <h3 className="text-2xl sm:text-3xl font-extralight text-white tracking-tight leading-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-base text-white/70 font-light leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-base font-light text-white/80 mt-6 group-hover:text-white transition-colors duration-300">
                      Saber Mais
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Hover gradient */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* DESKTOP VERSION - Grid of 3 Pillars */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {pillars.map((pillar, index) => (
          <motion.a
            key={index}
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.1,
            }}
            viewport={{ once: true, amount: 0.2 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
          >
            {/* Image */}
            <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
              <img
                src={pillar.image}
                alt={pillar.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

              {/* Icon Badge */}
              <div className="absolute top-6 left-6 w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-500">
                <pillar.icon className="w-7 h-7 text-white" />
              </div>

              {/* Phase Badge */}
              {pillar.phase && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-sm font-light text-white">
                  {pillar.phase}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col flex-grow">
              <div className="flex-grow space-y-4">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight leading-tight">
                  {pillar.title}
                </h3>
                <p className="text-base sm:text-lg text-white/60 font-light leading-relaxed line-clamp-4">
                  {pillar.description}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-base font-light text-white/80 mt-8 group-hover:text-white transition-colors duration-300">
                Saber Mais
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>

            {/* Hover gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.a>
        ))}
      </div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-center text-base sm:text-lg text-white/50 font-light mt-12 sm:mt-16 lg:mt-20 max-w-3xl mx-auto leading-relaxed"
      >
        A 2 LADOS é um ecossistema criativo híbrido e lusófono, com raiz social e mentalidade de futuro.
      </motion.p>
    </div>
  );
};
