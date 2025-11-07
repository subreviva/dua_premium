"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Mic } from "lucide-react"
import { RecordingPanel } from "./recording-panel"

interface AddTrackModalProps {
  open: boolean
  onClose: () => void
  onUploadAudio: () => void
  onRecordingComplete: (audioUrl: string, duration: number) => void
}

export function AddTrackModal({ open, onClose, onUploadAudio, onRecordingComplete }: AddTrackModalProps) {
  const [showRecording, setShowRecording] = useState(false)

  const handleRecordingComplete = (audioUrl: string, duration: number) => {
    onRecordingComplete(audioUrl, duration)
    setShowRecording(false)
    onClose()
  }

  if (showRecording) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Gravar Nova Pista</DialogTitle>
          </DialogHeader>
          <RecordingPanel onRecordingComplete={handleRecordingComplete} onClose={() => setShowRecording(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Nova Pista</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => {
              onUploadAudio()
              onClose()
            }}
            className="h-24 flex flex-col gap-2 bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            <Upload className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Carregar Áudio</div>
              <div className="text-xs text-zinc-400">Importar ficheiro de áudio</div>
            </div>
          </Button>
          <Button
            onClick={() => setShowRecording(true)}
            className="h-24 flex flex-col gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Mic className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Gravar Áudio</div>
              <div className="text-xs text-red-200">Gravar do microfone</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
