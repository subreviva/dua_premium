"use client"

/**
 * Design Canvas
 * Área central para exibir e interagir com designs
 */

import { CanvasContent } from "@/types/designstudio"
import { Undo2, Redo2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DesignCanvasProps {
  content: CanvasContent
  isGenerating: boolean
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function DesignCanvas({
  content,
  isGenerating,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: DesignCanvasProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar superior */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-9 w-9 p-0 hover:bg-white/10 disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-9 w-9 p-0 hover:bg-white/10 disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-4xl aspect-square">
          {content.type === 'empty' && !isGenerating && (
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm">
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
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Comece a Criar
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Selecione uma ferramenta à esquerda para começar
                  </p>
                </div>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
              <p className="text-gray-400">Gerando seu design...</p>
            </div>
          )}

          {content.type === 'image' && !isGenerating && (
            <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 bg-black/20">
              <Image
                src={content.src}
                alt={content.prompt || "Design gerado"}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          )}

          {content.type === 'svg' && !isGenerating && (
            <div className="w-full h-full flex items-center justify-center border border-white/10 rounded-2xl bg-white p-8">
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: content.code }}
              />
            </div>
          )}

          {content.type === 'text-result' && !isGenerating && (
            <div className="w-full h-full border border-white/10 rounded-2xl bg-black/20 backdrop-blur-sm p-8 overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {content.content}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
