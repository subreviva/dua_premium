"use client"

import type React from "react"
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
  Video,
  ImageIcon,
  Film,
  Shuffle,
  Play,
  MoreHorizontal,
  ArrowUp,
  Paperclip,
  X,
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

interface GalleryVideo {
  id: number
  title: string
  description: string
  likes: number
  comments: number
  views: string
  thumbnail: string
  duration: string
  resolution: string
  user: {
    name: string
    avatar: string
  }
  timestamp: string
  isLiked?: boolean
}

export default function VideoStudioPage() {
  const isMobile = useIsMobile()
  const [message, setMessage] = useState("")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [duration, setDuration] = useState(6)
  const [resolution, setResolution] = useState("1080p")
  const [model, setModel] = useState("veo-3.1")
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 120,
    maxHeight: 300,
  })

  const toolsByCategory = {
    generate: [
      {
        icon: Video,
        title: "Text-to-Video",
        description: "Crie vídeos a partir de texto com áudio sincronizado",
        credits: "20",
      },
      {
        icon: ImageIcon,
        title: "Image-to-Video",
        description: "Anime suas imagens com prompts de movimento",
        credits: "18",
      },
    ],
    extend: [
      {
        icon: Film,
        title: "Video Extension",
        description: "Estenda vídeos Veo em 7s (até 20x = 141s total)",
        credits: "15",
      },
      {
        icon: Shuffle,
        title: "Video Interpolation",
        description: "Transições suaves entre dois frames",
        credits: "12",
      },
    ],
  }

  const [featuredVideos, setFeaturedVideos] = useState<GalleryVideo[]>([
    {
      id: 1,
      title: "Cinematic Sunset Drone",
      description: "Aerial drone shot flying over futuristic city at golden hour",
      likes: 892,
      comments: 124,
      views: "34.2K",
      thumbnail: "/cinematic-sunset-drone-shot.jpg",
      duration: "8s",
      resolution: "1080p",
      user: { name: "Cinema Pro", avatar: "https://i.pravatar.cc/150?img=30" },
      timestamp: "2h ago",
      isLiked: false,
    },
    {
      id: 2,
      title: "Urban City Timelapse",
      description: "Fast-paced city life with neon lights and traffic flow",
      likes: 756,
      comments: 98,
      views: "28.7K",
      thumbnail: "/urban-city-timelapse-motion.jpg",
      duration: "6s",
      resolution: "1080p",
      user: { name: "Urban Filmmaker", avatar: "https://i.pravatar.cc/150?img=31" },
      timestamp: "5h ago",
      isLiked: false,
    },
    {
      id: 3,
      title: "Nature Flowing Water",
      description: "Serene waterfall in lush forest with cinematic color grading",
      likes: 689,
      comments: 87,
      views: "25.3K",
      thumbnail: "/nature-flowing-water-cinematic.jpg",
      duration: "4s",
      resolution: "720p",
      user: { name: "Nature Videographer", avatar: "https://i.pravatar.cc/150?img=32" },
      timestamp: "8h ago",
      isLiked: false,
    },
    {
      id: 4,
      title: "3D Character Animation",
      description: "Smooth character movement with realistic physics",
      likes: 634,
      comments: 76,
      views: "23.1K",
      thumbnail: "/3d-character-animation-loop.jpg",
      duration: "8s",
      resolution: "1080p",
      user: { name: "3D Animator", avatar: "https://i.pravatar.cc/150?img=33" },
      timestamp: "12h ago",
      isLiked: false,
    },
    {
      id: 5,
      title: "Abstract Motion Graphics",
      description: "Geometric shapes morphing with vibrant colors",
      likes: 598,
      comments: 64,
      views: "21.8K",
      thumbnail: "/abstract-geometric-shapes.png",
      duration: "6s",
      resolution: "1080p",
      user: { name: "Motion Designer", avatar: "https://i.pravatar.cc/150?img=34" },
      timestamp: "1d ago",
      isLiked: false,
    },
    {
      id: 6,
      title: "Cinematic Product Shot",
      description: "Professional product reveal with dramatic lighting",
      likes: 567,
      comments: 59,
      views: "20.4K",
      thumbnail: "/cinematic-sunset-drone-shot.jpg",
      duration: "4s",
      resolution: "1080p",
      user: { name: "Product Filmmaker", avatar: "https://i.pravatar.cc/150?img=35" },
      timestamp: "1d ago",
      isLiked: false,
    },
    {
      id: 7,
      title: "Sci-Fi Space Scene",
      description: "Spaceship flying through asteroid field with VFX",
      likes: 543,
      comments: 52,
      views: "19.2K",
      thumbnail: "/urban-city-timelapse-motion.jpg",
      duration: "8s",
      resolution: "1080p",
      user: { name: "VFX Artist", avatar: "https://i.pravatar.cc/150?img=36" },
      timestamp: "2d ago",
      isLiked: false,
    },
    {
      id: 8,
      title: "Fashion Runway Walk",
      description: "Model walking down runway with slow motion effect",
      likes: 521,
      comments: 48,
      views: "18.6K",
      thumbnail: "/nature-flowing-water-cinematic.jpg",
      duration: "6s",
      resolution: "720p",
      user: { name: "Fashion Videographer", avatar: "https://i.pravatar.cc/150?img=37" },
      timestamp: "2d ago",
      isLiked: false,
    },
    {
      id: 9,
      title: "Food Preparation Close-up",
      description: "Macro shot of food being prepared with steam and details",
      likes: 498,
      comments: 43,
      views: "17.9K",
      thumbnail: "/3d-character-animation-loop.jpg",
      duration: "4s",
      resolution: "1080p",
      user: { name: "Food Filmmaker", avatar: "https://i.pravatar.cc/150?img=38" },
      timestamp: "3d ago",
      isLiked: false,
    },
  ])

  const handleToolClick = (toolTitle: string) => {
    // console.log(`[v0] Tool selected: ${toolTitle}`)
  }

  const handleLike = (videoId: number) => {
    setFeaturedVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1,
            }
          : video,
      ),
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && referenceImages.length < 3) {
      const newImages = Array.from(files).slice(0, 3 - referenceImages.length)
      setReferenceImages([...referenceImages, ...newImages.map(() => "/abstract-geometric-shapes.png")])
    }
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index))
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
                text="DUA CINEMA"
                textColor="text-white"
                overlayColor="text-purple-400"
                fontSize={
                  isMobile ? "text-[42px] leading-[1.1]" : "text-[48px] sm:text-[70px] md:text-[100px] lg:text-[120px]"
                }
                letterDelay={0.08}
                overlayDelay={0.05}
                overlayDuration={0.4}
                springDuration={600}
                letterImages={[
                  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1574267432644-f74f8ec55d1f?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1574267432644-f74f8ec55d1f?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=2070&h=2070&fit=crop",
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
              Estúdio de vídeo cinematográfico com IA. Crie vídeos profissionais a partir de texto, imagens e muito
              mais.
            </p>
          </div>
        </section>

        {/* Main Content - Chat Interface */}
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
                placeholder="Ex: Um drone voando sobre uma cidade futurista ao pôr do sol, com luzes neon refletindo nos prédios de vidro..."
                className={cn(
                  "w-full resize-none border-none bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/40 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
                  isMobile
                    ? "px-6 py-6 text-base min-h-[160px] leading-relaxed"
                    : "px-4 sm:px-5 lg:px-6 py-4 sm:py-4 lg:py-5 text-sm sm:text-base min-h-[120px] sm:min-h-[140px]",
                )}
                style={{ overflow: "auto" }}
                maxLength={500}
              />

              <div
                className={cn(
                  "flex flex-col border-t border-white/10",
                  isMobile ? "gap-4 px-6 py-6 pb-8" : "gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4",
                )}
              >
                {/* Reference Images */}
                {referenceImages.length > 0 && (
                  <div
                    className={cn(
                      "flex items-center gap-2 flex-wrap border-b border-white/10",
                      isMobile ? "pb-4" : "pb-2",
                    )}
                  >
                    {referenceImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Reference ${index + 1}`}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-purple-500/30"
                        />
                        <button
                          onClick={() => removeReferenceImage(index)}
                          className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isMobile ? (
                  <>
                    <div className="flex flex-col gap-4">
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={referenceImages.length >= 3}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-14 px-6 text-base text-white/70 hover:text-white hover:bg-white/10 rounded-2xl active:scale-[0.98] justify-start w-full transition-all",
                            referenceImages.length >= 3 && "opacity-50 cursor-not-allowed",
                          )}
                          onClick={(e) => {
                            if (referenceImages.length >= 3) {
                              e.preventDefault()
                            }
                          }}
                          asChild
                        >
                          <span>
                            <Paperclip className="w-5 h-5 mr-3" />
                            Referências ({referenceImages.length}/3)
                          </span>
                        </Button>
                      </label>

                      <div className="flex flex-col gap-3">
                        <Select value={aspectRatio} onValueChange={setAspectRatio}>
                          <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="16:9">16:9 Landscape</SelectItem>
                            <SelectItem value="9:16">9:16 Portrait</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <span className="text-white/70 text-sm font-medium">Duração:</span>
                        <div className="grid grid-cols-3 gap-3">
                          {[4, 6, 8].map((dur) => (
                            <Button
                              key={dur}
                              variant={duration === dur ? "default" : "ghost"}
                              size="sm"
                              className={cn(
                                "h-14 text-base rounded-2xl active:scale-[0.98] transition-all font-medium",
                                duration === dur
                                  ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                  : "text-white/70 hover:text-white hover:bg-white/10",
                              )}
                              onClick={() => setDuration(dur)}
                            >
                              {dur}s
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="h-14 px-5 text-base bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="veo-3.1">Veo 3.1 (áudio)</SelectItem>
                          <SelectItem value="veo-3.1-fast">Veo 3.1 Fast</SelectItem>
                        </SelectContent>
                      </Select>

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
                            Geração de Vídeo
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
                                  <Icon className="w-4 h-4 mt-0.5 text-purple-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-purple-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Extend Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Edição Avançada
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.extend.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-purple-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-purple-400">{tool.credits}</span>
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

                    <div className="flex flex-col gap-3 pt-2">
                      <div className="text-sm text-white/40 text-center">{message.length}/500 caracteres</div>

                      <Button
                        disabled={!message.trim()}
                        className={cn(
                          "h-16 px-8 text-lg rounded-2xl transition-all active:scale-[0.98] font-semibold",
                          message.trim()
                            ? "bg-purple-500 hover:bg-purple-600 text-white shadow-xl shadow-purple-500/30"
                            : "bg-white/10 text-white/40 cursor-not-allowed",
                        )}
                        onClick={() => {
                          if (message.trim()) {
                            // console.log(`[v0] Submit: ${message}`)
                            // console.log(
                              `[v0] Config: ${aspectRatio}, ${duration}s, ${resolution}, ${model}, refs: ${referenceImages.length}`,
                            )
                          }
                        }}
                      >
                        <ArrowUp className="w-6 h-6 mr-2" />
                        Gerar Vídeo
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={referenceImages.length >= 3}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-white/70 hover:text-white hover:bg-white/10 rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm active:scale-95",
                            referenceImages.length >= 3 && "opacity-50 cursor-not-allowed",
                          )}
                          onClick={(e) => {
                            if (referenceImages.length >= 3) {
                              e.preventDefault()
                            }
                          }}
                          asChild
                        >
                          <span>
                            <Paperclip className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden xs:inline">Referências ({referenceImages.length}/3)</span>
                          </span>
                        </Button>
                      </label>

                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm w-[100px] sm:w-auto transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="16:9">16:9 Landscape</SelectItem>
                          <SelectItem value="9:16">9:16 Portrait</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1.5">
                        {[4, 6, 8].map((dur) => (
                          <Button
                            key={dur}
                            variant={duration === dur ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm active:scale-95 transition-all",
                              duration === dur
                                ? "bg-purple-500 hover:bg-purple-600 text-white"
                                : "text-white/70 hover:text-white hover:bg-white/10",
                            )}
                            onClick={() => setDuration(dur)}
                          >
                            {dur}s
                          </Button>
                        ))}
                      </div>

                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm w-[90px] sm:w-auto transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-lg h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm w-[120px] sm:w-auto transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/95 backdrop-blur-xl border-white/20">
                          <SelectItem value="veo-3.1">Veo 3.1 (áudio)</SelectItem>
                          <SelectItem value="veo-3.1-fast">Veo 3.1 Fast</SelectItem>
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
                            Geração de Vídeo
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
                                  <Icon className="w-4 h-4 mt-0.5 text-purple-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-purple-400">{tool.credits}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{tool.description}</p>
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuGroup>

                          <DropdownMenuSeparator className="bg-white/10" />

                          {/* Extend Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Edição Avançada
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.extend.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <DropdownMenuItem
                                  key={tool.title}
                                  onClick={() => handleToolClick(tool.title)}
                                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/10 text-white"
                                >
                                  <Icon className="w-4 h-4 mt-0.5 text-purple-400" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-medium text-sm">{tool.title}</span>
                                      <span className="text-xs text-purple-400">{tool.credits}</span>
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

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm text-white/40">{message.length}/500 caracteres</div>

                      <Button
                        disabled={!message.trim()}
                        className={cn(
                          "rounded-lg h-10 sm:h-9 px-6 sm:px-6 text-sm sm:text-sm transition-all flex-shrink-0 active:scale-95",
                          message.trim()
                            ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                            : "bg-white/10 text-white/40 cursor-not-allowed",
                        )}
                        onClick={() => {
                          if (message.trim()) {
                            // console.log(`[v0] Submit: ${message}`)
                            // console.log(
                              `[v0] Config: ${aspectRatio}, ${duration}s, ${resolution}, ${model}, refs: ${referenceImages.length}`,
                            )
                          }
                        }}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Gerar Vídeo
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
              <span>4 ferramentas</span>
              <span>•</span>
              <span>2 categorias</span>
              <span>•</span>
              <span>Veo 3.1</span>
            </div>
          </div>
        </main>

        {/* Featured Videos Gallery */}
        <section className={cn(isMobile ? "px-5 pb-10" : "px-3 sm:px-4 lg:px-6 pb-8 sm:pb-12 lg:pb-16")}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6 lg:mb-8 px-1">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1.5 sm:mb-2">
                Vídeos em Destaque
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-white/50">
                Criações cinematográficas da comunidade DUA
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {featuredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group relative bg-black/20 backdrop-blur-sm hover:bg-black/30 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer active:scale-[0.98]"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-4 sm:p-5 rounded-full bg-purple-500/90 backdrop-blur-sm shadow-lg active:scale-95 transition-transform">
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Top Info */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={video.user.avatar || "/placeholder.svg"}
                          alt={video.user.name}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/20"
                        />
                        <div className="flex flex-col">
                          <span className="text-white text-xs sm:text-sm font-medium">{video.user.name}</span>
                          <span className="text-white/50 text-[10px] sm:text-xs">{video.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="px-2 py-1 text-[10px] sm:text-xs font-medium bg-black/70 backdrop-blur-sm rounded-md text-white border border-white/10">
                          {video.duration}
                        </span>
                        <span className="px-2 py-1 text-[10px] sm:text-xs font-medium bg-black/70 backdrop-blur-sm rounded-md text-white border border-white/10">
                          {video.resolution}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white font-semibold text-base sm:text-lg mb-1 line-clamp-1">{video.title}</h4>
                      <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {video.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(video.id)
                            }}
                            className={cn(
                              "bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg h-8 sm:h-8 px-2.5 sm:px-3 gap-1.5 transition-all active:scale-95",
                              video.isLiked && "bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30",
                            )}
                          >
                            <Heart
                              className={cn(
                                "w-3.5 h-3.5",
                                video.isLiked ? "fill-purple-500 text-purple-500" : "text-white",
                              )}
                            />
                            <span
                              className={cn("text-xs font-medium", video.isLiked ? "text-purple-500" : "text-white")}
                            >
                              {video.likes}
                            </span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg h-8 sm:h-8 px-2.5 sm:px-3 gap-1.5 active:scale-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-medium text-white">{video.comments}</span>
                          </Button>

                          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg h-8 sm:h-8 px-2.5 sm:px-3">
                            <Eye className="w-3.5 h-3.5 text-white/70" />
                            <span className="text-xs font-medium text-white/70">{video.views}</span>
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
