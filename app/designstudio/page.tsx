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
        {/* Mobile: iOS Premium Toolbar - Fixed top com blur e shadow */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 safe-top">
          <div className="bg-black/90 backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
          </div>
        </div>

        {/* Desktop: Toolbar vertical lateral */}
        <div className="hidden md:block">
          <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
        </div>
        
        {/* Canvas - iOS Premium Scroll com bounce */}
        <main className="flex-1 flex items-start md:items-center justify-center transition-all duration-300 relative overflow-y-auto overflow-x-hidden md:p-8 safe-top safe-bottom">
          <style jsx>{`
            /* iOS Bounce Scroll & Safe Areas */
            .safe-top {
              padding-top: env(safe-area-inset-top);
            }
            .safe-bottom {
              padding-bottom: env(safe-area-inset-bottom);
            }
            main {
              -webkit-overflow-scrolling: touch;
              overscroll-behavior-y: contain;
            }
            @media (max-width: 768px) {
              main {
                padding-top: calc(env(safe-area-inset-top) + 4.5rem);
                padding-bottom: calc(env(safe-area-inset-bottom) + 24rem);
                padding-left: 1rem;
                padding-right: 1rem;
              }
            }
            /* iOS Spring Animation */
            @keyframes ios-spring {
              0% { transform: translateY(100%); }
              60% { transform: translateY(-2%); }
              80% { transform: translateY(1%); }
              100% { transform: translateY(0); }
            }
            .animate-ios-spring {
              animation: ios-spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            /* Drag Handle Glow */
            .drag-handle {
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
            }
            .drag-handle:active {
              box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
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

        {/* Mobile: iOS Bottom Sheet Premium - Glassmorphism Elite */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom animate-ios-spring">
          <div className="relative">
            {/* iOS Drag Handle - Interactive */}
            <div className="absolute -top-6 left-0 right-0 flex justify-center py-2 pointer-events-none">
              <div className="drag-handle w-10 h-1 bg-white/30 rounded-full backdrop-blur-xl transition-all duration-200 active:w-12 active:h-1.5 active:bg-white/50"></div>
            </div>
            
            {/* Bottom Sheet - Ultra Premium Glassmorphism */}
            <aside className="w-full bg-gradient-to-b from-black/96 via-black/98 to-black backdrop-blur-3xl border-t border-white/10 flex flex-col overflow-hidden shadow-[0_-15px_50px_rgba(0,0,0,0.95)] rounded-t-3xl max-h-[70vh] transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
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
