"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Download, Share2, Volume2, Loader2, Music, Sparkles, Heart, MoreVertical, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { createMusic, getSongStatus, type SunoSong } from "@/lib/suno-api"

const MODELS = [
  { id: "chirp-v3-5", name: "v3.5", badge: "Fast", desc: "Rápido e eficiente" },
  { id: "chirp-v4", name: "v4", badge: "Balanced", desc: "Equilibrado" },
  { id: "chirp-bluejay", name: "v4.5", badge: "Pro", desc: "Qualidade profissional" },
  { id: "chirp-crow", name: "v5", badge: "Ultra Premium", desc: "Máxima qualidade", featured: true },
]

const MAX_PROMPT_LENGTH = 500

export default function MusicStudioPage() {
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("chirp-crow")
  const [instrumental, setInstrumental] = useState(false)
  const [loading, setLoading] = useState(false)
  const [songs, setSongs] = useState<SunoSong[]>([])
  const [expandedLyrics, setExpandedLyrics] = useState<string | null>(null)
  const [playingSongId, setPlayingSongId] = useState<string | null>(null)
  const [credits, setCredits] = useState(2500)
  const audioRef = useRef<HTMLAudioElement>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)

  // Carregar músicas salvas ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('dua_songs')
    if (saved) {
      try {
        setSongs(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load songs:', e)
      }
    }
  }, [])

  // Salvar músicas quando mudarem
  useEffect(() => {
    if (songs.length > 0) {
      localStorage.setItem('dua_songs', JSON.stringify(songs))
    }
  }, [songs])

  // Polling automático para músicas em processamento
  useEffect(() => {
    const processingSongs = songs.filter(s => 
      s.status === 'submitted' || s.status === 'streaming'
    )

    if (processingSongs.length > 0 && !pollingInterval.current) {
      pollingInterval.current = setInterval(async () => {
        const ids = processingSongs.map(s => s.id)
        try {
          const updated = await getSongStatus(ids)
          setSongs(prev => 
            prev.map(song => {
              const update = updated.find(u => u.id === song.id)
              return update || song
            })
          )
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 5000)
    } else if (processingSongs.length === 0 && pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
        pollingInterval.current = null
      }
    }
  }, [songs])

  const handleCreateMusic = async () => {
    if (!prompt.trim() || loading) return

    setLoading(true)
    try {
      const result = await createMusic(prompt, instrumental)
      
      if (result.success && result.songs) {
        setSongs(prev => [...result.songs!, ...prev])
        setPrompt("")
        setCredits(prev => Math.max(0, prev - 10))
      } else {
        alert(result.error || 'Erro ao criar música')
      }
    } catch (err) {
      console.error('Create music error:', err)
      alert('Erro ao criar música. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  const togglePlay = (song: SunoSong) => {
    if (!song.audio_url || song.status !== 'streaming') return

    if (playingSongId === song.id) {
      audioRef.current?.pause()
      setPlayingSongId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = song.audio_url
        audioRef.current.play()
        setPlayingSongId(song.id)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSongStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-1 text-[10px] bg-blue-500/20 text-blue-400 rounded-full">Na fila</span>
      case 'streaming':
        return <span className="px-2 py-1 text-[10px] bg-green-500/20 text-green-400 rounded-full">Pronta</span>
      case 'error':
        return <span className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 rounded-full">Erro</span>
      default:
        return <span className="px-2 py-1 text-[10px] bg-orange-500/20 text-orange-400 rounded-full">A processar...</span>
    }
  }

  const promptLength = prompt.length
  const isPromptValid = promptLength > 0 && promptLength <= MAX_PROMPT_LENGTH

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="h-16 px-6 flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <h1 className="text-[20px] font-bold text-white">DUA Studio</h1>
            <div className="flex items-center gap-6 text-[14px]">
              <a href="/" className="text-white/60 hover:text-white transition-colors">Home</a>
              <a href="/chat" className="text-white/60 hover:text-white transition-colors">Chat</a>
              <a href="/musicstudio" className="text-white font-medium">Music Studio</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-[14px] font-semibold text-white">{credits}</span>
              <span className="text-[12px] text-white/40 ml-2">créditos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 max-w-[1400px] mx-auto px-6 py-12">
        {/* Creation Area */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-[32px] font-bold mb-3">Cria a tua música com IA</h2>
            <p className="text-[16px] text-white/60">Descreve a música que queres e deixa a IA criar para ti</p>
          </div>

          {/* Input Area */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 mb-6">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
              placeholder="Descreve a música que queres criar... (ex: Uma música pop animada sobre o verão, com batidas fortes e melodia cativante)"
              className="min-h-[140px] bg-transparent border-none text-white placeholder:text-white/30 text-[15px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-4">
              <span className={cn(
                "text-[12px]",
                promptLength > MAX_PROMPT_LENGTH ? "text-red-400" : "text-white/40"
              )}>
                {promptLength}/{MAX_PROMPT_LENGTH}
              </span>
            </div>
          </div>

          {/* Model Selector */}
          <div className="mb-6">
            <label className="text-[13px] font-medium text-white/80 mb-3 block">Modelo de IA</label>
            <div className="flex gap-2 flex-wrap">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  disabled={loading}
                  className={cn(
                    "px-4 py-3 rounded-xl border transition-all",
                    selectedModel === model.id
                      ? "bg-white/10 border-white/20 shadow-lg"
                      : "bg-white/5 border-white/10 hover:bg-white/10",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-white">{model.name}</span>
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-medium rounded-full",
                      model.featured 
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "bg-white/10 text-white/70"
                    )}>
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50">{model.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between mb-6 p-4 bg-[#1a1a1a] rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-white/60" />
              <div>
                <p className="text-[14px] font-medium text-white">Instrumental</p>
                <p className="text-[11px] text-white/50">Música sem vocais</p>
              </div>
            </div>
            <Switch
              checked={instrumental}
              onCheckedChange={setInstrumental}
              disabled={loading}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleCreateMusic}
            disabled={!isPromptValid || loading}
            className={cn(
              "w-full h-14 text-[16px] font-semibold rounded-xl transition-all",
              "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              loading && "animate-pulse"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                A criar música...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Criar Música
              </>
            )}
          </Button>
        </div>

        {/* Songs Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[24px] font-bold">As tuas músicas</h3>
            <p className="text-[14px] text-white/50">{songs.length} {songs.length === 1 ? 'música' : 'músicas'}</p>
          </div>

          {songs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Music className="w-10 h-10 text-white/20" />
              </div>
              <p className="text-[16px] text-white/60 mb-2">Ainda não tens músicas</p>
              <p className="text-[14px] text-white/40">Cria a tua primeira música acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
                >
                  {/* Song Header */}
                  <div className="relative aspect-square bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    {song.image_url ? (
                      <img src={song.image_url} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-20 h-20 text-white/20" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {getSongStatusBadge(song.status)}
                    </div>

                    {/* Processing Overlay */}
                    {song.status === 'submitted' && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-3" />
                          <p className="text-[14px] text-white">A criar música...</p>
                        </div>
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    {song.status === 'streaming' && song.audio_url && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <button
                          onClick={() => togglePlay(song)}
                          className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all hover:bg-white/20"
                        >
                          {playingSongId === song.id ? (
                            <Pause className="w-7 h-7 text-white" fill="white" />
                          ) : (
                            <Play className="w-7 h-7 text-white ml-1" fill="white" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="p-5">
                    <h4 className="text-[16px] font-semibold mb-1 truncate">
                      {song.title || "Sem título"}
                    </h4>
                    <p className="text-[13px] text-white/50 mb-4 line-clamp-2">
                      {song.gpt_description_prompt || song.prompt || "Música gerada"}
                    </p>

                    {/* Audio Player */}
                    {song.status === 'streaming' && song.audio_url && (
                      <div className="mb-4">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <button
                            onClick={() => togglePlay(song)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                          >
                            {playingSongId === song.id ? (
                              <Pause className="w-5 h-5" fill="white" />
                            ) : (
                              <Play className="w-5 h-5 ml-0.5" fill="white" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-0" />
                            </div>
                          </div>
                          <span className="text-[11px] text-white/50">2:30</span>
                        </div>
                      </div>
                    )}

                    {/* Lyrics Toggle */}
                    {song.lyric && (
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedLyrics(expandedLyrics === song.id ? null : song.id)}
                          className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <span className="text-[13px] font-medium">Ver Letra</span>
                          {expandedLyrics === song.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedLyrics === song.id && (
                          <div className="mt-3 p-4 bg-white/5 rounded-lg max-h-[200px] overflow-y-auto">
                            <p className="text-[12px] text-white/70 whitespace-pre-wrap leading-relaxed">
                              {song.lyric}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {song.audio_url && (
                        <a
                          href={song.audio_url}
                          download
                          className="flex-1 h-10 px-4 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 transition-all text-[13px] font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      )}
                      <button className="h-10 px-4 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="h-10 px-4 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="h-10 px-4 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Error State */}
                    {song.status === 'error' && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-[12px] text-red-400 mb-2">Erro ao criar música</p>
                        <button className="text-[12px] text-red-400 hover:text-red-300 underline">
                          Tentar novamente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingSongId(null)}
        onError={() => setPlayingSongId(null)}
      />
    </div>
  )
}
