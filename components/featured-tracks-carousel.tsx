"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Pause, Loader2, Headphones } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUnifiedMusic } from "@/contexts/unified-music-context"

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
    artist: "Riicky",
    genre: "Portuguese Pop",
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop&q=80",
    audioUrl: `/audio/featured/ainda-nao-acabou.mp3`,
  },
  {
    id: "J9z2aqpTWcknLPil",
    title: "Struggle Symphony",
    artist: "FabyJunior",
    genre: "Orchestral Rock",
    cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=800&fit=crop&q=80",
    audioUrl: `/audio/featured/struggle-symphony.mp3`,
  },
  {
    id: "EzOHEKgUHyGshDNR",
    title: "Bo Surrize Ta Alegra-m Nha Dia",
    artist: "Joana_Goncalves",
    genre: "Cabo Verde",
    cover: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=800&fit=crop&q=80",
    audioUrl: `/audio/featured/bo-surrize.mp3`,
  },
  {
    id: "Lq50KP37gz9hwLv0",
    title: "Amor e Paz",
    artist: "Riicky",
    genre: "Reggae",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop&q=80",
    audioUrl: `/audio/featured/amor-e-paz.mp3`,
  },
  {
    id: "zKgQ4mbyGiLCkqqo",
    title: "Revolution in the Air",
    artist: "Joana_Goncalves",
    genre: "Rock Anthem",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=800&fit=crop&q=80",
    audioUrl: `/audio/featured/revolution-in-the-air.mp3`,
  }
]

export function FeaturedTracksCarousel() {
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null)
  const { currentTrack, isPlaying, playCarouselTrack, pause } = useUnifiedMusic()

  const togglePlay = async (track: Track) => {
    // Se é a música atual tocando, pausa
    if (currentTrack?.id === track.id && isPlaying) {
      pause()
      return
    }

    // Toca a música
    setLoadingTrackId(track.id)
    try {
      await playCarouselTrack(track)
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      alert('Desculpe, este áudio está temporariamente indisponível.')
    } finally {
      setLoadingTrackId(null)
    }
  }

  return (
    <div className="w-full">
      {/* Header - apenas desktop */}
      <div className="hidden md:block mb-5 md:mb-6">
        <h2 className="text-[22px] md:text-2xl font-semibold text-white mb-1 md:mb-2">
          Criado com DUA
        </h2>
        <p className="text-[13px] md:text-sm text-zinc-400 font-normal">
          Explore músicas da comunidade
        </p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {FEATURED_TRACKS.map((track, index) => (
            <CarouselItem key={track.id} className="pl-3 md:pl-4 basis-[75%] md:basis-[320px]">
              <Card className="bg-white/[0.02] border-white/[0.08] hover:border-white/20 overflow-hidden group hover:bg-white/[0.04] transition-all duration-500 backdrop-blur-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] rounded-3xl">
                <CardContent className="p-0">
                  {/* Cover Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={track.cover}
                      alt={`Capa de ${track.title}`}
                      fill
                      className="object-cover transition-transform duration-700 group-active:scale-105"
                      priority={index < 2}
                    />
                    
                    {/* Gradient Overlay Sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Play/Pause Button - Sempre visível no mobile */}
                    <div className="absolute inset-0 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] md:bg-black/40" />
                      <Button
                        size="icon"
                        className="relative w-16 h-16 rounded-full bg-white/95 hover:bg-white text-black active:scale-90 transition-all shadow-2xl border-2 border-white/20"
                        onClick={() => togglePlay(track)}
                        disabled={loadingTrackId === track.id}
                      >
                        {loadingTrackId === track.id ? (
                          <Loader2 className="w-7 h-7 animate-spin" />
                        ) : currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="w-7 h-7" fill="currentColor" />
                        ) : (
                          <Play className="w-7 h-7 ml-1" fill="currentColor" />
                        )}
                      </Button>
                    </div>

                    {/* Genre Badge - Mais elegante */}
                    <div className="absolute top-3 right-3">
                      <div className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                        <span className="text-xs font-medium text-white/70 tracking-wide">
                          {track.genre}
                        </span>
                      </div>
                    </div>

                    {/* Playing Indicator - Mais premium */}
                    {currentTrack?.id === track.id && isPlaying && (
                      <div className="absolute bottom-3 left-3 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-xl shadow-lg shadow-green-500/25">
                          <div className="flex gap-0.5">
                            <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                            <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[11px] font-semibold text-white tracking-tight">
                            Tocando
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Track Info - Design mais limpo */}
                  <div className="p-5 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <h3 className="font-semibold text-base text-white mb-1.5 truncate tracking-tight">
                      {track.title}
                    </h3>
                    <p className="text-sm text-white/50 font-light truncate">
                      {track.artist}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="hidden md:flex justify-end gap-2 mt-4">
          <CarouselPrevious className="static translate-y-0 bg-white/5 border-white/10 hover:bg-white/10 text-white" />
          <CarouselNext className="static translate-y-0 bg-white/5 border-white/10 hover:bg-white/10 text-white" />
        </div>
      </Carousel>
    </div>
  )
}
