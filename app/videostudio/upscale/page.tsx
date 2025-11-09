"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUpCircle, Upload, Video, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { motion, AnimatePresence } from "framer-motion"

export default function VideoUpscalePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isPlayingUpscaled, setIsPlayingUpscaled] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalVideoRef = useRef<HTMLVideoElement>(null)
  const upscaledVideoRef = useRef<HTMLVideoElement>(null)

  // Exemplo de vídeos
  const exampleVideos = [
    {
      id: 1,
      original: "https://d3phaj0sisr2ct.cloudfront.net/app/mira/empty-states/upscale-video-example-1-10-12-720p.mp4",
      upscaled: "https://d3phaj0sisr2ct.cloudfront.net/app/mira/empty-states/upscale-video-example-1-10-12.mp4",
      title: "Exemplo 1",
      description: "720p → 4K"
    }
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido')
      return
    }

    // Validar tamanho (máximo 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      setError('O vídeo deve ter no máximo 100MB')
      return
    }

    setVideoFile(file)
    setError(null)

    // Criar preview
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }

  const handleUpscale = async () => {
    if (!videoFile) return

    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      // 1. Upload do vídeo
      const formData = new FormData()
      formData.append('video', videoFile)

      setProgress(20)

      const uploadResponse = await fetch('/api/runway/upload-video', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload do vídeo')
      }

      const { videoUri } = await uploadResponse.json()
      setProgress(40)
      setIsUploading(false)
      setIsProcessing(true)

      // 2. Iniciar upscale
      const upscaleResponse = await fetch('/api/runway/video-upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUri,
          model: 'upscale_v1',
        }),
      })

      if (!upscaleResponse.ok) {
        throw new Error('Erro ao iniciar upscale')
      }

      const { taskId: newTaskId } = await upscaleResponse.json()
      setTaskId(newTaskId)
      setProgress(60)

      // 3. Polling do status
      pollTaskStatus(newTaskId)
    } catch (err) {
      console.error('Erro ao fazer upscale:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const pollTaskStatus = async (id: string) => {
    const maxAttempts = 60 // 5 minutos (60 tentativas × 5s)
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/runway/task-status?taskId=${id}`)
        
        if (!response.ok) {
          throw new Error('Erro ao verificar status')
        }

        const data = await response.json()

        if (data.status === 'SUCCEEDED') {
          setResultUrl(data.output)
          setIsProcessing(false)
          setIsComplete(true)
          setProgress(100)
          return
        }

        if (data.status === 'FAILED') {
          throw new Error('Falha no processamento do vídeo')
        }

        // Atualizar progresso
        setProgress(60 + (attempts / maxAttempts) * 35)

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000) // 5 segundos
        } else {
          throw new Error('Tempo limite excedido')
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err)
        setError(err instanceof Error ? err.message : 'Erro ao verificar status')
        setIsProcessing(false)
      }
    }

    checkStatus()
  }

  const togglePlayOriginal = () => {
    if (originalVideoRef.current) {
      if (isPlayingOriginal) {
        originalVideoRef.current.pause()
      } else {
        originalVideoRef.current.play()
      }
      setIsPlayingOriginal(!isPlayingOriginal)
    }
  }

  const togglePlayUpscaled = () => {
    if (upscaledVideoRef.current) {
      if (isPlayingUpscaled) {
        upscaledVideoRef.current.pause()
      } else {
        upscaledVideoRef.current.play()
      }
      setIsPlayingUpscaled(!isPlayingUpscaled)
    }
  }

  const handleReset = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setIsUploading(false)
    setIsProcessing(false)
    setIsComplete(false)
    setError(null)
    setProgress(0)
    setTaskId(null)
    setResultUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <ArrowUpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Upscale 4K</h1>
                <p className="text-sm text-zinc-400">Aumente a resolução dos seus vídeos até 4K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Upload Area */}
          {!videoPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                
                <div className="relative border-2 border-dashed border-white/20 rounded-3xl p-16 text-center hover:border-blue-500/50 transition-all bg-black/40 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Arraste seu vídeo ou clique para fazer upload
                  </h3>
                  <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                    Suporta MP4, MOV, AVI. Máximo 100MB e 40 segundos.
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400 font-medium">Resolução máxima: 4K (3840×2160)</span>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          )}

          {/* Preview & Processing */}
          {videoPreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-white/10">
                <div className="aspect-video relative bg-black flex items-center justify-center">
                  <video
                    ref={originalVideoRef}
                    src={videoPreview}
                    className="w-full h-full object-contain"
                    controls
                  />
                </div>
                
                <div className="p-8">
                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium">Erro</p>
                        <p className="text-red-300/80 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {(isUploading || isProcessing) && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">
                          {isUploading ? 'Fazendo upload...' : 'Processando upscale...'}
                        </span>
                        <span className="text-sm text-zinc-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      
                      <p className="text-xs text-zinc-500 mt-2">
                        Isso pode levar alguns minutos dependendo do tamanho do vídeo
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpscale}
                      disabled={isUploading || isProcessing}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold h-12 rounded-xl shadow-lg shadow-blue-500/20"
                    >
                      {isUploading || isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <ArrowUpCircle className="w-5 h-5 mr-2" />
                          Upscale para 4K
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      disabled={isUploading || isProcessing}
                      className="border-white/20 bg-white/5 hover:bg-white/10 text-white h-12 px-6 rounded-xl"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Result - Comparison */}
          {isComplete && resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="mb-6 p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-green-400 font-semibold text-lg">Upscale concluído!</p>
                  <p className="text-green-300/80 text-sm">Seu vídeo foi processado com sucesso em 4K</p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400"
                >
                  Novo Vídeo
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Original */}
                <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Original</h3>
                        <p className="text-xs text-zinc-400">720p</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400">
                        Antes
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video relative bg-black">
                    <video
                      ref={originalVideoRef}
                      src={videoPreview || ''}
                      className="w-full h-full object-contain"
                      loop
                      onPlay={() => setIsPlayingOriginal(true)}
                      onPause={() => setIsPlayingOriginal(false)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={togglePlayOriginal}
                        className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all"
                      >
                        {isPlayingOriginal ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upscaled */}
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 shadow-xl shadow-blue-500/10">
                  <div className="p-4 border-b border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Upscaled</h3>
                        <p className="text-xs text-blue-400">4K (3840×2160)</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-blue-500/20 text-xs text-blue-400 font-medium">
                        4K ✨
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video relative bg-black">
                    <video
                      ref={upscaledVideoRef}
                      src={resultUrl}
                      className="w-full h-full object-contain"
                      loop
                      onPlay={() => setIsPlayingUpscaled(true)}
                      onPause={() => setIsPlayingUpscaled(false)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={togglePlayUpscaled}
                        className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all"
                      >
                        {isPlayingUpscaled ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <Button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = resultUrl
                        a.download = 'upscaled-4k-video.mp4'
                        a.click()
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold h-11 rounded-xl"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download 4K
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Examples Section */}
          {!videoPreview && (
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-3">Veja a Diferença</h2>
                <p className="text-zinc-400">Compare a qualidade antes e depois do upscale</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Example Original */}
                <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Original 720p</h3>
                      <span className="text-xs text-zinc-400">Antes</span>
                    </div>
                  </div>
                  <div className="aspect-video relative bg-black">
                    <video
                      src={exampleVideos[0].original}
                      className="w-full h-full object-contain"
                      controls
                      loop
                    />
                  </div>
                </div>

                {/* Example Upscaled */}
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                  <div className="p-4 border-b border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Upscaled 4K</h3>
                      <span className="text-xs text-blue-400 font-medium">Depois ✨</span>
                    </div>
                  </div>
                  <div className="aspect-video relative bg-black">
                    <video
                      src={exampleVideos[0].upscaled}
                      className="w-full h-full object-contain"
                      controls
                      loop
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
