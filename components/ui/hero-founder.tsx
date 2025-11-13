"use client";

import { MoveRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

function HeroFounder() {
  return (
    <div className="w-full py-20 lg:py-40 relative overflow-hidden">
      {/* Background - Pure Black Premium */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          style={{ 
            filter: 'brightness(0.4) contrast(1.15) saturate(0.9)',
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
        <div className="absolute inset-0 bg-black/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
        {/* Subtle accent - Awwwards style */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04),transparent_70%)]" />
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
              className="border-white/10 bg-white/[0.03] text-white/95 backdrop-blur-xl px-5 py-2.5 text-sm font-light tracking-wide"
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

          {/* Ultra Premium Card - Apple/Revolut Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            viewport={{ once: true }}
            className="relative rounded-[32px] overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Image Section - Enhanced */}
            <div className="relative h-[450px] overflow-hidden">
              <img 
                src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-4122-HOMEM%20DENTRO%20DE%20UM%20QUARTO%2C%20NO%20COMPUTADOR....jpeg"
                alt="Fundador da DUA em estúdios"
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
              
              {/* Quote on image - Ultra Premium */}
              <div className="absolute bottom-8 left-6 right-6">
                <p className="text-white text-xl font-light leading-relaxed tracking-tight">
                  “A DUA é prova de que é possível reescrever as regras quando o sistema não te deixa jogar.”
                </p>
              </div>
            </div>

            {/* Content Section - Ultra Refined */}
            <div className="p-8 space-y-6 bg-gradient-to-b from-black/40 to-black/60">
              <p className="text-[17px] leading-relaxed text-white/90 font-light tracking-tight">
                A DUA nasceu das mãos de alguém que conhece tanto palcos de festivais quanto bairros periféricos. 
                Alguém que viveu a exploração da indústria musical, a falta de acesso a ferramentas profissionais 
                e a solidão de tentar construir algo do zero.
              </p>
              
              <div className="pt-3 pb-2">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              </div>
              
              <p className="text-[15px] leading-relaxed text-white/50 font-light tracking-tight">
                Sem equipa inicial. Sem investimento externo. Apenas uma visão clara e uma teimosia inabalável.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons - Ultra Premium Exclusive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 pt-4"
          >
            {/* Primary Button - Revolut Style */}
            <Button 
              size="lg" 
              className="w-full gap-3 bg-white text-black hover:bg-white/95 active:bg-white/90 font-normal text-[17px] px-8 py-7 rounded-[20px] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] active:scale-[0.98] touch-manipulation tracking-tight"
            >
              Conhecer a Visão <MoveRight className="w-5 h-5" />
            </Button>
            
            {/* Secondary Button - Ultra Refined */}
            <Button 
              size="lg" 
              variant="outline"
              className="w-full gap-3 border-[1.5px] border-white/10 bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.08] text-white backdrop-blur-xl font-light text-[17px] px-8 py-7 rounded-[20px] transition-all duration-300 active:scale-[0.98] touch-manipulation tracking-tight"
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
                className="border-white/10 bg-white/[0.03] text-white/95 backdrop-blur-xl px-5 py-2.5 text-sm font-light tracking-wide"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
                A História por Trás da DUA
              </Badge>
            </div>
            <div className="flex gap-8 flex-col">
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl max-w-2xl tracking-[-0.02em] text-left font-extralight text-white leading-[0.95]">
                Quem Criou a DUA
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed tracking-tight text-white/80 max-w-2xl text-left font-light">
                A DUA nasceu das mãos de alguém que conhece tanto palcos de festivais quanto bairros periféricos. 
                Alguém que viveu a exploração da indústria musical, a falta de acesso a ferramentas profissionais 
                e a solidão de tentar construir algo do zero.
              </p>
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed tracking-tight text-white/50 max-w-2xl text-left font-light mt-2">
                Sem equipa inicial. Sem investimento externo. Apenas uma visão clara e uma teimosia inabalável.
              </p>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              {/* Primary Button - Ultra Premium White */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/30 via-white/40 to-white/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <Button 
                  size="lg" 
                  className="relative gap-3 bg-white text-black hover:bg-white/95 font-medium text-lg px-10 py-7 rounded-full transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_40px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_56px_rgba(255,255,255,0.3)] tracking-tight"
                >
                  Conhecer a Visão <MoveRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-2" />
                </Button>
              </div>
              
              {/* Secondary Button - Ultra Refined Glass */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="relative gap-3 border-[1.5px] border-white/10 hover:border-white/30 bg-white/[0.03] text-white hover:bg-white/[0.08] backdrop-blur-2xl font-light text-lg px-10 py-7 rounded-full transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_40px_rgba(255,255,255,0.08)] tracking-tight"
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
            {/* Image container - Ultra Premium */}
            <div className="relative rounded-[32px] overflow-hidden aspect-[4/5] lg:aspect-square bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] shadow-[0_24px_96px_rgba(0,0,0,0.6)]">
              <img 
                src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-4122-HOMEM%20DENTRO%20DE%20UM%20QUARTO%2C%20NO%20COMPUTADOR....jpeg"
                alt="Fundador da DUA em estúdios"
                className="w-full h-full object-cover opacity-90 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
              
              {/* Quote overlay - Ultra Refined */}
              <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <p className="text-white text-xl md:text-2xl lg:text-3xl font-light leading-relaxed tracking-tight">
                    “A DUA é prova de que é possível reescrever as regras quando o sistema não te deixa jogar.”
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Decorative gradient orbs - More subtle */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
          </motion.div>
        </div>

        {/* Additional context section - Ultra Premium */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
          className="hidden lg:block mt-24 lg:mt-40 max-w-5xl mx-auto text-center space-y-8"
        >
          <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed tracking-tight">
            Construída por um criador que viveu todos os lados.
          </p>
          <p className="text-xl md:text-2xl lg:text-3xl text-white/60 font-light leading-relaxed max-w-4xl mx-auto tracking-tight">
            A DUA foi construída por quem precisava dela para sobreviver e decidiu partilhá-la com toda a 
            comunidade lusófona. Foi prova de que é possível reescrever as regras quando o sistema não te deixa jogar.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export { HeroFounder };
