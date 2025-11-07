"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"

interface AIHarmonyGeneratorProps {
  vocalUrl: string
  onGenerate: (url: string, name: string) => void
}

export function AIHarmonyGenerator({ vocalUrl, onGenerate }: AIHarmonyGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [harmonyType, setHarmonyType] = useState<"third" | "fifth" | "octave">("third")

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      // In a real implementation, this would call an AI service to generate harmonies
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate harmony generation by using the original vocal
      // In production, this would be processed by an AI harmony generator
      const harmonyName = `Harmonia (${harmonyType === "third" ? "Terça" : harmonyType === "fifth" ? "Quinta" : "Oitava"})`
      onGenerate(vocalUrl, harmonyName)

      alert(`${harmonyName} gerada! Em produção, isto criaria uma harmonia real usando DUA.`)
    } catch (error) {
      console.error("Erro na geração de harmonia:", error)
      alert("Falha ao gerar harmonia. Por favor, tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-white/60">Tipo de Harmonia</label>
        <div className="grid grid-cols-3 gap-2">
          {(["third", "fifth", "octave"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setHarmonyType(type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                harmonyType === type ? "bg-purple-500 text-white" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {type === "third" ? "Terça" : type === "fifth" ? "Quinta" : "Oitava"}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {isGenerating ? "A gerar harmonia..." : "Gerar Harmonia com DUA"}
      </button>

      <p className="text-xs text-white/40">DUA irá analisar o vocal e criar uma harmonia natural</p>
    </div>
  )
}
