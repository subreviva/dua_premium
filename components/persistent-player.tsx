"use client"

import { useState } from "react"
import { useGeneration } from "@/contexts/generation-context"
import { UnifiedPlayer } from "@/components/unified-player"
import { TrackDetailModal } from "@/components/track-detail-modal"

export function PersistentPlayer() {
  const { currentTrack, clearCurrentTrack } = useGeneration()
  const [showDetailModal, setShowDetailModal] = useState(false)

  if (!currentTrack) return null

  return (
    <>
      <UnifiedPlayer track={currentTrack} onClose={clearCurrentTrack} onOpenDetails={() => setShowDetailModal(true)} />

      <TrackDetailModal open={showDetailModal} onOpenChange={setShowDetailModal} track={currentTrack} />
    </>
  )
}
