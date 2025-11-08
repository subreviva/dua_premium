"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Play, Pause, Loader2 } from "lucide-react"

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
    cover: "https://cdn2.suno.ai/image_76f26d38-5ef4-4510-bcab-e4f50d4c7125.jpeg",
    audioUrl: `/audio/featured/ainda-nao-acabou.mp3`,
  },
  {
    id: "J9z2aqpTWcknLPil",
    title: "Struggle Symphony",
    artist: "FabyJunior",
    genre: "Orchestral Rock",
    cover: "https://cdn2.suno.ai/image_cb01ecb0-2e67-430c-bdae-d235fa14808a.jpeg",
    audioUrl: `/audio/featured/struggle-symphony.mp3`,
  },
  {
    id: "EzOHEKgUHyGshDNR",
    title: "Bo Surrize Ta Alegra-m Nha Dia",
    artist: "Joana_Goncalves",
    genre: "Cabo Verde",
    cover: "https://cdn2.suno.ai/image_5de28091-36c4-4d33-8c15-af93d6c0a220.jpeg",
    audioUrl: `/audio/featured/bo-surrize.mp3`,
  },
  {
    id: "Lq50KP37gz9hwLv0",
    title: "Amor e Paz",
    artist: "Riicky",
    genre: "Reggae",
    cover: "https://cdn2.suno.ai/image_4888bcf5-8414-4d77-a178-af2a2338fa78.jpeg",
    audioUrl: `/audio/featured/amor-e-paz.mp3`,
  },
  {
    id: "zKgQ4mbyGiLCkqqo",
    title: "Revolution in the Air",
    artist: "Joana_Goncalves",
    genre: "Rock Anthem",
    cover: "https://cdn2.suno.ai/image_b132bd86-120b-45bd-af5d-54ec65b471aa.jpeg",
    audioUrl: `/audio/featured/revolution-in-the-air.mp3`,
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
      {/* Horizontal Scroll Container - iOS Style */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 pb-2">
          {FEATURED_TRACKS.map((track) => (
            <div
              key={track.id}
              className="flex-none w-[160px] active:scale-[0.97] transition-transform"
            >
              {/* Card Container */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                {/* Cover Image */}
                <div className="relative aspect-square">
                  <Image
                    src={track.cover}
                    alt={track.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-2">
                    <button
                      onClick={() => togglePlay(track.id)}
                      disabled={loadingAudio === track.id}
                      className="w-12 h-12 rounded-full bg-white/95 hover:bg-white flex items-center justify-center active:scale-90 transition-all shadow-lg"
                    >
                      {loadingAudio === track.id ? (
                        <Loader2 className="w-5 h-5 text-black animate-spin" strokeWidth={2.5} />
                      ) : playingId === track.id ? (
                        <Pause className="w-5 h-5 text-black" fill="currentColor" strokeWidth={0} />
                      ) : (
                        <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" strokeWidth={0} />
                      )}
                    </button>
                  </div>
                  
                  {/* Genre Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white border border-white/20">
                      {track.genre}
                    </span>
                  </div>

                  {/* Playing Indicator */}
                  {playingId === track.id && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-semibold text-white">
                          Playing
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-white truncate mb-0.5">
                    {track.title}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">
                    {track.artist}
                  </p>
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Scrollbar Hide CSS */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
