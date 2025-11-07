"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Download,
  Disc3,
  Volume2,
  VolumeX,
  Mic,
  Music2,
  Guitar,
  Piano,
  Loader2,
  Sparkles,
  AlertCircle,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useStems } from "@/contexts/stems-context"
import type { StemData as StemDataType, SavedStems } from "@/lib/types/stems"

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
  wavUrl?: string
}

interface TrackDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  track: Track | null
}

export function TrackDetailModal({ open, onOpenChange, track }: TrackDetailModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track?.duration ?? 0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isSeparating, setIsSeparating] = useState(false)
  const [separationProgress, setSeparationProgress] = useState(0)
  const [separationType, setSeparationType] = useState<"2-stem" | "12-stem" | null>(null)
  const [isConvertingWav, setIsConvertingWav] = useState(false)
  const [isGeneratingMidi, setIsGeneratingMidi] = useState(false)
  const [hasSeparated, setHasSeparated] = useState(false)
  const [stemSeparationTaskId, setStemSeparationTaskId] = useState<string | null>(null)
  const [stems, setStems] = useState<StemDataType[]>([])
  const [separationError, setSeparationError] = useState<string | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollCountRef = useRef(0)
  const [wavConversionTaskId, setWavConversionTaskId] = useState<string | null>(null)
  const [wavDownloadUrl, setWavDownloadUrl] = useState<string | null>(null)
  const wavPollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const wavPollCountRef = useRef(0)
  const [audioError, setAudioError] = useState<string | null>(null)

  const [playingStems, setPlayingStems] = useState<Set<string>>(new Set())
  const stemAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const [stemCurrentTimes, setStemCurrentTimes] = useState<Map<string, number>>(new Map())
  const [stemDurations, setStemDurations] = useState<Map<string, number>>(new Map())

  const { startStemSeparation, getStemSeparationStatus } = useStems()

  useEffect(() => {
    if (!track) {
      console.log("[v0] Track is null or undefined")
      return
    }
    console.log("[v0] Track data:", {
      id: track.id,
      title: track.title,
      duration: track.duration,
      audioUrl: track.audioUrl,
      streamAudioUrl: track.streamAudioUrl,
    })
  }, [track])

  useEffect(() => {
    if (audioRef.current && track) {
      const audioUrl = track.audioUrl || track.streamAudioUrl

      if (!audioUrl || audioUrl.trim() === "") {
        console.error("[v0] No valid audio URL available")
        setAudioError("URL de áudio não disponível")
        return
      }

      console.log("[v0] Setting audio source:", audioUrl)

      const handleError = (e: Event) => {
        console.error("[v0] Audio loading error:", e)
        const audio = e.target as HTMLAudioElement
        if (audio.error) {
          console.error("[v0] Audio error code:", audio.error.code)
          console.error("[v0] Audio error message:", audio.error.message)
          setAudioError(`Erro ao carregar áudio: ${audio.error.message}`)
        }
        setIsPlaying(false)
      }

      audioRef.current.addEventListener("error", handleError)
      audioRef.current.src = audioUrl
      audioRef.current.volume = volume / 100
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata)
      audioRef.current.addEventListener("ended", () => {
        console.log("[v0] Audio ended")
        setIsPlaying(false)
      })

      audioRef.current.addEventListener("loadstart", () => {
        console.log("[v0] Audio loading started")
        setAudioError(null)
      })

      audioRef.current.addEventListener("canplay", () => {
        console.log("[v0] Audio can play")
        setAudioError(null)
      })

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("error", handleError)
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
          audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata)
          audioRef.current.removeEventListener("ended", () => {
            console.log("[v0] Audio ended")
            setIsPlaying(false)
          })
        }
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
        if (wavPollIntervalRef.current) {
          clearInterval(wavPollIntervalRef.current)
        }
      }
    }
  }, [track])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (audioRef.current && isFinite(audioRef.current.currentTime)) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      console.log("[v0] Audio metadata loaded, duration:", audioRef.current.duration)
      if (audioRef.current.duration && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration)
      } else {
        console.log("[v0] Invalid duration, using fallback")
        setDuration(0)
      }
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || !isFinite(duration) || duration <= 0) {
      console.log("[v0] Cannot seek: invalid audio state")
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration

    if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return "0:00"
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const skipBackward = () => {
    if (!audioRef.current || !isFinite(audioRef.current.currentTime)) {
      console.log("[v0] Cannot skip backward: invalid audio state")
      return
    }
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
  }

  const skipForward = () => {
    if (!audioRef.current || !isFinite(audioRef.current.currentTime) || !isFinite(duration) || duration <= 0) {
      console.log("[v0] Cannot skip forward: invalid audio state")
      return
    }
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch((error) => {
          console.error("[v0] Error playing audio:", error)
          setAudioError(`Erro ao reproduzir: ${error.message}`)
          setIsPlaying(false)
        })
        setIsPlaying(true)
      }
    }
  }

  const toggleMasterMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const renderStemIcon = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" }
    switch (iconName) {
      case "mic":
        return <Mic {...iconProps} />
      case "disc":
        return <Disc3 {...iconProps} />
      case "guitar":
        return <Guitar {...iconProps} />
      case "piano":
        return <Piano {...iconProps} />
      default:
        return <Music2 {...iconProps} />
    }
  }

  // Removed old polling logic for stems
  // The context now handles all of this

  useEffect(() => {
    if (open && track?.id) {
      try {
        const existingStems = JSON.parse(localStorage.getItem("track-stems") || "{}")
        const savedStems: SavedStems | undefined = existingStems[track.id]

        if (savedStems && savedStems.stems && savedStems.stems.length > 0) {
          setStems(savedStems.stems)
          setHasSeparated(true)
          setSeparationType(savedStems.type)
          setStemSeparationTaskId(savedStems.taskId)
          console.log(`[v0] ${savedStems.stems.length} stems carregados do localStorage`)
        }
      } catch (e) {
        console.error("[v0] Erro ao carregar stems:", e)
      }
    }
  }, [open, track?.id])

  // Removed duplicate stem separation logic - now handled by context
  const handleSeparate = async (type: "2-stem" | "12-stem") => {
    if (!track) {
      setSeparationError("Informação da faixa não disponível.")
      console.log("[v0] Track is null")
      return
    }

    if (!track.taskId || !track.audioId) {
      setSeparationError("Informação da faixa em falta. Por favor, tente regenerar a faixa.")
      console.log("[v0] Missing track data:", { track, taskId: track.taskId, audioId: track.audioId })
      return
    }

    setIsSeparating(true)
    setSeparationType(type)
    setSeparationProgress(0)
    setStems([])
    setHasSeparated(false)

    // Simulate separation progress
    const interval = setInterval(() => {
      setSeparationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          // Simulate fetching stems after progress is almost complete
          setTimeout(() => {
            console.log(`[v0] Simulated stem separation for track: ${track.title}`)
            // In a real scenario, you would fetch the stems here using the task ID
            // For now, we'll set hasSeparated to true and clear progress
            setHasSeparated(true)
            setIsSeparating(false)
            setSeparationProgress(0) // Reset progress

            // Placeholder for actual stem fetching logic
            // setStems(fetchedStems)
            // localStorage.setItem("track-stems", JSON.stringify({ ...JSON.parse(localStorage.getItem("track-stems") || "{}"), [track.id]: { stems: fetchedStems, type, taskId: track.taskId } }))
          }, 1000)
          return 100 // Set to 100 before clearing
        }
        return Math.min(prev + Math.random() * 5, 95) // Increase progress
      })
    }, 200) // Update progress every 200ms

    try {
      await startStemSeparation(track.id, track.title, track.taskId, track.audioId, type)
      // Note: The actual fetching of stems and updating of state based on the API response
      // will be handled by the useStems context and its polling mechanism.
      // This modal's primary job here is to initiate the process and show progress/feedback.
    } catch (error) {
      console.error("[v0] Error starting stem separation:", error)
      setSeparationError(error instanceof Error ? error.message : "Erro desconhecido")
      setIsSeparating(false)
      setSeparationProgress(0)
    }
  }

  const toggleMute = (stemId: string) => {
    setStems(stems.map((stem) => (stem.id === stemId ? { ...stem, muted: !stem.muted } : stem)))
  }

  const updateVolume = (stemId: string, volume: number) => {
    setStems(stems.map((stem) => (stem.id === stemId ? { ...stem, volume } : stem)))
  }

  const downloadStem = (stem: StemDataType) => {
    if (stem.url && track) {
      const link = document.createElement("a")
      link.href = stem.url
      link.download = `${track.title}_${stem.name}.mp3`
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadAll = () => {
    stems.forEach((stem, index) => {
      if (stem.url) {
        setTimeout(() => downloadStem(stem), index * 500)
      }
    })
  }

  // Removed old polling logic for WAV conversion
  // The context now handles all of this

  const pollWavStatus = async (taskId: string) => {
    try {
      wavPollCountRef.current += 1
      console.log(`[v0] Polling WAV status (attempt ${wavPollCountRef.current})...`)

      const response = await fetch(`/api/suno/wav-status?taskId=${taskId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to check WAV status")
      }

      console.log("[v0] WAV status:", result.status)

      if (result.status === "SUCCESS" && result.audioWavUrl) {
        console.log("[v0] WAV conversion complete! URL:", result.audioWavUrl)
        setWavDownloadUrl(result.audioWavUrl)
        setIsConvertingWav(false)

        // Clear polling interval
        if (wavPollIntervalRef.current) {
          clearInterval(wavPollIntervalRef.current)
          wavPollIntervalRef.current = null
        }

        // Automatically download the WAV file
        const link = document.createElement("a")
        link.href = result.audioWavUrl
        link.download = `${track?.title || "track"}.wav`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        alert("Conversão WAV concluída! O download começou automaticamente.")
      } else if (result.status === "CREATE_TASK_FAILED" || result.status === "GENERATE_AUDIO_FAILED") {
        console.error("[v0] WAV conversion failed:", result.errorMessage)
        setIsConvertingWav(false)
        setSeparationError(`Falha na conversão WAV: ${result.errorMessage || "Erro desconhecido"}`)

        if (wavPollIntervalRef.current) {
          clearInterval(wavPollIntervalRef.current)
          wavPollIntervalRef.current = null
        }
      } else if (wavPollCountRef.current >= 60) {
        // Stop after 3 minutes (60 * 3 seconds)
        console.error("[v0] WAV conversion timeout")
        setIsConvertingWav(false)
        setSeparationError("Tempo limite de conversão WAV excedido. Por favor, tente novamente.")

        if (wavPollIntervalRef.current) {
          clearInterval(wavPollIntervalRef.current)
          wavPollIntervalRef.current = null
        }
      }
    } catch (error) {
      console.error("[v0] Error polling WAV status:", error)
      wavPollCountRef.current += 1

      if (wavPollCountRef.current >= 60) {
        setIsConvertingWav(false)
        setSeparationError(
          `Erro ao verificar status WAV: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        )

        if (wavPollIntervalRef.current) {
          clearInterval(wavPollIntervalRef.current)
          wavPollIntervalRef.current = null
        }
      }
    }
  }

  useEffect(() => {
    return () => {
      if (wavPollIntervalRef.current) {
        clearInterval(wavPollIntervalRef.current)
        wavPollIntervalRef.current = null
      }
    }
  }, [])

  const downloadTrack = async (format: "mp3" | "wav") => {
    if (!track) {
      setSeparationError("Informação da faixa não disponível")
      console.error("[v0] Track is null")
      return
    }

    if (format === "mp3") {
      if (!track.audioUrl) {
        setSeparationError("URL de áudio não disponível")
        return
      }
      const link = document.createElement("a")
      link.href = track.audioUrl
      link.download = `${track.title || "track"}.mp3`
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === "wav") {
      if (track.wavUrl) {
        console.log("[v0] WAV already available, downloading:", track.wavUrl)
        const link = document.createElement("a")
        link.href = track.wavUrl
        link.download = `${track.title || "track"}.wav`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      if (!track.taskId || !track.audioId) {
        setSeparationError("Não é possível converter para WAV: Informação da faixa em falta (taskId ou audioId).")
        console.error("[v0] Missing track data for WAV conversion:", {
          track,
          taskId: track.taskId,
          audioId: track.audioId,
        })
        return
      }

      setIsConvertingWav(true)
      setSeparationError(null)
      wavPollCountRef.current = 0

      try {
        console.log("[v0] Starting WAV conversion with:", { taskId: track.taskId, audioId: track.audioId })

        const response = await fetch("/api/suno/convert-wav", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: track.taskId,
            audioId: track.audioId,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Falha na conversão WAV")
        }

        const { taskId } = result
        setWavConversionTaskId(taskId)

        console.log(`[v0] WAV conversion started with taskId: ${taskId}`)

        pollWavStatus(taskId)
        wavPollIntervalRef.current = setInterval(() => {
          pollWavStatus(taskId)
        }, 3000)

        alert(
          "Conversão WAV iniciada. O download começará automaticamente quando estiver pronto (pode demorar 1-2 minutos).",
        )
      } catch (error) {
        console.error("[v0] WAV conversion error:", error)
        setIsConvertingWav(false)
        setSeparationError(
          `Falha ao converter para WAV: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        )
      }
    }
  }

  const downloadMidi = async () => {
    if (!stemSeparationTaskId) {
      setSeparationError(
        "Por favor, separe os stems primeiro antes de gerar MIDI. A geração de MIDI requer dados de separação de stems.",
      )
      return
    }

    setIsGeneratingMidi(true)
    try {
      const response = await fetch("/api/suno/generate-midi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: stemSeparationTaskId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Falha na geração de MIDI")
      }

      alert("Geração de MIDI iniciada. Receberá o ficheiro quando estiver pronto.")
    } catch (error) {
      alert(`Falha ao gerar MIDI: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsGeneratingMidi(false)
    }
  }

  const toggleStemPlay = (stem: StemDataType) => {
    let audioElement = stemAudioRefs.current.get(stem.id)

    if (!audioElement) {
      console.log(`[v0] Creating audio element for stem: ${stem.id}`)
      audioElement = new Audio()
      audioElement.preload = "metadata"

      audioElement.addEventListener("timeupdate", () => {
        setStemCurrentTimes((prev) => new Map(prev).set(stem.id, audioElement!.currentTime))
      })

      audioElement.addEventListener("loadedmetadata", () => {
        console.log(`[v0] Stem ${stem.id} metadata loaded, duration:`, audioElement!.duration)
        setStemDurations((prev) => new Map(prev).set(stem.id, audioElement!.duration))
      })

      audioElement.addEventListener("ended", () => {
        console.log(`[v0] Stem ${stem.id} playback ended`)
        setPlayingStems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stem.id)
          return newSet
        })
      })

      audioElement.addEventListener("error", (e) => {
        const target = e.target as HTMLAudioElement
        console.error(`[v0] Error loading stem audio ${stem.id}`)

        if (target.error) {
          console.error(`[v0] Media error code:`, target.error.code)
          console.error(`[v0] Media error message:`, target.error.message)

          let errorMessage = `Erro ao carregar ${stem.name}`
          if (target.error.code === target.error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
            errorMessage = `URL do stem ${stem.name} expirou. Por favor, regenere os stems.`
          } else if (target.error.code === target.error.MEDIA_ERR_NETWORK) {
            errorMessage = `Erro de rede ao carregar ${stem.name}`
          }

          setSeparationError(errorMessage)
        }

        setPlayingStems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stem.id)
          return newSet
        })
      })

      audioElement.volume = stem.muted ? 0 : stem.volume / 100
      stemAudioRefs.current.set(stem.id, audioElement)
    }

    if (!stem.url || stem.url.trim() === "") {
      console.error(`[v0] Invalid URL for stem ${stem.id}:`, stem.url)
      setSeparationError(`URL inválido para ${stem.name}. Por favor, regenere os stems.`)
      return
    }

    if (playingStems.has(stem.id)) {
      // Pause this stem
      audioElement.pause()
      setPlayingStems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(stem.id)
        return newSet
      })
    } else {
      if (audioElement.src !== stem.url) {
        console.log(`[v0] Setting stem audio source for ${stem.id}:`, stem.url)
        audioElement.src = stem.url
      }

      // Play this stem
      audioElement.play().catch((error) => {
        console.error(`[v0] Error playing stem ${stem.id}:`, error)

        if (stem.url.includes("tempfile.aiquickdraw.com")) {
          setSeparationError(
            `Os stems podem ter expirado. URLs temporários são válidos por tempo limitado. Por favor, regenere os stems.`,
          )
        } else {
          setSeparationError(`Erro ao reproduzir ${stem.name}: ${error.message}`)
        }
      })
      setPlayingStems((prev) => new Set(prev).add(stem.id))
    }
  }

  const handleStemProgressClick = (e: React.MouseEvent<HTMLDivElement>, stem: StemDataType) => {
    const audioElement = stemAudioRefs.current.get(stem.id)
    const duration = stemDurations.get(stem.id)

    if (!audioElement || !duration || !isFinite(duration) || duration <= 0) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration

    if (isFinite(newTime) && newTime >= 0 && newTime <= duration) {
      audioElement.currentTime = newTime
      setStemCurrentTimes((prev) => new Map(prev).set(stem.id, newTime))
    }
  }

  // Now audio elements are created on-demand when user clicks play
  useEffect(() => {
    stems.forEach((stem) => {
      const audio = stemAudioRefs.current.get(stem.id)
      if (audio) {
        audio.volume = stem.muted ? 0 : stem.volume / 100
      }
    })
  }, [stems])

  useEffect(() => {
    return () => {
      stemAudioRefs.current.forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
      stemAudioRefs.current.clear()
      setPlayingStems(new Set())
      setStemCurrentTimes(new Map())
      setStemDurations(new Map())
    }
  }, [])

  if (!track) {
    return null
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-light tracking-tight">
              {track.title || "Untitled"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {audioError && (
              <Card className="border-yellow-500/50 bg-yellow-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-light text-yellow-500">Aviso de Áudio</p>
                    <p className="text-xs text-yellow-500/80 font-light">{audioError}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-yellow-500 hover:bg-yellow-500/20"
                    onClick={() => setAudioError(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </Card>
            )}

            {/* Player Card */}
            <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-4 sm:p-6 shadow-2xl">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg ring-1 ring-border/50">
                    {track.imageUrl ? (
                      <img
                        src={track.imageUrl || "/placeholder.svg"}
                        alt={track.title || "Track"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Music2 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1 w-full sm:w-auto">
                    <h3 className="text-base sm:text-lg font-light tracking-tight">{track.title || "Untitled"}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {track.prompt || "No description"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-light">
                        {track.modelName || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div
                    className="group relative h-2 cursor-pointer overflow-hidden rounded-full bg-secondary/50 ring-1 ring-border/30 transition-all hover:h-3"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] shadow-lg shadow-primary/20 transition-all animate-gradient"
                      style={{
                        width: `${isFinite(currentTime) && isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-light text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full hover:bg-secondary/80"
                      onClick={skipBackward}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full hover:bg-secondary/80"
                      onClick={skipForward}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 rounded-full hover:bg-secondary/80"
                      onClick={toggleMasterMute}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-20 sm:w-24"
                    />
                    <span className="w-8 text-right text-xs font-light text-muted-foreground">{volume}</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full border-border/50 bg-secondary/30 hover:bg-secondary/60 font-light"
                      onClick={() => downloadTrack("mp3")}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">MP3</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full border-border/50 bg-secondary/30 hover:bg-secondary/60 disabled:opacity-50 font-light"
                      onClick={() => downloadTrack("wav")}
                      disabled={isConvertingWav}
                      title={isConvertingWav ? "A converter para WAV..." : "Converter e descarregar em formato WAV"}
                    >
                      {isConvertingWav ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="hidden sm:inline">A converter...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">WAV</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full border-border/50 bg-secondary/30 hover:bg-secondary/60 disabled:opacity-50 font-light"
                      onClick={downloadMidi}
                      disabled={isGeneratingMidi || !hasSeparated}
                      title={
                        !hasSeparated ? "Separe os stems primeiro para ativar a geração de MIDI" : "Gerar ficheiro MIDI"
                      }
                    >
                      {isGeneratingMidi ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">MIDI</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {separationError && (
              <Card className="border-red-500/50 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-light text-red-500">Erro na Separação de Stems</p>
                    <p className="text-xs text-red-500/80 font-light">{separationError}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-500/20"
                    onClick={() => setSeparationError(null)}
                  >
                    Fechar
                  </Button>
                </div>
              </Card>
            )}

            {/* Stem Separation Options */}
            {!hasSeparated && !isSeparating && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Card
                  className="group border-border/50 bg-gradient-to-br from-card to-card/80 p-6 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => handleSeparate("2-stem")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-light">Separação 2 Stems</h4>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        <Disc3 className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      Separar em vocais e instrumental. Ideal para karaoke e remixes simples.
                    </p>
                    <Button className="w-full gap-2 rounded-full bg-gradient-to-r from-primary to-accent font-light shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                      <Disc3 className="h-4 w-4" />
                      Separar (2 Stems)
                    </Button>
                  </div>
                </Card>

                <Card
                  className="group border-border/50 bg-gradient-to-br from-card to-card/80 p-6 hover:border-accent/50 transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => handleSeparate("12-stem")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-light">Separação 12 Stems</h4>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20 group-hover:ring-accent/40 transition-all">
                        <Sparkles className="h-5 w-5 text-accent" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      Separar em até 12 instrumentos individuais. Controlo total para produção profissional.
                    </p>
                    <Button className="w-full gap-2 rounded-full bg-gradient-to-r from-accent to-primary font-light shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all">
                      <Sparkles className="h-4 w-4" />
                      Separar (12 Stems)
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Separation Progress */}
            {isSeparating && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent animate-gradient bg-[length:200%_200%]" />
                <div className="relative space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="relative h-20 w-20">
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary shadow-lg shadow-primary/30" />
                      <div
                        className="absolute inset-2 animate-spin rounded-full border-4 border-accent/20 border-t-accent shadow-lg shadow-accent/20"
                        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                      />
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-light tracking-tight">A separar stems ({separationType})...</p>
                    <p className="text-sm text-muted-foreground font-light">
                      A processar áudio com IA. Isto pode demorar 1-2 minutos.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="relative h-3 overflow-hidden rounded-full bg-secondary/50 ring-1 ring-border/30">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] shadow-lg shadow-primary/30 transition-all duration-500 animate-gradient"
                        style={{ width: `${separationProgress}%` }}
                      />
                    </div>
                    <p className="text-sm font-light text-muted-foreground">{separationProgress}% concluído</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Separated Stems */}
            {hasSeparated && stems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-light tracking-tight">Stems Separados</h3>
                    <p className="text-sm text-muted-foreground font-light">
                      {stems.length} {stems.length === 1 ? "stem disponível" : "stems disponíveis"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-full border-border/50 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 font-light shadow-lg"
                    onClick={downloadAll}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descarregar Todos
                  </Button>
                </div>

                <div className="grid gap-3">
                  {stems.map((stem, index) => {
                    const currentTime = stemCurrentTimes.get(stem.id) || 0
                    const duration = stemDurations.get(stem.id) || 0
                    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

                    return (
                      <Card
                        key={stem.id}
                        className={`border ${stem.color} bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-lg overflow-hidden group ${
                          playingStems.has(stem.id) ? "ring-2 ring-primary/50 shadow-xl shadow-primary/20" : ""
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <div className="relative p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-card to-secondary/50 ring-1 ring-border/30 shadow-lg group-hover:scale-110 transition-transform ${
                                playingStems.has(stem.id) ? "ring-2 ring-primary/50 scale-110" : ""
                              }`}
                            >
                              {renderStemIcon(stem.icon)}
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-light tracking-tight">{stem.name}</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant={playingStems.has(stem.id) ? "default" : "ghost"}
                                    className={`h-9 w-9 rounded-full transition-all ${
                                      playingStems.has(stem.id)
                                        ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                                        : "hover:bg-secondary/60"
                                    }`}
                                    onClick={() => toggleStemPlay(stem)}
                                    title={playingStems.has(stem.id) ? "Pausar" : "Reproduzir"}
                                  >
                                    {playingStems.has(stem.id) ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full hover:bg-secondary/60 transition-all"
                                    onClick={() => toggleMute(stem.id)}
                                  >
                                    {stem.muted ? (
                                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Volume2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 rounded-full border-border/50 bg-secondary/30 hover:bg-secondary/60 font-light shadow-sm hover:shadow-md transition-all"
                                    onClick={() => downloadStem(stem)}
                                  >
                                    <Download className="h-3 w-3" />
                                    <span className="hidden sm:inline">Descarregar</span>
                                  </Button>
                                </div>
                              </div>

                              {playingStems.has(stem.id) && (
                                <div className="space-y-1">
                                  <div
                                    className="group relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-secondary/50 ring-1 ring-border/30 transition-all hover:h-2"
                                    onClick={(e) => handleStemProgressClick(e, stem)}
                                  >
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] shadow-sm shadow-primary/20 transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-xs font-light text-muted-foreground">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                <Slider
                                  value={[stem.muted ? 0 : stem.volume]}
                                  onValueChange={(value) => updateVolume(stem.id, value[0])}
                                  max={100}
                                  step={1}
                                  disabled={stem.muted}
                                  className="flex-1"
                                />
                                <span className="w-12 text-right text-sm font-light text-muted-foreground tabular-nums">
                                  {stem.muted ? 0 : stem.volume}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
