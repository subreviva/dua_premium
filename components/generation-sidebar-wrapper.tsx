"use client"

import { GenerationSidebar } from "@/components/generation-sidebar"
import { MobileGenerationIndicator } from "@/components/mobile-generation-indicator"
import { useGeneration } from "@/contexts/generation-context"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { useState } from "react"

export function GenerationSidebarWrapper() {
  const { tasks, removeTask } = useGeneration()
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)

  const handleViewTrack = (track: any) => {
    setSelectedTrack(track)
    setIsTrackModalOpen(true)
  }

  return (
    <>
      <div className="hidden md:block">
        <GenerationSidebar tasks={tasks} onRemoveTask={removeTask} onViewTrack={handleViewTrack} />
      </div>

      <MobileGenerationIndicator taskCount={tasks.length} />

      {selectedTrack && (
        <TrackDetailModal open={isTrackModalOpen} onOpenChange={setIsTrackModalOpen} track={selectedTrack} />
      )}
    </>
  )
}
