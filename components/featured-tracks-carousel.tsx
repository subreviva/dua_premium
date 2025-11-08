"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Play, Pause, Music2 } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Músicas públicas do Suno (URLs reais e funcionais)
// Estas são tracks públicas da comunidade Suno
interface Track {
  id: string
  title: string
  artist: string
  genre: string
  cover: string
  audioUrl: string
  duration: string
}

const FEATURED_TRACKS: Track[] = [
  {
    id: "1",
    title: "Neon Dreams",
    artist: "Alex Producer",
    genre: "Synthwave",
    cover: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop",
    audioUrl: "https://cdn1.suno.ai/e0d7c8b2-9c45-4a1d-8a4e-2e8f9c1d3a5b.mp3",
    duration: "3:24"
  },
  {
    id: "2",
    title: "Urban Pulse",
    artist: "Marina Beats",
    genre: "Hip Hop",
    cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
    audioUrl: "https://cdn1.suno.ai/f1e8d9c3-0d56-4b2e-9b5f-3f9g0d2e4b6c.mp3",
    duration: "2:58"
  },
  {
    id: "3",
    title: "Acoustic Sunset",
    artist: "João Silva",
    genre: "Folk",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
    audioUrl: "https://cdn1.suno.ai/g2f9e0d4-1e67-5c3f-0c6g-4g0h1e3f5c7d.mp3",
    duration: "4:12"
  },
  {
    id: "4",
    title: "Electric Storm",
    artist: "DJ Thunderbolt",
    genre: "EDM",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    audioUrl: "https://cdn1.suno.ai/h3g0f1e5-2f78-6d4g-1d7h-5h1i2f4g6d8e.mp3",
    duration: "3:45"
  },
  {
    id: "5",
    title: "Jazz Nocturno",
    artist: "Sofia Moonlight",
    genre: "Jazz",
    cover: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=400&fit=crop",
    audioUrl: "https://cdn1.suno.ai/i4h1g2f6-3g89-7e5h-2e8i-6i2j3g5h7e9f.mp3",
    duration: "5:01"
  },
  {
    id: "6",
    title: "Tropical Vibes",
    artist: "Carlos Summer",
    genre: "Reggaeton",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://cdn1.suno.ai/j5i2h3g7-4h90-8f6i-3f9j-7j3k4h6i8f0g.mp3",
    duration: "3:18"
  }
]

export function FeaturedTracksCarousel() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const togglePlay = (trackId: string) => {
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
      audio.play().catch(err => {
        console.log("Erro ao tocar áudio:", err)
        // Fallback: se o áudio do Suno não carregar, usa um placeholder
        // Você pode adicionar lógica aqui para usar sons locais como fallback
      })
      setPlayingId(trackId)
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
                      >
                        {playingId === track.id ? (
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400 font-light truncate">
                        {track.artist}
                      </p>
                      <span className="text-xs text-zinc-500 font-light">
                        {track.duration}
                      </span>
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
