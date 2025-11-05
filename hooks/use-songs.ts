"use client"

import { useState, useEffect } from "react"

export interface Song {
  id: string
  title: string
  version: string
  genre: string
  duration: string
  thumbnail?: string
  gradient: string
  audioUrl?: string
  streamAudioUrl?: string
  videoUrl?: string
  imageUrl?: string
  prompt?: string
  lyrics?: string
  tags?: string
  modelName?: string
  uploaded?: boolean
  featured?: boolean
  liked?: boolean
  isPublic?: boolean
  createdAt?: string
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load songs from localStorage on mount
  useEffect(() => {
    const loadSongs = () => {
      try {
        const stored = localStorage.getItem("suno-songs")
        if (stored) {
          const parsed = JSON.parse(stored)
          setSongs(parsed)
          // PRODUCTION: Removed console.log("[v0] Loaded", parsed.length, "songs from localStorage")
        }
      } catch (error) {
        // PRODUCTION: Removed console.error("[v0] Error loading songs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSongs()
  }, [])

  // Save songs to localStorage whenever they change
  useEffect(() => {
    if (songs.length > 0) {
      try {
        localStorage.setItem("suno-songs", JSON.stringify(songs))
        // PRODUCTION: Removed console.log("[v0] Saved", songs.length, "songs to localStorage")
      } catch (error) {
        // PRODUCTION: Removed console.error("[v0] Error saving songs:", error)
      }
    }
  }, [songs])

  const addSong = (song: Song) => {
    setSongs((prev) => [song, ...prev])
    // PRODUCTION: Removed console.log("[v0] Added song:", song.title)
  }

  const addSongs = (newSongs: Song[]) => {
    setSongs((prev) => [...newSongs, ...prev])
    // PRODUCTION: Removed console.log("[v0] Added", newSongs.length, "songs")
  }

  const updateSong = (id: string, updates: Partial<Song>) => {
    setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, ...updates } : song)))
    // PRODUCTION: Removed console.log("[v0] Updated song:", id)
  }

  const deleteSong = (id: string) => {
    setSongs((prev) => prev.filter((song) => song.id !== id))
    // PRODUCTION: Removed console.log("[v0] Deleted song:", id)
  }

  const toggleLike = (id: string) => {
    setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, liked: !song.liked } : song)))
  }

  const togglePublic = (id: string) => {
    setSongs((prev) => prev.map((song) => (song.id === id ? { ...song, isPublic: !song.isPublic } : song)))
  }

  return {
    songs,
    isLoading,
    addSong,
    addSongs,
    updateSong,
    deleteSong,
    toggleLike,
    togglePublic,
  }
}
