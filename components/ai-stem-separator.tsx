"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { put } from "@vercel/blob"

interface AIStemSeparatorProps {
  onSeparate: (stems: Array<{ url: string; name: string; type: string }>) => void
}

export function AIStemSeparator({ onSeparate }: AIStemSeparatorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Upload file to Blob
      setProgress(20)
      const blob = await put(file.name, file, {
        access: "public",
      })

      setProgress(40)

      // In a real implementation, this would call an AI stem separation service
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setProgress(70)

      // Simulate stem separation results
      // In production, this would return actual separated stems
      const stems = [
        { url: blob.url, name: "Vocais", type: "vocal" },
        { url: blob.url, name: "Instrumental", type: "instrumental" },
        { url: blob.url, name: "Bateria", type: "drums" },
        { url: blob.url, name: "Baixo", type: "bass" },
      ]

      setProgress(100)
      onSeparate(stems)

      alert("Stems separados! Em produção, DUA usaria IA para separar o áudio em stems individuais.")
    } catch (error) {
      console.error("Erro na separação de stems:", error)
      alert("Falha ao separar stems. Por favor, tente novamente.")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="hidden"
          id="stem-separator-upload"
        />
        <label
          htmlFor="stem-separator-upload"
          className={`cursor-pointer flex flex-col items-center gap-3 ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium">A separar stems...</p>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-white/60">{progress}%</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-white/40" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Carregar ficheiro de áudio</p>
                <p className="text-xs text-white/60">DUA irá separá-lo em vocais, bateria, baixo e mais</p>
              </div>
            </>
          )}
        </label>
      </div>

      <p className="text-xs text-white/40">Suporta MP3, WAV, FLAC e outros formatos de áudio</p>
    </div>
  )
}
