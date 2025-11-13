"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { VideoStudioNavbar } from "@/components/video-studio-navbar"
import { Upload, X, Download } from "lucide-react"

// Example showcase
const EXAMPLE_SHOWCASE = {
  input: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/upscale-input%20%281%29.mp4",
  output: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/upscale-input%20%281%29.mp4"
}

export default function QualidadePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processedVideo, setProcessedVideo] = useState<string | null>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('Video must be less than 100MB')
      return
    }

    setSelectedFile(file)
    setProcessedVideo(null)
    
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setSelectedFile(null)
    setVideoPreview(null)
    setProcessedVideo(null)
  }

  const handleUpscale = async () => {
    if (!selectedFile) return

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

      const response = await fetch("/api/runway/video-upscale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUri: videoBase64,
          model: "upscale_v1"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error processing video")
      }

      const data = await response.json()
      
      if (!data.success || !data.taskId) {
        throw new Error("Invalid API response")
      }
      
      // Poll para status
      const taskId = data.taskId
      let completed = false
      let attempts = 0
      const maxAttempts = 120

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
        
        const statusResponse = await fetch(`/api/runway/task-status?taskId=${taskId}`)
        
        if (!statusResponse.ok) {
          console.error('Error checking status')
          continue
        }

        const statusData = await statusResponse.json()
        
        if (statusData.status === "SUCCEEDED") {
          const videoUrl = statusData.output?.[0] || statusData.output
          if (videoUrl) {
            setProcessedVideo(videoUrl)
            setProgress(100)
            clearInterval(progressInterval)
            completed = true
          } else {
            throw new Error("Video URL not found")
          }
        } else if (statusData.status === "FAILED") {
          throw new Error(statusData.failure?.message || "Failed to process video")
        }
      }

      if (!completed) {
        throw new Error("Timeout exceeded")
      }
    } catch (error) {
      console.error("❌ Error:", error)
      alert(error instanceof Error ? error.message : "Error processing video")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    handleRemoveVideo()
    setProgress(0)
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <VideoStudioNavbar />
      <CinemaSidebar />

      <main className="flex-1 overflow-hidden pt-14">
        <div className="h-full">
          <div className="grid grid-cols-2 h-full divide-x divide-white/5">
            
            {/* Left Panel - Controls */}
            <div className="overflow-y-auto p-6 space-y-6">
              
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Video Upscale</h1>
                <p className="text-sm text-zinc-500">4X resolution enhancement - Upscale v1</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-400">
                    25 credits per upscale
                  </span>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-400">
                    Max 4096px
                  </span>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">
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
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center hover:border-white/20 hover:bg-white/5 transition-all">
                      <Upload className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm text-zinc-400 mb-1">Click to upload video</p>
                      <p className="text-xs text-zinc-600">MP4, MOV, WebM (max 100MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                    />
                  </label>
                )}
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Upscale Features</h3>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li>• 4X resolution increase</li>
                  <li>• AI-powered enhancement</li>
                  <li>• Preserves quality and details</li>
                  <li>• Maximum output: 4096px per side</li>
                </ul>
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
                  onClick={handleUpscale}
                  disabled={!selectedFile || isProcessing}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                      />
                      Upscaling...
                    </>
                  ) : (
                    'Upscale to 4K'
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Result Area */}
            <div className="h-full flex items-center justify-center p-6">
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
                      <h3 className="text-xl font-semibold text-white mb-3">Upscaling</h3>
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
                        className="w-full aspect-video"
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
                        download="duaia-upscaled-4k.mp4"
                        className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-semibold text-center hover:bg-white/90 transition-all"
                      >
                        Download 4K
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
                      <h3 className="text-lg font-semibold text-white mb-2">Example 4K Upscale</h3>
                      <p className="text-sm text-zinc-500">See the quality improvement</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-3">Original Video</p>
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
                        <p className="text-xs font-medium text-zinc-500 mb-3">4K Upscaled</p>
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
