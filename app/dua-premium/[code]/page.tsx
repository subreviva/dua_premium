"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"

const gradientByPrefix: Record<string, string> = {
  "VIP": "from-amber-400/60 via-amber-500/30 to-amber-200/10",
  "DUA": "from-fuchsia-500/50 via-indigo-500/30 to-sky-400/20",
  "PRO": "from-emerald-500/50 via-emerald-400/20 to-teal-300/10",
}

function getGradient(code: string | null) {
  if (!code) return "from-fuchsia-500/50 via-indigo-500/30 to-sky-400/20"
  const prefix = code.trim().toUpperCase().split("-")[0] || "DUA"
  return gradientByPrefix[prefix] ?? "from-fuchsia-500/50 via-indigo-500/30 to-sky-400/20"
}

export default function DuaPremiumCodePage() {
  const params = useParams<{ code?: string }>()
  const code = (params?.code as string | undefined) ?? ""
  const gradient = getGradient(code)

  const [mounted, setMounted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setMounted(true)
    
    // Force video play
    const video = videoRef.current
    if (video) {
      video.play().catch(err => {
        console.log('Video autoplay prevented, retrying...', err)
        setTimeout(() => video.play(), 100)
      })
    }
  }, [])

  return (
    <main className="min-h-screen w-full bg-transparent text-zinc-50 flex items-center justify-center pt-20">
      {/* Vídeo de fundo */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <video
          ref={videoRef}
          className="min-h-screen min-w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-100"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          webkit-playsinline="true"
          x-webkit-airplay="deny"
          controlsList="nodownload nofullscreen noremoteplayback"
          style={{
            pointerEvents: 'none',
            WebkitBackfaceVisibility: 'hidden',
            WebkitPerspective: 1000,
            WebkitTransform: 'translate3d(0,0,0)',
            transform: 'translate3d(0,0,0)',
            width: '100vw',
            height: '100vh'
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/transferir%20%2865%29.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16 flex flex-col items-center text-center gap-12 sm:gap-16">
        {/* Header minimalista */}
        <header className="space-y-8 sm:space-y-10">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight">
            <span className="block text-zinc-100 mb-3 sm:mb-4">
              Este código não apareceu por acaso.
            </span>
            <span className="block bg-gradient-to-r from-fuchsia-300 via-emerald-200 to-sky-200 bg-clip-text text-transparent">
              Foi-te entregue pelo que és capaz de fazer.
            </span>
          </h1>
        </header>

        {/* Código exclusivo */}
        <div className="w-full max-w-md">
          <div className="relative rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl px-8 py-6 sm:px-10 sm:py-8 shadow-[0_20px_100px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-5" />
            
            <div className="relative space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-zinc-300">
                  Código de acesso
                </p>
                <p className="font-mono text-2xl sm:text-3xl tracking-[0.15em] text-white font-medium">
                  {code ? code.toUpperCase() : "PENDENTE"}
                </p>
              </div>

              <div className="pt-4 border-t border-white/15">
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Este código é pessoal e intransmissível. Não partilhes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão único */}
        <div className="w-full max-w-sm">
          <button
            className="w-full rounded-full bg-zinc-50 px-8 py-4 sm:py-5 text-base sm:text-lg font-medium text-black shadow-[0_0_60px_rgba(250,250,250,0.5)] hover:shadow-[0_0_80px_rgba(250,250,250,0.7)] hover:bg-white transition-all duration-300"
            onClick={() => {
              if (typeof window !== "undefined" && mounted) {
                window.location.href = `https://dua.2lados.pt/acesso?code=${encodeURIComponent(code || "")}`
              }
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    </main>
  )
}
