"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Music2, Scissors, Plus, Download, RefreshCw, Loader2, ChevronRight, Music, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SunoSong } from "@/lib/suno-api"

const tools = [
  { id: "generate", icon: Sparkles, name: "Criar Música", desc: "Gere músicas com IA", credits: 10 },
  { id: "custom", icon: Music2, name: "Modo Custom", desc: "Controle total", credits: 10 },
  { id: "extend", icon: Plus, name: "Estender", desc: "Prolongue músicas", credits: 5 },
  { id: "stems", icon: Scissors, name: "Separar Stems", desc: "Isole vocais", credits: 10 },
]

const MODELS = [
  { id: "chirp-v3-5", name: "v3.5", badge: "Fast", desc: "Rápido - 4 min" },
  { id: "chirp-v3-0", name: "v3", badge: "Balanced", desc: "Equilibrado - 2 min" },
  { id: "chirp-v2-0", name: "v2", badge: "Vintage", desc: "Clássico - 1.3 min" },
]

export default function MusicStudioPage() {
  const [selectedTool, setSelectedTool] = useState("generate")
  const [selectedModel, setSelectedModel] = useState("chirp-v3-5")
  const [loading, setLoading] = useState(false)
  const [tracks, setTracks] = useState<SunoSong[]>([])
  const [selectedTrack, setSelectedTrack] = useState<SunoSong | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [credits, setCredits] = useState(2500)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Form states
  const [prompt, setPrompt] = useState("")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [instrumental, setInstrumental] = useState(false)
  const [audioId, setAudioId] = useState("")
  const [continueAt, setContinueAt] = useState("")
  
  // Polling state
  const [pollingIds, setPollingIds] = useState<string[]>([])
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadTracks()
  }, [])

  // Polling automático para tracks em geração
  useEffect(() => {
    if (pollingIds.length > 0) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => stopPolling()
  }, [pollingIds])

  const startPolling = () => {
    if (pollingInterval.current) return

    pollingInterval.current = setInterval(async () => {
      if (pollingIds.length === 0) {
        stopPolling()
        return
      }

      try {
        const response = await fetch(`/api/music/status?ids=${pollingIds.join(',')}`)
        const data = await response.json()

        if (data.success && Array.isArray(data.songs)) {
          // Atualizar tracks existentes
          setTracks(prev => {
            const updated = [...prev]
            data.songs.forEach((song: SunoSong) => {
              const index = updated.findIndex(t => t.id === song.id)
              if (index >= 0) {
                updated[index] = song
              } else {
                updated.unshift(song)
              }
            })
            return updated
          })

          // Remover IDs completados ou com erro do polling
          const completedIds = data.songs
            .filter((s: SunoSong) => s.status === 'complete' || s.status === 'error')
            .map((s: SunoSong) => s.id)

          if (completedIds.length > 0) {
            setPollingIds(prev => prev.filter(id => !completedIds.includes(id)))
            
            // Se todos completaram, parar loading
            if (completedIds.length === pollingIds.length) {
              setLoading(false)
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000) // Poll a cada 5 segundos
  }

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
  }

  const loadTracks = async () => {
    try {
      const response = await fetch('/api/studio/get-status')
      const data = await response.json()
      if (Array.isArray(data)) {
        setTracks(data)
      }
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    try {
      // Determinar se é modo custom (com letras e tags personalizadas)
      const isCustomMode = selectedTool === "custom"
      
      const requestBody: any = {
        prompt,
        instrumental,
        model: selectedModel,
        is_custom: isCustomMode
      }
      
      // Adicionar campos do modo custom
      if (isCustomMode) {
        if (lyrics.trim()) requestBody.lyrics = lyrics
        if (tags.trim()) requestBody.tags = tags
        if (title.trim()) requestBody.title = title
      }
      
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      if (data.success && Array.isArray(data.songs)) {
        // Adicionar novas músicas à lista com status "submitted"
        setTracks(prev => [...data.songs, ...prev])
        
        // Iniciar polling para estas músicas
        const newIds = data.songs.map((s: SunoSong) => s.id)
        setPollingIds(prev => [...prev, ...newIds])
        
        // Limpar form
        setPrompt("")
        if (isCustomMode) {
          setLyrics("")
          setTags("")
          setTitle("")
        }
      } else {
        console.error('Generation failed:', data.error)
        setLoading(false)
      }
    } catch (err) {
      console.error('Generation error:', err)
      setLoading(false)
    }
  }

  const togglePlay = (track: SunoSong) => {
    if (!track.audio_url) return
    
    if (playing === track.id) {
      audioRef.current?.pause()
      setPlaying(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.audio_url
        audioRef.current.play()
        setPlaying(track.id)
      }
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete': return 'text-green-400'
      case 'streaming': return 'text-orange-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'complete': return 'Completo'
      case 'streaming': return 'Gerando...'
      case 'submitted': return 'Na fila'
      case 'error': return 'Erro'
      default: return 'Desconhecido'
    }
  }

  const renderForm = () => {
    if (selectedTool === "generate" || selectedTool === "custom") {
      return (
        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-medium text-white/80 mb-2 block">
              Descrição da Música
            </label>
            <Textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Uma música pop energética sobre aventuras de verão..."
              className="min-h-[120px] bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/30 resize-none text-[14px] focus:border-white/20"
              disabled={loading}
            />
          </div>
          
          {selectedTool === "custom" && (
            <>
              <div>
                <label className="text-[13px] font-medium text-white/80 mb-2 block">
                  Título (opcional)
                </label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da música"
                  className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/30 text-[14px]"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="text-[13px] font-medium text-white/80 mb-2 block">
                  Tags de Estilo
                </label>
                <Input 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="pop, electronic, energetic"
                  className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/30 text-[14px]"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="text-[13px] font-medium text-white/80 mb-2 block">
                  Letras (opcional)
                </label>
                <Textarea 
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Escreva suas próprias letras..."
                  className="min-h-[100px] bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/30 resize-none text-[14px]"
                  disabled={loading}
                />
              </div>
            </>
          )}
          
          {/* Model Selector */}
          <div>
            <label className="text-[13px] font-medium text-white/80 mb-3 block">
              Modelo de IA
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  disabled={loading}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left",
                    selectedModel === model.id
                      ? "bg-white/10 border-white/20"
                      : "bg-[#1A1A1A] border-white/10 hover:bg-white/5",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-white">{model.name}</span>
                    <span className={cn(
                      "px-2 py-0.5 text-[9px] font-medium rounded-full",
                      model.id === "chirp-v3-5"
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "bg-white/10 text-white/70"
                    )}>
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50">{model.desc}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-white/10">
            <div>
              <p className="text-[13px] font-medium text-white">Instrumental</p>
              <p className="text-[11px] text-white/40">Criar sem vocais</p>
            </div>
            <Switch
              checked={instrumental}
              onCheckedChange={setInstrumental}
              disabled={loading}
            />
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Criar Música
              </>
            )}
          </Button>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-[14px] text-white/60 mb-2">Ferramenta em desenvolvimento</p>
          <p className="text-[12px] text-white/40">Em breve disponível</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-[22px] font-bold text-white">
              DUA Music Studio
            </h1>
            <div className="flex items-center gap-6 text-[14px]">
              <a href="/" className="text-white/60 hover:text-white transition-colors">Home</a>
              <a href="/chat" className="text-white/60 hover:text-white transition-colors">Chat</a>
              <a href="/musicstudio" className="text-white font-medium">Studio</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-[#1A1A1A] rounded-lg border border-white/10">
              <span className="text-[14px] font-semibold text-white">
                {credits.toLocaleString()}
              </span>
              <span className="text-[12px] text-white/40 ml-2">créditos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 flex h-screen">
        {/* Tools Sidebar */}
        <div className="w-[320px] border-r border-white/5 flex flex-col bg-[#0a0a0a]">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-[16px] font-semibold mb-1">Ferramentas</h2>
            <p className="text-[12px] text-white/40">Crie música com IA</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tools.map((tool) => {
              const Icon = tool.icon
              const isSelected = selectedTool === tool.id
              
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all group",
                    isSelected 
                      ? "bg-white/10 border border-white/20" 
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      isSelected 
                        ? "bg-white text-black" 
                        : "bg-white/5 group-hover:bg-white/10 text-white"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[14px] font-medium">{tool.name}</span>
                        <span className="text-[11px] text-white/40">{tool.credits} cr</span>
                      </div>
                      <p className="text-[12px] text-white/50">{tool.desc}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Creation Panel */}
        <div className="w-[440px] border-r border-white/5 flex flex-col bg-[#0a0a0a]">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[14px] font-medium text-white/80">
              {tools.find(t => t.id === selectedTool)?.name}
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {renderForm()}
          </div>
        </div>

        {/* Library */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-semibold mb-1">Biblioteca</h2>
                <p className="text-[13px] text-white/40">{tracks.length} músicas</p>
              </div>
              <button
                onClick={loadTracks}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={cn("w-4 h-4 text-white/60", loading && "animate-spin")} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {tracks.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Music className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-[14px] text-white/60 mb-2">Nenhuma música ainda</p>
                <p className="text-[12px] text-white/40">Crie sua primeira música para começar</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedTrack(track)}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-white/5 to-white/10">
                    {track.image_url ? (
                      <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      {track.status === 'complete' && track.audio_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePlay(track)
                          }}
                          className="w-14 h-14 rounded-full bg-white hover:bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all"
                        >
                          {playing === track.id ? (
                            <Pause className="w-6 h-6 text-black" fill="black" />
                          ) : (
                            <Play className="w-6 h-6 text-black ml-1" fill="black" />
                          )}
                        </button>
                      )}
                      
                      {track.status === 'streaming' && (
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {track.status && track.status !== 'complete' && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full">
                        <span className={cn("text-[10px] font-medium", getStatusColor(track.status))}>
                          {getStatusText(track.status)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-[13px] font-medium mb-1 truncate text-white">
                    {track.title || "Sem Título"}
                  </h3>
                  <p className="text-[11px] text-white/40 truncate">
                    {track.tags || track.prompt?.substring(0, 40) || "Música gerada"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Track Details Panel */}
        {selectedTrack && (
          <div className="w-[400px] border-l border-white/5 bg-[#0a0a0a] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-semibold">Detalhes</h3>
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="aspect-square rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-white/5 to-white/10">
                {selectedTrack.image_url ? (
                  <img src={selectedTrack.image_url} alt={selectedTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-20 h-20 text-white/20" />
                  </div>
                )}
              </div>
              
              <h2 className="text-[20px] font-semibold mb-2">
                {selectedTrack.title || "Sem Título"}
              </h2>
              
              {selectedTrack.tags && (
                <p className="text-[13px] text-white/60 mb-4">{selectedTrack.tags}</p>
              )}
              
              <div className="mb-4">
                <span className={cn("text-[12px] font-medium", getStatusColor(selectedTrack.status))}>
                  Status: {getStatusText(selectedTrack.status)}
                </span>
              </div>
              
              {selectedTrack.status === 'complete' && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => togglePlay(selectedTrack)}
                    className="flex-1 h-10 bg-white hover:bg-white/90 text-black rounded-lg font-medium text-[13px] transition-all flex items-center justify-center gap-2"
                  >
                    {playing === selectedTrack.id ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Reproduzir
                      </>
                    )}
                  </button>
                  
                  {selectedTrack.audio_url && (
                    <a
                      href={selectedTrack.audio_url}
                      download
                      className="h-10 px-4 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
              
              {selectedTrack.id && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                  <p className="text-[11px] text-white/40 mb-1">ID</p>
                  <p className="text-[12px] font-mono text-white/80 break-all">{selectedTrack.id}</p>
                </div>
              )}
              
              {selectedTrack.prompt && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                  <p className="text-[11px] text-white/40 mb-2">Prompt</p>
                  <p className="text-[12px] text-white/70 leading-relaxed">{selectedTrack.prompt}</p>
                </div>
              )}
              
              {selectedTrack.lyric && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[11px] text-white/40 mb-2">Letras</p>
                  <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{selectedTrack.lyric}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(null)}
        onError={() => setPlaying(null)}
      />
    </div>
  )
}
