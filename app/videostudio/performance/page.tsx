"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { Upload, X, ChevronDown } from "lucide-react"

// Aspect ratios disponíveis para Act-Two
const ASPECT_RATIOS = [
  { label: "16:9 Landscape", value: "1280:720" },
  { label: "9:16 Portrait", value: "720:1280" },
  { label: "1:1 Square", value: "960:960" },
  { label: "4:3 Standard", value: "1104:832" },
  { label: "3:4 Portrait", value: "832:1104" },
  { label: "21:9 Cinematic", value: "1584:672" },
]

// Example showcase
const EXAMPLE_SHOWCASE = {
  character: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/cp-act-two-character-input.jpeg",
  reference: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/cp-act-two-reference-input.mp4",
  output: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/upscale-input.mp4"
}

export default function PerformancePage() {
  const [characterFile, setCharacterFile] = useState<File | null>(null)
  const [characterPreview, setCharacterPreview] = useState<string | null>(null)
  const [characterType, setCharacterType] = useState<'image' | 'video'>('image')
  
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  
  const [selectedRatio, setSelectedRatio] = useState("1280:720")
  const [showRatioDropdown, setShowRatioDropdown] = useState(false)
  const [bodyControl, setBodyControl] = useState(true)
  const [expressionIntensity, setExpressionIntensity] = useState(3)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultVideo, setResultVideo] = useState<string | null>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)

  const handleCharacterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      alert('Please select a valid image or video file')
      return
    }

    setCharacterFile(file)
    setCharacterType(isImage ? 'image' : 'video')
    setResultVideo(null)

    const url = URL.createObjectURL(file)
    setCharacterPreview(url)
  }

  const handleReferenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Reference must be a video file (3-30 seconds)')
      return
    }

    setReferenceFile(file)
    setResultVideo(null)

    const url = URL.createObjectURL(file)
    setReferencePreview(url)
  }

  const handleRemoveCharacter = () => {
    if (characterPreview) {
      URL.revokeObjectURL(characterPreview)
    }
    setCharacterFile(null)
    setCharacterPreview(null)
  }

  const handleRemoveReference = () => {
    if (referencePreview) {
      URL.revokeObjectURL(referencePreview)
    }
    setReferenceFile(null)
    setReferencePreview(null)
  }

  const handleGenerate = async () => {
    if (!characterFile || !referenceFile) return

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

      // Converter character para base64
      const characterReader = new FileReader()
      const characterBase64 = await new Promise<string>((resolve, reject) => {
        characterReader.onload = () => resolve(characterReader.result as string)
        characterReader.onerror = reject
        characterReader.readAsDataURL(characterFile)
      })

      // Converter reference para base64
      const referenceReader = new FileReader()
      const referenceBase64 = await new Promise<string>((resolve, reject) => {
        referenceReader.onload = () => resolve(referenceReader.result as string)
        referenceReader.onerror = reject
        referenceReader.readAsDataURL(referenceFile)
      })

      // Chamar API
      const response = await fetch("/api/runway/character-performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "act_two",
          character: {
            type: characterType,
            uri: characterBase64
          },
          reference: {
            type: "video",
            uri: referenceBase64
          },
          ratio: selectedRatio,
          bodyControl,
          expressionIntensity,
          contentModeration: {
            publicFigureThreshold: "auto"
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error processing performance")
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
            setResultVideo(videoUrl)
            setProgress(100)
            clearInterval(progressInterval)
            completed = true
          } else {
            throw new Error("Video URL not found")
          }
        } else if (statusData.status === "FAILED") {
          throw new Error(statusData.failure?.message || "Failed to process performance")
        }
      }

      if (!completed) {
        throw new Error("Timeout exceeded")
      }
    } catch (error) {
      console.error("❌ Error:", error)
      alert(error instanceof Error ? error.message : "Error processing performance")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    handleRemoveCharacter()
    handleRemoveReference()
    setResultVideo(null)
    setProgress(0)
    setBodyControl(true)
    setExpressionIntensity(3)
  }

  const selectedRatioLabel = ASPECT_RATIOS.find(r => r.value === selectedRatio)?.label || "Select Ratio"

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <CinemaSidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          <div className="grid grid-cols-2 h-full divide-x divide-white/5">
            
            {/* Left Panel - Controls */}
            <div className="overflow-y-auto p-6 space-y-6">
              
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Character Performance</h1>
                <p className="text-sm text-zinc-500">Control expressions and movements - Act-Two</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-400">
                    30 credits per video
                  </span>
                </div>
              </div>

              {/* Character Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">
                  Character (Image or Video)
                </label>
                {characterPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black group">
                    {characterType === 'image' ? (
                      <img
                        src={characterPreview}
                        alt="Character"
                        className="w-full aspect-video object-cover"
                      />
                    ) : (
                      <video
                        src={characterPreview}
                        className="w-full aspect-video object-cover"
                        controls
                        playsInline
                      />
                    )}
                    <button
                      onClick={handleRemoveCharacter}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/80 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center hover:border-white/20 hover:bg-white/5 transition-all">
                      <Upload className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm text-zinc-400 mb-1">Click to upload character</p>
                      <p className="text-xs text-zinc-600">Image or Video with visible face</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleCharacterSelect}
                      disabled={isProcessing}
                    />
                  </label>
                )}
              </div>

              {/* Reference Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">
                  Reference Performance (3-30s video)
                </label>
                {referencePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black group">
                    <video
                      src={referencePreview}
                      className="w-full aspect-video object-cover"
                      controls
                      playsInline
                    />
                    <button
                      onClick={handleRemoveReference}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-white/80 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center hover:border-white/20 hover:bg-white/5 transition-all">
                      <Upload className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm text-zinc-400 mb-1">Click to upload reference</p>
                      <p className="text-xs text-zinc-600">Video of actor performance</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleReferenceSelect}
                      disabled={isProcessing}
                    />
                  </label>
                )}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Body Control */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-400">
                    Body Control
                  </label>
                  <button
                    onClick={() => setBodyControl(!bodyControl)}
                    disabled={isProcessing}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      bodyControl ? 'bg-white' : 'bg-white/20'
                    } disabled:opacity-50`}
                  >
                    <motion.div
                      animate={{ x: bodyControl ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-black"
                    />
                  </button>
                </div>

                {/* Expression Intensity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-400">
                      Expression Intensity
                    </label>
                    <span className="text-sm text-white">{expressionIntensity}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={expressionIntensity}
                    onChange={(e) => setExpressionIntensity(parseInt(e.target.value))}
                    disabled={isProcessing}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
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
                  onClick={handleGenerate}
                  disabled={!characterFile || !referenceFile || isProcessing}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    'Apply Performance'
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
                      <h3 className="text-xl font-semibold text-white mb-3">Applying Performance</h3>
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
                ) : resultVideo ? (
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
                        src={resultVideo || ''}
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
                        href={resultVideo || ''}
                        download="duaia-character-performance.mp4"
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
                      <h3 className="text-lg font-semibold text-white mb-2">Example Performance</h3>
                      <p className="text-sm text-zinc-500">Character + Reference = Animated Result</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-3">Character</p>
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                          <img
                            src={EXAMPLE_SHOWCASE.character}
                            alt="Character"
                            className="w-full aspect-video object-cover"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-3">Reference</p>
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                          <video
                            src={EXAMPLE_SHOWCASE.reference}
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
                        <p className="text-xs font-medium text-zinc-500 mb-3">Result</p>
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
                      <p className="text-xs text-zinc-600">Upload character and reference to get started</p>
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

