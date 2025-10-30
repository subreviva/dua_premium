"use client"

import { useState, useCallback } from "react"
import { generateMusic, pollMusicStatus } from "@/lib/suno-api"
import type { GenerateMusicParams, MusicGenerationResult } from "@/lib/suno-api"

export interface Song {
  id: string
  title: string
  artist: string
  duration: string
  coverUrl: string
  audioUrl: string
  tags: string[]
  prompt: string
  model: string
  createdAt: string
  isPlaying?: boolean
}

export function useMusicGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [generatedSongs, setGeneratedSongs] = useState<Song[]>([])

  const generate = useCallback(async (request: GenerateMusicParams) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await generateMusic(request)

      if (response.code !== 200) {
        throw new Error(response.msg || "Failed to generate music")
      }

      setTaskId(response.data.taskId)

      // Start polling for results
      pollForResults(response.data.taskId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate music")
      setIsGenerating(false)
    }
  }, [])

  const pollForResults = useCallback(async (taskId: string) => {
    const maxAttempts = 60 // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0

    const poll = async () => {
      try {
        const result = await pollMusicStatus(taskId)

        if (result.code === 200 && result.data.callbackType === "complete") {
          // Convert MusicGenerationResult to Song format
          const songs: Song[] =
            result.data.data?.map((track: MusicGenerationResult) => ({
              id: track.id,
              title: track.title,
              artist: "AI Generated",
              duration: formatDuration(track.duration),
              coverUrl: track.imageUrl,
              audioUrl: track.audioUrl,
              tags: track.tags.split(", "),
              prompt: track.prompt,
              model: track.modelName,
              createdAt: track.createTime,
            })) || []

          setGeneratedSongs(songs)
          setIsGenerating(false)
          return
        }

        if (result.code !== 200) {
          throw new Error(result.msg || "Music generation failed")
        }

        // Continue polling if not complete
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          throw new Error("Music generation timed out")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get music status")
        setIsGenerating(false)
      }
    }

    poll()
  }, [])

  const reset = useCallback(() => {
    setIsGenerating(false)
    setError(null)
    setTaskId(null)
    setGeneratedSongs([])
  }, [])

  return {
    generate,
    isGenerating,
    error,
    taskId,
    generatedSongs,
    reset,
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
