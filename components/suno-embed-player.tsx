"use client"

import { useState } from "react"
import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SunoEmbedPlayerProps {
  trackId: string
  title: string
  open: boolean
  onClose: () => void
}

export function SunoEmbedPlayer({ trackId, title, open, onClose }: SunoEmbedPlayerProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>{title}</span>
            <a
              href={`https://suno.com/song/${trackId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Abrir no Suno
              <ExternalLink className="w-4 h-4" />
            </a>
          </DialogTitle>
        </DialogHeader>
        
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://suno.com/embed/${trackId}`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full h-full"
          />
        </div>

        <div className="text-xs text-zinc-500 text-center">
          Player oficial do Suno • Reprodução garantida
        </div>
      </DialogContent>
    </Dialog>
  )
}
