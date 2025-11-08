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
    <div className="flex h-screen overflow-hidden bg-black">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <div className="flex-1 h-screen overflow-hidden md:overflow-auto bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
        <main className="h-[100dvh] flex flex-col md:h-auto md:min-h-screen overflow-hidden">
          {/* Header - Estética minimalista do chat */}
          <div className="pt-safe px-4 py-3 shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-xl md:px-8 md:py-4">
            <div>
              <h1 className="text-base font-light tracking-tight text-white md:text-xl">Criar Música</h1>
              <p className="text-xs text-zinc-500 mt-0.5 font-light md:text-sm">
                Gere composições originais com IA
              </p>
            </div>
          </div>

          {/* Error Alert - Estilo refinado */}
          {error && (
            <div className="mx-4 mt-3 shrink-0 md:mx-8 md:mt-4">
              <Alert
                variant="destructive"
                className="animate-in fade-in slide-in-from-top-2 rounded-xl py-2.5 border-red-500/20 bg-red-500/5 backdrop-blur-xl md:py-3"
              >
                <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <AlertDescription className="text-xs leading-relaxed md:text-sm">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Scrollable Content - Scroll suave */}
          <div className="flex-1 overflow-y-auto smooth-scroll px-4 py-4 pb-[96px] md:px-8 md:py-6 md:pb-8">
            <Tabs defaultValue="simple" className="w-full max-w-3xl mx-auto">
              <TabsList className="mb-6 grid w-full grid-cols-2 bg-white/5 backdrop-blur-xl rounded-xl h-11 p-1 border border-white/5 md:mb-8 md:h-12 md:p-1">
                <TabsTrigger
                  value="simple"
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-zinc-300 font-medium text-sm transition-all md:text-base"
                >
                  Simples
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-zinc-300 font-medium text-sm transition-all md:text-base"
                >
                  Personalizado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="space-y-5 mt-0 md:space-y-6">
                {/* Quick Start Presets - Estilo minimalista */}
                <div className="space-y-3 md:space-y-4">
                  <Label className="text-sm font-light text-zinc-400 md:text-base">Início Rápido</Label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm p-4 text-left transition-all active:scale-[0.98] touch-manipulation hover:border-white/10 hover:bg-white/10 min-h-[64px] flex items-center justify-center md:p-5 md:min-h-[72px]"
                      >
                        <span className="relative text-sm font-light text-white block text-center leading-snug md:text-base">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Form - Card minimalista */}
                                {/* Main Form - Card minimalista */}
                <div className="space-y-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 p-5 md:space-y-6 md:p-6">
                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="simple-prompt" className="text-sm font-light text-zinc-300 md:text-base">
                        Descreva a Sua Música
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-light md:text-sm ${getCharUsage(prompt.length, limits.promptSimple)}`}
                      >
                        {prompt.length}/{limits.promptSimple}
                      </span>
                    </div>
                    <Textarea
                      id="simple-prompt"
                      placeholder="Uma faixa eletrónica animada com sintetizadores brilhantes e ritmo envolvente..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] resize-none border-white/10 bg-black/40 backdrop-blur-sm text-sm text-white leading-relaxed rounded-lg touch-manipulation focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all px-4 py-3 placeholder:text-zinc-600 md:min-h-[120px] md:text-base md:px-5 md:py-4"
                      maxLength={limits.promptSimple}
                    />
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <Label htmlFor="model" className="text-sm font-light text-zinc-300 md:text-base">
                      Modelo IA
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model"
                        className="border-white/10 bg-black/40 backdrop-blur-sm font-light text-white h-11 rounded-lg text-sm touch-manipulation focus:ring-1 focus:ring-white/10 md:h-12 md:text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-white/10 bg-zinc-950 backdrop-blur-xl">
                        <SelectItem value="V3_5" className="text-sm text-white md:text-base">V3.5 — Estrutura (4 min)</SelectItem>
                        <SelectItem value="V4" className="text-sm text-white md:text-base">V4 — Vocais (4 min)</SelectItem>
                        <SelectItem value="V4_5" className="text-sm text-white md:text-base">V4.5 — Inteligente (8 min)</SelectItem>
                        <SelectItem value="V4_5PLUS" className="text-sm text-white md:text-base">V4.5 Plus — Rico (8 min)</SelectItem>
                        <SelectItem value="V5" className="text-sm text-white md:text-base">V5 — Rápido (8 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-4 touch-manipulation md:p-5">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-light text-zinc-300 md:text-base">Instrumental</Label>
                      <p className="text-xs text-zinc-500 font-light md:text-sm">Música sem vocais</p>
                    </div>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} />
                  </div>

                  <Button
                    onClick={() => handleGenerate(false)}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full rounded-lg h-12 text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation md:h-13 md:text-base"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent md:h-4.5 md:w-4.5" />
                        A Gerar Música...
                      </>
                    ) : (
                      "Criar Música"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-5 mt-0 md:space-y-6">
                <div className="space-y-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 p-5 md:space-y-6 md:p-6">
                  <div className="space-y-3 md:space-y-3.5">
                    <Label htmlFor="model-custom" className="text-sm font-light text-zinc-300 md:text-base">
                      Modelo IA
                    </Label>
                    <Select value={model} onValueChange={(v) => setModel(v as any)}>
                      <SelectTrigger
                        id="model-custom"
                        className="border-white/10 bg-black/40 backdrop-blur-sm font-light text-white h-11 rounded-lg text-sm touch-manipulation focus:ring-1 focus:ring-white/10 md:h-12 md:text-base"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-white/10 bg-zinc-950 backdrop-blur-xl">
                        <SelectItem value="V3_5" className="text-sm text-white md:text-base">V3.5</SelectItem>
                        <SelectItem value="V4" className="text-sm text-white md:text-base">V4</SelectItem>
                        <SelectItem value="V4_5" className="text-sm text-white md:text-base">V4.5</SelectItem>
                        <SelectItem value="V4_5PLUS" className="text-sm text-white md:text-base">V4.5 Plus</SelectItem>
                        <SelectItem value="V5" className="text-sm text-white md:text-base">V5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-4 touch-manipulation md:p-5">
                    <Label className="text-sm font-light text-zinc-300 md:text-base">Instrumental</Label>
                    <Switch checked={instrumental} onCheckedChange={setInstrumental} />
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-prompt" className="text-sm font-light text-zinc-300 md:text-base">
                        {instrumental ? "Prompt" : "Letras"} <span className="text-red-400">*</span>
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-light md:text-sm ${getCharUsage(prompt.length, limits.promptCustom)}`}
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
                      className="min-h-[100px] resize-none border-white/10 bg-black/40 backdrop-blur-sm font-mono text-sm text-white leading-relaxed rounded-lg touch-manipulation focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all px-4 py-3 placeholder:text-zinc-600 md:min-h-[120px] md:text-base md:px-5 md:py-4"
                      maxLength={limits.promptCustom}
                    />
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-style" className="text-sm font-light text-zinc-300 md:text-base">
                        Estilo <span className="text-red-400">*</span>
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-light md:text-sm ${getCharUsage(style.length, limits.style)}`}
                      >
                        {style.length}/{limits.style}
                      </span>
                    </div>
                    <Input
                      id="custom-style"
                      placeholder="indie, eletrónica, dreamy..."
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="border-white/10 bg-black/40 backdrop-blur-sm h-11 text-white rounded-lg text-sm touch-manipulation focus:ring-1 focus:ring-white/10 transition-all px-4 placeholder:text-zinc-600 md:h-12 md:text-base md:px-5"
                      maxLength={limits.style}
                    />

                    {inspirationTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {inspirationTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 hover:bg-white/20 text-xs font-light text-white touch-manipulation border border-white/10 md:text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeInspirationTag(tag)}
                              className="ml-1 rounded-full hover:bg-white/30 p-0.5 touch-manipulation transition-colors"
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
                          className="h-8 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm text-xs font-light text-white transition-all active:scale-95 touch-manipulation px-3 hover:bg-white/10 disabled:opacity-30 md:h-9 md:text-sm md:px-4"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-title" className="text-sm font-light text-zinc-300 md:text-base">
                        Título <span className="text-red-400">*</span>
                      </Label>
                      <span
                        className={`text-xs tabular-nums font-light md:text-sm ${getCharUsage(title.length, limits.title)}`}
                      >
                        {title.length}/{limits.title}
                      </span>
                    </div>
                    <Input
                      id="custom-title"
                      placeholder="Nome da música"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-white/10 bg-black/40 backdrop-blur-sm h-11 text-white rounded-lg text-sm touch-manipulation focus:ring-1 focus:ring-white/10 transition-all px-4 placeholder:text-zinc-600 md:h-12 md:text-base md:px-5"
                      maxLength={limits.title}
                    />
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-4 transition-all active:bg-white/5 touch-manipulation hover:border-white/20 md:p-5"
                    >
                      <Label className="cursor-pointer text-sm font-light text-zinc-300 md:text-base">Opções Avançadas</Label>
                      {showAdvanced ? (
                        <ChevronUp className="h-5 w-5 text-zinc-400 transition-transform md:h-6 md:w-6" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-zinc-400 transition-transform md:h-6 md:w-6" />
                      )}
                    </button>

                    {showAdvanced && (
                      <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 md:space-y-5 md:p-5">
                        <div className="space-y-3 md:space-y-3.5">
                          <Label htmlFor="negative-tags" className="text-sm font-light text-zinc-300 md:text-base">
                            Excluir Estilos
                          </Label>
                          <Input
                            id="negative-tags"
                            placeholder="Metal, Baterias..."
                            value={negativeTags}
                            onChange={(e) => setNegativeTags(e.target.value)}
                            className="border-white/10 bg-black/40 backdrop-blur-sm h-11 rounded-lg text-sm text-white touch-manipulation px-4 placeholder:text-zinc-600 focus:ring-1 focus:ring-white/10 md:h-12 md:text-base md:px-5"
                          />
                        </div>

                        {!instrumental && (
                          <div className="space-y-3 md:space-y-3.5">
                            <Label htmlFor="vocal-gender" className="text-sm font-light text-zinc-300 md:text-base">
                              Género Vocal
                            </Label>
                            <Select value={vocalGender} onValueChange={(v) => setVocalGender(v as any)}>
                              <SelectTrigger
                                id="vocal-gender"
                                className="border-white/10 bg-black/40 backdrop-blur-sm font-light h-11 rounded-lg text-sm text-white touch-manipulation md:h-12 md:text-base"
                              >
                                <SelectValue placeholder="Automático" />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg border-white/10 bg-zinc-950 backdrop-blur-2xl">
                                <SelectItem value="m" className="rounded-lg text-sm text-white md:text-base">Masculino</SelectItem>
                                <SelectItem value="f" className="rounded-lg text-sm text-white md:text-base">Feminino</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-3 md:space-y-3.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-light text-zinc-300 md:text-base">Influência Estilo</Label>
                            <span className="text-sm tabular-nums text-zinc-500 font-light md:text-base">
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
                            <Label className="text-sm font-light text-zinc-300 md:text-base">Criatividade</Label>
                            <span className="text-sm tabular-nums text-zinc-500 font-light md:text-base">
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
                            <Label className="text-sm font-light text-zinc-300 md:text-base">Peso Áudio</Label>
                            <span className="text-sm tabular-nums text-zinc-500 font-light md:text-base">
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
                    className="w-full rounded-lg h-14 text-base font-light bg-white/10 hover:bg-white/20 text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50 border border-white/10 touch-manipulation mt-2 md:h-16 md:text-lg md:mt-3"
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
