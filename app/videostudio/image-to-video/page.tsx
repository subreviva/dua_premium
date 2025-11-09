"use client"

import { useState, useRef } from "react"
import { ImageIcon, Upload, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, Play, Pause, Film, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AppSidebar } from "@/components/app-sidebar"
import { motion } from "framer-motion"

export default function ImageToVideoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [model, setModel] = useState<"gen3a_turbo" | "gen4_turbo">("gen4_turbo")
  const [duration, setDuration] = useState<4 | 5>(4)
  const [aspectRatio, setAspectRatio] = useState<"1280:720" | "720:1280" | "1920:1080">("1280:720")
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isPlayingResult, setIsPlayingResult] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)

  // Exemplos de imagens para vídeo
  const examples = [
    {
      video: "https://video.twimg.com/amplify_video/1958156406449651712/vid/avc1/1280x720/WwOxf6W6YxjiKYZD.mp4",
      label: "Paisagem Dinâmica",
      ratio: "16:9"
    },
    {
      video: "https://video.twimg.com/amplify_video/1951076382114545664/vid/avc1/720x1280/ceGn4mLBDKedb48L.mp4",
      label: "Vertical Cinematográfico",
      ratio: "9:16"
    },
    {
      video: "https://video.twimg.com/amplify_video/1953071976408297472/vid/avc1/1920x1080/qeSQZDkH6KcMKiIF.mp4",
      label: "Full HD Premium",
      ratio: "16:9"
    }
  ]

  const examplePrompts = [
    "Câmera se movendo suavemente para frente",
    "Zoom lento revelando detalhes",
    "Movimento panorâmico da esquerda para direita",
    "Efeito de parallax suave",
    "Adicione movimento de nuvens no céu",
    "Crie um efeito de dolly zoom cinematográfico",
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido')
      return
    }

    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      setError('A imagem deve ter no máximo 20MB')
      return
    }

    setImageFile(file)
    setError(null)

    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  const handleGenerate = async () => {
    if (!imageFile) return

    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      // 1. Upload da imagem
      const formData = new FormData()
      formData.append('image', imageFile)

      setProgress(20)

      const uploadResponse = await fetch('/api/runway/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload da imagem')
      }

      const { imageUri } = await uploadResponse.json()
      setProgress(40)
      setIsUploading(false)
      setIsProcessing(true)

      // 2. Iniciar geração
      const generateResponse = await fetch('/api/runway/image-to-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptImage: imageUri,
          promptText: promptText.trim() || undefined,
          model,
          ratio: aspectRatio,
          duration,
          seed: Math.floor(Math.random() * 4294967295), // Random seed
        }),
      })

      if (!generateResponse.ok) {
        throw new Error('Erro ao iniciar geração')
      }

      const { taskId: newTaskId } = await generateResponse.json()
      setTaskId(newTaskId)
      setProgress(60)

      // 3. Polling do status
      pollTaskStatus(newTaskId)
    } catch (err) {
      console.error('Erro ao gerar vídeo:', err)
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
    setImageFile(null)
    setImagePreview(null)
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

  const togglePlayResult = () => {
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Imagem para Vídeo</h1>
                <p className="text-sm text-zinc-400">Transforme fotos em vídeos cinematográficos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Examples Section */}
          {!imagePreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400 font-medium">IA Generativa de Vídeo</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">
                  Dê Vida às{" "}
                  <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    Suas Imagens
                  </span>
                </h2>
                <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                  Transforme qualquer foto em um vídeo dinâmico com movimento cinematográfico e fluidez profissional
                </p>
              </div>

              {/* Example Videos Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {examples.map((example, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-xl"
                  >
                    <div className="aspect-video relative bg-black">
                      <video
                        src={example.video}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-500/5 to-pink-500/5 border-t border-white/5">
                      <h3 className="text-sm font-semibold text-white mb-1">{example.label}</h3>
                      <p className="text-xs text-zinc-500">Proporção {example.ratio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upload Area */}
          {!imagePreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                
                <div className="relative border-2 border-dashed border-white/20 rounded-3xl p-16 text-center hover:border-orange-500/50 transition-all bg-black/40 backdrop-blur-sm">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Faça upload da sua imagem
                  </h3>
                  <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                    Selecione uma foto e veja ela ganhar vida com movimento cinematográfico
                  </p>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <ImageIcon className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-400 font-medium">JPG, PNG, WebP</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-pink-400 font-medium">Máx 20MB</span>
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
            </motion.div>
          )}

          {/* Generation Interface */}
          {imagePreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Image Preview */}
              <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-white/10">
                <div className="aspect-video relative bg-black flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Model Selection */}
              <div className="rounded-2xl bg-zinc-900 border border-white/10 p-4">
                <label className="block text-sm font-semibold text-white mb-3">Modelo de IA</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setModel('gen4_turbo')
                      setDuration(4)
                    }}
                    className={`p-4 rounded-xl border transition-all ${
                      model === 'gen4_turbo'
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                    disabled={isUploading || isProcessing}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <h3 className="text-sm font-semibold text-white">Gen-4 Turbo</h3>
                    </div>
                    <p className="text-xs text-zinc-400">Mais rápido • 4 segundos</p>
                  </button>

                  <button
                    onClick={() => {
                      setModel('gen3a_turbo')
                      setDuration(5)
                    }}
                    className={`p-4 rounded-xl border transition-all ${
                      model === 'gen3a_turbo'
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                    disabled={isUploading || isProcessing}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-pink-400" />
                      <h3 className="text-sm font-semibold text-white">Gen-3A Turbo</h3>
                    </div>
                    <p className="text-xs text-zinc-400">Equilibrado • 5 segundos</p>
                  </button>
                </div>
              </div>

              {/* Prompt Input (Optional) */}
              <div className="rounded-3xl bg-zinc-900 border border-white/10 p-6">
                <label className="block text-sm font-semibold text-white mb-3">
                  💫 Descreva o movimento desejado <span className="text-zinc-500">(opcional)</span>
                </label>
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ex: Câmera se movendo suavemente para frente, revelando mais detalhes..."
                  className="min-h-[100px] bg-black/50 border-white/10 text-white placeholder:text-zinc-500 resize-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                  disabled={isUploading || isProcessing}
                />
                
                {/* Example Prompts */}
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 mb-2">Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPromptText(example)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors"
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
                <label className="block text-sm font-semibold text-white mb-3">Proporção do Vídeo</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '1280:720', label: '16:9 HD', icon: '📺' },
                    { value: '720:1280', label: '9:16 Vertical', icon: '📱' },
                    { value: '1920:1080', label: '16:9 Full HD', icon: '🎬' },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value as any)}
                      className={`p-3 rounded-xl border transition-all ${
                        aspectRatio === ratio.value
                          ? 'border-orange-500 bg-orange-500/10'
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
                      {isUploading ? 'Enviando imagem...' : 'Gerando vídeo com IA...'}
                    </span>
                    <span className="text-sm text-zinc-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    {isProcessing && "A IA está criando seu vídeo. Isso pode levar alguns minutos..."}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isUploading || isProcessing}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold h-14 rounded-xl shadow-lg shadow-orange-500/20 text-base"
                >
                  {isUploading || isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5 mr-2" />
                      Gerar Vídeo ({duration}s)
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={isUploading || isProcessing}
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white h-14 px-8 rounded-xl"
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Result */}
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
                  <p className="text-green-400 font-semibold text-lg">Vídeo gerado com sucesso!</p>
                  <p className="text-green-300/80 text-sm">Sua imagem ganhou vida com IA</p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400"
                >
                  Nova Imagem
                </Button>
              </div>

              {/* Video Result */}
              <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 shadow-2xl shadow-orange-500/10">
                <div className="p-4 border-b border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Vídeo Gerado</h3>
                      <p className="text-xs text-orange-400">Criado com {model === 'gen4_turbo' ? 'Gen-4' : 'Gen-3A'} Turbo • {duration}s</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-orange-500/20 text-xs text-orange-400 font-medium">
                      ✨ Novo
                    </div>
                  </div>
                </div>
                <div className="aspect-video relative bg-black">
                  <video
                    ref={resultVideoRef}
                    src={resultUrl}
                    className="w-full h-full object-contain"
                    loop
                    onPlay={() => setIsPlayingResult(true)}
                    onPause={() => setIsPlayingResult(false)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlayResult}
                      className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                      {isPlayingResult ? (
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
                      a.download = 'video-gerado.mp4'
                      a.click()
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold h-11 rounded-xl"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar Vídeo
                  </Button>
                </div>
              </div>

              {/* Original Image Reference */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Imagem Original</h3>
                  </div>
                  <div className="aspect-video relative bg-black flex items-center justify-center p-4">
                    <img
                      src={imagePreview || ''}
                      alt="Original"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>

                {promptText && (
                  <div className="rounded-2xl bg-zinc-900 border border-white/10 p-6 flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-white mb-3">Prompt Utilizado</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{promptText}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
