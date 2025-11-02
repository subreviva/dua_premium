"use client"

/**
 * Session Gallery Panel
 * Painel com galeria de imagens da sessão atual
 */

import { ImageObject } from "@/types/designstudio"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Image from "next/image"

interface SessionGalleryPanelProps {
  gallery: ImageObject[]
  onImageSelect: (image: ImageObject) => void
  onClearSession: () => void
}

export function SessionGalleryPanel({
  gallery,
  onImageSelect,
  onClearSession,
}: SessionGalleryPanelProps) {
  if (gallery.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-purple-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Galeria Vazia
            </h3>
            <p className="text-sm text-gray-400">
              Suas imagens geradas aparecerão aqui
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Galeria da Sessão ({gallery.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSession}
          className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {gallery.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            onClick={() => onImageSelect(image)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-200 hover:scale-[1.02]"
          >
            <Image
              src={image.src}
              alt={image.prompt || `Imagem ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
            
            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {image.prompt && (
                  <p className="text-xs text-white/90 line-clamp-2 mb-1">
                    {image.prompt}
                  </p>
                )}
                <p className="text-[10px] text-white/60">
                  {new Date(image.timestamp).toLocaleString('pt-BR', { 
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
