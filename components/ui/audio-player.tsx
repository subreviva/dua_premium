"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, X, ChevronUp, ChevronDown } from "lucide-react"

interface Song {
  id: number
  title: string
  artist: string
  plays: string
  cover: string
  description?: string
  lyrics?: string
}

interface Comment {
  id: number
  user: string
  timestamp: string
  timeInSong: string
  text: string
  date: string
}

interface AudioPlayerProps {
  song: Song | null
  onClose: () => void
}

function AudioPlayer({ song, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(333)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // 3 minutes default
  const [comment, setComment] = useState("")
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off")

  const audioRef = useRef<HTMLAudioElement>(null)

  // Mock comments data
  const [comments] = useState<Comment[]>([
    {
      id: 1,
      user: "Laura",
      timestamp: "26 days ago",
      timeInSong: "02:44",
      text: "this is so emotional, i can't , it's SO good!! <3",
      date: "26 days ago",
    },
    {
      id: 2,
      user: "Midnight",
      timestamp: "about 2 months ago",
      timeInSong: "02:30",
      text: "So emotional you can't stop this song from breaking your heart 😭💔 will done tho",
      date: "about 2 months ago",
    },
    {
      id: 3,
      user: "NUR AREESYA QISTINA BINTI ADLEE KPM-Murid",
      timestamp: "3 months ago",
      timeInSong: "01:15",
      text: "This song is amazing! Love the melody and the lyrics.",
      date: "3 months ago",
    },
  ])

  const mockLyrics = `[Verse 1]
Walk with me, into the deep
You're not alone—just wait and see
The lost ones, we hold each other
And together, we're finally free
In the golden haze of a broken dawn
I wonder what we could've been
If we had chosen different roads
If we had never given in

[Chorus]
Follow now, down below (follow now, follow low)
You're not alone, let it show (follow now, follow low)
We're the fallen, hand in hand
In this forgotten, shadowed land`

  useEffect(() => {
    if (!song) return

    // Simulate audio progress
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, duration, song])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    setCurrentTime(Math.floor(percentage * duration))
  }

  if (!song) return null

  return (
    <>
      {/* Expanded Player Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto">
          <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <ChevronDown className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Side - Player */}
                <div>
                  {/* Album Cover */}
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-2xl">
                    <img
                      src={song.cover || "/placeholder.svg"}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Song Info */}
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{song.title}</h2>
                    <p className="text-lg text-white/60">
                      {song.artist} • {song.plays} plays
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div
                        className="h-1.5 bg-white/10 rounded-full cursor-pointer group"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="h-full bg-purple-500 rounded-full relative transition-all group-hover:bg-purple-400"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-white/50">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsShuffle(!isShuffle)}
                          className={cn(
                            "text-white/70 hover:text-white hover:bg-white/10",
                            isShuffle && "text-purple-400",
                          )}
                        >
                          <Shuffle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <SkipBack className="w-5 h-5" />
                        </Button>
                      </div>

                      <Button
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-14 h-14 rounded-full bg-white hover:bg-white/90 text-black shadow-lg"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <SkipForward className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"]
                            const currentIndex = modes.indexOf(repeatMode)
                            setRepeatMode(modes[(currentIndex + 1) % modes.length])
                          }}
                          className={cn(
                            "text-white/70 hover:text-white hover:bg-white/10",
                            repeatMode !== "off" && "text-purple-400",
                          )}
                        >
                          <Repeat className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Like Button */}
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={cn(
                          "text-white/70 hover:text-white hover:bg-white/10",
                          isLiked && "text-red-500 hover:text-red-400",
                        )}
                      >
                        <Heart className={cn("w-5 h-5 mr-2", isLiked && "fill-current")} />
                        <span>{likeCount}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Lyrics & Comments */}
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Description</h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {song.description ||
                        "Create a melancholic, atmospheric indie-pop/R&B track inspired by D4VD. Slow tempo (70-85 BPM). Use ambient guitars, reverb-drenched textures, and lo-fi production."}
                    </p>
                  </div>

                  {/* Lyrics */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Lyrics</h3>
                    <pre className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {song.lyrics || mockLyrics}
                    </pre>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Comments</h3>

                    {/* Add Comment */}
                    <div className="mb-6">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add your comment..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none min-h-[80px]"
                      />
                      <Button
                        size="sm"
                        disabled={!comment.trim()}
                        className="mt-2 bg-purple-500 hover:bg-purple-600 text-white"
                        onClick={() => {
                          console.log("[v0] Comment posted:", comment)
                          setComment("")
                        }}
                      >
                        Post Comment
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.id} className="border-t border-white/10 pt-4 first:border-0 first:pt-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-white text-sm">{c.user}</p>
                              <p className="text-xs text-white/40">{c.timestamp}</p>
                            </div>
                            <button className="text-purple-400 text-xs font-medium hover:text-purple-300">
                              {c.timeInSong}
                            </button>
                          </div>
                          <p className="text-white/70 text-sm">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Player Bar */}
      {!isExpanded && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-6 py-3">
            {/* Progress Bar */}
            <div className="h-1 bg-white/10 rounded-full cursor-pointer group mb-3 -mt-2" onClick={handleProgressClick}>
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Song Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={song.cover || "/placeholder.svg"}
                  alt={song.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-white text-sm truncate">{song.title}</h4>
                  <p className="text-xs text-white/50 truncate">
                    {song.artist} • {song.plays} plays
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={cn(
                    "text-white/70 hover:text-white hover:bg-white/10 w-8 h-8",
                    isShuffle && "text-purple-400",
                  )}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-white/90 text-black"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"]
                    const currentIndex = modes.indexOf(repeatMode)
                    setRepeatMode(modes[(currentIndex + 1) % modes.length])
                  }}
                  className={cn(
                    "text-white/70 hover:text-white hover:bg-white/10 w-8 h-8",
                    repeatMode !== "off" && "text-purple-400",
                  )}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    "text-white/70 hover:text-white hover:bg-white/10 h-8 px-3",
                    isLiked && "text-red-500 hover:text-red-400",
                  )}
                >
                  <Heart className={cn("w-4 h-4 mr-1.5", isLiked && "fill-current")} />
                  <span className="text-xs">{likeCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(true)}
                  className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AudioPlayer
