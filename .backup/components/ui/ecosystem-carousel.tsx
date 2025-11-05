"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Music, Coins, Sparkles } from "lucide-react";

interface EcosystemPillar {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  footer?: string;
  image: string;
  phase?: string;
}

interface EcosystemCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  pillars: EcosystemPillar[];
}

export const EcosystemCarousel = React.forwardRef<HTMLDivElement, EcosystemCarouselProps>(
  ({ className, pillars, ...props }, ref) => {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (!api) return;
      api.on("select", () => {
        setCurrent(api.selectedScrollSnap());
      });
    }, [api]);

    if (!mounted) {
      return (
        <div ref={ref} className={cn("py-8 lg:py-12", className)} {...props}>
          {/* Header Section */}
          <div className="text-center space-y-8 mb-16 lg:mb-24 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
              <Sparkles className="w-4 h-4 text-white/70" />
              <span className="text-sm font-light text-white/70">Ecossistema Completo</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
              O Ecossistema 2 LADOS
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/70 font-light max-w-4xl mx-auto leading-relaxed">
              A DUA não trabalha sozinha. Faz parte de um ecossistema completo que te leva da ideia ao mercado.
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-white/60 font-light max-w-5xl mx-auto leading-relaxed pt-2">
              A 2 LADOS é um ecossistema criativo híbrido e lusófono, com raiz social e mentalidade de futuro. 
              Unimos inteligência artificial, talento humano e uma economia própria para transformar a criatividade 
              em valor real: para quem cria, para quem apoia e para quem precisa.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("py-8 lg:py-12", className)} {...props}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center space-y-8 mb-16 lg:mb-24 px-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <Sparkles className="w-4 h-4 text-white/70" />
            <span className="text-sm font-light text-white/70">Ecossistema Completo</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
            O Ecossistema 2 LADOS
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl text-white/70 font-light max-w-4xl mx-auto leading-relaxed">
            A DUA não trabalha sozinha. Faz parte de um ecossistema completo que te leva da ideia ao mercado.
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-white/60 font-light max-w-5xl mx-auto leading-relaxed pt-2">
            A 2 LADOS é um ecossistema criativo híbrido e lusófono, com raiz social e mentalidade de futuro. 
            Unimos inteligência artificial, talento humano e uma economia própria para transformar a criatividade 
            em valor real: para quem cria, para quem apoia e para quem precisa.
          </p>
        </motion.div>

        <Carousel
          setApi={setApi}
          className="max-w-7xl mx-auto px-4 lg:px-8"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent>
            {pillars.map((pillar, index) => (
              <CarouselItem
                key={index}
                className="flex flex-col items-center cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 1.2, 
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.2 
                  }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="w-full max-w-5xl"
                >
                  <div className="relative group">
                    {/* Main Card */}
                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-700 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]">
                      {/* Image Section */}
                      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
                        <img
                          src={pillar.image}
                          alt={pillar.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                        
                        {/* Icon Badge */}
                        <div className="absolute top-8 left-8 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-500 group-hover:scale-110">
                          <pillar.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                        </div>

                        {/* Phase Badge (if exists) */}
                        {pillar.phase && (
                          <div className="absolute top-8 right-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                            <span className="text-sm font-light text-white">{pillar.phase}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-8 lg:p-12 space-y-6">
                        {/* Title & Subtitle */}
                        <div className="space-y-4">
                          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight leading-tight">
                            {pillar.title}
                          </h3>
                          <p className="text-lg sm:text-xl lg:text-2xl text-white/70 font-light leading-relaxed">
                            {pillar.subtitle}
                          </p>
                        </div>

                        {/* Description */}
                        {pillar.description && (
                          <p className="text-base sm:text-lg text-white/60 font-light leading-relaxed">
                            {pillar.description}
                          </p>
                        )}

                        {/* Features Grid */}
                        {pillar.features.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {pillar.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                                <span className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        {pillar.footer && (
                          <p className="text-base sm:text-lg text-white/60 font-light leading-relaxed italic pt-4 border-t border-white/10">
                            {pillar.footer}
                          </p>
                        )}

                        {/* CTA Button */}
                        <div className="pt-6">
                          <Button
                            size="lg"
                            className="group/btn w-full sm:w-auto bg-white text-black hover:bg-white/90 font-light text-base px-10 py-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)]"
                          >
                            <span className="flex items-center gap-3">
                              Saber Mais
                              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </span>
                          </Button>
                        </div>
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>

                    {/* Decorative glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 -z-10" />
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Pagination Dots */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-3">
            {pillars.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  index === current 
                    ? "w-12 bg-white" 
                    : "w-2 bg-white/30 hover:bg-white/50"
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

EcosystemCarousel.displayName = "EcosystemCarousel";
