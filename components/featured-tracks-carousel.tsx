"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Play, Pause, Music2, Loader2, Headphones } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Músicas da comunidade DUA
interface Track {
  id: string
  title: string
  artist: string
  genre: string
  cover: string
  audioUrl: string
}

const FEATURED_TRACKS: Track[] = [
  {
    id: "xJqFtvSGsgcaNczS",
    title: "Ainda Não Acabou",
    artist: "JubilantHarmonic3057",
    genre: "Portuguese Pop",
    cover: "https://cdn2.suno.ai/image_76f26d38-5ef4-4510-bcab-e4f50d4c7125.jpeg",
    audioUrl: `/api/track-audio?id=xJqFtvSGsgcaNczS`,
  },
  {
    id: "J9z2aqpTWcknLPil",
    title: "Struggle Symphony",
    artist: "JubilantHarmonic3057",
    genre: "Orchestral Rock",
    cover: "https://cdn2.suno.ai/image_cb01ecb0-2e67-430c-bdae-d235fa14808a.jpeg",
    audioUrl: `/api/track-audio?id=J9z2aqpTWcknLPil`,
  },
  {
    id: "EzOHEKgUHyGshDNR",
    title: "Bo Surrize Ta Alegra-m Nha Dia",
    artist: "JubilantHarmonic3057",
    genre: "Cabo Verde",
    cover: "https://cdn2.suno.ai/image_5de28091-36c4-4d33-8c15-af93d6c0a220.jpeg",
    audioUrl: `/api/track-audio?id=EzOHEKgUHyGshDNR`,
  },
  {
    id: "Lq50KP37gz9hwLv0",
    title: "Amor e Paz",
    artist: "JubilantHarmonic3057",
    genre: "Reggae",
    cover: "https://cdn2.suno.ai/image_4888bcf5-8414-4d77-a178-af2a2338fa78.jpeg",
    audioUrl: `/api/track-audio?id=Lq50KP37gz9hwLv0`,
  },
  {
    id: "xmQohTCXLLxIjOc4",
    title: "Rap Portugal Fado - Lei da Vida",
    artist: "JubilantHarmonic3057",
    genre: "Rap Fado",
    cover: "https://cdn2.suno.ai/image_0a031014-6dfd-419d-879c-bf5955f79e9f.jpeg",
    audioUrl: `/api/track-audio?id=xmQohTCXLLxIjOc4`,
  },
  {
    id: "zKgQ4mbyGiLCkqqo",
    title: "Revolution in the Air",
    artist: "JubilantHarmonic3057",
    genre: "Rock Anthem",
    cover: "https://cdn2.suno.ai/image_b132bd86-120b-45bd-af5d-54ec65b471aa.jpeg",
    audioUrl: `/api/track-audio?id=zKgQ4mbyGiLCkqqo`,
  }
]

export function FeaturedTracksCarousel() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const togglePlay = async (trackId: string) => {
    // Pausa todas as outras músicas
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== trackId && audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    const audio = audioRefs.current[trackId]
    if (!audio) return

    if (playingId === trackId) {
      audio.pause()
      setPlayingId(null)
    } else {
      setLoadingAudio(trackId)
      
      try {
        await audio.play()
        setPlayingId(trackId)
        setLoadingAudio(null)
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error)
        setLoadingAudio(null)
        
        // Mostra mensagem amigável ao usuário
        alert('Desculpe, este áudio está temporariamente indisponível. Tente novamente em alguns segundos.')
      }
    }
  }

  const handleAudioEnd = (trackId: string) => {
    if (playingId === trackId) {
      setPlayingId(null)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">
          Criado com DUA
        </h2>
        <p className="text-sm text-zinc-400 font-light">
          Explore músicas criadas pela comunidade
        </p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {FEATURED_TRACKS.map((track) => (
            <CarouselItem key={track.id} className="pl-2 md:pl-4 basis-[280px] md:basis-[320px]">
              <Card className="bg-white/5 border-white/10 overflow-hidden group hover:bg-white/10 transition-all">
                <CardContent className="p-0">
                  {/* Cover Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={track.cover}
                      alt={`Capa de ${track.title}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Play/Pause Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="icon"
                        className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-black"
                        onClick={() => togglePlay(track.id)}
                        disabled={loadingAudio === track.id}
                      >
                        {loadingAudio === track.id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : playingId === track.id ? (
                          <Pause className="w-6 h-6" fill="currentColor" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" fill="currentColor" />
                        )}
                      </Button>
                    </div>

                    {/* Genre Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                        <span className="text-xs font-light text-white">
                          {track.genre}
                        </span>
                      </div>
                    </div>

                    {/* Playing Indicator */}
                    {playingId === track.id && (
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm">
                          <Music2 className="w-3.5 h-3.5 text-white animate-pulse" />
                          <span className="text-xs font-medium text-white">
                            Tocando
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-white mb-1 truncate">
                      {track.title}
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-zinc-400 font-light truncate">
                        {track.artist}
                      </p>
                      {playingId === track.id && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-green-400">Tocando</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hidden Audio Element */}
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[track.id] = el
                    }}
                    src={track.audioUrl}
                    onEnded={() => handleAudioEnd(track.id)}
                    preload="metadata"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="flex justify-end gap-2 mt-4">
          <CarouselPrevious className="static translate-y-0 bg-white/5 border-white/10 hover:bg-white/10 text-white" />
          <CarouselNext className="static translate-y-0 bg-white/5 border-white/10 hover:bg-white/10 text-white" />
        </div>
      </Carousel>
    </div>
  )
}
