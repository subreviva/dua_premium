"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  ImageIcon,
  Wand2,
  Eraser,
  Palette,
  FileText as FileVector,
  ArrowRightLeft,
  Trash2,
  Maximize2,
  Zap,
  MoreHorizontal,
  ArrowUp,
  Paperclip,
  Heart,
  MessageCircle,
  Eye,
  Share2,
} from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { RevealText } from "@/components/ui/reveal-text"
import { useIsMobile } from "@/lib/hooks"

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

interface GalleryDesign {
  id: number
  title: string
  description: string
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

export default function DesignStudioPage() {
  const isMobile = useIsMobile()
  const [message, setMessage] = useState("")
  const [outputFormat, setOutputFormat] = useState("raster")
  const [designStyle, setDesignStyle] = useState("realistic")
  const [resolution, setResolution] = useState("2k")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 120,
    maxHeight: 300,
  })

  const toolsByCategory = {
    generate: [
      {
        icon: ImageIcon,
        title: "Raster Image Generation (V3)",
        description: "Imagens fotorrealistas, ilustrações, concept art",
        credits: "10",
      },
      {
        icon: FileVector,
        title: "Vector Image Generation (V3)",
        description: "Gráficos escaláveis infinitamente (SVG, EPS, PDF)",
        credits: "15",
      },
    ],
    edit: [
      {
        icon: ArrowRightLeft,
        title: "Image-to-Image",
        description: "Transformar imagens aplicando novos estilos",
        credits: "Raster: 8 | Vector: 12",
      },
      {
        icon: Wand2,
        title: "Inpainting",
        description: "Adicionar, remover ou modificar elementos específicos",
        credits: "Raster: 10 | Vector: 15",
      },
      {
        icon: Eraser,
        title: "Erase Region",
        description: "Remover objetos indesejados com precisão",
        credits: "8",
      },
    ],
    background: [
      {
        icon: Trash2,
        title: "Background Removal",
        description: "Remoção automática de fundos em segundos",
        credits: "5",
      },
      {
        icon: ArrowRightLeft,
        title: "Replace Background",
        description: "Substituir fundo mantendo sujeito",
        credits: "8",
      },
      {
        icon: Sparkles,
        title: "Generate Background",
        description: "Gerar novos fundos a partir de prompts",
        credits: "10",
      },
    ],
    upscale: [
      {
        icon: Maximize2,
        title: "Crisp Upscale",
        description: "Aumentar resolução mantendo nitidez",
        credits: "12",
      },
      {
        icon: Zap,
        title: "Creative Upscale",
        description: "Upscaling com adição criativa de detalhes",
        credits: "15",
      },
    ],
    special: [
      {
        icon: FileVector,
        title: "Image Vectorization",
        description: "Converter imagens raster em vetores (SVG)",
        credits: "10",
      },
      {
        icon: Palette,
        title: "Image Style Creation",
        description: "Criar estilos personalizados reutilizáveis",
        credits: "8",
      },
    ],
  }

  const designStyles = [
    { id: "realistic", name: "Realistic", description: "Fotorrealista profissional" },
    { id: "digital-illustration", name: "Digital Illustration", description: "Ilustração digital moderna" },
    { id: "vector-illustration", name: "Vector Illustration", description: "Vetorial limpo e escalável" },
    { id: "enterprise", name: "Enterprise", description: "Corporativo e profissional" },
    { id: "realistic-image", name: "Realistic Image", description: "Imagem realista detalhada" },
  ]

  const [featuredDesigns, setFeaturedDesigns] = useState<GalleryDesign[]>([
    {
      id: 1,
      title: "Modern Logo Design",
      description: "Minimalist tech startup logo with geometric shapes",
      likes: 542,
      comments: 67,
      views: "18.3K",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=800&fit=crop",
      user: { name: "Design Pro", avatar: "https://i.pravatar.cc/150?img=20" },
      timestamp: "1h ago",
      isLiked: false,
    },
    {
      id: 2,
      title: "Product Mockup",
      description: "Professional product photography with clean background",
      likes: 489,
      comments: 52,
      views: "15.7K",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop",
      user: { name: "Creative Studio", avatar: "https://i.pravatar.cc/150?img=21" },
      timestamp: "3h ago",
      isLiked: false,
    },
    {
      id: 3,
      title: "Vector Illustration",
      description: "Scalable vector graphics for brand identity",
      likes: 456,
      comments: 43,
      views: "14.2K",
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=1200&fit=crop",
      user: { name: "Vector Artist", avatar: "https://i.pravatar.cc/150?img=22" },
      timestamp: "5h ago",
      isLiked: false,
    },
    {
      id: 4,
      title: "Brand Identity",
      description: "Complete brand identity system with logo variations",
      likes: 423,
      comments: 38,
      views: "13.1K",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=800&fit=crop",
      user: { name: "Brand Designer", avatar: "https://i.pravatar.cc/150?img=23" },
      timestamp: "8h ago",
      isLiked: false,
    },
    {
      id: 5,
      title: "UI Design System",
      description: "Modern UI components with consistent design language",
      likes: 398,
      comments: 45,
      views: "12.5K",
      image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&h=675&fit=crop",
      user: { name: "UI Designer", avatar: "https://i.pravatar.cc/150?img=24" },
      timestamp: "12h ago",
      isLiked: false,
    },
    {
      id: 6,
      title: "Poster Design",
      description: "Eye-catching poster with precise text rendering",
      likes: 376,
      comments: 31,
      views: "11.8K",
      image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=1200&fit=crop",
      user: { name: "Graphic Artist", avatar: "https://i.pravatar.cc/150?img=25" },
      timestamp: "1d ago",
      isLiked: false,
    },
    {
      id: 7,
      title: "Icon Set",
      description: "Professional icon set with multiple styles",
      likes: 354,
      comments: 28,
      views: "10.9K",
      image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=800&fit=crop",
      user: { name: "Icon Designer", avatar: "https://i.pravatar.cc/150?img=26" },
      timestamp: "1d ago",
      isLiked: false,
    },
    {
      id: 8,
      title: "Package Design",
      description: "Product packaging with realistic mockup",
      likes: 332,
      comments: 24,
      views: "10.2K",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop",
      user: { name: "Package Pro", avatar: "https://i.pravatar.cc/150?img=27" },
      timestamp: "2d ago",
      isLiked: false,
    },
    {
      id: 9,
      title: "Social Media Kit",
      description: "Complete social media template collection",
      likes: 318,
      comments: 22,
      views: "9.7K",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=800&fit=crop",
      user: { name: "Social Designer", avatar: "https://i.pravatar.cc/150?img=28" },
      timestamp: "2d ago",
      isLiked: false,
    },
  ])

  const handleToolClick = (toolTitle: string) => {
    console.log(`[v0] Tool selected: ${toolTitle}`)
  }

  const handleLike = (designId: number) => {
    setFeaturedDesigns((prev) =>
      prev.map((design) =>
        design.id === designId
          ? {
              ...design,
              isLiked: !design.isLiked,
              likes: design.isLiked ? design.likes - 1 : design.likes + 1,
            }
          : design,
      ),
    )
  }

  return (
    <BeamsBackground intensity="medium">
      <div className="relative z-10 min-h-screen flex flex-col">
        <PremiumNavbar credits={100} showBackButton={true} backLink="/" variant="default" />

        {/* Hero Section */}
        <section
          className={cn(
            "relative",
            isMobile ? "pt-20 pb-8 px-6" : "pt-8 pb-6 px-4 sm:px-6 sm:pt-12 lg:pt-16 sm:pb-8 lg:pb-12",
          )}
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className={cn(isMobile ? "mb-6" : "mb-3 sm:mb-4 lg:mb-6")}>
              <RevealText
                text="DUA DESIGN"
                textColor="text-white"
                overlayColor="text-emerald-400"
                fontSize={
                  isMobile ? "text-[42px] leading-[1.1]" : "text-[48px] sm:text-[70px] md:text-[100px] lg:text-[120px]"
                }
                letterDelay={0.08}
                overlayDelay={0.05}
                overlayDuration={0.4}
                springDuration={600}
                letterImages={[
                  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=2070&h=2070&fit=crop",
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
              Estúdio de design profissional com IA. Crie logos, ilustrações e designs vetoriais de alta qualidade.
            </p>
          </div>
        </section>

        <main
          className={cn(
            "flex-1 flex flex-col items-center",
            isMobile ? "px-6 pb-8" : "px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8",
          )}
        >
          <div className="w-full max-w-3xl">
            <div
              className={cn(
                "relative backdrop-blur-xl border border-white/10 shadow-2xl",
                isMobile ? "rounded-3xl bg-black/80" : "rounded-xl sm:rounded-2xl bg-black/60",
              )}
            >
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  adjustHeight()
                }}
                placeholder="Ex: Logo minimalista para startup de tecnologia, formas geométricas, cores vibrantes..."
                className={cn(
                  "w-full resize-none border-none bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/40 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
                  isMobile
                    ? "px-6 py-6 text-base min-h-[160px] leading-relaxed"
                    : "px-4 sm:px-5 lg:px-6 py-4 sm:py-4 lg:py-5 text-sm sm:text-base min-h-[120px] sm:min-h-[140px]",
                )}
                style={{ overflow: "auto" }}
              />

              <div
                className={cn(
                  "flex flex-col border-t border-white/10",
                  isMobile ? "gap-4 px-6 py-6 pb-8" : "gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4",
                )}
              >
                {isMobile ? (
                  <>
                    <div className="flex flex-col gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-14 px-6 text-base text-white/70 hover:text-white hover:bg-white/10 rounded-2xl active:scale-[0.98] justify-start transition-all"
                        onClick={() => console.log("[v0] Attach file clicked")}
                      >
                        <Paperclip className="w-5 h-5 mr-3" />
                        Anexar arquivo
                      </Button>

                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger
                          className={cn(
                            "h-14 px-5 text-base rounded-2xl transition-all font-medium",
                            outputFormat === "raster"
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="raster">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              <span>Raster</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="vector">
                            <div className="flex items-center gap-2">
                              <FileVector className="w-4 h-4" />
                              <span>Vector</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex flex-col gap-3">
                        <Select value={designStyle} onValueChange={setDesignStyle}>
                          <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            {designStyles.map((style) => (
                              <SelectItem key={style.id} value={style.id}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{style.name}</span>
                                  <span className="text-xs text-white/50">{style.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="2k">Alta (2K)</SelectItem>
                            <SelectItem value="4k">Ultra (4K)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-14 px-6 text-base text-white/70 hover:text-white hover:bg-white/10 rounded-2xl active:scale-[0.98] justify-start transition-all"
                          >
                            <MoreHorizontal className="w-5 h-5 mr-3" />
                            Ver todas as ferramentas
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[calc(100vw-3rem)] bg-black/95 backdrop-blur-xl border-white/20 max-h-[70vh] overflow-y-auto"
                          align="start"
                        >
                          {/* Generate Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Geração de Imagens
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.generate.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Edit Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Edição e Transformação
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.edit.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Background Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Background Management
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.background.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Upscale Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Upscaling Profissional
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.upscale.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Special Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Ferramentas Especiais
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.special.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Button
                      disabled={!message.trim()}
                      className={cn(
                        "h-16 px-8 text-lg rounded-2xl transition-all active:scale-[0.98] font-semibold",
                        message.trim()
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30"
                          : "bg-white/10 text-white/40 cursor-not-allowed",
                      )}
                      onClick={() => {
                        if (message.trim()) {
                          console.log(`[v0] Submit: ${message}`)
                          console.log(`[v0] Format: ${outputFormat}, Style: ${designStyle}, Resolution: ${resolution}`)
                        }
                      }}
                    >
                      <ArrowUp className="w-6 h-6 mr-2" />
                      Gerar Design
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm active:scale-95"
                        onClick={() => console.log("[v0] Attach file clicked")}
                      >
                        <Paperclip className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden xs:inline">Anexar</span>
                      </Button>

                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger
                          className={cn(
                            "rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm w-[100px] sm:w-auto transition-all",
                            outputFormat === "raster"
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="raster">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              <span>Raster</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="vector">
                            <div className="flex items-center gap-2">
                              <FileVector className="w-4 h-4" />
                              <span>Vector</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={designStyle} onValueChange={setDesignStyle}>
                        <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm w-[120px] sm:w-auto transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          {designStyles.map((style) => (
                            <SelectItem key={style.id} value={style.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{style.name}</span>
                                <span className="text-xs text-white/50">{style.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm w-[90px] sm:w-auto transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="2k">Alta (2K)</SelectItem>
                          <SelectItem value="4k">Ultra (4K)</SelectItem>
                        </SelectContent>
                      </Select>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm active:scale-95"
                          >
                            <MoreHorizontal className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Tools</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[calc(100vw-2rem)] sm:w-80 bg-black/95 backdrop-blur-xl border-white/20 max-h-[70vh] overflow-y-auto"
                          align="start"
                        >
                          {/* Generate Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Geração de Imagens
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.generate.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Edit Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Edição e Transformação
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.edit.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Background Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Background Management
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.background.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Upscale Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Upscaling Profissional
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.upscale.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Special Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Ferramentas Especiais
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.special.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-emerald-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-emerald-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        disabled={!message.trim()}
                        className={cn(
                          "rounded-lg h-10 sm:h-9 px-6 sm:px-6 text-sm sm:text-sm transition-all flex-shrink-0 active:scale-95 w-full sm:w-auto",
                          message.trim()
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-white/10 text-white/40 cursor-not-allowed",
                        )}
                        onClick={() => {
                          if (message.trim()) {
                            console.log(`[v0] Submit: ${message}`)
                            console.log(
                              `[v0] Format: ${outputFormat}, Style: ${designStyle}, Resolution: ${resolution}`,
                            )
                          }
                        }}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Gerar Design
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div
              className={cn(
                "flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-white/40",
                isMobile ? "mt-6 mb-8 text-sm" : "mt-4 sm:mt-6 lg:mt-8 text-xs sm:text-sm",
              )}
            >
              <span>12 ferramentas</span>
              <span>•</span>
              <span>5 categorias</span>
              <span>•</span>
              <span>Raster & Vector</span>
            </div>
          </div>
        </main>

        <section className={cn(isMobile ? "px-5 pb-10" : "px-3 sm:px-4 lg:px-6 pb-8 sm:pb-12 lg:pb-16")}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6 lg:mb-8 px-1">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1.5 sm:mb-2">
                Designs em Destaque
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-white/50">
                Designs profissionais criados pela nossa comunidade
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {featuredDesigns.map((design) => (
                <div
                  key={design.id}
                  className="group relative bg-black/20 backdrop-blur-sm hover:bg-black/30 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer active:scale-[0.98]"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={design.image || "/placeholder.svg"}
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={design.user.avatar || "/placeholder.svg"}
                          alt={design.user.name}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/20"
                        />
                        <div className="flex flex-col">
                          <span className="text-white text-xs sm:text-sm font-medium">{design.user.name}</span>
                          <span className="text-white/50 text-[10px] sm:text-xs">{design.timestamp}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg h-8 w-8 p-0 active:scale-95"
                      >
                        <Share2 className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white font-semibold text-base sm:text-lg mb-1 line-clamp-1">
                        {design.title}
                      </h4>
                      <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {design.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(design.id)
                            }}
                            className={cn(
                              "bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg h-8 sm:h-8 px-2.5 sm:px-3 gap-1.5 transition-all active:scale-95",
                              design.isLiked && "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30",
                            )}
                          >
                            <Heart
                              className={cn(
                                "w-3.5 h-3.5",
                                design.isLiked ? "fill-emerald-500 text-emerald-500" : "text-white",
                              )}
                            />
                            <span
                              className={cn("text-xs font-medium", design.isLiked ? "text-emerald-500" : "text-white")}
                            >
                              {design.likes}
                            </span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg h-8 sm:h-8 px-2.5 sm:px-3 gap-1.5 active:scale-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-medium text-white">{design.comments}</span>
                          </Button>

                          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg h-8 sm:h-8 px-2.5 sm:px-3">
                            <Eye className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-xs font-medium text-white/70">{design.views}</span>
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
    </BeamsBackground>
  )
}
