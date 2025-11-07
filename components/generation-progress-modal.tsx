"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Music, Sparkles, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface GenerationProgressModalProps {
  open: boolean
  taskId: string | null
  onComplete: (tracks: any[]) => void
  onError: (error: string) => void
}

export function GenerationProgressModal({ open, taskId, onComplete, onError }: GenerationProgressModalProps) {
  const [status, setStatus] = useState<string>("PENDING")
  const [progress, setProgress] = useState(0)
  const [tracks, setTracks] = useState<any[]>([])
  const [statusMessage, setStatusMessage] = useState("Initializing generation...")

  useEffect(() => {
    if (!taskId || !open) return

    let attempts = 0
    const maxAttempts = 60 // 10 minutes

    const poll = async () => {
      try {
        const response = await fetch(`/api/suno/status?taskId=${taskId}`)
        const data = await response.json()

        console.log("[v0] Task status:", data.status)
        setStatus(data.status)

        // Update progress and message based on status
        switch (data.status) {
          case "PENDING":
            setProgress(10)
            setStatusMessage("Preparing your music generation...")
            break
          case "TEXT_SUCCESS":
            setProgress(40)
            setStatusMessage("Lyrics and structure created! Generating audio...")
            break
          case "FIRST_SUCCESS":
            setProgress(70)
            setStatusMessage("First track complete! Generating variations...")
            break
          case "SUCCESS":
            setProgress(100)
            setStatusMessage("All tracks generated successfully!")
            setTracks(data.response?.sunoData || [])
            setTimeout(() => {
              onComplete(data.response?.sunoData || [])
            }, 2000)
            return
          default:
            if (data.status.includes("FAILED") || data.status.includes("ERROR")) {
              onError(`Generation failed: ${data.status}`)
              return
            }
        }

        if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          onError("Generation timeout - please try again")
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : "Status check failed")
      }
    }

    poll()
  }, [taskId, open, onComplete, onError])

  const getStatusIcon = () => {
    if (status === "SUCCESS") {
      return <CheckCircle2 className="h-12 w-12 text-green-500" />
    }
    if (status.includes("FAILED") || status.includes("ERROR")) {
      return <AlertCircle className="h-12 w-12 text-destructive" />
    }
    return <Loader2 className="h-12 w-12 animate-spin text-primary" />
  }

  const getStatusBadge = () => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Queued</Badge>
      case "TEXT_SUCCESS":
        return <Badge className="bg-blue-500">Generating Audio</Badge>
      case "FIRST_SUCCESS":
        return <Badge className="bg-purple-500">Creating Variations</Badge>
      case "SUCCESS":
        return <Badge className="bg-green-500">Complete</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Generating Music
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Icon */}
          <div className="flex justify-center">{getStatusIcon()}</div>

          {/* Status Badge */}
          <div className="flex justify-center">{getStatusBadge()}</div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">{progress}% complete</p>
          </div>

          {/* Status Message */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-center text-sm font-medium">{statusMessage}</p>
          </div>

          {/* Track Count */}
          {tracks.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>{tracks.length} variations generated</span>
            </div>
          )}

          {/* Info */}
          {status !== "SUCCESS" && (
            <div className="rounded-lg bg-primary/5 p-3">
              <p className="text-center text-xs text-muted-foreground">
                This usually takes 1-3 minutes. Please don't close this window.
              </p>
            </div>
          )}

          {/* View Library Button */}
          {status === "SUCCESS" && (
            <Button onClick={() => (window.location.href = "/library")} className="w-full gap-2" size="lg">
              <Music className="h-4 w-4" />
              View in Library
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
