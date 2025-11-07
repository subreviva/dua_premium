"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Music2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MasteringPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if file is WAV or MP3
      const fileType = selectedFile.type
      if (fileType === "audio/wav" || fileType === "audio/mpeg" || fileType === "audio/mp3") {
        setFile(selectedFile)
      } else {
        alert("Por favor, selecione um arquivo WAV ou MP3")
      }
    }
  }

  const handleMaster = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to stems results page
      router.push("/stems/demo-track-id")
    } catch (error) {
      console.error("Error:", error)
      alert("Erro ao processar arquivo")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight">Masterização de Áudio</h1>
          <p className="text-muted-foreground">Faça upload de um arquivo WAV ou MP3 para masterizar</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-light">Fazer Upload</h2>

            <div className="space-y-4">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/20"
              >
                <Upload className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm sm:text-base font-light truncate">
                  {file ? file.name : "Selecionar arquivo WAV ou MP3"}
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".wav,.mp3,audio/wav,audio/mpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {file && (
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Music2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="flex-shrink-0">
                    Remover
                  </Button>
                </div>
              )}

              <Button onClick={handleMaster} disabled={!file || isProcessing} className="w-full gap-2">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />A processar...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Masterizar Áudio
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
