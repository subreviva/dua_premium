"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, LinkIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FileUploadProps {
  onUploadComplete: (uploadUrl: string) => void
  accept?: string
}

export function FileUpload({ onUploadComplete, accept = "audio/*" }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [url, setUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
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

        const data = await response.json()
        if (data.code === 200) {
          onUploadComplete(data.data.uploadUrl)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("[v0] File upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!url) return

    setIsUploading(true)
    try {
      const response = await fetch("/api/suno/upload/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      if (data.code === 200) {
        onUploadComplete(data.data.uploadUrl)
        setUrl("")
      }
    } catch (error) {
      console.error("[v0] URL upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
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
            />
            <Button onClick={handleUrlUpload} disabled={isUploading || !url}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
