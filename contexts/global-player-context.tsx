"use client"

import { createContext, useContext, useState, useRef, ReactNode } from "react"

interface Track {
  id: string
  title: string
  artist: string
  cover: string
  audioUrl: string
}

interface GlobalPlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  progress: number
  duration: number
  play: (track: Track) => void
  pause: () => void
  resume: () => void
  seek: (time: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType | undefined>(undefined)

export function GlobalPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const play = async (track: Track) => {
    if (audioRef.current) {
      // Se for a mesma música, apenas resume
      if (currentTrack?.id === track.id && audioRef.current.paused) {
        await audioRef.current.play()
        setIsPlaying(true)
        return
      }

      // Nova música
      setCurrentTrack(track)
      audioRef.current.src = track.audioUrl
      await audioRef.current.play()
      setIsPlaying(true)
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
      await audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  return (
    <GlobalPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        play,
        pause,
        resume,
        seek,
        audioRef,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
    </GlobalPlayerContext.Provider>
  )
}

export function useGlobalPlayer() {
  const context = useContext(GlobalPlayerContext)
  if (!context) {
    throw new Error("useGlobalPlayer must be used within GlobalPlayerProvider")
  }
  return context
}
