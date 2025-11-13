"use client"

import { useState, useRef } from "react"
import { Users, Upload, Video, ImageIcon, Download, Loader2, RotateCw, X, ChevronDown, Settings2, Sparkles } from "lucide-react"
import { VideoStudioNavbar } from "@/components/video-studio-navbar"
import { motion, AnimatePresence } from "framer-motion"

export default function PerformanceMobilePage() {
  const [characterFile, setCharacterFile] = useState<File | null>(null)
  const [characterPreview, setCharacterPreview] = useState<string | null>(null)
  const [characterType, setCharacterType] = useState<'image' | 'video'>('image')
  const [performanceFile, setPerformanceFile] = useState<File | null>(null)
  const [performancePreview, setPerformancePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'character' | 'performance' | 'result'>('character')
  const [credits, setCredits] = useState(150)

  const characterInputRef = useRef<HTMLInputElement>(null)
  const performanceInputRef = useRef<HTMLInputElement>(null)

  const characterExamples = [
    { img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", name: "Character 1" },
    { img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", name: "Character 2" },
    { img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Princess", name: "Character 3" },
    { img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuddles", name: "Character 4" },
    { img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gizmo", name: "Character 5" },
    { img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Buster", name: "Character 6" },
  ]

  const handleCharacterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setError('Please select an image or video')
      return
    }

    setCharacterFile(file)
    setCharacterType(isImage ? 'image' : 'video')
    setError(null)

    const url = URL.createObjectURL(file)
    setCharacterPreview(url)
    setCurrentStep('performance')
  }

  const handlePerformanceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Performance must be a video')
      return
    }

    setPerformanceFile(file)
    setError(null)

    const url = URL.createObjectURL(file)
    setPerformancePreview(url)
  }

  const handleGenerate = async () => {
    if (!characterFile || !performanceFile) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setCurrentStep('result')

    try {
      // Simulate API call
      setProgress(30)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProgress(60)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProgress(90)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setResultUrl(performancePreview)
      setProgress(100)
      setCredits(prev => prev - 30)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating')
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCharacterFile(null)
    setCharacterPreview(null)
    setPerformanceFile(null)
    setPerformancePreview(null)
    setResultUrl(null)
    setIsProcessing(false)
    setError(null)
    setProgress(0)
    setCurrentStep('character')
    if (characterInputRef.current) characterInputRef.current.value = ''
    if (performanceInputRef.current) performanceInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col">
      {/* iOS Status Bar */}
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
            <h1 className="text-lg font-bold">Act-Two</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Character Performance</p>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-pink-600 rounded-full">
            {credits} Credits
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex-1 h-1 rounded-full transition-all ${
            currentStep === 'character' ? 'bg-pink-500' : 'bg-white/20'
          }`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${
            currentStep === 'performance' ? 'bg-pink-500' : 'bg-white/20'
          }`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${
            currentStep === 'result' ? 'bg-pink-500' : 'bg-white/20'
          }`} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {/* STEP 1: Choose Character */}
          {currentStep === 'character' && !characterPreview && (
            <motion.div
              key="character"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 pb-safe-bottom"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mb-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">Choose your character</h2>
                <p className="text-sm text-zinc-400">Select or upload a character to animate</p>
              </motion.div>

              {/* Character Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setCharacterType('image')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    characterType === 'image'
                      ? 'bg-white/15 text-white border-2 border-white/30'
                      : 'bg-white/5 text-zinc-400 border-2 border-transparent'
                  }`}
                >
                  <ImageIcon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">Image</div>
                </button>
                <button
                  onClick={() => setCharacterType('video')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    characterType === 'video'
                      ? 'bg-white/15 text-white border-2 border-white/30'
                      : 'bg-white/5 text-zinc-400 border-2 border-transparent'
                  }`}
                >
                  <Video className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">Video</div>
                </button>
              </div>

              {/* Example Characters Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {characterExamples.map((char, idx) => (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-pink-500/50 transition-all"
                  >
                    <img src={char.img} alt={char.name} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>

              {/* Upload Button */}
              <label htmlFor="character-upload" className="block">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-6 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
                >
                  <Upload className="w-10 h-10 text-white/40 mb-2" />
                  <p className="text-white font-medium">Upload {characterType}</p>
                  <p className="text-sm text-white/40">or drag and drop</p>
                </motion.div>
                <input
                  ref={characterInputRef}
                  id="character-upload"
                  type="file"
                  className="hidden"
                  accept={characterType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleCharacterSelect}
                />
              </label>
            </motion.div>
          )}

          {/* STEP 2: Add Performance */}
          {currentStep === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 pb-safe-bottom space-y-4"
            >
              {/* Character Preview */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Character</label>
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                  {characterType === 'image' ? (
                    <img
                      src={characterPreview!}
                      alt="Character"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <video
                      src={characterPreview!}
                      className="w-full h-48 object-cover"
                      muted
                      playsInline
                    />
                  )}
                  <button
                    onClick={() => setCurrentStep('character')}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Performance Upload */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Add a driving performance
                </label>
                {!performancePreview ? (
                  <label htmlFor="performance-upload" className="block">
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="w-full aspect-video border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Video className="w-12 h-12 text-white/40 mb-2" />
                      <p className="text-white font-medium mb-1">Upload video</p>
                      <p className="text-sm text-white/40">Performance reference</p>
                    </motion.div>
                    <input
                      ref={performanceInputRef}
                      id="performance-upload"
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handlePerformanceSelect}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <video
                      src={performancePreview}
                      className="w-full aspect-video object-cover"
                      controls
                      playsInline
                    />
                    <button
                      onClick={() => {
                        setPerformanceFile(null)
                        setPerformancePreview(null)
                        if (performanceInputRef.current) performanceInputRef.current.value = ''
                      }}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

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

          {/* STEP 3: Result */}
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
                      className="absolute inset-0 rounded-full border-4 border-pink-500/20 border-t-pink-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-pink-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Transferring performance...</h3>
                    <p className="text-sm text-zinc-400 mb-4">Applying facial expressions and gestures</p>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 to-red-500"
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl blur-xl opacity-30" />
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                      <video
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
                      download="duaia-act-two.mp4"
                      className="block w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold text-center active:from-pink-600 active:to-red-600 transition-all flex items-center justify-center gap-2"
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

      {/* Bottom Bar */}
      {currentStep === 'performance' && performanceFile && !isProcessing && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="flex-shrink-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-4 pb-safe-bottom"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            className="w-full px-6 py-4 rounded-2xl bg-pink-600 active:bg-pink-700 text-white font-bold transition-all"
          >
            Generate
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
