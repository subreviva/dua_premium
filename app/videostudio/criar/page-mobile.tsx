"use client"

import { useState, useRef } from "react"
import { ImageIcon, Upload, Sparkles, Download, Loader2, RotateCw, X, ChevronDown, Settings2, ImagePlay } from "lucide-react"
import { VideoStudioNavbar } from "@/components/video-studio-navbar"
import { motion, AnimatePresence } from "framer-motion"

export default function CriarVideoMobilePage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [aspectRatio, setAspectRatio] = useState<"1280:720"|"720:1280"|"1104:832"|"832:1104"|"960:960"|"1584:672">("1280:720")
  const [selectedModel, setSelectedModel] = useState<"gen4_turbo" | "gen4_aleph">("gen4_turbo")
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'settings' | 'result'>('upload')
  const [credits, setCredits] = useState(150)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)

  const aspectRatioOptions = [
    { value: "1280:720", label: "16:9 Landscape", icon: "📺" },
    { value: "720:1280", label: "9:16 Portrait", icon: "📱" },
    { value: "1104:832", label: "4:3 Standard", icon: "🖼️" },
    { value: "832:1104", label: "3:4 Portrait", icon: "📸" },
    { value: "960:960", label: "1:1 Square", icon: "⬛" },
    { value: "1584:672", label: "21:9 Cinematic", icon: "🎬" },
  ]

  const modelOptions = [
    { value: "gen4_turbo", label: "Gen-4 Turbo", desc: "Fastest generation", credits: 25 },
    { value: "gen4_aleph", label: "Gen-4 Aleph", desc: "Highest quality", credits: 60 },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image too large (max 20MB)')
      return
    }

    setImageFile(file)
    setError(null)
    setCurrentStep('settings')
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!imageFile) return

    setError(null)
    setIsProcessing(true)
    setProgress(0)
    setCurrentStep('result')

    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      formData.append('promptText', promptText || '')
      formData.append('model', selectedModel)
      formData.append('duration', '5')
      formData.append('ratio', aspectRatio)

      setProgress(20)

      const response = await fetch('/api/runway/image-to-video', {
        method: 'POST',
        body: formData,
      })

      setProgress(40)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate')
      }

      const data = await response.json()
      setProgress(60)
      await pollTaskStatus(data.taskId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating video')
      setIsProcessing(false)
      setProgress(0)
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
          setProgress(100)
          setCredits(prev => prev - modelOptions.find(m => m.value === selectedModel)!.credits)
        } else if (data.status === 'FAILED') {
          setError('Generation failed')
          setIsProcessing(false)
          setProgress(0)
        } else if (attempts < maxAttempts) {
          attempts++
          setProgress(60 + (attempts / maxAttempts) * 35)
          setTimeout(checkStatus, 3000)
        } else {
          setError('Timeout')
          setIsProcessing(false)
          setProgress(0)
        }
      } catch (err) {
        setError('Error checking status')
        setIsProcessing(false)
        setProgress(0)
      }
    }

    checkStatus()
  }

  const handleReset = () => {
    setImageFile(null)
    setImagePreview(null)
    setPromptText("")
    setResultUrl(null)
    setIsProcessing(false)
    setError(null)
    setProgress(0)
    setCurrentStep('upload')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col">
      {/* iOS Status Bar Spacer */}
      <div className="h-safe-top bg-black" />
      
      {/* Header */}
      <header className="flex-shrink-0 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleReset}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">
              {selectedModel === 'gen4_turbo' ? 'Gen-4 Turbo' : 'Gen-4 Aleph'}
            </h1>
            {currentStep === 'settings' && (
              <p className="text-xs text-zinc-500 mt-0.5">Image to Video</p>
            )}
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full">
            {credits} Credits
          </button>
        </div>

        {/* Model Selector */}
        {currentStep === 'settings' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 flex gap-2"
          >
            <button
              onClick={() => setSelectedModel('gen4_turbo')}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                selectedModel === 'gen4_turbo'
                  ? 'bg-white/15 text-white border-2 border-white/30'
                  : 'bg-white/5 text-zinc-400 border-2 border-transparent'
              }`}
            >
              <div className="text-sm">Turbo</div>
              <div className="text-xs opacity-60">25 credits</div>
            </button>
            <button
              onClick={() => setSelectedModel('gen4_aleph')}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                selectedModel === 'gen4_aleph'
                  ? 'bg-white/15 text-white border-2 border-white/30'
                  : 'bg-white/5 text-zinc-400 border-2 border-transparent'
              }`}
            >
              <div className="text-sm">Aleph</div>
              <div className="text-xs opacity-60">60 credits</div>
            </button>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {/* STEP 1: Upload Image */}
          {currentStep === 'upload' && !imagePreview && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col items-center justify-center p-6"
            >
              <div className="w-full max-w-md">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mb-8 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <ImagePlay className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Create Magic</h2>
                  <p className="text-zinc-400">Transform images into cinematic videos</p>
                </motion.div>

                <label
                  htmlFor="image-upload"
                  className="block w-full"
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="w-full aspect-[4/3] border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-white/40 mb-3" />
                    <p className="text-white font-medium mb-1">Add image</p>
                    <p className="text-sm text-white/40">Tap to upload</p>
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Settings */}
          {currentStep === 'settings' && imagePreview && !isProcessing && !resultUrl && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 pb-safe-bottom space-y-4"
            >
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Describe your shot
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Camera slowly moves forward..."
                  className="w-full h-24 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  maxLength={200}
                />
                <div className="mt-1 text-xs text-zinc-500 text-right">
                  {promptText.length}/200
                </div>
              </div>

              {/* Aspect Ratio Grid */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {aspectRatioOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAspectRatio(option.value as any)}
                      className={`p-3 rounded-xl transition-all ${
                        aspectRatio === option.value
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-white/5 border-2 border-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-xs font-medium">{option.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Processing & Result */}
          {currentStep === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center p-4"
            >
              {isProcessing ? (
                <div className="text-center space-y-6 max-w-sm">
                  <div className="relative w-24 h-24 mx-auto">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Creating your video...</h3>
                    <p className="text-sm text-zinc-400 mb-4">This usually takes 1-2 minutes</p>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">{Math.round(progress)}%</p>
                  </div>
                </div>
              ) : resultUrl ? (
                <div className="w-full max-w-2xl">
                  <div className="relative group mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-30" />
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                      <video
                        ref={resultVideoRef}
                        src={resultUrl}
                        className="w-full aspect-video"
                        controls
                        playsInline
                        autoPlay
                        preload="metadata"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <motion.a
                      whileTap={{ scale: 0.98 }}
                      href={resultUrl}
                      download="duaia-video.mp4"
                      className="block w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-center active:from-blue-600 active:to-purple-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Video
                    </motion.a>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="block w-full px-6 py-4 rounded-2xl bg-white/10 active:bg-white/20 text-white font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                      <RotateCw className="w-5 h-5" />
                      Create New
                    </motion.button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Bar (Settings Step) */}
      {currentStep === 'settings' && !isProcessing && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="flex-shrink-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-4 pb-safe-bottom"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center"
            >
              <Settings2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!imageFile}
              className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 active:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 disabled:active:bg-blue-600"
            >
              Generate
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
