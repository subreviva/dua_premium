"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { Upload, Sparkles, Check, Wand2, FileVideo, Loader2, Ratio } from "lucide-react"

const ASPECT_RATIOS = [
  { label: "16:9 Landscape", value: "1280:720" },
  { label: "9:16 Portrait", value: "720:1280" },
  { label: "4:3 Standard", value: "1104:832" },
  { label: "1:1 Square", value: "960:960" },
  { label: "3:4 Portrait", value: "832:1104" },
  { label: "21:9 Cinematic", value: "1584:672" },
  { label: "16:9 SD", value: "848:480" },
  { label: "4:3 VGA", value: "640:480" },
]

export default function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [selectedRatio, setSelectedRatio] = useState("1280:720")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedVideo, setProcessedVideo] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setProcessedVideo(null)
    }
  }

  const handleEdit = async () => {
    if (!selectedFile || !prompt.trim()) return

    setIsProcessing(true)

    try {
      // Converter vídeo para base64 (data URI)
      const reader = new FileReader()
      const videoBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      // Chamar API com JSON (não FormData)
      const response = await fetch("/api/runway/video-to-video", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUri: videoBase64, // Data URI ou HTTPS URL
          promptText: prompt.trim(),
          model: 'gen4_aleph', // Fixo para video-to-video
          ratio: selectedRatio,
          contentModeration: {
            publicFigureThreshold: 'auto'
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao processar vídeo")
      }

      const data = await response.json()

      if (!data.success || !data.taskId) {
        throw new Error('Resposta inválida da API')
      }

      // Poll para status
      let taskId = data.taskId
      let completed = false
      let attempts = 0
      const maxAttempts = 120 // 10 minutos (5s * 120)

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // 5 segundos

        const statusResponse = await fetch(`/api/runway/task-status?taskId=${taskId}`)
        const statusData = await statusResponse.json()

        console.log('Task status:', statusData.status, 'Progress:', statusData.progress)

        if (statusData.status === "SUCCEEDED") {
          setProcessedVideo(statusData.output)
          completed = true
        } else if (statusData.status === "FAILED") {
          throw new Error(statusData.error || "Falha ao processar vídeo")
        }

        attempts++
      }

      if (!completed) {
        throw new Error("Tempo limite excedido. O processamento pode estar demorando mais que o esperado.")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert(error instanceof Error ? error.message : "Erro ao processar vídeo. Tente novamente.")
    } finally {
      setIsProcessing(false)
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
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 backdrop-blur-xl">
                <Wand2 className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Editor Criativo
              </h1>
            </div>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Edite vídeos com IA - ajuste câmera, objetos, iluminação, cenários e muito mais
            </p>
          </motion.div>

          {/* Vídeo Exemplo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Veja o Que é Possível
              </h2>
            </div>

            <div className="rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl">
              <video
                className="w-full aspect-video object-cover"
                src="https://d3phaj0sisr2ct.cloudfront.net/app/aleph/aleph-empty-dash-web.webm"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="p-6 border-t border-purple-500/20">
                <p className="text-white/80 text-center">
                  Transformações criativas com simples comandos de texto
                </p>
              </div>
            </div>
          </motion.div>

          {/* Editor Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Edite Seu Vídeo
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
                        <FileVideo className="w-16 h-16 text-purple-400 mb-4" />
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
                          Vídeo base para edição criativa
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

              {/* Prompt Textarea */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Descreva Como Quer Editar o Vídeo
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Transforme em cena noturna com luzes neon, adicione chuva, mude o ângulo da câmera para visão aérea..."
                  className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  disabled={isProcessing}
                />
                <p className="mt-2 text-xs text-white/40">
                  Seja específico sobre câmera, iluminação, objetos ou cenários que deseja modificar
                </p>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-3">
                  <Ratio className="w-4 h-4 inline mr-2" />
                  Proporção do Vídeo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setSelectedRatio(ratio.value)}
                      disabled={isProcessing}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedRatio === ratio.value
                          ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      } border disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Controle de Câmera</span>
                  </div>
                  <p className="text-xs text-white/60">Ajuste ângulos e movimentos</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Iluminação</span>
                  </div>
                  <p className="text-xs text-white/60">Modifique luz e atmosfera</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Objetos</span>
                  </div>
                  <p className="text-xs text-white/60">Adicione ou remova elementos</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Cenários</span>
                  </div>
                  <p className="text-xs text-white/60">Transforme o ambiente</p>
                </div>
              </div>

              {/* Process Button */}
              <button
                onClick={handleEdit}
                disabled={!selectedFile || !prompt.trim() || isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Editando com IA...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Aplicar Edições
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
                <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Check className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Vídeo Editado Pronto!
                    </h3>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-purple-500/20 mb-6">
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
                    Baixar Vídeo Editado
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
              Edição criativa com inteligência artificial de última geração
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
