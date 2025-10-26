"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import { useIsMobile } from "@/components/ui/use-mobile"
import {
  Music2,
  Mic2,
  FileText,
  Volume2,
  Wand2,
  Scissors,
  Sparkles,
  Eraser,
  Settings2,
  Gauge,
  Shuffle,
  ArrowRightLeft,
  PlusCircle,
  Paintbrush,
  UserCircle2,
  Piano,
  FileCode,
  Repeat,
  Paperclip,
  ArrowUp,
  MoreHorizontal,
  Music,
  Play,
  MoreVertical,
} from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import AudioPlayer from "@/components/ui/audio-player"
import { RevealText } from "@/components/ui/reveal-text"

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

export default function MusicStudioPage() {
  const isMobile = useIsMobile()
  const [message, setMessage] = useState("")
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [hasLyrics, setHasLyrics] = useState(false)
  const [currentSong, setCurrentSong] = useState<{
    id: number
    title: string
    artist: string
    plays: string
    cover: string
  } | null>(null)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 100,
    maxHeight: 300,
  })

  const toolsByCategory = {
    create: [
      { icon: Music2, title: "Music AI", description: "Cria música completa do zero", credits: "10" },
      { icon: Mic2, title: "Cover Song", description: "Recria música com nova voz", credits: "15" },
      { icon: FileText, title: "Lyrics Generator", description: "Gera letras formatadas", credits: "2" },
      { icon: Volume2, title: "Text to Speech", description: "Converte texto em voz", credits: "5" },
      { icon: Wand2, title: "Sound Generator", description: "Cria efeitos sonoros", credits: "15" },
    ],
    separate: [
      { icon: Scissors, title: "Extraction (Stems)", description: "Separa instrumentos e vocais", credits: "15-235" },
      { icon: UserCircle2, title: "Voice Changer", description: "Muda voz no áudio", credits: "6 + 3/min" },
    ],
    improve: [
      { icon: Eraser, title: "DeNoise", description: "Remove ruído de fundo", credits: "10 + 4/min" },
      { icon: Sparkles, title: "DeEcho", description: "Remove eco indesejado", credits: "8 + 3/min" },
      { icon: Eraser, title: "DeReverb", description: "Remove reverb", credits: "7 + 3/min" },
      { icon: Settings2, title: "Audio Mastering", description: "Masterização profissional", credits: "3 + 2/min" },
      { icon: Scissors, title: "Audio Cutter", description: "Corta partes do áudio", credits: "3 + 3/min" },
      { icon: Gauge, title: "Speed Changer", description: "Altera velocidade", credits: "3 + 3/min" },
    ],
    transform: [
      { icon: Shuffle, title: "Remix", description: "Transforma em novo estilo", credits: "20" },
      { icon: PlusCircle, title: "Extend", description: "Prolonga a música", credits: "20" },
      { icon: Paintbrush, title: "Inpaint", description: "Substitui parte específica", credits: "20" },
      { icon: Mic2, title: "Sing Over", description: "Adiciona vocais", credits: "20" },
      { icon: ArrowRightLeft, title: "Voice Change", description: "Transforma voz", credits: "6 + 3/min" },
      { icon: FileText, title: "Transcribe", description: "Converte áudio em texto", credits: "5" },
      { icon: Piano, title: "MIDI", description: "Extrai MIDI do áudio", credits: "10" },
      { icon: FileCode, title: "Convert", description: "Converte formatos", credits: "2" },
      { icon: Repeat, title: "Key/BPM", description: "Detecta e altera tonalidade", credits: "5" },
    ],
  }

  const creatorMusic = [
    {
      id: 1,
      title: "Around",
      artist: "@minahuang",
      plays: "93K",
      cover: "/vintage-portrait-album-cover.jpg",
    },
    {
      id: 2,
      title: "So Good",
      artist: "@kingmilo",
      plays: "89K",
      cover: "/neon-city-night-album-cover.jpg",
    },
    {
      id: 3,
      title: "Behind Your Eyes",
      artist: "@lukem",
      plays: "82K",
      cover: "/windmill-landscape-album-cover.jpg",
    },
    {
      id: 4,
      title: "Suck (My Vibe)",
      artist: "@scarlettwindsor",
      plays: "76K",
      cover: "/abstract-black-white-album-cover.jpg",
    },
    {
      id: 5,
      title: "To Be With Me",
      artist: "@zarastone98",
      plays: "71K",
      cover: "/dreamy-portrait-album-cover.jpg",
    },
    {
      id: 6,
      title: "Blame It",
      artist: "@justinflame",
      plays: "64K",
      cover: "/silhouette-sunset-album-cover.jpg",
    },
    {
      id: 7,
      title: "Landscape",
      artist: "@tristenbeats",
      plays: "61K",
      cover: "/red-light-abstract-album-cover.jpg",
    },
    {
      id: 8,
      title: "Midnight Dance",
      artist: "@scarlettwindsor",
      plays: "59K",
      cover: "/night-sky-silhouette-album-cover.jpg",
    },
    {
      id: 9,
      title: "Dreams",
      artist: "@zackmoore",
      plays: "56K",
      cover: "/person-walking-light-album-cover.jpg",
    },
    {
      id: 10,
      title: "Flame",
      artist: "@justinflame",
      plays: "55K",
      cover: "/sunset-silhouette-fire-album-cover.jpg",
    },
    {
      id: 11,
      title: "Moonlight",
      artist: "@lukem",
      plays: "53K",
      cover: "/person-moonlight-album-cover.jpg",
    },
    {
      id: 12,
      title: "Do You Have To Leave",
      artist: "@zackmoore",
      plays: "52K",
      cover: "/person-back-view-album-cover.jpg",
    },
  ]

  const handleToolClick = (toolTitle: string) => {
    console.log(`[v0] Tool selected: ${toolTitle}`)
  }

  const handlePlaySong = (songTitle: string) => {
    console.log(`[v0] Playing song: ${songTitle}`)
    const song = creatorMusic.find((s) => s.title === songTitle)
    if (song) {
      setCurrentSong(song)
    }
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
                text="DUA MUSIC"
                textColor="text-white"
                overlayColor="text-purple-500"
                fontSize={
                  isMobile ? "text-[42px] leading-[1.1]" : "text-[48px] sm:text-[70px] md:text-[100px] lg:text-[120px]"
                }
                letterDelay={0.08}
                overlayDelay={0.05}
                overlayDuration={0.4}
                springDuration={600}
                letterImages={[
                  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1507838153414-b4bf5292ceea?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=2070&h=2070&fit=crop",
                  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=2070&h=2070&fit=crop",
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
              Crie músicas incríveis com IA. Comece digitando sua ideia abaixo.
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
                isMobile ? "rounded-3xl bg-black/80" : "rounded-2xl bg-black/60",
              )}
            >
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  adjustHeight()
                }}
                placeholder="Ex: Lo-Fi instrumental song para estudar..."
                className={cn(
                  "w-full resize-none border-none bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/40 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
                  isMobile
                    ? "px-6 py-6 text-base min-h-[160px] leading-relaxed"
                    : "px-4 sm:px-5 lg:px-6 py-4 sm:py-4 lg:py-5 text-sm sm:text-base min-h-[100px] sm:min-h-[120px]",
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

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant={isInstrumental ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-14 px-5 text-base rounded-2xl active:scale-[0.98] transition-all font-medium",
                            isInstrumental
                              ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                              : "text-white/70 hover:text-white hover:bg-white/10",
                          )}
                          onClick={() => {
                            setIsInstrumental(!isInstrumental)
                            console.log(`[v0] Instrumental: ${!isInstrumental}`)
                          }}
                        >
                          <Music className="w-5 h-5 mr-2" />
                          Instrumental
                        </Button>

                        <Button
                          variant={hasLyrics ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-14 px-5 text-base rounded-2xl active:scale-[0.98] transition-all font-medium",
                            hasLyrics
                              ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                              : "text-white/70 hover:text-white hover:bg-white/10",
                          )}
                          onClick={() => {
                            setHasLyrics(!hasLyrics)
                            console.log(`[v0] Lyrics: ${!hasLyrics}`)
                          }}
                        >
                          <FileText className="w-5 h-5 mr-2" />
                          Lyrics
                        </Button>
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
                          {/* Create Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Criar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.create.map((tool) => {
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

                          {/* Separate Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Separar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.separate.map((tool) => {
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

                          {/* Improve Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Melhorar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.improve.map((tool) => {
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

                          {/* Transform Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Transformar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.transform.map((tool) => {
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
                          console.log(`[v0] Submit: ${message}`)
                          console.log(`[v0] Instrumental: ${isInstrumental}, Lyrics: ${hasLyrics}`)
                        }
                      }}
                    >
                      <ArrowUp className="w-6 h-6 mr-2" />
                      Gerar Música
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-white/70 hover:text-white hover:bg-white/10 rounded-lg active:scale-95",
                          isMobile ? "h-10 px-4 text-sm" : "h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm",
                        )}
                        onClick={() => console.log("[v0] Attach file clicked")}
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Anexar
                      </Button>

                      <Button
                        variant={isInstrumental ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "rounded-lg active:scale-95",
                          isMobile ? "h-10 px-4 text-sm" : "h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm",
                          isInstrumental
                            ? "bg-purple-500 hover:bg-purple-600 text-white"
                            : "text-white/70 hover:text-white hover:bg-white/10",
                        )}
                        onClick={() => {
                          setIsInstrumental(!isInstrumental)
                          console.log(`[v0] Instrumental: ${!isInstrumental}`)
                        }}
                      >
                        <Music className="w-4 h-4 mr-2" />
                        Instrumental
                      </Button>

                      <Button
                        variant={hasLyrics ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "rounded-lg active:scale-95",
                          isMobile ? "h-10 px-4 text-sm" : "h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm",
                          hasLyrics
                            ? "bg-purple-500 hover:bg-purple-600 text-white"
                            : "text-white/70 hover:text-white hover:bg-white/10",
                        )}
                        onClick={() => {
                          setHasLyrics(!hasLyrics)
                          console.log(`[v0] Lyrics: ${!hasLyrics}`)
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Lyrics
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "text-white/70 hover:text-white hover:bg-white/10 rounded-lg active:scale-95",
                              isMobile ? "h-10 px-4 text-sm" : "h-9 sm:h-9 px-3 sm:px-3 text-xs sm:text-sm",
                            )}
                          >
                            <MoreHorizontal className="w-4 h-4 mr-2" />
                            Tools
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className={cn(
                            "bg-black/95 backdrop-blur-xl border-white/20 max-h-[70vh] overflow-y-auto",
                            isMobile ? "w-[calc(100vw-2rem)]" : "w-[calc(100vw-2rem)] sm:w-80",
                          )}
                          align="start"
                        >
                          {/* Create Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Criar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.create.map((tool) => {
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

                          {/* Separate Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Separar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.separate.map((tool) => {
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

                          {/* Improve Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Melhorar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.improve.map((tool) => {
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

                          {/* Transform Category */}
                          <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider">
                            Transformar
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {toolsByCategory.transform.map((tool) => {
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

                    <div className="flex items-center justify-end">
                      <Button
                        disabled={!message.trim()}
                        className={cn(
                          "rounded-lg transition-all flex-shrink-0 active:scale-95",
                          isMobile
                            ? "h-12 px-6 text-base w-full"
                            : "h-10 sm:h-9 px-6 sm:px-6 text-sm sm:text-sm w-full sm:w-auto",
                          message.trim()
                            ? "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                            : "bg-white/10 text-white/40 cursor-not-allowed",
                        )}
                        onClick={() => {
                          if (message.trim()) {
                            console.log(`[v0] Submit: ${message}`)
                            console.log(`[v0] Instrumental: ${isInstrumental}, Lyrics: ${hasLyrics}`)
                          }
                        }}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Gerar Música
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
              <span>21 ferramentas</span>
              <span>•</span>
              <span>4 categorias</span>
            </div>
          </div>
        </main>

        {/* Gallery Section */}
        <section className={cn(isMobile ? "px-5 pb-10" : "px-3 sm:px-4 lg:px-6 pb-8 sm:pb-12 lg:pb-16")}>
          <div className="max-w-7xl mx-auto">
            <div className={cn("px-1", isMobile ? "mb-6" : "mb-4 sm:mb-6 lg:mb-8")}>
              <h3
                className={cn(
                  "font-bold text-white mb-2",
                  isMobile ? "text-2xl" : "text-lg sm:text-xl md:text-2xl lg:text-3xl",
                )}
              >
                Músicas dos Criadores
              </h3>
              <p className={cn("text-white/50", isMobile ? "text-base" : "text-xs sm:text-sm md:text-base")}>
                Descubra músicas criadas pela nossa comunidade
              </p>
            </div>

            <div
              className={cn(
                "grid",
                isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4",
              )}
            >
              {creatorMusic.map((song) => (
                <div
                  key={song.id}
                  className={cn(
                    "group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 transition-all duration-300 hover:border-purple-500/50 active:scale-[0.98]",
                    isMobile ? "rounded-2xl p-5" : "rounded-xl p-3 sm:p-4",
                  )}
                >
                  <div className={cn("flex items-center", isMobile ? "gap-4" : "gap-3 sm:gap-4")}>
                    <div className="relative flex-shrink-0">
                      <img
                        src={song.cover || "/placeholder.svg"}
                        alt={song.title}
                        className={cn("rounded-lg object-cover", isMobile ? "w-20 h-20" : "w-14 h-14 sm:w-16 sm:h-16")}
                      />
                      <button
                        onClick={() => handlePlaySong(song.title)}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg active:scale-95"
                      >
                        <div
                          className={cn(
                            "rounded-full bg-purple-500 flex items-center justify-center shadow-lg",
                            isMobile ? "w-10 h-10" : "w-7 h-7 sm:w-8 sm:h-8",
                          )}
                        >
                          <Play
                            className={cn(
                              "text-white fill-white ml-0.5",
                              isMobile ? "w-5 h-5" : "w-3.5 h-3.5 sm:w-4 sm:h-4",
                            )}
                          />
                        </div>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={cn(
                          "font-semibold text-white truncate mb-1",
                          isMobile ? "text-lg" : "text-sm sm:text-base",
                        )}
                      >
                        {song.title}
                      </h4>
                      <p className={cn("text-white/50 truncate", isMobile ? "text-base mb-1" : "text-xs sm:text-sm")}>
                        {song.artist}
                      </p>
                      <p className={cn("text-white/40", isMobile ? "text-sm" : "text-xs")}>{song.plays} plays</p>
                    </div>

                    <button
                      className={cn(
                        "flex-shrink-0 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors active:scale-95",
                        isMobile ? "w-12 h-12" : "w-9 h-9 sm:w-8 sm:h-8",
                      )}
                    >
                      <MoreVertical className={cn(isMobile ? "w-5 h-5" : "w-4 h-4")} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <AudioPlayer song={currentSong} onClose={() => setCurrentSong(null)} />
    </BeamsBackground>
  )
}
