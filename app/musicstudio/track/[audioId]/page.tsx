"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { AppSidebar } from "@/components/app-sidebar"
import { useGeneration } from "@/contexts/generation-context"

interface Track {
  id?: string
  audioId: string
  title: string
  prompt: string
  tags: string
  duration: number
  audioUrl: string
  streamAudioUrl: string
  imageUrl: string
  modelName: string
  createTime: string
  taskId: string
}

export default function TrackDetailPage() {
  const router = useRouter()
  const params = useParams()
  const audioId = params.audioId as string
  const [track, setTrack] = useState<Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { currentTrack, completedTracks } = useGeneration()

  useEffect(() => {
    const findTrack = () => {
      console.log("[v0] Looking for track with audioId:", audioId)

      // First check if it's the current playing track
      if (currentTrack && currentTrack.audioId === audioId) {
        console.log("[v0] Found track in currentTrack:", currentTrack)
        setTrack(currentTrack)
        setIsLoading(false)
        return
      }

      // Otherwise search in completed tracks
      const foundTrack = completedTracks.find((t) => t.audioId === audioId)
      if (foundTrack) {
        console.log("[v0] Found track in completedTracks:", foundTrack)
        setTrack(foundTrack)
      } else {
        console.log("[v0] Track not found in context")
        setTrack(null)
      }

      setIsLoading(false)
    }

    if (audioId) {
      findTrack()
    }
  }, [audioId, currentTrack, completedTracks])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary mx-auto" />
          <p className="text-sm text-muted-foreground">A carregar detalhes...</p>
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-light">Faixa não encontrada</p>
          <Button onClick={() => router.back()} variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <Button onClick={() => router.back()} variant="ghost" className="gap-2 hover:bg-secondary/80">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          {/* Track Details - Using TrackDetailModal content but as a page */}
          <TrackDetailModal
            open={true}
            onOpenChange={(open) => {
              if (!open) router.back()
            }}
            track={track}
          />
        </div>
      </div>
    </div>
  )
}
