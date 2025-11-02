"use client"

/**
 * Design Studio - Main Page
 * Página principal do estúdio de design com interface moderna
 */

import { useState, useCallback } from "react"
import { ToolId, CanvasContent, ImageObject } from "@/types/designstudio"
import { DesignToolbar } from "@/components/designstudio/DesignToolbar"
import { DesignCanvas } from "@/components/designstudio/DesignCanvas"
import { DesignSidePanel } from "@/components/designstudio/DesignSidePanel"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { BeamsBackground } from "@/components/ui/beams-background"

export default function DesignStudioPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const [canvasContent, setCanvasContent] = useState<CanvasContent>({ type: 'empty' })
  const [history, setHistory] = useState<CanvasContent[]>([{ type: 'empty' }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [sessionGallery, setSessionGallery] = useState<ImageObject[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleToolSelect = useCallback((toolId: ToolId) => {
    setActiveTool(toolId)
  }, [])

  const updateCanvas = useCallback((newContent: CanvasContent) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setCanvasContent(newContent)

    // Add to gallery if it's an image
    if (newContent.type === 'image' && !sessionGallery.some(item => item.src === newContent.src)) {
      setSessionGallery(prev => [
        { 
          src: newContent.src, 
          mimeType: newContent.mimeType,
          prompt: newContent.prompt,
          timestamp: Date.now()
        },
        ...prev
      ])
    }
  }, [history, historyIndex, sessionGallery])

  const handleContentUpdate = useCallback((content: CanvasContent) => {
    updateCanvas(content)
  }, [updateCanvas])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCanvasContent(history[newIndex])
    }
  }, [historyIndex, history])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCanvasContent(history[newIndex])
    }
  }, [historyIndex, history])

  const handleClearSession = useCallback(() => {
    const initialContent: CanvasContent = { type: 'empty' }
    setCanvasContent(initialContent)
    setHistory([initialContent])
    setHistoryIndex(0)
    setSessionGallery([])
    setActiveTool(null)
  }, [])

  const handleGenerationStart = useCallback(() => {
    setIsGenerating(true)
  }, [])

  const handleGenerationEnd = useCallback(() => {
    setIsGenerating(false)
  }, [])

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-white overflow-hidden">
      <PremiumNavbar />
      
      <div className="flex-1 flex overflow-hidden relative">
        <BeamsBackground className="absolute inset-0 opacity-30" />
        
        {/* Toolbar lateral esquerda */}
        <DesignToolbar 
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
        />

        {/* Canvas central */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
          <DesignCanvas
            content={canvasContent}
            isGenerating={isGenerating}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        </main>

        {/* Panel lateral direita */}
        <DesignSidePanel
          activeTool={activeTool}
          canvasContent={canvasContent}
          sessionGallery={sessionGallery}
          onContentUpdate={handleContentUpdate}
          onGenerationStart={handleGenerationStart}
          onGenerationEnd={handleGenerationEnd}
          onClearSession={handleClearSession}
        />
      </div>
    </div>
  )
}
