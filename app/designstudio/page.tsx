'use client';

import React, { useState, useCallback } from 'react';
import { ToolId, CanvasContent, ImageObject } from '@/types/designstudio';
import Toolbar from '@/components/designstudio-original/Toolbar';
import Canvas from '@/components/designstudio-original/Canvas';
import { useDuaApi } from '@/hooks/useDuaApi';
import { ToastProvider } from '@/hooks/useToast';
import ToastContainer from '@/components/designstudio-original/ui/ToastContainer';
import SidePanelTabs from '@/components/designstudio-original/SidePanelTabs';

export default function DesignStudioPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [canvasContent, setCanvasContent] = useState<CanvasContent>({ type: 'empty' });
  const [history, setHistory] = useState<CanvasContent[]>([canvasContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sessionGallery, setSessionGallery] = useState<ImageObject[]>([]);
  
  const api = useDuaApi();

  const handleToolSelect = useCallback((toolId: ToolId) => {
    setActiveTool(toolId);
    const textTools: ToolId[] = ['design-trends', 'analyze-image', 'design-assistant', 'export-project'];
    if (textTools.includes(toolId) && canvasContent.type !== 'text-result') {
        if (canvasContent.type === 'empty') {
            setCanvasContent({ type: 'text-result' });
        }
    }
  }, [canvasContent.type]);

  const updateCanvas = (newContent: CanvasContent) => {
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
  };

  const handleContentUpdate = (content: CanvasContent) => {
    updateCanvas(content);
    const nonSwitchingTools: ToolId[] = ['color-palette', 'generate-variations', 'analyze-image', 'design-trends', 'design-assistant', 'export-project'];
    if (content.type === 'image' && activeTool && !nonSwitchingTools.includes(activeTool)) {
      setActiveTool('edit-image');
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasContent(history[newIndex]);
    }
  };

  const setCanvasFromHistoryOrGallery = (content: CanvasContent) => {
    updateCanvas(content);
  };

  const handleClearSession = () => {
    const initialContent: CanvasContent = { type: 'empty' };
    setCanvasContent(initialContent);
    setHistory([initialContent]);
    setHistoryIndex(0);
    setSessionGallery([]);
    setActiveTool(null);
  };

  return (
    <ToastProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
        
        <main className="flex-1 flex items-center justify-center p-4 md:p-8 transition-all duration-300 relative">
          <Canvas 
            content={canvasContent} 
            isLoading={api.isLoading} 
            loadingMessage={api.loadingMessage} 
          />
        </main>

        <aside className="w-full md:w-96 bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col">
          <SidePanelTabs
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
            onSelectHistory={setCanvasFromHistoryOrGallery}
            onClearSession={handleClearSession}
          />
        </aside>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
