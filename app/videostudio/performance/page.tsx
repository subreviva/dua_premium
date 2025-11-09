"use client"

import { useState, useRef } from "react"
import { Users, Upload, Video, ImageIcon, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, Play, Pause, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"

export default function CharacterPerformancePage() {
  const [characterFile, setCharacterFile] = useState<File | null>(null)
  const [characterPreview, setCharacterPreview] = useState<string | null>(null)
  const [characterType, setCharacterType] = useState<'image' | 'video'>('image')
  const [performanceFile, setPerformanceFile] = useState<File | null>(null)
  const [performancePreview, setPerformancePreview] = useState<string | null>(null)
  const [gesturesEnabled, setGesturesEnabled] = useState(true)
  const [expressionIntensity, setExpressionIntensity] = useState(3)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isPlayingResult, setIsPlayingResult] = useState(false)
  const [duration, setDuration] = useState(0)
  const [creditCost, setCreditCost] = useState(15)

  const characterInputRef = useRef<HTMLInputElement>(null)
  const performanceInputRef = useRef<HTMLInputElement>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)
  const performanceVideoRef = useRef<HTMLVideoElement>(null)

  const handleCharacterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setError('Selecione uma imagem ou vídeo válido')
      return
    }

    const maxSize = isImage ? 20 * 1024 * 1024 : 100 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`O arquivo deve ter no máximo ${isImage ? '20MB' : '100MB'}`)
      return
    }

    setCharacterFile(file)
    setCharacterType(isImage ? 'image' : 'video')
    setError(null)

    const url = URL.createObjectURL(file)
    setCharacterPreview(url)

    // Disable gestures for video characters
    if (isVideo) {
      setGesturesEnabled(false)
    }
  }

  const handlePerformanceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('A performance deve ser um vídeo')
      return
    }

    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      setError('O vídeo deve ter no máximo 100MB')
      return
    }

    setPerformanceFile(file)
    setError(null)

    const url = URL.createObjectURL(file)
    setPerformancePreview(url)

    // Get video duration
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const videoDuration = Math.ceil(video.duration)
      setDuration(videoDuration)
      // Calculate cost: 5 credits per second, minimum 3 seconds (15 credits)
      const cost = Math.max(videoDuration * 5, 15)
      setCreditCost(cost)
    }
    video.src = url
  }

  const handleGenerate = async () => {
    if (!characterFile || !performanceFile) return

    setIsUploading(true)
    setError(null)
    setProgress(0)

    try {
      // 1. Upload character
      const characterFormData = new FormData()
      characterFormData.append(characterType === 'image' ? 'image' : 'video', characterFile)

      setProgress(15)

      const characterUploadResponse = await fetch(
        `/api/runway/upload-${characterType === 'image' ? 'image' : 'video'}`,
        {
          method: 'POST',
          body: characterFormData,
        }
      )

      if (!characterUploadResponse.ok) {
        throw new Error('Erro ao fazer upload do personagem')
      }

      const { [characterType === 'image' ? 'imageUri' : 'videoUri']: characterUri } = 
        await characterUploadResponse.json()

      setProgress(30)

      // 2. Upload performance
      const performanceFormData = new FormData()
      performanceFormData.append('video', performanceFile)

      const performanceUploadResponse = await fetch('/api/runway/upload-video', {
        method: 'POST',
        body: performanceFormData,
      })

      if (!performanceUploadResponse.ok) {
        throw new Error('Erro ao fazer upload da performance')
      }

      const { videoUri: performanceUri } = await performanceUploadResponse.json()

      setProgress(50)
      setIsUploading(false)
      setIsProcessing(true)

      // 3. Start generation
      const generateResponse = await fetch('/api/runway/character-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterType,
          characterUri,
          performanceUri,
          bodyControl: gesturesEnabled,
          expressionIntensity,
          seed: Math.floor(Math.random() * 4294967295),
        }),
      })

      if (!generateResponse.ok) {
        throw new Error('Erro ao iniciar geração')
      }

      const { taskId: newTaskId } = await generateResponse.json()
      setTaskId(newTaskId)
      setProgress(60)

      // 4. Poll status
      pollTaskStatus(newTaskId)
    } catch (err) {
      console.error('Erro ao gerar performance:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
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
          throw new Error('Falha no processamento')
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
    setCharacterFile(null)
    setCharacterPreview(null)
    setPerformanceFile(null)
    setPerformancePreview(null)
    setIsUploading(false)
    setIsProcessing(false)
    setIsComplete(false)
    setError(null)
    setProgress(0)
    setTaskId(null)
    setResultUrl(null)
    setGesturesEnabled(true)
    setExpressionIntensity(3)
    setDuration(0)
    setCreditCost(15)
    if (characterInputRef.current) characterInputRef.current.value = ''
    if (performanceInputRef.current) performanceInputRef.current.value = ''
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Performance de Personagem</h1>
                <p className="text-sm text-zinc-400">Anime personagens com performances capturadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Hero Section */}
          {!characterPreview && !performancePreview && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">Transferência de Performance com IA</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">
                  Transfira Expressões e{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Movimentos Faciais
                  </span>
                </h2>
                <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                  Capture uma performance real e transfira expressões faciais, gestos e movimentos para qualquer personagem
                </p>
              </div>

              {/* Info Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Performance de Vídeo</h3>
                  <p className="text-sm text-zinc-400">
                    Grave ou envie um vídeo com expressões faciais e gestos
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Personagem</h3>
                  <p className="text-sm text-zinc-400">
                    Use uma imagem ou vídeo do personagem que deseja animar
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">IA Avançada</h3>
                  <p className="text-sm text-zinc-400">
                    Transferência precisa de expressões faciais e controle de gestos
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upload Areas */}
          {!isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Character Upload */}
              <div className="rounded-3xl bg-zinc-900 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">1. Personagem</h3>
                    <p className="text-sm text-zinc-400">Imagem ou vídeo do personagem</p>
                  </div>
                </div>

                {!characterPreview ? (
                  <div
                    onClick={() => characterInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-blue-500/50 transition-all cursor-pointer bg-black/40"
                  >
                    <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">Clique para selecionar</p>
                    <p className="text-sm text-zinc-500">
                      Imagem (JPG, PNG) até 20MB ou Vídeo (MP4) até 100MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden bg-black border border-white/10">
                      <div className="aspect-video relative flex items-center justify-center">
                        {characterType === 'image' ? (
                          <img src={characterPreview} alt="Character" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <video src={characterPreview} className="w-full h-full object-contain" controls />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        {characterType === 'image' ? '📷 Imagem' : '🎥 Vídeo'} • {characterFile?.name}
                      </span>
                      <Button
                        onClick={() => {
                          setCharacterFile(null)
                          setCharacterPreview(null)
                          if (characterInputRef.current) characterInputRef.current.value = ''
                        }}
                        variant="outline"
                        size="sm"
                        className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                      >
                        Trocar
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  ref={characterInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleCharacterSelect}
                  className="hidden"
                />
              </div>

              {/* Performance Upload */}
              <div className="rounded-3xl bg-zinc-900 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Video className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">2. Vídeo de Performance</h3>
                    <p className="text-sm text-zinc-400">Capture expressões e gestos</p>
                  </div>
                </div>

                {!performancePreview ? (
                  <div
                    onClick={() => performanceInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-cyan-500/50 transition-all cursor-pointer bg-black/40"
                  >
                    <Camera className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">Grave ou faça upload</p>
                    <p className="text-sm text-zinc-500">
                      Vídeo (MP4, MOV, WebM) até 100MB • Mínimo 3 segundos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden bg-black border border-white/10">
                      <div className="aspect-video relative">
                        <video 
                          ref={performanceVideoRef}
                          src={performancePreview} 
                          className="w-full h-full object-contain" 
                          controls 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">
                        🎬 {performanceFile?.name} • {duration}s
                      </span>
                      <Button
                        onClick={() => {
                          setPerformanceFile(null)
                          setPerformancePreview(null)
                          if (performanceInputRef.current) performanceInputRef.current.value = ''
                        }}
                        variant="outline"
                        size="sm"
                        className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                      >
                        Trocar
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  ref={performanceInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handlePerformanceSelect}
                  className="hidden"
                />
              </div>

              {/* Settings */}
              {characterPreview && performancePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Gestures Control */}
                  <div className="rounded-2xl bg-zinc-900 border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">Controle de Gestos</h3>
                        <p className="text-xs text-zinc-400">
                          {characterType === 'video' 
                            ? 'Indisponível para vídeos de personagem'
                            : 'Transferir poses e movimentos corporais'}
                        </p>
                      </div>
                      <button
                        onClick={() => setGesturesEnabled(!gesturesEnabled)}
                        disabled={characterType === 'video' || isUploading || isProcessing}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          gesturesEnabled ? 'bg-blue-500' : 'bg-zinc-700'
                        } ${characterType === 'video' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            gesturesEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expression Intensity */}
                  <div className="rounded-2xl bg-zinc-900 border border-white/10 p-6">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white">Intensidade de Expressão</h3>
                        <span className="text-sm text-blue-400 font-medium">{expressionIntensity}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-4">
                        Controle a intensidade das expressões faciais (1-5)
                      </p>
                    </div>
                    <Slider
                      value={[expressionIntensity]}
                      onValueChange={(value) => setExpressionIntensity(value[0])}
                      min={1}
                      max={5}
                      step={1}
                      disabled={isUploading || isProcessing}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-zinc-500">Menos expressivo</span>
                      <span className="text-xs text-zinc-500">Mais expressivo</span>
                    </div>
                  </div>

                  {/* Cost Info */}
                  <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Custo Estimado</p>
                        <p className="text-xs text-zinc-400">
                          {duration}s × 5 créditos = {creditCost} créditos (mínimo 15)
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">{creditCost}</div>
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
                          {isUploading ? 'Fazendo upload...' : 'Gerando performance...'}
                        </span>
                        <span className="text-sm text-zinc-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">
                        {isProcessing && "A IA está transferindo a performance. Isso pode levar alguns minutos..."}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={isUploading || isProcessing}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold h-14 rounded-xl shadow-lg shadow-blue-500/20 text-base"
                    >
                      {isUploading || isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Users className="w-5 h-5 mr-2" />
                          Gerar Performance
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
                  <p className="text-green-400 font-semibold text-lg">Performance transferida com sucesso!</p>
                  <p className="text-green-300/80 text-sm">Seu personagem ganhou vida com a performance capturada</p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400"
                >
                  Nova Performance
                </Button>
              </div>

              {/* Video Result */}
              <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 shadow-2xl shadow-blue-500/10">
                <div className="p-4 border-b border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Performance Animada</h3>
                      <p className="text-xs text-blue-400">
                        Intensidade {expressionIntensity} • {gesturesEnabled ? 'Com gestos' : 'Sem gestos'}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-500/20 text-xs text-blue-400 font-medium">
                      ✨ {creditCost} créditos
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
                      a.download = 'character-performance.mp4'
                      a.click()
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold h-11 rounded-xl"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar Vídeo
                  </Button>
                </div>
              </div>

              {/* Inputs Reference */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Personagem Original</h3>
                  </div>
                  <div className="aspect-video relative bg-black flex items-center justify-center">
                    {characterType === 'image' ? (
                      <img src={characterPreview || ''} alt="Character" className="max-w-full max-h-full object-contain p-4" />
                    ) : (
                      <video src={characterPreview || ''} className="w-full h-full object-contain" controls />
                    )}
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Performance Capturada</h3>
                  </div>
                  <div className="aspect-video relative bg-black">
                    <video src={performancePreview || ''} className="w-full h-full object-contain" controls />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
