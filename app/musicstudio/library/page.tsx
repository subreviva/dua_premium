"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Library, Search, Music, MoreVertical, Play, Download, Trash2, ThumbsUp, Sparkles } from "lucide-react"
import { useState } from "react"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { useGeneration } from "@/contexts/generation-context"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

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
    <div className="flex h-screen overflow-hidden bg-black relative">
      {/* AppSidebar Esquerda */}
      <div className="hidden md:block relative z-20">
        <AppSidebar />
      </div>

      {/* Background Profissional */}
      <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 h-[100dvh] flex flex-col md:h-screen overflow-y-auto md:pt-0 relative z-10 transition-all duration-500">
        {/* Desktop Header com Imagem de Capa */}
        <motion.div 
          className="hidden md:block relative overflow-hidden border-b border-white/[0.05] shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Imagem de Fundo */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80"
              alt="Biblioteca"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50" />
          </div>

          {/* Conteúdo do Header */}
          <div className="relative z-10 py-16 px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="flex items-center gap-4 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-2xl shadow-orange-500/30">
                  <Library className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-display font-bold tracking-tight text-white mb-2 drop-shadow-2xl">
                    Minha Biblioteca
                  </h1>
                  <p className="text-lg text-zinc-200 font-light tracking-wide drop-shadow-lg">
                    {tracks.length} {tracks.length === 1 ? 'música criada' : 'músicas criadas'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="shrink-0 px-4 py-4 md:px-8 md:py-6 border-b border-white/[0.05] bg-black/40 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 md:h-5 md:w-5" />
              <Input
                placeholder="Pesquisar na biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 md:pl-12 h-12 md:h-14 rounded-2xl md:rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-orange-500/30 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 text-sm md:text-base font-medium shadow-inner"
              />
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div 
          className="flex-1 px-4 py-4 pb-[96px] md:px-8 md:py-8 md:pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            {filteredTracks.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        delay: index * 0.05, 
                        duration: 0.4,
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }}
                      className="group relative rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] overflow-hidden hover:border-orange-500/40 hover:from-orange-500/5 hover:to-pink-600/5 transition-all duration-500 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => playTrack(track)}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-pink-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Image Container */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
                        {track.imageUrl ? (
                          <Image
                            src={track.imageUrl}
                            alt={track.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Music className="h-16 w-16 text-zinc-700" />
                          </div>
                        )}
                        
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <button className="relative rounded-full bg-gradient-to-br from-orange-500 to-pink-600 p-5 hover:scale-110 transition-transform duration-300 shadow-2xl shadow-orange-500/50">
                            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                            <Play className="relative h-6 w-6 text-white ml-1" fill="white" />
                          </button>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10">
                          <span className="text-xs font-bold text-white leading-none">
                            {formatDuration(track.duration)}
                          </span>
                        </div>

                        {/* Model Badge */}
                        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/90 to-pink-600/90 backdrop-blur-md border border-white/20">
                          <span className="text-xs font-bold text-white leading-none">
                            {track.modelName || "v3.5"}
                          </span>
                        </div>
                      </div>

                      {/* Track Info */}
                      <div className="relative p-4">
                        <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
                          {track.title || "Sem Título"}
                        </h3>
                        
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
                          {track.tags || track.prompt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Play className="h-3.5 w-3.5 text-zinc-600" />
                              <span className="text-xs text-zinc-400 font-medium">0</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ThumbsUp className="h-3.5 w-3.5 text-zinc-600" />
                              <span className="text-xs text-zinc-400 font-medium">0</span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-zinc-900/95 border-white/10 backdrop-blur-2xl">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openTrackDetails(track); }} className="text-white">
                                <Music className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(track.audioUrl, "_blank"); }} className="text-white">
                                <Download className="mr-2 h-4 w-4" />
                                Descarregar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }} className="text-red-400">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-orange-500/20 to-pink-600/20 blur-3xl" />
                  <div className="relative rounded-[2.5rem] bg-gradient-to-br from-orange-600/20 to-red-700/20 p-16 backdrop-blur-xl border border-white/10">
                    <Music className="h-24 w-24 text-orange-500" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                  {tracks.length === 0 ? "Biblioteca Vazia" : "Nenhuma música encontrada"}
                </h3>
                <p className="text-base text-zinc-400 leading-relaxed max-w-md mb-8">
                  {tracks.length === 0 
                    ? "Crie sua primeira música e ela aparecerá aqui" 
                    : "Tente ajustar sua pesquisa para encontrar o que procura"}
                </p>
                {tracks.length === 0 && (
                  <Button
                    onClick={() => window.location.href = '/musicstudio/create'}
                    className="group relative rounded-full h-12 px-8 text-base font-semibold bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-500"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-600 via-red-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Criar Primeira Música
                    </span>
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {selectedTrack && <TrackDetailModal open={isModalOpen} onOpenChange={setIsModalOpen} track={selectedTrack} />}
    </div>
  )
}
