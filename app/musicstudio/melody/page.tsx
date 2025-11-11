"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ButtonColorful } from "@/components/ui/button-colorful"
import { supabaseClient } from "@/lib/supabase"
import {
  Settings,
  X,
  Music,
  Upload,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Pause,
  Check,
  Play,
  Volume2,
  Trash,
} from "lucide-react"
import { useGeneration } from "@/contexts/generation-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AVAILABLE_STYLES = [
  "ambient",
  "jazz",
  "classical",
  "electronic",
  "pop",
  "rock",
  "hip-hop",
  "folk",
  "dubstep",
  "melodic",
  "90s",
  "indie",
  "acoustic",
  "upbeat",
  "calm",
]

export default function MelodyPage() {
  const router = useRouter()
  const { addTask } = useGeneration()

  // UI State
  const [showRecorder, setShowRecorder] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [inputMode, setInputMode] = useState<"record" | "upload">("record")

  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>(Array(24).fill(0))
  const [recordingSuccess, setRecordingSuccess] = useState(false)

  // Upload State
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Generation State
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("")
  const [title, setTitle] = useState("")
  const [instrumental, setInstrumental] = useState(true)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [negativeTags, setNegativeTags] = useState("")
  const [weirdness, setWeirdness] = useState([50])
  const [styleInfluence, setStyleInfluence] = useState([50])
  const [audioInfluence, setAudioInfluence] = useState([50])
  const [isGenerating, setIsGenerating] = useState(false)

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [selectedModel, setSelectedModel] = useState("V4_5PLUS")
  const [vocalGender, setVocalGender] = useState<string>("none")

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 480) {
            // 8 minutes max
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      console.log("[v0] Setting audio source:", audioUrl)
      audioRef.current.src = audioUrl

      const handleLoadedMetadata = () => {
        console.log("[v0] Audio metadata loaded, duration:", audioRef.current?.duration)
        setAudioDuration(audioRef.current?.duration || 0)
      }

      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
        }
      }

      const handleEnded = () => {
        console.log("[v0] Audio playback ended")
        setIsPlaying(false)
        setAudioProgress(0)
      }

      const handleError = (e: Event) => {
        console.error("[v0] Audio error:", e)
      }

      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata)
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
      audioRef.current.addEventListener("ended", handleEnded)
      audioRef.current.addEventListener("error", handleError)

      // Force load the audio
      audioRef.current.load()
      console.log("[v0] Audio load() called")

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata)
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
          audioRef.current.removeEventListener("ended", handleEnded)
          audioRef.current.removeEventListener("error", handleError)
        }
      }
    }
  }, [audioUrl])

  const animateWaveform = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Sample 24 points for better spacing and elegance
    const samples = 24
    const step = Math.floor(dataArray.length / samples)
    const newWaveform = Array.from({ length: samples }, (_, i) => {
      const value = dataArray[i * step] || 0
      // Smoother scaling with minimum 8% and maximum 85% to prevent cutoffs
      return Math.max(8, Math.min(85, (value / 255) * 100))
    })

    setWaveformData(newWaveform)
    animationRef.current = requestAnimationFrame(animateWaveform)
  }

  const startRecording = async () => {
    try {
      console.log("[v0] Starting recording...")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup audio analyser for waveform
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
        console.log("[v0] Recording stopped, blob created")
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      animateWaveform()
      console.log("[v0] Recording started")
    } catch (error) {
      console.error("[v0] Recording error:", error)
      alert("Erro ao aceder ao microfone. Por favor, permita o acesso.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("[v0] Stopping recording...")
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      setRecordingSuccess(true)
      setTimeout(() => {
        setShowRecorder(false)
        setShowConfig(true)
        setRecordingSuccess(false)
      }, 800)
    }
  }

  const resetRecording = () => {
    console.log("[v0] Resetting recording...")
    setRecordingTime(0)
    setAudioBlob(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    audioChunksRef.current = []
    setWaveformData(Array(24).fill(0))
  }

  const deleteRecording = () => {
    console.log("[v0] Deleting recording...")
    resetRecording()
    setShowRecorder(false)
    setShowConfig(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("[v0] File selected:", file.name)

    if (!file.type.startsWith("audio/")) {
      alert("Por favor, selecione um ficheiro de áudio válido")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("O ficheiro deve ter menos de 10MB")
      return
    }

    setAudioBlob(file)
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    setShowConfig(true)
    console.log("[v0] File loaded successfully")
  }

  const uploadAudioToBlob = async (): Promise<string> => {
    if (!audioBlob) throw new Error("No audio to upload")

    console.log("[v0] Uploading audio to Vercel Blob...")
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", audioBlob, "recording.webm")

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    try {
      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      console.log("[v0] Upload successful:", data.url)
      return data.url
    } catch (error) {
      clearInterval(progressInterval)
      console.error("[v0] Upload error:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const togglePlayPause = async () => {
    console.log("[v0] togglePlayPause called, isPlaying:", isPlaying)
    console.log("[v0] audioRef.current:", audioRef.current)
    console.log("[v0] audioUrl:", audioUrl)

    if (!audioRef.current) {
      console.log("[v0] No audio element found")
      return
    }

    if (audioRef.current.readyState < 2) {
      console.log("[v0] Audio not ready, readyState:", audioRef.current.readyState)
      alert("Áudio ainda não está pronto. Por favor, aguarde um momento.")
      return
    }

    try {
      if (isPlaying) {
        console.log("[v0] Pausing audio")
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        console.log("[v0] Playing audio, readyState:", audioRef.current.readyState)
        console.log("[v0] Audio src:", audioRef.current.src)
        console.log("[v0] Audio duration:", audioRef.current.duration)
        await audioRef.current.play()
        setIsPlaying(true)
        console.log("[v0] Audio playing successfully")
      }
    } catch (error) {
      console.error("[v0] Audio playback error:", error)
      if (error instanceof Error) {
        console.error("[v0] Error name:", error.name)
        console.error("[v0] Error message:", error.message)
        // Show user-friendly error
        if (error.name !== "AbortError") {
          alert(`Erro ao reproduzir áudio: ${error.message}`)
        }
      }
    }
  }

  const handleDeleteAndRerecord = () => {
    console.log("[v0] Deleting recording and returning to main screen...")
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setIsPlaying(false)
    setAudioProgress(0)
    resetRecording()
    setShowConfig(false)
    setShowRecorder(false)
  }

  const handleGenerate = async () => {
    if (!audioBlob) {
      alert("Por favor, grave ou carregue um áudio primeiro")
      return
    }

    if (!style.trim()) {
      alert("Por favor, adicione pelo menos um estilo")
      return
    }

    setIsGenerating(true)

    try {
      // 🔥 OBTER USER ID
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        throw new Error("Você precisa estar autenticado para gerar música")
      }

      // Upload audio first
      const audioUrl = await uploadAudioToBlob()

      // Generate music
      console.log("[v0] Generating music with audio URL:", audioUrl)
      const response = await fetch("/api/suno/upload-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, // 🔥 ENVIAR USER ID
          uploadUrl: audioUrl, // Changed from audioUrl to uploadUrl per API docs
          prompt: prompt || "Criar música baseada no áudio fornecido",
          customMode: true,
          instrumental,
          model: selectedModel, // Using selected model from dropdown
          style,
          title: title || "Melodia Gerada",
          negativeTags: negativeTags || undefined,
          vocalGender: vocalGender === "none" ? undefined : vocalGender, // Using selected vocal gender
          styleWeight: styleInfluence[0] / 100,
          weirdnessConstraint: weirdness[0] / 100,
          audioWeight: audioInfluence[0] / 100,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Geração falhou")
      }

      addTask({
        taskId: data.taskId,
        status: "PENDING",
        progress: 10,
        statusMessage: "Inicializando geração...",
        tracks: [],
        prompt: prompt.substring(0, 100) || "Melodia",
        model: selectedModel,
        startTime: Date.now(),
      })

      router.push("/library")
    } catch (error) {
      console.error("[v0] Generation error:", error)
      alert(error instanceof Error ? error.message : "Erro ao gerar música")
      setIsGenerating(false)
    }
  }

  const toggleStyle = (styleTag: string) => {
    if (selectedStyles.includes(styleTag)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== styleTag))
      setStyle(
        style
          .split(", ")
          .filter((s) => s !== styleTag)
          .join(", "),
      )
    } else {
      setSelectedStyles([...selectedStyles, styleTag])
      setStyle(style ? `${style}, ${styleTag}` : styleTag)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <div className="fixed inset-0 z-0">
        <img
          src="/images/cosmic-background.jpg"
          alt=""
          className="w-full h-full object-cover scale-110"
          style={{ filter: "blur(80px)" }}
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
      </div>

      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* Mobile Main Screen */}
      <div className="lg:hidden relative z-10 flex h-[100dvh] flex-col">
        <div className="flex items-center justify-between px-6 py-4 pt-safe shrink-0">
          <button
            onClick={() => setShowSettings(true)}
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-300 shadow-2xl shadow-black/20 hover:bg-slate-900/60 hover:border-white/20"
          >
            <Settings
              className="h-4 w-4 text-slate-300 group-hover:text-white transition-colors duration-300"
              strokeWidth={1.5}
            />
          </button>
          <button
            onClick={() => router.push("/")}
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-300 shadow-2xl shadow-black/20 hover:bg-slate-900/60 hover:border-white/20"
          >
            <X
              className="h-4 w-4 text-slate-300 group-hover:text-white transition-colors duration-300"
              strokeWidth={1.5}
            />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
          <Card className="w-full max-w-[360px] bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-3xl border border-white/10 p-[2px] rounded-[36px] shadow-2xl shadow-black/40 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 rounded-[36px] animate-pulse"
              style={{ animationDuration: "3s" }}
            />
            <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl rounded-[35px] p-7">
              <div className="aspect-square w-full max-w-[260px] mx-auto bg-slate-800/20 rounded-[32px] flex items-center justify-center mb-6 overflow-hidden relative border border-white/10 shadow-2xl shadow-black/30">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dreamina-2025-11-04-2343-homem%20a%20gravar%20uma%20mensagem%20de%20audio%20no%20...-vbUzBtujrVIUBzEVVjKDxgOoOnXUVY.jpeg"
                  alt="Studio Recording"
                  className="relative w-full h-full object-cover rounded-[32px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent rounded-[32px]" />
              </div>

              <h2 className="text-xl font-light text-center bg-gradient-to-r from-white via-slate-50 to-white bg-clip-text text-transparent mb-3 tracking-tight leading-tight">
                Cantarole uma melodia
              </h2>

              <div className="flex items-center justify-center gap-2 text-slate-300 text-xs font-light">
                <span>Toque para gravar</span>
                <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        </div>

        <div className="px-6 pb-6 pb-safe space-y-3 shrink-0">
          <div className="flex items-center justify-center gap-10">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center gap-2 active:scale-95 transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-black/20 group-hover:border-primary/40 group-active:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/15 group-hover:to-accent/15 transition-all duration-500" />
                <Upload
                  className="relative h-[18px] w-[18px] text-slate-300 group-hover:text-white transition-colors duration-300"
                  strokeWidth={1.5}
                />
              </div>
            </button>

            {/* Record button - main CTA with ultra-premium design */}
            <button
              onClick={() => {
                setShowRecorder(true)
                startRecording()
              }}
              className="group relative h-20 w-20 rounded-[28px] active:scale-95 transition-all duration-500"
              style={{ transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              <div
                className="absolute -inset-3 rounded-[31px] bg-gradient-to-br from-primary/40 to-accent/40 blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-500 animate-pulse"
                style={{ animationDuration: "2s" }}
              />
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary via-primary/90 to-accent shadow-2xl shadow-primary/40" />
              <div className="absolute inset-[3px] rounded-[25px] bg-slate-900/20 backdrop-blur-sm" />
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-white/10 to-transparent" />
            </button>

            {/* Library button */}
            <button className="group flex flex-col items-center gap-2 active:scale-95 transition-all duration-300">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-black/20 group-hover:border-accent/40 group-active:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-primary/0 group-hover:from-accent/15 group-hover:to-primary/15 transition-all duration-500" />
                <Music
                  className="relative h-[18px] w-[18px] text-slate-300 group-hover:text-white transition-colors duration-300"
                  strokeWidth={1.5}
                />
              </div>
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-mono tracking-wider uppercase font-light">
            Limite de 8 min para uploads de áudio
          </p>
        </div>

        <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Recording Modal */}
      {showRecorder && (
        <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-500 flex flex-col h-[100dvh] overflow-hidden">
          <div className="fixed inset-0 z-0">
            <img
              src="/images/cosmic-background.jpg"
              alt=""
              className="w-full h-full object-cover scale-110"
              style={{ filter: "blur(80px)" }}
            />
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          </div>

          <div className="relative z-10 flex items-center justify-between px-6 py-4 pt-safe shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-200 shadow-xl shadow-black/20 hover:bg-slate-900/80"
            >
              <Settings
                className="h-4 w-4 text-slate-300 hover:text-white transition-colors duration-200"
                strokeWidth={1.5}
              />
            </button>
            <button
              onClick={deleteRecording}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-200 shadow-xl shadow-black/20 hover:bg-slate-900/80"
            >
              <X className="h-4 w-4 text-slate-300 hover:text-white transition-colors duration-200" strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center px-6 overflow-hidden">
            <Card className="w-full max-w-sm bg-slate-900/50 backdrop-blur-3xl border border-white/10 p-7 rounded-[36px] shadow-2xl shadow-black/30">
              {recordingSuccess && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl rounded-[36px] z-10 animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-in zoom-in duration-300 shadow-2xl shadow-primary/40">
                      <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
                    </div>
                    <p className="text-slate-100 font-light text-sm">Gravação concluída</p>
                  </div>
                </div>
              )}

              <div className="relative h-56 flex items-center justify-center px-3">
                {isRecording && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-red-500/20 backdrop-blur-xl rounded-full border border-red-500/30 animate-in fade-in duration-300 shadow-lg shadow-red-500/20">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                    <span className="text-xs text-red-300 font-light">Gravando</span>
                  </div>
                )}

                <div className="flex items-end justify-center gap-1 h-full py-10 w-full">
                  {waveformData.map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 max-w-[3px] rounded-full bg-gradient-to-t from-primary/90 via-primary to-accent shadow-lg shadow-primary/30"
                      style={{
                        height: `${height}%`,
                        opacity: 0.5 + (height / 100) * 0.5,
                        transition: "all 120ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center text-2xl font-light text-slate-50 mt-4 tracking-wider tabular-nums">
                {formatTime(recordingTime)}
              </div>
            </Card>
          </div>

          <div className="relative z-10 px-6 pb-8 pb-safe shrink-0">
            <div className="flex items-center justify-center gap-10">
              <button
                onClick={resetRecording}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-200 shadow-xl shadow-black/20 hover:bg-slate-900/80 hover:border-white/20"
              >
                <RotateCcw
                  className="h-4 w-4 text-slate-300 hover:text-white transition-colors duration-200"
                  strokeWidth={1.5}
                />
              </button>

              <button
                onClick={stopRecording}
                className="relative h-14 w-14 rounded-xl bg-slate-900/60 backdrop-blur-2xl border-2 border-white/20 flex items-center justify-center active:scale-95 transition-all duration-200 shadow-2xl shadow-black/30 hover:bg-slate-900/80"
              >
                <div className="h-5 w-5 rounded bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/40" />
              </button>

              <button
                onClick={deleteRecording}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-200 shadow-xl shadow-black/20 hover:bg-slate-900/80 hover:border-red-500/30"
              >
                <Trash2
                  className="h-4 w-4 text-slate-300 hover:text-red-400 transition-colors duration-200"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfig && (
        <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-500 flex flex-col h-[100dvh] overflow-hidden">
          <div className="fixed inset-0 z-0">
            <img
              src="/images/cosmic-background.jpg"
              alt=""
              className="w-full h-full object-cover scale-110"
              style={{ filter: "blur(80px)" }}
            />
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          </div>

          <div className="relative z-10 flex items-center justify-between px-6 py-4 pt-safe shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-200 shadow-xl shadow-black/20 hover:bg-slate-900/80"
            >
              <Settings className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
            </button>
            <h2 className="text-base font-light text-slate-50 tracking-tight">Áudio</h2>
            <button
              onClick={() => {
                setShowConfig(false)
                resetRecording()
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 active:scale-95 transition-all duration-200 shadow-xl shadow-black/20 hover:bg-slate-900/80"
            >
              <X className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto smooth-scroll">
            <div className="px-5 py-4 pb-[calc(24px+env(safe-area-inset-bottom))] space-y-4">
              {isUploading && (
                <Card className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 p-5 rounded-[32px] shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                        <Upload className="h-3.5 w-3.5 text-primary animate-pulse" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs text-slate-300 font-light">Carregando áudio</span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums font-light">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                  {uploadProgress === 100 && (
                    <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-primary animate-in fade-in duration-300">
                      <Check className="h-3 w-3" strokeWidth={1.5} />
                      <span>Upload concluído</span>
                    </div>
                  )}
                </Card>
              )}

              {audioUrl && !isUploading && (
                <Card className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 p-5 rounded-[32px] shadow-2xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <button
                      onClick={togglePlayPause}
                      className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/25 to-accent/25 flex items-center justify-center shrink-0 active:scale-95 transition-all duration-200 hover:from-primary/35 hover:to-accent/35"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 text-slate-200" strokeWidth={1.5} />
                      ) : (
                        <Play className="h-4 w-4 text-slate-200 ml-0.5" strokeWidth={1.5} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 font-light mb-1">Áudio gravado</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-800/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 font-light tabular-nums">
                          {formatTime(recordingTime)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteAndRerecord}
                      className="h-9 w-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 active:scale-95 transition-all duration-200 hover:bg-red-500/15"
                    >
                      <Trash className="h-3.5 w-3.5 text-red-400" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Volume2 className="h-3 w-3" strokeWidth={1.5} />
                    <span className="font-light">Toque para ouvir a gravação</span>
                  </div>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-2xl border border-white/10 p-[2px] rounded-2xl shadow-xl shadow-black/15 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl" />
                <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl p-3.5 space-y-2.5">
                  <Label className="text-xs text-slate-200 font-light">Modelo</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-slate-800/25 backdrop-blur-sm border border-slate-700/25 text-slate-200 rounded-lg h-9 text-xs font-light hover:border-primary/25 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/98 backdrop-blur-xl border-slate-700/40">
                      <SelectItem value="V4_5PLUS">V4.5 Plus (Recomendado)</SelectItem>
                      <SelectItem value="V4">V4</SelectItem>
                      <SelectItem value="V3_5">V3.5</SelectItem>
                      <SelectItem value="V3">V3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-2xl border border-white/10 p-[2px] rounded-2xl shadow-xl shadow-black/15 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 rounded-2xl" />
                <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-slate-200 font-light">Letra da música</Label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-light">Instrumental</span>
                      <Switch checked={instrumental} onCheckedChange={setInstrumental} />
                    </div>
                  </div>

                  <Textarea
                    placeholder="Adicione suas próprias letras ou digite um assunto para gerar"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-20 bg-slate-800/15 backdrop-blur-sm border border-slate-700/25 text-slate-200 text-xs rounded-lg resize-none font-light placeholder:text-slate-500 focus:border-primary/25 focus:bg-slate-800/25 transition-all"
                    disabled={instrumental}
                  />

                  <button
                    className="w-full bg-gradient-to-r from-slate-800/35 to-slate-700/35 backdrop-blur-sm border border-slate-700/25 text-slate-200 rounded-lg h-9 text-xs font-light hover:from-slate-800/50 hover:to-slate-700/50 hover:border-primary/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                    disabled={instrumental}
                  >
                    Gerar Letras
                  </button>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-2xl border border-white/10 p-[2px] rounded-2xl shadow-xl shadow-black/15 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 rounded-2xl" />
                <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl p-3.5 space-y-2.5">
                  <Label className="text-xs text-slate-200 font-light flex items-center gap-1.5">
                    <Music className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Estilos
                  </Label>

                  <Textarea
                    placeholder="Insira seus próprios estilos"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="min-h-16 bg-slate-800/15 backdrop-blur-sm border border-slate-700/25 text-slate-200 text-xs rounded-lg resize-none font-light placeholder:text-slate-500 focus:border-accent/25 focus:bg-slate-800/25 transition-all"
                  />

                  <div className="flex flex-wrap gap-1.5">
                    <button className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-800/35 to-slate-700/35 backdrop-blur-sm border border-slate-700/25 flex items-center justify-center active:scale-95 transition-all duration-200 hover:border-accent/25">
                      <RotateCcw className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                    </button>
                    {AVAILABLE_STYLES.map((styleTag) => (
                      <Badge
                        key={styleTag}
                        variant={selectedStyles.includes(styleTag) ? "default" : "outline"}
                        className={cn(
                          "px-2.5 py-1 rounded-full cursor-pointer active:scale-95 transition-all duration-200 text-[11px] font-light",
                          selectedStyles.includes(styleTag)
                            ? "bg-gradient-to-r from-primary to-accent text-white border-0 shadow-md shadow-primary/15"
                            : "bg-slate-800/25 backdrop-blur-sm border-slate-700/25 text-slate-300 hover:bg-slate-800/40 hover:border-primary/15",
                        )}
                        onClick={() => toggleStyle(styleTag)}
                      >
                        {styleTag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/15 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="relative w-full flex items-center justify-between p-3.5 active:bg-slate-800/25 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-200 font-light">Opções avançadas</span>
                    <Badge className="bg-gradient-to-r from-primary/15 to-accent/15 text-primary border-0 text-[9px] font-light px-1.5 py-0.5">
                      NOVO
                    </Badge>
                  </div>
                  {showAdvanced ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
                  )}
                </button>

                {showAdvanced && (
                  <div className="relative px-3.5 pb-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-400 font-light flex items-center gap-1">
                        <Music className="h-3 w-3" strokeWidth={1.5} />
                        Género Vocal
                      </Label>
                      <Select value={vocalGender} onValueChange={setVocalGender}>
                        <SelectTrigger className="bg-slate-800/15 backdrop-blur-sm border border-slate-700/25 text-slate-200 rounded-lg h-9 font-light text-xs hover:border-primary/25 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900/98 backdrop-blur-xl border-slate-700/40">
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="m">Masculino</SelectItem>
                          <SelectItem value="f">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-400 font-light flex items-center gap-1">
                        <Music className="h-3 w-3" strokeWidth={1.5} />
                        Insira estilos a serem excluídos...
                      </Label>
                      <Input
                        placeholder="Metal Pesado, Baterias Animadas"
                        value={negativeTags}
                        onChange={(e) => setNegativeTags(e.target.value)}
                        className="bg-slate-800/15 backdrop-blur-sm border border-slate-700/25 text-slate-200 text-xs rounded-lg h-9 font-light placeholder:text-slate-500 focus:border-primary/25 focus:bg-slate-800/25 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-slate-400 font-light flex items-center gap-1">
                          <Info className="h-3 w-3" strokeWidth={1.5} />
                          Estranheza
                        </Label>
                        <span className="text-[11px] text-slate-400 tabular-nums">{weirdness[0]}%</span>
                      </div>
                      <Slider value={weirdness} onValueChange={setWeirdness} min={0} max={100} step={1} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-slate-400 font-light flex items-center gap-1">
                          <Info className="h-3 w-3" strokeWidth={1.5} />
                          Influência de Estilo
                        </Label>
                        <span className="text-[11px] text-slate-400 tabular-nums">{styleInfluence[0]}%</span>
                      </div>
                      <Slider value={styleInfluence} onValueChange={setStyleInfluence} min={0} max={100} step={1} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-slate-400 font-light flex items-center gap-1">
                          <Info className="h-3 w-3" strokeWidth={1.5} />
                          Influência de Áudio
                        </Label>
                        <span className="text-[11px] text-slate-400 tabular-nums">{audioInfluence[0]}%</span>
                      </div>
                      <Slider value={audioInfluence} onValueChange={setAudioInfluence} min={0} max={100} step={1} />
                    </div>
                  </div>
                )}
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-2xl border border-white/10 p-[2px] rounded-2xl shadow-xl shadow-black/15 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl" />
                <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl p-3.5 space-y-2">
                  <Label className="text-xs text-slate-200 font-light">Título (Opcional)</Label>
                  <Input
                    placeholder="Adicionar um título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-800/15 backdrop-blur-sm border border-slate-700/25 text-slate-200 text-xs rounded-lg h-9 font-light placeholder:text-slate-500 focus:border-primary/25 focus:bg-slate-800/25 transition-all"
                  />
                </div>
              </Card>

              <ButtonColorful
                label={isGenerating ? "A Gerar..." : "Criar"}
                icon={Music}
                onClick={handleGenerate}
                disabled={isGenerating || !audioBlob || !style.trim()}
                className="w-full h-14 rounded-2xl text-sm font-light disabled:opacity-50 shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden lg:flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-12 rounded-3xl">
          <h1 className="text-4xl font-light text-slate-200 mb-8 text-center">Melodia</h1>
          <p className="text-slate-400 text-center mb-8">
            Esta funcionalidade está otimizada para dispositivos móveis. Por favor, aceda através de um smartphone ou
            tablet.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/")} variant="outline" className="rounded-xl">
              Voltar ao Início
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
