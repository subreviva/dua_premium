"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Download,
  Volume2,
  Music2,
  ArrowLeft,
  Loader2,
  RotateCcw,
  GripVertical,
  FileDown,
  Repeat,
  Bookmark,
  Sparkles,
  MoreVertical,
  Keyboard,
  Plus,
  Play,
  Pause,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { StemData, SavedStems } from "@/lib/types/stems"
import { WaveformTimeline } from "@/components/waveform-timeline"
import { useStems } from "@/contexts/stems-context"
import { useUndoRedo } from "@/hooks/use-undo-redo"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import KeyboardShortcutsOverlay from "@/components/keyboard-shortcuts-overlay"
// Import AI components
import { AIMusicGenerator } from "@/components/ai-music-generator"
import { AddTrackModal } from "@/components/add-track-modal"

// Import track effects modal and master effects modal
import { TrackEffectsModal } from "@/components/track-effects-modal"
import { MasterEffectsModal } from "@/components/master-effects-modal"
import { AdvancedEffectsModal } from "@/components/advanced-effects-modal" // Import AdvancedEffectsModal
import { ProfessionalTransportControls } from "@/components/professional-transport-controls"
import { SoundLibraryModal } from "@/components/sound-library-modal" // Import SoundLibraryModal
import { SessionInfoPanel } from "@/components/session-info-panel"
import { ZoomControls } from "@/components/zoom-controls"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // Import Dialog components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TimelineRuler } from "@/components/timeline-ruler" // Import TimelineRuler
import { AudioRegionEditor } from "@/components/audio-region-editor"

interface Region {
  id: string
  start: number // start time in seconds
  end: number // end time in seconds
  label?: string // optional label like "Verse 1", "Chorus", etc.
}

interface ExtendedStemData extends StemData {
  pan: number
  solo: boolean
  regions?: Region[]
  effects: {
    reverb: number // 0-100
    delay: {
      time: number // 0-1000ms
      feedback: number // 0-100
      mix: number // 0-100
    }
    eq: {
      low: number // -12 to +12 dB
      mid: number // -12 to +12 dB
      high: number // -12 to +12 dB
    }
  }
  effectsBypassed: {
    reverb: boolean
    delay: boolean
    eq: boolean
  }
}

const STEM_COLORS = [
  "rgb(59, 130, 246)", // Blue
  "rgb(34, 197, 94)", // Green
  "rgb(249, 115, 22)", // Orange
  "rgb(168, 85, 247)", // Purple
  "rgb(236, 72, 153)", // Pink
  "rgb(14, 165, 233)", // Sky
]

function SortableTrackItem({
  stem,
  index,
  toggleMute,
  toggleSolo,
  updateVolume,
  updatePan,
  resetStem,
  analyserNode,
  getPanLabel,
  updateEffects, // Added updateEffects prop
  toggleEffectBypass, // Added toggleEffectBypass prop
  onOpenEffects, // Added onOpenEffects prop
  onOpenRegionEditor, // Added onOpenRegionEditor prop
}: {
  stem: ExtendedStemData
  index: number
  toggleMute: (id: string) => void
  toggleSolo: (id: string) => void
  updateVolume: (id: string, value: number) => void
  updatePan: (id: string, value: number) => void
  resetStem: (id: string) => void
  analyserNode: AnalyserNode | null
  getPanLabel: (pan: number) => string
  updateEffects: (id: string, effects: ExtendedStemData["effects"]) => void // Added updateEffects type
  toggleEffectBypass: (id: string, effect: "reverb" | "delay" | "eq") => void // Added toggleEffectBypass type
  onOpenEffects: () => void // Added onOpenEffects type
  onOpenRegionEditor: (id: string) => void // Added onOpenRegionEditor type
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stem.id })

  const [vuLevel, setVuLevel] = useState(0)

  useEffect(() => {
    if (!analyserNode) return

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount)
    let animationId: number

    const updateLevel = () => {
      analyserNode.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      const level = (average / 255) * 100
      setVuLevel(level)
      animationId = requestAnimationFrame(updateLevel)
    }

    updateLevel()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [analyserNode])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`h-24 px-3 border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-all duration-200 flex items-center ${
        stem.solo ? "bg-zinc-900/50 ring-2 ring-blue-500/50 ring-inset" : ""
      } ${stem.muted ? "opacity-40" : ""} ${isDragging ? "opacity-50 scale-105 z-50" : ""}`}
    >
      <div className="flex items-center gap-2 w-full">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Track color indicator */}
        <div
          className="w-1 h-12 rounded-full flex-shrink-0 transition-all duration-200"
          style={{ backgroundColor: stem.color as string }}
        />

        {/* Track info and controls */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Track name */}
          <span className="text-xs text-white font-light truncate">{stem.name}</span>

          {/* Mute/Solo/FX/Edit buttons */}
          <div className="flex gap-1">
            <Button
              variant={stem.muted ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleMute(stem.id)}
              className="h-5 w-8 text-[10px] transition-all duration-200 hover:scale-105 active:scale-95"
            >
              M
            </Button>
            <Button
              variant={stem.solo ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleSolo(stem.id)}
              className="h-5 w-8 text-[10px] transition-all duration-200 hover:scale-105 active:scale-95"
            >
              S
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenEffects}
              className="h-5 w-8 text-[10px] text-zinc-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
            >
              FX
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenRegionEditor(stem.id)}
              className="h-5 w-8 text-[10px] text-zinc-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
              title="Edit Regions"
            >
              <Music2 className="h-3 w-3" /> {/* Using Music2 icon for edit */}
            </Button>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2">
            <Slider
              value={[stem.muted ? 0 : stem.volume]}
              onValueChange={(value) => updateVolume(stem.id, value[0])}
              max={100}
              disabled={stem.muted}
              className="flex-1"
            />
            <span className="text-[9px] text-zinc-500 tabular-nums w-8 text-right">{stem.muted ? 0 : stem.volume}</span>
          </div>
        </div>

        {/* Mini VU meter */}
        <div className="w-1 h-12 bg-zinc-900 rounded-full overflow-hidden flex-shrink-0">
          <div
            className="w-full transition-all duration-75"
            style={{
              height: `${vuLevel}%`,
              background: vuLevel > 80 ? "#ef4444" : vuLevel > 60 ? "#eab308" : "#22c55e",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function StemsPage({ params }: { params: { id: string } }) {
  // const params = useParams() // Removed, using prop instead
  const router = useRouter()
  const { tasks } = useStems()

  const { state: stems, setState: setStems, undo, redo, canUndo, canRedo } = useUndoRedo<ExtendedStemData[]>([])

  const [trackTitle, setTrackTitle] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [masterVolume, setMasterVolume] = useState(100)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const [masterEQ, setMasterEQ] = useState({
    low: 0,
    mid: 0,
    high: 0,
  })
  const [masterCompressor, setMasterCompressor] = useState({
    threshold: -20,
    ratio: 4,
    attack: 10,
    release: 100,
  })
  const [masterEQEnabled, setMasterEQEnabled] = useState(false)
  const [masterCompressorEnabled, setMasterCompressorEnabled] = useState(false)

  const masterEQNodesRef = useRef<{ low: BiquadFilterNode; mid: BiquadFilterNode; high: BiquadFilterNode } | null>(null)
  const masterCompressorNodeRef = useRef<DynamicsCompressorNode | null>(null)

  const [effectsModalOpen, setEffectsModalOpen] = useState(false)
  const [effectsModalStemId, setEffectsModalStemId] = useState<string | null>(null)
  const [masterEffectsModalOpen, setMasterEffectsModalOpen] = useState(false)
  const [advancedEffectsModalOpen, setAdvancedEffectsModalOpen] = useState(false) // Add state for advanced effects modal
  const [advancedEffectsModalStemId, setAdvancedEffectsModalStemId] = useState<string | null>(null) // Add state for advanced effects modal stem ID

  const [regionEditorOpen, setRegionEditorOpen] = useState(false)
  const [regionEditorStemId, setRegionEditorStemId] = useState<string | null>(null)

  const [stemTimes, setStemTimes] = useState<Map<string, number>>(new Map())
  const [stemDurations, setStemDurations] = useState<Map<string, number>>(new Map())
  const [stemPlayingStates, setStemPlayingStates] = useState<Map<string, boolean>>(new Map()) // Renamed for clarity
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const audioContextRef = useRef<AudioContext | null>(null)
  const pannerNodesRef = useRef<Map<string, StereoPannerNode>>(new Map())
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map())
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map())
  const masterGainRef = useRef<GainNode | null>(null)
  const animationFrameRef = useRef<number>()
  const audioInitialized = useRef(false)

  const eqNodesRef = useRef<Map<string, { low: BiquadFilterNode; mid: BiquadFilterNode; high: BiquadFilterNode }>>(
    new Map(),
  )
  const delayNodesRef = useRef<Map<string, { delay: DelayNode; feedback: GainNode; wet: GainNode; dry: GainNode }>>(
    new Map(),
  )
  const reverbNodesRef = useRef<Map<string, { convolver: ConvolverNode; wet: GainNode; dry: GainNode }>>(new Map())

  const trackId = params.id as string
  const processingTask = tasks.find((task) => task.trackId === trackId && task.status === "processing")
  const isProcessing = !!processingTask

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setStems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const exportMix = async () => {
    if (stems.length === 0) return

    setExporting(true)
    setExportProgress(0)

    try {
      const maxDuration = Math.max(...Array.from(stemDurations.values()))
      const sampleRate = 44100
      const offlineContext = new OfflineAudioContext(2, maxDuration * sampleRate, sampleRate)

      const masterGain = offlineContext.createGain()
      masterGain.gain.value = masterVolume / 100
      masterGain.connect(offlineContext.destination)

      const anySolo = stems.some((s) => s.solo)

      // Load and connect all stems
      const audioBuffers = await Promise.all(
        stems.map(async (stem) => {
          const response = await fetch(stem.url)
          const arrayBuffer = await response.arrayBuffer()
          return offlineContext.decodeAudioData(arrayBuffer)
        }),
      )

      audioBuffers.forEach((buffer, index) => {
        const stem = stems[index]
        const shouldBeMuted = stem.muted || (anySolo && !stem.solo)

        if (!shouldBeMuted) {
          const source = offlineContext.createBufferSource()
          source.buffer = buffer

          const panner = offlineContext.createStereoPanner()
          panner.pan.value = stem.pan / 100

          const gainNode = offlineContext.createGain()
          gainNode.gain.value = stem.volume / 100

          source.connect(panner)
          panner.connect(gainNode)
          gainNode.connect(masterGain)

          source.start(0)
        }
      })

      setExportProgress(50)

      const renderedBuffer = await offlineContext.startRendering()

      setExportProgress(75)

      // Convert to WAV
      const wav = audioBufferToWav(renderedBuffer)
      const blob = new Blob([wav], { type: "audio/wav" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${trackTitle}_mixed.wav`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportProgress(100)
      setTimeout(() => {
        setExporting(false)
        setExportProgress(0)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error exporting mix:", error)
      setExporting(false)
      setExportProgress(0)
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    const channels: Float32Array[] = []
    let offset = 0
    let pos = 0

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    // RIFF identifier
    setUint32(0x46464952)
    // file length
    setUint32(length - 8)
    // RIFF type
    setUint32(0x45564157)
    // format chunk identifier
    setUint32(0x20746d66)
    // format chunk length
    setUint32(16)
    // sample format (raw)
    setUint16(1)
    // channel count
    setUint16(buffer.numberOfChannels)
    // sample rate
    setUint32(buffer.sampleRate)
    // byte rate (sample rate * block align)
    setUint32(buffer.sampleRate * buffer.numberOfChannels * 2)
    // block align (channel count * bytes per sample)
    setUint16(buffer.numberOfChannels * 2)
    // bits per sample
    setUint16(16)
    // data chunk identifier
    setUint32(0x61746164)
    // data chunk length
    setUint32(length - pos - 4)

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return arrayBuffer
  }

  const [loopEnabled, setLoopEnabled] = useState(false)
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(0)

  const [limiterEnabled, setLimiterEnabled] = useState(true)
  const [limiterThreshold, setLimiterThreshold] = useState(-1) // dB
  const limiterNodeRef = useRef<DynamicsCompressorNode | null>(null)

  // State for markers and keyboard shortcuts overlay
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showMarkers, setShowMarkers] = useState(false)
  const [soundLibraryOpen, setSoundLibraryOpen] = useState(false)
  const [addTrackModalOpen, setAddTrackModalOpen] = useState(false)

  // AI panel state
  const [duaPanelOpen, setDuaPanelOpen] = useState(false)

  const [bpm, setBpm] = useState(120)
  const [zoom, setZoom] = useState(1) // Added zoom state
  const [maxDuration, setMaxDuration] = useState(0) // Initialize maxDuration state

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3)) // Max 300%
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5)) // Min 50%
  }

  const handleZoomFit = () => {
    setZoom(1) // Reset to 100%
  }

  // This will be the current playback time for all stems
  const [currentTime, setCurrentTime] = useState(0)
  // This will track which stems are currently playing
  const [playingStems, setPlayingStems] = useState<Set<string>>(new Set())

  // New handler for seeking a specific stem
  const handleSeek = (stemId: string, time: number) => {
    if (!isFinite(time) || time < 0) return

    // Only seek the specific stem
    seekStem(stemId, time)
  }

  // New handler for downloading a single stem
  const handleDownload = (url: string, name: string) => {
    if (url) {
      const link = document.createElement("a")
      link.href = url
      link.download = `${trackTitle}_${name}.mp3` // Assuming mp3 for download
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Added handleRecordingComplete function (now used for both recording and upload)
  const handleRecordingComplete = (audioUrl: string, duration: number) => {
    const newStem: ExtendedStemData = {
      id: `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Gravação ${stems.length + 1}`,
      url: audioUrl,
      icon: "mic",
      color: STEM_COLORS[stems.length % STEM_COLORS.length],
      volume: 100,
      muted: false,
      pan: 0,
      solo: false,
      // Initializing regions as empty array
      regions: [],
      effects: {
        reverb: 0,
        delay: {
          time: 250,
          feedback: 30,
          mix: 0,
        },
        eq: {
          low: 0,
          mid: 0,
          high: 0,
        },
      },
      effectsBypassed: {
        reverb: false,
        delay: false,
        eq: false,
      },
    }

    setStems((prev) => [...prev, newStem])

    // Initialize audio element and Web Audio nodes for the new recording
    if (audioContextRef.current && masterGainRef.current) {
      const audioContext = audioContextRef.current
      const masterGain = masterGainRef.current

      const audio = new Audio(audioUrl)
      audio.crossOrigin = "anonymous"

      const source = audioContext.createMediaElementSource(audio)

      // Create effect nodes (same as in the main useEffect)
      const eqLow = audioContext.createBiquadFilter()
      eqLow.type = "lowshelf"
      eqLow.frequency.value = 200
      eqLow.gain.value = 0

      const eqMid = audioContext.createBiquadFilter()
      eqMid.type = "peaking"
      eqMid.frequency.value = 1000
      eqMid.Q.value = 1
      eqMid.gain.value = 0

      const eqHigh = audioContext.createBiquadFilter()
      eqHigh.type = "highshelf"
      eqHigh.frequency.value = 3000
      eqHigh.gain.value = 0

      const delay = audioContext.createDelay(5)
      delay.delayTime.value = 0.25

      const delayFeedback = audioContext.createGain()
      delayFeedback.gain.value = 0.3

      const delayWet = audioContext.createGain()
      delayWet.gain.value = 0

      const delayDry = audioContext.createGain()
      delayDry.gain.value = 1

      const impulseResponse = createImpulseResponse(audioContext, 2, 2)
      const convolver = audioContext.createConvolver()
      convolver.buffer = impulseResponse

      const reverbWet = audioContext.createGain()
      reverbWet.gain.value = 0

      const reverbDry = audioContext.createGain()
      reverbDry.gain.value = 1

      const analyser = audioContext.createAnalyser()
      const panner = audioContext.createStereoPanner()
      const gainNode = audioContext.createGain()

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      source.connect(eqLow)
      eqLow.connect(eqMid)
      eqMid.connect(eqHigh)

      eqHigh.connect(delayDry)
      eqHigh.connect(delay)
      delay.connect(delayFeedback)
      delayFeedback.connect(delay)
      delay.connect(delayWet)

      const delayMerge = audioContext.createGain()
      delayDry.connect(delayMerge)
      delayWet.connect(delayMerge)

      delayMerge.connect(reverbDry)
      delayMerge.connect(convolver)
      convolver.connect(reverbWet)

      const reverbMerge = audioContext.createGain()
      reverbDry.connect(reverbMerge)
      reverbWet.connect(reverbMerge)

      reverbMerge.connect(analyser)
      analyser.connect(panner)
      panner.connect(gainNode)
      gainNode.connect(masterGain)

      eqNodesRef.current.set(newStem.id, { low: eqLow, mid: eqMid, high: eqHigh })
      delayNodesRef.current.set(newStem.id, { delay, feedback: delayFeedback, wet: delayWet, dry: delayDry })
      reverbNodesRef.current.set(newStem.id, { convolver, wet: reverbWet, dry: reverbDry })
      pannerNodesRef.current.set(newStem.id, panner)
      gainNodesRef.current.set(newStem.id, gainNode)
      analyserNodesRef.current.set(newStem.id, analyser)

      audio.volume = 1
      gainNode.gain.value = 1

      audio.addEventListener("loadedmetadata", () => {
        setStemDurations((prev) => new Map(prev).set(newStem.id, duration))
        setMaxDuration((prevMax) => Math.max(prevMax, duration))
      })

      audio.addEventListener("pause", () => {
        setStemPlayingStates((prev) => new Map(prev).set(newStem.id, false))
        setPlayingStems((prev) => {
          const next = new Set(prev)
          next.delete(newStem.id)
          return next
        })
      })

      audio.addEventListener("play", () => {
        setStemPlayingStates((prev) => new Map(prev).set(newStem.id, true))
        setPlayingStems((prev) => new Set(prev).add(newStem.id))
      })

      audioRefs.current.set(newStem.id, audio)
    }
    // Close the recording panel after processing
    setAddTrackModalOpen(false) // This closes the modal, assuming handleRecordingComplete is called from within AddTrackModal
  }

  const handleSeparateStems = (generatedStems: Array<{ url: string; name: string; type: string }>) => {
    generatedStems.forEach((genStem) => {
      const newStem: ExtendedStemData = {
        id: `ai-stem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: genStem.name,
        url: genStem.url,
        icon: genStem.type === "vocal" ? "mic" : "music",
        color: STEM_COLORS[stems.length % STEM_COLORS.length],
        volume: 100,
        muted: false,
        pan: 0,
        solo: false,
        // Initializing regions as empty array
        regions: [],
        effects: {
          reverb: 0,
          delay: {
            time: 250,
            feedback: 30,
            mix: 0,
          },
          eq: {
            low: 0,
            mid: 0,
            high: 0,
          },
        },
        effectsBypassed: {
          reverb: false,
          delay: false,
          eq: false,
        },
      }

      setStems((prev) => [...prev, newStem])

      // Initialize audio element and Web Audio nodes
      if (audioContextRef.current && masterGainRef.current) {
        const audioContext = audioContextRef.current
        const masterGain = masterGainRef.current

        const audio = new Audio(genStem.url)
        audio.crossOrigin = "anonymous"

        const source = audioContext.createMediaElementSource(audio)

        const eqLow = audioContext.createBiquadFilter()
        eqLow.type = "lowshelf"
        eqLow.frequency.value = 200
        eqLow.gain.value = 0

        const eqMid = audioContext.createBiquadFilter()
        eqMid.type = "peaking"
        eqMid.frequency.value = 1000
        eqMid.Q.value = 1
        eqMid.gain.value = 0

        const eqHigh = audioContext.createBiquadFilter()
        eqHigh.type = "highshelf"
        eqHigh.frequency.value = 3000
        eqHigh.gain.value = 0

        const delay = audioContext.createDelay(5)
        delay.delayTime.value = 0.25

        const delayFeedback = audioContext.createGain()
        delayFeedback.gain.value = 0.3

        const delayWet = audioContext.createGain()
        delayWet.gain.value = 0

        const delayDry = audioContext.createGain()
        delayDry.gain.value = 1

        const impulseResponse = createImpulseResponse(audioContext, 2, 2)
        const convolver = audioContext.createConvolver()
        convolver.buffer = impulseResponse

        const reverbWet = audioContext.createGain()
        reverbWet.gain.value = 0

        const reverbDry = audioContext.createGain()
        reverbDry.gain.value = 1

        const analyser = audioContext.createAnalyser()
        const panner = audioContext.createStereoPanner()
        const gainNode = audioContext.createGain()

        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.8

        source.connect(eqLow)
        eqLow.connect(eqMid)
        eqMid.connect(eqHigh)

        eqHigh.connect(delayDry)
        eqHigh.connect(delay)
        delay.connect(delayFeedback)
        delayFeedback.connect(delay)
        delay.connect(delayWet)

        const delayMerge = audioContext.createGain()
        delayDry.connect(delayMerge)
        delayWet.connect(delayMerge)

        delayMerge.connect(reverbDry)
        delayMerge.connect(convolver)
        convolver.connect(reverbWet)

        const reverbMerge = audioContext.createGain()
        reverbDry.connect(reverbMerge)
        reverbWet.connect(reverbMerge)

        reverbMerge.connect(analyser)
        analyser.connect(panner)
        panner.connect(gainNode)
        gainNode.connect(masterGain)

        eqNodesRef.current.set(newStem.id, { low: eqLow, mid: eqMid, high: eqHigh })
        delayNodesRef.current.set(newStem.id, { delay, feedback: delayFeedback, wet: delayWet, dry: delayDry })
        reverbNodesRef.current.set(newStem.id, { convolver, wet: reverbWet, dry: reverbDry })
        pannerNodesRef.current.set(newStem.id, panner)
        gainNodesRef.current.set(newStem.id, gainNode)
        analyserNodesRef.current.set(newStem.id, analyser)

        audio.volume = 1
        gainNode.gain.value = 1

        audio.addEventListener("loadedmetadata", () => {
          const duration = audio.duration || 0
          setStemDurations((prev) => new Map(prev).set(newStem.id, duration))
          setMaxDuration((prevMax) => Math.max(prevMax, duration))
        })

        audio.addEventListener("pause", () => {
          setStemPlayingStates((prev) => new Map(prev).set(newStem.id, false))
          setPlayingStems((prev) => {
            const next = new Set(prev)
            next.delete(newStem.id)
            return next
          })
        })

        audio.addEventListener("play", () => {
          setStemPlayingStates((prev) => new Map(prev).set(newStem.id, true))
          setPlayingStems((prev) => new Set(prev).add(newStem.id))
        })

        audioRefs.current.set(newStem.id, audio)
      }
    })

    setDuaPanelOpen(false)
  }

  const toggleStemPlayPause = (stemId: string) => {
    const audio = audioRefs.current.get(stemId) // Corrected to use .get()
    if (!audio) return

    if (audio.paused) {
      audio.play().catch(console.error)
      setPlayingStems((prev) => new Set(prev).add(stemId))
    } else {
      audio.pause()
      setPlayingStems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(stemId)
        return newSet
      })
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault()
        togglePlayAll()
      }
      if (e.key === "?" && e.target === document.body) {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && e.target === document.body) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey)) && e.target === document.body) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [undo, redo]) // Removed stems from dependencies as it's not directly used in the handler

  useEffect(() => {
    try {
      // Allow free access - studio can open empty for new projects
      if (trackId === 'demo' || trackId === 'new') {
        console.log("[v0] Opening studio in free mode - no stems required")
        setTrackTitle("Projeto Novo")
        setStems([])
        setLoading(false)
        return
      }

      const existingStems = JSON.parse(localStorage.getItem("track-stems") || "{}")
      const savedStems: SavedStems | undefined = existingStems[trackId]

      if (savedStems && savedStems.stems && savedStems.stems.length > 0) {
        const extendedStems: ExtendedStemData[] = savedStems.stems.map((stem, index) => ({
          ...stem,
          pan: 0,
          solo: false,
          // Initializing regions as empty array
          regions: [],
          color: STEM_COLORS[index % STEM_COLORS.length],
          effects: {
            reverb: 0,
            delay: {
              time: 250,
              feedback: 30,
              mix: 0,
            },
            eq: {
              low: 0,
              mid: 0,
              high: 0,
            },
          },
          effectsBypassed: {
            reverb: false,
            delay: false,
            eq: false,
          },
        }))
        setStems(extendedStems)
      } else {
        console.log("[v0] No stems found for this track - opening in free mode")
      }

      const tracks = JSON.parse(localStorage.getItem("tracks") || "[]")
      const track = tracks.find((t: any) => t.id === trackId)
      if (track) {
        setTrackTitle(track.title || "Unknown Track")
      } else if (trackId !== 'demo' && trackId !== 'new') {
        setTrackTitle("Projeto Sem Título")
      }
    } catch (error) {
      console.error("[v0] Error loading stems:", error)
    } finally {
      setLoading(false)
    }
  }, [trackId, setStems])

  const createImpulseResponse = (audioContext: AudioContext, duration: number, decay: number) => {
    const sampleRate = audioContext.sampleRate
    const length = sampleRate * duration
    const impulse = audioContext.createBuffer(2, length, sampleRate)
    const leftChannel = impulse.getChannelData(0)
    const rightChannel = impulse.getChannelData(1)

    for (let i = 0; i < length; i++) {
      const n = length - i
      leftChannel[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay)
      rightChannel[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay)
    }

    return impulse
  }

  useEffect(() => {
    if (stems.length === 0 || audioInitialized.current) return

    console.log("[v0] Initializing audio elements with Web Audio API for", stems.length, "stems")

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioContextRef.current = audioContext

    const masterGain = audioContext.createGain()

    const masterEQLow = audioContext.createBiquadFilter()
    masterEQLow.type = "lowshelf"
    masterEQLow.frequency.value = 200
    masterEQLow.gain.value = 0

    const masterEQMid = audioContext.createBiquadFilter()
    masterEQMid.type = "peaking"
    masterEQMid.frequency.value = 1000
    masterEQMid.Q.value = 1
    masterEQMid.gain.value = 0

    const masterEQHigh = audioContext.createBiquadFilter()
    masterEQHigh.type = "highshelf"
    masterEQHigh.frequency.value = 3000
    masterEQHigh.gain.value = 0

    masterEQNodesRef.current = { low: masterEQLow, mid: masterEQMid, high: masterEQHigh }

    const masterComp = audioContext.createDynamicsCompressor()
    masterComp.threshold.value = masterCompressor.threshold
    masterComp.knee.value = 0
    masterComp.ratio.value = masterCompressor.ratio
    masterComp.attack.value = masterCompressor.attack / 1000
    masterComp.release.value = masterCompressor.release / 1000

    masterCompressorNodeRef.current = masterComp

    const limiter = audioContext.createDynamicsCompressor()
    limiter.threshold.value = limiterThreshold
    limiter.knee.value = 0
    limiter.ratio.value = 20
    limiter.attack.value = 0.003
    limiter.release.value = 0.25

    masterGain.connect(masterEQLow)
    masterEQLow.connect(masterEQMid)
    masterEQMid.connect(masterEQHigh)
    masterEQHigh.connect(masterComp)
    masterComp.connect(limiter)
    limiter.connect(audioContext.destination)

    masterGainRef.current = masterGain
    limiterNodeRef.current = limiter

    const impulseResponse = createImpulseResponse(audioContext, 2, 2)

    stems.forEach((stem) => {
      const audio = new Audio(stem.url)
      audio.crossOrigin = "anonymous"

      const source = audioContext.createMediaElementSource(audio)

      const eqLow = audioContext.createBiquadFilter()
      eqLow.type = "lowshelf"
      eqLow.frequency.value = 200
      eqLow.gain.value = 0

      const eqMid = audioContext.createBiquadFilter()
      eqMid.type = "peaking"
      eqMid.frequency.value = 1000
      eqMid.Q.value = 1
      eqMid.gain.value = 0

      const eqHigh = audioContext.createBiquadFilter()
      eqHigh.type = "highshelf"
      eqHigh.frequency.value = 3000
      eqHigh.gain.value = 0

      const delay = audioContext.createDelay(5)
      delay.delayTime.value = stem.effects.delay.time / 1000

      const delayFeedback = audioContext.createGain()
      delayFeedback.gain.value = stem.effects.delay.feedback / 100

      const delayWet = audioContext.createGain()
      delayWet.gain.value = stem.effects.delay.mix / 100

      const delayDry = audioContext.createGain()
      delayDry.gain.value = 1 - stem.effects.delay.mix / 100

      const convolver = audioContext.createConvolver()
      convolver.buffer = impulseResponse

      const reverbWet = audioContext.createGain()
      reverbWet.gain.value = stem.effects.reverb / 100

      const reverbDry = audioContext.createGain()
      reverbDry.gain.value = 1 - stem.effects.reverb / 100

      const analyser = audioContext.createAnalyser()
      const panner = audioContext.createStereoPanner()
      const gainNode = audioContext.createGain()

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      // EQ chain
      source.connect(eqLow)
      eqLow.connect(eqMid)
      eqMid.connect(eqHigh)

      // Delay chain (parallel wet/dry)
      eqHigh.connect(delayDry)
      eqHigh.connect(delay)
      delay.connect(delayFeedback)
      delayFeedback.connect(delay) // feedback loop
      delay.connect(delayWet)

      // Merge delay wet/dry
      const delayMerge = audioContext.createGain()
      delayDry.connect(delayMerge)
      delayWet.connect(delayMerge)

      // Reverb chain (parallel wet/dry)
      delayMerge.connect(reverbDry)
      delayMerge.connect(convolver)
      convolver.connect(reverbWet)

      // Merge reverb wet/dry
      const reverbMerge = audioContext.createGain()
      reverbDry.connect(reverbMerge)
      reverbWet.connect(reverbMerge)

      // Final chain
      reverbMerge.connect(analyser)
      analyser.connect(panner)
      panner.connect(gainNode)
      gainNode.connect(masterGain)

      eqNodesRef.current.set(stem.id, { low: eqLow, mid: eqMid, high: eqHigh })
      delayNodesRef.current.set(stem.id, { delay, feedback: delayFeedback, wet: delayWet, dry: delayDry })
      reverbNodesRef.current.set(stem.id, { convolver, wet: reverbWet, dry: reverbDry })
      pannerNodesRef.current.set(stem.id, panner)
      gainNodesRef.current.set(stem.id, gainNode)
      analyserNodesRef.current.set(stem.id, analyser)

      audio.volume = 1
      gainNode.gain.value = stem.muted ? 0 : stem.volume / 100

      audio.addEventListener("loadedmetadata", () => {
        console.log(`[v0] Loaded metadata for ${stem.id}, duration:`, audio.duration)
        const duration = audio.duration || 0
        setStemDurations((prev) => new Map(prev).set(stem.id, duration))
        // Update maxDuration whenever a stem's duration is loaded
        setMaxDuration((prevMax) => Math.max(prevMax, duration))
      })

      audio.addEventListener("pause", () => {
        setStemPlayingStates((prev) => new Map(prev).set(stem.id, false))
        setPlayingStems((prev) => {
          const next = new Set(prev)
          next.delete(stem.id)
          return next
        })
      })

      audio.addEventListener("play", () => {
        setStemPlayingStates((prev) => new Map(prev).set(stem.id, true))
        setPlayingStems((prev) => new Set(prev).add(stem.id))
      })

      audioRefs.current.set(stem.id, audio)
    })

    audioInitialized.current = true

    return () => {
      console.log("[v0] Cleaning up audio elements")
      audioRefs.current.forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
      audioRefs.current.clear()
      pannerNodesRef.current.clear()
      gainNodesRef.current.clear()
      analyserNodesRef.current.clear()
      eqNodesRef.current.clear() // Clear EQ nodes
      delayNodesRef.current.clear() // Clear delay nodes
      reverbNodesRef.current.clear() // Clear reverb nodes
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      audioInitialized.current = false
    }
  }, [stems.length]) // Depend on stems.length to re-run when stems are added or removed

  useEffect(() => {
    if (masterEQNodesRef.current) {
      if (masterEQEnabled) {
        masterEQNodesRef.current.low.gain.value = masterEQ.low
        masterEQNodesRef.current.mid.gain.value = masterEQ.mid
        masterEQNodesRef.current.high.gain.value = masterEQ.high
      } else {
        masterEQNodesRef.current.low.gain.value = 0
        masterEQNodesRef.current.mid.gain.value = 0
        masterEQNodesRef.current.high.gain.value = 0
      }
    }
  }, [masterEQ, masterEQEnabled])

  useEffect(() => {
    if (masterCompressorNodeRef.current) {
      if (masterCompressorEnabled) {
        masterCompressorNodeRef.current.threshold.value = masterCompressor.threshold
        masterCompressorNodeRef.current.ratio.value = masterCompressor.ratio
        masterCompressorNodeRef.current.attack.value = masterCompressor.attack / 1000
        masterCompressorNodeRef.current.release.value = masterCompressor.release / 1000
      } else {
        masterCompressorNodeRef.current.threshold.value = 0
        masterCompressorNodeRef.current.ratio.value = 1
      }
    }
  }, [masterCompressor, masterCompressorEnabled])

  useEffect(() => {
    if (limiterNodeRef.current) {
      limiterNodeRef.current.threshold.value = limiterEnabled ? limiterThreshold : 0
    }
  }, [limiterEnabled, limiterThreshold])

  useEffect(() => {
    if (!loopEnabled) return

    const checkLoop = () => {
      audioRefs.current.forEach((audio) => {
        if (!audio.paused && audio.currentTime >= loopEnd) {
          audio.currentTime = loopStart
        }
      })
      animationFrameRef.current = requestAnimationFrame(checkLoop)
    }

    animationFrameRef.current = requestAnimationFrame(checkLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [loopEnabled, loopStart, loopEnd])

  // This useEffect uses `maxDuration`, so it must be placed after `maxDuration` is defined.
  useEffect(() => {
    if (maxDuration > 0 && loopEnd === 0) {
      setLoopEnd(maxDuration)
    }
  }, [maxDuration, loopEnd])

  useEffect(() => {
    const updateTime = () => {
      audioRefs.current.forEach((audio, stemId) => {
        if (!audio.paused) {
          const time = audio.currentTime
          setStemTimes((prev) => new Map(prev).set(stemId, time))
        }
        // Keep the time even when paused - don't delete it
      })

      animationFrameRef.current = requestAnimationFrame(updateTime)
    }

    animationFrameRef.current = requestAnimationFrame(updateTime)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [stems])

  useEffect(() => {
    const anySolo = stems.some((s) => s.solo)

    stems.forEach((stem) => {
      const gainNode = gainNodesRef.current.get(stem.id)
      const pannerNode = pannerNodesRef.current.get(stem.id)
      const eqNodes = eqNodesRef.current.get(stem.id)
      const delayNodes = delayNodesRef.current.get(stem.id)
      const reverbNodes = reverbNodesRef.current.get(stem.id)

      if (gainNode) {
        const shouldBeMuted = stem.muted || (anySolo && !stem.solo)
        const newVolume = shouldBeMuted ? 0 : stem.volume / 100
        gainNode.gain.value = newVolume
      }

      if (pannerNode) {
        pannerNode.pan.value = stem.pan / 100
      }

      if (eqNodes) {
        if (stem.effectsBypassed.eq) {
          eqNodes.low.gain.value = 0
          eqNodes.mid.gain.value = 0
          eqNodes.high.gain.value = 0
        } else {
          eqNodes.low.gain.value = stem.effects.eq.low
          eqNodes.mid.gain.value = stem.effects.eq.mid
          eqNodes.high.gain.value = stem.effects.eq.high
        }
      }

      if (delayNodes) {
        if (stem.effectsBypassed.delay) {
          delayNodes.wet.gain.value = 0
          delayNodes.dry.gain.value = 1
        } else {
          delayNodes.delay.delayTime.value = stem.effects.delay.time / 1000
          delayNodes.feedback.gain.value = stem.effects.delay.feedback / 100
          delayNodes.wet.gain.value = stem.effects.delay.mix / 100
          delayNodes.dry.gain.value = 1 - stem.effects.delay.mix / 100
        }
      }

      if (reverbNodes) {
        if (stem.effectsBypassed.reverb) {
          reverbNodes.wet.gain.value = 0
          reverbNodes.dry.gain.value = 1
        } else {
          reverbNodes.wet.gain.value = stem.effects.reverb / 100
          reverbNodes.dry.gain.value = 1 - stem.effects.reverb / 100
        }
      }
    })
  }, [stems]) // Added dependency on stems to ensure it re-runs when stems change

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume / 100
    }
  }, [masterVolume])

  const seekStem = (stemId: string, time: number) => {
    const audio = audioRefs.current.get(stemId)
    if (!audio) return

    // Ensure seeking is within valid bounds if loop is enabled
    const currentStem = stems.find((s) => s.id === stemId)
    if (currentStem && loopEnabled) {
      if (time < loopStart) time = loopStart
      if (time > loopEnd) time = loopEnd
    }

    audio.currentTime = time
    setStemTimes((prev) => new Map(prev).set(stemId, time))
  }

  const seekAll = (time: number) => {
    audioRefs.current.forEach((audio) => {
      audio.currentTime = time
    })
  }

  const toggleMute = (stemId: string) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          return { ...stem, muted: !stem.muted }
        }
        return stem
      }),
    )
  }

  const toggleSolo = (stemId: string) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          return { ...stem, solo: !stem.solo }
        }
        return stem
      }),
    )
  }

  const updateVolume = (stemId: string, value: number) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          return { ...stem, volume: value }
        }
        return stem
      }),
    )
  }

  const updatePan = (stemId: string, value: number) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          return { ...stem, pan: value }
        }
        return stem
      }),
    )
  }

  const updateEffects = (stemId: string, effects: ExtendedStemData["effects"]) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          return { ...stem, effects }
        }
        return stem
      }),
    )
  }

  const toggleEffectBypass = (stemId: string, effect: "reverb" | "delay" | "eq") => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          return {
            ...stem,
            effectsBypassed: {
              ...stem.effectsBypassed,
              [effect]: !stem.effectsBypassed[effect],
            },
          }
        }
        return stem
      }),
    )
  }

  const resetStem = (stemId: string) => {
    setStems((prev) =>
      prev.map((stem) => {
        if (stem.id === stemId) {
          return {
            ...stem,
            volume: 100,
            pan: 0,
            muted: false,
            solo: false,
            // Resetting regions to empty array
            regions: [],
            effects: {
              reverb: 0,
              delay: {
                time: 250,
                feedback: 30,
                mix: 0,
              },
              eq: {
                low: 0,
                mid: 0,
                high: 0,
              },
            },
            effectsBypassed: {
              reverb: false,
              delay: false,
              eq: false,
            },
          }
        }
        return stem
      }),
    )
  }

  const resetAll = () => {
    setStems((prev) =>
      prev.map((stem) => ({
        ...stem,
        volume: 100,
        pan: 0,
        muted: false,
        solo: false,
        // Resetting regions to empty array
        regions: [],
        effects: {
          reverb: 0,
          delay: {
            time: 250,
            feedback: 30,
            mix: 0,
          },
          eq: {
            low: 0,
            mid: 0,
            high: 0,
          },
        },
        effectsBypassed: {
          reverb: false,
          delay: false,
          eq: false,
        },
      })),
    )
    setMasterVolume(100)
  }

  const togglePlayAll = () => {
    const anyPlaying = playingStems.size > 0

    if (anyPlaying) {
      audioRefs.current.forEach((audio) => audio.pause())
      setPlayingStems(new Set()) // Clear the set of playing stems
    } else {
      audioRefs.current.forEach((audio) => {
        if (audio.paused) {
          audio.play().catch(console.error)
          setPlayingStems((prev) => new Set(prev).add(audio.id || "")) // Add to playing set
        }
      })
    }
  }

  const downloadStem = (stem: StemData) => {
    if (stem.url) {
      const link = document.createElement("a")
      link.href = stem.url
      link.download = `${trackTitle}_${stem.name}.mp3`
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadAll = (format: "mp3" | "wav" | "midi") => {
    stems.forEach((stem, index) => {
      setTimeout(() => downloadStem(stem), index * 500)
    })
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPanLabel = (pan: number) => {
    if (pan === 0) return "C"
    if (pan < 0) return `L${Math.abs(pan)}`
    return `R${pan}`
  }

  const updateStemRegions = (stemId: string, regions: Region[]) => {
    setStems(
      stems.map((s) =>
        s.id === stemId
          ? {
              ...s,
              regions: regions.length > 0 ? regions : undefined,
            }
          : s,
      ),
    )
  }

  useEffect(() => {
    stems.forEach((stem) => {
      const duration = stemDurations.get(stem.id)
      if (duration && !stem.regions) {
        // Initialize with a single region covering the entire audio
        updateStemRegions(stem.id, [
          {
            id: `${stem.id}-region-default`,
            start: 0,
            end: duration,
          },
        ])
      }
    })
  }, [stemDurations])

  const handleAddSound = (sound: {
    id: string
    name: string
    category: string
    url: string
    duration: number
    icon: string
  }) => {
    const newStem: ExtendedStemData = {
      id: `sound-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sound.name,
      url: sound.url,
      icon: sound.icon,
      color: STEM_COLORS[stems.length % STEM_COLORS.length],
      volume: 100,
      muted: false,
      pan: 0,
      solo: false,
      // Initializing regions as empty array
      regions: [],
      effects: {
        reverb: 0,
        delay: {
          time: 250,
          feedback: 30,
          mix: 0,
        },
        eq: {
          low: 0,
          mid: 0,
          high: 0,
        },
      },
      effectsBypassed: {
        reverb: false,
        delay: false,
        eq: false,
      },
    }

    setStems((prev) => [...prev, newStem])

    // Initialize audio element and Web Audio nodes for the new sound
    if (audioContextRef.current && masterGainRef.current) {
      const audioContext = audioContextRef.current
      const masterGain = masterGainRef.current

      const audio = new Audio(sound.url)
      audio.crossOrigin = "anonymous"

      const source = audioContext.createMediaElementSource(audio)

      // Create effect nodes (same as in the main useEffect)
      const eqLow = audioContext.createBiquadFilter()
      eqLow.type = "lowshelf"
      eqLow.frequency.value = 200
      eqLow.gain.value = 0

      const eqMid = audioContext.createBiquadFilter()
      eqMid.type = "peaking"
      eqMid.frequency.value = 1000
      eqMid.Q.value = 1
      eqMid.gain.value = 0

      const eqHigh = audioContext.createBiquadFilter()
      eqHigh.type = "highshelf"
      eqHigh.frequency.value = 3000
      eqHigh.gain.value = 0

      const delay = audioContext.createDelay(5)
      delay.delayTime.value = 0.25 // Default to 250ms

      const delayFeedback = audioContext.createGain()
      delayFeedback.gain.value = 0.3 // Default to 30%

      const delayWet = audioContext.createGain()
      delayWet.gain.value = 0 // Default to 0% mix

      const delayDry = audioContext.createGain()
      delayDry.gain.value = 1 // Default to 100% dry

      const impulseResponse = createImpulseResponse(audioContext, 2, 2)
      const convolver = audioContext.createConvolver()
      convolver.buffer = impulseResponse

      const reverbWet = audioContext.createGain()
      reverbWet.gain.value = 0 // Default to 0% reverb

      const reverbDry = audioContext.createGain()
      reverbDry.gain.value = 1 // Default to 100% dry

      const analyser = audioContext.createAnalyser()
      const panner = audioContext.createStereoPanner()
      const gainNode = audioContext.createGain()

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      // Connect audio chain
      source.connect(eqLow)
      eqLow.connect(eqMid)
      eqMid.connect(eqHigh)

      eqHigh.connect(delayDry)
      eqHigh.connect(delay)
      delay.connect(delayFeedback)
      delayFeedback.connect(delay)
      delay.connect(delayWet)

      const delayMerge = audioContext.createGain()
      delayDry.connect(delayMerge)
      delayWet.connect(delayMerge)

      delayMerge.connect(reverbDry)
      delayMerge.connect(convolver)
      convolver.connect(reverbWet)

      const reverbMerge = audioContext.createGain()
      reverbDry.connect(reverbMerge)
      reverbWet.connect(reverbMerge)

      reverbMerge.connect(analyser)
      analyser.connect(panner)
      panner.connect(gainNode)
      gainNode.connect(masterGain)

      // Store nodes
      eqNodesRef.current.set(newStem.id, { low: eqLow, mid: eqMid, high: eqHigh })
      delayNodesRef.current.set(newStem.id, { delay, feedback: delayFeedback, wet: delayWet, dry: delayDry })
      reverbNodesRef.current.set(newStem.id, { convolver, wet: reverbWet, dry: reverbDry })
      pannerNodesRef.current.set(newStem.id, panner)
      gainNodesRef.current.set(newStem.id, gainNode)
      analyserNodesRef.current.set(newStem.id, analyser)

      audio.volume = 1
      gainNode.gain.value = 1 // Start with full gain

      audio.addEventListener("loadedmetadata", () => {
        // Use the provided duration if available, otherwise fallback to audio.duration
        const duration = sound.duration || audio.duration || 0
        setStemDurations((prev) => new Map(prev).set(newStem.id, duration))
        setMaxDuration((prevMax) => Math.max(prevMax, duration))
      })

      audio.addEventListener("pause", () => {
        setStemPlayingStates((prev) => new Map(prev).set(newStem.id, false))
        setPlayingStems((prev) => {
          const next = new Set(prev)
          next.delete(newStem.id)
          return next
        })
      })

      audio.addEventListener("play", () => {
        setStemPlayingStates((prev) => new Map(prev).set(newStem.id, true))
        setPlayingStems((prev) => new Set(prev).add(newStem.id))
      })

      audioRefs.current.set(newStem.id, audio)
    }
  }

  // AI Features handlers

  const handleGenerateMusic = (url: string, name: string) => {
    const newStem: ExtendedStemData = {
      id: `ai-music-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      url: url,
      icon: "sparkles",
      color: STEM_COLORS[stems.length % STEM_COLORS.length],
      volume: 100,
      muted: false,
      pan: 0,
      solo: false,
      // Initializing regions as empty array
      regions: [],
      effects: {
        reverb: 0,
        delay: {
          time: 250,
          feedback: 30,
          mix: 0,
        },
        eq: {
          low: 0,
          mid: 0,
          high: 0,
        },
      },
      effectsBypassed: {
        reverb: false,
        delay: false,
        eq: false,
      },
    }

    setStems((prev) => [...prev, newStem])

    // Initialize audio element and Web Audio nodes for the new music
    if (audioContextRef.current && masterGainRef.current) {
      const audioContext = audioContextRef.current
      const masterGain = masterGainRef.current

      const audio = new Audio(url)
      audio.crossOrigin = "anonymous"

      const source = audioContext.createMediaElementSource(audio)

      // Create effect nodes (same as in handleAddSound)
      const eqLow = audioContext.createBiquadFilter()
      eqLow.type = "lowshelf"
      eqLow.frequency.value = 200
      eqLow.gain.value = 0

      const eqMid = audioContext.createBiquadFilter()
      eqMid.type = "peaking"
      eqMid.frequency.value = 1000
      eqMid.Q.value = 1
      eqMid.gain.value = 0

      const eqHigh = audioContext.createBiquadFilter()
      eqHigh.type = "highshelf"
      eqHigh.frequency.value = 3000
      eqHigh.gain.value = 0

      const delay = audioContext.createDelay(5)
      delay.delayTime.value = 0.25

      const delayFeedback = audioContext.createGain()
      delayFeedback.gain.value = 0.3

      const delayWet = audioContext.createGain()
      delayWet.gain.value = 0

      const delayDry = audioContext.createGain()
      delayDry.gain.value = 1

      const impulseResponse = createImpulseResponse(audioContext, 2, 2)
      const convolver = audioContext.createConvolver()
      convolver.buffer = impulseResponse

      const reverbWet = audioContext.createGain()
      reverbWet.gain.value = 0

      const reverbDry = audioContext.createGain()
      reverbDry.gain.value = 1

      const analyser = audioContext.createAnalyser()
      const panner = audioContext.createStereoPanner()
      const gainNode = audioContext.createGain()

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8

      source.connect(eqLow)
      eqLow.connect(eqMid)
      eqMid.connect(eqHigh)

      eqHigh.connect(delayDry)
      eqHigh.connect(delay)
      delay.connect(delayFeedback)
      delayFeedback.connect(delay)
      delay.connect(delayWet)

      const delayMerge = audioContext.createGain()
      delayDry.connect(delayMerge)
      delayWet.connect(delayMerge)

      delayMerge.connect(reverbDry)
      delayMerge.connect(convolver)
      convolver.connect(reverbWet)

      const reverbMerge = audioContext.createGain()
      reverbDry.connect(reverbMerge)
      reverbWet.connect(reverbMerge)

      reverbMerge.connect(analyser)
      analyser.connect(panner)
      panner.connect(gainNode)
      gainNode.connect(masterGain)

      eqNodesRef.current.set(newStem.id, { low: eqLow, mid: eqMid, high: eqHigh })
      delayNodesRef.current.set(newStem.id, { delay, feedback: delayFeedback, wet: delayWet, dry: delayDry })
      reverbNodesRef.current.set(newStem.id, { convolver, wet: reverbWet, dry: reverbDry })
      pannerNodesRef.current.set(newStem.id, panner)
      gainNodesRef.current.set(newStem.id, gainNode)
      analyserNodesRef.current.set(newStem.id, analyser)

      audio.volume = 1
      gainNode.gain.value = 1

      audio.addEventListener("loadedmetadata", () => {
        const duration = audio.duration || 0
        setStemDurations((prev) => new Map(prev).set(newStem.id, duration))
        setMaxDuration((prevMax) => Math.max(prevMax, duration))
      })

      audio.addEventListener("pause", () => {
        setStemPlayingStates((prev) => new Map(prev).set(newStem.id, false))
        setPlayingStems((prev) => {
          const next = new Set(prev)
          next.delete(newStem.id)
          return next
        })
      })

      audio.addEventListener("play", () => {
        setStemPlayingStates((prev) => new Map(prev).set(newStem.id, true))
        setPlayingStems((prev) => new Set(prev).add(newStem.id))
      })

      audioRefs.current.set(newStem.id, audio)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Music2 className="h-12 w-12 animate-pulse text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm">Loading stems...</p>
        </div>
      </div>
    )
  }

  if (stems.length === 0 && isProcessing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="relative">
            <Music2 className="h-16 w-16 text-blue-500 mx-auto" />
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-light text-white">Processing stems...</h2>
            <p className="text-sm text-zinc-400">Separating audio tracks. This may take a few minutes.</p>
            {processingTask && (
              <div className="mt-4">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${processingTask.progress}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">{processingTask.progress}% complete</p>
              </div>
            )}
          </div>
          <Button onClick={() => router.push("/library")} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>
        </div>
      </div>
    )
  }

  const anyPlaying = playingStems.size > 0
  // const maxDuration = Math.max(0, ...Array.from(stemDurations.values())) // Removed duplicate declaration

  return (
    <div className="h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex flex-col overflow-hidden">
      {/* Top bar - Enhanced glassmorphism effect */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/library")}
            className="h-8 w-8 text-zinc-400 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-sm font-light text-white">{trackTitle}</h1>

          <SessionInfoPanel bpm={bpm} duration={maxDuration} trackCount={stems.length} sampleRate={44100} />
        </div>

        <div className="flex items-center gap-2">
          <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomFit={handleZoomFit} />

          <div className="h-4 w-px bg-zinc-800/50" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAddTrackModalOpen(true)}
            className="h-7 gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">Add Track</span>
          </Button>

          <div className="h-4 w-px bg-zinc-800/50" />

          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-7 gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden md:inline">Undo</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-7 gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <RotateCcw className="h-3 w-3 scale-x-[-1]" />
            <span className="hidden md:inline">Redo</span>
          </Button>

          <div className="h-4 w-px bg-zinc-800/50" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMasterEffectsModalOpen(true)}
            className="h-7 gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Volume2 className="h-3 w-3" />
            <span className="hidden lg:inline">Master FX</span>
          </Button>

          <div className="h-4 w-px bg-zinc-800/50 hidden lg:block" />

          <Button
            variant={showMarkers ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowMarkers(!showMarkers)}
            className="h-7 gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95 hidden lg:flex"
          >
            <Bookmark className="h-3 w-3" />
            Markers
          </Button>

          <div className="h-4 w-px bg-zinc-800/50" />

          {/* Overflow menu for secondary actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-zinc-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900/95 backdrop-blur-xl border-zinc-800">
              {/* Show Markers on smaller screens */}
              <DropdownMenuItem onClick={() => setShowMarkers(!showMarkers)} className="lg:hidden gap-2 cursor-pointer">
                <Bookmark className="h-3.5 w-3.5" />
                <span>{showMarkers ? "Ocultar Markers" : "Mostrar Markers"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setLoopEnabled(!loopEnabled)} className="gap-2 cursor-pointer">
                <Repeat className="h-3.5 w-3.5" />
                <span>{loopEnabled ? "Desativar Loop" : "Ativar Loop"}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuItem onClick={exportMix} disabled={exporting} className="gap-2 cursor-pointer">
                {exporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>A exportar... {exportProgress}%</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-3.5 w-3.5" />
                    <span>Exportar Mix</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => downloadAll("mp3")} className="gap-2 cursor-pointer">
                <Download className="h-3.5 w-3.5" />
                <span>Descarregar MP3</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => downloadAll("wav")} className="gap-2 cursor-pointer">
                <Download className="h-3.5 w-3.5" />
                <span>Descarregar WAV</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuItem onClick={resetAll} className="gap-2 cursor-pointer text-zinc-400 hover:text-white">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reiniciar Tudo</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)} className="gap-2 cursor-pointer">
                <Keyboard className="h-3.5 w-3.5" />
                <span>Atalhos de Teclado</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setDuaPanelOpen(true)}
                className="gap-2 cursor-pointer bg-gradient-to-r from-purple-500/10 to-pink-500/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Estúdio DUA</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Master controls bar at top - Enhanced with better styling */}
        <div className="h-16 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-950/90 via-zinc-900/80 to-zinc-950/90 backdrop-blur-xl px-6 flex items-center gap-8 shadow-lg shadow-black/10">
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 font-mono tracking-wider">MASTER</span>
            <div className="w-40">
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => setMasterVolume(value[0])}
                max={100}
                className="w-full"
              />
            </div>
            <span className="text-xs text-zinc-400 tabular-nums w-12 font-mono">{masterVolume}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">LIMITER</span>
            <Button
              variant={limiterEnabled ? "default" : "ghost"}
              size="sm"
              onClick={() => setLimiterEnabled(!limiterEnabled)}
              className="h-7 w-14 text-[10px] font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {limiterEnabled ? "ON" : "OFF"}
            </Button>
            {limiterEnabled && (
              <>
                <div className="w-28">
                  <Slider
                    value={[limiterThreshold]}
                    onValueChange={(value) => setLimiterThreshold(value[0])}
                    min={-12}
                    max={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 tabular-nums w-14 font-mono">{limiterThreshold}dB</span>
              </>
            )}
          </div>
        </div>

        {/* Timeline ruler - Enhanced with better background */}
        <div className="h-8 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/60 to-zinc-900/40 backdrop-blur-sm relative shadow-inner">
          <TimelineRuler duration={maxDuration} zoom={zoom} />
        </div>

        {/* Tracks area - each track is a single row with enhanced styling */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {stems.length === 0 ? (
            /* Empty state - Studio ready for use */
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md px-6">
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Music2 className="h-10 w-10 text-zinc-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-light text-white">Estúdio Pronto</h3>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed">
                    Comece a criar. Grave sua voz, importe áudio, gere com IA ou adicione sons da biblioteca.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setAddTrackModalOpen(true)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg h-12 font-light transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pista
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setDuaPanelOpen(true)}
                      variant="ghost"
                      className="bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 rounded-lg h-11 font-light"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar IA
                    </Button>
                    <Button
                      onClick={() => setSoundLibraryOpen(true)}
                      variant="ghost"
                      className="bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 rounded-lg h-11 font-light"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Sons
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 font-light">
                  Todas as ferramentas profissionais disponíveis: mixer, efeitos, automação e mais
                </p>
              </div>
            </div>
          ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stems.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {stems.map((stem, index) => (
                <div
                  key={stem.id}
                  className="h-24 border-b border-zinc-800/30 flex items-center hover:bg-zinc-900/20 hover:border-zinc-700/50 transition-all duration-300 group"
                >
                  {/* Track controls on the left */}
                  <div className="w-56 flex-shrink-0">
                    <SortableTrackItem
                      stem={stem}
                      index={index}
                      toggleMute={toggleMute}
                      toggleSolo={toggleSolo}
                      updateVolume={updateVolume}
                      updatePan={updatePan}
                      resetStem={resetStem}
                      analyserNode={analyserNodesRef.current.get(stem.id) || null}
                      getPanLabel={getPanLabel}
                      updateEffects={updateEffects}
                      toggleEffectBypass={toggleEffectBypass}
                      onOpenEffects={() => {
                        setEffectsModalStemId(stem.id)
                        setEffectsModalOpen(true)
                      }}
                      onOpenRegionEditor={(id) => {
                        // Handler for opening region editor
                        setRegionEditorStemId(id)
                        setRegionEditorOpen(true)
                      }}
                    />
                  </div>

                  {/* Waveform on the right - Enhanced with better spacing and styling */}
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Button
                      onClick={() => toggleStemPlayPause(stem.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full flex-shrink-0 hover:bg-zinc-800/80 transition-all duration-200"
                    >
                      {playingStems.has(stem.id) ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </Button>

                    <div className="flex-1 h-16 relative rounded-lg overflow-hidden bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 shadow-inner group-hover:border-zinc-700/50 transition-all duration-300">
                      <WaveformTimeline
                        audioUrl={stem.url}
                        isPlaying={playingStems.has(stem.id)}
                        currentTime={stemTimes.get(stem.id) || 0}
                        duration={stemDurations.get(stem.id) || 0}
                        onSeek={(time) => handleSeek(stem.id, time)}
                        zoom={zoom}
                        color={stem.color}
                      />
                    </div>

                    <span className="text-xs text-zinc-400 tabular-nums w-20 text-right flex-shrink-0 font-mono">
                      {formatTime(stemTimes.get(stem.id) || 0)} / {formatTime(stemDurations.get(stem.id) || 0)}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(stem.url, stem.name)}
                      className="h-9 w-9 p-0 flex-shrink-0 rounded-full hover:bg-zinc-800/80 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg shadow-black/20 opacity-0 group-hover:opacity-100"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </SortableContext>
          </DndContext>
          )}

          {/* Add track button - Enhanced with better styling - Only show when there are stems */}
          {stems.length > 0 && (
          <div className="h-24 border-b border-zinc-800/30 hover:bg-zinc-900/20 transition-all duration-300 flex items-center justify-center group">
            <Button
              onClick={() => setAddTrackModalOpen(true)}
              variant="ghost"
              className="h-14 w-14 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-black/20 group-hover:shadow-xl"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>
          )}
        </div>
      </div>

      <ProfessionalTransportControls
        isPlaying={anyPlaying}
        onPlayPause={togglePlayAll}
        onSkipBack={() => {
          audioRefs.current.forEach((audio) => {
            audio.currentTime = loopEnabled ? loopStart : 0
          })
        }}
        onSkipForward={() => {
          // Skip forward logic (could be implemented)
          // For now, let's just set current time to the end of the loop or max duration
          const targetTime = loopEnabled ? loopEnd : maxDuration
          audioRefs.current.forEach((audio) => {
            audio.currentTime = targetTime
          })
        }}
        currentTime={currentTime} // Use the global currentTime
        duration={maxDuration}
      />

      <SoundLibraryModal open={soundLibraryOpen} onOpenChange={setSoundLibraryOpen} onAddSound={handleAddSound} />

      <AddTrackModal
        open={addTrackModalOpen}
        onClose={() => setAddTrackModalOpen(false)}
        onUploadAudio={() => {
          // Trigger file input for uploading audio
          const input = document.createElement("input")
          input.type = "file"
          input.accept = "audio/*"
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              // Upload to Blob and add as new stem
              const formData = new FormData()
              formData.append("file", file)

              try {
                const response = await fetch("/api/upload-audio", {
                  method: "POST",
                  body: formData,
                })

                const { url } = await response.json()

                // Create audio element to get duration
                const audio = new Audio(url)
                audio.addEventListener("loadedmetadata", () => {
                  handleRecordingComplete(url, audio.duration)
                })
              } catch (error) {
                console.error("Error uploading audio:", error)
              }
            }
          }
          input.click()
        }}
        onRecordingComplete={handleRecordingComplete}
      />

      {effectsModalStemId && (
        <TrackEffectsModal
          isOpen={effectsModalOpen}
          onClose={() => {
            setEffectsModalOpen(false)
            setEffectsModalStemId(null)
          }}
          trackName={stems.find((s) => s.id === effectsModalStemId)?.name || ""}
          trackColor={(stems.find((s) => s.id === effectsModalStemId)?.color as string) || ""}
          effects={
            stems.find((s) => s.id === effectsModalStemId)?.effects || {
              reverb: 0,
              delay: { time: 250, feedback: 30, mix: 0 },
              eq: { low: 0, mid: 0, high: 0 },
            }
          }
          effectsBypassed={
            stems.find((s) => s.id === effectsModalStemId)?.effectsBypassed || {
              reverb: false,
              delay: false,
              eq: false,
            }
          }
          onEffectsChange={(effects) => updateEffects(effectsModalStemId, effects)}
          onEffectBypassToggle={(effect) => toggleEffectBypass(effectsModalStemId, effect)}
        />
      )}

      <MasterEffectsModal
        isOpen={masterEffectsModalOpen}
        onClose={() => setMasterEffectsModalOpen(false)}
        masterEQ={masterEQ}
        masterCompressor={masterCompressor}
        masterEQEnabled={masterEQEnabled}
        masterCompressorEnabled={masterCompressorEnabled}
        limiterEnabled={limiterEnabled}
        limiterThreshold={limiterThreshold}
        onMasterEQChange={(band, value) => setMasterEQ((prev) => ({ ...prev, [band]: value }))}
        onMasterCompressorChange={(param, value) => setMasterCompressor((prev) => ({ ...prev, [param]: value }))}
        onMasterEQToggle={() => setMasterEQEnabled(!masterEQEnabled)}
        onMasterCompressorToggle={() => setMasterCompressorEnabled(!masterCompressorEnabled)}
        onLimiterToggle={() => setLimiterEnabled(!limiterEnabled)}
        onLimiterThresholdChange={setLimiterThreshold}
        audioContext={audioContextRef.current}
        sourceNode={masterGainRef.current}
      />

      <KeyboardShortcutsOverlay isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />

      {/* DUA Features Dialog */}
      <Dialog open={duaPanelOpen} onOpenChange={setDuaPanelOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950/95 backdrop-blur-xl border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              DUA - A Guardiã do Estúdio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Gerador de Música DUA
              </h3>
              <AIMusicGenerator onGenerate={handleGenerateMusic} />
              <p className="text-xs text-white/40 mt-3">
                DUA usa a API Suno para gerar música original a partir das tuas descrições
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advanced Effects Modal */}
      {advancedEffectsModalStemId && (
        <AdvancedEffectsModal
          isOpen={advancedEffectsModalOpen}
          onClose={() => {
            setAdvancedEffectsModalOpen(false)
            setAdvancedEffectsModalStemId(null)
          }}
          trackName={stems.find((s) => s.id === advancedEffectsModalStemId)?.name || ""}
          trackColor={(stems.find((s) => s.id === advancedEffectsModalStemId)?.color as string) || ""}
          effects={
            stems.find((s) => s.id === advancedEffectsModalStemId)?.effects || {
              reverb: 0,
              delay: { time: 250, feedback: 30, mix: 0 },
              eq: { low: 0, mid: 0, high: 0 },
            }
          }
          effectsBypassed={
            stems.find((s) => s.id === advancedEffectsModalStemId)?.effectsBypassed || {
              reverb: false,
              delay: false,
              eq: false,
            }
          }
          onEffectsChange={(effects) => updateEffects(advancedEffectsModalStemId, effects)}
          onEffectBypassToggle={(effect) => toggleEffectBypass(advancedEffectsModalStemId, effect)}
        />
      )}

      {/* Region Editor Modal */}
      <Dialog open={regionEditorOpen} onOpenChange={setRegionEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Áudio - {stems.find((s) => s.id === regionEditorStemId)?.name}</DialogTitle>
            <DialogDescription>Corte, divida e marque secções do áudio</DialogDescription>
          </DialogHeader>

          <AudioRegionEditor
            stemId={regionEditorStemId!}
            stemName={stems.find((s) => s.id === regionEditorStemId)?.name || ""}
            duration={stemDurations.get(regionEditorStemId!) || 0}
            currentTime={currentTime}
            regions={stems.find((s) => s.id === regionEditorStemId)?.regions || []}
            onUpdateRegions={(regions) => updateStemRegions(regionEditorStemId!, regions)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
