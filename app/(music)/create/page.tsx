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

      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <div className="flex-1 h-screen overflow-hidden md:overflow-auto">
        <main className="h-[100dvh] flex flex-col md:h-auto md:min-h-screen overflow-hidden">
          {/* Header - Ultra Premium iOS Style */}
          <div className="pt-safe px-4 py-4 shrink-0 border-b border-border/10 backdrop-blur-2xl bg-background/60 md:px-8 md:py-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 md:h-12 md:w-12">
                <svg className="h-5 w-5 text-white md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-2xl">Criar Música</h1>
                <p className="text-xs text-muted-foreground mt-0.5 font-light md:text-sm">
                  Gere composições originais com IA
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert - iOS Style */}
          {error && (
            <div className="mx-4 mt-3 shrink-0 md:mx-8 md:mt-4">
              <Alert
                variant="destructive"
                className="animate-in fade-in slide-in-from-top-2 rounded-2xl py-3 border-destructive/20 bg-destructive/5 backdrop-blur-xl md:py-3.5"
              >
                <AlertCircle className="h-4 w-4 md:h-4 md:w-4" />
                <AlertDescription className="text-xs leading-relaxed md:text-sm">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Scrollable Content - iOS smooth scrolling */}
          <div className="flex-1 overflow-y-auto smooth-scroll px-4 py-4 pb-[96px] md:px-8 md:py-6 md:pb-8">
            <Tabs defaultValue="simple" className="w-full max-w-3xl mx-auto">
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-muted/30 backdrop-blur-xl rounded-2xl h-12 p-1.5 border border-border/10 md:mb-8 md:h-14 md:p-2">
                <TabsTrigger
                  value="simple"
                  className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-black/5 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground font-semibold text-sm transition-all md:text-base"
                >
                  Simples
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-black/5 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground font-semibold text-sm transition-all md:text-base"
                >
                  Personalizado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="space-y-5 mt-0 md:space-y-6">
                {/* Quick Start Presets - iOS Card Style */}
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    <Label className="text-sm font-semibold text-foreground md:text-base">Início Rápido</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="group relative overflow-hidden rounded-2xl border border-border/10 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-xl p-4 text-left transition-all active:scale-[0.97] touch-manipulation hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 min-h-[68px] flex items-center justify-center md:rounded-3xl md:p-5 md:min-h-[76px]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="relative text-sm font-semibold block text-center leading-snug md:text-base">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Form - iOS Glass Card */}
                <div className="space-y-5 rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-2xl border border-border/10 p-5 shadow-2xl shadow-black/5 md:space-y-6 md:p-6 md:rounded-[32px]">
                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="simple-prompt" className="text-sm font-semibold md:text-base">
                        Descreva a Sua Música
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-semibold md:text-sm ${getCharUsage(prompt.length, limits.promptSimple)}`}
                      >
                        {prompt.length}/{limits.promptSimple}
                      </span>
                    </div>
                    <Textarea
                      id="simple-prompt"
                      placeholder="Uma faixa eletrónica animada com sintetizadores brilhantes e ritmo envolvente..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] resize-none border-border/10 bg-background/60 backdrop-blur-sm text-sm leading-relaxed rounded-2xl touch-manipulation focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all px-4 py-3 md:min-h-[120px] md:rounded-3xl md:text-base md:px-5 md:py-4"
                      maxLength={limits.promptSimple}
                    />
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <Label htmlFor="model" className="text-sm font-semibold md:text-base">
                      Modelo IA
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model"
                        className="border-border/10 bg-background/60 backdrop-blur-sm font-semibold h-12 rounded-2xl text-sm touch-manipulation focus:ring-2 focus:ring-primary/10 md:h-14 md:rounded-3xl md:text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/10 backdrop-blur-2xl">
                        <SelectItem value="V3_5" className="rounded-xl text-sm md:text-base">V3.5 — Estrutura (4 min)</SelectItem>
                        <SelectItem value="V4" className="rounded-xl text-sm md:text-base">V4 — Vocais (4 min)</SelectItem>
                        <SelectItem value="V4_5" className="rounded-xl text-sm md:text-base">V4.5 — Inteligente (8 min)</SelectItem>
                        <SelectItem value="V4_5PLUS" className="rounded-xl text-sm md:text-base">V4.5 Plus — Rico (8 min)</SelectItem>
                        <SelectItem value="V5" className="rounded-xl text-sm md:text-base">V5 — Rápido (8 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/10 bg-background/40 backdrop-blur-sm p-4 touch-manipulation md:rounded-3xl md:p-5">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold md:text-base">Instrumental</Label>
                      <p className="text-xs text-muted-foreground font-light md:text-sm">Música sem vocais</p>
                    </div>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} className="scale-110" />
                  </div>

                  <Button
                    onClick={() => handleGenerate(false)}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full rounded-2xl h-14 text-base font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white transition-all duration-500 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-purple-500/25 touch-manipulation mt-2 md:rounded-3xl md:h-16 md:text-lg md:mt-3"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2.5 h-5 w-5 animate-spin rounded-full border-3 border-current border-t-transparent md:h-6 md:w-6" />
                        A Gerar Música...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Criar Música
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-5 mt-0 md:space-y-6">
                <div className="space-y-5 rounded-3xl bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-2xl border border-border/10 p-5 shadow-2xl shadow-black/5 md:space-y-6 md:p-6 md:rounded-[32px]">
                  <div className="space-y-3 md:space-y-3.5">
                    <Label htmlFor="model-custom" className="text-sm font-semibold md:text-base">
                      Modelo IA
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model-custom"
                        className="border-border/10 bg-background/60 backdrop-blur-sm font-semibold h-12 rounded-2xl text-sm touch-manipulation focus:ring-2 focus:ring-primary/10 md:h-14 md:rounded-3xl md:text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/10 backdrop-blur-2xl">
                        <SelectItem value="V3_5" className="rounded-xl text-sm md:text-base">V3.5</SelectItem>
                        <SelectItem value="V4" className="rounded-xl text-sm md:text-base">V4</SelectItem>
                        <SelectItem value="V4_5" className="rounded-xl text-sm md:text-base">V4.5</SelectItem>
                        <SelectItem value="V4_5PLUS" className="rounded-xl text-sm md:text-base">V4.5 Plus</SelectItem>
                        <SelectItem value="V5" className="rounded-xl text-sm md:text-base">V5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/10 bg-background/40 backdrop-blur-sm p-4 touch-manipulation md:rounded-3xl md:p-5">
                    <Label className="text-sm font-semibold md:text-base">Instrumental</Label>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} className="scale-110" />
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-prompt" className="text-sm font-semibold md:text-base">
                        {instrumental ? "Prompt" : "Letras"} <span className="text-destructive">*</span>
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-semibold md:text-sm ${getCharUsage(prompt.length, limits.promptCustom)}`}
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
                      className="min-h-[100px] resize-none border-border/10 bg-background/60 backdrop-blur-sm font-mono text-sm leading-relaxed rounded-2xl touch-manipulation focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all px-4 py-3 md:min-h-[120px] md:rounded-3xl md:text-base md:px-5 md:py-4"
                      maxLength={limits.promptCustom}
                    />
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-style" className="text-sm font-semibold md:text-base">
                        Estilo <span className="text-destructive">*</span>
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-semibold md:text-sm ${getCharUsage(style.length, limits.style)}`}
                      >
                        {style.length}/{limits.style}
                      </span>
                    </div>
                    <Input
                      id="custom-style"
                      placeholder="indie, eletrónica, dreamy..."
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="border-border/10 bg-background/60 backdrop-blur-sm h-12 rounded-2xl text-sm touch-manipulation focus:ring-2 focus:ring-primary/10 transition-all px-4 md:h-14 md:rounded-3xl md:text-base md:px-5"
                      maxLength={limits.style}
                    />

                    {inspirationTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {inspirationTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-2 rounded-full bg-primary/10 backdrop-blur-sm px-3.5 py-1.5 hover:bg-primary/20 text-xs font-semibold touch-manipulation border border-primary/20 transition-all md:text-sm md:px-4 md:py-2"
                          >
                            {tag}
                            <button
                              onClick={() => removeInspirationTag(tag)}
                              className="ml-1 rounded-full hover:bg-primary/30 p-1 touch-manipulation transition-colors"
                            >
                              <X className="h-3 w-3 md:h-3.5 md:w-3.5" />
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
                          className="h-9 rounded-full border border-border/10 bg-background/40 backdrop-blur-sm text-xs font-semibold transition-all active:scale-95 touch-manipulation px-4 md:h-10 md:text-sm md:px-5"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-title" className="text-sm font-semibold md:text-base">
                        Título <span className="text-destructive">*</span>
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-semibold md:text-sm ${getCharUsage(title.length, limits.title)}`}
                      >
                        {title.length}/{limits.title}
                      </span>
                    </div>
                    <Input
                      id="custom-title"
                      placeholder="Nome da música"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-border/10 bg-background/60 backdrop-blur-sm h-12 rounded-2xl text-sm touch-manipulation focus:ring-2 focus:ring-primary/10 transition-all px-4 md:h-14 md:rounded-3xl md:text-base md:px-5"
                      maxLength={limits.title}
                    />
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex w-full items-center justify-between rounded-2xl border border-border/10 bg-background/40 backdrop-blur-sm p-4 transition-all active:bg-background/60 touch-manipulation hover:border-primary/20 md:rounded-3xl md:p-5"
                    >
                      <Label className="cursor-pointer text-sm font-semibold md:text-base">Opções Avançadas</Label>
                      {showAdvanced ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform md:h-6 md:w-6" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform md:h-6 md:w-6" />
                      )}
                    </button>

                    {showAdvanced && (
                      <div className="space-y-4 rounded-2xl border border-border/10 bg-muted/30 backdrop-blur-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 md:space-y-5 md:rounded-3xl md:p-5">
                        <div className="space-y-3 md:space-y-3.5">
                          <Label htmlFor="negative-tags" className="text-sm font-semibold md:text-base">
                            Excluir Estilos
                          </Label>
                          <Input
                            id="negative-tags"
                            placeholder="Metal, Baterias..."
                            value={negativeTags}
                            onChange={(e) => setNegativeTags(e.target.value)}
                            className="border-border/10 bg-background/60 backdrop-blur-sm h-11 rounded-2xl text-sm touch-manipulation px-4 md:h-12 md:rounded-3xl md:text-base md:px-5"
                          />
                        </div>

                        {!instrumental && (
                          <div className="space-y-3 md:space-y-3.5">
                            <Label htmlFor="vocal-gender" className="text-sm font-semibold md:text-base">
                              Género Vocal
                            </Label>
                            <Select value={vocalGender} onValueChange={(v) => setVocalGender(v as any)}>
                              <SelectTrigger
                                id="vocal-gender"
                                className="border-border/10 bg-background/60 backdrop-blur-sm font-semibold h-11 rounded-2xl text-sm touch-manipulation md:h-12 md:rounded-3xl md:text-base"
                              >
                                <SelectValue placeholder="Automático" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl border-border/10 backdrop-blur-2xl">
                                <SelectItem value="m" className="rounded-xl text-sm md:text-base">Masculino</SelectItem>
                                <SelectItem value="f" className="rounded-xl text-sm md:text-base">Feminino</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-3 md:space-y-3.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold md:text-base">Influência Estilo</Label>
                            <span className="text-sm tabular-nums text-muted-foreground font-semibold md:text-base">
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

                        <div className="space-y-3 md:space-y-3.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold md:text-base">Criatividade</Label>
                            <span className="text-sm tabular-nums text-muted-foreground font-semibold md:text-base">
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

                        <div className="space-y-3 md:space-y-3.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold md:text-base">Peso Áudio</Label>
                            <span className="text-sm tabular-nums text-muted-foreground font-semibold md:text-base">
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
                    className="w-full rounded-2xl h-14 text-base font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white transition-all duration-500 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-purple-500/25 touch-manipulation mt-2 md:rounded-3xl md:h-16 md:text-lg md:mt-3"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2.5 h-5 w-5 animate-spin rounded-full border-3 border-current border-t-transparent md:h-6 md:w-6" />
                        A Gerar Música...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Criar Música
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
