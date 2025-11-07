"use client"

import { GenerationSidebar } from "@/components/generation-sidebar"
import { MobileGenerationIndicator } from "@/components/mobile-generation-indicator"
import { useGeneration } from "@/contexts/generation-context"
import { TrackDetailModal } from "@/components/track-detail-modal"
import { useState, useEffect } from "react"

export function GenerationSidebarWrapper() {
  const { tasks, removeTask } = useGeneration()
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)
  const [showRestoredNotification, setShowRestoredNotification] = useState(false)

  // Show notification when tasks are restored from localStorage
  useEffect(() => {
    const wasRestored = sessionStorage.getItem("dua-tasks-restored")
    if (!wasRestored && tasks.length > 0) {
      const hasActiveTasks = tasks.some(task => 
        task.status !== "SUCCESS" && 
        !task.error && 
        !task.status.includes("FAILED")
      )
      if (hasActiveTasks) {
        setShowRestoredNotification(true)
        sessionStorage.setItem("dua-tasks-restored", "true")
        setTimeout(() => setShowRestoredNotification(false), 5000)
      }
    }
  }, [tasks])

  const handleViewTrack = (track: any) => {
    setSelectedTrack(track)
    setIsTrackModalOpen(true)
  }

  return (
    <>
      {/* Notification toast for restored tasks */}
      {showRestoredNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold">🎵 Geração em andamento restaurada!</div>
              <div className="text-sm opacity-90">{tasks.length} tarefa(s) continuando...</div>
            </div>
          </div>
        </div>
      )}

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
