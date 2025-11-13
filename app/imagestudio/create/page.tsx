"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Sparkles, 
  Image as ImageIcon, 
  Wand2,
  ArrowRight,
  Download,
  Share2,
  Heart,
  X,
  Settings2,
  Maximize2,
  Library,
  ChevronDown,
  Zap
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ImageSidebar } from "@/components/image-sidebar"

const styles = [
  { id: "photorealistic", name: "Fotorrealista" },
  { id: "illustration", name: "Ilustração" },
  { id: "minimalist", name: "Minimalista" },
  { id: "3d", name: "3D Render" },
  { id: "artistic", name: "Artístico" },
  { id: "cinematic", name: "Cinematográfico" },
]

const imageModels = [
  { 
    id: "imagen-4.0-fast-generate-001", 
    name: "Imagen 4 Fast", 
    description: "Geração rápida 1K",
    credits: 15,
    speed: "~2-3s"
  },
  { 
    id: "imagen-4.0-generate-001", 
    name: "Imagen 4 Standard", 
    description: "Recomendado - Melhor custo-benefício",
    credits: 25,
    speed: "~5-8s",
    recommended: true
  },
  { 
    id: "imagen-4.0-ultra-generate-001", 
    name: "Imagen 4 Ultra", 
    description: "Máxima qualidade 4K Ultra HD",
    credits: 35,
    speed: "~10-15s"
  },
]

const aspectRatios = [
  { id: "1:1", label: "Quadrado", width: "1024", height: "1024" },
  { id: "16:9", label: "Paisagem", width: "1792", height: "1024" },
  { id: "9:16", label: "Retrato", width: "1024", height: "1792" },
  { id: "4:3", label: "Clássico", width: "1536", height: "1152" },
]

const promptSuggestions = [
  "Um pôr do sol vibrante sobre montanhas nevadas, fotografia profissional",
  "Ilustração digital de um dragão místico em estilo anime moderno",
  "Design minimalista de logótipo para marca de tecnologia",
  "Render 3D de produto futurista com iluminação dramática",
  "Paisagem urbana cyberpunk com luzes neon à noite",
  "Retrato artístico em aquarela de pessoa contemplativa"
]

export default function ImageStudioCreatePage() {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("photorealistic")
  const [selectedModel, setSelectedModel] = useState("imagen-4.0-generate-001")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showStyleDropdown, setShowStyleDropdown] = useState(false)
  const [showRatioDropdown, setShowRatioDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleDownload = () => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `dua-imagem-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    // Simulação - substituir com API real
    setTimeout(() => {
      const imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1024&h=1024&fit=crop"
      setGeneratedImage(imageUrl)
      
      // Salvar imagem no localStorage
      const newImage = {
        id: `img-${Date.now()}`,
        url: imageUrl,
        prompt: prompt,
        style: selectedStyle,
        aspectRatio: aspectRatio,
        timestamp: new Date().toISOString(),
        liked: false
      }
      
      try {
        const savedImages = localStorage.getItem("generated-images")
        const images = savedImages ? JSON.parse(savedImages) : []
        images.unshift(newImage) // Adicionar no início
        localStorage.setItem("generated-images", JSON.stringify(images))
        console.log("✅ Imagem salva na biblioteca:", newImage.id)
      } catch (error) {
        console.error("❌ Erro ao salvar imagem:", error)
      }
      
      setIsGenerating(false)
    }, 3000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar */}
      <div className="hidden md:block">
        <ImageSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 🎨 MOBILE & DESKTOP: Layout Premium */}
        <div className="flex-1 overflow-y-auto pb-[120px] md:pb-0">
          
          {/* Hero Section com Imagem de Fundo */}
          <div className="relative min-h-[240px] md:min-h-[340px] overflow-hidden">
            {/* Background Image - Centralizada no rosto */}
            <div className="absolute inset-0">
              <Image 
                src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/eca9461e-1416-44c4-88d6-25446f39fc4c.png"
                alt="Background"
                fill
                className="object-cover object-center"
                style={{ objectPosition: '50% 30%' }}
                priority
              />
              {/* Overlay sutil sem gradiente forte */}
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Título */}
                <h1 className="text-[32px] md:text-[56px] leading-[1.1] font-semibold tracking-tight text-white mb-3 md:mb-4 drop-shadow-2xl">
                  Cria Imagens
                  <br />
                  Profissionais
                </h1>
                
                <p className="text-[14px] md:text-[17px] text-white/80 font-light leading-relaxed mb-5 md:mb-7 max-w-[600px] drop-shadow-lg">
                  Transforma as tuas ideias em imagens deslumbrantes com inteligência artificial de última geração.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Creation Area */}
          <div className="relative bg-gradient-to-b from-black via-zinc-950 to-black">
            <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12">
              
              {/* Grid Layout: Prompt & Preview */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                
                {/* Left: Prompt Area */}
                <div className="space-y-6">
                  
                  {/* Prompt Input Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 md:p-8"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#8B7355] flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-white" strokeWidth={0.75} />
                      </div>
                      <h2 className="text-xl font-semibold text-white">Descreve a tua visão</h2>
                    </div>

                    <Textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Um pôr do sol vibrante sobre montanhas, fotografia profissional em alta resolução..."
                      className="min-h-[180px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 resize-none focus:border-[#8B7355]/50 transition-all text-[15px]"
                    />

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        {prompt.length} caracteres
                      </span>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs text-white/60 hover:text-white/90 flex items-center gap-1 transition-colors"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        Opções avançadas
                      </button>
                    </div>
                  </motion.div>

                  {/* Style Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 md:p-8"
                  >
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#8B7355]" strokeWidth={0.75} />
                      Estilo
                    </h3>
                    
                    {/* Mobile: Dropdown */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                        className="w-full p-3.5 rounded-xl border border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20 flex items-center justify-between text-white/90 transition-all"
                      >
                        <span className="text-[15px] font-medium">
                          {styles.find(s => s.id === selectedStyle)?.name}
                        </span>
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform",
                          showStyleDropdown && "rotate-180"
                        )} strokeWidth={0.75} />
                      </button>
                      
                      <AnimatePresence>
                        {showStyleDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-2"
                          >
                            {styles.map((style) => (
                              <button
                                key={style.id}
                                onClick={() => {
                                  setSelectedStyle(style.id)
                                  setShowStyleDropdown(false)
                                }}
                                className={cn(
                                  "w-full p-3.5 rounded-lg border transition-all text-left",
                                  selectedStyle === style.id
                                    ? "border-[#8B7355]/40 bg-[#8B7355]/5 text-white"
                                    : "border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20 text-white/70"
                                )}
                              >
                                <span className="text-[15px] font-medium">
                                  {style.name}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Desktop: Grid */}
                    <div className="hidden md:grid grid-cols-2 gap-3">
                      {styles.map((style) => (
                        <motion.button
                          key={style.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedStyle(style.id)}
                          className={cn(
                            "relative p-4 rounded-xl border transition-all duration-300 group text-left backdrop-blur-sm",
                            selectedStyle === style.id
                              ? "border-[#8B7355]/40 bg-[#8B7355]/5"
                              : "border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20"
                          )}
                        >
                          <span className="text-[15px] font-medium text-white/90">
                            {style.name}
                          </span>
                          
                          {selectedStyle === style.id && (
                            <motion.div
                              layoutId="selectedStyle"
                              className="absolute inset-0 border border-[#8B7355]/60 rounded-xl"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Aspect Ratio */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 md:p-8"
                  >
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <Maximize2 className="w-5 h-5 text-[#8B7355]" strokeWidth={0.75} />
                      Proporção
                    </h3>
                    
                    {/* Mobile: Dropdown */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setShowRatioDropdown(!showRatioDropdown)}
                        className="w-full p-3.5 rounded-xl border border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20 flex items-center justify-between text-white/90 transition-all"
                      >
                        <span className="text-[15px] font-medium">
                          {aspectRatios.find(r => r.id === aspectRatio)?.label} ({aspectRatio})
                        </span>
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform",
                          showRatioDropdown && "rotate-180"
                        )} strokeWidth={0.75} />
                      </button>
                      
                      <AnimatePresence>
                        {showRatioDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-2"
                          >
                            {aspectRatios.map((ratio) => (
                              <button
                                key={ratio.id}
                                onClick={() => {
                                  setAspectRatio(ratio.id)
                                  setShowRatioDropdown(false)
                                }}
                                className={cn(
                                  "w-full p-3.5 rounded-lg border transition-all text-left",
                                  aspectRatio === ratio.id
                                    ? "border-[#8B7355]/40 bg-[#8B7355]/5 text-white"
                                    : "border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20 text-white/70"
                                )}
                              >
                                <span className="text-[15px] font-medium">
                                  {ratio.label} ({ratio.id})
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Desktop: Grid */}
                    <div className="hidden md:grid grid-cols-2 gap-3">
                      {aspectRatios.map((ratio) => (
                        <motion.button
                          key={ratio.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setAspectRatio(ratio.id)}
                          className={cn(
                            "relative p-4 rounded-xl border transition-all duration-300 group text-left backdrop-blur-sm",
                            aspectRatio === ratio.id
                              ? "border-[#8B7355]/40 bg-[#8B7355]/5"
                              : "border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20"
                          )}
                        >
                          <div className="text-sm font-medium text-white/90 mb-1">
                            {ratio.label}
                          </div>
                          <div className="text-xs text-white/50">
                            {ratio.width} × {ratio.height}
                          </div>
                          
                          {aspectRatio === ratio.id && (
                            <motion.div
                              layoutId="selectedRatio"
                              className="absolute inset-0 border border-[#8B7355]/60 rounded-xl"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Model Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 md:p-8"
                  >
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#8B7355]" strokeWidth={0.75} />
                      Modelo de IA
                    </h3>
                    
                    {/* Mobile: Dropdown */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                        className="w-full p-3.5 rounded-xl border border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20 flex items-center justify-between text-white/90 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium">
                            {imageModels.find(m => m.id === selectedModel)?.name}
                          </span>
                          <span className="px-2 py-0.5 bg-[#8B7355]/20 border border-[#8B7355]/30 rounded-lg text-xs text-[#8B7355]">
                            {imageModels.find(m => m.id === selectedModel)?.credits} créditos
                          </span>
                        </div>
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform",
                          showModelDropdown && "rotate-180"
                        )} strokeWidth={0.75} />
                      </button>
                      
                      <AnimatePresence>
                        {showModelDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-2"
                          >
                            {imageModels.map((model) => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model.id)
                                  setShowModelDropdown(false)
                                }}
                                className={cn(
                                  "w-full p-3.5 rounded-lg border transition-all text-left",
                                  selectedModel === model.id
                                    ? "border-[#8B7355]/40 bg-[#8B7355]/5"
                                    : "border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20"
                                )}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[15px] font-medium text-white">
                                    {model.name}
                                  </span>
                                  <span className="px-2 py-0.5 bg-[#8B7355]/20 border border-[#8B7355]/30 rounded-lg text-xs text-[#8B7355]">
                                    {model.credits} créditos
                                  </span>
                                </div>
                                <p className="text-xs text-white/50">{model.description}</p>
                                <p className="text-xs text-white/40 mt-1">{model.speed}</p>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Desktop: Grid */}
                    <div className="hidden md:grid grid-cols-2 gap-3">
                      {imageModels.map((model) => (
                        <motion.button
                          key={model.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedModel(model.id)}
                          className={cn(
                            "relative p-4 rounded-xl border transition-all duration-300 group text-left backdrop-blur-sm",
                            selectedModel === model.id
                              ? "border-[#8B7355]/40 bg-[#8B7355]/5"
                              : "border-white/[0.06] bg-transparent hover:bg-white/[0.02] hover:border-[#8B7355]/20"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[15px] font-medium text-white/90">
                              {model.name}
                            </span>
                            {model.recommended && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-400">⭐</span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 mb-2">{model.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40">{model.speed}</span>
                            <span className="px-2 py-1 bg-[#8B7355]/20 border border-[#8B7355]/30 rounded-lg text-xs text-[#8B7355] font-medium">
                              {model.credits} créditos
                            </span>
                          </div>
                          
                          {selectedModel === model.id && (
                            <motion.div
                              layoutId="selectedModel"
                              className="absolute inset-0 border border-[#8B7355]/60 rounded-xl"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Generate Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className={cn(
                      "w-full py-4 rounded-xl font-medium text-[16px] flex items-center justify-center gap-3 transition-all duration-300 border backdrop-blur-sm",
                      isGenerating
                        ? "bg-transparent border-white/[0.06] text-white/30 cursor-not-allowed"
                        : "bg-[#8B7355]/10 border-[#8B7355]/30 hover:bg-[#8B7355]/20 hover:border-[#8B7355]/50 text-white"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" strokeWidth={0.75} />
                        </motion.div>
                        A gerar...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" strokeWidth={0.75} />
                        Gerar Imagem
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-lg">
                          <Zap className="w-3.5 h-3.5" strokeWidth={0.75} />
                          <span className="text-sm font-bold">{imageModels.find(m => m.id === selectedModel)?.credits}</span>
                        </div>
                        <ArrowRight className="w-5 h-5" strokeWidth={0.75} />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Right: Preview Area */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 md:p-8"
                >
                  <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#8B7355]" strokeWidth={0.75} />
                    Pré-visualização
                  </h3>

                  <div className={cn(
                    "relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.08]",
                    aspectRatio === "1:1" && "aspect-square",
                    aspectRatio === "16:9" && "aspect-video",
                    aspectRatio === "9:16" && "aspect-[9/16]",
                    aspectRatio === "4:3" && "aspect-[4/3]"
                  )}>
                    {isGenerating ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                        {/* Animated dot pattern grid */}
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle, rgba(139, 115, 85, 0.3) 1px, transparent 1px)',
                          backgroundSize: '32px 32px',
                          animation: 'dotPulse 2s ease-in-out infinite'
                        }} />
                        
                        {/* Center loading text */}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 rounded-2xl bg-[#8B7355]/10 border border-[#8B7355]/30 flex items-center justify-center"
                          >
                            <Sparkles className="w-8 h-8 text-[#8B7355]" strokeWidth={0.75} />
                          </motion.div>
                          <div className="text-center">
                            <p className="text-white font-medium mb-1">A gerar imagem...</p>
                            <p className="text-white/40 text-sm">Isto pode demorar alguns segundos</p>
                          </div>
                        </div>
                        
                        <style jsx>{`
                          @keyframes dotPulse {
                            0%, 100% { opacity: 0.3; }
                            50% { opacity: 0.6; }
                          }
                        `}</style>
                      </div>
                    ) : generatedImage ? (
                      <>
                        <div 
                          className="cursor-pointer"
                          onClick={() => setShowFullImage(true)}
                        >
                          <Image
                            src={generatedImage}
                            alt="Imagem gerada"
                            fill
                            className="object-contain"
                          />
                        </div>
                        
                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDownload}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                          >
                            <Download className="w-5 h-5 text-white" strokeWidth={0.75} />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowFullImage(true)}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                          >
                            <Maximize2 className="w-5 h-5 text-white" strokeWidth={0.75} />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                          >
                            <Heart className="w-5 h-5 text-white" strokeWidth={0.75} />
                          </motion.button>
                        </div>

                        {/* Success message and library link */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-4 left-4 right-4"
                        >
                          <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-4">
                            <p className="text-green-400 text-sm font-medium mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              Imagem salva na biblioteca!
                            </p>
                            <Link href="/imagestudio/library">
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                              >
                                <Library className="w-4 h-4" strokeWidth={0.75} />
                                Ver Biblioteca
                              </motion.button>
                            </Link>
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#8B7355]/10 border border-white/10 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white/30" strokeWidth={0.75} />
                        </div>
                        <div>
                          <p className="text-white/60 font-medium mb-2">
                            A tua imagem aparecerá aqui
                          </p>
                          <p className="text-white/40 text-sm">
                            Descreve o que queres criar e clica em gerar
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Prompt Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.05] p-4 md:p-8"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#8B7355]" strokeWidth={0.75} />
                  Sugestões de Prompt
                </h3>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {promptSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3.5 rounded-lg bg-transparent border border-white/[0.05] hover:border-[#8B7355]/20 hover:bg-white/[0.02] transition-all duration-300 text-left group"
                    >
                      <p className="text-sm text-white/70 group-hover:text-white/90 line-clamp-2 transition-colors">
                        {suggestion}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Style Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-2xl border-t border-white/[0.08]">
        <div className="safe-area-inset-bottom">
          <div className="flex items-center justify-around px-6 py-3">
            {/* Criar Button */}
            <Link href="/imagestudio/create" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full py-3.5 rounded-xl bg-[#8B7355]/10 border border-[#8B7355]/30 hover:bg-[#8B7355]/20 transition-all duration-300 flex flex-col items-center gap-1.5"
              >
                <Sparkles className="w-5 h-5 text-[#8B7355]" strokeWidth={0.75} />
                <span className="text-xs font-medium text-[#8B7355]">Criar</span>
              </motion.button>
            </Link>

            <div className="w-3" />

            {/* Biblioteca Button */}
            <Link href="/imagestudio/library" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all duration-300 flex flex-col items-center gap-1.5"
              >
                <Library className="w-5 h-5 text-white/70" strokeWidth={0.75} />
                <span className="text-xs font-medium text-white/70">Biblioteca</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Full Screen Image */}
      <AnimatePresence>
        {showFullImage && generatedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowFullImage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" strokeWidth={0.75} />
              </button>

              {/* Image container with aspect ratio */}
              <div className={cn(
                "relative w-full mx-auto overflow-hidden rounded-2xl border border-white/10",
                aspectRatio === "1:1" && "aspect-square max-w-4xl",
                aspectRatio === "16:9" && "aspect-video",
                aspectRatio === "9:16" && "aspect-[9/16] max-w-2xl",
                aspectRatio === "4:3" && "aspect-[4/3] max-w-5xl"
              )}>
                <Image
                  src={generatedImage}
                  alt="Imagem em tela cheia"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="px-6 py-3 bg-[#8B7355]/10 border border-[#8B7355]/30 hover:bg-[#8B7355]/20 hover:border-[#8B7355]/50 rounded-xl text-white font-medium transition-all duration-300 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" strokeWidth={0.75} />
                  Download
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl text-white font-medium transition-all duration-300 flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" strokeWidth={0.75} />
                  Partilhar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
