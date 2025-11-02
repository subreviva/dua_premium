"use client"

/**
 * Edit Image Panel
 * Painel para editar imagens existentes
 */

import { useState } from "react"
import { CanvasContent } from "@/types/designstudio"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Wand2 } from "lucide-react"

interface EditImagePanelProps {
  canvasContent: CanvasContent
  onContentUpdate: (content: CanvasContent) => void
  onGenerationStart: () => void
  onGenerationEnd: () => void
}

export function EditImagePanel({
  canvasContent,
  onContentUpdate,
  onGenerationStart,
  onGenerationEnd,
}: EditImagePanelProps) {
  const [editPrompt, setEditPrompt] = useState("")

  const handleEdit = async () => {
    if (!editPrompt.trim() || canvasContent.type !== 'image') return

    onGenerationStart()

    try {
      // TODO: Implementar chamada real à API de edição de imagens
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simulação de resultado editado
      const editedImage: CanvasContent = {
        type: 'image',
        src: 'https://picsum.photos/1024/1025', // URL diferente para simular edição
        mimeType: 'image/jpeg',
        prompt: `${canvasContent.prompt} + ${editPrompt}`,
      }

      onContentUpdate(editedImage)
      setEditPrompt("")
    } catch (error) {
      console.error('Error editing image:', error)
    } finally {
      onGenerationEnd()
    }
  }

  if (canvasContent.type !== 'image') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Editar Imagem</h3>
        <p className="text-sm text-gray-400">
          Primeiro, gere ou selecione uma imagem para editar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Editar Imagem</h3>
        <p className="text-sm text-gray-400 mb-6">
          Descreva as alterações que deseja fazer na imagem atual.
        </p>
      </div>

      <div className="space-y-4">
        {canvasContent.prompt && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <Label className="text-xs text-gray-400 mb-2">Prompt Original</Label>
            <p className="text-sm text-gray-300">{canvasContent.prompt}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="editPrompt">Instruções de Edição</Label>
          <Textarea
            id="editPrompt"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Ex: Adicionar um pássaro voando no céu, aumentar a saturação das cores, remover o objeto no canto direito..."
            className="min-h-[120px] bg-white/5 border-white/10 focus:border-purple-500/50 resize-none"
            rows={5}
          />
        </div>

        <Button
          onClick={handleEdit}
          disabled={!editPrompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-11"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Aplicar Edição
        </Button>
      </div>
    </div>
  )
}
