"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SongCard } from "@/components/song-card"
import { SongDetailPanel } from "@/components/song-detail-panel"
import { AudioEditor } from "@/components/audio-editor"

interface WorkspacePanelProps {
  workspaceName: string
}

// Mock data
const mockSongs = [
  {
    id: "1",
    title: "Untitled",
    version: "v5",
    genre: "Rap hiphop",
    duration: "0:35",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2005.27.30-h6Z8C7Z8K2D4OrxMdjVjEYabAZVZ49.png",
    gradient: "from-orange-600 to-amber-700",
  },
  {
    id: "2",
    title: "Untitled",
    version: "v5",
    genre: "Rap hiphop",
    duration: "1:13",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2005.27.30-h6Z8C7Z8K2D4OrxMdjVjEYabAZVZ49.png",
    gradient: "from-pink-500 via-purple-500 to-orange-500",
  },
  {
    id: "3",
    title: "2025-10-26_18:13:59",
    version: "",
    genre: "A solo human vocal performance",
    duration: "0:11",
    uploaded: true,
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2005.27.30-h6Z8C7Z8K2D4OrxMdjVjEYabAZVZ49.png",
    gradient: "from-yellow-400 via-pink-500 to-purple-600",
  },
  {
    id: "4",
    title: "Blue Skies, Cold Nights",
    version: "v5",
    genre: "rap, bassline groove, sparse synth stabs",
    duration: "2:22",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2005.27.30-h6Z8C7Z8K2D4OrxMdjVjEYabAZVZ49.png",
    gradient: "from-teal-700 to-teal-900",
  },
  {
    id: "5",
    title: "Blue Skies, Cold Nights",
    version: "v5",
    genre: "rap, bassline groove, sparse synth stabs",
    duration: "1:48",
    featured: true,
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2005.27.30-h6Z8C7Z8K2D4OrxMdjVjEYabAZVZ49.png",
    gradient: "from-teal-700 to-teal-900",
  },
  {
    id: "6",
    title: "Neon Nostalgia",
    version: "v5",
    genre: "groovy synths, f980s-inspired, punchy drum",
    duration: "2:26",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2005.27.30-h6Z8C7Z8K2D4OrxMdjVjEYabAZVZ49.png",
    gradient: "from-blue-600 to-purple-700",
  },
]

export function WorkspacePanel({ workspaceName }: WorkspacePanelProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null)
  const [editingSong, setEditingSong] = useState<string | null>(null)
  const [songs, setSongs] = useState(mockSongs)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLiked, setFilterLiked] = useState(false)
  const [filterPublic, setFilterPublic] = useState(false)
  const [filterUploads, setFilterUploads] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("[v0] Searching for:", query)
  }

  const handleFilterLiked = () => {
    setFilterLiked(!filterLiked)
    console.log("[v0] Filter liked:", !filterLiked)
  }

  const handleFilterPublic = () => {
    setFilterPublic(!filterPublic)
    console.log("[v0] Filter public:", !filterPublic)
  }

  const handleFilterUploads = () => {
    setFilterUploads(!filterUploads)
    console.log("[v0] Filter uploads:", !filterUploads)
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setFilterLiked(false)
    setFilterPublic(false)
    setFilterUploads(false)
    console.log("[v0] Filters reset")
  }

  const handleSortChange = () => {
    const nextSort = sortBy === "newest" ? "oldest" : sortBy === "oldest" ? "title" : "newest"
    setSortBy(nextSort)
    console.log("[v0] Sort by:", nextSort)
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
          {filteredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-neutral-400 mb-4">No songs found</p>
              <Button variant="link" className="text-neutral-500" onClick={handleResetFilters}>
                Reset filters
              </Button>
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
