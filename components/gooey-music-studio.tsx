"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Share2, Play, Pause, MoreVertical, Music, Loader2, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Song {
  id: string
  status: "processing" | "completed" | "failed"
  progress: number
  prompt: string
  audioUrl?: string
  imageUrl?: string
  videoUrl?: string
  title?: string
  lyrics?: string
  tags?: string[]
  error?: string
  model?: string
}

export function GooeyMusicStudio() {
  // Form states
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("v5")
  const [instrumental, setInstrumental] = useState(false)
  const [showStyleInput, setShowStyleInput] = useState(false)
  const [style, setStyle] = useState("")
  const [duration, setDuration] = useState(120)
  const [outputs, setOutputs] = useState(1)
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const characterCount = prompt.length
  const maxChars = 500

  // Load songs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("gooey-songs")
    if (stored) {
      try {
        setSongs(JSON.parse(stored))
      } catch (e) {
        console.error("Error loading songs:", e)
      }
    }
  }, [])

  // Save songs to localStorage
  useEffect(() => {
    if (songs.length > 0) {
      localStorage.setItem("gooey-songs", JSON.stringify(songs))
    }
  }, [songs])

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      setError("Prompt muito curto (mínimo 10 caracteres)")
      return
    }

    if (loading) return

    setLoading(true)
    setError("")

    try {
      // 1. Generate music
      const res = await fetch("/api/gooey/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          instrumental,
          style: showStyleInput ? style : "",
          duration,
          outputs,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to generate music")
      }

      const data = await res.json()
      const runId = data.run_id || data.id

      if (!runId) {
        throw new Error("No run_id received from API")
      }

      console.log("[Gooey] Run started:", runId)

      // 2. Add card with processing status
      const newSong: Song = {
        id: runId,
        status: "processing",
        progress: 0,
        prompt,
        model,
      }

      setSongs((prev) => [newSong, ...prev])

      // 3. Start polling
      pollStatus(runId)

      // 4. Reset form
      setPrompt("")
      setStyle("")
    } catch (err) {
      console.error("[Gooey] Error:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar música")
    } finally {
      setLoading(false)
    }
  }

  const pollStatus = async (runId: string) => {
    let attempts = 0
    const maxAttempts = 24 // 2 minutes (24 * 5s)

    const poll = setInterval(async () => {
      attempts++

      try {
        const res = await fetch(`/api/gooey/status/${runId}`)
        if (!res.ok) throw new Error("Status check failed")

        const data = await res.json()
        console.log(`[Gooey] Poll ${attempts}:`, data.status)

        // Calculate progress
        const progress = data.status === "completed" 
          ? 100 
          : data.status === "failed" 
          ? 0 
          : Math.min((attempts / maxAttempts) * 100, 95)

        // Update song
        setSongs((prev) =>
          prev.map((song) =>
            song.id === runId
              ? {
                  ...song,
                  status: data.status,
                  progress,
                  audioUrl: data.output?.audio_url,
                  imageUrl: data.output?.image_url,
                  videoUrl: data.output?.video_url,
                  title: data.output?.title,
                  lyrics: data.output?.text,
                  tags: data.output?.tags,
                  error: data.error,
                }
              : song
          )
        )

        // Stop polling when done
        if (data.status === "completed" || data.status === "failed" || attempts >= maxAttempts) {
          clearInterval(poll)
          
          if (attempts >= maxAttempts && data.status === "processing") {
            setSongs((prev) =>
              prev.map((song) =>
                song.id === runId
                  ? { ...song, status: "failed", error: "Timeout - verifica estado manualmente" }
                  : song
              )
            )
          }
        }
      } catch (err) {
        console.error("[Gooey] Poll error:", err)
        clearInterval(poll)
        setSongs((prev) =>
          prev.map((song) =>
            song.id === runId
              ? { ...song, status: "failed", error: "Erro ao verificar estado" }
              : song
          )
        )
      }
    }, 5000) // Poll every 5 seconds
  }

  const handleDownload = async (audioUrl: string, title: string) => {
    try {
      const res = await fetch(audioUrl)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "music"}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download error:", err)
      alert("Erro ao fazer download")
    }
  }

  const handleShare = (song: Song) => {
    if (navigator.share && song.audioUrl) {
      navigator.share({
        title: song.title || "Música criada com Gooey.AI",
        text: song.prompt,
        url: song.audioUrl,
      })
    } else if (song.audioUrl) {
      navigator.clipboard.writeText(song.audioUrl)
      alert("Link copiado!")
    }
  }

  const handleRetry = (song: Song) => {
    setPrompt(song.prompt)
    handleGenerate()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Gooey Music Studio
          </h1>
          <p className="text-neutral-400">Powered by Suno AI (v5, v4.5, v3.5)</p>
        </div>

        {/* Generation Form */}
        <Card className="bg-neutral-900 border-neutral-800 mb-8">
          <CardContent className="p-6 space-y-6">
            {/* Prompt Textarea */}
            <div>
              <label className="block text-sm font-medium mb-2">Descreve a música</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
                placeholder="Ex: Uma música energética de rock com guitarras pesadas e bateria agressiva..."
                className="min-h-[120px] bg-neutral-800 border-neutral-700 text-white resize-none"
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${characterCount > maxChars * 0.9 ? "text-orange-500" : "text-neutral-500"}`}>
                  {characterCount}/{maxChars}
                </span>
                {characterCount > 0 && characterCount < 10 && (
                  <span className="text-sm text-red-500">Mínimo 10 caracteres</span>
                )}
              </div>
            </div>

            {/* Settings Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Modelo</label>
                <Select value={model} onValueChange={setModel} disabled={loading}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="v5">Suno v5 (Melhor)</SelectItem>
                    <SelectItem value="v4.5">Suno v4.5</SelectItem>
                    <SelectItem value="v3.5">Suno v3.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Duração</label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))} disabled={loading}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="120">2 minutos</SelectItem>
                    <SelectItem value="180">3 minutos</SelectItem>
                    <SelectItem value="240">4 minutos</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Outputs */}
              <div>
                <label className="block text-sm font-medium mb-2">Outputs</label>
                <Select value={outputs.toString()} onValueChange={(v) => setOutputs(Number(v))} disabled={loading}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="1">1 música</SelectItem>
                    <SelectItem value="2">2 músicas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Settings Row 2 */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Instrumental Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instrumental"
                  checked={instrumental}
                  onCheckedChange={(checked) => setInstrumental(checked as boolean)}
                  disabled={loading}
                />
                <label htmlFor="instrumental" className="text-sm font-medium cursor-pointer">
                  Instrumental (sem vocals)
                </label>
              </div>

              {/* Custom Style Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customStyle"
                  checked={showStyleInput}
                  onCheckedChange={(checked) => setShowStyleInput(checked as boolean)}
                  disabled={loading}
                />
                <label htmlFor="customStyle" className="text-sm font-medium cursor-pointer">
                  Estilo personalizado
                </label>
              </div>
            </div>

            {/* Style Input */}
            {showStyleInput && (
              <div>
                <label className="block text-sm font-medium mb-2">Estilo de Música</label>
                <Input
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Ex: heavy metal, male vocals, fast drums"
                  className="bg-neutral-800 border-neutral-700 text-white"
                  disabled={loading}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Especifica género, mood, tipo de vocal, instrumentos...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || prompt.length < 10}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A criar música...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-5 w-5" />
                  Criar Música
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {songs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Músicas Criadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  playingId={playingId}
                  onPlay={setPlayingId}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onRetry={handleRetry}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Song Card Component
function SongCard({
  song,
  playingId,
  onPlay,
  onDownload,
  onShare,
  onRetry,
}: {
  song: Song
  playingId: string | null
  onPlay: (id: string | null) => void
  onDownload: (url: string, title: string) => void
  onShare: (song: Song) => void
  onRetry: (song: Song) => void
}) {
  const [showLyrics, setShowLyrics] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioElement) {
      if (playingId === song.id) {
        audioElement.play()
      } else {
        audioElement.pause()
      }
    }
  }, [playingId, song.id, audioElement])

  if (song.status === "processing") {
    return (
      <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
        <CardContent className="p-6">
          <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center mb-4 animate-pulse">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-sm font-medium">{Math.floor(song.progress)}%</p>
              <p className="text-xs text-neutral-400 mt-1">A criar música...</p>
            </div>
          </div>
          <p className="text-sm text-neutral-400 line-clamp-2">{song.prompt}</p>
        </CardContent>
      </Card>
    )
  }

  if (song.status === "failed") {
    return (
      <Card className="bg-neutral-900 border-red-500/50 overflow-hidden">
        <CardContent className="p-6">
          <div className="aspect-square bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-red-500" />
              <p className="text-sm text-red-500">Erro</p>
            </div>
          </div>
          <p className="text-sm text-neutral-400 mb-2">{song.error || "Falha ao criar música"}</p>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-4">{song.prompt}</p>
          <Button
            onClick={() => onRetry(song)}
            variant="outline"
            size="sm"
            className="w-full border-red-500/50 hover:bg-red-500/10"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Completed
  return (
    <Card className="bg-neutral-900 border-neutral-800 overflow-hidden group hover:border-purple-500/50 transition-all">
      <CardContent className="p-0">
        {/* Cover Image */}
        {song.imageUrl && (
          <div className="aspect-square overflow-hidden">
            <img
              src={song.imageUrl}
              alt={song.title || "Music cover"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2">{song.title || "Untitled"}</h3>

          {/* Tags */}
          {song.tags && song.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {song.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Audio Player */}
          {song.audioUrl && (
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full border-purple-500 hover:bg-purple-500/20"
                onClick={() => onPlay(playingId === song.id ? null : song.id)}
              >
                {playingId === song.id ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>

              <audio
                ref={setAudioElement}
                src={song.audioUrl}
                onEnded={() => onPlay(null)}
                className="hidden"
              />

              <div className="flex-1">
                <audio controls src={song.audioUrl} className="w-full h-8" style={{ height: "32px" }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {song.audioUrl && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-neutral-700 hover:bg-neutral-800"
                onClick={() => onDownload(song.audioUrl!, song.title || "music")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-neutral-700 hover:bg-neutral-800"
              onClick={() => onShare(song)}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-neutral-900 border-neutral-800">
                <DropdownMenuItem onClick={() => setShowLyrics(!showLyrics)}>
                  {showLyrics ? "Hide" : "Show"} Lyrics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRetry(song)}>Remix</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Lyrics (Expandable) */}
          {showLyrics && song.lyrics && (
            <div className="pt-3 border-t border-neutral-800 animate-in slide-in-from-top">
              <p className="text-xs text-neutral-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {song.lyrics}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
