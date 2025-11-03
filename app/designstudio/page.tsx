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
        {/* Mobile: iOS Premium Toolbar - Fixed top */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="bg-black/90 backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
          </div>
        </div>

        {/* Desktop: Toolbar vertical lateral */}
        <div className="hidden md:block">
          <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
        </div>
        
        {/* Canvas - iOS Premium Scroll com bounce */}
        <main className="flex-1 flex items-start md:items-center justify-center transition-all duration-300 relative overflow-y-auto overflow-x-hidden md:p-8">
          <style jsx>{`
            /* iOS Bounce Scroll */
            main {
              -webkit-overflow-scrolling: touch;
              overscroll-behavior-y: contain;
            }
            @media (max-width: 768px) {
              main {
                padding-top: calc(env(safe-area-inset-top) + 4rem);
                padding-bottom: calc(env(safe-area-inset-bottom) + 20rem);
                padding-left: 1rem;
                padding-right: 1rem;
              }
            }
          `}</style>
          <div className="w-full max-w-7xl">
            <Canvas 
              content={canvasContent} 
              isLoading={api.isLoading} 
              loadingMessage={api.loadingMessage} 
            />
          </div>
        </main>

        {/* Mobile: iOS Bottom Sheet Premium - Fixed Position */}
        <div 
          className="md:hidden fixed bottom-0 left-0 right-0 z-20"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <aside className="w-full bg-gradient-to-b from-black/96 via-black/98 to-black backdrop-blur-3xl border-t border-white/10 flex flex-col overflow-hidden shadow-[0_-15px_50px_rgba(0,0,0,0.95)] rounded-t-3xl max-h-[65vh]">
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
