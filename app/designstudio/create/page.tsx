'use client';

import React, { useState, useCallback } from 'react';
import { ToolId, CanvasContent, ImageObject } from '@/types/designstudio';
import Toolbar from '@/components/designstudio-original/Toolbar';
import Canvas from '@/components/designstudio-original/Canvas';
import { useDuaApi } from '@/hooks/useDuaApi';
import { ToastProvider } from '@/hooks/useToast';
import ToastContainer from '@/components/designstudio-original/ui/ToastContainer';
import SidePanelTabs from '@/components/designstudio-original/SidePanelTabs';
import ToolsModal from '@/components/designstudio-original/ToolsModal';
import ToolsBar from '@/components/designstudio-original/ToolsBar';

export default function DesignStudioPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [canvasContent, setCanvasContent] = useState<CanvasContent>({ type: 'empty' });
  const [history, setHistory] = useState<CanvasContent[]>([canvasContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sessionGallery, setSessionGallery] = useState<ImageObject[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [panelHeight, setPanelHeight] = useState<'half' | 'full'>('half'); // Novo: controle de altura
  
  const api = useDuaApi();

  const handleToolSelect = useCallback((toolId: ToolId) => {
    setActiveTool(toolId);
    setShowToolPanel(true);
    setPanelHeight('half'); // Sempre começa em half quando seleciona tool
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
      <div className="design-studio-container flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-black">
        
        {/* Mobile: iOS Premium Toolbar - Fixed at top */}
        <div className="md:hidden fixed left-0 right-0 z-40 top-16">
          <div className="bg-black/80 backdrop-blur-2xl border-b border-white/[0.08]">
            <Toolbar 
              activeTool={activeTool} 
              onToolSelect={handleToolSelect}
              onMenuClick={() => setShowMobileMenu(true)}
            />
          </div>
        </div>

        {/* Desktop: Toolbar vertical lateral */}
        <div className="hidden md:block">
          <Toolbar activeTool={activeTool} onToolSelect={handleToolSelect} />
        </div>
        
        {/* Canvas - iOS Premium Scroll com bounce */}
        <main className="flex-1 flex items-start md:items-center justify-center transition-all duration-300 relative overflow-y-auto overflow-x-hidden md:p-8 pt-14">
          <style jsx>{`
            /* iOS Bounce Scroll */
            main {
              -webkit-overflow-scrolling: touch;
              overscroll-behavior-y: contain;
            }
            @media (max-width: 768px) {
              main {
                /* Safe area top + navbar (56px) + toolbar (56px) */
                padding-top: calc(env(safe-area-inset-top) + 7rem);
                /* Safe area bottom + tools bar (64px) + painel + espaço para download button */
                padding-bottom: calc(env(safe-area-inset-bottom) + 4rem + ${showToolPanel ? (panelHeight === 'full' ? '85vh' : '50vh') : '0px'});
                padding-left: max(1rem, env(safe-area-inset-left));
                padding-right: max(1rem, env(safe-area-inset-right));
                transition: padding-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              }
            }
          `}</style>
          <div className="w-full max-w-7xl px-3 md:px-0">
            <Canvas 
              content={canvasContent} 
              isLoading={api.isLoading} 
              loadingMessage={api.loadingMessage}
              api={api}
              onContentUpdate={handleContentUpdate}
            />
          </div>
        </main>

        {/* Mobile: iOS Tools Bar - Fixed Bottom com Safe Area */}
        <div 
          className="md:hidden fixed left-0 right-0 z-20 transition-all duration-400 ease-out"
          style={{ 
            bottom: showToolPanel ? (panelHeight === 'full' ? 'calc(85vh)' : 'calc(50vh)') : '0',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <ToolsBar
              activeTool={activeTool}
              onToolSelect={handleToolSelect}
            />
          </div>
        </div>

        {/* Mobile: iOS Bottom Sheet Premium - Altura Adaptativa */}
        <div 
          className={`md:hidden fixed left-0 right-0 z-10 transition-all duration-400 ease-out ${
            showToolPanel ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ 
            bottom: '0',
            height: panelHeight === 'full' ? '85vh' : '50vh',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          <aside className="h-full w-full bg-gradient-to-b from-black/98 via-black to-black backdrop-blur-3xl border-t border-white/10 flex flex-col overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.9)] rounded-t-[28px]">
            {/* Drag Handle + Controls - iOS Style */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Drag Handle */}
              <div className="flex items-center justify-center py-3 w-full">
                <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
              </div>
              
              {/* Header com controles */}
              <div className="flex items-center justify-between w-full px-5 pb-3">
                <h3 className="text-white/90 font-semibold text-base tracking-tight">
                  {activeTool ? 'Ferramenta & Histórico' : 'Painel'}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Botão Expandir/Recolher */}
                  <button
                    onClick={() => setPanelHeight(panelHeight === 'half' ? 'full' : 'half')}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center border border-white/10"
                    aria-label={panelHeight === 'half' ? 'Expandir' : 'Recolher'}
                  >
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {panelHeight === 'half' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      )}
                    </svg>
                  </button>
                  
                  {/* Botão Fechar */}
                  <button
                    onClick={() => {
                      setShowToolPanel(false);
                      setPanelHeight('half');
                    }}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center border border-white/10"
                    aria-label="Fechar"
                  >
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
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
              onToolSelect={handleToolSelect}
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
            onToolSelect={handleToolSelect}
          />
        </aside>
        
        {/* Mobile: Tools Modal - iOS Premium z-[9999] */}
        <ToolsModal
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
        />
        
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
