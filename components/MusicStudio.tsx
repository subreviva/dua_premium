"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Download, Music2, Loader2, Volume2, Share2, FileText, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SunoSong, ModelVersion } from "@/lib/types"
import { MODELS, DEFAULT_MODEL } from "@/lib/types"

const EXAMPLE_LYRICS = `[Verse 1]
Walking down the empty street tonight
City lights are fading out of sight
Searching for a place where I belong
Every step I take feels wrong

[Chorus]
Take me home, where the heart is
Through the storm, we'll find our way
Take me home, don't let me go
Together we will stay

[Verse 2]
Memories like shadows on the wall
Whispers of the times we had it all
Now I'm standing at the edge of dreams
Nothing's ever what it seems

[Chorus]
Take me home, where the heart is
Through the storm, we'll find our way
Take me home, don't let me go
Together we will stay

[Bridge]
And if the world comes crashing down
I'll be there to catch you now
We'll rise above the pain and fear
As long as you are near

[Outro]
Take me home...`

export default function MusicStudio() {
  // Tool & Model State
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelVersion>(DEFAULT_MODEL)
  
  // Form State - Simple Mode
  const [prompt, setPrompt] = useState("")
  const [instrumental, setInstrumental] = useState(false)
  
  // Form State - Custom Mode
  const [lyrics, setLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [negativeTags, setNegativeTags] = useState("")
  
  // Generation State
  const [songs, setSongs] = useState<SunoSong[]>([])
  const [loading, setLoading] = useState(false)
  const [pollingIds, setPollingIds] = useState<string[]>([])
  
  // Audio State
  const [playing, setPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Polling timeout
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTime = useRef<number>(0)

  // Auto-polling effect
  useEffect(() => {
    if (pollingIds.length === 0) {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
        pollingInterval.current = null
      }
      return
    }

    pollingStartTime.current = Date.now()
    
    const poll = async () => {
      // Timeout após 120 segundos
      if (Date.now() - pollingStartTime.current > 120000) {
        console.log('⏱️ [Polling] Timeout - stopping')
        setPollingIds([])
        return
      }

      try {
        const response = await fetch(`/api/music/status?ids=${pollingIds.join(',')}`)
        const data = await response.json()

        if (data.success && Array.isArray(data.songs)) {
          setSongs(prev => {
            const updated = [...prev]
            data.songs.forEach((newSong: SunoSong) => {
              const idx = updated.findIndex(s => s.id === newSong.id)
              if (idx >= 0) {
                updated[idx] = newSong
              }
            })
            return updated
          })

          // Stop polling se todos completos ou com erro
          const allDone = data.songs.every((s: SunoSong) => 
            s.status === 'complete' || s.status === 'error'
          )
          
          if (allDone) {
            console.log('✅ [Polling] All songs complete')
            setPollingIds([])
          }
        }
      } catch (error) {
        console.error('❌ [Polling] Error:', error)
      }
    }

    // Poll imediatamente e depois a cada 5s
    poll()
    pollingInterval.current = setInterval(poll, 5000)

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [pollingIds])

  // Audio player controls
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setPlaying(null)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Generate simple mode
  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          instrumental,
          model: selectedModel,
          is_custom: false
        })
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.songs)) {
        const newSongs = data.songs.map((song: SunoSong) => ({
          ...song,
          status: song.status || 'submitted'
        }))
        
        setSongs(prev => [...newSongs, ...prev])
        setPollingIds(newSongs.map((s: SunoSong) => s.id))
        setPrompt('')
      } else {
        console.error('Generation failed:', data.error)
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate custom mode
  const handleCustomGenerate = async () => {
    if (!lyrics.trim() || !title.trim() || !tags.trim()) {
      alert('Por favor, preencha letras, título e tags')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/music/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyrics: lyrics.trim(),
          title: title.trim(),
          tags: tags.trim(),
          negative_tags: negativeTags.trim() || undefined,
          instrumental,
          model: selectedModel
        })
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.songs)) {
        const newSongs = data.songs.map((song: SunoSong) => ({
          ...song,
          status: song.status || 'submitted'
        }))
        
        setSongs(prev => [...newSongs, ...prev])
        setPollingIds(newSongs.map((s: SunoSong) => s.id))
        
        // Clear form
        setLyrics('')
        setTitle('')
        setTags('')
        setNegativeTags('')
      } else {
        console.error('Custom generation failed:', data.error)
      }
    } catch (error) {
      console.error('Custom generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Audio controls
  const togglePlay = (song: SunoSong) => {
    const audio = audioRef.current
    if (!audio || !song.audio_url) return

    if (playing === song.id) {
      audio.pause()
      setPlaying(null)
    } else {
      audio.src = song.audio_url
      audio.play()
      setPlaying(song.id)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const vol = parseFloat(e.target.value)
    audio.volume = vol
    setVolume(vol)
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const loadExample = () => {
    setLyrics(EXAMPLE_LYRICS)
    setTitle("Take Me Home")
    setTags("pop, emotional, male vocals, anthemic")
  }

  const handleRetry = async (song: SunoSong) => {
    // Remove song from list and regenerate with same prompt
    setSongs(prev => prev.filter(s => s.id !== song.id))
    
    if (song.gpt_description_prompt) {
      setPrompt(song.gpt_description_prompt)
    } else if (song.prompt) {
      setPrompt(song.prompt)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <audio ref={audioRef} />
      
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#1a1a1a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                DUA Music Studio
              </h1>
              <p className="text-sm text-gray-400 mt-1">Create music with AI-powered Suno models</p>
            </div>
            
            <Button
              onClick={() => setIsCustomMode(!isCustomMode)}
              variant={isCustomMode ? "default" : "outline"}
              className={cn(
                "transition-all duration-200",
                isCustomMode && "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]"
              )}
            >
              <Music2 className="w-4 h-4 mr-2" />
              {isCustomMode ? 'Custom Mode' : 'Simple Mode'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[400px,1fr] gap-8">
          {/* Left Panel - Generation Form */}
          <div className="space-y-6">
            {/* Model Selector */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">Select Model</h2>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(MODELS) as ModelVersion[]).map((modelId) => {
                  const model = MODELS[modelId]
                  return (
                    <button
                      key={modelId}
                      onClick={() => setSelectedModel(modelId)}
                      className={cn(
                        "text-left p-4 rounded-lg border-2 transition-all duration-200",
                        "hover:scale-[1.02] hover:shadow-lg",
                        selectedModel === modelId
                          ? "border-[#8B5CF6] bg-[#8B5CF6]/10"
                          : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{model.name}</span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          modelId === 'chirp-crow' && "bg-[#F59E0B] text-black",
                          modelId === 'chirp-bluejay' && "bg-[#8B5CF6] text-white",
                          modelId === 'chirp-auk' && "bg-[#EC4899] text-white",
                          modelId === 'chirp-v3-5' && "bg-[#3B82F6] text-white",
                          modelId === 'chirp-v3-0' && "bg-gray-600 text-white"
                        )}>
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{model.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Generation Form */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                {isCustomMode ? 'Custom Generation' : 'Simple Generation'}
              </h2>

              {!isCustomMode ? (
                // Simple Mode
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Describe your music
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="A chill lofi hip hop beat with piano and rain sounds..."
                      className="min-h-[120px] bg-[#0f0f0f] border-[#2a2a2a] focus:border-[#8B5CF6] resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {prompt.length}/500 characters
                    </p>
                  </div>
                </>
              ) : (
                // Custom Mode
                <>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block flex items-center justify-between">
                      Lyrics
                      <Button
                        onClick={loadExample}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-[#8B5CF6]"
                      >
                        Load Example
                      </Button>
                    </label>
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="[Verse 1]&#10;Your lyrics here...&#10;&#10;[Chorus]&#10;..."
                      className="min-h-[200px] bg-[#0f0f0f] border-[#2a2a2a] focus:border-[#8B5CF6] resize-none font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Awesome Song"
                      className="bg-[#0f0f0f] border-[#2a2a2a] focus:border-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Tags</label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="pop, rock, male vocals, energetic"
                      className="bg-[#0f0f0f] border-[#2a2a2a] focus:border-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Negative Tags (opcional)
                    </label>
                    <Input
                      value={negativeTags}
                      onChange={(e) => setNegativeTags(e.target.value)}
                      placeholder="sad, slow, acoustic"
                      className="bg-[#0f0f0f] border-[#2a2a2a] focus:border-[#8B5CF6]"
                    />
                  </div>
                </>
              )}

              {/* Instrumental Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                <span className="text-sm">Instrumental</span>
                <Switch
                  checked={instrumental}
                  onCheckedChange={setInstrumental}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={isCustomMode ? handleCustomGenerate : handleGenerate}
                disabled={loading || (isCustomMode ? !lyrics.trim() || !title.trim() || !tags.trim() : !prompt.trim())}
                className="w-full h-12 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Music'
                )}
              </Button>
            </div>
          </div>

          {/* Right Panel - Songs Grid */}
          <div>
            {songs.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Music2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No songs yet. Start creating!</p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {songs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    playing={playing === song.id}
                    onTogglePlay={() => togglePlay(song)}
                    onRetry={() => handleRetry(song)}
                    currentTime={playing === song.id ? currentTime : 0}
                    duration={playing === song.id ? duration : song.duration || 0}
                    onSeek={handleSeek}
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Song Card Component
interface SongCardProps {
  song: SunoSong
  playing: boolean
  onTogglePlay: () => void
  onRetry: () => void
  currentTime: number
  duration: number
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void
  volume: number
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function SongCard({ song, playing, onTogglePlay, onRetry, currentTime, duration, onSeek, volume, onVolumeChange }: SongCardProps) {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Status: submitted
  if (song.status === 'submitted') {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 animate-pulse">
        <div className="aspect-square bg-[#2a2a2a] rounded-lg mb-4 shimmer" />
        <div className="h-4 bg-[#2a2a2a] rounded w-3/4 mb-2" />
        <div className="h-3 bg-[#2a2a2a] rounded w-1/2" />
        <p className="text-sm text-gray-400 mt-4">⏳ Creating music...</p>
      </div>
    )
  }

  // Status: streaming
  if (song.status === 'streaming') {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <div className="aspect-square bg-[#2a2a2a] rounded-lg mb-4 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin" />
        </div>
        <h3 className="font-semibold truncate">{song.title || 'Untitled'}</h3>
        <p className="text-sm text-gray-400">🎵 Processing audio...</p>
      </div>
    )
  }

  // Status: error
  if (song.status === 'error') {
    return (
      <div className="bg-[#1a1a1a] border border-red-900/50 rounded-xl p-6">
        <div className="aspect-square bg-red-950/20 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="font-semibold truncate text-red-400">{song.title || 'Generation Failed'}</h3>
        <p className="text-sm text-gray-400 mb-4">Failed to generate music</p>
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  // Status: complete
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:scale-[1.02] transition-transform duration-200">
      {/* Artwork */}
      <div className="aspect-square bg-[#2a2a2a] rounded-lg mb-4 overflow-hidden relative group">
        {song.image_url ? (
          <img
            src={song.image_url}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onTogglePlay}
            disabled={!song.audio_url}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
          >
            {playing ? (
              <Pause className="w-8 h-8" fill="white" />
            ) : (
              <Play className="w-8 h-8 ml-1" fill="white" />
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold truncate">{song.title || 'Untitled'}</h3>
          <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-[#2a2a2a] rounded-full">{song.model_name}</span>
            {song.tags && <span className="truncate">{song.tags}</span>}
          </p>
        </div>

        {/* Audio Player */}
        {song.audio_url && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={playing ? currentTime : 0}
              onChange={onSeek}
              className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8B5CF6]"
            />
            
            {/* Time */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{formatTime(playing ? currentTime : 0)}</span>
              <span>{formatTime(duration || song.duration || 0)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center hover:scale-110 transition-transform"
              >
                {playing ? (
                  <Pause className="w-5 h-5" fill="white" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" fill="white" />
                )}
              </button>

              <div className="flex items-center gap-2 flex-1">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={onVolumeChange}
                  className="flex-1 h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              <a
                href={song.audio_url}
                download
                className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {song.lyric && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => alert(song.lyric)}
            >
              <FileText className="w-3 h-3 mr-1" />
              Lyrics
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => navigator.share?.({ url: song.audio_url, title: song.title })}
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
