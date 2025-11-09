"use client"

import { Slider } from "@/components/ui/slider"
import { useState, useRef, useEffect } from "react"

interface Track {
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

interface BottomPlayerProps {
  track: Track | null
  onOpenFullPlayer: () => void
  onClose: () => void
}

export function BottomPlayer({ track, onOpenFullPlayer, onClose }: BottomPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track?.duration || 0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    if (track && audioRef.current) {
      let audioUrl = track.audioUrl

      // If audioUrl is not available, use streamAudioUrl and ensure it has .mp3 extension
      if (!audioUrl && track.streamAudioUrl) {
        audioUrl = track.streamAudioUrl.endsWith(".mp3") ? track.streamAudioUrl : `${track.streamAudioUrl}.mp3`
      }

      console.log("[v0] Loading track:", track.title, "Duration from API:", track.duration)
      console.log("[v0] Track data:", JSON.stringify(track))
      console.log("[v0] Using audio URL:", audioUrl)

      if (!audioUrl) {
        setAudioError("URL de áudio não disponível para esta faixa")
        return
      }

      setAudioError(null)
      setDuration(track.duration || 0)
      audioRef.current.src = audioUrl
      audioRef.current.volume = volume / 100

      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("[v0] Audio playing successfully")
            setIsPlaying(true)
          })
          .catch((err) => {
            console.log("[v0] Play error:", err.message)
            setAudioError("Falha ao reproduzir áudio")
            setIsPlaying(false)
          })
      }
    }
  }, [track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        console.log("[v0] Audio metadata loaded, duration:", audio.duration)
        setDuration(audio.duration)
      } else {
        console.log("[v0] Invalid audio duration, using track duration:", track?.duration)
        if (track?.duration) {
          setDuration(track.duration)
        }
      }
    }

    const handleEnded = () => setIsPlaying(false)

    const handleError = () => {
      console.log("[v0] Audio error occurred")
      setAudioError("Falha ao carregar áudio")
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [track])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) {
      console.log("[v0] No audio ref available")
      return
    }

    const validDuration = duration && isFinite(duration) && duration > 0 ? duration : track?.duration || 0

    if (!validDuration || validDuration <= 0) {
      console.log("[v0] Invalid duration for seeking:", validDuration)
      return
    }

    const newTime = (value[0] / 100) * validDuration

    if (isFinite(newTime) && newTime >= 0 && newTime <= validDuration) {
      console.log("[v0] Seeking to:", newTime, "seconds")
      audio.currentTime = newTime
      setCurrentTime(newTime)
    } else {
      console.log("[v0] Invalid seek time:", newTime)
    }
  }

  const skipBackward = () => {
    if (audioRef.current && isFinite(audioRef.current.currentTime)) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    const validDuration = duration && isFinite(duration) && duration > 0 ? duration : track?.duration || 0
    if (audioRef.current && isFinite(audioRef.current.currentTime) && validDuration > 0) {
      audioRef.current.currentTime = Math.min(validDuration, audioRef.current.currentTime + 10)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleOpenFullPlayer = () => {
    console.log("[v0] Fullscreen button clicked")
    console.log("[v0] onOpenFullPlayer function:", typeof onOpenFullPlayer)
    onOpenFullPlayer()
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const validDuration = duration && isFinite(duration) && duration > 0 ? duration : track?.duration || 0
  const progressPercentage = isFinite(currentTime) && validDuration > 0 ? (currentTime / validDuration) * 100 : 0

  if (!track) return null

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
  <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-black/80 backdrop-blur-3xl pb-safe-mobile md:pb-0">
        {audioError && (
          <div className="bg-red-500/10 px-4 py-2 text-center text-xs font-light text-red-400/90 border-b border-red-500/20">
            {audioError}
          </div>
        )}

        <div className="px-4 pt-3 md:px-6">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleProgressChange}
            max={100}
            step={0.1}
            className="cursor-pointer touch-manipulation"
          />
        </div>

        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-xl md:rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl">
                {track.imageUrl ? (
                  <img
                    src={track.imageUrl || "/placeholder.svg"}
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="h-5 w-5 md:h-6 md:w-6 text-white/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm md:text-base tracking-tight text-white/95">{track.title}</p>
                <p className="truncate text-[10px] md:text-xs font-light text-white/50">
                  {formatTime(currentTime)} / {formatTime(validDuration)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <button
                className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/[0.08] hover:text-white/90 active:scale-90 touch-manipulation"
                onClick={skipBackward}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                  />
                </svg>
              </button>

              <button
                className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/[0.12] border border-white/[0.15] text-white backdrop-blur-xl transition-all hover:bg-white/[0.15] hover:scale-105 active:scale-95 touch-manipulation"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/[0.08] hover:text-white/90 active:scale-90 touch-manipulation"
                onClick={skipForward}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/[0.08] hover:text-white/90 active:scale-90 touch-manipulation"
                onClick={handleOpenFullPlayer}
                aria-label="Abrir player completo"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
              <button
                className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/[0.08] hover:text-white/90 active:scale-90 touch-manipulation"
                onClick={onClose}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/[0.08] hover:text-white/90 active:scale-95"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                )}
              </button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="w-28"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
