export const dynamic = 'force-dynamic'

"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Library, Search, Music, MoreVertical, Play, Download, Trash2, ThumbsUp } from "lucide-react"
import { useState } from "react"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { useGeneration } from "@/contexts/generation-context"

interface Track {
  id: string
  audioId: string
  title: string
  prompt: string
  tags: string
  duration: number
  audioUrl: string
  streamAudioUrl: string
  imageUrl: string
  modelName: string
  createTime: string
  taskId: string
}

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { completedTracks, playTrack } = useGeneration()
  const tracks = completedTracks

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tags.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openTrackDetails = (track: Track) => {
    setSelectedTrack(track)
    setIsModalOpen(true)
  }

  const deleteTrack = (trackId: string) => {
    // TODO: Implement delete functionality
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <main className="flex-1 h-[100dvh] flex flex-col md:h-screen md:overflow-auto overflow-hidden">
        <div className="sticky top-0 z-10 border-b border-border/30 bg-background/98 backdrop-blur-2xl px-4 py-3 pt-safe shrink-0 md:px-8 md:py-5">
          <div className="flex items-center gap-2.5 mb-3 md:gap-3 md:mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 md:h-12 md:w-12">
              <Library className="h-4 w-4 text-primary md:h-5 md:w-5" />
            </div>
            <div>
              <h1 className="text-lg font-light tracking-tight md:text-2xl">Biblioteca</h1>
              <p className="text-[10px] text-muted-foreground/70 font-light md:text-xs">{tracks.length} faixas</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50 md:left-3.5 md:h-4 md:w-4" />
            <Input
              placeholder="Pesquisar música..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-secondary/30 border-0 font-light text-[11px] placeholder:text-muted-foreground/50 md:pl-11 md:h-11 md:text-sm md:rounded-2xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto smooth-scroll px-4 py-3 pb-[96px] md:px-8 md:py-5 md:pb-8">
          {filteredTracks.length > 0 ? (
            <div className="flex flex-col gap-3 md:gap-4">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="group flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 active:bg-secondary/30 md:hover:bg-secondary/20 md:gap-4 md:p-3"
                >
                  <div
                    className="relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden cursor-pointer bg-cover bg-center md:w-20 md:h-20 md:rounded-2xl"
                    style={{
                      backgroundImage: track.imageUrl ? `url(${track.imageUrl})` : "none",
                      backgroundColor: !track.imageUrl ? "hsl(var(--primary) / 0.08)" : undefined,
                    }}
                    onClick={() => playTrack(track)}
                  >
                    {!track.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="h-7 w-7 text-primary/30 md:h-8 md:w-8" />
                      </div>
                    )}

                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-sm">
                      <span className="text-[10px] font-medium text-white leading-none">
                        {formatDuration(track.duration)}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-lg md:h-9 md:w-9">
                        <Play className="h-3.5 w-3.5 text-slate-900 ml-0.5 md:h-4 md:w-4" fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm leading-tight truncate md:text-base">{track.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-secondary/60 text-[10px] font-medium text-muted-foreground md:text-xs">
                        Cobrir
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/15 text-[10px] font-medium text-pink-600 md:text-xs">
                        v5
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground/70 line-clamp-1 font-light md:text-xs">
                      {track.tags || track.prompt}
                    </p>

                    <div className="flex items-center gap-3 mt-0.5 md:gap-4">
                      <div className="flex items-center gap-1.5">
                        <Play className="h-3 w-3 text-muted-foreground/60 md:h-3.5 md:w-3.5" />
                        <span className="text-[11px] text-muted-foreground/70 font-medium md:text-xs">0</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="h-3 w-3 text-muted-foreground/60 md:h-3.5 md:w-3.5" />
                        <span className="text-[11px] text-muted-foreground/70 font-medium md:text-xs">0</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8 hover:bg-secondary/50 md:h-9 md:w-9"
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground/60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 md:w-44">
                      <DropdownMenuItem onClick={() => openTrackDetails(track)}>
                        <Music className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="text-xs md:text-sm">Ver Detalhes</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(track.audioUrl, "_blank")}>
                        <Download className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="text-xs md:text-sm">Descarregar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTrack(track.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="text-xs md:text-sm">Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center md:py-16">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 md:mb-4 md:h-20 md:w-20">
                <Music className="h-8 w-8 text-primary/50 md:h-10 md:w-10" />
              </div>
              <h3 className="mb-1 text-sm font-light md:mb-2 md:text-lg">
                {tracks.length === 0 ? "Ainda sem faixas" : "Nenhuma faixa encontrada"}
              </h3>
              <p className="text-[11px] text-muted-foreground/70 font-light md:text-sm">
                {tracks.length === 0 ? "Crie a sua primeira faixa para começar" : "Tente ajustar a sua pesquisa"}
              </p>
            </div>
          )}
        </div>
      </main>

      {selectedTrack && <TrackDetailModal open={isModalOpen} onOpenChange={setIsModalOpen} track={selectedTrack} />}
    </div>
  )
}
