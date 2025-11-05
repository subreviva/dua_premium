"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ChevronDown,
  ChevronUp,
  Music,
  Shuffle,
  Plus,
  Info,
  Sparkles,
  Library,
  Undo2,
  Redo2,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Helper function to save songs to localStorage
function saveSongToLocalStorage(songData: any) {
  try {
    const stored = localStorage.getItem("suno-songs")
    const songs = stored ? JSON.parse(stored) : []
    
    // Add new song at the beginning
    songs.unshift(songData)
    
    localStorage.setItem("suno-songs", JSON.stringify(songs))
    // console.log("[v0] Saved song to localStorage:", songData.title)
  } catch (error) {
    // console.error("[v0] Error saving song to localStorage:", error)
  }
}

export function CreatePanel() {
  const [mode, setMode] = useState<"simple" | "custom">("simple")
  const [lyricsExpanded, setLyricsExpanded] = useState(false)
  const [stylesExpanded, setStylesExpanded] = useState(false)
  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState("v4.5-all")
  const [songDescription, setSongDescription] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [styles, setStyles] = useState("")
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [excludeStyles, setExcludeStyles] = useState(false)
  const [vocalGender, setVocalGender] = useState<"male" | "female">("male")
  const [weirdness, setWeirdness] = useState([50])
  const [styleInfluence, setStyleInfluence] = useState([50])
  const [songTitle, setSongTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [lyricsPlaceholder] = useState("Enter your own lyrics or let AI create them for you")
  const [descriptionPlaceholder] = useState("a cozy indie song about sunshine")
  
  // Undo/Redo para lyrics
  const [lyricsHistory, setLyricsHistory] = useState<string[]>([])
  const [lyricsHistoryIndex, setLyricsHistoryIndex] = useState(-1)

  // Carregar créditos ao montar
  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/music/credits")
      const result = await response.json()
      if (result.success && result.data?.credits !== undefined) {
        setCredits(result.data.credits)
      }
    } catch (error) {
      // console.error("[v0] Error fetching credits:", error)
    }
  }

  const addStyleTag = (tag: string) => {
    const currentStyles = styles.split(",").map(s => s.trim()).filter(Boolean)
    if (!currentStyles.includes(tag)) {
      setStyles(currentStyles.length > 0 ? `${styles}, ${tag}` : tag)
    }
  }

  const shuffleDescription = () => {
    const descriptions = [
      "a cozy indie song about sunshine",
      "an energetic rock anthem about freedom",
      "a melancholic ballad about lost love",
      "an upbeat pop song about summer vibes",
      "a mysterious ambient track about the ocean",
      "a powerful orchestral piece about adventure",
    ]
    const random = descriptions[Math.floor(Math.random() * descriptions.length)]
    setSongDescription(random)
  }

  const handleLyricsChange = useCallback((newLyrics: string) => {
    setLyrics(newLyrics)
    // Adiciona ao histórico
    const newHistory = lyricsHistory.slice(0, lyricsHistoryIndex + 1)
    newHistory.push(newLyrics)
    setLyricsHistory(newHistory)
    setLyricsHistoryIndex(newHistory.length - 1)
  }, [lyricsHistory, lyricsHistoryIndex])

  const handleLyricsUndo = useCallback(() => {
    if (lyricsHistoryIndex > 0) {
      const newIndex = lyricsHistoryIndex - 1
      setLyricsHistoryIndex(newIndex)
      setLyrics(lyricsHistory[newIndex])
    }
  }, [lyricsHistory, lyricsHistoryIndex])

  const handleLyricsRedo = useCallback(() => {
    if (lyricsHistoryIndex < lyricsHistory.length - 1) {
      const newIndex = lyricsHistoryIndex + 1
      setLyricsHistoryIndex(newIndex)
      setLyrics(lyricsHistory[newIndex])
    }
  }, [lyricsHistory, lyricsHistoryIndex])

  const inspirationTags = [
    "aggro",
    "panpipe",
    "indie rock",
    "unique",
    "country",
    "indie rock",
    "radiant",
    "techno",
    "intricate rhythms",
    "latin",
    "slow guitar",
    "epic tr",
  ]
  const styleTags = ["synthesizer", "jamaican reggae", "big room", "corrido alterado", "lo-fi rap", "lo-fi"]

  const versions = [
    {
      id: "v5-pro-beta",
      name: "v5 Pro Beta",
      desc: "Authentic vocals, superior audio quality and control",
      badge: "NEW",
    },
    { id: "v4.5-plus", name: "v4.5+ Pro", desc: "Advanced creation methods", badge: "PRO" },
    { id: "v4.5-pro", name: "v4.5 Pro", desc: "Intelligent prompts", badge: "PRO" },
    { id: "v4.5-all", name: "v4.5-all", desc: "Best free model", badge: null },
    { id: "v4-pro", name: "v4 Pro", desc: "Improved sound quality", badge: "PRO" },
    { id: "v3.5", name: "v3.5", desc: "Basic song structure", badge: null },
  ]

  const handleCreate = async () => {
    // Validação
    if (!songDescription && !lyrics && mode === "simple") {
      setErrorMessage("Please enter a song description or lyrics")
      return
    }
    if (!songDescription && mode === "custom") {
      setErrorMessage("Please enter a song description")
      return
    }

    setIsGenerating(true)
    setErrorMessage("")
    setGenerationStatus("Initializing...")
    
    try {
      // ⚠️ OFFICIAL MODEL MAPPING per Suno_API_MegaDetalhada.txt Section 3
      const modelMap: Record<string, "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"> = {
        "v5-pro-beta": "V5",
        "v5 Pro Beta": "V5",
        "v4.5-plus": "V4_5PLUS",
        "v4.5+ Pro": "V4_5PLUS",
        "v4.5-pro": "V4_5",
        "v4.5 Pro": "V4_5",
        "v4.5-all": "V4_5",
        "v4-pro": "V4",
        "v4 Pro": "V4",
        "v3.5": "V3_5",
      }

      // ⚠️ OFFICIAL PARAMETERS per Suno_API_MegaDetalhada.txt Section 3
      const params: any = {
        prompt: mode === "simple" ? songDescription : (lyrics || songDescription),
        customMode: mode === "custom",
        instrumental: isInstrumental,
        model: modelMap[selectedVersion] || "V4_5",
        
        // Custom mode fields (only if custom)
        ...(mode === "custom" && {
          style: styles || undefined,
          title: songTitle || undefined,
        }),
        
        // Optional advanced parameters
        vocalGender: vocalGender === "male" ? "m" : "f",  camelCase
        styleWeight: styleInfluence[0] / 100,              camelCase
        weirdnessConstraint: weirdness[0] / 100,           camelCase
        negativeTags: excludeStyles && styles ? styles : undefined,  camelCase
        
        callBackUrl: `${window.location.origin}/api/music/callback`  camelCase
      }

      // console.log('[Generate] Sending request (camelCase):', JSON.stringify(params, null, 2))

      setGenerationStatus("Creating music...")
      const response = await fetch("/api/music/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      // console.log("[v0] Music generation started:", result)

      if (result.success && result.data?.task_id) {
        pollForResults(result.data.task_id)
      } else {
        throw new Error(result.error || "No task_id received")
      }
    } catch (error) {
      // console.error("[v0] Error generating music:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate music")
      setIsGenerating(false)
      setGenerationStatus("")
    }
  }

  const pollForResults = async (taskId: string) => {
    const maxAttempts = 60
    let attempts = 0

    setGenerationStatus("Processing... (0%)")

    const poll = setInterval(async () => {
      attempts++
      const progress = Math.min(Math.round((attempts / maxAttempts) * 100), 95)
      setGenerationStatus(`Processing... (${progress}%)`)

      try {
        const response = await fetch(`/api/music/task/${taskId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        // console.log("[v0] Polling attempt", attempts, "result:", result)

        // Check if all tracks are in succeeded state
        const allSucceeded = result.success && 
          Array.isArray(result.data) && 
          result.data.every((track: any) => track.state === "succeeded")

        if (allSucceeded) {
          clearInterval(poll)
          setGenerationStatus("Complete! ✓")
          // console.log("[v0] Music generation complete:", result.data)
          
          // Save generated songs to localStorage
          const generatedSongs = result.data || []
          // console.log(`[v0] Saving ${generatedSongs.length} songs to localStorage`)
          
          generatedSongs.forEach((song: any, index: number) => {
            // console.log(`[v0] Processing song ${index + 1}:`, {
              id: song.clip_id,
              title: song.title,
              audio_url: song.audio_url
            })
            
            const songData = {
              id: song.clip_id || Math.random().toString(36).substr(2, 9),
              title: song.title || "Untitled",
              version: song.mv || selectedVersion,
              genre: song.tags || styles || "Unknown",
              duration: song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : "0:00",
              thumbnail: song.image_url || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20ecra%CC%83%202025-10-28%2C%20a%CC%80s%2005.27.30-h6Z8C7Z8K2D4OrxMdjVjEYabAZVZ49.png",
              gradient: "from-purple-600 to-pink-600",
              audioUrl: song.audio_url,
              videoUrl: song.video_url,
              imageUrl: song.image_url,
              prompt: song.gpt_description_prompt || lyrics || songDescription,
              lyrics: song.lyrics,
              tags: song.tags,
              modelName: song.mv,
              createdAt: song.created_at || new Date().toISOString(),
            }
            
            // console.log('[v0] Saving song data:', songData)
            saveSongToLocalStorage(songData)
          })
          
          // console.log('[v0] All songs saved. Triggering storage event.')
          window.dispatchEvent(new Event('storage'))
          
          fetchCredits()
          
          setTimeout(() => {
            setIsGenerating(false)
            setGenerationStatus("")
            setSongDescription("")
            setLyrics("")
            setSongTitle("")
          }, 2000)
        } else if (!result.success) {
          clearInterval(poll)
          const errorMsg = result.error || "Generation failed"
          setErrorMessage(errorMsg)
          // console.error("[v0] Music generation failed:", errorMsg)
          setIsGenerating(false)
          setGenerationStatus("")
        } else if (attempts >= maxAttempts) {
          clearInterval(poll)
          setErrorMessage("Generation timeout - please try again")
          // console.log("[v0] Polling timeout")
          setIsGenerating(false)
          setGenerationStatus("")
        }
      } catch (error) {
        // console.error("[v0] Error polling results:", error)
        clearInterval(poll)
        setErrorMessage(error instanceof Error ? error.message : "Failed to check generation status")
        setIsGenerating(false)
        setGenerationStatus("")
      }
    }, 5000)
  }

  return (
    <>
      <div className="w-full lg:w-[620px] glass-effect flex flex-col border-r border-white/10">
        <div className="p-4 lg:p-5 border-b border-white/10 flex items-center justify-between backdrop-blur-xl flex-wrap gap-3">
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="text-neutral-400 hover:text-white transition-colors hidden lg:block">
              <ChevronDown className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Music className="h-3 lg:h-4 w-3 lg:w-4 text-purple-400" />
              <span className="text-xs lg:text-sm font-semibold gradient-text">
                {credits !== null ? credits : <Loader2 className="h-3 w-3 animate-spin" />}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <Button
              variant={mode === "simple" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("simple")}
              className={`premium-button text-xs lg:text-sm ${mode === "simple" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}
            >
              Simple
            </Button>
            <Button
              variant={mode === "custom" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMode("custom")}
              className={`premium-button text-xs lg:text-sm ${mode === "custom" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}
            >
              Custom
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="premium-button bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 font-medium text-xs lg:text-sm"
              >
                {selectedVersion}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 lg:w-72 glass-effect border-white/10 p-2">
              {versions.map((version) => (
                <DropdownMenuItem
                  key={version.id}
                  onClick={() => setSelectedVersion(version.name)}
                  className="flex flex-col items-start py-3 px-3 cursor-pointer hover:bg-white/10 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-semibold text-white text-sm">{version.name}</span>
                    {version.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          version.badge === "NEW"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-white/10 text-purple-400"
                        }`}
                      >
                        {version.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">{version.desc}</div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 custom-scrollbar">
          {mode === "simple" && (
            <>
              <div className="space-y-3">
                <button
                  onClick={() => setLyricsExpanded(!lyricsExpanded)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="font-semibold text-lg">Lyrics</span>
                  <div className="flex items-center gap-2">
                    {lyricsExpanded && lyrics && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLyricsUndo()
                          }}
                          disabled={lyricsHistoryIndex <= 0}
                          className="h-7 w-7 p-0 hover:bg-white/10 disabled:opacity-30"
                          title="Undo"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLyricsRedo()
                          }}
                          disabled={lyricsHistoryIndex >= lyricsHistory.length - 1}
                          className="h-7 w-7 p-0 hover:bg-white/10 disabled:opacity-30"
                          title="Redo"
                        >
                          <Redo2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {lyricsExpanded ? (
                      <ChevronUp className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                    )}
                  </div>
                </button>

                {lyricsExpanded && (
                  <>
                    <Textarea
                      placeholder={lyricsPlaceholder}
                      value={lyrics}
                      onChange={(e) => handleLyricsChange(e.target.value)}
                      className="min-h-[120px] premium-input resize-none font-medium"
                    />
                  </>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStylesExpanded(!stylesExpanded)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="font-semibold text-lg">Styles</span>
                  {stylesExpanded ? (
                    <ChevronUp className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                  )}
                </button>

                {stylesExpanded && (
                  <>
                    <Textarea
                      value={styles}
                      onChange={(e) => setStyles(e.target.value)}
                      className="min-h-[60px] premium-input resize-none text-sm font-medium"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-400 font-medium">
                        <Library className="h-4 w-4" />
                        <span>Library</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStyles("")}
                          className="premium-button h-8 w-8 p-0 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 bg-transparent"
                          title="Clear styles"
                        >
                          <Music className="h-3 w-3 text-purple-400" />
                        </Button>
                        {styleTags.map((tag) => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => addStyleTag(tag)}
                            className="premium-button border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-xs font-medium bg-transparent"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAdvancedExpanded(!advancedExpanded)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="font-semibold text-lg flex items-center gap-2">
                    Advanced Options
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </span>
                  {advancedExpanded ? (
                    <ChevronUp className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
                  )}
                </button>

                {advancedExpanded && (
                  <div className="space-y-5 pt-3">
                    <div className="flex items-center gap-3 p-4 premium-card rounded-xl">
                      <Checkbox
                        checked={excludeStyles}
                        onCheckedChange={(checked) => setExcludeStyles(checked as boolean)}
                        className="border-white/20 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                      />
                      <label className="text-sm cursor-pointer flex-1 font-medium">Exclude styles</label>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold">Vocal Gender</label>
                        <Info className="h-3.5 w-3.5 text-neutral-400 hover:text-purple-400 transition-colors cursor-help" />
                      </div>
                      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                        <Button
                          variant={vocalGender === "male" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setVocalGender("male")}
                          className={`premium-button flex-1 ${vocalGender === "male" ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}
                        >
                          Male
                        </Button>
                        <Button
                          variant={vocalGender === "female" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => setVocalGender("female")}
                          className={`premium-button flex-1 ${vocalGender === "female" ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}
                        >
                          Female
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold">Weirdness</label>
                          <Info className="h-3.5 w-3.5 text-neutral-400 hover:text-purple-400 transition-colors cursor-help" />
                        </div>
                        <span className="text-sm font-bold gradient-text">{weirdness[0]}%</span>
                      </div>
                      <Slider
                        value={weirdness}
                        onValueChange={setWeirdness}
                        max={100}
                        step={1}
                        className="premium-slider w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold">Style Influence</label>
                          <Info className="h-3.5 w-3.5 text-neutral-400 hover:text-purple-400 transition-colors cursor-help" />
                        </div>
                        <span className="text-sm font-bold gradient-text">{styleInfluence[0]}%</span>
                      </div>
                      <Slider
                        value={styleInfluence}
                        onValueChange={setStyleInfluence}
                        max={100}
                        step={1}
                        className="premium-slider w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Music className="h-4 w-4 text-purple-400" />
                        Song Title (Optional)
                      </label>
                      <Input
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="Enter song title..."
                        className="premium-input font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {mode === "custom" && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Song Description</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={shuffleDescription}
                    className="h-8 w-8 p-0 hover:bg-white/10"
                    title="Random description"
                  >
                    <Shuffle className="h-4 w-4 text-purple-400" />
                  </Button>
                </div>
                <Textarea
                  placeholder={descriptionPlaceholder}
                  value={songDescription}
                  onChange={(e) => setSongDescription(e.target.value)}
                  className="min-h-[80px] premium-input resize-none font-medium"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={isInstrumental ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setIsInstrumental(!isInstrumental)}
                  className={`premium-button ${isInstrumental ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30" : "premium-card border-white/10"} font-medium`}
                >
                  Instrumental
                </Button>
              </div>

              <div className="space-y-3">
                <span className="font-semibold text-lg">Inspiration</span>
                <div className="flex flex-wrap gap-2">
                  {inspirationTags.map((tag) => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      onClick={() => addStyleTag(tag)}
                      className="premium-button border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-xs font-medium bg-transparent"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 lg:p-6 border-t border-white/10 backdrop-blur-xl space-y-3">
          {/* Status/Error Messages */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}
          
          {generationStatus && !errorMessage && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-purple-400 animate-spin flex-shrink-0" />
              <p className="text-sm text-purple-300">{generationStatus}</p>
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-sm lg:text-base h-11 lg:h-12 rounded-xl glow-effect premium-button shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 lg:h-5 w-4 lg:w-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                Create
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
