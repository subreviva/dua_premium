"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { VideoStudioNavbar } from "@/components/video-studio-navbar"
import { Upload, X, ChevronDown, Download } from "lucide-react"

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

// Example showcase
const EXAMPLE_SHOWCASE = {
  input: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/v2v-gen4_aleph-input.mp4",
  output: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/v2v-gen4_aleph-output%20%281%29.mp4"
}

export default function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [selectedRatio, setSelectedRatio] = useState("1280:720")
  const [showRatioDropdown, setShowRatioDropdown] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processedVideo, setProcessedVideo] = useState<string | null>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setProcessedVideo(null)
      
      // Create preview
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setSelectedFile(null)
    setVideoPreview(null)
    setProcessedVideo(null)
  }

  const handleEdit = async () => {
    if (!selectedFile || !prompt.trim()) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 1
        })
      }, 1000)

      // Converter vídeo para base64
      const reader = new FileReader()
      const videoBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      // Chamar API
      const response = await fetch("/api/runway/video-to-video", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUri: videoBase64,
          promptText: prompt.trim(),
          model: 'gen4_aleph',
          ratio: selectedRatio,
          contentModeration: {
            publicFigureThreshold: 'auto'
          }
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorMessage = `Erro ${response.status}`
        
        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            // Ignore parse error
          }
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.success || !data.taskId) {
        throw new Error('Resposta inválida da API')
      }

      // Poll para status
      let taskId = data.taskId
      let completed = false
      let attempts = 0
      const maxAttempts = 120

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000))

        const statusResponse = await fetch(`/api/runway/task-status?taskId=${taskId}`)
        
        if (!statusResponse.ok) {
          console.error('Error checking status')
          attempts++
          continue
        }

        const contentType = statusResponse.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          console.error('Status response is not JSON')
          attempts++
          continue
        }
        
        const statusData = await statusResponse.json()

        if (statusData.status === "SUCCEEDED") {
          setProcessedVideo(statusData.output)
          setProgress(100)
          clearInterval(progressInterval)
          completed = true
        } else if (statusData.status === "FAILED") {
          throw new Error(statusData.error || "Falha ao processar vídeo")
        }

        attempts++
      }

      if (!completed) {
        throw new Error("Tempo limite excedido")
      }
    } catch (error) {
      console.error("Erro:", error)
      alert(error instanceof Error ? error.message : "Erro ao processar vídeo")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    handleRemoveVideo()
    setPrompt("")
    setProgress(0)
  }

  const selectedRatioLabel = ASPECT_RATIOS.find(r => r.value === selectedRatio)?.label || "Select Ratio"

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <VideoStudioNavbar />
      <div className="hidden md:block">
        <CinemaSidebar />
      </div>

      <main className="flex-1 overflow-hidden pt-14">
        <div className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full md:divide-x divide-white/5">
            
            {/* Left Panel - Controls */}
            <div className="overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
              
              {/* Header */}
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Video Editor</h1>
                <p className="text-sm sm:text-base md:text-lg text-zinc-500">Transform videos with AI - Gen4 Aleph</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-400">
                    50 credits per edit
                  </span>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm sm:text-base md:text-lg font-medium text-zinc-400 mb-3">
                  Source Video
                </label>
                {videoPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black group">
                    <video
                      src={videoPreview}
                      className="w-full aspect-video object-cover"
                      controls
                      playsInline
                    />
                    <button
                      onClick={handleRemoveVideo}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/80 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-8 sm:p-10 lg:p-12 text-center hover:border-white/20 hover:bg-white/5 transition-all">
                      <Upload className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm sm:text-base md:text-lg text-zinc-400 mb-1">Click to upload video</p>
                      <p className="text-xs sm:text-sm md:text-base text-zinc-600">MP4, MOV, WebM</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                  </label>
                )}
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm sm:text-base md:text-lg font-medium text-zinc-400 mb-3">
                  Transformation Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how to transform the video... (camera angles, lighting, objects, scenery)"
                  className="w-full h-32 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all resize-none"
                  disabled={isProcessing}
                />
                <p className="mt-2 text-xs text-zinc-600">
                  Be specific about camera, lighting, objects or scenery changes
                </p>
              </div>

              {/* Aspect Ratio Dropdown */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">
                  Aspect Ratio
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowRatioDropdown(!showRatioDropdown)}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-left hover:bg-white/[0.07] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <span className="text-sm">{selectedRatioLabel}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showRatioDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showRatioDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 rounded-lg bg-zinc-900 border border-white/10 shadow-xl overflow-hidden"
                      >
                        <div className="max-h-64 overflow-y-auto">
                          {ASPECT_RATIOS.map((ratio) => (
                            <button
                              key={ratio.value}
                              onClick={() => {
                                setSelectedRatio(ratio.value)
                                setShowRatioDropdown(false)
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                selectedRatio === ratio.value
                                  ? 'bg-white/10 text-white'
                                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {ratio.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-lg bg-transparent hover:bg-white/5 text-white font-medium transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!selectedFile || !prompt.trim() || isProcessing}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                      />
                      Editing...
                    </>
                  ) : (
                    'Transform Video'
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Result Area */}
            <div className="h-full flex items-center justify-center p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-8 max-w-md"
                  >
                    <div className="relative w-20 h-20 mx-auto">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">Transforming</h3>
                      <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                        <motion.div
                          className="h-full bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between mt-3">
                        <p className="text-xs text-zinc-500">{Math.round(progress)}%</p>
                        <p className="text-xs text-zinc-500">{Math.ceil((100 - progress) / 2)} min</p>
                      </div>
                    </div>
                  </motion.div>
                ) : processedVideo ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-4xl"
                  >
                    <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                      <video
                        ref={resultVideoRef}
                        src={processedVideo || ''}
                        className="w-full aspect-video object-contain"
                        controls
                        playsInline
                        autoPlay
                        loop
                        preload="metadata"
                      />
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={processedVideo || ''}
                        download="duaia-edited-video.mp4"
                        className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-semibold text-center hover:bg-white/90 transition-all"
                      >
                        Download Video
                      </motion.a>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReset}
                        className="px-6 py-3 rounded-lg bg-transparent hover:bg-white/5 text-white font-medium transition-all border border-white/10"
                      >
                        New
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="example"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-4xl space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-lg font-semibold text-white mb-2">Example Transformation</h3>
                      <p className="text-sm text-zinc-500">See what AI can do</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-3">Input Video</p>
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                          <video
                            src={EXAMPLE_SHOWCASE.input}
                            className="w-full aspect-video object-cover"
                            controls
                            playsInline
                            loop
                            muted
                            preload="metadata"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-3">Transformed Video</p>
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                          <video
                            src={EXAMPLE_SHOWCASE.output}
                            className="w-full aspect-video object-cover"
                            controls
                            playsInline
                            loop
                            muted
                            preload="metadata"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center mt-8">
                      <p className="text-xs text-zinc-600">Upload a video to get started</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
