"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AboutDuaSection() {
  return (
    <div className="relative">
      <div className="text-center space-y-6 sm:space-y-8 mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white tracking-tight leading-[1.08] px-4"
        >
          Quem Criou a DUA
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-xl sm:text-2xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed px-4"
        >
          Construída por um criador que viveu todos os lados
        </motion.p>
      </div>
      
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-16 lg:gap-20 px-6 sm:px-8 md:px-12">
        {/* Glow effect */}
        <div className="size-[520px] -top-80 left-1/2 -translate-x-1/2 rounded-full absolute blur-[300px] -z-10 bg-white/5"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="size-12 sm:size-14 p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="mt-6 sm:mt-8 space-y-3">
            <h3 className="text-lg sm:text-xl font-medium text-white/90">Rápido & Poderoso</h3>
            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">Criação instantânea com tecnologia de IA avançada. Performance otimizada para qualquer dispositivo.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="size-12 sm:size-14 p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21h6" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mt-6 sm:mt-8 space-y-3">
            <h3 className="text-lg sm:text-xl font-medium text-white/90">Design Intuitivo</h3>
            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">Interface moderna e elegante. Componentes pensados para máxima usabilidade e experiência premium.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="size-12 sm:size-14 p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="white" strokeOpacity="0.9" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="white" strokeOpacity="0.9" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="white" strokeOpacity="0.9" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="white" strokeOpacity="0.9" strokeWidth="2"/>
            </svg>
          </div>
          <div className="mt-6 sm:mt-8 space-y-3">
            <h3 className="text-lg sm:text-xl font-medium text-white/90">Integração Simples</h3>
            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">Compatível com React, Next.js e Tailwind. Setup rápido e documentação completa.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="size-12 sm:size-14 p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeOpacity="0.9" strokeWidth="2"/>
            </svg>
          </div>
          <div className="mt-6 sm:mt-8 space-y-3">
            <h3 className="text-lg sm:text-xl font-medium text-white/90">Documentação Clara</h3>
            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">Exemplos práticos, previews ao vivo e código pronto. Comece rapidamente sem complicações.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="size-12 sm:size-14 p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="white" strokeOpacity="0.9" strokeWidth="2"/>
              <path d="M2 10h20" stroke="white" strokeOpacity="0.9" strokeWidth="2"/>
            </svg>
          </div>
          <div className="mt-6 sm:mt-8 space-y-3">
            <h3 className="text-lg sm:text-xl font-medium text-white/90">Totalmente Customizável</h3>
            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">Adapte estilos, cores e layouts facilmente. Faça a plataforma sua, da sua maneira.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="size-12 sm:size-14 p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="mt-6 sm:mt-8 space-y-3">
            <h3 className="text-lg sm:text-xl font-medium text-white/90">Acessibilidade Premium</h3>
            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">Construído seguindo padrões WCAG. Experiências inclusivas para todos os utilizadores.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
