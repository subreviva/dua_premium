"use client"

import { useState, useRef } from "react"
import { Sparkles, Upload, Download, RotateCw, X, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function QualidadeMobilePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'upload' | 'settings' | 'result'>('upload')
  const [credits, setCredits] = useState(150)

  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Please select a video file')
      return
    }

    setVideoFile(file)
    setError(null)

    const url = URL.createObjectURL(file)
    setVideoPreview(url)
    setCurrentStep('settings')
  }

  const handleUpscale = async () => {
    if (!videoFile) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setCurrentStep('result')

    try {
      // Simulate API call with progress
      setProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setProgress(40)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setProgress(60)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setProgress(90)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setResultUrl(videoPreview)
      setProgress(100)
      setCredits(prev => prev - 50)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error upscaling video')
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setResultUrl(null)
    setIsProcessing(false)
    setError(null)
    setProgress(0)
    setCurrentStep('upload')
    if (videoInputRef.current) videoInputRef.current.value = ''
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
            <h1 className="text-lg font-bold">Upscale v1</h1>
            <p className="text-xs text-zinc-500 mt-0.5">4K Enhancement</p>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-full">
            {credits} Credits
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex-1 h-1 rounded-full transition-all ${
            currentStep === 'upload' ? 'bg-orange-500' : 'bg-white/20'
          }`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${
            currentStep === 'settings' ? 'bg-orange-500' : 'bg-white/20'
          }`} />
          <div className={`flex-1 h-1 rounded-full transition-all ${
            currentStep === 'result' ? 'bg-orange-500' : 'bg-white/20'
          }`} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {/* STEP 1: Upload Video */}
          {currentStep === 'upload' && !videoPreview && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col items-center justify-center p-6 pb-safe-bottom"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="mb-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Enhance to 4K</h2>
                <p className="text-zinc-400">Upload your video for AI-powered upscaling</p>
              </motion.div>

              <label htmlFor="video-upload" className="w-full max-w-md">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="w-full aspect-[4/3] border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-white/40 mb-3" />
                  <p className="text-white font-medium text-lg mb-1">Upload Video</p>
                  <p className="text-sm text-white/40">or drag and drop here</p>
                  <p className="text-xs text-white/30 mt-2">MP4, MOV, WebM</p>
                </motion.div>
                <input
                  ref={videoInputRef}
                  id="video-upload"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileSelect}
                />
              </label>

              {/* Features */}
              <div className="mt-8 space-y-3 max-w-md">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">4K Resolution</div>
                    <div className="text-xs text-zinc-500">Up to 3840x2160</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Fast Processing</div>
                    <div className="text-xs text-zinc-500">~2-3 minutes</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Settings / Preview */}
          {currentStep === 'settings' && videoPreview && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 pb-safe-bottom space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Original Video</label>
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <video
                    src={videoPreview}
                    className="w-full aspect-video object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Settings Card */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Enhancement Settings
                </h3>
                
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div>
                    <div className="font-medium text-sm">Target Resolution</div>
                    <div className="text-xs text-zinc-500">4K Ultra HD</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                    3840x2160
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div>
                    <div className="font-medium text-sm">Enhancement Mode</div>
                    <div className="text-xs text-zinc-500">AI-powered upscaling</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                    Advanced
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-sm">Credit Cost</div>
                    <div className="text-xs text-zinc-500">Per video</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                    50 Credits
                  </div>
                </div>
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
                      className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Enhancing to 4K...</h3>
                    <p className="text-sm text-zinc-400 mb-4">AI is analyzing and upscaling your video</p>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-30" />
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
                  
                  {/* Result Info */}
                  <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Enhanced to</span>
                      <span className="font-bold text-orange-400">4K Ultra HD</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <motion.a
                      whileTap={{ scale: 0.98 }}
                      href={resultUrl}
                      download="duaia-4k-upscale.mp4"
                      className="block w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-center active:from-orange-600 active:to-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download 4K Video
                    </motion.a>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="block w-full px-6 py-4 rounded-2xl bg-white/10 active:bg-white/20 text-white font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                      <RotateCw className="w-5 h-5" />
                      Enhance Another
                    </motion.button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Bar */}
      {currentStep === 'settings' && videoFile && !isProcessing && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="flex-shrink-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-4 pb-safe-bottom"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleUpscale}
            className="w-full px-6 py-4 rounded-2xl bg-orange-600 active:bg-orange-700 text-white font-bold transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Enhance to 4K
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
