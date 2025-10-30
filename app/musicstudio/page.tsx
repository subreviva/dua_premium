"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Library, Volume2, VolumeX, Pause, Play } from "lucide-react"
import { CreateSection } from "@/components/music/create-section"
import { LibrarySection } from "@/components/music/library-section"
import { CreditsPanel } from "@/components/music/credits-panel"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { SunoSong } from "@/lib/suno-api"

export default function MusicStudioPage() {
  const [tracks, setTracks] = useState<SunoSong[]>([])
  const [credits, setCredits] = useState(2500)
  const [loading, setLoading] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SunoSong | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const [pollingIds, setPollingIds] = useState<string[]>([])

  useEffect(() => {
    const savedTracks = localStorage.getItem("suno-music-tracks")
    if (savedTracks) {
      try {
        setTracks(JSON.parse(savedTracks))
      } catch (e) {
        console.error("Failed to load tracks:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (tracks.length > 0) {
      localStorage.setItem("suno-music-tracks", JSON.stringify(tracks))
    }
  }, [tracks])

  useEffect(() => {
    fetchCredits()
  }, [])

  // Poll for task status updates
  useEffect(() => {
    if (pollingIds.length === 0) {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
        pollingInterval.current = null
      }
      return
    }

    pollingInterval.current = setInterval(() => {
      pollingIds.forEach(async (taskId) => {
        try {
          const response = await fetch(`/api/music/status?taskId=${taskId}`)
          const data = await response.json()

          if (data.status === "complete" || data.status === "error") {
            setPollingIds(prev => prev.filter(id => id !== taskId))
            
            if (data.status === "complete" && data.data) {
              setTracks(prev => prev.map(track => 
                track.id === taskId ? { ...track, ...data.data, status: "complete" } : track
              ))
            } else if (data.status === "error") {
              setTracks(prev => prev.map(track =>
                track.id === taskId ? { ...track, status: "error" as const, errorMessage: data.message } : track
              ))
            }
          } else if (data.status === "processing") {
            setTracks(prev => prev.map(track =>
              track.id === taskId ? { ...track, status: "streaming" as const } : track
            ))
          }
        } catch (error) {
          console.error("Polling error:", error)
        }
      })
    }, 3000)

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current)
    }
  }, [pollingIds])

  // Audio player effects
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/music/credits")
      const data = await response.json()
      if (data.credits !== undefined) {
        setCredits(data.credits)
      }
    } catch (error) {
      console.error("Failed to fetch credits:", error)
    }
  }

  const handleCreateMusic = async (formData: any) => {
    setLoading(true)
    try {
      const requestBody: any = {
        prompt: formData.prompt,
        model: formData.model,
        customMode: formData.customMode,
        instrumental: formData.instrumental,
        callBackUrl: `${window.location.origin}/api/music/callback`,
      }

      if (formData.lyrics) requestBody.lyrics = formData.lyrics
      if (formData.title) requestBody.title = formData.title
      if (formData.tags) requestBody.tags = formData.tags
      if (formData.negativeTags?.length) requestBody.negativeTags = formData.negativeTags
      if (formData.styleWeight !== undefined) requestBody.styleWeight = formData.styleWeight
      if (formData.weirdnessConstraint !== undefined) requestBody.weirdnessConstraint = formData.weirdnessConstraint
      if (formData.persona) requestBody.persona = formData.persona

      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.success && data.taskId) {
        const newTrack: SunoSong = {
          id: data.taskId,
          title: formData.title || "Untitled",
          prompt: formData.prompt,
          tags: formData.tags || "",
          model_name: formData.model,
          status: "submitted" as const,
          created_at: new Date().toISOString(),
          image_url: "",
          lyric: formData.lyrics || "",
          audio_url: "",
          video_url: "",
          gpt_description_prompt: formData.prompt,
          type: "gen",
          duration: 0,
        }

        setTracks(prev => [newTrack, ...prev])
        setPollingIds(prev => [...prev, data.taskId])
        fetchCredits()
      } else {
        alert(`Error: ${data.message || "Failed to create music"}`)
      }
    } catch (error) {
      console.error("Create music error:", error)
      alert("Failed to create music. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTrack = (track: SunoSong) => {
    if (!track.audio_url) {
      alert("Audio not available yet")
      return
    }

    if (currentlyPlaying?.id === track.id && isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      setCurrentlyPlaying(track)
      if (audioRef.current) {
        audioRef.current.src = track.audio_url
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleTrackAction = async (trackId: string, action: string) => {
    const track = tracks.find(t => t.id === trackId)
    if (!track) return

    switch (action) {
      case "download-mp3":
        if (track.audio_url) window.open(track.audio_url, "_blank")
        break
      case "download-wav":
        // TODO: Implement WAV conversion
        console.log("WAV download:", trackId)
        break
      case "share":
        const shareUrl = `${window.location.origin}/track/${trackId}`
        if (navigator.share) {
          navigator.share({ title: track.title || "My Suno Music", url: shareUrl })
        } else {
          navigator.clipboard.writeText(shareUrl)
          alert("Share link copied!")
        }
        break
      case "extend":
      case "remix":
      case "replace-section":
      case "crop-fade":
        console.log(action, trackId)
        break
      case "trash":
        if (confirm("Move this track to trash?")) {
          setTracks(prev => prev.filter(t => t.id !== trackId))
          if (currentlyPlaying?.id === trackId) {
            audioRef.current?.pause()
            setCurrentlyPlaying(null)
            setIsPlaying(false)
          }
        }
        break
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current || !currentlyPlaying) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressSeek = (value: number[]) => {
    if (!audioRef.current || !currentlyPlaying) return
    const newTime = (value[0] / 100) * audioRef.current.duration
    audioRef.current.currentTime = newTime
    setProgress(value[0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <audio ref={audioRef} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Music Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create professional music with AI-powered tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="w-full rounded-none border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 h-14">
                <TabsTrigger value="create" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create
                </TabsTrigger>
                <TabsTrigger value="library" className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  <Library className="w-4 h-4 mr-2" />
                  Library
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="p-6">
                <CreateSection
                  onGenerate={handleCreateMusic}
                  isGenerating={loading}
                  credits={credits}
                />
              </TabsContent>

              <TabsContent value="library" className="p-6">
                <LibrarySection
                  songs={tracks.map(t => ({
                    id: t.id,
                    title: t.title,
                    imageUrl: t.image_url || '',
                    audioUrl: t.audio_url || '',
                    status: t.status as any,
                    duration: t.duration,
                    model: t.model_name,
                    style: t.tags,
                    genre: t.tags.split(',')[0],
                    createdAt: t.created_at,
                    prompt: t.prompt
                  }))}
                  onPlaySong={(id) => {
                    const track = tracks.find(t => t.id === id)
                    if (track) handlePlayTrack(track)
                  }}
                  onDownloadSong={(id) => handleTrackAction(id, 'download-mp3')}
                  onShareSong={(id) => handleTrackAction(id, 'share')}
                  onExtendSong={(id) => handleTrackAction(id, 'extend')}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <CreditsPanel 
              credits={credits} 
              plan="pro"
              onUpgrade={() => console.log('Upgrade clicked')}
              onSupport={() => console.log('Support clicked')}
            />
          </div>
        </div>

        {/* Global Audio Player (Bottom Bar) */}
        {currentlyPlaying && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                {/* Track Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {currentlyPlaying.image_url ? (
                    <img
                      src={currentlyPlaying.image_url}
                      alt={currentlyPlaying.title || "Track"}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {currentlyPlaying.title || "Untitled"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {currentlyPlaying.tags || currentlyPlaying.model_name}
                    </p>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-4 flex-[2]">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    className="rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <Slider
                      value={[progress]}
                      max={100}
                      step={0.1}
                      onValueChange={handleProgressSeek}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2 w-32">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="shrink-0"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      setVolume(value[0])
                      setIsMuted(false)
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom padding for global player */}
      {currentlyPlaying && <div className="h-24" />}
    </div>
  )
}
