"use client"

import { motion } from "framer-motion"
import { Music, Sparkles } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1628]">
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jnjkn-32feaq56yGzOHRYywJLYjc5fy4gwy4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-[#0a1628]/80 to-[#0a1628]/90 backdrop-blur-sm" />
      </div>
      {/* </CHANGE> */}

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated icon with radiant glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Radiant background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4a574] via-[#f5d4c8] to-[#d4a574] rounded-full blur-3xl opacity-50 animate-pulse" />

          {/* Icon container with glass morphism */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1a2942]/80 to-[#1a2942]/60 backdrop-blur-xl border border-[#d4a574]/40 flex items-center justify-center shadow-2xl">
            <Music className="w-12 h-12 text-[#d4a574]" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-[#d4a574] border-r-[#f5d4c8]"
            />
          </div>
        </motion.div>

        {/* Loading text with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#f5f0eb] via-[#f5d4c8] to-[#d4a574] bg-clip-text text-transparent">
            DUA Music Studio
          </h2>
          <p className="text-[#f5d4c8]/60 text-lg font-light flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4a574] animate-pulse" />A preparar o teu estúdio...
          </p>
        </motion.div>

        {/* Loading bar with radiant effect */}
        <div className="w-64 h-2 rounded-full bg-[#1a2942]/60 backdrop-blur-sm border border-[#d4a574]/20 overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#d4a574] to-transparent shadow-lg shadow-[#d4a574]/50"
          />
        </div>
      </div>
      {/* </CHANGE> */}
    </div>
  )
}
