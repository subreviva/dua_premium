"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUnifiedMusic } from "@/contexts/unified-music-context"

interface Track {
  id: string
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

interface GenerationTask {
  taskId: string
  status: string
  progress: number
  statusMessage: string
  tracks: Track[]
  error?: string
  prompt: string
  model: string
  startTime: number
}

interface GenerationContextType {
  tasks: GenerationTask[]
  completedTracks: Track[]
  currentTrack: Track | null
  addTask: (task: GenerationTask) => void
  removeTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<GenerationTask>) => void
  playTrack: (track: Track) => void
  clearCurrentTrack: () => void
  isPlaying: boolean
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined)

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<GenerationTask[]>([])
  const [completedTracks, setCompletedTracks] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  
  // Integra com o UnifiedMusicContext
  const { playGeneratedTrack, currentTrack: unifiedTrack, isPlaying, stop } = useUnifiedMusic()

  // Load completed tracks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("dua-music-tracks")
    if (stored) {
      try {
        const tracks = JSON.parse(stored)
        setCompletedTracks(tracks)
      } catch (err) {
        console.error("Error loading tracks from localStorage:", err)
      }
    }
  }, [])

  // Load active tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("dua-music-tasks")
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks)
        // Only restore tasks that are still active (not completed or failed)
        const activeTasks = parsedTasks.filter(
          (task: GenerationTask) => 
            task.status !== "SUCCESS" && 
            !task.error && 
            !task.status.includes("FAILED") &&
            task.progress < 100
        )
        if (activeTasks.length > 0) {
          setTasks(activeTasks)
          console.log(`🔄 Restored ${activeTasks.length} active music generation task(s)`)
        }
      } catch (err) {
        console.error("Error loading tasks from localStorage:", err)
      }
    }
  }, [])

  useEffect(() => {
    if (completedTracks.length > 0) {
      localStorage.setItem("dua-music-tracks", JSON.stringify(completedTracks))
    }
  }, [completedTracks])

  // Persist active tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("dua-music-tasks", JSON.stringify(tasks))
    } else {
      // Clear storage if no tasks remain
      localStorage.removeItem("dua-music-tasks")
    }
  }, [tasks])

  useEffect(() => {
    const activeTasks = tasks.filter(
      (t) => t.status !== "SUCCESS" && !t.error && !t.status.includes("FAILED") && t.progress < 100,
    )

    if (activeTasks.length === 0) return

    const pollInterval = setInterval(async () => {
      for (const task of activeTasks) {
        try {
          const response = await fetch(`/api/suno/status?taskId=${task.taskId}`)
          
          if (!response.ok) {
            console.error('[Generation] Status check failed:', response.status)
            continue
          }

          const contentType = response.headers.get('content-type')
          if (!contentType?.includes('application/json')) {
            console.error('[Generation] Response is not JSON:', contentType)
            continue
          }
          
          const data = await response.json()

          let progress = task.progress
          let statusMessage = task.statusMessage
          let newTracks: Track[] = []

          switch (data.status) {
            case "PENDING":
              progress = 20
              statusMessage = "Preparing generation..."
              break

            case "TEXT_SUCCESS":
              progress = 40
              statusMessage = "Text generated, creating audio..."
              break

            case "FIRST_SUCCESS":
              progress = 70
              statusMessage = "First track complete, generating variations..."
              if (data.response?.sunoData && Array.isArray(data.response.sunoData)) {
                newTracks = data.response.sunoData
                  .map((track: any) => ({
                    id: track.id,
                    audioId: track.id,
                    title: track.title || "Untitled",
                    prompt: track.prompt || task.prompt,
                    tags: track.tags || "",
                    duration: track.duration || 0,
                    audioUrl: track.audioUrl || "",
                    streamAudioUrl: track.streamAudioUrl || "",
                    imageUrl: track.imageUrl || "",
                    modelName: track.modelName || task.model,
                    createTime: track.createTime || new Date().toISOString(),
                    taskId: task.taskId,
                  }))
                  .filter((track: Track) => track.audioUrl || track.streamAudioUrl)
              }
              break

            case "SUCCESS":
              progress = 100
              statusMessage = "Complete! Tracks saved to library"
              if (data.response?.sunoData && Array.isArray(data.response.sunoData)) {
                const allTracks = data.response.sunoData.map((track: any) => ({
                  id: track.id,
                  audioId: track.id,
                  title: track.title || "Untitled",
                  prompt: track.prompt || task.prompt,
                  tags: track.tags || "",
                  duration: track.duration || 0,
                  audioUrl: track.audioUrl || "",
                  streamAudioUrl: track.streamAudioUrl || "",
                  imageUrl: track.imageUrl || "",
                  modelName: track.modelName || task.model,
                  createTime: track.createTime || new Date().toISOString(),
                  taskId: task.taskId,
                }))

                setCompletedTracks((prev) => {
                  const existingIds = new Set(prev.map((t) => t.id))
                  const uniqueNewTracks = allTracks.filter((t: Track) => !existingIds.has(t.id))
                  return [...uniqueNewTracks, ...prev]
                })

                newTracks = allTracks.filter((track: Track) => track.audioUrl || track.streamAudioUrl)
              }
              setTasks((prev) => prev.filter((t) => t.taskId !== task.taskId))
              break

            case "CREATE_TASK_FAILED":
            case "GENERATE_AUDIO_FAILED":
            case "CALLBACK_EXCEPTION":
            case "SENSITIVE_WORD_ERROR":
              progress = 0
              statusMessage = `Error: ${data.status.replace(/_/g, " ").toLowerCase()}`
              break
          }

          setTasks((prev) =>
            prev.map((t) =>
              t.taskId === task.taskId
                ? {
                    ...t,
                    status: data.status,
                    progress,
                    statusMessage,
                    tracks: newTracks.length > 0 ? newTracks : t.tracks,
                    error: data.status.includes("FAILED") || data.status.includes("ERROR") ? statusMessage : undefined,
                  }
                : t,
            ),
          )
        } catch (err) {
          console.error("Error polling task:", task.taskId, err)
        }
      }
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [tasks])

  const addTask = (task: GenerationTask) => {
    setTasks((prev) => [...prev, task])
  }

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId))
  }

  const updateTask = (taskId: string, updates: Partial<GenerationTask>) => {
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? { ...t, ...updates } : t)))
  }

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    playGeneratedTrack(track)
  }

  const clearCurrentTrack = () => {
    setCurrentTrack(null)
    stop()
  }

  return (
    <GenerationContext.Provider
      value={{ 
        tasks, 
        completedTracks, 
        currentTrack, 
        addTask, 
        removeTask, 
        updateTask, 
        playTrack, 
        clearCurrentTrack,
        isPlaying
      }}
    >
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const context = useContext(GenerationContext)
  if (context === undefined) {
    throw new Error("useGeneration must be used within a GenerationProvider")
  }
  return context
}
