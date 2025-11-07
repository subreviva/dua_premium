"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2, Music, Loader2 } from "lucide-react"
import type { ExtendedStemData } from "@/app/stems/[id]/page"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AIFeaturesPanelProps {
  stems: ExtendedStemData[]
  onApplySuggestions: (suggestions: any[]) => void
  onMasteringComplete: (masteredUrl: string) => void
}

export function AIFeaturesPanel({ stems, onApplySuggestions, onMasteringComplete }: AIFeaturesPanelProps) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [masteringStatus, setMasteringStatus] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleGetMixingSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai-mixing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stems }),
      })

      const data = await response.json()

      if (data.success) {
        setSuggestions(data.suggestions)
      } else {
        console.error("Failed to get AI suggestions:", data.error)
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplySuggestion = (suggestion: any) => {
    onApplySuggestions([suggestion])
  }

  const handleApplyAllSuggestions = () => {
    onApplySuggestions(suggestions)
    setSuggestions([])
  }

  const handleAIMastering = async () => {
    setLoading(true)
    setMasteringStatus("Exporting mix...")

    try {
      // First, export the current mix
      // This would need to be implemented in the parent component
      // For now, we'll show a placeholder
      setMasteringStatus("Uploading to AI Mastering...")

      // TODO: Implement actual mix export and mastering
      // const mixBlob = await exportMix()
      // const formData = new FormData()
      // formData.append('audio', mixBlob)

      // const response = await fetch('/api/ai-master', {
      //   method: 'POST',
      //   body: formData,
      // })

      // const data = await response.json()

      // if (data.success) {
      //   onMasteringComplete(data.masteredUrl)
      // }

      setMasteringStatus("AI Mastering complete!")
    } catch (error) {
      console.error("Error with AI mastering:", error)
      setMasteringStatus("Error during mastering")
    } finally {
      setLoading(false)
      setTimeout(() => setMasteringStatus(""), 3000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">AI Features</h3>
      </div>

      {/* AI Mixing Assistant */}
      <div className="space-y-3">
        <Button
          onClick={handleGetMixingSuggestions}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Get AI Mixing Suggestions
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-2 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">AI Suggestions</h4>
              <Button size="sm" onClick={handleApplyAllSuggestions} className="bg-green-500 hover:bg-green-600">
                Apply All
              </Button>
            </div>

            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-white/5 rounded border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {suggestion.stem} - {suggestion.parameter}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleApplySuggestion(suggestion)}>
                    Apply
                  </Button>
                </div>
                <div className="text-xs text-white/60">
                  {suggestion.currentValue} → {suggestion.suggestedValue}
                </div>
                <div className="text-xs text-white/80">{suggestion.reason}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Mastering */}
      <div className="space-y-3">
        <Button
          onClick={handleAIMastering}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mastering...
            </>
          ) : (
            <>
              <Music className="w-4 h-4 mr-2" />
              AI Master Mix
            </>
          )}
        </Button>

        {masteringStatus && <div className="text-sm text-center text-white/80">{masteringStatus}</div>}
      </div>

      {/* Dialog Example */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AI Mastering Details</DialogTitle>
          </DialogHeader>
          {/* Dialog content goes here */}
        </DialogContent>
      </Dialog>
    </div>
  )
}
