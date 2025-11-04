"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface VideoGenerationJob {
  id: string
  prompt: string
  status: "processing" | "completed" | "error"
  progress: number
  videoUrl?: string
  thumbnailUrl?: string
  model: string
  createdAt: number
  completedAt?: number
}

interface VideoGenerationContextType {
  jobs: VideoGenerationJob[]
  addJob: (job: Omit<VideoGenerationJob, "id" | "createdAt">) => string
  updateJob: (id: string, updates: Partial<VideoGenerationJob>) => void
  removeJob: (id: string) => void
  getActiveJobs: () => VideoGenerationJob[]
  getCompletedJobs: () => VideoGenerationJob[]
}

const VideoGenerationContext = createContext<VideoGenerationContextType | null>(null)

export function VideoGenerationProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<VideoGenerationJob[]>([])

  // Load jobs from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem("video-generation-jobs")
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs))
      } catch (error) {
        console.error("Error loading saved jobs:", error)
      }
    }
  }, [])

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    localStorage.setItem("video-generation-jobs", JSON.stringify(jobs))
  }, [jobs])

  const addJob = (jobData: Omit<VideoGenerationJob, "id" | "createdAt">) => {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const job: VideoGenerationJob = {
      ...jobData,
      id,
      createdAt: Date.now(),
    }
    setJobs(prev => [job, ...prev])
    return id
  }

  const updateJob = (id: string, updates: Partial<VideoGenerationJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === id 
        ? { ...job, ...updates, completedAt: updates.status === "completed" ? Date.now() : job.completedAt }
        : job
    ))
  }

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id))
  }

  const getActiveJobs = () => {
    return jobs.filter(job => job.status === "processing")
  }

  const getCompletedJobs = () => {
    return jobs.filter(job => job.status === "completed")
  }

  return (
    <VideoGenerationContext.Provider value={{
      jobs,
      addJob,
      updateJob,
      removeJob,
      getActiveJobs,
      getCompletedJobs,
    }}>
      {children}
    </VideoGenerationContext.Provider>
  )
}

export function useVideoGeneration() {
  const context = useContext(VideoGenerationContext)
  if (!context) {
    throw new Error("useVideoGeneration must be used within VideoGenerationProvider")
  }
  return context
}