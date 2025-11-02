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

        <section
          className={cn(
            "relative",
            isMobile ? "pt-20 pb-8 px-6" : "pt-8 pb-6 px-4 sm:px-6 sm:pt-12 lg:pt-16 sm:pb-8 lg:pb-12",
          )}
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className={cn(isMobile ? "mb-6" : "mb-3 sm:mb-4 lg:mb-6")}>
              <RevealText
                text="DUA VISION"
                textColor="text-white"
                overlayColor="text-cyan-400"
                fontSize={
                  isMobile ? "text-[42px] leading-[1.1]" : "text-[48px] sm:text-[70px] md:text-[100px] lg:text-[120px]"
                }
                letterDelay={0.08}
                overlayDelay={0.05}
                overlayDuration={0.4}
                springDuration={600}
                letterImages={[
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2070&h=2070&fit=crop",
                ]}
              />
            </div>
            <p
              className={cn(
                "text-white/60 max-w-2xl mx-auto leading-relaxed",
                isMobile
                  ? "text-base px-2 mb-6"
                  : "text-sm sm:text-base md:text-lg lg:text-xl px-4 mb-4 sm:mb-6 lg:mb-8",
              )}
            >
              Estúdio de geração e fotografia ultra premium. Crie imagens profissionais com IA.
            </p>
          </div>
        </section>

        <main
          className={cn(
            "flex-1 flex flex-col items-center",
            isMobile ? "px-6 pb-8" : "px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8",
          )}
        >
          <div className="w-full max-w-5xl">
            <div
              className={cn(
                "relative backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden",
                isMobile ? "rounded-3xl bg-black/70" : "rounded-2xl bg-black/40",
              )}
            >
              <div className={cn(isMobile ? "p-6" : "p-4 sm:p-6 lg:p-8")}>
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value)
                    adjustHeight()
                  }}
                  placeholder="Descreva a imagem que você está imaginando..."
                  className={cn(
                    "w-full px-0 py-0 resize-none border-0 bg-transparent text-white leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                    isMobile ? "text-base min-h-[160px]" : "text-base sm:text-lg min-h-[150px] sm:min-h-[200px]",
                  )}
                  style={{ overflow: "auto" }}
                />
              </div>

              <div
                className={cn(
                  "flex flex-col border-t border-white/10 bg-black/20",
                  isMobile ? "gap-4 px-6 py-6 pb-8" : "gap-3 px-3 sm:px-4 lg:px-6 py-3 sm:py-4",
                )}
              >
                {isMobile ? (
                  <>
                    <div className="flex flex-col gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-14 px-6 text-base bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-2xl font-medium transition-all active:scale-[0.98] justify-start"
                          >
                            <Sparkles className="w-5 h-5 mr-3" />
                            Imagem de IA
                            <ChevronDown className="w-4 h-4 ml-auto" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56 bg-black/95 backdrop-blur-xl border-white/20"
                          align="start"
                        >
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Modo de Geração
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="text-white focus:bg-white/10 cursor-pointer">
                            <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                            Imagem de IA
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white/50 focus:bg-white/10 cursor-pointer">
                            <Wand2 className="w-4 h-4 mr-2" />
                            Editar Imagem
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white/50 focus:bg-white/10 cursor-pointer">
                            <Layers className="w-4 h-4 mr-2" />
                            Composição
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="flex flex-col gap-3">
                        <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ImagenModel)}>
                          <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="ultra">Imagen 4 Ultra</SelectItem>
                            <SelectItem value="standard">Imagen 4 Standard</SelectItem>
                            <SelectItem value="fast">Imagen 4 Fast</SelectItem>
                            <SelectItem value="imagen3">Imagen 3</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                          <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="1:1">1:1</SelectItem>
                            <SelectItem value="16:9">16:9</SelectItem>
                            <SelectItem value="9:16">9:16</SelectItem>
                            <SelectItem value="4:3">4:3</SelectItem>
                            <SelectItem value="3:4">3:4</SelectItem>
                            <SelectItem value="2:3">2:3</SelectItem>
                            <SelectItem value="3:2">3:2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Select value={resolution} onValueChange={(v) => setResolution(v as '1K' | '2K')}>
                          <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="1K">1K (1024×1024)</SelectItem>
                            <SelectItem value="2K">2K (2048×2048)</SelectItem>
                          </SelectContent>
                        </Select>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all active:scale-[0.98]"
                            >
                              <Palette className="w-5 h-5 mr-2" />
                              {styles.find((s) => s.id === selectedStyle)?.name}
                              <ChevronDown className="w-4 h-4 ml-auto" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56 bg-black/95 backdrop-blur-xl border-white/20"
                            align="start"
                          >
                            <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                              Estilo Visual
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {styles.map((style) => {
                              const Icon = style.icon
                              return (
                                <DropdownMenuItem
                                  key={style.id}
                                  onClick={() => setSelectedStyle(style.id)}
                                  className={cn(
                                    "text-white focus:bg-white/10 cursor-pointer transition-colors",
                                    selectedStyle === style.id && "bg-white/10",
                                  )}
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  {style.name}
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-14 px-6 text-base bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-2xl transition-all active:scale-[0.98] justify-start"
                          >
                            <FileText className="w-5 h-5 mr-3" />
                            Templates de Prompts
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[calc(100vw-3rem)] bg-black/95 backdrop-blur-xl border-white/20"
                          align="start"
                        >
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Templates de Prompts
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/10" />
                          {promptTemplates.map((template) => (
                            <DropdownMenuItem
                              key={template.name}
                              onClick={() => handleTemplateSelect(template.template)}
                              className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-white/10 text-white transition-colors"
                            >
                              <span className="font-medium text-sm">{template.name}</span>
                              <p className="text-xs text-white/50 line-clamp-2">{template.template}</p>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center gap-2 text-white/70 text-sm justify-center">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">{numVariations}/imagem</span>
                      </div>

                      <Button
                        disabled={!prompt.trim() || imagenApi.isLoading}
                        size="sm"
                        className={cn(
                          "h-16 px-8 text-lg rounded-2xl transition-all font-semibold active:scale-[0.98]",
                          prompt.trim() && !imagenApi.isLoading
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl shadow-purple-500/30"
                            : "bg-white/5 text-white/30 cursor-not-allowed",
                        )}
                        onClick={handleGenerate}
                      >
                        {imagenApi.isLoading ? (
                          <>
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Send className="w-6 h-6 mr-2" />
                            Gerar
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex items-center gap-2 pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                        isMobile ? "flex-col" : "overflow-x-auto",
                      )}
                    >
                      <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg font-medium transition-all flex-shrink-0 active:scale-95",
                                isMobile ? "h-11 px-4 text-sm flex-1" : "px-3 h-9 text-xs sm:text-sm",
                              )}
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              Imagem de IA
                              <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56 bg-black/95 backdrop-blur-xl border-white/20"
                            align="start"
                          >
                            <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                              Modo de Geração
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-white focus:bg-white/10 cursor-pointer">
                              <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                              Imagem de IA
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white/50 focus:bg-white/10 cursor-pointer">
                              <Wand2 className="w-4 h-4 mr-2" />
                              Editar Imagem
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white/50 focus:bg-white/10 cursor-pointer">
                              <Layers className="w-4 h-4 mr-2" />
                              Composição
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as ImagenModel)}>
                          <SelectTrigger
                            className={cn(
                              "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all flex-shrink-0",
                              isMobile
                                ? "h-11 px-4 text-sm flex-1"
                                : "h-9 px-3 text-xs sm:text-sm w-[110px] sm:w-[120px]",
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="ultra">Imagen 4 Ultra</SelectItem>
                            <SelectItem value="standard">Imagen 4 Standard</SelectItem>
                            <SelectItem value="fast">Imagen 4 Fast</SelectItem>
                            <SelectItem value="imagen3">Imagen 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
                        <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                          <SelectTrigger
                            className={cn(
                              "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all flex-shrink-0",
                              isMobile
                                ? "h-11 px-4 text-sm flex-1"
                                : "h-9 px-3 text-xs sm:text-sm w-[80px] sm:w-[90px]",
                            )}
                          >
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
                          <SelectTrigger
                            className={cn(
                              "bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg transition-all flex-shrink-0",
                              isMobile
                                ? "h-11 px-4 text-sm flex-1"
                                : "h-9 px-3 text-xs sm:text-sm w-[100px] sm:w-[110px]",
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="1K">1K (1024×1024)</SelectItem>
                            <SelectItem value="2K">2K (2048×2048)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all flex-shrink-0 active:scale-95",
                                isMobile ? "h-11 px-4 text-sm flex-1" : "h-9 px-3 text-xs sm:text-sm",
                              )}
                            >
                              <Palette className="w-3.5 h-3.5 mr-1.5" />
                              {isMobile ? (
                                styles.find((s) => s.id === selectedStyle)?.name
                              ) : (
                                <>
                                  <span className="hidden sm:inline">
                                    {styles.find((s) => s.id === selectedStyle)?.name}
                                  </span>
                                  <span className="sm:hidden">Estilo</span>
                                </>
                              )}
                              <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56 bg-black/95 backdrop-blur-xl border-white/20"
                            align="start"
                          >
                            <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                              Estilo Visual
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {styles.map((style) => {
                              const Icon = style.icon
                              return (
                                <DropdownMenuItem
                                  key={style.id}
                                  onClick={() => setSelectedStyle(style.id)}
                                  className={cn(
                                    "text-white focus:bg-white/10 cursor-pointer transition-colors",
                                    selectedStyle === style.id && "bg-white/10",
                                  )}
                                >
                                  <Icon className="w-4 h-4 mr-2" />
                                  {style.name}
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg transition-all flex-shrink-0 active:scale-95",
                                isMobile ? "h-11 w-11 p-0" : "h-9 w-9 p-0",
                              )}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-[calc(100vw-2rem)] sm:w-80 bg-black/95 backdrop-blur-xl border-white/20"
                            align="start"
                          >
                            <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                              Templates de Prompts
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {promptTemplates.map((template) => (
                              <DropdownMenuItem
                                key={template.name}
                                onClick={() => handleTemplateSelect(template.template)}
                                className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-white/10 text-white transition-colors"
                              >
                                <span className="font-medium text-sm">{template.name}</span>
                                <p className="text-xs text-white/50 line-clamp-2">{template.template}</p>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={cn(
                          "flex items-center gap-2 text-white/70",
                          isMobile ? "text-sm" : "text-xs sm:text-sm",
                        )}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-medium">{numVariations}/imagem</span>
                      </div>

                      <Button
                        disabled={!prompt.trim() || imagenApi.isLoading}
                        size="sm"
                        className={cn(
                          "rounded-lg transition-all font-medium active:scale-95",
                          isMobile ? "px-6 h-12 text-base flex-1" : "px-5 sm:px-6 h-10 sm:h-9 text-sm",
                          prompt.trim() && !imagenApi.isLoading
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                            : "bg-white/5 text-white/30 cursor-not-allowed",
                        )}
                        onClick={handleGenerate}
                      >
                        {imagenApi.isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isMobile ? 'Gerando...' : 'Gerando'}
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Gerar
                          </>
                        )}
                      </Button>
                    </div>
                  </>
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
