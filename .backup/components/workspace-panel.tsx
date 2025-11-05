"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ChevronDown, Music, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SongCard } from "@/components/song-card"
import { SongDetailPanel } from "@/components/song-detail-panel"
import { AudioEditor } from "@/components/audio-editor"

interface WorkspacePanelProps {
  workspaceName: string
}

interface Song {
  id: string
  title: string
  version: string
  genre: string
  duration: string
  thumbnail: string
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

export function WorkspacePanel({ workspaceName }: WorkspacePanelProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null)
  const [editingSong, setEditingSong] = useState<string | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLiked, setFilterLiked] = useState(false)
  const [filterPublic, setFilterPublic] = useState(false)
  const [filterUploads, setFilterUploads] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest")

  // Load songs from localStorage
  useEffect(() => {
    const loadSongs = () => {
      try {
        const stored = localStorage.getItem("suno-songs")
        if (stored) {
          const parsed = JSON.parse(stored)
          setSongs(parsed)
          // console.log("[v0] Loaded", parsed.length, "songs from localStorage")
        }
      } catch (error) {
        // console.error("[v0] Error loading songs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSongs()

    // Listen for storage events (updates from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "suno-songs" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setSongs(parsed)
          // console.log("[v0] Songs updated from storage event")
        } catch (error) {
          // console.error("[v0] Error parsing storage event:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Reload every 5 seconds to catch updates
    const interval = setInterval(() => {
      const stored = localStorage.getItem("suno-songs")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (JSON.stringify(parsed) !== JSON.stringify(songs)) {
            setSongs(parsed)
            // console.log("[v0] Songs updated from interval check")
          }
        } catch (error) {
          // console.error("[v0] Error in interval check:", error)
        }
      }
    }, 5000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [songs])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // console.log("[v0] Searching for:", query)
  }

  const handleFilterLiked = () => {
    setFilterLiked(!filterLiked)
    // console.log("[v0] Filter liked:", !filterLiked)
  }

  const handleFilterPublic = () => {
    setFilterPublic(!filterPublic)
    // console.log("[v0] Filter public:", !filterPublic)
  }

  const handleFilterUploads = () => {
    setFilterUploads(!filterUploads)
    // console.log("[v0] Filter uploads:", !filterUploads)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setFilterLiked(false)
    setFilterPublic(false)
    setFilterUploads(false)
    // console.log("[v0] Filters reset")
  }

  const handleSortChange = () => {
    const nextSort = sortBy === "newest" ? "oldest" : sortBy === "oldest" ? "title" : "newest"
    setSortBy(nextSort)
    // console.log("[v0] Sort by:", nextSort)
  }

  const filteredSongs = songs.filter((song) => {
    if (searchQuery && !song.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterUploads && !song.uploaded) return false
    return true
  })

  return (
    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
      <div className="flex-1 bg-black flex flex-col">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <button className="text-neutral-400 hover:text-white hidden lg:block">
              <ChevronDown className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0" />
            <h2 className="text-lg lg:text-xl font-semibold truncate">{workspaceName}</h2>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search"
                className="pl-10 bg-neutral-900 border-neutral-800 text-sm"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-neutral-900 border-neutral-800 flex-1 lg:flex-none text-xs lg:text-sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Filters</span> (
                {[filterLiked, filterPublic, filterUploads].filter(Boolean).length})
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="bg-neutral-900 border-neutral-800 flex-1 lg:flex-none text-xs lg:text-sm"
                onClick={handleSortChange}
              >
                <span className="mr-2">≡</span>
                <span className="hidden lg:inline">
                  {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Title"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <Button
              variant="ghost"
              size="sm"
              className={`${filterLiked ? "text-white bg-neutral-800" : "text-neutral-400"} text-xs lg:text-sm flex-shrink-0`}
              onClick={handleFilterLiked}
            >
              Liked
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${filterPublic ? "text-white bg-neutral-800" : "text-neutral-400"} text-xs lg:text-sm flex-shrink-0`}
              onClick={handleFilterPublic}
            >
              Public
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${filterUploads ? "text-white bg-neutral-800" : "text-neutral-400"} text-xs lg:text-sm flex-shrink-0`}
              onClick={handleFilterUploads}
            >
              Uploads
            </Button>
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
              <p className="text-neutral-400">Loading songs...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {songs.length === 0 ? (
                <>
                  <Music className="h-16 w-16 text-neutral-700 mb-4" />
                  <p className="text-neutral-400 mb-2 text-lg font-semibold">No songs yet</p>
                  <p className="text-neutral-500 text-sm mb-4">Create your first song to get started!</p>
                </>
              ) : (
                <>
                  <p className="text-neutral-400 mb-4">No songs found</p>
                  <Button variant="link" className="text-neutral-500" onClick={handleResetFilters}>
                    Reset filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onSelect={() => setSelectedSong(song.id)}
                  isSelected={selectedSong === song.id}
                  onEdit={() => setEditingSong(song.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Song Detail Panel */}
      {selectedSong && (
        <div className="fixed inset-0 lg:relative lg:inset-auto z-30 lg:z-0">
          <SongDetailPanel song={songs.find((s) => s.id === selectedSong)!} onClose={() => setSelectedSong(null)} />
        </div>
      )}

      {/* Audio Editor */}
      {editingSong && (
        <AudioEditor song={songs.find((s) => s.id === editingSong)!} onClose={() => setEditingSong(null)} />
      )}
    </div>
  )
}
