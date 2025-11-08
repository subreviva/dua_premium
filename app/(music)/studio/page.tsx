"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Music, Upload, Mic, Sparkles, Scissors, Library, ArrowRight, Play } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StudioPage() {
  const router = useRouter()
  const [availableStems, setAvailableStems] = useState<any[]>([])
  const [recentTracks, setRecentTracks] = useState<any[]>([])

  useEffect(() => {
    // Check for available stems
    try {
      const stemsData = localStorage.getItem("track-stems")
      if (stemsData) {
        const allStems = JSON.parse(stemsData)
        const stemsArray = Object.entries(allStems)
          .filter(([_, data]: [string, any]) => data?.stems && data.stems.length > 0)
          .map(([trackId, data]: [string, any]) => ({
            trackId,
            title: data.title || "Untitled",
            stems: data.stems,
          }))
        setAvailableStems(stemsArray)
      }

      // Get recent tracks
      const tracksData = localStorage.getItem("dua-music-tracks")
      if (tracksData) {
        const tracks = JSON.parse(tracksData)
        setRecentTracks(tracks.slice(0, 6))
      }
    } catch (error) {
      console.error("Error loading studio data:", error)
    }
  }, [])

  const features = [
    {
      icon: Scissors,
      title: "Separação de Stems",
      description: "Separe vocal, bateria, baixo e outros instrumentos",
      action: () => router.push("/library"),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Music,
      title: "Criar Música",
      description: "Gere música original com IA",
      action: () => router.push("/create"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Mic,
      title: "Melodia para Música",
      description: "Transforme sua melodia em música completa",
      action: () => router.push("/melody"),
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Library,
      title: "Biblioteca",
      description: "Acesse todas as suas músicas",
      action: () => router.push("/library"),
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-light text-white">Estúdio de Produção</h1>
              <p className="text-sm text-zinc-400">Editor profissional de stems e produção musical</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Available Stems */}
        {availableStems.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light text-white">Stems Disponíveis</h2>
                <p className="text-sm text-zinc-400">Clique para editar no editor profissional</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/library")}
                className="gap-2 text-zinc-400 hover:text-white"
              >
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableStems.map((item) => (
                <button
                  key={item.trackId}
                  onClick={() => router.push(`/stems/${item.trackId}`)}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 text-left transition-all hover:border-purple-500/30 hover:bg-white/10"
                >
                  <div className="absolute right-4 top-4">
                    <Play className="h-5 w-5 text-purple-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Scissors className="h-6 w-6 text-purple-400" />
                  </div>

                  <h3 className="mb-2 font-medium text-white">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{item.stems.length} stems disponíveis</p>

                  <div className="mt-4 flex gap-2">
                    {item.stems.slice(0, 4).map((stem: any, idx: number) => (
                      <div
                        key={idx}
                        className="h-1 flex-1 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30"
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Stems - Show Getting Started */}
        {availableStems.length === 0 && (
          <div className="mb-12 rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Scissors className="h-12 w-12 text-purple-400" />
            </div>
            <h2 className="mb-3 text-2xl font-light text-white">Bem-vindo ao Estúdio</h2>
            <p className="mb-8 text-zinc-400">
              Comece criando música ou separando stems de músicas existentes
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => router.push("/create")}
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="h-4 w-4" />
                Criar Música
              </Button>
              <Button
                onClick={() => router.push("/library")}
                variant="outline"
                className="gap-2 border-white/10 hover:bg-white/5"
              >
                <Library className="h-4 w-4" />
                Ver Biblioteca
              </Button>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-light text-white">Ferramentas do Estúdio</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, idx) => (
              <button
                key={idx}
                onClick={feature.action}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-8 text-left transition-all hover:border-white/10 hover:bg-white/10"
              >
                <div className="absolute right-0 top-0 h-32 w-32 opacity-10">
                  <div className={cn("h-full w-full bg-gradient-to-br", feature.color)} />
                </div>

                <div className="relative">
                  <div
                    className={cn(
                      "mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                      feature.color,
                    )}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="mb-2 text-xl font-medium text-white">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500 transition-colors group-hover:text-purple-400">
                    Acessar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tracks */}
        {recentTracks.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-light text-white">Músicas Recentes</h2>

            <div className="grid gap-4 md:grid-cols-3">
              {recentTracks.map((track, idx) => (
                <div
                  key={idx}
                  className="group overflow-hidden rounded-xl border border-white/5 bg-white/5 transition-all hover:border-white/10 hover:bg-white/10"
                >
                  {track.imageUrl && (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="mb-1 truncate font-medium text-white">{track.title}</h3>
                    <p className="truncate text-sm text-zinc-400">{track.tags || "Music"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
