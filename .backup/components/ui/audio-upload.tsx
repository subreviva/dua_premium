'use client'

import { Upload, X, Music, FileAudio } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AudioUploadProps {
  onFileSelect: (file: File) => void
  onUrlProvide: (url: string) => void
  maxSizeMB?: number
  accept?: string
}

export function AudioUpload({
  onFileSelect,
  onUrlProvide,
  maxSizeMB = 50,
  accept = 'audio/*,.mp3,.wav,.m4a,.ogg'
}: AudioUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const validateFile = (file: File) => {
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`Ficheiro demasiado grande. Máximo ${maxSizeMB}MB`)
      return false
    }
    setError('')
    return true
  }

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      setAudioUrl('')
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      handleFileSelect(file)
    } else {
      setError('Por favor, selecione um ficheiro de áudio válido')
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUrlSubmit = () => {
    if (audioUrl.trim()) {
      setSelectedFile(null)
      onUrlProvide(audioUrl.trim())
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setAudioUrl('')
    setError('')
  }

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <Card
        className={`transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-dashed border-2'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          {!selectedFile && !audioUrl ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-1">
                  Arraste e solte ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Formatos: MP3, WAV, M4A, OGG (máx. {maxSizeMB}MB)
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => document.getElementById('audio-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Ficheiro
              </Button>

              <input
                id="audio-upload"
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  {selectedFile ? (
                    <FileAudio className="h-6 w-6 text-primary" />
                  ) : (
                    <Music className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedFile ? selectedFile.name : 'URL de áudio'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : audioUrl}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* URL Input Alternative */}
      {!selectedFile && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou use um URL
            </span>
          </div>
        </div>
      )}

      {!selectedFile && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://exemplo.com/audio.mp3"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button
            onClick={handleUrlSubmit}
            disabled={!audioUrl.trim()}
          >
            Usar URL
          </Button>
        </div>
      )}
    </div>
  )
}
