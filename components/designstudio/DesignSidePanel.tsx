"use client"

/**
 * Design Side Panel
 * Painel lateral direito com controles e opções
 */

import { ToolId, CanvasContent, ImageObject } from "@/types/designstudio"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerateImagePanel } from "./panels/GenerateImagePanel"
import { EditImagePanel } from "./panels/EditImagePanel"
import { SessionGalleryPanel } from "./panels/SessionGalleryPanel"
import { Wand2, Images, Settings } from "lucide-react"

interface DesignSidePanelProps {
  activeTool: ToolId | null
  canvasContent: CanvasContent
  sessionGallery: ImageObject[]
  onContentUpdate: (content: CanvasContent) => void
  onGenerationStart: () => void
  onGenerationEnd: () => void
  onClearSession: () => void
}

export function DesignSidePanel({
  activeTool,
  canvasContent,
  sessionGallery,
  onContentUpdate,
  onGenerationStart,
  onGenerationEnd,
  onClearSession,
}: DesignSidePanelProps) {
  return (
    <aside className="w-full md:w-96 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col relative z-20">
      <Tabs defaultValue="tool" className="w-full h-full flex flex-col">
        <TabsList className="w-full border-b border-white/10 rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="tool" 
            className="flex-1 rounded-none data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Ferramenta
          </TabsTrigger>
          <TabsTrigger 
            value="gallery"
            className="flex-1 rounded-none data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            <Images className="h-4 w-4 mr-2" />
            Galeria
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="flex-1 rounded-none data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
          >
            <Settings className="h-4 w-4 mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="tool" className="h-full m-0 p-6 overflow-y-auto custom-scrollbar">
            {!activeTool && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Wand2 className="h-8 w-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Selecione uma Ferramenta
                    </h3>
                    <p className="text-sm text-gray-400">
                      Escolha uma ferramenta à esquerda para começar
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'generate-image' && (
              <GenerateImagePanel
                onContentUpdate={onContentUpdate}
                onGenerationStart={onGenerationStart}
                onGenerationEnd={onGenerationEnd}
              />
            )}

            {activeTool === 'edit-image' && (
              <EditImagePanel
                canvasContent={canvasContent}
                onContentUpdate={onContentUpdate}
                onGenerationStart={onGenerationStart}
                onGenerationEnd={onGenerationEnd}
              />
            )}

            {['generate-logo', 'generate-icon', 'generate-svg', 'generate-pattern'].includes(activeTool || '') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {activeTool === 'generate-logo' && 'Gerar Logótipo'}
                  {activeTool === 'generate-icon' && 'Gerar Ícone'}
                  {activeTool === 'generate-svg' && 'Gerar Vetor SVG'}
                  {activeTool === 'generate-pattern' && 'Gerar Padrão'}
                </h3>
                <p className="text-sm text-gray-400">
                  Ferramenta em desenvolvimento. Em breve disponível!
                </p>
              </div>
            )}

            {['color-palette', 'analyze-image', 'design-trends', 'design-assistant', 'export-project', 'product-mockup', 'generate-variations'].includes(activeTool || '') && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {activeTool === 'color-palette' && 'Paleta de Cores'}
                  {activeTool === 'analyze-image' && 'Analisar Imagem'}
                  {activeTool === 'design-trends' && 'Tendências de Design'}
                  {activeTool === 'design-assistant' && 'Assistente de Design'}
                  {activeTool === 'export-project' && 'Exportar Projeto'}
                  {activeTool === 'product-mockup' && 'Mockup de Produto'}
                  {activeTool === 'generate-variations' && 'Gerar Variações'}
                </h3>
                <p className="text-sm text-gray-400">
                  Ferramenta em desenvolvimento. Em breve disponível!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="h-full m-0 p-6 overflow-y-auto custom-scrollbar">
            <SessionGalleryPanel
              gallery={sessionGallery}
              onImageSelect={(image: ImageObject) => {
                onContentUpdate({
                  type: 'image',
                  src: image.src,
                  mimeType: image.mimeType,
                  prompt: image.prompt || '',
                })
              }}
              onClearSession={onClearSession}
            />
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações</h3>
              <p className="text-sm text-gray-400">
                Configurações do Design Studio em desenvolvimento.
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  )
}
