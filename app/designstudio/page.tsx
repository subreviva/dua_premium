'use client';

import React, { useState, useCallback } from 'react';
import { ToolId, CanvasContent, ImageObject } from '@/types/designstudio-full';
import { useGoogleApi } from '@/hooks/useGoogleApi';
import DesignToolbar from '@/components/designstudio/Toolbar';
import DesignCanvas from '@/components/designstudio/Canvas';
import DesignSidePanel from '@/components/designstudio/SidePanel';
import { PremiumNavbar } from '@/components/ui/premium-navbar';
import { BeamsBackground } from '@/components/ui/beams-background';

export default function DesignStudioPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [canvasContent, setCanvasContent] = useState<CanvasContent>({ type: 'empty' });
  const [history, setHistory] = useState<CanvasContent[]>([{ type: 'empty' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sessionGallery, setSessionGallery] = useState<ImageObject[]>([]);
  
  const api = useGoogleApi();

  const handleToolSelect = useCallback((toolId: ToolId) => {
    setActiveTool(toolId);
    const textTools: ToolId[] = ['design-trends', 'analyze-image', 'design-assistant', 'export-project'];
    if (textTools.includes(toolId) && canvasContent.type !== 'text-result') {
      if (canvasContent.type === 'empty') {
        setCanvasContent({ type: 'text-result' });
      }
    }
  }, [canvasContent.type]);

  const updateCanvas = useCallback((newContent: CanvasContent) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanvasContent(newContent);

    if (newContent.type === 'image' && !sessionGallery.some(item => item.src === newContent.src)) {
      setSessionGallery(prev => [
        { src: newContent.src, mimeType: newContent.mimeType },
        ...prev
      ]);
    }
  }, [history, historyIndex, sessionGallery]);

  const handleContentUpdate = useCallback((content: CanvasContent) => {
    updateCanvas(content);
    const nonSwitchingTools: ToolId[] = [
      'color-palette',
      'generate-variations',
      'analyze-image',
      'design-trends',
      'design-assistant',
      'export-project'
    ];
    if (content.type === 'image' && activeTool && !nonSwitchingTools.includes(activeTool)) {
      setActiveTool('edit-image');
    }
  }, [activeTool, updateCanvas]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasContent(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasContent(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleSelectHistory = useCallback((content: CanvasContent) => {
    updateCanvas(content);
  }, [updateCanvas]);

  const handleClearSession = useCallback(() => {
    const initialContent: CanvasContent = { type: 'empty' };
    setCanvasContent(initialContent);
    setHistory([initialContent]);
    setHistoryIndex(0);
    setSessionGallery([]);
    setActiveTool(null);
  }, []);

  return (
    <>
      <PremiumNavbar />
      <div className="fixed inset-0 top-16">
        <BeamsBackground />
        <div className="relative h-full flex bg-black/40 backdrop-blur-sm">
          <DesignToolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
          
          <main className="flex-1 flex items-center justify-center p-4 md:p-8">
            <DesignCanvas 
              content={canvasContent}
              isLoading={api.isLoading}
              loadingMessage={api.loadingMessage}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          </main>

          <DesignSidePanel
            activeTool={activeTool}
            canvasContent={canvasContent}
            onContentUpdate={handleContentUpdate}
            api={api}
            isLoading={api.isLoading}
            error={api.error}
            history={history}
            historyIndex={historyIndex}
            sessionGallery={sessionGallery}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSelectHistory={handleSelectHistory}
            onClearSession={handleClearSession}
          />
        </div>
      </div>
    </>
  );
}
