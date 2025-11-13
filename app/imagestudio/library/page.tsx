"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageSidebar } from "@/components/image-sidebar"
import Link from "next/link"
import { 
  Image as ImageIcon, 
  Download, 
  Share2, 
  Heart, 
  Trash2,
  Search,
  Filter,
  Grid3x3,
  LayoutGrid,
  Sparkles,
  Library
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  aspectRatio: string
  timestamp: string
  liked?: boolean
}

export default function ImageLibraryPage() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid")

  useEffect(() => {
    // Carregar imagens do localStorage
    const loadImages = () => {
      try {
        const savedImages = localStorage.getItem("generated-images")
        if (savedImages) {
          setImages(JSON.parse(savedImages))
        }
      } catch (error) {
        console.error("Erro ao carregar imagens:", error)
      }
    }

    loadImages()
    // Atualizar a cada 2 segundos para capturar novas imagens
    const interval = setInterval(loadImages, 2000)
    return () => clearInterval(interval)
  }, [])

  const filteredImages = images.filter((img) =>
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.style.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id)
    setImages(updatedImages)
    localStorage.setItem("generated-images", JSON.stringify(updatedImages))
    setSelectedImage(null)
  }

  const handleLike = (id: string) => {
    const updatedImages = images.map((img) =>
      img.id === id ? { ...img, liked: !img.liked } : img
    )
    setImages(updatedImages)
    localStorage.setItem("generated-images", JSON.stringify(updatedImages))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar */}
      <div className="hidden md:block">
        <ImageSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-[120px] md:pb-0">
          
          {/* Header */}
          <div className="relative min-h-[180px] md:min-h-[250px] overflow-hidden border-b border-white/5">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image 
                src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/448aa0af-abc6-4d9e-ab02-ad9d797d5dff.png"
                alt="Biblioteca Background"
                fill
                className="object-cover object-center"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-[32px] md:text-[48px] font-semibold tracking-tight text-white mb-2 md:mb-3">
                  Biblioteca de Imagens
                </h1>
                <p className="text-[14px] md:text-[15px] text-white/60 max-w-[600px]">
                  {images.length} {images.length === 1 ? 'imagem criada' : 'imagens criadas'}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-3 md:py-4">
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={0.75} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar por prompt ou estilo..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:border-[#8B7355]/50 focus:outline-none transition-all text-sm"
                  />
                </div>

                {/* View mode */}
                <div className="flex items-center gap-2 p-1 bg-white/[0.03] rounded-lg border border-white/[0.08]">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-md transition-all",
                      viewMode === "grid" ? "bg-[#8B7355]/20 text-[#8B7355]" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    <Grid3x3 className="w-5 h-5" strokeWidth={0.75} />
                  </button>
                  <button
                    onClick={() => setViewMode("masonry")}
                    className={cn(
                      "p-2 rounded-md transition-all",
                      viewMode === "masonry" ? "bg-[#8B7355]/20 text-[#8B7355]" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    <LayoutGrid className="w-5 h-5" strokeWidth={0.75} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-8 md:py-12">
            {filteredImages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#8B7355]/10 border border-white/10 flex items-center justify-center mb-6">
                  <ImageIcon className="w-10 h-10 text-white/30" strokeWidth={0.75} />
                </div>
                <h3 className="text-xl font-semibold text-white/90 mb-2">
                  Nenhuma imagem encontrada
                </h3>
                <p className="text-white/50 text-center max-w-md">
                  {searchQuery 
                    ? "Tenta outro termo de pesquisa"
                    : "As tuas imagens geradas aparecerão aqui. Começa a criar!"}
                </p>
              </motion.div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              )}>
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.08] hover:border-[#8B7355]/30 transition-all">
                      <Image
                        src={image.url}
                        alt={image.prompt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex flex-col justify-between p-4">
                          {/* Top actions */}
                          <div className="flex justify-end gap-2">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleLike(image.id)}
                              className={cn(
                                "w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all",
                                image.liked 
                                  ? "bg-pink-500/30 border-pink-500/50" 
                                  : "bg-white/10 border-white/20 hover:bg-white/20"
                              )}
                            >
                              <Heart 
                                className={cn("w-5 h-5", image.liked ? "fill-pink-500 text-pink-500" : "text-white")} 
                                strokeWidth={0.75} 
                              />
                            </motion.button>
                          </div>

                          {/* Bottom info and actions */}
                          <div className="space-y-3">
                            <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                              {image.prompt}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-[#8B7355]/20 border border-[#8B7355]/30 rounded-lg text-xs text-[#8B7355]">
                                {image.style}
                              </span>
                              <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-xs text-white/60">
                                {image.aspectRatio}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedImage(image)}
                                className="flex-1 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg text-sm text-white font-medium transition-all"
                              >
                                Ver Detalhes
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg flex items-center justify-center transition-all"
                              >
                                <Download className="w-4 h-4 text-white" strokeWidth={0.75} />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(image.id)}
                                className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-lg flex items-center justify-center transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" strokeWidth={0.75} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-zinc-950/90 border border-white/10 rounded-3xl overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.prompt}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3">Detalhes da Imagem</h3>
                    <p className="text-white/70 leading-relaxed">{selectedImage.prompt}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/50">Estilo</span>
                      <span className="text-white font-medium">{selectedImage.style}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/50">Proporção</span>
                      <span className="text-white font-medium">{selectedImage.aspectRatio}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/10">
                      <span className="text-white/50">Criada em</span>
                      <span className="text-white font-medium">
                        {new Date(selectedImage.timestamp).toLocaleDateString('pt-PT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button className="flex-1 py-3 bg-[#8B7355] hover:bg-[#9B8365] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" strokeWidth={0.75} />
                      Download
                    </button>
                    <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5" strokeWidth={0.75} />
                      Partilhar
                    </button>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <ImageIcon className="w-5 h-5 text-white" strokeWidth={0.75} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Style Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-2xl border-t border-white/[0.08]">
        <div className="safe-area-inset-bottom">
          <div className="flex items-center justify-around px-6 py-3">
            {/* Criar Button */}
            <Link href="/imagestudio/create" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all duration-300 flex flex-col items-center gap-1.5"
              >
                <Sparkles className="w-5 h-5 text-white/70" strokeWidth={0.75} />
                <span className="text-xs font-medium text-white/70">Criar</span>
              </motion.button>
            </Link>

            <div className="w-3" />

            {/* Biblioteca Button - Active */}
            <Link href="/imagestudio/library" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full py-3.5 rounded-xl bg-[#8B7355]/10 border border-[#8B7355]/30 hover:bg-[#8B7355]/20 transition-all duration-300 flex flex-col items-center gap-1.5"
              >
                <Library className="w-5 h-5 text-[#8B7355]" strokeWidth={0.75} />
                <span className="text-xs font-medium text-[#8B7355]">Biblioteca</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
