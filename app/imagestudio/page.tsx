"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  Wand2,
  Sparkles,
  ChevronDown,
  Palette,
  Camera,
  Layers,
  Zap,
  FileText,
  Send,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Loader2,
} from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { ImageModal } from "@/components/ui/image-modal"
import { RevealText } from "@/components/ui/reveal-text"
import { useImagenApi, type ImagenModel, type ImagenConfig } from "@/hooks/useImagenApi"

interface AutoResizeProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`
  }, [minHeight])

  return { textareaRef, adjustHeight }
}

interface GalleryImage {
  id: number
  title: string
  prompt: string
  likes: number
  comments: number
  views: string
  image: string
  user: {
    name: string
    avatar: string
  }
  timestamp: string
  isLiked?: boolean
}

export default function ImageStudioPage() {
  const isMobile = useIsMobile()
  const imagenApi = useImagenApi()
  
  const [prompt, setPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState<ImagenModel>("standard")
  const [selectedStyle, setSelectedStyle] = useState("photorealistic")
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>("1:1")
  const [resolution, setResolution] = useState<'1K' | '2K'>("2K")
  const [numVariations, setNumVariations] = useState(4)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<any[]>([])
  const [generatedImage, setGeneratedImage] = useState<{
    url: string
    prompt: string
    width: number
    height: number
    settings: {
      model: string
      style: string
      aspectRatio: string
      resolution: string
    }
    seed: string
    timestamp: string
  } | null>(null)

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 200,
    maxHeight: 400,
  })

  const styles = [
    { id: "photorealistic", name: "Fotorrealista", icon: Camera },
    { id: "illustration", name: "Ilustração", icon: Palette },
    { id: "minimalist", name: "Minimalista", icon: Sparkles },
    { id: "product", name: "Produto", icon: Camera },
    { id: "comic", name: "Quadrinhos", icon: Layers },
    { id: "3d", name: "3D Render", icon: Zap },
  ]

  const promptTemplates = [
    {
      name: "Cena Fotorrealista",
      template:
        "Uma fotografia profissional de [ASSUNTO], capturada com câmera DSLR, lente 50mm f/1.8, iluminação natural suave, composição equilibrada, alta resolução, detalhes nítidos",
    },
    {
      name: "Ilustração Estilizada",
      template:
        "Uma ilustração digital vibrante de [ASSUNTO], estilo arte conceitual, cores saturadas, traços limpos, composição dinâmica, arte digital premium",
    },
    {
      name: "Logotipo com Texto",
      template:
        "Design de logotipo moderno e minimalista para [MARCA], tipografia legível, formas geométricas simples, paleta de cores profissional, fundo transparente",
    },
    {
      name: "Mockup de Produto",
      template:
        "Fotografia de produto profissional de [PRODUTO], fundo branco limpo, iluminação de estúdio, sombras suaves, alta qualidade comercial, detalhes precisos",
    },
  ]

  const [featuredImages, setFeaturedImages] = useState<GalleryImage[]>([
    {
      id: 1,
      title: "Deep Sea Adventure",
      prompt: "An isometric cross-section of the deep sea, showing a diver mid-dive...",
      likes: 421,
      comments: 38,
      views: "12.5K",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1200&fit=crop",
      user: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?img=1" },
      timestamp: "2h ago",
      isLiked: false,
    },
    {
      id: 2,
      title: "Neon Cyberpunk City",
      prompt: "Cyberpunk cityscape at night with neon lights...",
      likes: 389,
      comments: 42,
      views: "10.2K",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=800&fit=crop",
      user: { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=12" },
      timestamp: "5h ago",
      isLiked: false,
    },
    {
      id: 3,
      title: "Abstract Gradient",
      prompt: "Smooth gradient abstract composition with flowing colors...",
      likes: 356,
      comments: 29,
      views: "9.8K",
      image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop",
      user: { name: "Maya Patel", avatar: "https://i.pravatar.cc/150?img=5" },
      timestamp: "8h ago",
      isLiked: false,
    },
    {
      id: 4,
      title: "Futuristic Portrait",
      prompt: "Portrait with futuristic elements and holographic effects...",
      likes: 334,
      comments: 51,
      views: "8.9K",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=800&fit=crop",
      user: { name: "Jordan Kim", avatar: "https://i.pravatar.cc/150?img=8" },
      timestamp: "12h ago",
      isLiked: false,
    },
    {
      id: 5,
      title: "Surreal Landscape",
      prompt: "Surreal landscape with floating islands and dreamy atmosphere...",
      likes: 312,
      comments: 33,
      views: "8.1K",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=1200&fit=crop",
      user: { name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=9" },
      timestamp: "1d ago",
      isLiked: false,
    },
    {
      id: 6,
      title: "Digital Art Waves",
      prompt: "Abstract digital art with flowing waves and vibrant colors...",
      likes: 298,
      comments: 27,
      views: "7.6K",
      image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&h=675&fit=crop",
      user: { name: "Lucas Santos", avatar: "https://i.pravatar.cc/150?img=13" },
      timestamp: "1d ago",
      isLiked: false,
    },
    {
      id: 7,
      title: "3D Abstract Render",
      prompt: "3D rendered abstract shapes with metallic textures...",
      likes: 276,
      comments: 19,
      views: "7.1K",
      image: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800&h=600&fit=crop",
      user: { name: "Sophia Lee", avatar: "https://i.pravatar.cc/150?img=10" },
      timestamp: "2d ago",
      isLiked: false,
    },
    {
      id: 8,
      title: "Minimalist Design",
      prompt: "Clean minimalist design with geometric shapes...",
      likes: 254,
      comments: 22,
      views: "6.8K",
      image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=800&fit=crop",
      user: { name: "Noah Brown", avatar: "https://i.pravatar.cc/150?img=14" },
      timestamp: "2d ago",
      isLiked: false,
    },
    {
      id: 9,
      title: "Colorful Composition",
      prompt: "Vibrant colorful abstract composition with bold shapes...",
      likes: 241,
      comments: 16,
      views: "6.3K",
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=1200&fit=crop",
      user: { name: "Olivia Martinez", avatar: "https://i.pravatar.cc/150?img=16" },
      timestamp: "3d ago",
      isLiked: false,
    },
  ])

  const handleLike = (imageId: number) => {
    setFeaturedImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              isLiked: !img.isLiked,
              likes: img.isLiked ? img.likes - 1 : img.likes + 1,
            }
          : img,
      ),
    )
  }

  const handleTemplateSelect = (template: string) => {
    setPrompt(template)
    adjustHeight()
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return
    }

    try {
      console.log(`🎨 Gerando imagens com Imagen API...`)

      const config: ImagenConfig = {
        numberOfImages: numVariations,
        aspectRatio,
        personGeneration: 'allow_adult',
      }

      // Adicionar imageSize apenas para Standard e Ultra
      if (selectedModel === 'standard' || selectedModel === 'ultra') {
        config.imageSize = resolution
      }

      const images = await imagenApi.generateImages(prompt, selectedModel, config)
      
      setGeneratedImages(images)

      // Abrir modal com primeira imagem
      if (images.length > 0) {
        const firstImage = images[0]
        setGeneratedImage({
          url: firstImage.url,
          prompt: firstImage.prompt,
          width: 1024,
          height: 1024,
          settings: {
            model: selectedModel,
            style: styles.find((s) => s.id === selectedStyle)?.name || selectedStyle,
            aspectRatio,
            resolution,
          },
          seed: Math.random().toString(36).substring(2, 15),
          timestamp: new Date().toLocaleString("pt-PT"),
        })
        setIsModalOpen(true)
      }

      console.log(`✅ ${images.length} imagens geradas com sucesso`)
    } catch (error: any) {
      console.error('❌ Erro ao gerar imagens:', error)
      alert(`Erro: ${error.message}`)
    }
  }

  return (
    <BeamsBackground intensity="strong">
      <div className="relative z-10 min-h-screen flex flex-col">
        <PremiumNavbar credits={100} showBackButton={true} backLink="/" variant="default" />

        {/* Header Premium - Mais compacto */}
        <section className={cn(
          "relative",
          isMobile ? "pt-16 pb-6 px-6" : "pt-12 pb-8 px-6"
        )}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-3",
              isMobile ? "text-4xl" : "text-5xl"
            )}>
              Image Studio
            </h1>
            <p className={cn(
              "text-white/60 leading-relaxed",
              isMobile ? "text-sm px-2" : "text-base max-w-2xl mx-auto"
            )}>
              Geração pura com Google Imagen • Para edição use o{" "}
              <a href="/designstudio" className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-400/30">
                Design Studio
              </a>
            </p>
          </div>
        </section>

        {/* Main Content - Layout Premium */}
        <main className={cn(
          "flex-1 flex flex-col items-center pb-safe",
          isMobile ? "px-4 pb-6" : "px-6 pb-8"
        )}>
          <div className={cn(
            "w-full",
            isMobile ? "max-w-full" : "max-w-4xl"
          )}>
            {/* Card Premium Glassmorphism */}
            <div className={cn(
              "relative backdrop-blur-3xl border shadow-2xl overflow-hidden",
              isMobile 
                ? "rounded-3xl bg-black/80 border-white/5" 
                : "rounded-2xl bg-black/60 border-white/10"
            )}>
              {/* Textarea Premium */}
              <div className={cn(isMobile ? "p-5" : "p-6")}>
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value)
                    adjustHeight()
                  }}
                  placeholder="Descreva sua imagem..."
                  className={cn(
                    "w-full px-0 py-0 resize-none border-0 bg-transparent text-white leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/40 scrollbar-hide",
                    isMobile ? "text-base min-h-[140px]" : "text-lg min-h-[120px]",
                  )}
                  style={{ 
                    overflow: "auto",
                    WebkitOverflowScrolling: "touch"
                  }}
                />
              </div>

              {/* Controls Bar - Premium Design */}
              <div className={cn(
                "border-t bg-black/20 backdrop-blur-xl",
                isMobile ? "border-white/5 p-4" : "border-white/10 p-5"
              )}>
                {isMobile ? (
                  /* Mobile: Vertical Stack */
                  <div className="flex flex-col gap-3">
                    {/* Row 1: Model + Aspect Ratio */}
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ImagenModel)}>
                        <SelectTrigger className="h-11 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl transition-all">
                          <SelectValue placeholder="Modelo" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="ultra">Ultra</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="imagen3">Imagen 3</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                        <SelectTrigger className="h-11 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="1:1">1:1</SelectItem>
                          <SelectItem value="16:9">16:9</SelectItem>
                          <SelectItem value="9:16">9:16</SelectItem>
                          <SelectItem value="4:3">4:3</SelectItem>
                          <SelectItem value="3:4">3:4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Row 2: Resolution + Variations */}
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={resolution} onValueChange={(v) => setResolution(v as '1K' | '2K')}>
                        <SelectTrigger className="h-11 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="1K">1K</SelectItem>
                          <SelectItem value="2K">2K</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={numVariations.toString()} onValueChange={(v) => setNumVariations(Number(v))}>
                        <SelectTrigger className="h-11 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="1">1 imagem</SelectItem>
                          <SelectItem value="2">2 imagens</SelectItem>
                          <SelectItem value="3">3 imagens</SelectItem>
                          <SelectItem value="4">4 imagens</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Generate Button - iOS Premium */}
                    <Button
                      disabled={!prompt.trim() || imagenApi.isLoading}
                      size="lg"
                      className={cn(
                        "h-12 rounded-xl font-semibold transition-all active:scale-[0.98]",
                        prompt.trim() && !imagenApi.isLoading
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                      )}
                      onClick={handleGenerate}
                    >
                      {imagenApi.isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Gerar Imagem
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  /* Desktop: Horizontal Compact */
                  <div className="flex items-center gap-3">
                    {/* Badge: Geração de Imagem */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm font-medium flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                      <span>Geração</span>
                    </div>

                    <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ImagenModel)}>
                      <SelectTrigger className="h-9 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="ultra">Imagen Ultra</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="imagen3">Imagen 3</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                      <SelectTrigger className="h-9 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="1:1">1:1</SelectItem>
                        <SelectItem value="16:9">16:9</SelectItem>
                        <SelectItem value="9:16">9:16</SelectItem>
                        <SelectItem value="4:3">4:3</SelectItem>
                        <SelectItem value="3:4">3:4</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={resolution} onValueChange={(v) => setResolution(v as '1K' | '2K')}>
                      <SelectTrigger className="h-9 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="1K">1K</SelectItem>
                        <SelectItem value="2K">2K</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={numVariations.toString()} onValueChange={(v) => setNumVariations(Number(v))}>
                      <SelectTrigger className="h-9 px-3 text-sm bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="1">1 img</SelectItem>
                        <SelectItem value="2">2 imgs</SelectItem>
                        <SelectItem value="3">3 imgs</SelectItem>
                        <SelectItem value="4">4 imgs</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex-1" />

                    {/* Generate Button Desktop */}
                    <Button
                      disabled={!prompt.trim() || imagenApi.isLoading}
                      className={cn(
                        "h-9 px-6 rounded-lg font-medium transition-all active:scale-95",
                        prompt.trim() && !imagenApi.isLoading
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                      )}
                      onClick={handleGenerate}
                    >
                      {imagenApi.isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Gerar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <section className={cn(isMobile ? "px-5 pb-10" : "px-3 sm:px-4 lg:px-6 pb-8 sm:pb-12 lg:pb-16")}>
          <div className="max-w-7xl mx-auto">
            <div className={cn("px-1", isMobile ? "mb-5" : "mb-4 sm:mb-6 lg:mb-8")}>
              <h3
                className={cn(
                  "font-bold text-white mb-1.5 sm:mb-2",
                  isMobile ? "text-xl" : "text-lg sm:text-xl md:text-2xl lg:text-3xl",
                )}
              >
                Galeria em Destaque
              </h3>
              <p className={cn("text-white/50", isMobile ? "text-sm" : "text-xs sm:text-sm md:text-base")}>
                Imagens criadas pela nossa comunidade
              </p>
            </div>

            <div
              className={cn(
                "grid gap-3 sm:gap-4",
                isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {featuredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-black/20 backdrop-blur-sm hover:bg-black/30 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer active:scale-[0.98]"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={image.image || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    <div
                      className={cn(
                        "absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between",
                        isMobile && "top-3 left-3 right-3",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={image.user.avatar || "/placeholder.svg"}
                          alt={image.user.name}
                          className={cn(
                            "rounded-full border-2 border-white/20",
                            isMobile ? "w-9 h-9" : "w-7 h-7 sm:w-8 sm:h-8",
                          )}
                        />
                        <div className="flex flex-col">
                          <span className={cn("text-white font-medium", isMobile ? "text-sm" : "text-xs sm:text-sm")}>
                            {image.user.name}
                          </span>
                          <span className={cn("text-white/50", isMobile ? "text-xs" : "text-[10px] sm:text-xs")}>
                            {image.timestamp}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-0 active:scale-95",
                          isMobile ? "h-9 w-9" : "h-8 w-8",
                        )}
                      >
                        <Share2 className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </div>

                    <div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 translate-y-2 group-hover:translate-y-0 transition-transform duration-300",
                        isMobile ? "p-4" : "p-3 sm:p-4",
                      )}
                    >
                      <h4
                        className={cn(
                          "text-white font-semibold mb-1 line-clamp-1",
                          isMobile ? "text-lg" : "text-base sm:text-lg",
                        )}
                      >
                        {image.title}
                      </h4>
                      <p
                        className={cn(
                          "text-white/70 mb-2 sm:mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                          isMobile ? "text-sm" : "text-xs sm:text-sm",
                        )}
                      >
                        {image.prompt}
                      </p>

                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(image.id)
                            }}
                            className={cn(
                              "bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg gap-1.5 transition-all active:scale-95",
                              isMobile ? "h-9 px-3" : "h-8 sm:h-8 px-2.5 sm:px-3",
                              image.isLiked && "bg-pink-500/20 border-pink-500/30 hover:bg-pink-500/30",
                            )}
                          >
                            <Heart
                              className={cn(
                                "w-3.5 h-3.5",
                                image.isLiked ? "fill-pink-500 text-pink-500" : "text-white",
                              )}
                            />
                            <span className={cn("text-xs font-medium", image.isLiked ? "text-pink-500" : "text-white")}>
                              {image.likes}
                            </span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg gap-1.5 active:scale-95",
                              isMobile ? "h-9 px-3" : "h-8 sm:h-8 px-2.5 sm:px-3",
                            )}
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-medium text-white">{image.comments}</span>
                          </Button>

                          <div
                            className={cn(
                              "flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg",
                              isMobile ? "h-9 px-3" : "h-8 sm:h-8 px-2.5 sm:px-3",
                            )}
                          >
                            <Eye className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-xs font-medium text-white/70">{image.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {generatedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          image={generatedImage}
          variations={[
            { url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1024&h=1024&fit=crop" },
            { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1024&h=768&fit=crop" },
          ]}
        />
      )}
    </BeamsBackground>
  )
}
