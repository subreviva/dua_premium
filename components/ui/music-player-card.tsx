"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Heart, MessageCircle, Share2 } from "lucide-react"

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return "00:00"
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

interface MusicPlayerCardProps {
  albumArt: string
  songTitle: string
  artistName: string
  artistAvatar: string
  audioSrc: string
  likes: number
  comments: number
}

export const MusicPlayerCard: React.FC<MusicPlayerCardProps> = ({
  albumArt,
  songTitle,
  artistName,
  artistAvatar,
  audioSrc,
  likes,
  comments,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(likes)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
      if (progressBarRef.current) {
        const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0
        progressBarRef.current.style.setProperty("--progress", `${progress}%`)
      }
    }

    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)

    if (isPlaying) {
      audio.play().catch((error) => console.error("Error playing audio:", error))
    } else {
      audio.pause()
    }

    return () => {
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
    }
  }, [isPlaying, audioSrc])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value)
    }
  }

  const togglePlayPause = () => setIsPlaying(!isPlaying)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1)
  }

  return (
    <div className="w-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden">
      <style>{`
        .progress-bar {
            --progress: 0%;
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            background: hsl(var(--muted));
            border-radius: 3px;
            outline: none;
            cursor: pointer;
            background-image: linear-gradient(hsl(var(--primary)), hsl(var(--primary)));
            background-size: var(--progress) 100%;
            background-repeat: no-repeat;
        }

        .progress-bar::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            background: white;
            border: 2px solid hsl(var(--primary));
            border-radius: 50%;
            cursor: pointer;
        }

        .progress-bar::-moz-range-thumb {
            width: 14px;
            height: 14px;
            background: white;
            border: 2px solid hsl(var(--primary));
            border-radius: 50%;
            cursor: pointer;
        }
       `}</style>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Artist Info Header */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <img
          src={artistAvatar || "/placeholder.svg"}
          alt={artistName}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${artistName}`
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground">{artistName}</h3>
          <p className="text-xs text-muted-foreground">Há 2 horas</p>
        </div>
      </div>

      {/* Album Art */}
      <div className="relative aspect-square">
        <img
          src={albumArt || "/placeholder.svg"}
          alt={`${songTitle} album art`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80"
          }}
        />

        {/* Play Button Overlay */}
        <motion.button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300"
          whileTap={{ scale: 0.95 }}
        >
          <div className="bg-white/90 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? "pause" : "play"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {isPlaying ? (
                  <Pause size={28} className="text-black" />
                ) : (
                  <Play size={28} className="text-black ml-1" />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.button>
      </div>

      {/* Song Info and Controls */}
      <div className="p-4">
        <h2 className="text-lg font-bold tracking-tight mb-1">{songTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{artistName}</p>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-muted-foreground w-10 text-left">{formatTime(currentTime)}</span>
          <input
            ref={progressBarRef}
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="progress-bar flex-grow"
          />
          <span className="text-xs font-mono text-muted-foreground w-10 text-right">{formatTime(duration)}</span>
        </div>

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-sm font-medium">{localLikes}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{comments}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
