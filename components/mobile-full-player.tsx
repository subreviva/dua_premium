"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreVertical,
  ChevronUp,
} from "lucide-react"

interface Track {
  id: string
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

interface MobileFullPlayerProps {
  track: Track
  isOpen: boolean
  onClose: () => void
  onRemix?: () => void
}

export function MobileFullPlayer({ track, isOpen, onClose, onRemix }: MobileFullPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track?.duration || 0)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (track && audioRef.current && isOpen) {
      const audioUrl = track.audioUrl || track.streamAudioUrl
      if (audioUrl) {
        setIsLoading(true)
        audioRef.current.src = audioUrl
        audioRef.current.load()

        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              setIsLoading(false)
            })
            .catch((error) => {
              console.error("[v0] Audio play error:", error)
              setIsLoading(false)
            })
        }
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [track, isOpen])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const handleEnded = () => setIsPlaying(false)
    const handleCanPlay = () => setIsLoading(false)
    const handleWaiting = () => setIsLoading(true)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("waiting", handleWaiting)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("waiting", handleWaiting)
    }
  }, [])

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
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      if (navigator.vibrate) {
        navigator.vibrate(5)
      }
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  const skipForward = () => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikeCount((prev) => Math.max(0, prev - 1))
    } else {
      setLiked(true)
      setDisliked(false)
      setLikeCount((prev) => prev + 1)
    }
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10])
    }
  }

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false)
    } else {
      setDisliked(true)
      setLiked(false)
      if (liked) {
        setLikeCount((prev) => Math.max(0, prev - 1))
      }
    }
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const handleShare = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }

    // Create a better share URL with track ID
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

        // Try to include image if supported (some browsers support files in share)
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
        // User cancelled or share failed
        if (err.name === "AbortError") {
          console.log("[v0] Share cancelled by user")
        } else {
          console.error("[v0] Share failed:", err)
          // Fallback to copy link
          await fallbackCopyLink(shareUrl)
        }
      }
    } else {
      // No native share support - show fallback options
      await fallbackCopyLink(shareUrl)
    }
  }

  const fallbackCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      // Show success feedback
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
      // Final fallback - show URL in prompt
      const userCopied = prompt("Copie este link para partilhar:", url)
      if (userCopied !== null && navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!isOpen) return null

  return (
    <>
      <audio ref={audioRef} preload="auto" />
      <div className="fixed inset-0 z-[100] bg-black md:hidden animate-in fade-in duration-300">
        {/* Background Image with Premium Gradient Overlay */}
        <div className="absolute inset-0">
          {track.imageUrl ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-orange-900/50 animate-pulse" />
              )}
              <img
                src={track.imageUrl || "/placeholder.svg"}
                alt={track.title}
                className={`h-full w-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 animate-gradient-shift" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-safe pb-2 animate-in slide-in-from-top-2 duration-500">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-black/25 backdrop-blur-2xl hover:bg-black/35 active:scale-90 touch-manipulation transition-all duration-200 border border-white/15 shadow-lg"
              onClick={onClose}
            >
              <ChevronDown className="h-5 w-5 text-white drop-shadow-lg" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-black/25 backdrop-blur-2xl hover:bg-black/35 active:scale-90 touch-manipulation transition-all duration-200 border border-white/15 shadow-lg"
              onClick={() => {
                console.log("[v0] Menu button clicked")
                setShowMore(!showMore)
                if (navigator.vibrate) {
                  navigator.vibrate(10)
                }
              }}
            >
              <MoreVertical className="h-5 w-5 text-white drop-shadow-lg" />
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-3.5 top-[16%] flex flex-col gap-3.5 animate-in slide-in-from-right duration-500 delay-150 z-20">
            {onRemix && (
              <button
                className="flex flex-col items-center gap-1 touch-manipulation active:scale-90 transition-all duration-200"
                onClick={onRemix}
              >
                <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/25 backdrop-blur-2xl border border-white/15 shadow-xl hover:bg-black/35 transition-all duration-200">
                  <Repeat className="h-[18px] w-[18px] text-white drop-shadow-lg" />
                </div>
                <span className="text-[9px] font-bold text-white drop-shadow-lg tracking-wider">REMIX</span>
              </button>
            )}

            <button
              className="flex flex-col items-center gap-1 touch-manipulation active:scale-90 transition-all duration-200"
              onClick={handleLike}
            >
              <div
                className={`flex h-[44px] w-[44px] items-center justify-center rounded-full backdrop-blur-2xl border shadow-xl transition-all duration-300 ${
                  liked
                    ? "bg-gradient-to-br from-pink-500 to-rose-500 border-pink-400/50 scale-105"
                    : "bg-black/25 border-white/15 hover:bg-black/35"
                }`}
              >
                <ThumbsUp
                  className={`h-[18px] w-[18px] transition-all duration-300 ${
                    liked ? "fill-white text-white scale-105" : "text-white"
                  } drop-shadow-lg`}
                />
              </div>
              <span className="text-[9px] font-bold text-white drop-shadow-lg">{likeCount}</span>
            </button>

            <button
              className="flex flex-col items-center gap-1 touch-manipulation active:scale-90 transition-all duration-200"
              onClick={handleDislike}
            >
              <div
                className={`flex h-[44px] w-[44px] items-center justify-center rounded-full backdrop-blur-2xl border shadow-xl transition-all duration-300 ${
                  disliked
                    ? "bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500/50 scale-105"
                    : "bg-black/25 border-white/15 hover:bg-black/35"
                }`}
              >
                <ThumbsDown
                  className={`h-[18px] w-[18px] transition-all duration-300 ${
                    disliked ? "fill-white text-white scale-105" : "text-white"
                  } drop-shadow-lg`}
                />
              </div>
              <span className="text-[8px] font-bold text-white drop-shadow-lg leading-tight text-center">
                NÃO
                <br />
                GOSTO
              </span>
            </button>

            <button
              className="flex flex-col items-center gap-1 touch-manipulation active:scale-90 transition-all duration-200"
              onClick={() => {}}
            >
              <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/25 backdrop-blur-2xl border border-white/15 shadow-xl hover:bg-black/35 transition-all duration-200">
                <MessageCircle className="h-[18px] w-[18px] text-white drop-shadow-lg" />
              </div>
              <span className="text-[9px] font-bold text-white drop-shadow-lg">{commentCount}</span>
            </button>

            <button
              className="flex flex-col items-center gap-1 touch-manipulation active:scale-90 transition-all duration-200"
              onClick={handleShare}
            >
              <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/25 backdrop-blur-2xl border border-white/15 shadow-xl hover:bg-black/35 transition-all duration-200">
                <Share2 className="h-[18px] w-[18px] text-white drop-shadow-lg" />
              </div>
              <span className="text-[8px] font-bold text-white drop-shadow-lg leading-tight text-center">
                COMPAR
                <br />
                TILHAR
              </span>
            </button>
          </div>

          {/* Center Content - Spacer */}
          <div className="flex-1" />

          {/* Bottom Section */}
          <div className="space-y-4 px-5 pb-safe pt-3 animate-in slide-in-from-bottom duration-500 delay-100 relative z-10">
            {/* Track Info */}
            <div className="space-y-2">
              <h1 className="text-[26px] font-bold text-white drop-shadow-2xl leading-tight tracking-tight">
                {track.title || "Untitled"}
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 shadow-lg ring-2 ring-white/20" />
                <span className="text-[13px] font-semibold text-white/95 drop-shadow-lg">
                  {track.modelName || "Unknown Artist"}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[progressPercentage]}
                onValueChange={handleProgressChange}
                max={100}
                step={0.1}
                className="cursor-pointer touch-manipulation [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg [&_[role=slider]]:transition-transform [&_[role=slider]]:active:scale-125"
              />
              <div className="flex items-center justify-between text-[11px] font-semibold text-white/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5 py-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-[52px] w-[52px] rounded-full text-white hover:bg-white/10 active:scale-90 touch-manipulation transition-all duration-200 hover:text-white"
                onClick={skipBackward}
              >
                <SkipBack className="h-6 w-6 drop-shadow-lg" />
              </Button>

              <Button
                size="icon"
                disabled={isLoading}
                className="h-[76px] w-[76px] rounded-full bg-white text-black shadow-2xl hover:scale-105 active:scale-95 touch-manipulation transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                onClick={togglePlay}
              >
                {isLoading ? (
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-black/20 border-t-black" />
                ) : isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-0.5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-[52px] w-[52px] rounded-full text-white hover:bg-white/10 active:scale-90 touch-manipulation transition-all duration-200 hover:text-white"
                onClick={skipForward}
              >
                <SkipForward className="h-6 w-6 drop-shadow-lg" />
              </Button>
            </div>

            {/* Ver mais button */}
            <button
              className="flex w-full items-center justify-center gap-2 py-2.5 touch-manipulation active:scale-95 transition-all duration-200"
              onClick={() => {
                setShowMore(!showMore)
                if (navigator.vibrate) {
                  navigator.vibrate(5)
                }
              }}
            >
              <ChevronUp
                className={`h-4 w-4 text-white/50 transition-all duration-300 ${showMore ? "rotate-180" : ""}`}
              />
              <span className="text-[13px] font-semibold text-white/50">Ver mais</span>
            </button>
          </div>
        </div>

        {/* More Info Sheet */}
        {showMore && (
          <>
            <div
              className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowMore(false)}
            />
            <div className="absolute inset-x-0 bottom-0 z-30 max-h-[70vh] overflow-y-auto rounded-t-[28px] bg-card/95 backdrop-blur-xl p-5 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-white/10">
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted/50" />
              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Descrição
                  </h3>
                  <p className="text-[13px] text-foreground leading-relaxed">{track.prompt || "Sem descrição"}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Tags</h3>
                  <p className="text-[13px] text-foreground">{track.tags || "Sem tags"}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Modelo
                  </h3>
                  <p className="text-[13px] text-foreground">{track.modelName || "Unknown"}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
