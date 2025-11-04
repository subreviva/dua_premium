"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Video, Loader2, PlayCircle, Clock, Image as ImageIcon, Film, Settings, Sparkles } from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { VideoModal } from "@/components/ui/video-modal"
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
  const [duration, setDuration] = useState<4 | 5 | 6 | 8>(8)
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [personGeneration, setPersonGeneration] = useState<"allow_all" | "allow_adult" | "dont_allow">("allow_all")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

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
        seed,
        numberOfVideos: 1,
      })
    } catch (error) {
      console.error("Error generating video:", error)
    }
  }

  const handleFirstFrameSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFirstFrameImage(e.target.files[0])
  }

  const handleLastFrameSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setLastFrameImage(e.target.files[0])
  }

  const handleInputVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setInputVideo(e.target.files[0])
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

      <div className={cn("relative z-10 w-full", isMobile ? "px-4 pt-24 pb-20" : "px-6 pt-28 pb-16")}>
        {/* Header - Ultra Elegante */}
        <div className={cn("text-center", isMobile ? "mb-6" : "mb-10")}>
          <h1 className={cn("font-bold text-white mb-2", isMobile ? "text-2xl" : "text-3xl sm:text-4xl")}>
            Video Studio
          </h1>
          <p className={cn("text-white/50", isMobile ? "text-xs" : "text-sm")}>
            Geração cinematográfica com Veo 3.1
          </p>
        </div>

        {/* Main Card - Compacto e Elegante */}
        <main className="w-full max-w-4xl mx-auto">
          <div
            className={cn(
              "bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden",
              isMobile ? "p-4" : "p-5 sm:p-6",
            )}
          >
            {/* Prompt - Compacto */}
            <div className="mb-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva seu vídeo cinematográfico..."
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none focus:ring-1 focus:ring-purple-500/50 transition-all",
                  isMobile ? "min-h-[100px] text-sm p-3" : "min-h-[80px] text-sm p-3",
                )}
                maxLength={1024}
              />
              <div className="flex justify-end mt-1 px-1">
                <span className="text-[10px] text-white/30">{prompt.length}/1024</span>
              </div>
            </div>

            {/* Negative Prompt - Só quando Advanced */}
            {showAdvanced && (
              <div className="mb-3 space-y-3">
                <div>
                  <Textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="O que evitar (cartoon, drawing, low quality...)"
                    className={cn(
                      "bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none focus:ring-1 focus:ring-orange-500/50 transition-all",
                      isMobile ? "min-h-[60px] text-sm p-3" : "min-h-[50px] text-xs p-3",
                    )}
                    maxLength={512}
                  />
                  <div className="flex justify-between items-center mt-1 px-1">
                    <span className="text-[10px] text-orange-400/50">Negative Prompt</span>
                    <span className="text-[10px] text-white/30">{negativePrompt.length}/512</span>
                  </div>
                </div>

                {/* Google Veo 3 New Parameters */}
                <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block px-1">Seed (Determinismo)</label>
                    <input
                      type="number"
                      value={seed || ""}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Ex: 42"
                      className={cn(
                        "w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl focus:ring-1 focus:ring-purple-500/50 transition-all",
                        isMobile ? "h-11 text-sm px-3" : "h-9 text-xs px-3"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block px-1">Geração de Pessoas</label>
                    <Select value={personGeneration} onValueChange={(v) => setPersonGeneration(v as typeof personGeneration)}>
                      <SelectTrigger className={cn(
                        "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl",
                        isMobile ? "h-11 px-3 text-sm" : "h-9 px-3 text-xs"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="allow_all">Permitir Todos</SelectItem>
                        <SelectItem value="allow_adult">Apenas Adultos</SelectItem>
                        <SelectItem value="dont_allow">Não Permitir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Controls - Ultra Compacto */}
            <div className="space-y-3">
              {/* Row 1: Mode & Model - Desktop horizontal, Mobile 2 col grid */}
              {isMobile ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl px-3 h-11 flex items-center justify-center text-xs font-medium">
                    <Video className="w-3.5 h-3.5 mr-1.5" />
                    <span>Vídeo</span>
                  </div>

                  <Select value={mode} onValueChange={(v) => setMode(v as VeoMode)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-3 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="text-to-video">Texto → Vídeo</SelectItem>
                      <SelectItem value="image-to-video">Imagem → Vídeo</SelectItem>
                      <SelectItem value="reference-images">Refs</SelectItem>
                      <SelectItem value="interpolation">Interpolação</SelectItem>
                      <SelectItem value="extension">Extensão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg px-2.5 h-9 flex items-center text-xs font-medium flex-shrink-0">
                    <Video className="w-3.5 h-3.5 mr-1.5" />
                    <span>Vídeo</span>
                  </div>

                  <Select value={mode} onValueChange={(v) => setMode(v as VeoMode)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-2.5 text-xs flex-shrink-0 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="text-to-video">Texto → Vídeo</SelectItem>
                      <SelectItem value="image-to-video">Imagem → Vídeo</SelectItem>
                      <SelectItem value="reference-images">Refs</SelectItem>
                      <SelectItem value="interpolation">Interpolação</SelectItem>
                      <SelectItem value="extension">Extensão</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as VeoModel)}>
                    <SelectTrigger
                      className={cn(
                        "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-2.5 text-xs flex-shrink-0 w-[130px]",
                        !canUseMode && "opacity-40",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="veo-3.1-preview">Veo 3.1</SelectItem>
                      <SelectItem value="veo-3.1-fast">Veo 3.1 Fast</SelectItem>
                      <SelectItem value="veo-3.0">Veo 3.0</SelectItem>
                      <SelectItem value="veo-3.0-fast">Veo 3.0 Fast</SelectItem>
                      <SelectItem value="veo-2.0">Veo 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Row 2: Model (mobile only) */}
              {isMobile && (
                <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as VeoModel)}>
                  <SelectTrigger
                    className={cn(
                      "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-3 text-xs w-full",
                      !canUseMode && "opacity-40",
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
              )}

              {/* Row 3: Settings - Desktop horizontal, Mobile 3 col grid */}
              {isMobile ? (
                <div className="grid grid-cols-3 gap-2">
                  <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-2 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="16:9">16:9</SelectItem>
                      <SelectItem value="9:16">9:16</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-2 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v) as 4 | 5 | 6 | 8)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-11 px-2 text-xs">
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
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-2.5 text-xs flex-shrink-0 w-[75px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="16:9">16:9</SelectItem>
                      <SelectItem value="9:16">9:16</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-2.5 text-xs flex-shrink-0 w-[85px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v) as 4 | 5 | 6 | 8)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 px-2.5 text-xs flex-shrink-0 w-[65px]">
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

              {/* File Uploads - Baseado no modo */}
              {(mode === "image-to-video" || mode === "interpolation") && (
                <div className={cn("flex gap-2", isMobile ? "flex-col" : "flex-row")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => firstFrameRef.current?.click()}
                    className={cn(
                      "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all active:scale-95",
                      isMobile ? "h-11 text-xs" : "h-9 px-3 text-xs",
                      firstFrameImage && "border-purple-500/30 bg-purple-500/10 text-purple-400",
                    )}
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                    {firstFrameImage ? "Primeiro Frame" : "Primeiro Frame"}
                  </Button>
                  <input ref={firstFrameRef} type="file" accept="image/*" onChange={handleFirstFrameSelect} className="hidden" />

                  {mode === "interpolation" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => lastFrameRef.current?.click()}
                        className={cn(
                          "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all active:scale-95",
                          isMobile ? "h-11 text-xs" : "h-9 px-3 text-xs",
                          lastFrameImage && "border-purple-500/30 bg-purple-500/10 text-purple-400",
                        )}
                      >
                        <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                        {lastFrameImage ? "Último Frame" : "Último Frame"}
                      </Button>
                      <input ref={lastFrameRef} type="file" accept="image/*" onChange={handleLastFrameSelect} className="hidden" />
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
                      "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all active:scale-95 w-full",
                      isMobile ? "h-11 text-xs" : "h-9 text-xs",
                    )}
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                    Refs ({referenceImages.length}/3)
                  </Button>
                  <input ref={referenceImageRef} type="file" accept="image/*" onChange={handleReferenceImageSelect} className="hidden" />
                  {referenceImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {referenceImages.map((ref, index) => (
                        <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-2.5 py-1.5 text-[10px] text-purple-400 flex items-center gap-1.5">
                          <span className="truncate max-w-[80px]">{ref.file.name}</span>
                          <button onClick={() => removeReferenceImage(index)} className="text-purple-400 hover:text-purple-300">
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
                      "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all active:scale-95 w-full",
                      isMobile ? "h-11 text-xs" : "h-9 text-xs",
                      inputVideo && "border-purple-500/30 bg-purple-500/10 text-purple-400",
                    )}
                  >
                    <Film className="w-3.5 h-3.5 mr-1.5" />
                    {inputVideo ? `${inputVideo.name}` : "Selecionar Vídeo"}
                  </Button>
                  <input ref={inputVideoRef} type="file" accept="video/*" onChange={handleInputVideoSelect} className="hidden" />
                </div>
              )}

              {/* Generate Button - Premium */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {veoApi.operation && (
                    <div className="flex items-center gap-1.5 text-white/60 text-[10px]">
                      <Clock className="w-3 h-3 animate-pulse" />
                      <span>
                        {veoApi.operation.status === "processing"
                          ? `${veoApi.operation.progress}%`
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
                    title="Avançado"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <Button
                  disabled={!prompt.trim() || veoApi.isLoading || !canUseMode}
                  size="sm"
                  className={cn(
                    "rounded-xl transition-all font-medium active:scale-95",
                    isMobile ? "px-5 h-11 text-sm flex-1" : "px-4 h-9 text-xs ml-auto",
                    prompt.trim() && !veoApi.isLoading && canUseMode
                      ? "bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-white/5 text-white/30 cursor-not-allowed",
                  )}
                  onClick={handleGenerate}
                >
                  {veoApi.isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      {isMobile ? "Gerando..." : "..."}
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                      Gerar
                    </>
                  )}
                </Button>
              </div>

              {/* Error */}
              {veoApi.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-red-400 text-xs">
                  {veoApi.error}
                </div>
              )}

              {/* Success - Agora com Modal iOS Premium */}
              {veoApi.operation?.status === "completed" && veoApi.operation.video && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="w-full group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Vídeo pronto! Toque para visualizar</span>
                      </div>
                      <PlayCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="relative rounded-lg overflow-hidden">
                      {veoApi.operation.video.thumbnailUrl ? (
                        <img 
                          src={veoApi.operation.video.thumbnailUrl} 
                          alt="Video thumbnail"
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-black/40 flex items-center justify-center">
                          <Film className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="flex gap-2 text-[10px] text-white/40 mt-2">
                      <span>{veoApi.operation.video.resolution}</span>
                      <span>•</span>
                      <span>{veoApi.operation.video.aspectRatio}</span>
                      <span>•</span>
                      <span>{veoApi.operation.video.duration}s</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Video Modal iOS Premium */}
      {veoApi.operation?.video && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          video={{
            url: veoApi.operation.video.url,
            thumbnailUrl: veoApi.operation.video.thumbnailUrl,
            prompt: prompt,
            resolution: veoApi.operation.video.resolution,
            aspectRatio: veoApi.operation.video.aspectRatio,
            duration: veoApi.operation.video.duration,
            model: selectedModel,
            settings: {
              mode: mode,
              negativePrompt: negativePrompt || undefined,
            },
          }}
        />
      )}
    </BeamsBackground>
  )
}
