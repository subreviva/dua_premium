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
      <div className="design-studio-container flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Mobile: Toolbar horizontal fixo no topo */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50">
          <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
        </div>

        {/* Desktop: Toolbar vertical lateral */}
        <div className="hidden md:block">
          <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
        </div>
        
        {/* Canvas - área principal com scroll otimizado */}
        <main className="flex-1 flex items-start md:items-center justify-center p-4 md:p-8 transition-all duration-300 relative overflow-y-auto overflow-x-hidden smooth-scroll mt-20 md:mt-0 mb-16 md:mb-0">
          <div className="w-full max-w-7xl">
            <Canvas 
              content={canvasContent} 
              isLoading={api.isLoading} 
              loadingMessage={api.loadingMessage} 
            />
          </div>
        </main>

        {/* Mobile: Painel fixo no bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 max-h-[60vh]">
          <aside className="w-full bg-black/95 backdrop-blur-xl border-t border-white/10 flex flex-col overflow-hidden shadow-2xl shadow-black/50">
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
        </div>

        {/* Desktop: Painel lateral direito */}
        <aside className="hidden md:flex w-96 bg-black/40 backdrop-blur-xl border-l border-white/5 flex-col overflow-hidden">
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
