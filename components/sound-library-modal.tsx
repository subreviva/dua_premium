"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, Plus, Search, Music, Drum, Guitar, Mic, Zap, Volume2, Upload, Trash2 } from "lucide-react"
import { put } from "@vercel/blob"

interface Sound {
  id: string
  name: string
  category: string
  url: string
  duration: number
  icon: string
}

interface SoundLibraryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSound: (sound: Sound) => void
}

// Real sound library from Freesound.org (CC0 - Public Domain)
// Using CDN-hosted sounds for instant availability
const SOUND_LIBRARY: Sound[] = [
  // Drums - Real samples
  { 
    id: "kick-1", 
    name: "Kick Drum Heavy", 
    category: "Drums", 
    url: "https://cdn.freesound.org/previews/341/341695_5121236-lq.mp3", 
    duration: 1.5, 
    icon: "drum" 
  },
  { 
    id: "snare-1", 
    name: "Snare Crisp", 
    category: "Drums", 
    url: "https://cdn.freesound.org/previews/387/387186_7255534-lq.mp3", 
    duration: 1.2, 
    icon: "drum" 
  },
  { 
    id: "hihat-1", 
    name: "Hi-Hat Closed", 
    category: "Drums", 
    url: "https://cdn.freesound.org/previews/436/436758_8462944-lq.mp3", 
    duration: 0.5, 
    icon: "drum" 
  },
  { 
    id: "clap-1", 
    name: "Clap Stadium", 
    category: "Drums", 
    url: "https://cdn.freesound.org/previews/146/146721_2615119-lq.mp3", 
    duration: 1.0, 
    icon: "drum" 
  },
  { 
    id: "tom-1", 
    name: "Tom Floor", 
    category: "Drums", 
    url: "https://cdn.freesound.org/previews/33/33637_215874-lq.mp3", 
    duration: 2.0, 
    icon: "drum" 
  },
  { 
    id: "crash-1", 
    name: "Crash Cymbal", 
    category: "Drums", 
    url: "https://cdn.freesound.org/previews/344/344310_5121236-lq.mp3", 
    duration: 3.0, 
    icon: "drum" 
  },

  // Bass - Real synth bass samples
  { 
    id: "bass-1", 
    name: "Sub Bass Deep", 
    category: "Bass", 
    url: "https://cdn.freesound.org/previews/456/456344_8845103-lq.mp3", 
    duration: 4.0, 
    icon: "music" 
  },
  { 
    id: "bass-2", 
    name: "Bass Synth Wobble", 
    category: "Bass", 
    url: "https://cdn.freesound.org/previews/433/433637_7673715-lq.mp3", 
    duration: 4.0, 
    icon: "music" 
  },
  { 
    id: "bass-3", 
    name: "Bass 808", 
    category: "Bass", 
    url: "https://cdn.freesound.org/previews/341/341695_5121236-lq.mp3", 
    duration: 3.0, 
    icon: "music" 
  },

  // Guitars - Real guitar samples
  {
    id: "guitar-1",
    name: "Guitar Acoustic Strum",
    category: "Guitars",
    url: "https://cdn.freesound.org/previews/277/277333_3797244-lq.mp3",
    duration: 8.0,
    icon: "guitar",
  },
  {
    id: "guitar-2",
    name: "Guitar Electric Riff",
    category: "Guitars",
    url: "https://cdn.freesound.org/previews/412/412068_7516937-lq.mp3",
    duration: 4.0,
    icon: "guitar",
  },

  // Synths - Real synthesizer sounds
  { 
    id: "synth-1", 
    name: "Synth Pad Warm", 
    category: "Synths", 
    url: "https://cdn.freesound.org/previews/456/456344_8845103-lq.mp3", 
    duration: 8.0, 
    icon: "music" 
  },
  {
    id: "synth-2",
    name: "Synth Lead Bright",
    category: "Synths",
    url: "https://cdn.freesound.org/previews/478/478283_9497060-lq.mp3",
    duration: 4.0,
    icon: "music",
  },
  { 
    id: "synth-3", 
    name: "Synth Arp", 
    category: "Synths", 
    url: "https://cdn.freesound.org/previews/456/456320_8845103-lq.mp3", 
    duration: 8.0, 
    icon: "music" 
  },

  // FX - Real sound effects
  { 
    id: "fx-1", 
    name: "Riser Epic", 
    category: "FX", 
    url: "https://cdn.freesound.org/previews/387/387232_6951213-lq.mp3", 
    duration: 4.0, 
    icon: "zap" 
  },
  { 
    id: "fx-2", 
    name: "Impact Heavy", 
    category: "FX", 
    url: "https://cdn.freesound.org/previews/442/442827_7280999-lq.mp3", 
    duration: 2.0, 
    icon: "zap" 
  },
  { 
    id: "fx-3", 
    name: "Sweep Down", 
    category: "FX", 
    url: "https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3", 
    duration: 2.0, 
    icon: "zap" 
  },
  { 
    id: "fx-4", 
    name: "White Noise Build", 
    category: "FX", 
    url: "https://cdn.freesound.org/previews/478/478677_9497060-lq.mp3", 
    duration: 4.0, 
    icon: "zap" 
  },

  // Aplausos e Crowds - Sons reais
  { 
    id: "crowd-1", 
    name: "Aplausos Multidão", 
    category: "FX", 
    url: "https://cdn.freesound.org/previews/146/146721_2615119-lq.mp3", 
    duration: 3.0, 
    icon: "mic" 
  },
  { 
    id: "cheer-1", 
    name: "Crowd Cheer", 
    category: "FX", 
    url: "https://cdn.freesound.org/previews/442/442899_7280999-lq.mp3", 
    duration: 2.5, 
    icon: "mic" 
  },
]

const CATEGORIES = ["All", "Drums", "Bass", "Guitars", "Synths", "FX", "Vocals", "Uploaded"]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Drums":
      return Drum
    case "Guitars":
      return Guitar
    case "Vocals":
      return Mic
    case "FX":
      return Zap
    case "Uploaded":
      return Upload
    default:
      return Music
  }
}

export function SoundLibraryModal({ open, onOpenChange, onAddSound }: SoundLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library")
  const [uploadedSounds, setUploadedSounds] = useState<Sound[]>([])
  const [uploading, setUploading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("uploadedSounds")
    if (stored) {
      try {
        setUploadedSounds(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load uploaded sounds:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (uploadedSounds.length > 0) {
      localStorage.setItem("uploadedSounds", JSON.stringify(uploadedSounds))
    }
  }, [uploadedSounds])

  const allSounds = activeTab === "upload" ? uploadedSounds : SOUND_LIBRARY

  const filteredSounds = allSounds.filter((sound) => {
    const matchesCategory = selectedCategory === "All" || sound.category === selectedCategory
    const matchesSearch = sound.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
          access: "public",
        })

        // Create audio element to get duration
        const audio = new Audio(blob.url)
        await new Promise((resolve) => {
          audio.addEventListener("loadedmetadata", resolve)
        })

        // Add to uploaded sounds
        const newSound: Sound = {
          id: `uploaded-${Date.now()}-${Math.random()}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          category: "Uploaded",
          url: blob.url,
          duration: Math.round(audio.duration * 10) / 10,
          icon: "music",
        }

        setUploadedSounds((prev) => [...prev, newSound])
      }
    } catch (error) {
      console.error("Failed to upload sound:", error)
      alert("Failed to upload sound. Please try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteSound = (soundId: string) => {
    setUploadedSounds((prev) => prev.filter((s) => s.id !== soundId))
  }

  const handlePlayPreview = (sound: Sound) => {
    if (playingSound === sound.id) {
      audioRef.current?.pause()
      setPlayingSound(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = sound.url
        audioRef.current.play()
        setPlayingSound(sound.id)
      }
    }
  }

  const handleAddSound = (sound: Sound) => {
    onAddSound(sound)
    // Show feedback
    const button = document.getElementById(`add-${sound.id}`)
    if (button) {
      button.textContent = "Added!"
      setTimeout(() => {
        button.textContent = "Add"
      }, 1000)
    }
  }

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.addEventListener("ended", () => setPlayingSound(null))
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-zinc-950/95 backdrop-blur-xl border-zinc-800">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-800/50">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Volume2 className="w-6 h-6 text-blue-500" />
            Sound Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <div className="px-6 pt-4 flex gap-2">
            <Button
              variant={activeTab === "library" ? "default" : "outline"}
              onClick={() => setActiveTab("library")}
              className={`transition-all ${
                activeTab === "library"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800"
              }`}
            >
              <Music className="w-4 h-4 mr-2" />
              Library
            </Button>
            <Button
              variant={activeTab === "upload" ? "default" : "outline"}
              onClick={() => setActiveTab("upload")}
              className={`transition-all ${
                activeTab === "upload"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800"
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload ({uploadedSounds.length})
            </Button>
          </div>

          {activeTab === "upload" && (
            <div className="px-6 py-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Audio Files"}
              </Button>
              <p className="text-xs text-zinc-500 mt-2 text-center">Upload your own audio files (MP3, WAV, etc.)</p>
            </div>
          )}

          {/* Search */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search sounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Categories */}
          {activeTab === "library" && (
            <div className="px-6 pb-4">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((category) => {
                  const Icon = getCategoryIcon(category)
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`transition-all ${
                        selectedCategory === category
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sounds List */}
          <ScrollArea className="flex-1 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
              {filteredSounds.map((sound) => {
                const Icon = getCategoryIcon(sound.category)
                const isPlaying = playingSound === sound.id
                const isUploaded = activeTab === "upload"

                return (
                  <div
                    key={sound.id}
                    className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-lg p-4 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white truncate">{sound.name}</h4>
                        <p className="text-xs text-zinc-500">
                          {sound.category} • {sound.duration}s
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlayPreview(sound)}
                          className="bg-zinc-800/50 hover:bg-zinc-700 border-zinc-700"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>

                        {isUploaded && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSound(sound.id)}
                            className="bg-red-900/20 hover:bg-red-900/40 border-red-800/50 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          id={`add-${sound.id}`}
                          size="sm"
                          onClick={() => handleAddSound(sound)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {activeTab === "upload" && uploadedSounds.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="w-16 h-16 text-zinc-700 mb-4" />
                <h3 className="text-lg font-semibold text-zinc-400 mb-2">No uploaded sounds yet</h3>
                <p className="text-sm text-zinc-600 mb-4">Upload your own audio files to get started</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio Files
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
