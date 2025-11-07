"use client"

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomFit: () => void
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomFit }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg">
      <Button
        size="sm"
        variant="ghost"
        onClick={onZoomOut}
        className="h-8 w-8 p-0 hover:bg-white/10 transition-all hover:scale-110"
        title="Zoom Out (Ctrl + -)"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>

      <span className="text-sm font-mono text-white/70 min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>

      <Button
        size="sm"
        variant="ghost"
        onClick={onZoomIn}
        className="h-8 w-8 p-0 hover:bg-white/10 transition-all hover:scale-110"
        title="Zoom In (Ctrl + +)"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <Button
        size="sm"
        variant="ghost"
        onClick={onZoomFit}
        className="h-8 w-8 p-0 hover:bg-white/10 transition-all hover:scale-110"
        title="Fit to Window (Ctrl + 0)"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
