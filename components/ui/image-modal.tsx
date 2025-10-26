"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  X,
  Download,
  Edit,
  RefreshCw,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  image: {
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
    seed?: string
    timestamp: string
  }
  variations?: Array<{ url: string }>
}

export function ImageModal({ isOpen, onClose, image, variations = [] }: ImageModalProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPrompt, setShowPrompt] = useState(true)
  const [showMetadata, setShowMetadata] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const allImages = [{ url: image.url }, ...variations]

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "d":
        case "D":
          handleDownload()
          break
        case "e":
        case "E":
          handleEdit()
          break
        case "ArrowLeft":
          if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
          break
        case "ArrowRight":
          if (currentIndex < allImages.length - 1) setCurrentIndex(currentIndex + 1)
          break
        case "+":
        case "=":
          setZoom((z) => Math.min(z + 0.25, 3))
          break
        case "-":
        case "_":
          setZoom((z) => Math.max(z - 0.25, 0.5))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, currentIndex, allImages.length])

  // Reset zoom and position when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, currentIndex])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => {
      const newZoom = z - e.deltaY * 0.001
      return Math.max(0.5, Math.min(3, newZoom))
    })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      }
    },
    [zoom, position],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart, zoom],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDownload = () => {
    console.log("[v0] Downloading image...")
    // Simulate download
    const link = document.createElement("a")
    link.href = allImages[currentIndex].url
    link.download = `dua-vision-${Date.now()}.png`
    link.click()
  }

  const handleEdit = () => {
    console.log("[v0] Opening editor...")
  }

  const handleGenerateVariation = () => {
    console.log("[v0] Generating variation...")
  }

  const handleShare = () => {
    console.log("[v0] Sharing image...")
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">Imagem Gerada com Sucesso</h2>
                  <p className="text-white/50 text-sm">
                    {image.width} × {image.height} px
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white/50 text-xs">ESC</span>
                  <span className="text-white/30 text-xs">fechar</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white/50 text-xs">D</span>
                  <span className="text-white/30 text-xs">download</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white/50 text-xs">E</span>
                  <span className="text-white/30 text-xs">editar</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg h-9 w-9 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
              <div
                className={cn(
                  "relative max-w-full max-h-full transition-transform duration-200",
                  zoom > 1 && "cursor-move",
                )}
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={allImages[currentIndex].url || "/placeholder.svg"}
                  alt="Generated"
                  className="max-w-full max-h-[calc(100vh-300px)] rounded-xl shadow-2xl border border-white/10"
                  draggable={false}
                />
              </div>

              {/* Zoom Controls */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-lg h-10 w-10 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1">
                  <span className="text-white text-xs font-medium">{Math.round(zoom * 100)}%</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-lg h-10 w-10 p-0"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  {currentIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                      className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-lg h-12 w-12 p-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                  )}
                  {currentIndex < allImages.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      className="absolute right-24 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-lg h-12 w-12 p-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  )}
                </>
              )}

              {/* Prompt Badge */}
              <div className="absolute top-8 left-8 max-w-md">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Prompt</span>
                    {showPrompt ? (
                      <ChevronUp className="w-3.5 h-3.5 text-white/50" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                    )}
                  </button>
                  {showPrompt && (
                    <div className="px-4 pb-3 border-t border-white/10">
                      <p className="text-white/80 text-sm leading-relaxed mt-2">{image.prompt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Badge */}
              <div className="absolute bottom-8 left-8 max-w-md">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowMetadata(!showMetadata)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Metadata</span>
                    {showMetadata ? (
                      <ChevronUp className="w-3.5 h-3.5 text-white/50" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                    )}
                  </button>
                  {showMetadata && (
                    <div className="px-4 pb-3 border-t border-white/10 space-y-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Modelo:</span>
                        <span className="text-white">{image.settings.model}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Estilo:</span>
                        <span className="text-white">{image.settings.style}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Proporção:</span>
                        <span className="text-white">{image.settings.aspectRatio}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Resolução:</span>
                        <span className="text-white">{image.settings.resolution}</span>
                      </div>
                      {image.seed && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">Seed:</span>
                          <span className="text-white font-mono text-xs">{image.seed}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Timestamp:</span>
                        <span className="text-white">{image.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-black/40 backdrop-blur-md border-t border-white/10">
              <Button
                onClick={handleDownload}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg h-10 px-6 gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <Download className="w-4 h-4" />
                Descarregar PNG
              </Button>

              <Button
                onClick={handleEdit}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg h-10 px-6 gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>

              <Button
                onClick={handleGenerateVariation}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg h-10 px-6 gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <RefreshCw className="w-4 h-4" />
                Gerar Variação
              </Button>

              <Button
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "backdrop-blur-sm border text-white rounded-lg h-10 px-6 gap-2 transition-all hover:scale-105",
                  isFavorite
                    ? "bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/20"
                    : "bg-white/10 hover:bg-white/20 border-white/20 hover:shadow-lg hover:shadow-white/10",
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-pink-500 text-pink-500")} />
                {isFavorite ? "Nos Favoritos" : "Adicionar aos Favoritos"}
              </Button>

              <Button
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-lg h-10 px-6 gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                <Share2 className="w-4 h-4" />
                Partilhar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
