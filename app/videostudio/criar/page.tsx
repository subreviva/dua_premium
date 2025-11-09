"use client"

import { useState, useRef } from "react"
import { ImageIcon, Upload, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, Play, Pause, Film, RotateCw, X, ImagePlay } from "lucide-react"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { motion, AnimatePresence } from "framer-motion"

export default function CriarVideoPage() {
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

  const exampleVideos = [
    "https://video.twimg.com/amplify_video/1958156406449651712/vid/avc1/1280x720/WwOxf6W6YxjiKYZD.mp4",
    "https://video.twimg.com/amplify_video/1951076382114545664/vid/avc1/720x1280/ceGn4mLBDKedb48L.mp4",
    "https://video.twimg.com/amplify_video/1953071976408297472/vid/avc1/1920x1080/qeSQZDkH6KcMKiIF.mp4",
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
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('promptText', promptText || '')
      formData.append('model', 'gen4_turbo')
      formData.append('duration', duration.toString())
      formData.append('ratio', aspectRatio)

      setProgress(20)

      const response = await fetch('/api/runway/image-to-video', {
        method: 'POST',
        body: formData,
      })

      setProgress(40)

      if (!response.ok) throw new Error('Erro ao enviar imagem')

      const data = await response.json()
      
      setIsUploading(false)
      setIsProcessing(true)
      setProgress(60)

      await pollTaskStatus(data.taskId)
    } catch (err) {
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
        const data = await response.json()

        if (data.status === 'SUCCEEDED') {
          setResultUrl(data.output[0])
          setIsProcessing(false)
          setIsComplete(true)
          setProgress(100)
        } else if (data.status === 'FAILED') {
          setError('Falha ao processar vídeo')
          setIsProcessing(false)
        } else if (attempts < maxAttempts) {
          attempts++
          setProgress(60 + (attempts / maxAttempts) * 35)
          setTimeout(checkStatus, 3000)
        } else {
          setError('Timeout ao processar vídeo')
          setIsProcessing(false)
        }
      } catch (err) {
        setError('Erro ao verificar status')
        setIsProcessing(false)
      }
    }

    checkStatus()
  }

  const handleReset = () => {
    setImageFile(null)
    setImagePreview(null)
    setPromptText("")
    setResultUrl(null)
    setIsComplete(false)
    setError(null)
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const togglePlayPause = () => {
    if (resultVideoRef.current) {
      if (isPlayingResult) {
        resultVideoRef.current.pause()
      } else {
        resultVideoRef.current.play()
      }
      setIsPlayingResult(!isPlayingResult)
    }
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <CinemaSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 backdrop-blur-xl">
                <ImagePlay className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Imagem para Vídeo
              </h1>
            </div>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Transforme suas imagens em vídeos cinematográficos com movimento e vida
            </p>
          </motion.div>

          {/* Vídeos Exemplo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">
                Exemplos de Criações
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {exampleVideos.map((videoUrl, index) => (
                <div
                  key={index}
                  className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-500/30 transition-all"
                >
                  <video
                    className="w-full aspect-video object-cover"
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-sm text-white">Exemplo {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Generator Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Crie Seu Vídeo
              </h2>

              {/* Upload Section */}
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all group"
                >
                  <Upload className="w-16 h-16 text-white/40 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Envie Sua Imagem
                  </h3>
                  <p className="text-white/60 mb-4">
                    Arraste e solte ou clique para selecionar
                  </p>
                  <p className="text-sm text-white/40">
                    PNG, JPG ou WebP (máx. 20MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto"
                    />
                    <button
                      onClick={handleReset}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xl transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Prompt Input */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Movimento da Câmera (Opcional)
                    </label>
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Descreva o movimento que deseja..."
                      className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      disabled={isUploading || isProcessing}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setPromptText(prompt)}
                          className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white border border-white/10 transition-all"
                          disabled={isUploading || isProcessing}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        Duração: {duration}s
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value) as any)}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                        disabled={isUploading || isProcessing}
                      />
                      <div className="flex justify-between text-xs text-white/40 mt-1">
                        <span>2s</span>
                        <span>10s</span>
                      </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">
                        Proporção
                      </label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as any)}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        disabled={isUploading || isProcessing}
                      >
                        <option value="1280:720">16:9 Landscape</option>
                        <option value="720:1280">9:16 Portrait</option>
                        <option value="1104:832">4:3 Standard</option>
                        <option value="832:1104">3:4 Portrait</option>
                        <option value="960:960">1:1 Square</option>
                        <option value="1584:672">21:9 Cinematic</option>
                      </select>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {(isUploading || isProcessing) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white/60">
                        <span>
                          {isUploading ? 'Enviando imagem...' : 'Gerando vídeo...'}
                        </span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  {!isComplete && (
                    <button
                      onClick={handleGenerate}
                      disabled={!imageFile || isUploading || isProcessing}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      {isUploading || isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isUploading ? 'Enviando...' : 'Criando vídeo...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          Criar Vídeo
                        </>
                      )}
                    </button>
                  )}

                  {/* Result Video */}
                  <AnimatePresence>
                    {isComplete && resultUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm font-medium">Vídeo criado com sucesso!</p>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                          <video
                            ref={resultVideoRef}
                            src={resultUrl}
                            className="w-full h-auto"
                            onPlay={() => setIsPlayingResult(true)}
                            onPause={() => setIsPlayingResult(false)}
                            controls
                            playsInline
                          />
                        </div>

                        <div className="flex gap-3">
                          <a
                            href={resultUrl}
                            download
                            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-center hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-5 h-5" />
                            Baixar Vídeo
                          </a>
                          <button
                            onClick={handleReset}
                            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all flex items-center gap-2 border border-white/20"
                          >
                            <RotateCw className="w-5 h-5" />
                            Criar Novo
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-white/40">
              Transforme imagens estáticas em vídeos cinematográficos com IA
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
