"use client"

import React from 'react'

type Props = {
  eyebrow?: string
  title: React.ReactNode
  kicker?: React.ReactNode
}

export default function SectionTitle({ eyebrow, title, kicker }: Props) {
  return (
    <div className="mb-12 sm:mb-14 lg:mb-16">
      {/* Linha decorativa superior - APENAS MOBILE */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8 md:hidden">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-white/50" />
        <div className="w-2 h-2 rounded-full bg-white/50" />
      </div>

      {eyebrow && (
        <div className="mb-3 sm:mb-4 text-sm sm:text-base text-white/70 font-medium tracking-wide uppercase">
          {eyebrow}
        </div>
      )}

      <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight text-white tracking-tight leading-[0.9] relative">
        <span className="block bg-gradient-to-br from-white via-white/95 to-white/80 bg-clip-text text-transparent md:bg-none md:text-white">
          {title}
        </span>
      </h2>

      {/* Gradiente underline - MOBILE com mais destaque */}
      <div className="mt-6 sm:mt-8 h-1.5 sm:h-2 w-40 sm:w-48 bg-gradient-to-r from-white/80 via-white/50 to-transparent rounded-full" />

      {kicker && (
        <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-white/70 max-w-3xl font-light leading-relaxed">{kicker}</p>
      )}
    </div>
  )
}
