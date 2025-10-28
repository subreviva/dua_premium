"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Play, Pause, Sparkles, Music2, Scissors, Plus, Download, Share2, MoreHorizontal, RefreshCw, Loader2, ChevronRight, Volume2, Calendar, User, SkipForward, SkipBack, Shuffle, Repeat, Music, PauseIcon } from "lucide-react"
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
  { id: "generate", icon: Sparkles, name: "Criar Música", desc: "Gere músicas com IA", credits: 10 },
  { id: "custom", icon: Music2, name: "Modo Custom", desc: "Controle total da criação", credits: 10 },
  { id: "extend", icon: Plus, name: "Estender", desc: "Prolongue suas músicas", credits: 5 },
  { id: "stems", icon: Scissors, name: "Separar Stems", desc: "Isole vocais/instrumental", credits: 10 },
]

const models = [
  { id: "chirp-v3-5", name: "v3.5", desc: "Mais recente" },
  { id: "chirp-v3", name: "v3", desc: "Estável" },
]

export default function MusicStudioPage() {
  const [selectedTool, setSelectedTool] = useState("generate")
  const [mode, setMode] = useState<"simple" | "custom">("simple")
  const [loading, setLoading] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [credits, setCredits] = useState(2500)
  const [selectedModel, setSelectedModel] = useState("chirp-v3-5")
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
        wait_audio: false,
        model: selectedModel
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
        prompt,
        model: selectedModel
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
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-white/70 mb-2 block">Descrição da Música</label>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Uma música pop animada sobre verão..."
                className="min-h-[100px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 resize-none text-[14px] focus:border-[#D4A574]/50 focus:ring-1 focus:ring-[#D4A574]/30 transition-all"
              />
            </div>
            
            {selectedTool === "custom" && (
              <>
                <div>
                  <label className="text-[13px] font-medium text-white/70 mb-2 block">Título (opcional)</label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da música"
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-[14px] focus:border-[#D4A574]/50 focus:ring-1 focus:ring-[#D4A574]/30"
                  />
                </div>
                
                <div>
                  <label className="text-[13px] font-medium text-white/70 mb-2 block">Tags de Estilo</label>
                  <Input 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="pop, electronic, upbeat"
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-[14px] focus:border-[#D4A574]/50"
                  />
                </div>
                
                <div>
                  <label className="text-[13px] font-medium text-white/70 mb-2 block">Letras (opcional)</label>
                  <Textarea 
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Escreva suas próprias letras..."
                    className="min-h-[80px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 resize-none text-[14px]"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                  <label className="text-[13px] font-medium text-white/80">Instrumental</label>
                  <Switch
                    checked={instrumental}
                    onCheckedChange={setInstrumental}
                    className="data-[state=checked]:bg-[#D4A574]"
                  />
                </div>
              </>
            )}
            
            <Button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full h-11 bg-[#D4A574] hover:bg-[#C99964] text-black font-medium text-[14px] shadow-lg shadow-[#D4A574]/20 disabled:opacity-50 transition-all duration-200"
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
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-white/70 mb-2 block">ID da Música</label>
              <Input 
                value={audioId}
                onChange={(e) => setAudioId(e.target.value)}
                placeholder="Cole o ID da música aqui"
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-[14px]"
              />
            </div>
            
            <div>
              <label className="text-[13px] font-medium text-white/70 mb-2 block">Prompt de Continuação</label>
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Como deseja continuar a música..."
                className="min-h-[100px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 resize-none text-[14px]"
              />
            </div>
            
            <div>
              <label className="text-[13px] font-medium text-white/70 mb-2 block">Continuar em (segundos, opcional)</label>
              <Input 
                value={continueAt}
                onChange={(e) => setContinueAt(e.target.value)}
                placeholder="Ex: 120"
                type="number"
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-[14px]"
              />
            </div>
            
            <Button 
              onClick={handleExtend}
              disabled={loading || !audioId.trim() || !prompt.trim()}
              className="w-full h-11 bg-[#D4A574] hover:bg-[#C99964] text-black font-medium text-[14px] shadow-lg shadow-[#D4A574]/20 disabled:opacity-50"
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
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-white/70 mb-2 block">ID da Música</label>
              <Input 
                value={audioId}
                onChange={(e) => setAudioId(e.target.value)}
                placeholder="Cole o ID da música aqui"
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 text-[14px]"
              />
            </div>
            
            <div className="p-4 bg-white/[0.03] rounded-lg border border-white/[0.08]">
              <p className="text-[13px] text-white/60 leading-relaxed">
                A separação de stems criará duas faixas: uma com vocais isolados e outra instrumental.
              </p>
            </div>
            
            <Button 
              onClick={handleSeparateStems}
              disabled={loading || !audioId.trim()}
              className="w-full h-11 bg-[#D4A574] hover:bg-[#C99964] text-black font-medium text-[14px] shadow-lg shadow-[#D4A574]/20 disabled:opacity-50"
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-[22px] font-semibold text-white/90">
              DUA Music Studio
            </h1>
            <div className="flex items-center gap-6 text-[14px]">
              <a href="/" className="text-white/50 hover:text-white/90 transition-colors">Home</a>
              <a href="/chat" className="text-white/50 hover:text-white/90 transition-colors">Chat</a>
              <a href="/musicstudio" className="text-white/90 font-medium">Studio</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchCredits}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg border border-white/[0.08] transition-all group"
            >
              <span className="text-[14px] font-semibold text-[#D4A574]">
                {credits.toLocaleString()}
              </span>
              <span className="text-[12px] text-white/40 ml-2">créditos</span>
              <RefreshCw className="w-3 h-3 ml-2 inline text-white/30 group-hover:text-white/50 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 flex h-screen">
        {/* Tools Sidebar */}
        <div className="w-[300px] border-r border-white/[0.08] flex flex-col bg-[#0a0a0a]">
          <div className="p-5 border-b border-white/[0.08]">
            <h2 className="text-[15px] font-semibold text-white/90 mb-1">Ferramentas</h2>
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
                    "w-full p-3 rounded-lg text-left transition-all",
                    isSelected 
                      ? "bg-white/[0.08] border border-white/[0.15]" 
                      : "hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                      isSelected 
                        ? "bg-[#D4A574] text-black" 
                        : "bg-white/[0.05] text-white/70"
                    )}>
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[13px] font-medium text-white/90">{tool.name}</span>
                        <span className="text-[11px] text-white/30">{tool.credits}</span>
                      </div>
                      <p className="text-[11px] text-white/40">{tool.desc}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Creation Panel */}
        <div className="w-[420px] border-r border-white/[0.08] flex flex-col bg-[#0a0a0a]">
          <div className="p-5 border-b border-white/[0.08]">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("simple")}
                className={cn(
                  "flex-1 h-9 rounded-lg text-[13px] font-medium transition-all",
                  mode === "simple" 
                    ? "bg-white text-black" 
                    : "bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
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
                    : "bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
                )}
              >
                Personalizado
              </button>
            </div>

            <div className="mt-4">
              <label className="text-[12px] font-medium text-white/50 mb-2 block">Modelo</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full h-9 bg-white/[0.03] border-white/[0.08] text-white text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/[0.08]">
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-white text-[13px] focus:bg-white/[0.08]">
                      {model.name} - {model.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {renderForm()}
          </div>
        </div>

        {/* Library */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          <div className="p-5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-white/90 mb-0.5">Sua Biblioteca</h2>
                <p className="text-[12px] text-white/40">{tracks.length} músicas criadas</p>
              </div>
              <button
                onClick={loadTracks}
                className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {loading && tracks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4A574] mb-4" />
                <p className="text-[14px] text-white/50">Criando sua música...</p>
              </div>
            )}
            
            {tracks.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Music2 className="w-12 h-12 text-white/10 mb-4" />
                <p className="text-[14px] text-white/50 mb-1">Nenhuma música ainda</p>
                <p className="text-[12px] text-white/30">Crie sua primeira música para começar</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedTrack(track)}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-white/[0.03]">
                    {track.image_url ? (
                      <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-10 h-10 text-white/10" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlay(track)
                        }}
                        className="w-12 h-12 rounded-full bg-[#D4A574] flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all hover:bg-[#C99964]"
                      >
                        {playing === track.id ? (
                          <Pause className="w-5 h-5 text-black" fill="black" />
                        ) : (
                          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
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
                  
                  <h3 className="text-[13px] font-medium text-white/90 mb-0.5 truncate">
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
          <div className="w-[380px] border-l border-white/[0.08] bg-[#0a0a0a] overflow-y-auto animate-in slide-in-from-right">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[15px] font-semibold text-white/90">Detalhes</h3>
                <button
                  onClick={() => setSelectedTrack(null)}
                  className="w-8 h-8 rounded-lg hover:bg-white/[0.05] flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </button>
              </div>
              
              <div className="aspect-square rounded-xl overflow-hidden mb-5 bg-white/[0.03]">
                {selectedTrack.image_url ? (
                  <img src={selectedTrack.image_url} alt={selectedTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-16 h-16 text-white/10" />
                  </div>
                )}
              </div>
              
              <h2 className="text-[18px] font-semibold text-white/90 mb-1">
                {selectedTrack.title || "Sem Título"}
              </h2>
              
              {selectedTrack.tags && (
                <p className="text-[13px] text-white/50 mb-4">{selectedTrack.tags}</p>
              )}
              
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => togglePlay(selectedTrack)}
                  className="flex-1 h-10 bg-[#D4A574] hover:bg-[#C99964] rounded-lg font-medium text-[13px] transition-all flex items-center justify-center gap-2 text-black"
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 px-4 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg flex items-center justify-center transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-white/70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1a1a1a] border-white/[0.08] text-white">
                    {selectedTrack.audio_url && (
                      <DropdownMenuItem asChild>
                        <a href={selectedTrack.audio_url} download className="flex items-center gap-2 text-[13px]">
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="flex items-center gap-2 text-[13px]">
                      <Share2 className="w-4 h-4" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.08]" />
                    <DropdownMenuItem className="flex items-center gap-2 text-[13px] text-red-400">
                      <Music className="w-4 h-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {selectedTrack.id && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.08] mb-3">
                  <p className="text-[11px] text-white/30 mb-1">ID da Música</p>
                  <p className="text-[11px] font-mono text-white/70 break-all">{selectedTrack.id}</p>
                </div>
              )}
              
              {selectedTrack.prompt && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.08] mb-3">
                  <p className="text-[11px] text-white/30 mb-2">Prompt Original</p>
                  <p className="text-[12px] text-white/60 leading-relaxed">{selectedTrack.prompt}</p>
                </div>
              )}
              
              {selectedTrack.lyric && (
                <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.08]">
                  <p className="text-[11px] text-white/30 mb-2">Letras</p>
                  <p className="text-[12px] text-white/60 leading-relaxed whitespace-pre-wrap">{selectedTrack.lyric}</p>
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
