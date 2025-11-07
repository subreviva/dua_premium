"use client"

import { useState, useEffect } from "react"
import { Sparkles, Lightbulb, X } from "lucide-react"

interface Suggestion {
  id: string
  type: "mixing" | "arrangement" | "effects" | "general"
  message: string
  action?: () => void
}

export function AIStudioAssistant() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    // Simulate DUA analyzing the mix and providing suggestions
    const interval = setInterval(() => {
      const randomSuggestions: Suggestion[] = [
        {
          id: "1",
          type: "mixing",
          message: "Os teus vocais precisam de mais presença. Experimenta aumentar 3-5kHz.",
        },
        {
          id: "2",
          type: "effects",
          message: "Considera adicionar reverb subtil aos vocais para mais profundidade.",
        },
        {
          id: "3",
          type: "arrangement",
          message: "O instrumental está a competir com os vocais. Tenta reduzir as frequências médias.",
        },
        {
          id: "4",
          type: "general",
          message: "A tua mistura está bem equilibrada! Considera adicionar um limiter ao master.",
        },
      ]

      // Randomly show a suggestion
      if (Math.random() > 0.7 && suggestions.length < 3) {
        const newSuggestion = randomSuggestions[Math.floor(Math.random() * randomSuggestions.length)]
        setSuggestions((prev) => [...prev, { ...newSuggestion, id: Date.now().toString() }])
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [suggestions.length])

  const dismissSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
  }

  if (suggestions.length === 0) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 space-y-2">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-2xl max-w-sm animate-in slide-in-from-right"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-medium uppercase tracking-wide">Sugestão DUA</span>
                </div>
                <button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed">{suggestion.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
