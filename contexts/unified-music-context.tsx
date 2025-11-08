"use client"

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react"

// Tipo para músicas do carrossel (homepage)
interface CarouselTrack {
  id: string
  title: string
  artist: string
  cover: string
  audioUrl: string
}

// Tipo para músicas geradas (Music Studio)
interface GeneratedTrack {
  id?: string
  audioId: string
  title: string
  prompt: string
  tags: string
  duration: number
  audioUrl: string
  streamAudioUrl: string
  imageUrl: string
  modelName: string
  createTime: string
  taskId: string
}

// Tipo unificado
type UnifiedTrack = (CarouselTrack | GeneratedTrack) & { 
  source: 'carousel' | 'generated' 
}

interface UnifiedMusicContextType {
  currentTrack: UnifiedTrack | null
  isPlaying: boolean
  progress: number
  duration: number
  
  // Funções principais
  playCarouselTrack: (track: CarouselTrack) => void
  playGeneratedTrack: (track: GeneratedTrack) => void
  pause: () => void
  resume: () => void
  seek: (time: number) => void
  stop: () => void
  
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const UnifiedMusicContext = createContext<UnifiedMusicContextType | undefined>(undefined)

export function UnifiedMusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<UnifiedTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const playCarouselTrack = async (track: CarouselTrack) => {
    if (!audioRef.current) return

    const unifiedTrack: UnifiedTrack = { ...track, source: 'carousel' }

    // Se for a mesma música, apenas resume
    if (currentTrack?.id === track.id && audioRef.current.paused) {
      await audioRef.current.play()
      setIsPlaying(true)
      return
    }

    // Nova música
    setCurrentTrack(unifiedTrack)
    audioRef.current.src = track.audioUrl
    
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Erro ao reproduzir música do carrossel:", error)
      setIsPlaying(false)
    }
  }

  const playGeneratedTrack = async (track: GeneratedTrack) => {
    if (!audioRef.current) return

    const unifiedTrack: UnifiedTrack = { ...track, source: 'generated' }

    // Determina URL de áudio
    let audioUrl = track.audioUrl
    if (!audioUrl && track.streamAudioUrl) {
      audioUrl = track.streamAudioUrl.endsWith(".mp3") 
        ? track.streamAudioUrl 
        : `${track.streamAudioUrl}.mp3`
    }

    if (!audioUrl) {
      console.error("URL de áudio não disponível")
      return
    }

    // Se for a mesma música, apenas resume
    const trackId = track.id || track.audioId
    if (currentTrack && ('audioId' in currentTrack) && currentTrack.audioId === track.audioId && audioRef.current.paused) {
      await audioRef.current.play()
      setIsPlaying(true)
      return
    }

    // Nova música
    setCurrentTrack(unifiedTrack)
    setDuration(track.duration || 0)
    audioRef.current.src = audioUrl
    
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Erro ao reproduzir música gerada:", error)
      setIsPlaying(false)
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resume = async () => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error("Erro ao retomar música:", error)
        setIsPlaying(false)
      }
    }
  }

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setCurrentTrack(null)
      setIsPlaying(false)
      setProgress(0)
      setDuration(0)
    }
  }

  // Event listeners para o elemento de áudio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    const handleError = (e: ErrorEvent) => {
      console.error("Erro de áudio:", e)
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError as any)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError as any)
    }
  }, [])

  return (
    <UnifiedMusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        playCarouselTrack,
        playGeneratedTrack,
        pause,
        resume,
        seek,
        stop,
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </UnifiedMusicContext.Provider>
  )
}

export function useUnifiedMusic() {
  const context = useContext(UnifiedMusicContext)
  if (!context) {
    throw new Error("useUnifiedMusic deve ser usado dentro de UnifiedMusicProvider")
  }
  return context
}
