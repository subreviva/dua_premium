"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, MoreHorizontal, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SongContextMenu } from "@/components/song-context-menu"
import { Slider } from "@/components/ui/slider"

interface Song {
  id: string
  title: string
  version: string
  genre: string
  duration: string
  thumbnail: string
  gradient: string
  uploaded?: boolean
  featured?: boolean
  taskId?: string
  musicIndex?: number
  audioUrl?: string
}

interface SongCardProps {
  song: Song
  onSelect: () => void
  isSelected: boolean
  onEdit?: () => void
}

export function SongCard({ song, onSelect, isSelected, onEdit }: SongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (song.audioUrl && !audioRef.current) {
      audioRef.current = new Audio(song.audioUrl)
      audioRef.current.volume = volume / 100
      
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0)
      })
      
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
      })
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [song.audioUrl, volume])

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={`group flex items-center gap-3 lg:gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer ${
        isSelected ? "bg-neutral-900" : ""
      }`}
      onClick={onSelect}
      onDoubleClick={onEdit}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-gradient-to-br ${song.gradient} flex items-center justify-center`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 lg:h-4 lg:w-4 text-black" fill="black" />
            ) : (
              <Play className="h-3 w-3 lg:h-4 lg:w-4 text-black ml-0.5" fill="black" />
            )}
          </button>
        </div>
        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs font-medium">
          {song.duration}
        </div>
        
        {/* Barra de Progresso */}
        {isPlaying && (
          <div
            className="absolute -bottom-1 left-0 right-0 h-1 bg-neutral-800 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold truncate text-sm lg:text-base">{song.title}</h3>
          {song.version && (
            <span className="px-2 py-0.5 bg-pink-600 text-xs rounded font-medium flex-shrink-0">{song.version}</span>
          )}
          {song.uploaded && <span className="text-xs text-neutral-400 flex-shrink-0">📤 Uploaded</span>}
        </div>
        <p className="text-xs lg:text-sm text-neutral-400 truncate">{song.genre}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {/* Controle de Volume */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setShowVolumeSlider(!showVolumeSlider)
            }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setTimeout(() => setShowVolumeSlider(false), 500)}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          {showVolumeSlider && (
            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-900 border border-white/10 rounded-lg p-3 shadow-xl"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-24 flex flex-col items-center gap-2">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  orientation="vertical"
                  className="h-full"
                />
                <span className="text-xs text-neutral-400 font-mono">{isMuted ? 0 : volume}%</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setShowContextMenu(!showContextMenu)
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {showContextMenu && (
            <SongContextMenu song={song} onClose={() => setShowContextMenu(false)} onEdit={onEdit} position="right" />
          )}
        </div>
      </div>

      {song.featured && <span className="text-yellow-500 flex-shrink-0">⭐</span>}
    </div>
  )
}
