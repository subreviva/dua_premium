"use client";

import { MoveRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

function HeroFounder() {
  return (
    <div className="w-full py-20 lg:py-40 relative overflow-hidden">
      {/* Background with video */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          style={{ 
            filter: 'brightness(0.95) contrast(1.08) saturate(1.1)',
            WebkitBackfaceVisibility: 'hidden',
            WebkitPerspective: 1000,
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)'
          }}
          onLoadedData={(e) => {
            const video = e.currentTarget
            video.play().catch(() => setTimeout(() => video.play(), 100))
          }}
          onEnded={(e) => {
            const video = e.currentTarget
            video.currentTime = 0
            video.play()
          }}
          onError={(e) => {
            console.error('Hero Founder video failed to load:', e)
          }}
        >
          <source
            src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/transferir (53).mp4"
            type="video/mp4"
          />
          <source
            src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/transferir%20%2853%29.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-[36px]" />
      </div>

      <div className="container mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
        {/* MOBILE VERSION - iOS Style Card Design */}
        <div className="lg:hidden space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <Badge 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white/90 backdrop-blur-sm px-4 py-2 text-sm font-light"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              A História por Trás da DUA
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl tracking-tight font-extralight text-white leading-[1.1]"
          >
            Quem Criou a DUA
          </motion.h1>

          {/* iOS Style Card with Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            {/* Image Section */}
            <div className="relative h-[400px] overflow-hidden">
              <img 
                src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-4122-HOMEM%20DENTRO%20DE%20UM%20QUARTO%2C%20NO%20COMPUTADOR....jpeg"
                alt="Fundador da DUA em estúdio de música"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              {/* Quote on image */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-lg font-light leading-relaxed italic">
                  "A DUA é prova de que é possível reescrever as regras quando o sistema não te deixa jogar."
                </p>
              </div>
            </div>

            {/* Content Section - iOS Card Style */}
            <div className="p-6 space-y-4 bg-gradient-to-b from-white/[0.02] to-white/[0.08]">
              <p className="text-base leading-relaxed text-white/80 font-light">
                A DUA nasceu das mãos de alguém que conhece tanto palcos de festivais quanto bairros periféricos. 
                Alguém que viveu a exploração da indústria musical, a falta de acesso a ferramentas profissionais 
                e a solidão de tentar construir algo do zero.
              </p>
              
              <div className="pt-2 pb-1">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              
              <p className="text-sm leading-relaxed text-white/60 font-light italic">
                Sem equipa inicial. Sem investimento externo. Apenas uma visão clara e uma teimosia inabalável.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons - iOS Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col gap-3 pt-2"
          >
            {/* Primary Button */}
            <Button 
              size="lg" 
              className="w-full gap-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white font-light text-base px-8 py-6 rounded-2xl transition-all duration-300 shadow-lg border border-white/20 backdrop-blur-xl touch-manipulation"
            >
              Conhecer a Visão <MoveRight className="w-4 h-4" />
            </Button>
            
            {/* Secondary Button */}
            <Button 
              size="lg" 
              variant="outline"
              className="w-full gap-3 border border-white/20 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white backdrop-blur-xl font-light text-base px-8 py-6 rounded-2xl transition-all duration-300 touch-manipulation"
            >
              Junte-se à Comunidade
            </Button>
          </motion.div>
        </div>

        {/* DESKTOP VERSION - Original Grid Layout */}
        <div className="hidden lg:grid grid-cols-1 gap-12 lg:gap-16 items-center lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex gap-6 flex-col"
          >
            <div>
              <Badge 
                variant="outline" 
                className="border-white/20 bg-white/5 text-white/90 backdrop-blur-sm px-4 py-2 text-sm font-light"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
                A História por Trás da DUA
              </Badge>
            </div>
            <div className="flex gap-6 flex-col">
              <h1 className="text-4xl md:text-6xl lg:text-7xl max-w-2xl tracking-tight text-left font-extralight text-white leading-[1.1]">
                Quem Criou a DUA
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed tracking-tight text-white/70 max-w-xl text-left font-light">
                A DUA nasceu das mãos de alguém que conhece tanto palcos de festivais quanto bairros periféricos. 
                Alguém que viveu a exploração da indústria musical, a falta de acesso a ferramentas profissionais 
                e a solidão de tentar construir algo do zero.
              </p>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed tracking-tight text-white/60 max-w-xl text-left font-light italic mt-2">
                Sem equipa inicial. Sem investimento externo. Apenas uma visão clara e uma teimosia inabalável.
              </p>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              {/* Botão Premium Transparente - Conhecer Visão */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <Button 
                  size="lg" 
                  className="relative gap-3 bg-white/5 hover:bg-white/10 text-white font-light text-base px-8 py-6 rounded-full transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] border border-white/20 hover:border-white/40 backdrop-blur-xl"
                >
                  Conhecer a Visão <MoveRight className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-2" />
                </Button>
              </div>
              
              {/* Botão Premium Transparente - Comunidade */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/15 via-white/25 to-white/15 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="relative gap-3 border border-white/20 hover:border-white/40 bg-white/5 text-white hover:bg-white/10 backdrop-blur-xl font-light text-base px-8 py-6 rounded-full transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]"
                >
                  Junte-se à Comunidade
                </Button>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            {/* Image container with gradient overlay */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] lg:aspect-square bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
              <img 
                src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-4122-HOMEM%20DENTRO%20DE%20UM%20QUARTO%2C%20NO%20COMPUTADOR....jpeg"
                alt="Fundador da DUA em estúdio de música"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/20 to-transparent" />
              
              {/* Quote overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <p className="text-white text-lg md:text-xl lg:text-2xl font-light leading-relaxed italic">
                    "A DUA é prova de que é possível reescrever as regras quando o sistema não te deixa jogar."
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>
        </div>

        {/* Additional context section below - Desktop only */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
          className="hidden lg:block mt-20 lg:mt-32 max-w-4xl mx-auto text-center space-y-6"
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light leading-relaxed">
            Construída por um criador que viviu todos os lados.
          </p>
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-3xl mx-auto">
            A DUA foi construída por quem precisava dela para sobreviver e decidiu partilhá-la com toda a 
            comunidade lusófona. Foi prova de que é possível reescrever as regras quando o sistema não te deixa jogar.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export { HeroFounder };
