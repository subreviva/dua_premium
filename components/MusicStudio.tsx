"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Download, Music2, Loader2, Volume2, Share2, FileText, RefreshCw, History, Coins, ChevronDown, ChevronUp, Copy, Check, Repeat2, Scissors, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SunoSong, ModelVersion, CreditsInfo } from "@/lib/types"
import { MODELS, DEFAULT_MODEL } from "@/lib/types"
import { useToast, ToastContainer } from "@/components/ui/toast"

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
  // Toast system
  const { toasts, success, error, warning, closeToast } = useToast()
  
  // Tool & Model State
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelVersion>(DEFAULT_MODEL)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  // Form State - Simple Mode
  const [prompt, setPrompt] = useState("")
  const [instrumental, setInstrumental] = useState(false)
  
  // Form State - Custom Mode
  const [lyrics, setLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [negativeTags, setNegativeTags] = useState("")
  
  // Advanced Features State
  const [extendAudioId, setExtendAudioId] = useState("")
  const [extendPrompt, setExtendPrompt] = useState("")
  const [stemsAudioId, setStemsAudioId] = useState("")
  const [lyricsPrompt, setLyricsPrompt] = useState("")
  const [generatedLyrics, setGeneratedLyrics] = useState("")
  
  // Generation State
  const [songs, setSongs] = useState<SunoSong[]>([])
  const [loading, setLoading] = useState(false)
  const [pollingIds, setPollingIds] = useState<string[]>([])
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  
  // Credits State
  const [credits, setCredits] = useState<CreditsInfo | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(false)
  
  // Audio State
  const [playing, setPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Share State
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Polling timeout
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTime = useRef<number>(0)

  // Load credits on mount
  useEffect(() => {
    loadCredits()
  }, [])

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dua-music-history')
    if (saved) {
      try {
        const history = JSON.parse(saved)
        setSongs(history.slice(0, 10))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  // Save to history
  useEffect(() => {
    if (songs.length > 0) {
      const completed = songs.filter(s => s.status === 'complete')
      localStorage.setItem('dua-music-history', JSON.stringify(completed.slice(0, 10)))
    }
  }, [songs])

  // Load credits
  const loadCredits = async () => {
    setLoadingCredits(true)
    try {
      const response = await fetch('/api/music/credits')
      const data = await response.json()
      if (data.success) {
        setCredits(data.credits)
        if (data.credits.credits_left < 10) {
          warning(`Only ${data.credits.credits_left} credits remaining!`)
        }
      }
    } catch (err) {
      console.error('Failed to load credits:', err)
    } finally {
      setLoadingCredits(false)
    }
  }

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
        warning('⏱️ Polling timeout. Check history later.')
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
                const oldStatus = updated[idx].status
                updated[idx] = newSong
                // Notify on completion
                if (oldStatus !== 'complete' && newSong.status === 'complete') {
                  success(`🎉 ${newSong.title || 'Song'} is ready!`)
                  loadCredits() // Refresh credits
                }
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
      } catch (err) {
        console.error('❌ [Polling] Error:', err)
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
    if (!prompt.trim() || prompt.trim().length < 10) {
      error('Prompt must be at least 10 characters')
      return
    }

    setLoading(true)
    try {
      success('✅ Creating music...')
      
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
        error(`❌ Generation failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      error('❌ Failed to create music')
      console.error('Generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate custom mode
  const handleCustomGenerate = async () => {
    if (!lyrics.trim() || !title.trim() || !tags.trim()) {
      error('Please fill lyrics, title and tags')
      return
    }

    if (lyrics.trim().length < 10) {
      error('Lyrics must be at least 10 characters')
      return
    }

    setLoading(true)
    try {
      success('✅ Creating custom music...')
      
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
        error(`❌ Custom generation failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      error('❌ Failed to create custom music')
      console.error('Custom generation error:', err)
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

  // Remix functionality
  const handleRemix = (song: SunoSong) => {
    if (song.lyric && song.title && song.tags) {
      setIsCustomMode(true)
      setLyrics(song.lyric)
      setTitle(song.title)
      setTags(song.tags)
      success('✨ Loaded song data for remix!')
    } else if (song.prompt || song.gpt_description_prompt) {
      setIsCustomMode(false)
      setPrompt(song.prompt || song.gpt_description_prompt || '')
      success('✨ Loaded prompt for remix!')
    }
  }

  // Copy share link
  const handleCopyLink = async (song: SunoSong) => {
    if (!song.audio_url) return
    try {
      await navigator.clipboard.writeText(song.audio_url)
      setCopiedId(song.id)
      success('📋 Link copied!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      error('Failed to copy link')
    }
  }

  // Batch download
  const handleBatchDownload = () => {
    const selected = songs.filter(s => selectedSongs.includes(s.id))
    if (selected.length === 0) {
      warning('No songs selected')
      return
    }

    selected.forEach(song => {
      if (song.audio_url) {
        const a = document.createElement('a')
        a.href = song.audio_url
        a.download = `${song.title || 'song'}.mp3`
        a.click()
      }
    })

    success(`Downloaded ${selected.length} songs`)
    setSelectedSongs([])
  }

  // Toggle song selection
  const toggleSongSelection = (id: string) => {
    setSelectedSongs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Advanced: Extend audio
  const handleExtend = async () => {
    if (!extendAudioId || !extendPrompt) {
      error('Audio ID and prompt required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/music/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_id: extendAudioId,
          prompt: extendPrompt,
          model: selectedModel
        })
      })

      const data = await response.json()
      if (data.success) {
        success('✅ Extending audio...')
        const newSongs = data.songs.map((song: SunoSong) => ({
          ...song,
          status: song.status || 'submitted'
        }))
        setSongs(prev => [...newSongs, ...prev])
        setPollingIds(newSongs.map((s: SunoSong) => s.id))
        setExtendAudioId('')
        setExtendPrompt('')
      } else {
        error(`Failed to extend: ${data.error}`)
      }
    } catch (err) {
      error('Failed to extend audio')
    } finally {
      setLoading(false)
    }
  }

  // Advanced: Generate stems
  const handleGenerateStems = async () => {
    if (!stemsAudioId) {
      error('Audio ID required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/music/stems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_id: stemsAudioId })
      })

      const data = await response.json()
      if (data.success) {
        success('✅ Generating stems...')
        setStemsAudioId('')
      } else {
        error(`Failed to generate stems: ${data.error}`)
      }
    } catch (err) {
      error('Failed to generate stems')
    } finally {
      setLoading(false)
    }
  }

  // Advanced: Generate lyrics first
  const handleGenerateLyrics = async () => {
    if (!lyricsPrompt || lyricsPrompt.length < 10) {
      error('Lyrics prompt must be at least 10 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/music/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: lyricsPrompt })
      })

      const data = await response.json()
      if (data.success && data.data) {
        setGeneratedLyrics(data.data.text || '')
        setTitle(data.data.title || '')
        success('✅ Lyrics generated!')
        setIsCustomMode(true)
        setLyrics(data.data.text || '')
      } else {
        error(`Failed to generate lyrics: ${data.error}`)
      }
    } catch (err) {
      error('Failed to generate lyrics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <audio ref={audioRef} />
      <ToastContainer toasts={toasts} onClose={closeToast} />
      
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
            
            <div className="flex items-center gap-4">
              {/* Credits Display */}
              {credits && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <Coins className={cn(
                    "w-4 h-4",
                    credits.credits_left < 10 ? "text-red-400" : "text-[#F59E0B]"
                  )} />
                  <div className="text-sm">
                    <span className={cn(
                      "font-semibold",
                      credits.credits_left < 10 ? "text-red-400" : "text-white"
                    )}>
                      {credits.credits_left}
                    </span>
                    <span className="text-gray-400"> credits</span>
                  </div>
                </div>
              )}

              {/* History Toggle */}
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="outline"
                size="sm"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>

              {/* Mode Toggle */}
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

            {/* Advanced Options */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#2a2a2a]/30 transition-colors"
              >
                <span className="text-sm font-semibold">Advanced Options</span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="p-6 pt-0 space-y-4 border-t border-[#2a2a2a]">
                  {/* Generate Lyrics First */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300">Generate Lyrics First</h3>
                    <Input
                      value={lyricsPrompt}
                      onChange={(e) => setLyricsPrompt(e.target.value)}
                      placeholder="A song about summer love..."
                      className="bg-[#0f0f0f] border-[#2a2a2a] text-sm"
                    />
                    <Button
                      onClick={handleGenerateLyrics}
                      disabled={loading || !lyricsPrompt.trim()}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <FileText className="w-3 h-3 mr-2" />
                      Generate Lyrics
                    </Button>
                  </div>

                  {/* Extend Audio */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300">Extend Audio</h3>
                    <Input
                      value={extendAudioId}
                      onChange={(e) => setExtendAudioId(e.target.value)}
                      placeholder="Audio ID to extend"
                      className="bg-[#0f0f0f] border-[#2a2a2a] text-sm"
                    />
                    <Input
                      value={extendPrompt}
                      onChange={(e) => setExtendPrompt(e.target.value)}
                      placeholder="Extension prompt"
                      className="bg-[#0f0f0f] border-[#2a2a2a] text-sm"
                    />
                    <Button
                      onClick={handleExtend}
                      disabled={loading || !extendAudioId.trim() || !extendPrompt.trim()}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Extend Audio
                    </Button>
                  </div>

                  {/* Generate Stems */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-300">Separate Stems</h3>
                    <Input
                      value={stemsAudioId}
                      onChange={(e) => setStemsAudioId(e.target.value)}
                      placeholder="Audio ID for stems"
                      className="bg-[#0f0f0f] border-[#2a2a2a] text-sm"
                    />
                    <Button
                      onClick={handleGenerateStems}
                      disabled={loading || !stemsAudioId.trim()}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Scissors className="w-3 h-3 mr-2" />
                      Generate Stems
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Songs Grid */}
          <div>
            {/* Batch Actions */}
            {selectedSongs.length > 0 && (
              <div className="mb-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {selectedSongs.length} song{selectedSongs.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={handleBatchDownload}
                  size="sm"
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected
                </Button>
              </div>
            )}
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
                    selected={selectedSongs.includes(song.id)}
                    onTogglePlay={() => togglePlay(song)}
                    onRetry={() => handleRetry(song)}
                    onRemix={() => handleRemix(song)}
                    onCopyLink={() => handleCopyLink(song)}
                    onToggleSelect={() => toggleSongSelection(song.id)}
                    copied={copiedId === song.id}
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
  selected: boolean
  copied: boolean
  onTogglePlay: () => void
  onRetry: () => void
  onRemix: () => void
  onCopyLink: () => void
  onToggleSelect: () => void
  currentTime: number
  duration: number
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void
  volume: number
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function SongCard({ song, playing, selected, copied, onTogglePlay, onRetry, onRemix, onCopyLink, onToggleSelect, currentTime, duration, onSeek, volume, onVolumeChange }: SongCardProps) {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Status: submitted
  if (song.status === 'submitted') {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 animate-pulse relative">
        {/* Checkbox */}
        <div className="absolute top-4 right-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-2 border-[#2a2a2a] bg-[#0f0f0f] cursor-pointer"
          />
        </div>
        
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
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 relative">
        {/* Checkbox */}
        <div className="absolute top-4 right-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-2 border-[#2a2a2a] bg-[#0f0f0f] cursor-pointer"
          />
        </div>
        
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
      <div className="bg-[#1a1a1a] border border-red-900/50 rounded-xl p-6 relative">
        {/* Checkbox */}
        <div className="absolute top-4 right-4 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-2 border-[#2a2a2a] bg-[#0f0f0f] cursor-pointer"
          />
        </div>
        
        <div className="aspect-square bg-red-950/20 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="font-semibold truncate text-red-400">{song.title || 'Generation Failed'}</h3>
        <p className="text-sm text-gray-400 mb-4">Failed to generate music</p>
        <div className="flex gap-2">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={onRemix}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Repeat2 className="w-4 h-4 mr-2" />
            Remix
          </Button>
        </div>
      </div>
    )
  }

  // Status: complete
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:scale-[1.02] transition-transform duration-200 relative">
      {/* Checkbox */}
      <div className="absolute top-4 right-4 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-2 border-[#2a2a2a] bg-[#0f0f0f] checked:bg-[#8B5CF6] checked:border-[#8B5CF6] cursor-pointer"
        />
      </div>
      
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
        <div className="grid grid-cols-3 gap-2">
          {song.lyric && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => alert(song.lyric)}
            >
              <FileText className="w-3 h-3 mr-1" />
              Lyrics
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onCopyLink}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onRemix}
          >
            <Repeat2 className="w-3 h-3 mr-1" />
            Remix
          </Button>
        </div>
      </div>
    </div>
  )
}
