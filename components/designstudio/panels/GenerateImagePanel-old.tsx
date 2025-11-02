"use client"

/**
 * Generate Image Panel
 * Painel para gerar novas imagens com IA
 */

import { useState } from "react"
import { CanvasContent, AspectRatio, GenerationStyle } from "@/types/designstudio"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"

interface GenerateImagePanelProps {
  onContentUpdate: (content: CanvasContent) => void
  onGenerationStart: () => void
  onGenerationEnd: () => void
}

export function GenerateImagePanel({
  onContentUpdate,
  onGenerationStart,
  onGenerationEnd,
}: GenerateImagePanelProps) {
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1")
  const [style, setStyle] = useState<GenerationStyle>("realistic")
  const [negativePrompt, setNegativePrompt] = useState("")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    onGenerationStart()

    try {
      // TODO: Implementar chamada real à API de geração de imagens
      // Por enquanto, simulação
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simulação de resultado
      const mockImage: CanvasContent = {
        type: 'image',
        src: 'https://picsum.photos/1024/1024',
        mimeType: 'image/jpeg',
        prompt: prompt,
      }

      onContentUpdate(mockImage)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      onGenerationEnd()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Gerar Imagem</h3>
        <p className="text-sm text-gray-400 mb-6">
          Descreva a imagem que deseja criar com inteligência artificial.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Descrição da Imagem</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Uma paisagem montanhosa ao pôr do sol, com cores vibrantes e céu dramático..."
            className="min-h-[120px] bg-white/5 border-white/10 focus:border-purple-500/50 resize-none"
            rows={5}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aspectRatio">Proporção</Label>
            <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
              <SelectTrigger id="aspectRatio" className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">Quadrado (1:1)</SelectItem>
                <SelectItem value="16:9">Paisagem (16:9)</SelectItem>
                <SelectItem value="9:16">Retrato (9:16)</SelectItem>
                <SelectItem value="4:3">Paisagem (4:3)</SelectItem>
                <SelectItem value="3:4">Retrato (3:4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Estilo</Label>
            <Select value={style} onValueChange={(value) => setStyle(value as GenerationStyle)}>
              <SelectTrigger id="style" className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic">Realista</SelectItem>
                <SelectItem value="artistic">Artístico</SelectItem>
                <SelectItem value="minimalist">Minimalista</SelectItem>
                <SelectItem value="abstract">Abstrato</SelectItem>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="negativePrompt">Prompt Negativo (Opcional)</Label>
          <Textarea
            id="negativePrompt"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Ex: desfocado, baixa qualidade, distorcido..."
            className="min-h-[80px] bg-white/5 border-white/10 focus:border-purple-500/50 resize-none"
            rows={3}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-11"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Imagem
        </Button>
      </div>
    </div>
  )
}
