"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Copy, Check } from "lucide-react"

interface LyricsGeneratorProps {
  onGenerate?: (lyrics: string) => void
}

export function LyricsGenerator({ onGenerate }: LyricsGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedLyrics, setGeneratedLyrics] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleUseLyrics = (lyrics: string) => {
    if (onGenerate) {
      onGenerate(lyrics)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/suno/lyrics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const result = await response.json()
      // console.log("[v0] Lyrics generation started:", result)

      if (result.data?.taskId) {
        // Poll for results
        pollForLyrics(result.data.taskId)
      }
    } catch (error) {
      // console.error("[v0] Error generating lyrics:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const pollForLyrics = async (taskId: string) => {
    const maxAttempts = 30
    let attempts = 0

    const poll = setInterval(async () => {
      attempts++
      try {
        const response = await fetch(`/api/suno/details/lyrics/${taskId}`)
        const result = await response.json()

        if (result.data?.lyrics) {
          clearInterval(poll)
          // Split lyrics into variations if multiple are returned
          setGeneratedLyrics([result.data.lyrics])
        } else if (attempts >= maxAttempts) {
          clearInterval(poll)
          // console.log("[v0] Lyrics polling timeout")
        }
      } catch (error) {
        // console.error("[v0] Error polling lyrics:", error)
        clearInterval(poll)
      }
    }, 2000)
  }

  const handleCopy = (lyrics: string, index: number) => {
    navigator.clipboard.writeText(lyrics)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          Generate Lyrics
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the theme or story for your lyrics..."
          className="min-h-[100px] premium-input resize-none font-medium"
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold premium-button disabled:opacity-50"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Lyrics"}
        </Button>
      </div>

      {generatedLyrics.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold">Generated Lyrics</label>
          {generatedLyrics.map((lyrics, index) => (
            <div key={index} className="premium-card p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-400">Variation {index + 1}</span>
                <div className="flex gap-2">
                  {onGenerate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUseLyrics(lyrics)}
                      className="h-8 px-3 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Use
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(lyrics, index)}
                    className="h-8 hover:bg-white/10"
                  >
                    {copiedIndex === index ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-mono text-neutral-300">{lyrics}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
