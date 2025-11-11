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
import { MusicStudioNavbar } from "@/components/music-studio-navbar"
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

      router.push("/library")
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

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Global Navbar - Mobile */}
      <div className="md:hidden">
        <MusicStudioNavbar />
      </div>

      {/* Background Gradient - Desktop Only */}
      <div className="hidden md:block fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-pink-900/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 h-screen overflow-hidden md:overflow-auto relative z-10">
        <main className="h-[100dvh] flex flex-col md:h-auto md:min-h-screen overflow-hidden pt-[68px] md:pt-0">
          {/* Desktop Header */}
          <div className="hidden md:block py-8 px-8 border-b border-white/[0.08]">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
                Criar Música
              </h1>
              <p className="text-sm text-zinc-400 font-normal">
                Transforme suas ideias em música profissional com IA
              </p>
            </div>
          </div>

          {/* Error Alert - conditional */}
          {error && (
            <div className="mx-4 mt-2 shrink-0 md:mx-auto md:mt-6 md:max-w-4xl md:w-full">
              <Alert
                variant="destructive"
                className="animate-in fade-in slide-in-from-top-2 rounded-xl py-2 border-destructive/50 bg-destructive/10 md:py-3"
              >
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                <AlertDescription className="text-[10px] leading-relaxed md:text-sm">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto smooth-scroll px-4 py-3 pb-[96px] md:px-8 md:py-8 md:pb-12">
            <div className="md:max-w-4xl md:mx-auto">
              <Tabs defaultValue="simple" className="w-full">
                <TabsList className="mb-3 grid w-full grid-cols-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl gap-1 h-auto p-1 md:mb-6 md:rounded-2xl">
                  <TabsTrigger
                    value="simple"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white font-semibold text-sm py-2.5 transition-all shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 md:text-base md:py-3 md:rounded-xl"
                  >
                    Simples
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white font-semibold text-sm py-2.5 transition-all shadow-none data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 md:text-base md:py-3 md:rounded-xl"
                  >
                    Personalizado
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="simple" className="space-y-3 mt-0 md:space-y-5">
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-[11px] font-semibold text-white md:text-sm">Início Rápido</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-3 text-left transition-all active:scale-[0.97] hover:bg-white/[0.06] hover:border-white/20 min-h-[60px] flex items-center justify-center md:rounded-2xl md:p-5 md:min-h-[80px] md:hover:shadow-lg md:hover:shadow-purple-500/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
                        <span className="relative text-[11px] font-semibold block text-center text-white md:text-sm">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-3 md:space-y-5 md:p-6 md:rounded-2xl">
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="simple-prompt" className="text-[11px] font-semibold text-white md:text-sm">
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
                      className="min-h-[70px] resize-none border-white/[0.08] bg-white/[0.03] text-[11px] leading-relaxed backdrop-blur-xl rounded-xl text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all px-3 py-2.5 md:min-h-[100px] md:rounded-2xl md:text-sm md:px-4 md:py-3"
                      maxLength={limits.promptSimple}
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="model" className="text-[11px] font-semibold text-white md:text-sm">
                      Modelo
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model"
                        className="border-white/[0.08] bg-white/[0.03] backdrop-blur-xl text-white rounded-xl h-9 text-[11px] md:rounded-2xl md:h-11 md:text-sm focus:ring-2 focus:ring-purple-500/20"
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

                  <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-3 md:rounded-2xl md:p-4">
                    <div className="space-y-0.5">
                      <Label className="text-[11px] font-semibold text-white md:text-sm">Instrumental</Label>
                      <p className="text-[9px] text-zinc-400 font-normal md:text-xs">Sem vocais</p>
                    </div>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500" />
                  </div>

                  <Button
                    onClick={() => handleGenerate(false)}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full rounded-xl h-11 text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 md:rounded-2xl md:h-12 md:text-base"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent md:h-4 md:w-4" />
                        A Gerar...
                      </>
                    ) : (
                      "Criar Música"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-3 mt-0 md:space-y-4">
                <div className="space-y-3 rounded-xl glass-effect border border-border/30 p-3 md:space-y-4 md:p-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="model-custom" className="text-[11px] font-semibold md:text-xs">
                      Modelo
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model-custom"
                        className="border-border/30 bg-background/50 font-medium h-9 rounded-lg text-[11px] touch-manipulation md:h-10 md:rounded-xl md:text-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="V3_5">V3.5</SelectItem>
                        <SelectItem value="V4">V4</SelectItem>
                        <SelectItem value="V4_5">V4.5</SelectItem>
                        <SelectItem value="V4_5PLUS">V4.5 Plus</SelectItem>
                        <SelectItem value="V5">V5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 p-2.5 touch-manipulation md:rounded-xl md:p-3">
                    <Label className="text-[11px] font-semibold md:text-xs">Instrumental</Label>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-prompt" className="text-[11px] font-semibold md:text-xs">
                        {instrumental ? "Prompt" : "Letras"} <span className="text-destructive">*</span>
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
                      className="min-h-[70px] resize-none border-border/30 bg-background/50 font-mono text-[11px] leading-relaxed backdrop-blur-sm rounded-lg touch-manipulation focus:border-primary/50 transition-colors px-2.5 py-2 md:min-h-[88px] md:rounded-xl md:text-xs md:px-3 md:py-2.5"
                      maxLength={limits.promptCustom}
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-style" className="text-[11px] font-semibold md:text-xs">
                        Estilo <span className="text-destructive">*</span>
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
                      className="border-border/30 bg-background/50 h-9 rounded-lg text-[11px] touch-manipulation focus:border-primary/50 transition-colors px-3 md:h-10 md:rounded-xl md:text-xs"
                      maxLength={limits.style}
                    />

                    {inspirationTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {inspirationTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 hover:bg-primary/20 text-[10px] font-medium touch-manipulation border border-primary/20 md:text-[11px]"
                          >
                            {tag}
                            <button
                              onClick={() => removeInspirationTag(tag)}
                              className="ml-0.5 rounded-full hover:bg-primary/30 p-0.5 touch-manipulation transition-colors md:ml-1"
                            >
                              <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {availableTags.slice(0, 10).map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addInspirationTag(tag)}
                          disabled={inspirationTags.includes(tag)}
                          className="h-7 rounded-full border border-border/30 text-[10px] font-medium transition-all active:scale-95 touch-manipulation px-3 md:h-8 md:text-[11px]"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-title" className="text-[11px] font-semibold md:text-xs">
                        Título <span className="text-destructive">*</span>
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
                      className="border-border/30 bg-background/50 h-9 rounded-lg text-[11px] touch-manipulation focus:border-primary/50 transition-colors px-3 md:h-10 md:rounded-xl md:text-xs"
                      maxLength={limits.title}
                    />
                  </div>

                  <div className="space-y-2.5 md:space-y-3">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex w-full items-center justify-between rounded-lg border border-border/30 bg-muted/20 p-2.5 transition-all active:bg-muted/30 touch-manipulation hover:border-primary/30 md:rounded-xl md:p-3"
                    >
                      <Label className="cursor-pointer text-[11px] font-semibold md:text-xs">Opções Avançadas</Label>
                      {showAdvanced ? (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground transition-transform md:h-4 md:w-4" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform md:h-4 md:w-4" />
                      )}
                    </button>

                    {showAdvanced && (
                      <div className="space-y-3 rounded-lg border border-border/30 bg-muted/20 p-3.5 animate-in fade-in slide-in-from-top-2 duration-200 md:rounded-xl md:p-4">
                        <div className="space-y-1.5 md:space-y-2">
                          <Label htmlFor="negative-tags" className="text-[11px] font-medium md:text-xs">
                            Excluir Estilos
                          </Label>
                          <Input
                            id="negative-tags"
                            placeholder="Metal, Baterias..."
                            value={negativeTags}
                            onChange={(e) => setNegativeTags(e.target.value)}
                            className="border-border/30 bg-background/50 h-8 rounded-lg text-[11px] touch-manipulation px-3 md:h-9 md:rounded-xl md:text-xs"
                          />
                        </div>

                        {!instrumental && (
                          <div className="space-y-1.5 md:space-y-2">
                            <Label htmlFor="vocal-gender" className="text-[11px] font-medium md:text-xs">
                              Género Vocal
                            </Label>
                            <Select value={vocalGender} onValueChange={(v) => setVocalGender(v as any)}>
                              <SelectTrigger
                                id="vocal-gender"
                                className="border-border/30 bg-background/50 font-medium h-8 rounded-lg text-[11px] touch-manipulation md:h-9 md:rounded-xl md:text-xs"
                              >
                                <SelectValue placeholder="Automático" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="m">Masculino</SelectItem>
                                <SelectItem value="f">Feminino</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-medium md:text-xs">Influência Estilo</Label>
                            <span className="text-[10px] tabular-nums text-muted-foreground font-medium md:text-[11px]">
                              {Math.round(styleWeight[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={styleWeight}
                            onValueChange={setStyleWeight}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full touch-manipulation"
                          />
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-medium md:text-xs">Criatividade</Label>
                            <span className="text-[10px] tabular-nums text-muted-foreground font-medium md:text-[11px]">
                              {Math.round(weirdnessConstraint[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={weirdnessConstraint}
                            onValueChange={setWeirdnessConstraint}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full touch-manipulation"
                          />
                        </div>

                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-medium md:text-xs">Peso Áudio</Label>
                            <span className="text-[10px] tabular-nums text-muted-foreground font-medium md:text-[11px]">
                              {Math.round(audioWeight[0] * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={audioWeight}
                            onValueChange={setAudioWeight}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-full touch-manipulation"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleGenerate(true)}
                    disabled={!prompt.trim() || !style.trim() || !title.trim() || isGenerating}
                    className="w-full rounded-lg h-10 text-xs font-semibold gradient-primary text-white hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 glow-primary touch-manipulation shadow-md mt-0.5 md:rounded-xl md:h-11 md:text-sm md:mt-1"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent md:h-4 md:w-4" />
                        A Gerar...
                      </>
                    ) : (
                      "Criar Música"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
