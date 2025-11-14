"use client"

import { useState } from "react"
import { safeParse } from "@/lib/fetch-utils"

export function AIMusicGenerator({ onGenerate }: { onGenerate: (url: string, name: string) => void }) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setProgress(0)

    try {
      // Call Suno API to generate music
      const response = await fetch("/api/suno/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          make_instrumental: false,
          wait_audio: false,
        }),
      })

      const data = await safeParse<{ success: boolean; data?: any[]; error?: string }>(response)
      if (!data) {
        throw new Error("Invalid response from generate API")
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to generate music")
      }

      if (!data.data || !data.data[0]) {
        throw new Error("No task data received")
      }

      // Poll for completion
      const taskId = data.data[0].id
      let completed = false

      while (!completed) {
        await new Promise((resolve) => setTimeout(resolve, 3000))

        const statusResponse = await fetch(`/api/suno/status?ids=${taskId}`)
        const statusData = await safeParse<{ success: boolean; data?: any[] }>(statusResponse)
        if (!statusData || !statusData.data || !statusData.data[0]) {
          continue
        }

        if (statusData.success) {
          const track = statusData.data[0]
          setProgress(Math.min(95, progress + 10))

          if (track.status === "complete" && track.audio_url) {
            completed = true
            setProgress(100)
            onGenerate(track.audio_url, track.title || "Gerado por DUA")
          } else if (track.status === "error") {
            throw new Error("Generation failed")
          }
        }
      }
    } catch (error) {
      console.error("Erro na geração de música DUA:", error)
      alert("Falha ao gerar música. Por favor, tente novamente.")
    } finally {
      setIsGenerating(false)
      setProgress(0)
      setPrompt("")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Descreva a música que deseja gerar</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="ex: música electrónica animada com baixo pesado e sintetizadores"
          className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
      >
        {isGenerating ? `A gerar... ${progress}%` : "Gerar Música com DUA"}
      </button>
    </div>
  )
}
