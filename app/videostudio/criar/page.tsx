"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Download, X, ChevronDown } from "lucide-react"
import { CinemaSidebar } from "@/components/cinema-sidebar"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"

const MobileVersion = dynamic(() => import("./page-mobile"), { ssr: false })

// Example to show in result area
const EXAMPLE_SHOWCASE = {
  input: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/i2v-gen4_turbo-input.jpeg",
  output: "https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/i2v-gen4_turbo-output.mp4"
}

export default function CriarVideoPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return <MobileVersion />
  }

  const [selectedModel, setSelectedModel] = useState<"gen4_turbo" | "gen3a_turbo">("gen4_turbo")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [promptText, setPromptText] = useState("")
  const [aspectRatio, setAspectRatio] = useState<string>("1280:720")
  const [duration, setDuration] = useState<number>(5)
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showRatioDropdown, setShowRatioDropdown] = useState(false)
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultVideoRef = useRef<HTMLVideoElement>(null)

  // Model configurations
  const modelConfig = {
    gen4_turbo: {
      name: "Gen4 Turbo",
      description: "Latest generation, superior quality",
      color: "from-blue-500 to-purple-500",
      ratios: [
        { value: "1280:720", label: "16:9 Landscape" },
        { value: "720:1280", label: "9:16 Portrait" },
        { value: "1104:832", label: "4:3 Classic" },
        { value: "832:1104", label: "3:4 Portrait" },
        { value: "960:960", label: "1:1 Square" },
        { value: "1584:672", label: "21:9 Cinema" },
      ],
      durations: [5, 10],
      credits: (dur: number) => dur === 5 ? 25 : 50,
    },
    gen3a_turbo: {
      name: "Gen3a Turbo",
      description: "Cost-effective alternative",
      color: "from-green-500 to-emerald-500",
      ratios: [
        { value: "1280:768", label: "16:10 Landscape" },
        { value: "768:1280", label: "10:16 Portrait" },
      ],
      durations: [5, 10],
      credits: (dur: number) => dur === 5 ? 20 : 20,
    },
  }

  const currentConfig = modelConfig[selectedModel]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image too large (max 20MB)')
      return
    }

    setImageFile(file)
    setError(null)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!imageFile) return

    // Validate Gen3a requires prompt
    if (selectedModel === 'gen3a_turbo' && !promptText.trim()) {
      setError('Gen3a Turbo requires a prompt text')
      return
    }

    setError(null)
    setIsProcessing(true)
    setProgress(0)
    setTaskId(null)
    setCreditsUsed(null)

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(imageFile)
      
      await new Promise((resolve) => {
        reader.onload = resolve
      })

      const imageDataUri = reader.result as string

      setProgress(20)

      // Call our new professional API
      const response = await fetch('/api/videostudio/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          user_id: 'demo_user_' + Date.now(), // In production, use real user ID
          promptImage: imageDataUri,
          promptText: promptText.trim() || undefined,
          ratio: aspectRatio,
          duration: duration,
          seed: seed,
        }),
      })

      setProgress(40)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details?.join(', ') || 'Failed to generate video')
      }

      setTaskId(data.taskId)
      setCreditsUsed(data.credits.used)
      setProgress(60)

      // Poll task status
      await pollTaskStatus(data.taskId)
    } catch (err) {
      console.error('Generation error:', err)
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
          setResultUrl(data.output?.[0] || data.output)
          setIsProcessing(false)
          setProgress(100)
        } else if (data.status === 'FAILED') {
          setError(data.failure || 'Video generation failed')
          setIsProcessing(false)
          setProgress(0)
        } else if (attempts < maxAttempts) {
          attempts++
          setProgress(60 + (attempts / maxAttempts) * 35)
          setTimeout(checkStatus, 3000)
        } else {
          setError('Timeout - please try again')
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
    setTaskId(null)
    setCreditsUsed(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const estimatedCredits = currentConfig.credits(duration)

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <CinemaSidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full flex flex-col lg:flex-row">
          
          {/* LEFT COLUMN - Input */}
          <div className="w-full lg:w-1/2 border-r border-white/10 bg-zinc-950">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Image to Video</h2>
                  <p className="text-xs text-zinc-500 mt-1">{currentConfig.name}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-transparent border border-white/10">
                  <span className="text-sm font-medium text-white">{estimatedCredits}</span>
                  <span className="text-xs text-zinc-500">credits</span>
                </div>
              </div>

              {/* Model Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white hover:border-white/20 transition-all flex items-center justify-between"
                >
                  <span className="text-sm">{currentConfig.name}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-lg overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        setSelectedModel('gen4_turbo')
                        setShowModelDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-all"
                    >
                      <div className="font-medium">Gen4 Turbo</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Superior quality - 25/50 credits</div>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedModel('gen3a_turbo')
                        setShowModelDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-all border-t border-white/5"
                    >
                      <div className="font-medium">Gen3a Turbo</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Cost-effective - 20 credits</div>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Input Image {selectedModel === 'gen4_turbo' && <span className="text-red-500">*</span>}
                </label>
                
                {!imagePreview ? (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="w-12 h-12 text-white/40 mb-3 group-hover:text-white/60 transition-colors" />
                      <p className="text-white/80 font-medium mb-1">Upload image</p>
                      <p className="text-sm text-white/40">or drag and drop</p>
                      <p className="text-xs text-white/30 mt-2">Max 20MB • JPG, PNG, WebP</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    {!isProcessing && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-black/80 hover:bg-red-500 text-white border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex-1 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-white/20">
                        <p className="text-xs text-white/60">Ready to generate</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Prompt {selectedModel === 'gen3a_turbo' && <span className="text-red-500">*</span>}
                  <span className="text-zinc-500 text-xs ml-2">(1-1000 characters)</span>
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={selectedModel === 'gen3a_turbo' 
                    ? "Required: Describe the motion you want..." 
                    : "Optional: Describe the motion you want..."
                  }
                  className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm"
                  disabled={isProcessing}
                  maxLength={1000}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-zinc-500">
                    {selectedModel === 'gen3a_turbo' ? 'Required for Gen3a' : 'Optional for Gen4'}
                  </p>
                  <p className="text-xs text-zinc-500">{promptText.length}/1000</p>
                </div>
              </div>

              {/* Aspect Ratio Dropdown */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Aspect Ratio
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowRatioDropdown(!showRatioDropdown)}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white hover:border-white/20 transition-all flex items-center justify-between disabled:opacity-50"
                  >
                    <span className="text-sm">
                      {currentConfig.ratios.find(r => r.value === aspectRatio)?.label || aspectRatio}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </button>
                  
                  {showRatioDropdown && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-lg overflow-hidden z-50 max-h-64 overflow-y-auto"
                    >
                      {currentConfig.ratios.map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => {
                            setAspectRatio(ratio.value)
                            setShowRatioDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-all border-b border-white/5 last:border-b-0 ${
                            aspectRatio === ratio.value ? 'text-white bg-white/5' : 'text-zinc-400'
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Duration Dropdown */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duration
                  <span className="text-zinc-500 text-xs ml-2">
                    ({currentConfig.credits(duration)} credits)
                  </span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white hover:border-white/20 transition-all flex items-center justify-between disabled:opacity-50"
                  >
                    <span className="text-sm">{duration}s</span>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </button>
                  
                  {showDurationDropdown && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-lg overflow-hidden z-50"
                    >
                      {currentConfig.durations.map((dur) => (
                        <button
                          key={dur}
                          onClick={() => {
                            setDuration(dur)
                            setShowDurationDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-all border-b border-white/5 last:border-b-0 ${
                            duration === dur ? 'text-white bg-white/5' : 'text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{dur}s</span>
                            <span className="text-xs text-zinc-500">{currentConfig.credits(dur)} credits</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Advanced Options */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-white hover:text-blue-400 transition-colors list-none flex items-center gap-2">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  Advanced Options
                </summary>
                <div className="mt-4 space-y-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Seed (Optional)
                      <span className="text-zinc-500 text-xs ml-2">(0 - 4,294,967,295)</span>
                    </label>
                    <input
                      type="number"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Random"
                      min={0}
                      max={4294967295}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-zinc-500 mt-1">Use same seed for reproducible results</p>
                  </div>
                </div>
              </details>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-zinc-950 pb-4 border-t border-white/10">
                <button
                  onClick={handleReset}
                  disabled={!imageFile || isProcessing}
                  className="px-6 py-3 rounded-lg bg-transparent hover:bg-white/5 text-white font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/10"
                >
                  Reset
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!imageFile || isProcessing || (selectedModel === 'gen3a_turbo' && !promptText.trim())}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                      />
                      Generating...
                    </>
                  ) : (
                    'Generate Video'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Result */}
          <div className="w-full lg:w-1/2 bg-black">
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Result</h2>
                  {taskId && (
                    <p className="text-xs text-zinc-500 font-mono mt-1">Task: {taskId.substring(0, 8)}...</p>
                  )}
                </div>
                {resultUrl && (
                  <a
                    href={resultUrl}
                    download="duaia-video.mp4"
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-zinc-400 hover:text-white"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
              {creditsUsed && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-green-400 font-medium">{creditsUsed} credits used</span>
                </div>
              )}
            </div>

            {/* Result Area */}
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
                      <h3 className="text-xl font-semibold text-white mb-3">Creating</h3>
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
                ) : resultUrl ? (
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
                        src={resultUrl || ''}
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
                        href={resultUrl || ''}
                        download="duaia-generated-video.mp4"
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
                      <h3 className="text-lg font-semibold text-white mb-2">Example Output</h3>
                      <p className="text-sm text-zinc-500">See what you can create</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-3">Input Image</p>
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                          <img
                            src={EXAMPLE_SHOWCASE.input}
                            alt="Example input"
                            className="w-full aspect-video object-cover"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-zinc-500 mb-3">Generated Video</p>
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
                      <p className="text-xs text-zinc-600">Upload an image to get started</p>
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

