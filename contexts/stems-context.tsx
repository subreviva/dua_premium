"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import type { StemData, StemSeparationStatus, SavedStems } from "@/lib/types/stems"

interface StemTask {
  id: string
  trackId: string
  trackTitle: string
  taskId: string
  type: "2-stem" | "12-stem"
  status: "processing" | "completed" | "failed"
  progress: number
  stems?: StemData[]
  error?: string
  notificationShown?: boolean // Added to track if notification was shown
}

interface StemsContextType {
  tasks: StemTask[]
  startStemSeparation: (
    trackId: string,
    trackTitle: string,
    taskId: string,
    audioId: string,
    type: "2-stem" | "12-stem",
  ) => Promise<void>
  isProcessing: boolean
  markNotificationShown: (taskId: string) => void // Added to mark notification as shown
}

const StemsContext = createContext<StemsContextType | undefined>(undefined)

export function StemsProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<StemTask[]>([])
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const isProcessing = tasks.some((task) => task.status === "processing")

  const markNotificationShown = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              notificationShown: true,
            }
          : t,
      ),
    )
  }, [])

  const pollStemStatus = useCallback(async (task: StemTask) => {
    try {
      console.log(`[v0] Polling stem status for task: ${task.taskId}`)

      const response = await fetch(`/api/suno/stems-status?taskId=${task.taskId}`)
      if (!response.ok) {
        throw new Error("Failed to check stem status")
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        throw new Error("Response is not JSON")
      }

      const result: StemSeparationStatus = await response.json()

      const progressMap: Record<string, number> = {
        PENDING: 50,
        SUCCESS: 100,
        CREATE_TASK_FAILED: 0,
        GENERATE_AUDIO_FAILED: 0,
        CALLBACK_EXCEPTION: 0,
      }

      const progress = progressMap[result.successFlag] || 50

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                progress,
              }
            : t,
        ),
      )

      if (result.successFlag === "SUCCESS" && result.response) {
        const interval = pollIntervalsRef.current.get(task.id)
        if (interval) {
          clearInterval(interval)
          pollIntervalsRef.current.delete(task.id)
        }

        const stemMapping: Record<string, { name: string; icon: string; color: string }> = {
          vocalUrl: { name: "Vocals", icon: "mic", color: "bg-pink-500/10 border-pink-500/30" },
          instrumentalUrl: { name: "Instrumental", icon: "guitar", color: "bg-purple-500/10 border-purple-500/30" },
          backingVocalsUrl: { name: "Backing Vocals", icon: "mic", color: "bg-cyan-500/10 border-cyan-500/30" },
          drumsUrl: { name: "Drums", icon: "disc", color: "bg-emerald-500/10 border-emerald-500/30" },
          bassUrl: { name: "Bass", icon: "guitar", color: "bg-amber-500/10 border-amber-500/30" },
          pianoUrl: { name: "Piano", icon: "piano", color: "bg-pink-500/10 border-pink-500/30" },
          guitarUrl: { name: "Guitar", icon: "guitar", color: "bg-orange-500/10 border-orange-500/30" },
          keyboardUrl: { name: "Keyboard", icon: "piano", color: "bg-fuchsia-500/10 border-fuchsia-500/30" },
          stringsUrl: { name: "Strings", icon: "piano", color: "bg-indigo-500/10 border-indigo-500/30" },
          brassUrl: { name: "Brass", icon: "piano", color: "bg-yellow-500/10 border-yellow-500/30" },
          woodwindsUrl: { name: "Woodwinds", icon: "piano", color: "bg-teal-500/10 border-teal-500/30" },
          synthUrl: { name: "Synth", icon: "piano", color: "bg-violet-500/10 border-violet-500/30" },
          fxUrl: { name: "FX", icon: "piano", color: "bg-rose-500/10 border-rose-500/30" },
          percussionUrl: { name: "Percussion", icon: "disc", color: "bg-lime-500/10 border-lime-500/30" },
        }

        const newStems: StemData[] = Object.entries(result.response)
          .filter(([key, url]) => key.endsWith("Url") && url && url !== "" && url !== null)
          .map(([key, url]) => {
            const stemId = key.replace("Url", "").toLowerCase()
            const stemInfo = stemMapping[key] || {
              name: key.replace("Url", ""),
              icon: "piano",
              color: "bg-gray-500/10 border-gray-500/30",
            }

            return {
              id: stemId,
              name: stemInfo.name,
              url: url as string,
              icon: stemInfo.icon,
              color: stemInfo.color,
              volume: 100,
              muted: false,
            }
          })

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: "completed",
                  progress: 100,
                  stems: newStems,
                  notificationShown: false, // Initialize as false to trigger notification
                }
              : t,
          ),
        )

        console.log(`[v0] Stem separation completed for task: ${task.id}`)

        try {
          const existingStems = JSON.parse(localStorage.getItem("track-stems") || "{}")
          const savedData: SavedStems = {
            taskId: task.taskId,
            type: task.type,
            stems: newStems,
            timestamp: Date.now(),
          }
          existingStems[task.trackId] = savedData
          localStorage.setItem("track-stems", JSON.stringify(existingStems))
          console.log("[v0] Stems saved to localStorage for track:", task.trackId)
        } catch (e) {
          console.error("[v0] Error saving stems to localStorage:", e)
        }
      } else if (
        result.successFlag === "CREATE_TASK_FAILED" ||
        result.successFlag === "GENERATE_AUDIO_FAILED" ||
        result.successFlag === "CALLBACK_EXCEPTION"
      ) {
        const interval = pollIntervalsRef.current.get(task.id)
        if (interval) {
          clearInterval(interval)
          pollIntervalsRef.current.delete(task.id)
        }

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: "failed",
                  error: result.errorMessage || result.successFlag,
                }
              : t,
          ),
        )
      }
    } catch (error) {
      console.error("[v0] Error polling stem status:", error)

      const interval = pollIntervalsRef.current.get(task.id)
      if (interval) {
        clearInterval(interval)
        pollIntervalsRef.current.delete(task.id)
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : t,
        ),
      )
    }
  }, [])

  const startStemSeparation = useCallback(
    async (trackId: string, trackTitle: string, taskId: string, audioId: string, type: "2-stem" | "12-stem") => {
      const newTaskId = `stem-${Date.now()}`

      const newTask: StemTask = {
        id: newTaskId,
        trackId,
        trackTitle,
        taskId: "",
        type,
        status: "processing",
        progress: 0,
        notificationShown: false, // Initialize notification state
      }

      setTasks((prev) => [...prev, newTask])

      try {
        const apiType = type === "2-stem" ? "separate_vocal" : "split_stem"

        const response = await fetch("/api/suno/separate-stems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId,
            audioId,
            type: apiType,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to start stem separation")
        }

        const { taskId: separationTaskId } = result

        setTasks((prev) =>
          prev.map((t) =>
            t.id === newTaskId
              ? {
                  ...t,
                  taskId: separationTaskId,
                  progress: 10,
                }
              : t,
          ),
        )

        const updatedTask = { ...newTask, taskId: separationTaskId }

        // Start polling
        const interval = setInterval(() => {
          pollStemStatus(updatedTask)
        }, 3000)

        pollIntervalsRef.current.set(newTaskId, interval)

        // Initial poll
        pollStemStatus(updatedTask)
      } catch (error) {
        console.error("[v0] Error starting stem separation:", error)
        setTasks((prev) =>
          prev.map((t) =>
            t.id === newTaskId
              ? {
                  ...t,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Unknown error",
                }
              : t,
          ),
        )
      }
    },
    [pollStemStatus],
  )

  useEffect(() => {
    return () => {
      pollIntervalsRef.current.forEach((interval) => clearInterval(interval))
      pollIntervalsRef.current.clear()
    }
  }, [])

  return (
    <StemsContext.Provider
      value={{
        tasks,
        startStemSeparation,
        isProcessing,
        markNotificationShown, // Expose function to mark notification as shown
      }}
    >
      {children}
    </StemsContext.Provider>
  )
}

export function useStems() {
  const context = useContext(StemsContext)
  if (context === undefined) {
    throw new Error("useStems must be used within a StemsProvider")
  }
  return context
}
