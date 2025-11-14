"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, LinkIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { safeParse } from "@/lib/fetch-utils"

interface FileUploadProps {
  onUploadComplete: (uploadUrl: string) => void
  accept?: string
}

export function FileUpload({ onUploadComplete, accept = "audio/*" }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setError("")
    setSuccess(false)
    
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string
          const base64Data = base64.split(",")[1]

          const response = await fetch("/api/suno/upload/base64", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file: base64Data,
              fileName: file.name,
            }),
          })

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`)
          }

          const data = await safeParse<{ code: number; data?: { uploadUrl: string }; msg?: string }>(response)
          if (!data) {
            throw new Error("Invalid response from upload API")
          }
          if (data.code === 200 && data.data?.uploadUrl) {
            setSuccess(true)
            onUploadComplete(data.data.uploadUrl)
          } else {
            throw new Error(data.msg || "Upload failed")
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to upload file")
        } finally {
          setIsUploading(false)
        }
      }
      reader.onerror = () => {
        setError("Failed to read file")
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      // console.error("[v0] File upload error:", error)
      setError(error instanceof Error ? error.message : "Failed to upload file")
      setIsUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!url) return

    setIsUploading(true)
    setError("")
    setSuccess(false)
    
    try {
      // Basic URL validation
      try {
        new URL(url)
      } catch {
        throw new Error("Invalid URL format")
      }

      const response = await fetch("/api/suno/upload/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await safeParse<{ code: number; data?: { uploadUrl: string }; msg?: string }>(response)
      if (!data) {
        throw new Error("Invalid response from upload API")
      }
      if (data.code === 200 && data.data?.uploadUrl) {
        setSuccess(true)
        onUploadComplete(data.data.uploadUrl)
        setUrl("")
      } else {
        throw new Error(data.msg || "Upload failed")
      }
    } catch (error) {
      // console.error("[v0] URL upload error:", error)
      setError(error instanceof Error ? error.message : "Failed to upload from URL")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">Upload successful!</p>
        </div>
      )}

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">From URL</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
              className="hidden"
            />
            <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">MP3, WAV, etc. (Max 10MB)</p>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} variant="outline">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Audio URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && url && !isUploading) {
                    handleUrlUpload()
                  }
                }}
              />
              <Button onClick={handleUrlUpload} disabled={isUploading || !url}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
