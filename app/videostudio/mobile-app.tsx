"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Video,
  Loader2,
  PlayCircle,
  Clock,
  Image as ImageIcon,
  Film,
  Settings,
  Sparkles,
  ChevronDown,
  Zap,
} from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { VideoModal } from "@/components/ui/video-modal"
import { useVeoApi, VEO_MODELS, type VeoModel, type VeoMode } from "@/hooks/useVeoApi"

/**
 * Mobile iOS App Version - Premium Ultra Luxury Design
 * Versão otimizada para iOS com design super premium e intuitivo
 */
export default function VideoStudioMobileApp() {
  const veoApi = useVeoApi()

  // Form state
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<VeoModel>("veo-3.0")
  const [mode, setMode] = useState<VeoMode>("text-to-video")
  const [resolution, setResolution] = useState<"720p" | "1080p">("720p")
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9")
  const [duration, setDuration] = useState<4 | 5 | 6 | 8>(7)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      await veoApi.generateVideo({
        model: selectedModel,
        mode,
        prompt,
        negativePrompt: negativePrompt || undefined,
        resolution,
        aspectRatio,
        durationSeconds: duration,
        personGeneration: "allow_all",
        numberOfVideos: 1,
      })
    } catch (error) {
      console.error("Error generating video:", error)
    }
  }

  const modelInfo = VEO_MODELS[selectedModel]
  const canUseMode = modelInfo.features.includes(mode as any)

  return (
    <div className="min-h-screen bg-black flex flex-col safe-area">
      <BeamsBackground>
        {/* Ultra Premium Header */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-3xl border-b border-white/10 px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">Video Studio</h1>
                <p className="text-white/40 text-[10px]">Veo 3.0 Premium</p>
              </div>
            </div>
            {veoApi.isLoading && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">{veoApi.operation?.progress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 safe-area-bottom">
          {/* Gradient Cards Container */}
          <div className="space-y-4 max-w-md mx-auto">
            {/* Prompt Input - Premium Card */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl overflow-hidden">
              {/* Decorative Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-transparent" />

              <label className="block text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Descrição do Vídeo
                </span>
              </label>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva seu vídeo cinematográfico..."
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm",
                  "min-h-[120px] p-3.5"
                )}
                maxLength={1024}
              />

              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-white/40">Prompt Cinematográfico</span>
                <span className="text-[10px] text-white/30 font-medium">{prompt.length}/1024</span>
              </div>
            </div>

            {/* Mode & Model Selection */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl">
              <label className="block text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  Modo & Modelo
                </span>
              </label>

              <div className="space-y-3">
                {/* Mode */}
                <div>
                  <p className="text-white/60 text-xs font-medium mb-2">Tipo de Geração</p>
                  <Select value={mode} onValueChange={(v) => setMode(v as VeoMode)}>
                    <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-10 px-3 text-sm focus:ring-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="text-to-video">📝 Texto → Vídeo</SelectItem>
                      <SelectItem value="image-to-video">🖼️ Imagem → Vídeo</SelectItem>
                      <SelectItem value="reference-images">🎨 Referências</SelectItem>
                      <SelectItem value="interpolation">➡️ Interpolação</SelectItem>
                      <SelectItem value="extension">📹 Extensão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Model */}
                <div>
                  <p className="text-white/60 text-xs font-medium mb-2">Modelo de IA</p>
                  <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as VeoModel)}>
                    <SelectTrigger
                      className={cn(
                        "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-10 px-3 text-sm focus:ring-purple-500/50",
                        !canUseMode && "opacity-40"
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="veo-3.0">⭐ Veo 3.0 (Recomendado)</SelectItem>
                      <SelectItem value="veo-3.0-fast">⚡ Veo 3.0 Fast</SelectItem>
                      <SelectItem value="veo-2.0">🎬 Veo 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-white/70 text-xs font-semibold uppercase tracking-widest hover:text-white/90 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Settings className="w-3 h-3 text-cyan-400" />
                  Configurações Avançadas
                </span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform",
                    showAdvanced && "rotate-180"
                  )}
                />
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
                  {/* Aspect Ratio */}
                  <div>
                    <p className="text-white/60 text-xs font-medium mb-2">Proporção</p>
                    <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                      <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-10 px-3 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="16:9">📺 16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">📱 9:16 (Portrait)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resolution */}
                  <div>
                    <p className="text-white/60 text-xs font-medium mb-2">Resolução</p>
                    <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                      <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl h-10 px-3 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="720p">🔷 720p HD</SelectItem>
                        <SelectItem value="1080p">🔶 1080p Full HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-white/60 text-xs font-medium mb-2">Duração</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[4, 5, 6, 8].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDuration(d as 4 | 5 | 6 | 8)}
                          className={cn(
                            "h-9 rounded-lg text-xs font-semibold transition-all",
                            duration === d
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                              : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                          )}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div>
                    <p className="text-white/60 text-xs font-medium mb-2">O que Evitar (Negativo)</p>
                    <Textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="cartoon, drawing, low quality..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none focus:ring-orange-500/50 text-xs p-2.5 min-h-[80px]"
                      maxLength={512}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {veoApi.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3">
                <p className="text-red-400 text-xs font-medium">{veoApi.error}</p>
              </div>
            )}

            {/* Generate Button - Main CTA */}
            <Button
              disabled={!prompt.trim() || veoApi.isLoading || !canUseMode}
              onClick={handleGenerate}
              size="lg"
              className={cn(
                "w-full h-14 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-2xl",
                prompt.trim() && !veoApi.isLoading && canUseMode
                  ? "bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 text-white shadow-purple-500/30"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              )}
            >
              {veoApi.isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando... {veoApi.operation?.progress}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gerar Vídeo com Veo 3.0
                </span>
              )}
            </Button>

            {/* Success State */}
            {veoApi.operation?.status === "completed" && veoApi.operation.video && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-full group"
              >
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-4 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <PlayCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold uppercase">Vídeo Pronto!</span>
                  </div>
                  {veoApi.operation.video.thumbnailUrl && (
                    <img
                      src={veoApi.operation.video.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  )}
                  <div className="mt-2 flex gap-2 text-[10px] text-white/40 justify-between">
                    <span>{veoApi.operation.video.resolution}</span>
                    <span>{veoApi.operation.video.aspectRatio}</span>
                    <span>{veoApi.operation.video.duration}s</span>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Video Modal */}
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
    </div>
  )
}
