"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Play, Pause, Sparkles, Music2, Scissors, Plus, Download, Share2, Heart, MoreHorizontal, RefreshCw, Loader2, ChevronRight, Volume2, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

interface Track {
  id: string
  title: string
  image_url?: string
  audio_url?: string
  video_url?: string
  lyric?: string
  tags?: string
  prompt?: string
  duration?: string
  status?: "streaming" | "complete" | "error" | "pending"
  created_at?: string
  model_name?: string
}

const tools = [
  { id: "generate", icon: Sparkles, name: "Criar Música", desc: "Crie músicas com IA", credits: 10 },
  { id: "custom", icon: Music2, name: "Personalizada", desc: "Controle total", credits: 10 },
  { id: "extend", icon: Plus, name: "Estender", desc: "Prolongue suas músicas", credits: 5 },
  { id: "stems", icon: Scissors, name: "Separar Stems", desc: "Isole vocais e instrumental", credits: 10 },
]

export default function MusicStudioPage() {
  const [selectedTool, setSelectedTool] = useState("generate")
  const [mode, setMode] = useState<"simple" | "custom">("simple")
  const [loading, setLoading] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [credits, setCredits] = useState(2500)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Form states
  const [prompt, setPrompt] = useState("")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [negativeTags, setNegativeTags] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [instrumental, setInstrumental] = useState(false)
  const [audioId, setAudioId] = useState("")
  const [continueAt, setContinueAt] = useState("")

  useEffect(() => {
    fetchCredits()
    loadTracks()
  }, [])

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/studio/check-credits')
      const data = await res.json()
      if (data.credits_left !== undefined) {
        setCredits(data.credits_left)
      }
    } catch (err) {
      console.error('Error fetching credits:', err)
    }
  }

  const loadTracks = async () => {
    try {
      const res = await fetch('/api/studio/get-status')
      const data = await res.json()
      if (Array.isArray(data)) {
        setTracks(data.filter(t => t.status === 'complete'))
      }
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  const pollStatus = async (ids: string[]) => {
    const maxAttempts = 30
    let attempts = 0
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setLoading(false)
        return
      }
      
      try {
        const res = await fetch(`/api/studio/get-status?ids=${ids.join(',')}`)
        const data = await res.json()
        
        if (Array.isArray(data)) {
          const completed = data.filter(t => t.status === 'complete')
          const pending = data.filter(t => t.status === 'streaming' || t.status === 'pending')
          
          setTracks(prev => {
            const newTracks = [...prev]
            completed.forEach(track => {
              const index = newTracks.findIndex(t => t.id === track.id)
              if (index >= 0) {
                newTracks[index] = track
              } else {
                newTracks.unshift(track)
              }
            })
            return newTracks
          })
          
          if (pending.length === 0) {
            setLoading(false)
            fetchCredits()
            return
          }
        }
        
        attempts++
        setTimeout(poll, 3000)
      } catch (err) {
        console.error('Poll error:', err)
        attempts++
        setTimeout(poll, 3000)
      }
    }
    
    poll()
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    try {
      const endpoint = mode === "simple" ? "/api/studio/generate" : "/api/studio/custom-generate"
      const body: any = {
        prompt,
        wait_audio: false
      }
      
      if (mode === "custom") {
        if (title) body.title = title
        if (tags) body.tags = tags
        if (negativeTags) body.negative_tags = negativeTags
        if (lyrics) body.prompt = lyrics
        body.make_instrumental = instrumental
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await res.json()
      
      if (Array.isArray(data)) {
        const ids = data.map(t => t.id)
        pollStatus(ids)
      } else if (data.id) {
        pollStatus([data.id])
      }
    } catch (err) {
      console.error('Generation error:', err)
      setLoading(false)
    }
  }

  const handleExtend = async () => {
    if (!audioId.trim() || !prompt.trim()) return
    
    setLoading(true)
    try {
      const body: any = {
        audio_id: audioId,
        prompt
      }
      
      if (continueAt) body.continue_at = continueAt
      if (title) body.title = title
      if (tags) body.tags = tags
      
      const res = await fetch('/api/studio/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const data = await res.json()
      
      if (Array.isArray(data)) {
        const ids = data.map(t => t.id)
        pollStatus(ids)
      }
    } catch (err) {
      console.error('Extend error:', err)
      setLoading(false)
    }
  }

  const handleSeparateStems = async () => {
    if (!audioId.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/studio/separate-vocals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_id: audioId })
      })
      
      const data = await res.json()
      
      if (data.id) {
        pollStatus([data.id])
      }
    } catch (err) {
      console.error('Stems error:', err)
      setLoading(false)
    }
  }

  const togglePlay = (track: Track) => {
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

  const renderForm = () => {
    switch (selectedTool) {
      case "generate":
      case "custom":
        return (
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-white/80 mb-2 block">Descrição da Música</label>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Uma música pop animada sobre verão..."
                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-[14px] focus:border-[#FF1493]/50 transition-colors"
              />
            </div>
            
            {selectedTool === "custom" && (
              <>
                <div>
                  <label className="text-[13px] font-medium text-white/80 mb-2 block">Título (opcional)</label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da música"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-[14px]"
                  />
                </div>
                
                <div>
                  <label className="text-[13px] font-medium text-white/80 mb-2 block">Tags de Estilo</label>
                  <Input 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="pop, electronic, upbeat"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-[14px]"
                  />
                </div>
                
                <div>
                  <label className="text-[13px] font-medium text-white/80 mb-2 block">Letras (opcional)</label>
                  <Textarea 
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Escreva suas próprias letras..."
                    className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-[14px]"
                  />
                </div>
                
                <button
                  onClick={() => setInstrumental(!instrumental)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[13px] font-medium transition-all",
                    instrumental 
                      ? "bg-gradient-to-r from-[#FF1493] to-[#9B30FF] text-white shadow-lg shadow-[#FF1493]/20" 
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {instrumental ? "✓ Instrumental" : "Instrumental"}
                </button>
              </>
            )}
            
            <Button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full h-11 bg-gradient-to-r from-[#FF1493] to-[#9B30FF] hover:opacity-90 text-white font-medium text-[14px] shadow-lg shadow-[#FF1493]/20 disabled:opacity-50"
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
      
      case "extend":
        return (
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-white/80 mb-2 block">ID da Música</label>
              <Input 
                value={audioId}
                onChange={(e) => setAudioId(e.target.value)}
                placeholder="Cole o ID da música aqui"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-[14px]"
              />
            </div>
            
            <div>
              <label className="text-[13px] font-medium text-white/80 mb-2 block">Prompt de Continuação</label>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Como deseja continuar a música..."
                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-[14px]"
              />
            </div>
            
            <div>
              <label className="text-[13px] font-medium text-white/80 mb-2 block">Continuar em (segundos, opcional)</label>
              <Input 
                value={continueAt}
                onChange={(e) => setContinueAt(e.target.value)}
                placeholder="Ex: 120"
                type="number"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-[14px]"
              />
            </div>
            
            <Button 
              onClick={handleExtend}
              disabled={loading || !audioId.trim() || !prompt.trim()}
              className="w-full h-11 bg-gradient-to-r from-[#FF1493] to-[#9B30FF] hover:opacity-90 text-white font-medium text-[14px] shadow-lg shadow-[#FF1493]/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Estendendo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Estender Música
                </>
              )}
            </Button>
          </div>
        )
      
      case "stems":
        return (
          <div className="space-y-5">
            <div>
              <label className="text-[13px] font-medium text-white/80 mb-2 block">ID da Música</label>
              <Input 
                value={audioId}
                onChange={(e) => setAudioId(e.target.value)}
                placeholder="Cole o ID da música aqui"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-[14px]"
              />
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[13px] text-white/60">
                A separação de stems criará duas faixas: uma com vocais isolados e outra instrumental.
              </p>
            </div>
            
            <Button 
              onClick={handleSeparateStems}
              disabled={loading || !audioId.trim()}
              className="w-full h-11 bg-gradient-to-r from-[#FF1493] to-[#9B30FF] hover:opacity-90 text-white font-medium text-[14px] shadow-lg shadow-[#FF1493]/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Separando...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  Separar Stems
                </>
              )}
            </Button>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-b border-white/5">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-[24px] font-bold bg-gradient-to-r from-[#FF1493] to-[#9B30FF] bg-clip-text text-transparent">
              DUA Studio
            </h1>
            <div className="flex items-center gap-6 text-[14px]">
              <a href="/" className="text-white/60 hover:text-white transition-colors">Home</a>
              <a href="/chat" className="text-white/60 hover:text-white transition-colors">Chat</a>
              <a href="/musicstudio" className="text-white font-medium">Studio</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchCredits}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group"
            >
              <span className="text-[14px] font-semibold text-transparent bg-gradient-to-r from-[#FF1493] to-[#9B30FF] bg-clip-text">
                {credits.toLocaleString()}
              </span>
              <span className="text-[12px] text-white/40 ml-2">créditos</span>
              <RefreshCw className="w-3 h-3 ml-2 inline text-white/40 group-hover:text-white/60 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 flex h-screen">
        {/* Tools Sidebar */}
        <div className="w-[320px] border-r border-white/5 flex flex-col bg-black">
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
                      ? "bg-white/10 border border-white/20 shadow-lg" 
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      isSelected 
                        ? "bg-gradient-to-r from-[#FF1493] to-[#9B30FF] shadow-lg shadow-[#FF1493]/30" 
                        : "bg-white/5 group-hover:bg-white/10"
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
        <div className="w-[440px] border-r border-white/5 flex flex-col bg-black">
          <div className="p-6 border-b border-white/5">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("simple")}
                className={cn(
                  "flex-1 h-9 rounded-lg text-[13px] font-medium transition-all",
                  mode === "simple" 
                    ? "bg-white text-black" 
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Simples
              </button>
              <button
                onClick={() => setMode("custom")}
                className={cn(
                  "flex-1 h-9 rounded-lg text-[13px] font-medium transition-all",
                  mode === "custom" 
                    ? "bg-white text-black" 
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Personalizado
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {renderForm()}
          </div>
        </div>

        {/* Library */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-semibold mb-1">Sua Biblioteca</h2>
                <p className="text-[13px] text-white/40">{tracks.length} músicas criadas</p>
              </div>
              <button
                onClick={loadTracks}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {loading && tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF1493] mb-4" />
                <p className="text-[14px] text-white/60">Criando sua música...</p>
              </div>
            )}
            
            {tracks.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Music2 className="w-12 h-12 text-white/20 mb-4" />
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
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-[#FF1493]/20 to-[#9B30FF]/20">
                    {track.image_url ? (
                      <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlay(track)
                        }}
                        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all hover:bg-white/20"
                      >
                        {playing === track.id ? (
                          <Pause className="w-6 h-6 text-white" fill="white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        )}
                      </button>
                    </div>
                    
                    {track.status && track.status !== "complete" && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full text-[10px] font-medium">
                        <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                        {track.status}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-[13px] font-medium mb-1 truncate">
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
          <div className="w-[400px] border-l border-white/5 bg-black overflow-y-auto animate-in slide-in-from-right">
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
              
              <div className="aspect-square rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-[#FF1493]/20 to-[#9B30FF]/20">
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
              
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => togglePlay(selectedTrack)}
                  className="flex-1 h-10 bg-gradient-to-r from-[#FF1493] to-[#9B30FF] hover:opacity-90 rounded-lg font-medium text-[13px] transition-all flex items-center justify-center gap-2"
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
                    className="h-10 px-4 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              {selectedTrack.id && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                  <p className="text-[11px] text-white/40 mb-1">ID da Música</p>
                  <p className="text-[12px] font-mono text-white/80 break-all">{selectedTrack.id}</p>
                </div>
              )}
              
              {selectedTrack.prompt && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                  <p className="text-[11px] text-white/40 mb-2">Prompt Original</p>
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

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(null)}
        onError={() => setPlaying(null)}
      />
    </div>
  )
}
