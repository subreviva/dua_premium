"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Video,
  Upload,
  Loader2,
  PlayCircle,
  Clock,
  Image as ImageIcon,
  Film,
  X,
  Settings,
} from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { useIsMobile } from "@/lib/hooks"
import { useVeoApi, VEO_MODELS, type VeoModel, type VeoMode } from "@/hooks/useVeoApi"

export default function VideoStudioPage() {
  const isMobile = useIsMobile()
  const veoApi = useVeoApi()

  // Form state
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<VeoModel>("veo-3.1-preview")
  const [mode, setMode] = useState<VeoMode>("text-to-video")
  const [resolution, setResolution] = useState<"720p" | "1080p">("720p")
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9")
  const [duration, setDuration] = useState<4 | 5 | 6 | 8>(5)
  const [personGeneration, setPersonGeneration] = useState<"allow_all" | "allow_adult" | "dont_allow">("allow_all")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // File inputs
  const [firstFrameImage, setFirstFrameImage] = useState<File | null>(null)
  const [lastFrameImage, setLastFrameImage] = useState<File | null>(null)
  const [inputVideo, setInputVideo] = useState<File | null>(null)
  const [referenceImages, setReferenceImages] = useState<Array<{ file: File; type: "asset" | "style" }>>([])

  const firstFrameRef = useRef<HTMLInputElement>(null)
  const lastFrameRef = useRef<HTMLInputElement>(null)
  const inputVideoRef = useRef<HTMLInputElement>(null)
  const referenceImageRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      await veoApi.generateVideo({
        model: selectedModel,
        mode,
        prompt,
        negativePrompt: negativePrompt || undefined,
        firstFrameImage: firstFrameImage || undefined,
        lastFrameImage: lastFrameImage || undefined,
        inputVideo: inputVideo || undefined,
        referenceImages:
          referenceImages.length > 0
            ? referenceImages.map((ref) => ({ image: ref.file, referenceType: ref.type }))
            : undefined,
        resolution,
        aspectRatio,
        durationSeconds: duration,
        personGeneration,
        numberOfVideos: 1,
      })
    } catch (error) {
      // console.error("Error generating video:", error)
    }
  }

  const handleFirstFrameSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFirstFrameImage(e.target.files[0])
    }
  }

  const handleLastFrameSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLastFrameImage(e.target.files[0])
    }
  }

  const handleInputVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setInputVideo(e.target.files[0])
    }
  }

  const handleReferenceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && referenceImages.length < 3) {
      setReferenceImages([...referenceImages, { file: e.target.files[0], type: "asset" }])
    }
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index))
  }

  const modelInfo = VEO_MODELS[selectedModel]
  const canUseMode = modelInfo.features.includes(mode as any)

  return (
    <BeamsBackground>
      <PremiumNavbar />

      <div className={cn("relative z-10 w-full", isMobile ? "px-4 pt-24 pb-20" : "px-6 pt-32 pb-16")}>
        {/* Header */}
        <div className={cn("text-center", isMobile ? "mb-8" : "mb-12")}>
          <h1
            className={cn(
              "font-bold text-white mb-3",
              isMobile ? "text-3xl" : "text-4xl sm:text-5xl lg:text-6xl",
            )}
          >
            Video Studio
          </h1>
          <p className={cn("text-white/60", isMobile ? "text-sm" : "text-base sm:text-lg")}>
            Gere vídeos cinematográficos com Veo 3.1
          </p>
        </div>

        {/* Main Card */}
        <main className="w-full max-w-4xl mx-auto">
          <div
            className={cn(
              "bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden",
              isMobile ? "p-5" : "p-6 sm:p-8",
            )}
          >
            {/* Prompt Textarea */}
            <div className="mb-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o vídeo que deseja gerar (máx. 1024 caracteres)..."
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500/50",
                  isMobile ? "min-h-[120px] text-base p-4" : "min-h-[100px] text-sm p-4",
                )}
                maxLength={1024}
              />
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-xs text-white/40">{prompt.length}/1024 caracteres</span>
              </div>
            </div>

            {/* Negative Prompt (Advanced) */}
            {showAdvanced && (
              <div className="mb-4">
                <Textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="O que NÃO incluir no vídeo (cartoon, drawing, low quality...)..."
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl resize-none focus:ring-2 focus:ring-orange-500/50",
                    isMobile ? "min-h-[80px] text-base p-4" : "min-h-[60px] text-sm p-4",
                  )}
                  maxLength={512}
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-xs text-orange-400/60">Negative Prompt (opcional)</span>
                  <span className="text-xs text-white/40">{negativePrompt.length}/512</span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="space-y-4">
              {/* Mode & Model Selection */}
              {isMobile ? (
                <div className="grid grid-cols-2 gap-3">
                  <Select value={mode} onValueChange={(v) => setMode(v as VeoMode)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-4 text-sm transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="text-to-video">Texto → Vídeo</SelectItem>
                      <SelectItem value="image-to-video">Imagem → Vídeo</SelectItem>
                      <SelectItem value="reference-images">Imagens Ref</SelectItem>
                      <SelectItem value="interpolation">Interpolação</SelectItem>
                      <SelectItem value="extension">Extensão</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as VeoModel)}>
                    <SelectTrigger
                      className={cn(
                        "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-4 text-sm transition-all",
                        !canUseMode && "opacity-50",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="veo-3.1-preview">Veo 3.1 Preview</SelectItem>
                      <SelectItem value="veo-3.1-fast">Veo 3.1 Fast</SelectItem>
                      <SelectItem value="veo-3.0">Veo 3.0</SelectItem>
                      <SelectItem value="veo-3.0-fast">Veo 3.0 Fast</SelectItem>
                      <SelectItem value="veo-2.0">Veo 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg px-3 h-9 text-xs sm:text-sm font-medium flex-shrink-0">
                    <Video className="w-3.5 h-3.5" />
                    <span>Geração de Vídeo</span>
                  </div>

                  <Select value={mode} onValueChange={(v) => setMode(v as VeoMode)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-3 text-xs sm:text-sm transition-all flex-shrink-0 w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="text-to-video">Texto → Vídeo</SelectItem>
                      <SelectItem value="image-to-video">Imagem → Vídeo</SelectItem>
                      <SelectItem value="reference-images">Imagens Ref</SelectItem>
                      <SelectItem value="interpolation">Interpolação</SelectItem>
                      <SelectItem value="extension">Extensão</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as VeoModel)}>
                    <SelectTrigger
                      className={cn(
                        "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-3 text-xs sm:text-sm transition-all flex-shrink-0 w-[140px]",
                        !canUseMode && "opacity-50",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="veo-3.1-preview">Veo 3.1 Preview</SelectItem>
                      <SelectItem value="veo-3.1-fast">Veo 3.1 Fast</SelectItem>
                      <SelectItem value="veo-3.0">Veo 3.0</SelectItem>
                      <SelectItem value="veo-3.0-fast">Veo 3.0 Fast</SelectItem>
                      <SelectItem value="veo-2.0">Veo 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Video Settings */}
              {isMobile ? (
                <div className="grid grid-cols-3 gap-3">
                  <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-3 text-sm transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="16:9">16:9</SelectItem>
                      <SelectItem value="9:16">9:16</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-3 text-sm transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v) as 4 | 5 | 6 | 8)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-3 text-sm transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="4">4s</SelectItem>
                      <SelectItem value="5">5s</SelectItem>
                      <SelectItem value="6">6s</SelectItem>
                      <SelectItem value="8">8s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-3 text-xs sm:text-sm transition-all flex-shrink-0 w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="16:9">16:9</SelectItem>
                      <SelectItem value="9:16">9:16</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-3 text-xs sm:text-sm transition-all flex-shrink-0 w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v) as 4 | 5 | 6 | 8)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-3 text-xs sm:text-sm transition-all flex-shrink-0 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="4">4s</SelectItem>
                      <SelectItem value="5">5s</SelectItem>
                      <SelectItem value="6">6s</SelectItem>
                      <SelectItem value="8">8s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* File Uploads based on mode */}
              {(mode === "image-to-video" || mode === "interpolation") && (
                <div className={cn("flex gap-3", isMobile ? "flex-col" : "flex-row")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => firstFrameRef.current?.click()}
                    className={cn(
                      "bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all active:scale-95",
                      isMobile ? "h-11 flex-1" : "h-9 px-4",
                    )}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {firstFrameImage ? "Primeiro Frame ✓" : "Primeiro Frame"}
                  </Button>
                  <input
                    ref={firstFrameRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFirstFrameSelect}
                    className="hidden"
                  />

                  {mode === "interpolation" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => lastFrameRef.current?.click()}
                        className={cn(
                          "bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all active:scale-95",
                          isMobile ? "h-11 flex-1" : "h-9 px-4",
                        )}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {lastFrameImage ? "Último Frame ✓" : "Último Frame"}
                      </Button>
                      <input
                        ref={lastFrameRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLastFrameSelect}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              )}

              {mode === "reference-images" && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => referenceImageRef.current?.click()}
                    disabled={referenceImages.length >= 3}
                    className={cn(
                      "bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all active:scale-95 w-full",
                      isMobile ? "h-11" : "h-9",
                    )}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar Imagem de Referência ({referenceImages.length}/3)
                  </Button>
                  <input
                    ref={referenceImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceImageSelect}
                    className="hidden"
                  />
                  {referenceImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {referenceImages.map((ref, index) => (
                        <div
                          key={index}
                          className="relative group bg-white/5 rounded-lg px-3 py-2 text-xs text-white/70"
                        >
                          {ref.file.name}
                          <button
                            onClick={() => removeReferenceImage(index)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mode === "extension" && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => inputVideoRef.current?.click()}
                    className={cn(
                      "bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all active:scale-95 w-full",
                      isMobile ? "h-11" : "h-9",
                    )}
                  >
                    <Film className="w-4 h-4 mr-2" />
                    {inputVideo ? `Vídeo: ${inputVideo.name}` : "Selecionar Vídeo para Estender"}
                  </Button>
                  <input
                    ref={inputVideoRef}
                    type="file"
                    accept="video/*"
                    onChange={handleInputVideoSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Generate Button */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {veoApi.operation && (
                    <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>
                        {veoApi.operation.status === "processing"
                          ? `Gerando... ${veoApi.operation.progress}%`
                          : veoApi.operation.status}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={cn(
                      "rounded-lg transition-all active:scale-95",
                      isMobile ? "h-10 w-10 p-0" : "h-9 w-9 p-0",
                      showAdvanced && "bg-purple-500/20 text-purple-400",
                    )}
                    title="Opções Avançadas"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  disabled={!prompt.trim() || veoApi.isLoading || !canUseMode}
                  size="sm"
                  className={cn(
                    "rounded-xl transition-all font-medium active:scale-95",
                    isMobile ? "px-6 h-12 text-base flex-1" : "px-5 sm:px-6 h-10 sm:h-9 text-sm ml-auto",
                    prompt.trim() && !veoApi.isLoading && canUseMode
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                      : "bg-white/5 text-white/30 cursor-not-allowed",
                  )}
                  onClick={handleGenerate}
                >
                  {veoApi.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isMobile ? "Gerando..." : "Gerando"}
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Gerar Vídeo
                    </>
                  )}
                </Button>
              </div>

              {/* Error Display */}
              {veoApi.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  {veoApi.error}
                </div>
              )}

              {/* Success Display */}
              {veoApi.operation?.status === "completed" && veoApi.operation.video && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-3">
                  <div className="text-green-400 text-sm font-medium">✓ Vídeo gerado com sucesso!</div>
                  <video
                    src={veoApi.operation.video.url}
                    controls
                    className="w-full rounded-lg"
                    poster={veoApi.operation.video.thumbnailUrl}
                  />
                  <div className="flex gap-2 text-xs text-white/50">
                    <span>{veoApi.operation.video.resolution}</span>
                    <span>•</span>
                    <span>{veoApi.operation.video.aspectRatio}</span>
                    <span>•</span>
                    <span>{veoApi.operation.video.duration}s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </BeamsBackground>
  )
}
