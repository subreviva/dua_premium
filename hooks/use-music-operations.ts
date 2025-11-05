import { useState } from "react"

interface Song {
  id: string
  title: string
  taskId?: string
  musicIndex?: number
  genre?: string
  audioUrl?: string
}

export function useMusicOperations() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (operation: string, error: any) => {
    // PRODUCTION: Removed console.error(`[v0] Error in ${operation}:`, error)
    setError(`Failed to ${operation}: ${error.message || "Unknown error"}`)
    setIsProcessing(false)
  }

  // Generate Lyrics
  const generateLyrics = async (prompt: string) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `lyrics_${Date.now()}`,
          prompt,
          callBackUrl: `${window.location.origin}/api/callback`,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Lyrics generation started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("generate lyrics", error)
      throw error
    }
  }

  // Separate Vocals/Stems
  const separateVocals = async (audioId: string, type: "separate_vocal" | "split_stem" = "separate_vocal") => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/separate-vocals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `stems_${Date.now()}`,
          audioId,
          type,
          callBackUrl: `${window.location.origin}/api/callback`,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Vocal separation started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("separate vocals", error)
      throw error
    }
  }

  // Convert to WAV
  const convertToWav = async (audioId: string) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/convert-wav", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `wav_${Date.now()}`,
          audioId,
          callBackUrl: `${window.location.origin}/api/callback`,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] WAV conversion started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("convert to WAV", error)
      throw error
    }
  }

  // Create Music Video
  const createMusicVideo = async (audioId: string, options?: { author?: string; domainName?: string }) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `video_${Date.now()}`,
          audioId,
          callBackUrl: `${window.location.origin}/api/callback`,
          ...options,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Video creation started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("create video", error)
      throw error
    }
  }

  // Generate Persona
  const generatePersona = async (song: Song) => {
    setIsProcessing(true)
    setError(null)
    try {
      if (!song.taskId) {
        throw new Error("Cannot create persona: taskId is missing")
      }

      const response = await fetch("/api/music/generate-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: song.taskId,
          musicIndex: song.musicIndex ?? 0,
          name: song.title || "Untitled Persona",
          description: song.genre || "A unique musical persona with distinctive style",
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Persona generation result:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("generate persona", error)
      throw error
    }
  }

  // Boost Style
  const boostStyle = async (content: string) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/boost-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Style boost result:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("boost style", error)
      throw error
    }
  }

  // Generate Cover
  const generateCover = async (audioId: string, options: { prompt?: string; style?: string; title?: string }) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `cover_${Date.now()}`,
          audioId,
          ...options,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Cover generation started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("generate cover", error)
      throw error
    }
  }

  // Extend Music
  const extendMusic = async (audioId: string, options: any) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `extend_${Date.now()}`,
          audioId,
          callBackUrl: `${window.location.origin}/api/callback`,
          ...options,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Music extension started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("extend music", error)
      throw error
    }
  }

  // Add Instrumental
  const addInstrumental = async (audioId: string, options: any) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/add-instrumental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `instrumental_${Date.now()}`,
          audioId,
          callBackUrl: `${window.location.origin}/api/callback`,
          ...options,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Instrumental addition started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("add instrumental", error)
      throw error
    }
  }

  // Add Vocals
  const addVocals = async (audioId: string, options: any) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/add-vocals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `vocals_${Date.now()}`,
          audioId,
          callBackUrl: `${window.location.origin}/api/callback`,
          ...options,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Vocals addition started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("add vocals", error)
      throw error
    }
  }

  // Replace Section
  const replaceSection = async (audioId: string, options: any) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/replace-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `replace_${Date.now()}`,
          audioId,
          callBackUrl: `${window.location.origin}/api/callback`,
          ...options,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Section replacement started:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("replace section", error)
      throw error
    }
  }

  // Get Timestamped Lyrics
  const getTimestampedLyrics = async (audioId: string) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await fetch("/api/music/timestamped-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: `lyrics_ts_${Date.now()}`,
          audioId,
          callBackUrl: `${window.location.origin}/api/callback`,
        }),
      })
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Timestamped lyrics request:", result)
      setIsProcessing(false)
      return result
    } catch (error) {
      handleError("get timestamped lyrics", error)
      throw error
    }
  }

  // Get Remaining Credits
  const getRemainingCredits = async () => {
    try {
      const response = await fetch("/api/music/credits")
      const result = await response.json()
      // PRODUCTION: Removed console.log("[v0] Remaining credits:", result)
      return result
    } catch (error) {
      handleError("get credits", error)
      throw error
    }
  }

  return {
    isProcessing,
    error,
    generateLyrics,
    separateVocals,
    convertToWav,
    createMusicVideo,
    generatePersona,
    boostStyle,
    generateCover,
    extendMusic,
    addInstrumental,
    addVocals,
    replaceSection,
    getTimestampedLyrics,
    getRemainingCredits,
  }
}
