"use client"

import { useState, useRef } from "react"
import { ImageIcon, Upload, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, Play, Pause, Film, RotateCw, X } from "lucide-react"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { VideoStudioNavbar } from "@/components/video-studio-navbar"
import { motion, AnimatePresence } from "framer-motion"

export default function ImageToVideo() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [duration, setDuration] = useState<2|3|4|5|6|7|8|9|10>(5)
  const [aspectRatio, setAspectRatio] = useState<"1280:720"|"720:1280"|"1104:832"|"832:1104"|"960:960"|"1584:672">("1280:720")
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isPlayingResult, setIsPlayingResult] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)

  const examplePrompts = [
    "Câmera se movendo suavemente para frente",
    "Zoom lento revelando detalhes",
    "Movimento panorâmico da esquerda para direita",
    "Efeito de parallax suave",
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Imagem muito grande (máximo 20MB)')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!imageFile) return

    setError(null)
    setIsUploading(true)
    setProgress(0)

    try {
      // Converter imagem para base64 ou fazer upload primeiro
      setProgress(10)
      
      const reader = new FileReader()
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      setProgress(20)

      // Chamar API com JSON (não FormData)
      const response = await fetch('/api/runway/image-to-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptImage: imageBase64, // Data URI ou HTTPS URL
          promptText: promptText.trim() || undefined,
          model: 'gen4_turbo', // ou gen3a_turbo
          duration,
          ratio: aspectRatio,
          contentModeration: {
            publicFigureThreshold: 'auto'
          }
        }),
      })

      setProgress(40)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar imagem')
      }

      const data = await response.json()
      
      if (!data.success || !data.taskId) {
        throw new Error('Resposta inválida da API')
      }
      
      setIsUploading(false)
      setIsProcessing(true)
      setProgress(60)

      await pollTaskStatus(data.taskId)
    } catch (err) {
      console.error('Error generating video:', err)
      setError(err instanceof Error ? err.message : 'Erro ao processar')
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const pollTaskStatus = async (id: string) => {
    const maxAttempts = 120
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/runway/task-status?taskId=${id}`)
        if (!response.ok) throw new Error('Erro ao verificar status')

        const data = await response.json()

        if (data.status === 'SUCCEEDED') {
          setResultUrl(data.output)
          setIsProcessing(false)
          setIsComplete(true)
          setProgress(100)
          return
        }

        if (data.status === 'FAILED') throw new Error('Falha no processamento')

        setProgress(60 + (attempts / maxAttempts) * 35)
        attempts++
        
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000)
        } else {
          throw new Error('Tempo limite excedido')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao verificar status')
        setIsProcessing(false)
      }
    }

    checkStatus()
  }

  const handleReset = () => {
    setImageFile(null)
    setImagePreview(null)
    setPromptText("")
    setIsUploading(false)
    setIsProcessing(false)
    setIsComplete(false)
    setError(null)
    setProgress(0)
    setResultUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <VideoStudioNavbar />
      <CinemaSidebar />

      <div className="flex-1 overflow-y-auto pt-14">
        {/* Header Premium */}
        <div className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-14 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                  <Film className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-light text-white tracking-tight">Image to Video</h1>
                  <p className="text-xs sm:text-sm text-white/40 font-light">Gen-4 Turbo</p>
                </div>
              </div>
              {imagePreview && !isComplete && (
                <button
                  onClick={handleReset}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  disabled={isUploading || isProcessing}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          
          {/* Upload Area */}
          {!imagePreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[calc(100vh-12rem)] flex items-center justify-center"
            >
              <div className="w-full max-w-2xl">
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extralight text-white mb-4 sm:mb-6 tracking-tight">
                    Transform Images
                    <br />
                    <span className="bg-gradient-to-r from-white/90 to-white/50 bg-clip-text text-transparent">
                      Into Motion
                    </span>
                  </h2>
                  <p className="text-sm sm:text-base text-white/40 font-light max-w-lg mx-auto">
                    AI-powered video generation with cinematic quality
                  </p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                  
                  <div className="relative border border-white/10 rounded-3xl p-12 sm:p-16 lg:p-20 text-center hover:border-white/20 transition-all duration-500 bg-white/[0.02] backdrop-blur-xl">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:bg-white/10 transition-all duration-300">
                      <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white/60 group-hover:text-white/80 transition-colors" />
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-light text-white mb-3 sm:mb-4">
                      Select Image
                    </h3>
                    <p className="text-sm sm:text-base text-white/40 mb-6 sm:mb-8 font-light">
                      JPG, PNG, WebP up to 20MB
                    </p>
                    
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center text-xs sm:text-sm">
                      <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 font-light">
                        <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                        High Resolution
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 font-light">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                        AI Enhanced
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </motion.div>
          )}

          {/* Generation Interface */}
          {imagePreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Image Preview */}
              <div className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-xl">
                <div className="aspect-video relative bg-black flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                
                {/* Duration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-light text-white/60">Duration</label>
                    <span className="text-2xl font-extralight text-white">{duration}s</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value) as any)}
                    className="w-full h-px bg-white/10 appearance-none cursor-pointer 
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:border-2 
                      [&::-webkit-slider-thumb]:border-white/20
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:shadow-black/50
                      [&::-moz-range-thumb]:w-4 
                      [&::-moz-range-thumb]:h-4 
                      [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:bg-white 
                      [&::-moz-range-thumb]:border-2 
                      [&::-moz-range-thumb]:border-white/20
                      [&::-moz-range-thumb]:shadow-lg
                      [&::-moz-range-thumb]:shadow-black/50"
                    disabled={isUploading || isProcessing}
                  />
                  <div className="flex justify-between text-xs text-white/30 font-light">
                    <span>2s</span>
                    <span>10s</span>
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-4">
                  <label className="text-sm font-light text-white/60">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { value: '1280:720', label: '16:9' },
                      { value: '720:1280', label: '9:16' },
                      { value: '1104:832', label: '4:3' },
                      { value: '832:1104', label: '3:4' },
                      { value: '960:960', label: '1:1' },
                      { value: '1584:672', label: '21:9' },
                    ].map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value as any)}
                        className={`px-3 py-3 sm:px-4 sm:py-4 rounded-xl border transition-all duration-300 ${
                          aspectRatio === ratio.value
                            ? 'border-white/40 bg-white/10 text-white'
                            : 'border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:bg-white/5 hover:text-white/60'
                        }`}
                        disabled={isUploading || isProcessing}
                      >
                        <div className="text-xs sm:text-sm font-light">{ratio.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-4">
                <label className="text-sm font-light text-white/60">Motion Description (Optional)</label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe the desired camera movement..."
                  className="w-full min-h-[120px] px-4 sm:px-6 py-3 sm:py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-white/30 transition-all duration-300 text-sm sm:text-base font-light backdrop-blur-xl"
                  disabled={isUploading || isProcessing}
                />
                
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPromptText(example)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all duration-300 font-light"
                      disabled={isUploading || isProcessing}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-light text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress */}
              <AnimatePresence>
                {(isUploading || isProcessing) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-white/60">
                        {isUploading ? 'Uploading...' : 'Generating...'}
                      </span>
                      <span className="text-sm font-light text-white/40">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-px bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white/40"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isUploading || isProcessing}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/[0.15] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-white font-light text-sm sm:text-base backdrop-blur-xl group"
                >
                  {isUploading || isProcessing ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Film className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Generate Video
                    </span>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={isUploading || isProcessing}
                  className="px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 text-white/60 hover:text-white font-light text-sm sm:text-base"
                >
                  <RotateCw className="w-5 h-5 inline mr-2" />
                  Reset
                </button>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {isComplete && resultUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Success Badge */}
              <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-400 font-light text-sm sm:text-base">Video generated successfully</p>
              </div>

              {/* Video Player */}
              <div className="relative rounded-3xl overflow-hidden bg-black border border-white/10 backdrop-blur-xl">
                <div className="aspect-video relative bg-black">
                  <video
                    ref={resultVideoRef}
                    src={resultUrl}
                    className="w-full h-full object-contain"
                    loop
                    onPlay={() => setIsPlayingResult(true)}
                    onPause={() => setIsPlayingResult(false)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button
                      onClick={() => {
                        if (resultVideoRef.current) {
                          isPlayingResult ? resultVideoRef.current.pause() : resultVideoRef.current.play()
                        }
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all duration-300 pointer-events-auto"
                    >
                      {isPlayingResult ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = resultUrl
                    a.download = 'generated-video.mp4'
                    a.click()
                  }}
                  className="flex-1 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/[0.15] transition-all duration-300 text-white font-light text-sm sm:text-base backdrop-blur-xl group"
                >
                  <Download className="w-5 h-5 inline mr-3 group-hover:translate-y-0.5 transition-transform" />
                  Download Video
                </button>
                
                <button
                  onClick={handleReset}
                  className="px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-white/60 hover:text-white font-light text-sm sm:text-base"
                >
                  <RotateCw className="w-5 h-5 inline mr-2" />
                  New Video
                </button>
              </div>

              {/* Original Preview */}
              {imagePreview && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                    <div className="p-3 sm:p-4 border-b border-white/10">
                      <h3 className="text-sm font-light text-white/60">Original Image</h3>
                    </div>
                    <div className="aspect-video relative bg-black flex items-center justify-center p-4">
                      <img src={imagePreview} alt="Original" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>

                  {promptText && (
                    <div className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl p-4 sm:p-6 flex flex-col justify-center">
                      <h3 className="text-sm font-light text-white/60 mb-3">Prompt Used</h3>
                      <p className="text-white/80 text-sm font-light leading-relaxed">{promptText}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
