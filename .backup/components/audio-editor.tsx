"use client"

import { useState, useRef, useEffect } from "react"
import { X, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AudioEditorProps {
  song: any
  onClose: () => void
}

interface SongSection {
  id: string
  label: string
  start: number
  end: number
  color: string
}

export function AudioEditor({ song, onClose }: AudioEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(278) // 4:38 in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [keepPitch, setKeepPitch] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [showTip, setShowTip] = useState(true)
  const [showSpeedControl, setShowSpeedControl] = useState(false)
  const [showExtendMenu, setShowExtendMenu] = useState(false)
  const [isLoadingStructure, setIsLoadingStructure] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Song sections detected from structure
  const [sections, setSections] = useState<SongSection[]>([
    { id: "intro", label: "INTRO", start: 0, end: 13, color: "from-gray-700 to-gray-800" },
    { id: "verse", label: "VERSE", start: 13, end: 45, color: "from-pink-600 to-pink-700" },
    { id: "chorus", label: "CHORUS", start: 45, end: 75, color: "from-orange-500 to-orange-600" },
    { id: "verse2", label: "VERSE 2", start: 75, end: 107, color: "from-pink-600 to-pink-700" },
    { id: "prechorus", label: "PRECHORUS", start: 107, end: 122, color: "from-green-600 to-green-700" },
    { id: "chorus2", label: "CHORUS", start: 122, end: 152, color: "from-orange-500 to-orange-600" },
    { id: "bridge", label: "BRIDGE", start: 152, end: 278, color: "from-yellow-500 to-yellow-600" },
  ])

  useEffect(() => {
    // Simulate loading song structure
    const timer = setTimeout(() => {
      setIsLoadingStructure(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  const handleReplaceSection = () => {
    // console.log("[v0] Replace section feature")
    setShowTip(true)
  }

  const handleExtend = () => {
    setShowExtendMenu(!showExtendMenu)
  }

  const handleCrop = () => {
    // console.log("[v0] Crop feature")
  }

  const handleRemove = () => {
    if (selectionRange) {
      // console.log("[v0] Remove section:", selectionRange)
    }
  }

  const handleFadeOut = () => {
    // console.log("[v0] Fade out feature")
  }

  const handleExtendOption = async (option: string) => {
    // console.log("[v0] Extend option:", option)
    setShowExtendMenu(false)

    if (option === "extend") {
      try {
        const response = await fetch("/api/suno/extend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioId: song.id,
            prompt: song.genre || "continue the song",
            continueAt: formatTime(currentTime),
            model: "V3_5",
          }),
        })
        const data = await response.json()
        // console.log("[v0] Extend started:", data)
      } catch (error) {
        // console.error("[v0] Extend error:", error)
      }
    } else if (option === "cover") {
      try {
        const response = await fetch("/api/suno/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadUrl: song.id,
            prompt: "Create a cover version",
            title: `${song.title} (Cover)`,
          }),
        })
        const data = await response.json()
        // console.log("[v0] Cover started:", data)
      } catch (error) {
        // console.error("[v0] Cover error:", error)
      }
    } else if (option === "add-vocals") {
      try {
        const response = await fetch("/api/suno/vocals/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadUrl: song.id,
            prompt: "Add vocals",
            title: `${song.title} (With Vocals)`,
            style: song.genre || "",
          }),
        })
        const data = await response.json()
        // console.log("[v0] Add vocals started:", data)
      } catch (error) {
        // console.error("[v0] Add vocals error:", error)
      }
    } else if (option === "add-instrumental") {
      try {
        const response = await fetch("/api/suno/instrumental/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadUrl: song.id,
            prompt: "Add instrumental",
            title: `${song.title} (With Instrumental)`,
            style: song.genre || "",
          }),
        })
        const data = await response.json()
        // console.log("[v0] Add instrumental started:", data)
      } catch (error) {
        // console.error("[v0] Add instrumental error:", error)
      }
    }
  }

  const handleSectionClick = (section: SongSection) => {
    setSelectedSection(section.id)
    setSelectionRange({ start: section.start, end: section.end })
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar */}
      <div className="h-14 lg:h-14 bg-[#0a0a0a] border-b border-neutral-800 flex items-center justify-between px-2 lg:px-4 overflow-x-auto">
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <Button variant="ghost" size="sm" className="text-neutral-400 hidden lg:flex">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Button>
          <span className="text-xs lg:text-sm font-medium">Edit</span>
        </div>

        {/* Editing buttons */}
        <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs lg:text-sm px-2 lg:px-3 ${!selectionRange ? "text-neutral-600" : "text-neutral-300"}`}
            onClick={handleReplaceSection}
            disabled={!selectionRange}
          >
            <svg className="h-3 lg:h-4 w-3 lg:w-4 lg:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
            </svg>
            <span className="hidden lg:inline">REPLACE</span>
          </Button>

          <DropdownMenu open={showExtendMenu} onOpenChange={setShowExtendMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs lg:text-sm px-2 lg:px-3 text-neutral-300">
                <svg className="h-3 lg:h-4 w-3 lg:w-4 lg:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden lg:inline">EXTEND</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1a1a] border-neutral-800">
              <DropdownMenuItem onClick={() => handleExtendOption("cover")}>Cover</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExtendOption("extend")}>Extend</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExtendOption("add-vocals")}>Add Vocals</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExtendOption("add-instrumental")}>
                Add Instrumental
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExtendOption("use-styles")}>Use Styles & Lyrics</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs lg:text-sm px-2 lg:px-3 text-neutral-300"
            onClick={handleCrop}
          >
            <svg className="h-3 lg:h-4 w-3 lg:w-4 lg:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M6.13 1L6 16a2 2 0 0 0 2 2h15M1 6.13L16 6a2 2 0 0 1 2 2v15"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden lg:inline">CROP</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`text-xs lg:text-sm px-2 lg:px-3 ${!selectionRange ? "text-neutral-600" : "text-neutral-300"}`}
            onClick={handleRemove}
            disabled={!selectionRange}
          >
            <svg className="h-3 lg:h-4 w-3 lg:w-4 lg:mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hidden lg:inline">REMOVE</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs lg:text-sm px-2 lg:px-3 text-neutral-300 hidden lg:flex"
            onClick={handleFadeOut}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2v20M17 7l-5 5-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            FADE OUT
          </Button>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs lg:text-sm px-2 lg:px-4 hidden lg:flex">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            Edit in Studio
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-black overflow-hidden">
        {/* Waveform Area */}
        <div className="flex-1 flex items-center justify-center p-2 lg:p-8 overflow-auto">
          <div className="w-full max-w-7xl">
            {/* Timeline */}
            <div className="relative h-48 lg:h-64 bg-neutral-900 rounded-lg overflow-hidden">
              {isLoadingStructure ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-neutral-500 text-sm">LOADING SONG STRUCTURE...</div>
                </div>
              ) : (
                <>
                  {/* Time markers */}
                  <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-4 border-b border-neutral-800">
                    {Array.from({ length: Math.ceil(duration / 30) }).map((_, i) => (
                      <div key={i} className="flex-1 text-xs text-neutral-500">
                        {formatTime(i * 30).substring(0, 5)}
                      </div>
                    ))}
                  </div>

                  {/* Sections */}
                  <div className="absolute top-8 left-0 right-0 bottom-0 flex">
                    {sections.map((section) => {
                      const width = ((section.end - section.start) / duration) * 100
                      const isSelected = selectedSection === section.id

                      return (
                        <div
                          key={section.id}
                          className={`relative cursor-pointer transition-all ${isSelected ? "ring-2 ring-pink-500" : ""}`}
                          style={{ width: `${width}%` }}
                          onClick={() => handleSectionClick(section)}
                        >
                          {/* Section label */}
                          <div
                            className={`absolute top-2 left-2 px-2 py-1 bg-gradient-to-r ${section.color} rounded text-xs font-semibold z-10`}
                          >
                            {section.label}
                          </div>

                          {/* Waveform */}
                          <div className="absolute inset-0 flex items-center px-2">
                            {Array.from({ length: Math.floor(width * 2) }).map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 bg-gradient-to-r ${section.color} opacity-70 rounded-full mx-px`}
                                style={{
                                  height: `${Math.random() * 60 + 20}%`,
                                }}
                              />
                            ))}
                          </div>

                          {/* Delete icon for selected section */}
                          {isSelected && section.id === "intro" && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/80 flex items-center justify-center z-20">
                              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <path d="M4.93 4.93l14.14 14.14" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Selection range indicator */}
                  {selectionRange && (
                    <div className="absolute top-0 right-4 bg-neutral-800 px-3 py-1 rounded-b text-xs font-mono">
                      {formatTime(selectionRange.start)} — {formatTime(selectionRange.end)}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Remove button for selection */}
            {selectionRange && !isLoadingStructure && (
              <div className="mt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <p className="text-xs lg:text-sm text-neutral-400">
                  Drag the edges of the selection to pick a span of time to delete.
                </p>
                <Button
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 w-full lg:w-auto"
                  onClick={handleRemove}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="h-24 lg:h-32 bg-[#0a0a0a] border-t border-neutral-800 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-8 py-3 lg:py-0 gap-3 lg:gap-0">
          {/* Left: Song Info */}
          <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center flex-shrink-0">
              <img
                src={song.thumbnail || "/placeholder.svg"}
                alt={song.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm lg:text-base truncate">{song.title}</h3>
              <p className="text-xs lg:text-sm text-neutral-400 truncate">
                {song.version} • {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white text-black hover:bg-neutral-200"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-5 lg:h-6 w-5 lg:w-6" fill="black" />
              ) : (
                <Play className="h-5 lg:h-6 w-5 lg:w-6 ml-1" fill="black" />
              )}
            </Button>
          </div>

          {/* Right: Additional Controls */}
          <div className="flex items-center gap-3 lg:gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowSpeedControl(!showSpeedControl)}>
              <span className="text-xs lg:text-sm font-mono">{playbackSpeed.toFixed(2)}x</span>
            </Button>
            <Button variant="ghost" size="sm" className="hidden lg:flex">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTip && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowTip(false)}
        >
          <div className="bg-[#0a0a0a] rounded-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">TIP</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowTip(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-neutral-400">Styles</div>

              <h2 className="text-xl font-semibold">Try "Replace Section"</h2>

              <div className="space-y-3 text-sm text-neutral-300">
                <p>
                  Select a section of your track to generate fresh infills. Experiment with different lyrics and styles.
                </p>
                <p>Once you're satisfied with the result, apply it to create a brand-new version of your track.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowTip(false)}>
                  Dismiss
                </Button>
                <Button className="bg-white text-black hover:bg-neutral-200" onClick={() => setShowTip(false)}>
                  Try Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speed Control Modal */}
      {showSpeedControl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowSpeedControl(false)}
        >
          <div className="bg-[#0a0a0a] rounded-lg w-full max-w-md p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{song.title}</h3>
                <p className="text-sm text-neutral-400">00:00 / 04:38</p>
              </div>
            </div>

            {/* Waveform */}
            <div className="h-24 bg-neutral-900 rounded-lg overflow-hidden flex items-center px-4">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-neutral-700 rounded-full mx-px"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                  }}
                />
              ))}
            </div>

            {/* Speed Control */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold font-mono">{playbackSpeed.toFixed(2)}x</div>
              </div>

              <Slider
                value={[playbackSpeed]}
                onValueChange={(value) => setPlaybackSpeed(value[0])}
                min={0.25}
                max={4.0}
                step={0.01}
                className="w-full"
              />

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>0.25x</span>
                <span>4.00x</span>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="keep-pitch"
                  checked={keepPitch}
                  onCheckedChange={(checked) => setKeepPitch(checked as boolean)}
                />
                <label htmlFor="keep-pitch" className="text-sm cursor-pointer">
                  Keep Pitch
                </label>
              </div>
            </div>

            {/* Save Options */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <Checkbox id="save-to" />
                <label htmlFor="save-to" className="text-sm cursor-pointer">
                  Save to...
                </label>
              </div>
              <span className="text-sm text-neutral-400">My Workspace</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
