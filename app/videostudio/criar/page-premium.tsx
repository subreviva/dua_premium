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

                  {/* Premium Loading State */}
                  {(isUploading || isProcessing) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-xl p-6 sm:p-8"
                    >
                      {/* Animated Gradient Border */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                      
                      {/* Content */}
                      <div className="relative space-y-6">
                        {/* Status Icon & Text */}
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="relative">
                            {/* Rotating Gradient Ring */}
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-60"
                            />
                            
                            {/* Icon Container */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                              </motion.div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                              {isUploading ? 'Enviando Imagem' : 'Criando Seu Vídeo'}
                            </h3>
                            <p className="text-sm sm:text-base text-white/60">
                              {isUploading 
                                ? 'Preparando sua imagem para processamento...' 
                                : 'Nossa IA está transformando sua imagem em vídeo cinematográfico...'}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm sm:text-base text-white/80">
                            <span className="font-medium">
                              {isUploading ? 'Upload' : 'Processamento'}
                            </span>
                            <span className="font-bold">{Math.round(progress)}%</span>
                          </div>
                          
                          {/* Premium Progress Bar */}
                          <div className="relative h-3 sm:h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            {/* Background Shimmer */}
                            <motion.div
                              animate={{ x: ['0%', '100%'] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            />
                            
                            {/* Progress Fill */}
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                              {/* Glow Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-sm" />
                            </motion.div>
                          </div>

                          {/* Progress Steps */}
                          <div className="flex justify-between text-xs text-white/40 px-1">
                            <span className={progress >= 20 ? 'text-blue-400 font-medium' : ''}>Iniciando</span>
                            <span className={progress >= 40 ? 'text-purple-400 font-medium' : ''}>Processando</span>
                            <span className={progress >= 60 ? 'text-pink-400 font-medium' : ''}>Finalizando</span>
                            <span className={progress >= 100 ? 'text-green-400 font-medium' : ''}>Concluído</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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

                  {/* Ultra-Premium Result Video Player */}
                  <AnimatePresence>
                    {isComplete && resultUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="space-y-4 sm:space-y-6"
                      >
                        {/* Success Badge */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 backdrop-blur-xl"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                          >
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-sm sm:text-base font-bold text-green-400">Vídeo criado com sucesso!</p>
                            <p className="text-xs sm:text-sm text-white/60 mt-0.5">Seu vídeo cinematográfico está pronto</p>
                          </div>
                        </motion.div>

                        {/* Premium Video Player */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="relative group"
                        >
                          {/* Glow Effect */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                          
                          {/* Video Container */}
                          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                            <video
                              ref={resultVideoRef}
                              src={resultUrl}
                              className="w-full h-auto"
                              onPlay={() => setIsPlayingResult(true)}
                              onPause={() => setIsPlayingResult(false)}
                              controls
                              playsInline
                              preload="metadata"
                              controlsList="nodownload"
                              style={{ maxHeight: '70vh' }}
                            />
                            
                            {/* Custom Overlay Controls (optional enhancement) */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="pointer-events-auto">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={togglePlayPause}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-black/90 transition-all"
                                >
                                  {isPlayingResult ? (
                                    <Pause className="w-8 h-8 sm:w-10 sm:h-10" />
                                  ) : (
                                    <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Premium Action Buttons - Mobile Optimized */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                        >
                          {/* Download Button - Primary */}
                          <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={resultUrl}
                            download="duaia-cinema-video.mp4"
                            className="flex-1 relative group/download overflow-hidden"
                          >
                            {/* Animated Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all" />
                            <motion.div
                              animate={{ x: ['0%', '100%', '0%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                            
                            {/* Button Content */}
                            <div className="relative py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 backdrop-blur-xl">
                              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover/download:animate-bounce" />
                              <span className="text-base sm:text-lg font-bold text-white">
                                Baixar Vídeo
                              </span>
                              <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="text-white/80"
                              >
                                →
                              </motion.div>
                            </div>
                          </motion.a>

                          {/* Create New Button - Secondary */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleReset}
                            className="sm:w-auto w-full px-6 sm:px-8 py-4 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl flex items-center justify-center gap-3 group/new"
                          >
                            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 group-hover/new:rotate-180 transition-transform duration-500" />
                            <span className="text-base sm:text-lg">Criar Novo</span>
                          </motion.button>
                        </motion.div>

                        {/* Video Info Card - Mobile Friendly */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-xs sm:text-sm text-white/40 mb-1">Duração</div>
                              <div className="text-base sm:text-lg font-bold text-white">{duration}s</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs sm:text-sm text-white/40 mb-1">Proporção</div>
                              <div className="text-base sm:text-lg font-bold text-white">
                                {aspectRatio === '1280:720' ? '16:9' : 
                                 aspectRatio === '720:1280' ? '9:16' :
                                 aspectRatio === '1104:832' ? '4:3' :
                                 aspectRatio === '832:1104' ? '3:4' :
                                 aspectRatio === '960:960' ? '1:1' : '21:9'}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs sm:text-sm text-white/40 mb-1">Modelo</div>
                              <div className="text-base sm:text-lg font-bold text-blue-400">Gen4 Turbo</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs sm:text-sm text-white/40 mb-1">Qualidade</div>
                              <div className="text-base sm:text-lg font-bold text-purple-400">Premium</div>
                            </div>
                          </div>
                        </motion.div>
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
