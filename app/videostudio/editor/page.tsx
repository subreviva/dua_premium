"use client"

import { useState, useRef } from "react"
import { Wand2, Upload, Video, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, Play, Pause, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AppSidebar } from "@/components/app-sidebar"
import { motion, AnimatePresence } from "framer-motion"

export default function VideoEditorPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"1280:720" | "720:1280" | "1024:1024">("1280:720")
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isPlayingEdited, setIsPlayingEdited] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalVideoRef = useRef<HTMLVideoElement>(null)
  const editedVideoRef = useRef<HTMLVideoElement>(null)

  // Exemplos de prompts
  const examplePrompts = [
    "Mude o ângulo da câmera para vista aérea",
    "Adicione um pôr do sol dourado ao fundo",
    "Transforme o cenário em uma cidade futurista",
    "Remova as pessoas do vídeo",
    "Mude a iluminação para ambiente noturno",
    "Adicione neve caindo suavemente",
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido')
      return
    }

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      setError('O vídeo deve ter no máximo 100MB')
      return
    }

    setVideoFile(file)
    setError(null)

    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }

  const handleTransform = async () => {
    if (!videoFile || !promptText.trim()) return

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

      // 2. Iniciar transformação
      const transformResponse = await fetch('/api/runway/video-to-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUri,
          promptText: promptText.trim(),
          model: 'gen4_aleph',
          ratio: aspectRatio,
        }),
      })

      if (!transformResponse.ok) {
        throw new Error('Erro ao iniciar transformação')
      }

      const { taskId: newTaskId } = await transformResponse.json()
      setTaskId(newTaskId)
      setProgress(60)

      // 3. Polling do status
      pollTaskStatus(newTaskId)
    } catch (err) {
      console.error('Erro ao transformar vídeo:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const pollTaskStatus = async (id: string) => {
    const maxAttempts = 120 // 10 minutos
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

        setProgress(60 + (attempts / maxAttempts) * 35)

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000)
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

  const handleReset = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setPromptText("")
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

  const togglePlayEdited = () => {
    if (editedVideoRef.current) {
      if (isPlayingEdited) {
        editedVideoRef.current.pause()
      } else {
        editedVideoRef.current.play()
      }
      setIsPlayingEdited(!isPlayingEdited)
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Editor Criativo</h1>
                <p className="text-sm text-zinc-400">Transforme vídeos com comandos de texto</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Hero Example Video */}
          {!videoPreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400 font-medium">IA de Edição Avançada</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">
                  Edite Vídeos com{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Inteligência Artificial
                  </span>
                </h2>
                <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                  Transforme, edite e manipule vídeos usando apenas comandos de texto. 
                  Mude ângulos, adicione elementos, altere cenários e muito mais.
                </p>
              </div>

              {/* Example Video */}
              <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
                <div className="aspect-video relative bg-black">
                  <video
                    src="https://d3phaj0sisr2ct.cloudfront.net/app/aleph/aleph-empty-dash-web.webm"
                    className="w-full h-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">Exemplo de Transformação</h3>
                  <p className="text-sm text-zinc-400">
                    Veja como a IA pode transformar completamente um vídeo mantendo a fluidez e qualidade
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upload Area */}
          {!videoPreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                
                <div className="relative border-2 border-dashed border-white/20 rounded-3xl p-16 text-center hover:border-purple-500/50 transition-all bg-black/40 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Faça upload do seu vídeo
                  </h3>
                  <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                    Adicione um vídeo e descreva como você quer transformá-lo
                  </p>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <Video className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-400 font-medium">MP4, MOV, WebM</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-pink-400 font-medium">Máx 100MB</span>
                    </div>
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

          {/* Editor Interface */}
          {videoPreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Video Preview */}
              <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-white/10">
                <div className="aspect-video relative bg-black">
                  <video
                    ref={originalVideoRef}
                    src={videoPreview}
                    className="w-full h-full object-contain"
                    controls
                  />
                </div>
              </div>

              {/* Prompt Input */}
              <div className="rounded-3xl bg-zinc-900 border border-white/10 p-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  ✨ Descreva a transformação desejada
                </label>
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ex: Mude o ângulo da câmera para vista aérea e adicione um pôr do sol dourado..."
                  className="min-h-[120px] bg-black/50 border-white/10 text-white placeholder:text-zinc-500 resize-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  disabled={isUploading || isProcessing}
                />
                
                {/* Example Prompts */}
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 mb-2">Exemplos rápidos:</p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPromptText(example)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
                        disabled={isUploading || isProcessing}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
                <label className="block text-sm font-semibold text-white mb-3">Proporção</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '1280:720', label: '16:9 Horizontal', icon: '📱' },
                    { value: '720:1280', label: '9:16 Vertical', icon: '📲' },
                    { value: '1024:1024', label: '1:1 Quadrado', icon: '⬜' },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className={`p-3 rounded-xl border transition-all ${
                        aspectRatio === ratio.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                      disabled={isUploading || isProcessing}
                    >
                      <div className="text-2xl mb-1">{ratio.icon}</div>
                      <div className="text-xs text-white font-medium">{ratio.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Erro</p>
                    <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Progress */}
              {(isUploading || isProcessing) && (
                <div className="rounded-2xl bg-zinc-900 border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">
                      {isUploading ? 'Fazendo upload...' : 'Transformando vídeo...'}
                    </span>
                    <span className="text-sm text-zinc-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    {isProcessing && "Isso pode levar alguns minutos. A IA está trabalhando na sua transformação..."}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleTransform}
                  disabled={!promptText.trim() || isUploading || isProcessing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-14 rounded-xl shadow-lg shadow-purple-500/20 text-base"
                >
                  {isUploading || isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Transformar Vídeo
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={isUploading || isProcessing}
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white h-14 px-8 rounded-xl"
                >
                  <RotateCw className="w-5 h-5 mr-2" />
                  Recomeçar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Result - Comparison */}
          {isComplete && resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Success Message */}
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-green-400 font-semibold text-lg">Transformação concluída!</p>
                  <p className="text-green-300/80 text-sm">Seu vídeo foi editado com sucesso pela IA</p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Novo Vídeo
                </Button>
              </div>

              {/* Comparison Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original */}
                <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Original</h3>
                        <p className="text-xs text-zinc-400">Vídeo enviado</p>
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

                {/* Transformed */}
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 shadow-xl shadow-purple-500/10">
                  <div className="p-4 border-b border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Transformado</h3>
                        <p className="text-xs text-purple-400">Editado por IA</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-purple-500/20 text-xs text-purple-400 font-medium">
                        Depois ✨
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video relative bg-black">
                    <video
                      ref={editedVideoRef}
                      src={resultUrl}
                      className="w-full h-full object-contain"
                      loop
                      onPlay={() => setIsPlayingEdited(true)}
                      onPause={() => setIsPlayingEdited(false)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={togglePlayEdited}
                        className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all"
                      >
                        {isPlayingEdited ? (
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
                        a.download = 'video-transformado.mp4'
                        a.click()
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-11 rounded-xl"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Baixar Vídeo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Prompt Used */}
              <div className="rounded-2xl bg-zinc-900 border border-white/10 p-6">
                <h3 className="text-sm font-semibold text-white mb-2">Prompt Utilizado</h3>
                <p className="text-zinc-400">{promptText}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
