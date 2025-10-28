"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"
import { Music2, Play, MoreVertical, PanelLeft, PanelLeftClose } from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import AudioPlayer from "@/components/ui/audio-player"
import { StudioSidebar } from "@/components/ui/studio-sidebar"

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`
  }, [minHeight])

  return { textareaRef, adjustHeight }
}

export default function MusicStudioPage() {
  const isMobile = useIsMobile()

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedTool, setSelectedTool] = useState<string>("generate")

  // Shared inputs
  const [message, setMessage] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("pop")
  const [audioUrl, setAudioUrl] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [title, setTitle] = useState("")
  const [continueAt, setContinueAt] = useState(0)
  const [isInstrumental, setIsInstrumental] = useState(false)

  // Results
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedMusic, setGeneratedMusic] = useState<{
    id: string
    title: string
    audioUrl: string
    videoUrl?: string
    imageUrl?: string
    duration: number
    tags?: string
    prompt?: string
  } | null>(null)
  const [currentSong, setCurrentSong] = useState<{
    id: number
    title: string
    artist: string
    plays: string
    cover: string
  } | null>(null)

  // Close sidebar on mobile
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false)
  }, [isMobile])

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 100, maxHeight: 300 })

  // Generic API call with polling
  const callApiWithPolling = async (endpoint: string, body: any) => {
    setIsGenerating(true)
    setGenerationProgress(0)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || "API call failed")
      const data = await res.json()

      if (data.clipIds || data.taskId) {
        const queryIds = (data.clipIds?.join?.(",") || data.taskId) as string
        let status = "processing"
        let pollCount = 0
        const maxPolls = 60
        while (status === "processing" && pollCount < maxPolls) {
          await new Promise((r) => setTimeout(r, 3000))
          pollCount++
          const progressPercent = Math.min(10 + pollCount * 1.5, 90)
          setGenerationProgress(Math.round(progressPercent))

          const statusRes = await fetch(`/api/studio/get-status?ids=${queryIds}`)
          if (!statusRes.ok) continue
          const statusData = await statusRes.json()
          const song = statusData?.songs?.[0]
          if (song?.status === "complete") {
            setGeneratedMusic({
              id: song.id,
              title: song.title,
              audioUrl: song.audioUrl,
              videoUrl: song.videoUrl,
              imageUrl: song.imageUrl,
              duration: song.duration,
              tags: song.tags,
              prompt: song.prompt,
            })
            setGenerationProgress(100)
            status = "completed"
            setCurrentSong({ id: Date.now(), title: song.title, artist: "DUA AI", plays: "0", cover: song.imageUrl || "" })
          } else if (song?.status === "error") {
            throw new Error("Generation failed")
          }
        }
        if (pollCount >= maxPolls) throw new Error("Timeout")
      }
      return data
    } catch (e: any) {
      alert(`Erro: ${e?.message || "desconhecido"}`)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  // Tool handlers
  const handleGenerate = () => {
    if (!message.trim()) return alert("Descreve a música que queres criar")
    callApiWithPolling("/api/studio/generate", {
      prompt: message,
      tags: selectedStyle,
      title: title || "DUA AI Music",
      make_instrumental: isInstrumental,
    })
  }

  const handleUploadExtend = () => {
    if (!audioUrl.trim()) return alert("Insere a URL/ID do áudio")
    callApiWithPolling("/api/studio/upload-extend", {
      audioUrl,
      prompt: message || "Continue this melody",
      tags: selectedStyle,
      title: title || "Extended Melody",
      make_instrumental: isInstrumental,
    })
  }

  const handleExtend = () => {
    if (!audioUrl.trim()) return alert("Insere o ID da música a estender")
    callApiWithPolling("/api/studio/extend", { audioId: audioUrl, continueAt: continueAt || 0, prompt: message || "" })
  }

  const handleCover = () => {
    if (!audioUrl.trim()) return alert("Insere o ID da música")
    callApiWithPolling("/api/studio/cover", {
      audioId: audioUrl,
      newStyle: selectedStyle,
      prompt: message || `Convert to ${selectedStyle} style`,
    })
  }

  const handleAddVocals = () => {
    if (!audioUrl.trim() || !lyrics.trim()) return alert("Insere o ID do instrumental e as letras")
    callApiWithPolling("/api/studio/add-vocals", { audioId: audioUrl, lyrics, vocalStyle: selectedStyle })
  }

  const handleAddInstrumental = () => {
    if (!audioUrl.trim()) return alert("Insere o ID do vocal")
    callApiWithPolling("/api/studio/add-instrumental", {
      audioId: audioUrl,
      style: selectedStyle,
      prompt: message || "Create instrumental accompaniment",
    })
  }

  const handleSeparateVocals = async () => {
    if (!audioUrl.trim()) return alert("Insere o ID da música a separar")
    setIsGenerating(true)
    try {
      const res = await fetch("/api/studio/separate-vocals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId: audioUrl }),
      })
      if (!res.ok) throw new Error("Failed to separate vocals")
      const data = await res.json()
      alert(`Vocal: ${data.vocalUrl}\nInstrumental: ${data.instrumentalUrl}`)
    } catch {
      alert("Erro ao separar vocal")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateLyrics = async () => {
    if (!message.trim()) return alert("Descreve o tema das letras")
    setIsGenerating(true)
    try {
      const res = await fetch("/api/studio/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      })
      if (!res.ok) throw new Error("Failed to generate lyrics")
      const data = await res.json()
      setLyrics(data.lyrics)
      alert(`Título: ${data.title}`)
    } catch {
      alert("Erro ao gerar letras")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCheckCredits = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/studio/check-credits")
      if (!res.ok) throw new Error("Failed to check credits")
      const data = await res.json()
      alert(`Créditos: ${data.credits}\nTotal: ${data.totalCredits}\nUsados: ${data.usedCredits}`)
    } catch {
      alert("Erro ao consultar créditos")
    } finally {
      setIsGenerating(false)
    }
  }

  const musicStyles = [
    "pop",
    "rock",
    "jazz",
    "classical",
    "electronic",
    "hip-hop",
    "r&b",
    "country",
    "reggae",
    "latin",
    "blues",
    "folk",
  ]

  const renderToolForm = () => {
    switch (selectedTool) {
      case "generate":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Descrição da Música</label>
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  adjustHeight()
                }}
                placeholder="Ex: Uma música pop romântica sobre o verão..."
                className="w-full min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Título (opcional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nome da música"
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Estilo</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  {musicStyles.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="instrumental"
                checked={isInstrumental}
                onChange={(e) => setIsInstrumental(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="instrumental" className="text-sm text-white/80">
                Apenas Instrumental
              </label>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || !message.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? `Gerando... ${generationProgress}%` : "Criar Música (12 créditos)"}
            </Button>
          </div>
        )
      case "upload-extend":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">URL do Áudio / Clip ID</label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="clip_xxx ou https://exemplo.com/audio.mp3"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Como continuar? (opcional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Continue como uma música pop energética..."
                className="w-full min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Título (opcional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nome da música"
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Estilo Final</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  {musicStyles.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleUploadExtend} disabled={isGenerating || !audioUrl.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? `Processando... ${generationProgress}%` : "Transformar Melodia (12 créditos)"}
            </Button>
          </div>
        )
      case "extend":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">ID da Música</label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="clip_xxx"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Continuar a partir de (segundos)</label>
              <input
                type="number"
                value={continueAt}
                onChange={(e) => setContinueAt(Number(e.target.value))}
                min={0}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Instrução (opcional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Continue com mais energia..."
                className="w-full min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
            </div>
            <Button onClick={handleExtend} disabled={isGenerating || !audioUrl.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? `Estendendo... ${generationProgress}%` : "Estender Música (12 créditos)"}
            </Button>
          </div>
        )
      case "cover":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">ID da Música</label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="clip_xxx"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Novo Estilo</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                {musicStyles.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Instrução (opcional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Tornar mais intenso e energético..."
                className="w-full min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
            </div>
            <Button onClick={handleCover} disabled={isGenerating || !audioUrl.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? `Criando Cover... ${generationProgress}%` : "Fazer Cover (12 créditos)"}
            </Button>
          </div>
        )
      case "add-vocals":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">ID do Instrumental</label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="clip_xxx"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Letras</label>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Escreve as letras aqui..."
                className="w-full min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Estilo Vocal</label>
              <input
                type="text"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                placeholder="Ex: female, pop, energetic"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <Button onClick={handleAddVocals} disabled={isGenerating || !audioUrl.trim() || !lyrics.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? `Adicionando Vocal... ${generationProgress}%` : "Adicionar Vocal (12 créditos)"}
            </Button>
          </div>
        )
      case "add-instrumental":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">ID do Vocal</label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="clip_xxx"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Estilo do Instrumental</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="auto">Auto-detectar</option>
                {musicStyles.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">Instrução (opcional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Criar acompanhamento com guitarras..."
                className="w-full min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
            </div>
            <Button onClick={handleAddInstrumental} disabled={isGenerating || !audioUrl.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? `Criando Instrumental... ${generationProgress}%` : "Adicionar Instrumental (12 créditos)"}
            </Button>
          </div>
        )
      case "separate-vocals":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">ID da Música</label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="clip_xxx"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">Esta ferramenta vai separar a música em 2 ficheiros: vocal isolado e instrumental isolado.</p>
            </div>
            <Button onClick={handleSeparateVocals} disabled={isGenerating || !audioUrl.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? "Separando..." : "Separar Vocal (10 créditos)"}
            </Button>
          </div>
        )
      case "generate-lyrics":
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Tema das Letras</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Escreve letras sobre amor de verão, estilo pop romântico..."
                className="w-full min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
            </div>
            {lyrics && (
              <div>
                <label className="text-sm text-white/60 mb-2 block">Letras Geradas</label>
                <Textarea value={lyrics} readOnly className="w-full min-h-[200px] bg-white/5 border-white/10 text-white resize-none" />
              </div>
            )}
            <Button onClick={handleGenerateLyrics} disabled={isGenerating || !message.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
              {isGenerating ? "Gerando..." : "Gerar Letras (0.4 créditos)"}
            </Button>
          </div>
        )
      case "check-credits":
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/20 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Consultar Créditos</h3>
              <p className="text-white/60 text-sm">Verifica o teu saldo de créditos disponível</p>
            </div>
            <Button onClick={handleCheckCredits} disabled={isGenerating} className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold">
              {isGenerating ? "Consultando..." : "Ver Saldo (Grátis)"}
            </Button>
          </div>
        )
      default:
        return (
          <div className="space-y-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ferramenta em Desenvolvimento</h3>
              <p className="text-white/60 text-sm">Esta ferramenta estará disponível em breve</p>
            </div>
          </div>
        )
    }
  }

  const creatorMusic = [
    { id: 1, title: "Around", artist: "@minahuang", plays: "93K", cover: "/vintage-portrait-album-cover.jpg" },
    { id: 2, title: "So Good", artist: "@kingmilo", plays: "89K", cover: "/neon-city-night-album-cover.jpg" },
    { id: 3, title: "Behind Your Eyes", artist: "@lukem", plays: "82K", cover: "/windmill-landscape-album-cover.jpg" },
    { id: 4, title: "Suck (My Vibe)", artist: "@scarlettwindsor", plays: "52K", cover: "/person-back-view-album-cover.jpg" },
  ]

  return (
    <BeamsBackground>
      <div className="relative min-h-screen">
        <PremiumNavbar />

        {/* Sidebar toggle (mobile) */}
        <div className="fixed top-4 left-4 z-[70] lg:hidden">
          <Button
            size="icon"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setIsSidebarOpen((p) => !p)}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Sidebar */}
        <StudioSidebar
          isOpen={isSidebarOpen}
          onToggleOpen={setIsSidebarOpen}
          selectedTool={selectedTool}
          onSelectTool={(t) => setSelectedTool(t)}
        />

        {/* Page content */}
        <div className={cn("transition-all", isSidebarOpen ? "lg:ml-[320px] ml-0" : "ml-0")}>
          {/* Hero */}
          <section className={cn("px-4 sm:px-6 lg:px-8", isMobile ? "pt-20 pb-8" : "pt-24 pb-10")}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                <Music2 className="w-8 h-8 text-white" />
              </div>
              <h1 className={cn("font-bold text-white mb-2", isMobile ? "text-3xl" : "text-2xl sm:text-3xl md:text-4xl")}>Estúdio de Música DUA</h1>
              <p className={cn("text-white/60 mx-auto", isMobile ? "text-base max-w-xl" : "text-sm sm:text-base max-w-2xl")}>
                Cria, transforma e expande músicas com IA. Escolhe uma ferramenta e começa já.
              </p>
            </div>
          </section>

          {/* Generated Music Display */}
          {generatedMusic && (
            <section className={cn("px-4 sm:px-6 lg:px-8 pb-8", isMobile ? "pt-4" : "pt-6")}>
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{generatedMusic.title}</h3>
                      <p className="text-white/60 text-sm sm:text-base mb-4">Gerado com sucesso!</p>
                      <div className="flex flex-wrap gap-2">
                        {generatedMusic.tags && (
                          <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs">{generatedMusic.tags}</span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                          {Math.floor(generatedMusic.duration / 60)}:{String(generatedMusic.duration % 60).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-2xl p-4 mb-4">
                    <audio controls className="w-full" src={generatedMusic.audioUrl}>
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => window.open(generatedMusic.audioUrl, "_blank")} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Play className="w-4 h-4 mr-2" />Abrir Áudio
                    </Button>
                    {generatedMusic.videoUrl && (
                      <Button onClick={() => window.open(generatedMusic.videoUrl!, "_blank")} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Play className="w-4 h-4 mr-2" />Ver Vídeo
                      </Button>
                    )}
                    <Button onClick={() => setGeneratedMusic(null)} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">Criar Nova</Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Dynamic Tool Interface */}
          <main className={cn("flex-1 flex flex-col items-center", isMobile ? "px-6 pb-8" : "px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8")}>
            <div className="w-full max-w-3xl">
              <div className={cn("relative backdrop-blur-xl border border-white/10 shadow-2xl p-6", isMobile ? "rounded-3xl bg-black/80" : "rounded-2xl bg-black/60")}>
                {renderToolForm()}
              </div>
            </div>
          </main>

          {/* Gallery Section */}
          <section className={cn(isMobile ? "px-5 pb-10" : "px-3 sm:px-4 lg:px-6 pb-8 sm:pb-12 lg:pb-16")}>
            <div className="max-w-7xl mx-auto">
              <div className={cn("px-1", isMobile ? "mb-6" : "mb-4 sm:mb-6 lg:mb-8")}>
                <h3 className={cn("font-bold text-white mb-2", isMobile ? "text-2xl" : "text-lg sm:text-xl md:text-2xl lg:text-3xl")}>
                  Músicas dos Criadores
                </h3>
                <p className={cn("text-white/50", isMobile ? "text-base" : "text-xs sm:text-sm md:text-base")}>
                  Descubra músicas criadas pela nossa comunidade
                </p>
              </div>

              <div className={cn("grid", isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4")}>
                {creatorMusic.map((song) => (
                  <div key={song.id} className={cn("group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 transition-all duration-300 hover:border-purple-500/50 active:scale-[0.98]", isMobile ? "rounded-2xl p-5" : "rounded-xl p-3 sm:p-4")}>
                    <div className={cn("flex items-center", isMobile ? "gap-4" : "gap-3 sm:gap-4")}>
                      <div className="relative flex-shrink-0">
                        <img src={song.cover || "/placeholder.svg"} alt={song.title} className={cn("rounded-lg object-cover", isMobile ? "w-20 h-20" : "w-14 h-14 sm:w-16 sm:h-16")} />
                        <button onClick={() => setCurrentSong({ id: Date.now(), title: song.title, artist: song.artist, plays: song.plays, cover: song.cover })} className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg active:scale-95">
                          <div className={cn("rounded-full bg-purple-500 flex items-center justify-center shadow-lg", isMobile ? "w-10 h-10" : "w-7 h-7 sm:w-8 sm:h-8")}>
                            <Play className={cn("text-white fill-white ml-0.5", isMobile ? "w-5 h-5" : "w-3.5 h-3.5 sm:w-4 sm:h-4")} />
                          </div>
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={cn("font-semibold text-white truncate mb-1", isMobile ? "text-lg" : "text-sm sm:text-base")}>{song.title}</h4>
                        <p className={cn("text-white/50 truncate", isMobile ? "text-base mb-1" : "text-xs sm:text-sm")}>{song.artist}</p>
                        <p className={cn("text-white/40", isMobile ? "text-sm" : "text-xs")}>{song.plays} plays</p>
                      </div>

                      <button className={cn("flex-shrink-0 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors active:scale-95", isMobile ? "w-12 h-12" : "w-9 h-9 sm:w-8 sm:h-8")}>
                        <MoreVertical className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <AudioPlayer song={currentSong} onClose={() => setCurrentSong(null)} />
    </BeamsBackground>
  )
}
