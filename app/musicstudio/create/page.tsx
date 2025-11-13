"use client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useMemo } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGeneration } from "@/contexts/generation-context"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { supabaseClient } from "@/lib/supabase"

const PRESETS = [
  {
    id: "chill",
    name: "Ambiente Calmo",
    prompt: "Uma faixa calma e relaxante com melodias suaves e sons ambiente",
    style: "ambiente, chill, lo-fi, relaxante",
    instrumental: true,
  },
  {
    id: "energetic",
    name: "Energético",
    prompt: "Uma faixa animada e energética com ritmos vibrantes e melodias poderosas",
    style: "eletrónica, energético, animado, dance",
    instrumental: true,
  },
  {
    id: "cinematic",
    name: "Cinemático",
    prompt: "Uma peça orquestral épica e cinemática com cordas dramáticas e metais poderosos",
    style: "orquestral, cinemático, épico, dramático",
    instrumental: true,
  },
  {
    id: "acoustic",
    name: "Acústico",
    prompt: "Uma peça calorosa de guitarra acústica com dedilhado suave e harmónicos naturais",
    style: "acústico, folk, caloroso, íntimo",
    instrumental: true,
  },
]

export default function CreatePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [instrumental, setInstrumental] = useState(true)
  const [model, setModel] = useState<"V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5">("V4_5PLUS")

  const [style, setStyle] = useState("")
  const [title, setTitle] = useState("")
  const [negativeTags, setNegativeTags] = useState("")
  const [vocalGender, setVocalGender] = useState<"m" | "f" | "">("")
  const [styleWeight, setStyleWeight] = useState([0.65])
  const [weirdnessConstraint, setWeirdnessConstraint] = useState([0.5])
  const [audioWeight, setAudioWeight] = useState([0.65])

  const [inspirationTags, setInspirationTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { addTask } = useGeneration()

  const limits = useMemo(() => {
    const isAdvancedModel = ["V4_5", "V4_5PLUS", "V5"].includes(model)
    return {
      promptSimple: 500,
      promptCustom: isAdvancedModel ? 5000 : 3000,
      style: isAdvancedModel ? 1000 : 200,
      title: 80,
    }
  }, [model])

  const availableTags = [
    "ambient",
    "jazz",
    "classical",
    "electronic",
    "pop",
    "rock",
    "hip-hop",
    "folk",
    "country",
    "blues",
    "reggae",
    "metal",
    "indie",
    "acoustic",
    "upbeat",
    "calm",
    "energetic",
    "melancholic",
    "nostalgic",
    "dreamy",
  ]

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setPrompt(preset.prompt)
    setStyle(preset.style)
    setTitle("")
    setInstrumental(preset.instrumental)
    setInspirationTags(preset.style.split(", "))
  }

  const addInspirationTag = (tag: string) => {
    if (!inspirationTags.includes(tag)) {
      setInspirationTags([...inspirationTags, tag])
      setStyle((prev) => (prev ? `${prev}, ${tag}` : tag))
    }
  }

  const removeInspirationTag = (tag: string) => {
    setInspirationTags(inspirationTags.filter((t) => t !== tag))
    setStyle((prev) =>
      prev
        .split(", ")
        .filter((t) => t !== tag)
        .join(", "),
    )
  }

  const handleGenerate = async (customMode: boolean) => {
    setIsGenerating(true)
    setError(null)

    try {
      if (customMode) {
        if (prompt.length > limits.promptCustom) {
          throw new Error(`Prompt excede ${limits.promptCustom} caracteres para ${model}`)
        }
        if (style.length > limits.style) {
          throw new Error(`Estilo excede ${limits.style} caracteres para ${model}`)
        }
        if (title.length > limits.title) {
          throw new Error(`Título excede ${limits.title} caracteres`)
        }
        if (!style.trim()) {
          throw new Error("Estilo é obrigatório no modo personalizado")
        }
        if (!title.trim()) {
          throw new Error("Título é obrigatório no modo personalizado")
        }
      } else {
        if (prompt.length > limits.promptSimple) {
          throw new Error(`Prompt excede ${limits.promptSimple} caracteres para o modo simples`)
        }
      }

      // 🔥 OBTER USER ID
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        throw new Error("Você precisa estar autenticado para gerar música")
      }

      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // 🔥 ENVIAR USER ID
          prompt,
          customMode,
          instrumental,
          model,
          ...(customMode && {
            style,
            title,
            negativeTags: negativeTags || undefined,
            vocalGender: vocalGender || undefined,
            styleWeight: styleWeight[0],
            weirdnessConstraint: weirdnessConstraint[0],
            audioWeight: audioWeight[0],
          }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Geração falhou")
      }

      addTask({
        taskId: data.taskId,
        status: "PENDING",
        progress: 10,
        statusMessage: "Inicializando geração...",
        tracks: [],
        prompt: prompt.substring(0, 100),
        model,
        startTime: Date.now(),
      })

      router.push("/musicstudio/library")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Geração falhou")
      setIsGenerating(false)
    }
  }

  const getCharUsage = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "text-destructive"
    if (percentage >= 75) return "text-yellow-500"
    return "text-muted-foreground"
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black relative">
      {/* AppSidebar Esquerda */}
      <div className="hidden md:block relative z-20">
        <AppSidebar />
      </div>

      {/* Background Profissional - Camada mais baixa */}
      <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
      </div>

      {/* Conteúdo Principal - Adapta-se dinamicamente à sidebar */}
      <div className="content-wrapper flex-1 h-screen overflow-hidden relative z-10 md:flex md:flex-row transition-all duration-500">
        <main className="h-[100dvh] flex flex-col md:h-screen overflow-y-auto md:pt-0 md:flex-1 transition-all duration-500">
          {/* Desktop Header com Imagem de Capa - Rola junto com o conteúdo */}
          <motion.div 
            className="hidden md:block relative overflow-hidden border-b border-white/[0.05] shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Imagem de Fundo */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/068a7e8c-425e-4dbe-83c3-f50a7741fed4.png"
                alt="Criar Música"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
            </div>

            {/* Conteúdo do Header */}
            <div className="relative z-10 py-16 px-8">
              <div className="max-w-4xl mx-auto">
                <motion.h1 
                  className="text-5xl font-display font-bold tracking-tight text-white mb-4 drop-shadow-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Criar Música
                </motion.h1>
                <motion.p 
                  className="text-lg text-zinc-200 font-light tracking-wide drop-shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Transforme suas ideias em música profissional com IA
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Error Alert - conditional */}
          {error && (
            <div className="mx-4 mt-2 shrink-0 md:mx-auto md:mt-6 md:max-w-4xl md:w-full md:px-8">
              <Alert
                variant="destructive"
                className="animate-in fade-in slide-in-from-top-2 rounded-xl py-2 border-destructive/50 bg-destructive/10 md:py-3"
              >
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                <AlertDescription className="text-[10px] leading-relaxed md:text-sm">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Content Area */}
          <motion.div 
            className="flex-1 px-4 py-3 pb-[96px] md:px-8 md:py-8 md:pb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="md:max-w-4xl md:mx-auto">
              <Tabs defaultValue="simple" className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <TabsList className="mb-3 grid w-full grid-cols-2 bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-white/[0.01] backdrop-blur-3xl border border-white/[0.08] rounded-[1.25rem] gap-1 h-auto p-1 md:mb-8 md:rounded-[1.75rem] md:p-1.5 shadow-2xl shadow-black/20">
                    <TabsTrigger
                      value="simple"
                      className="relative rounded-[1rem] data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500/90 data-[state=active]:via-red-500/90 data-[state=active]:to-pink-600/90 data-[state=active]:backdrop-blur-xl data-[state=active]:border-0 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-orange-500/40 data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/[0.04] font-display font-bold text-sm py-2.5 transition-all duration-500 md:text-base md:py-3 md:rounded-[1.5rem] overflow-hidden group"
                    >
                      <span className="relative z-10">Simples</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 via-red-600/80 to-pink-700/80 opacity-0 group-hover:opacity-100 data-[state=active]:opacity-0 transition-opacity duration-500" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="custom"
                      className="relative rounded-[1rem] data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/90 data-[state=active]:via-violet-500/90 data-[state=active]:to-fuchsia-600/90 data-[state=active]:backdrop-blur-xl data-[state=active]:border-0 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-purple-500/40 data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/[0.04] font-display font-bold text-sm py-2.5 transition-all duration-500 md:text-base md:py-3 md:rounded-[1.5rem] overflow-hidden group"
                    >
                      <span className="relative z-10">Personalizado</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-violet-600/80 to-fuchsia-700/80 opacity-0 group-hover:opacity-100 data-[state=active]:opacity-0 transition-opacity duration-500" />
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

              <TabsContent value="simple" className="space-y-3 mt-0 md:space-y-6">
                <motion.div 
                  className="space-y-2 md:space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Label className="text-xs font-display font-bold text-white tracking-wide md:text-sm">Início Rápido</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                    {PRESETS.map((preset, index) => (
                      <motion.button
                        key={preset.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => applyPreset(preset)}
                        className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-3 text-left transition-all duration-500 hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/20 min-h-[60px] flex items-center justify-center md:rounded-3xl md:p-6 md:min-h-[90px]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/15 group-hover:to-pink-500/15 transition-all duration-500" />
                        <span className="relative text-xs font-display font-bold block text-center text-white tracking-wide md:text-sm">
                          {preset.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-3 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/[0.06] p-5 md:space-y-6 md:p-10 md:rounded-[2rem]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="simple-prompt" className="text-xs font-display font-bold text-white tracking-wide md:text-sm">
                        Descreva a Sua Música
                      </Label>
                      <span
                        className={`text-[9px] tabular-nums font-medium md:text-xs ${getCharUsage(prompt.length, limits.promptSimple)}`}
                      >
                        {prompt.length}/{limits.promptSimple}
                      </span>
                    </div>
                    <Textarea
                      id="simple-prompt"
                      placeholder="Uma faixa eletrónica animada com sintetizadores brilhantes..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[90px] resize-none border-white/[0.08] bg-black/30 text-xs leading-relaxed backdrop-blur-xl rounded-2xl text-white placeholder:text-zinc-600 focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/20 transition-all duration-300 px-4 py-3.5 md:min-h-[110px] md:rounded-3xl md:text-sm md:px-5 md:py-4"
                      maxLength={limits.promptSimple}
                    />
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="model" className="text-xs font-display font-bold text-white tracking-wide md:text-sm">
                      Modelo
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model"
                        className="border-white/[0.08] bg-black/30 backdrop-blur-xl text-white rounded-2xl h-11 text-xs font-medium hover:bg-black/40 transition-all duration-300 md:rounded-3xl md:h-11 md:text-sm focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500/30"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/[0.08] backdrop-blur-xl">
                        <SelectItem value="V3_5" className="text-white">V3.5 — Estrutura (4 min)</SelectItem>
                        <SelectItem value="V4" className="text-white">V4 — Vocais (4 min)</SelectItem>
                        <SelectItem value="V4_5" className="text-white">V4.5 — Inteligente (8 min)</SelectItem>
                        <SelectItem value="V4_5PLUS" className="text-white">V4.5 Plus — Rico (8 min)</SelectItem>
                        <SelectItem value="V5" className="text-white">V5 — Rápido (8 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/30 backdrop-blur-xl p-4 md:rounded-3xl md:p-4">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold text-white tracking-wide md:text-sm">Instrumental</Label>
                      <p className="text-[10px] text-zinc-500 font-light md:text-xs">Sem vocais</p>
                    </div>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-red-500" />
                  </div>

                  <Button
                    onClick={() => handleGenerate(false)}
                    disabled={!prompt.trim() || isGenerating}
                    className="group relative w-full rounded-full h-11 text-sm font-semibold tracking-wide bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden md:h-12 md:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isGenerating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent md:h-4 md:w-4" />
                          A Gerar...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3.5a.75.75 0 01.75.75v5h5a.75.75 0 010 1.5h-5v5a.75.75 0 01-1.5 0v-5h-5a.75.75 0 010-1.5h5v-5A.75.75 0 0110 3.5z" />
                          </svg>
                          Create
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-3 mt-0 md:space-y-6">
                <motion.div 
                  className="space-y-3 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/[0.06] p-5 md:space-y-5 md:p-10 md:rounded-[2rem]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="model-custom" className="text-xs font-display font-bold text-white tracking-wide md:text-sm">
                      Modelo
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model-custom"
                        className="border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl text-white font-medium h-11 rounded-2xl text-xs shadow-inner hover:bg-white/[0.04] transition-all duration-300 md:h-12 md:rounded-3xl md:text-sm focus:ring-2 focus:ring-purple-500/10 focus:border-white/[0.15]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900/95 border-white/[0.08] backdrop-blur-2xl rounded-2xl">
                        <SelectItem value="V3_5" className="text-white font-medium rounded-xl">V3.5 — Estrutura (4 min)</SelectItem>
                        <SelectItem value="V4" className="text-white font-medium rounded-xl">V4 — Vocais (4 min)</SelectItem>
                        <SelectItem value="V4_5" className="text-white font-medium rounded-xl">V4.5 — Inteligente (8 min)</SelectItem>
                        <SelectItem value="V4_5PLUS" className="text-white font-medium rounded-xl">V4.5 Plus — Rico (8 min)</SelectItem>
                        <SelectItem value="V5" className="text-white font-medium rounded-xl">V5 — Rápido (8 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-4 shadow-inner md:rounded-3xl md:p-5">
                    <Label className="text-xs font-display font-bold text-white tracking-wide md:text-sm">Instrumental</Label>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} className="data-[state=checked]:bg-white/[0.15] data-[state=checked]:backdrop-blur-xl data-[state=checked]:shadow-lg" />
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-prompt" className="text-xs font-display font-bold text-white tracking-wide md:text-sm">
                        {instrumental ? "Prompt" : "Letras"} <span className="text-rose-400">*</span>
                      </Label>
                      <span
                        className={`text-[9px] tabular-nums font-medium md:text-[10px] ${getCharUsage(prompt.length, limits.promptCustom)}`}
                      >
                        {prompt.length}/{limits.promptCustom}
                      </span>
                    </div>
                    <Textarea
                      id="custom-prompt"
                      placeholder={
                        instrumental ? "Descreva a música em detalhe..." : "[Verso]\nEscreva as letras aqui..."
                      }
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[90px] resize-none border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl font-mono text-xs leading-relaxed rounded-2xl text-white placeholder:text-zinc-500 focus:border-white/[0.15] focus:ring-2 focus:ring-purple-500/10 focus:bg-white/[0.04] transition-all duration-300 px-4 py-3 shadow-inner md:min-h-[120px] md:rounded-3xl md:text-sm md:px-5 md:py-4"
                      maxLength={limits.promptCustom}
                    />
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-style" className="text-xs font-display font-bold text-white tracking-wide md:text-sm">
                        Estilo <span className="text-rose-400">*</span>
                      </Label>
                      <span
                        className={`text-[9px] tabular-nums font-medium md:text-[10px] ${getCharUsage(style.length, limits.style)}`}
                      >
                        {style.length}/{limits.style}
                      </span>
                    </div>
                    <Input
                      id="custom-style"
                      placeholder="indie, eletrónica, dreamy..."
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl text-white h-11 rounded-2xl text-xs font-medium shadow-inner hover:bg-white/[0.04] transition-all duration-300 px-4 md:h-12 md:rounded-3xl md:text-sm focus:ring-2 focus:ring-purple-500/10 focus:border-white/[0.15]"
                      maxLength={limits.style}
                    />

                    {inspirationTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {inspirationTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-2 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.10] px-3.5 py-1.5 hover:bg-white/[0.10] hover:border-white/[0.15] text-xs font-medium transition-all duration-300 md:text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeInspirationTag(tag)}
                              className="ml-1 rounded-full hover:bg-white/[0.15] p-1 transition-all duration-300"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {availableTags.slice(0, 10).map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addInspirationTag(tag)}
                          disabled={inspirationTags.includes(tag)}
                          className="h-9 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl text-xs font-medium transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-95 px-4 disabled:opacity-30 md:h-10 md:text-sm"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-title" className="text-xs font-display font-bold text-white tracking-wide md:text-sm">
                        Título <span className="text-rose-400">*</span>
                      </Label>
                      <span
                        className={`text-[9px] tabular-nums font-medium md:text-[10px] ${getCharUsage(title.length, limits.title)}`}
                      >
                        {title.length}/{limits.title}
                      </span>
                    </div>
                    <Input
                      id="custom-title"
                      placeholder="Nome da música"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl text-white h-11 rounded-2xl text-xs font-medium shadow-inner hover:bg-white/[0.04] transition-all duration-300 px-4 md:h-12 md:rounded-3xl md:text-sm focus:ring-2 focus:ring-purple-500/10 focus:border-white/[0.15]"
                      maxLength={limits.title}
                    />
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-4 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.10] shadow-inner md:rounded-3xl md:p-5"
                    >
                      <Label className="cursor-pointer text-xs font-display font-bold text-white tracking-wide md:text-sm">Opções Avançadas</Label>
                      {showAdvanced ? (
                        <ChevronUp className="h-4 w-4 text-zinc-400 transition-transform md:h-5 md:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform md:h-5 md:w-5" />
                      )}
                    </button>

                    {showAdvanced && (
                      <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner md:rounded-3xl md:p-6 md:space-y-5">
                        <div className="space-y-2 md:space-y-3">
                          <Label htmlFor="negative-tags" className="text-xs font-medium text-zinc-300 tracking-wide md:text-sm">
                            Excluir Estilos
                          </Label>
                          <Input
                            id="negative-tags"
                            placeholder="Metal, Baterias..."
                            value={negativeTags}
                            onChange={(e) => setNegativeTags(e.target.value)}
                            className="border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl text-white h-10 rounded-2xl text-xs font-medium shadow-inner hover:bg-white/[0.04] transition-all duration-300 px-4 md:h-11 md:rounded-3xl md:text-sm focus:ring-2 focus:ring-purple-500/10 focus:border-white/[0.15]"
                          />
                        </div>

                        {!instrumental && (
                          <div className="space-y-2 md:space-y-3">
                            <Label htmlFor="vocal-gender" className="text-xs font-medium text-zinc-300 tracking-wide md:text-sm">
                              Género Vocal
                            </Label>
                            <Select value={vocalGender} onValueChange={(v) => setVocalGender(v as any)}>
                              <SelectTrigger
                                id="vocal-gender"
                                className="border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl text-white font-medium h-10 rounded-2xl text-xs shadow-inner hover:bg-white/[0.04] transition-all duration-300 md:h-11 md:rounded-3xl md:text-sm focus:ring-2 focus:ring-purple-500/10 focus:border-white/[0.15]"
                              >
                                <SelectValue placeholder="Automático" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900/95 border-white/[0.08] backdrop-blur-2xl rounded-2xl">
                                <SelectItem value="m" className="text-white font-medium rounded-xl">Masculino</SelectItem>
                                <SelectItem value="f" className="text-white font-medium rounded-xl">Feminino</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2 md:space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-zinc-300 tracking-wide md:text-sm">Influência Estilo</Label>
                            <span className="text-xs tabular-nums text-zinc-400 font-medium md:text-sm">
                              {Math.round(styleWeight[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={styleWeight}
                            onValueChange={setStyleWeight}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-zinc-300 tracking-wide md:text-sm">Criatividade</Label>
                            <span className="text-xs tabular-nums text-zinc-400 font-medium md:text-sm">
                              {Math.round(weirdnessConstraint[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={weirdnessConstraint}
                            onValueChange={setWeirdnessConstraint}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-zinc-300 tracking-wide md:text-sm">Peso Áudio</Label>
                            <span className="text-xs tabular-nums text-zinc-400 font-medium md:text-sm">
                              {Math.round(audioWeight[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={audioWeight}
                            onValueChange={setAudioWeight}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleGenerate(true)}
                    disabled={!prompt.trim() || !style.trim() || !title.trim() || isGenerating}
                    className="group relative w-full rounded-full h-11 text-sm font-semibold tracking-wide bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden md:h-12 md:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isGenerating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent md:h-4 md:w-4" />
                          A Gerar...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3.5a.75.75 0 01.75.75v5h5a.75.75 0 010 1.5h-5v5a.75.75 0 01-1.5 0v-5h-5a.75.75 0 010-1.5h5v-5A.75.75 0 0110 3.5z" />
                          </svg>
                          Create
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </TabsContent>
            </Tabs>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
