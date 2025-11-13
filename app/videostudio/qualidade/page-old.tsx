"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { VideoStudioNavbar } from "@/components/video-studio-navbar"
import { Upload, Sparkles, ArrowUpCircle, FileVideo, Loader2, Download, Check } from "lucide-react"

export default function QualidadePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideo, setProcessedVideo] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setProcessedVideo(null)
      
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setProcessedVideo(null)
    }
  }

  const handleUpscale = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    
    try {
      // Converter vídeo para base64
      const reader = new FileReader()
      const videoBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      console.log('📹 Enviando vídeo para upscale...')

      const response = await fetch("/api/runway/video-upscale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUri: videoBase64,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao processar vídeo")
      }

      const data = await response.json()
      
      if (!data.success || !data.taskId) {
        throw new Error("Resposta inválida da API")
      }
      
      // Poll para status
      const taskId = data.taskId
      let completed = false
      let attempts = 0
      const maxAttempts = 120 // 10 minutos (5s * 120)

      console.log('⏳ Aguardando upscale (task:', taskId, ')...')

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
        
        const statusResponse = await fetch(`/api/runway/task-status?taskId=${taskId}`)
        
        if (!statusResponse.ok) {
          console.error('Erro ao verificar status')
          continue
        }

        const statusData = await statusResponse.json()
        console.log(`📊 Status (${attempts}/${maxAttempts}):`, statusData.status)
        
        if (statusData.status === "SUCCEEDED") {
          const videoUrl = statusData.output?.[0] || statusData.output
          if (videoUrl) {
            setProcessedVideo(videoUrl)
            completed = true
            console.log('✅ Upscale concluído!')
          } else {
            throw new Error("URL do vídeo não encontrada")
          }
        } else if (statusData.status === "FAILED") {
          throw new Error(statusData.failure?.message || "Falha ao processar vídeo")
        }
      }

      if (!completed) {
        throw new Error("Tempo limite excedido. Tente novamente.")
      }
    } catch (error) {
      console.error("❌ Erro:", error)
      alert(error instanceof Error ? error.message : "Erro ao processar vídeo. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <VideoStudioNavbar />
      <CinemaSidebar />
      
      <main className="flex-1 overflow-y-auto pt-14">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 backdrop-blur-xl">
                <ArrowUpCircle className="w-8 h-8 text-orange-400" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                Qualidade 4K
              </h1>
            </div>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Melhore a resolução do seu vídeo até 4K com inteligência artificial avançada
            </p>
          </motion.div>

          {/* Vídeos Exemplo - Comparação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">
                Veja a Diferença
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Original 720p */}
              <div className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                  <span className="text-sm font-medium text-white">Original 720p</span>
                </div>
                <video
                  className="w-full aspect-video object-cover"
                  src="https://d3phaj0sisr2ct.cloudfront.net/app/mira/empty-states/upscale-video-example-1-10-12-720p.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>

              {/* Upscale 4K */}
              <div className="group relative rounded-3xl overflow-hidden border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl">
                <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30">
                  <span className="text-sm font-medium text-orange-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Qualidade 4K
                  </span>
                </div>
                <video
                  className="w-full aspect-video object-cover"
                  src="https://d3phaj0sisr2ct.cloudfront.net/app/mira/empty-states/upscale-video-example-1-10-12.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Melhore Seu Vídeo
              </h2>

              {/* Upload Area */}
              <div className="mb-6">
                <label
                  htmlFor="video-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {selectedFile ? (
                      <>
                        <FileVideo className="w-16 h-16 text-orange-400 mb-4" />
                        <p className="text-lg font-medium text-white mb-1">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-white/60">
                          Clique para alterar
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 text-white/40 mb-4 group-hover:text-white/60 transition-colors" />
                        <p className="mb-2 text-lg font-medium text-white/80">
                          Arraste seu vídeo ou clique para selecionar
                        </p>
                        <p className="text-sm text-white/40">
                          Suporta vídeos até 40 segundos
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </label>
              </div>

              {/* Info Cards */}
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Até 4K</span>
                  </div>
                  <p className="text-xs text-white/60">Resolução máxima</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">40 segundos</span>
                  </div>
                  <p className="text-xs text-white/60">Duração máxima</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Qualidade Pro</span>
                  </div>
                  <p className="text-xs text-white/60">Processamento IA</p>
                </div>
              </div>

              {/* Process Button */}
              <button
                onClick={handleUpscale}
                disabled={!selectedFile || isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Melhorar para 4K
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Processed Video Result */}
          <AnimatePresence>
            {processedVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-12 max-w-3xl mx-auto"
              >
                <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Check className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Vídeo em 4K Pronto!
                    </h3>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-orange-500/20 mb-6">
                    <video
                      className="w-full aspect-video"
                      src={processedVideo}
                      controls
                      playsInline
                    />
                  </div>

                  <a
                    href={processedVideo}
                    download
                    className="w-full py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center block transition-all border border-white/20"
                  >
                    Baixar Vídeo 4K
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-white/40">
              Tecnologia de upscaling com inteligência artificial de última geração
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
