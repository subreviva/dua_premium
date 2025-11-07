"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreVertical,
  Download,
  Scissors,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Track {
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

interface UnifiedPlayerProps {
  track: Track | null
  onClose: () => void
  onRemix?: () => void
  onOpenDetails?: () => void
}

export function UnifiedPlayer({ track, onClose, onRemix, onOpenDetails }: UnifiedPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track?.duration || 0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (track && audioRef.current) {
      let audioUrl = track.audioUrl
      if (!audioUrl && track.streamAudioUrl) {
        audioUrl = track.streamAudioUrl.endsWith(".mp3") ? track.streamAudioUrl : `${track.streamAudioUrl}.mp3`
      }

      if (!audioUrl) {
        setAudioError("URL de áudio não disponível")
        return
      }

      setAudioError(null)
      setDuration(track.duration || 0)
      setIsLoading(true)
      audioRef.current.src = audioUrl
      audioRef.current.volume = volume / 100

      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setIsLoading(false)
          })
          .catch((err) => {
            console.error("[v0] Play error:", err)
            setAudioError("Falha ao reproduzir áudio")
            setIsPlaying(false)
            setIsLoading(false)
          })
      }
    }
  }, [track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      } else if (track?.duration) {
        setDuration(track.duration)
      }
    }
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      setAudioError("Falha ao carregar áudio")
      setIsPlaying(false)
      setIsLoading(false)
    }
    const handleCanPlay = () => setIsLoading(false)
    const handleWaiting = () => setIsLoading(true)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("waiting", handleWaiting)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("waiting", handleWaiting)
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
        setIsPlaying(false)
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch((error) => console.error("[v0] Play error:", error))
        }
      }
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const validDuration = duration && isFinite(duration) && duration > 0 ? duration : track?.duration || 0
    if (!validDuration || validDuration <= 0) return

    const newTime = (value[0] / 100) * validDuration
    if (isFinite(newTime) && newTime >= 0 && newTime <= validDuration) {
      audio.currentTime = newTime
      setCurrentTime(newTime)
      if (navigator.vibrate) navigator.vibrate(5)
    }
  }

  const skipBackward = () => {
    if (audioRef.current && isFinite(audioRef.current.currentTime)) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }

  const skipForward = () => {
    const validDuration = duration && isFinite(duration) && duration > 0 ? duration : track?.duration || 0
    if (audioRef.current && isFinite(audioRef.current.currentTime) && validDuration > 0) {
      audioRef.current.currentTime = Math.min(validDuration, audioRef.current.currentTime + 10)
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }

  const toggleMute = () => setIsMuted(!isMuted)

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikeCount((prev) => Math.max(0, prev - 1))
    } else {
      setLiked(true)
      setDisliked(false)
      setLikeCount((prev) => prev + 1)
    }
    if (navigator.vibrate) navigator.vibrate([10, 50, 10])
  }

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false)
    } else {
      setDisliked(true)
      setLiked(false)
      if (liked) setLikeCount((prev) => Math.max(0, prev - 1))
    }
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    console.log("[v0] Share button clicked")
    if (navigator.vibrate) navigator.vibrate(10)

    if (!track) return

    const shareUrl = `${window.location.origin}/track/${track.audioId}`
    const shareTitle = track.title
    const shareText = `Ouça "${track.title}" criado com DUA Music Studio!\n\n${track.prompt || "Música gerada por IA"}`

    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        }

        if (track.imageUrl && navigator.canShare) {
          try {
            const response = await fetch(track.imageUrl)
            const blob = await response.blob()
            const file = new File([blob], "cover.jpg", { type: "image/jpeg" })

            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file]
            }
          } catch (imgError) {
            console.log("[v0] Could not include image in share:", imgError)
          }
        }

        await navigator.share(shareData)
        console.log("[v0] Share successful")
      } catch (err: any) {
        console.log("[v0] Share cancelled or failed:", err.message)
        if (err.name !== "AbortError") {
          await fallbackCopyLink(shareUrl)
        }
      }
    } else {
      await fallbackCopyLink(shareUrl)
    }
  }

  const fallbackCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      const toast = document.createElement("div")
      toast.className =
        "fixed bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-2 duration-300 font-semibold text-sm"
      toast.textContent = "Link copiado!"
      document.body.appendChild(toast)

      setTimeout(() => {
        toast.classList.add("animate-out", "fade-out", "slide-out-to-bottom-2")
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 2000)

      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    } catch (clipboardErr) {
      console.error("[v0] Clipboard error:", clipboardErr)
      const userCopied = prompt("Copie este link para partilhar:", url)
      if (userCopied !== null && navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  const handleDownload = async (format: "mp3" | "wav" | "midi") => {
    console.log("[v0] Download clicked:", format)
    if (!track) return

    try {
      setIsDownloading(true)
      const url = track.audioUrl || track.streamAudioUrl

      if (!url) {
        throw new Error("URL de áudio não disponível")
      }

      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${track.title || "track"}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(blobUrl)

      if (navigator.vibrate) navigator.vibrate(10)
      console.log("[v0] Download completed:", format)
    } catch (error) {
      console.error("[v0] Download error:", error)
      alert(`Erro ao descarregar: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleStemSeparation = (type: "2-stem" | "12-stem") => {
    console.log("[v0] Stem separation clicked:", type)
    if (navigator.vibrate) navigator.vibrate(10)
    setIsFullscreen(false)
    if (onOpenDetails) {
      onOpenDetails()
    } else {
      console.error("[v0] onOpenDetails callback not provided")
      alert("Funcionalidade de separação de stems em breve!")
    }
  }

  const handleExpandClick = () => {
    const isDesktop = window.innerWidth >= 768

    if (isDesktop && track) {
      router.push(`/track/${track.audioId}`)
    } else {
      setIsFullscreen(true)
    }

    if (navigator.vibrate) navigator.vibrate(10)
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

  if (isFullscreen) {
    return (
      <>
        <audio ref={audioRef} preload="metadata" />
        <div className="fixed inset-0 z-[100] bg-black md:hidden">
          <div className="absolute inset-0">
            {track.imageUrl && (
              <img
                src={track.imageUrl || "/placeholder.svg"}
                alt={track.title}
                className="h-full w-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between px-4 pt-safe pb-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-11 w-11 rounded-full bg-black/20 backdrop-blur-xl"
                onClick={() => setIsFullscreen(false)}
              >
                <ChevronDown className="h-6 w-6 text-white" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-11 w-11 rounded-full bg-black/20 backdrop-blur-xl">
                    <MoreVertical className="h-6 w-6 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 z-[200]"
                  sideOffset={8}
                  collisionPadding={16}
                  alignOffset={-8}
                >
                  <DropdownMenuLabel className="text-base font-semibold">Opções</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                    Download
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload("mp3")
                    }}
                    disabled={isDownloading}
                    className="py-3 text-sm pl-6"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? "A descarregar..." : "MP3"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload("wav")
                    }}
                    disabled={isDownloading}
                    className="py-3 text-sm pl-6"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? "A descarregar..." : "WAV"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload("midi")
                    }}
                    disabled={isDownloading}
                    className="py-3 text-sm pl-6"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? "A descarregar..." : "MIDI"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                    Separar Stems
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStemSeparation("2-stem")
                    }}
                    className="py-3 text-sm pl-6"
                  >
                    <Scissors className="mr-2 h-4 w-4" />2 Stems (Vocal + Instrumental)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStemSeparation("12-stem")
                    }}
                    className="py-3 text-sm pl-6"
                  >
                    <Scissors className="mr-2 h-4 w-4" />
                    12 Stems (Completo)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1" />

            <div className="absolute right-4 top-[15%] flex flex-col items-center gap-3">
              <button className="flex flex-col items-center gap-1" onClick={handleLike}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-200 active:scale-95">
                  <ThumbsUp className="h-4 w-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-white">{likeCount}</span>
              </button>

              <button className="flex flex-col items-center gap-1" onClick={handleDislike}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-200 active:scale-95">
                  <ThumbsDown className="h-4 w-4 text-white" />
                </div>
              </button>

              <button
                className="flex flex-col items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare(e)
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-200 active:scale-95">
                  <Share2 className="h-4 w-4 text-white" />
                </div>
              </button>
            </div>

            <div className="space-y-5 px-6 pb-safe pt-4">
              <div className="space-y-2.5">
                <h1 className="text-[28px] font-bold text-white">{track.title || "Untitled"}</h1>
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-rose-500" />
                  <span className="text-sm font-semibold text-white">demo1</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Slider value={[progressPercentage]} onValueChange={handleProgressChange} max={100} step={0.1} />
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(validDuration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 py-2">
                <Button size="icon" variant="ghost" onClick={skipBackward}>
                  <SkipBack className="h-7 w-7 text-white" />
                </Button>
                <Button size="icon" className="h-[84px] w-[84px] rounded-full" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-9 w-9" /> : <Play className="h-9 w-9" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={skipForward}>
                  <SkipForward className="h-7 w-7 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl pb-safe cursor-pointer"
        onClick={handleExpandClick}
      >
        <div className="px-4 pt-3">
          <Slider value={[progressPercentage]} onValueChange={handleProgressChange} max={100} step={0.1} />
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted">
                {track.imageUrl && (
                  <img
                    src={track.imageUrl || "/placeholder.svg"}
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{track.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(validDuration)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  skipBackward()
                }}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  skipForward()
                }}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
