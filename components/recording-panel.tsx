"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, Square, Circle, Pause, Play } from "lucide-react"
import { safeParse } from "@/lib/fetch-utils"

interface RecordingPanelProps {
  onRecordingComplete: (audioUrl: string, duration: number) => void
  onClose: () => void
}

function RecordingPanelComponent({ onRecordingComplete, onClose }: RecordingPanelProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [inputLevel, setInputLevel] = useState(0)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Get available audio input devices
  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter((device) => device.kind === "audioinput")
        setDevices(audioInputs)
        if (audioInputs.length > 0) {
          setSelectedDevice(audioInputs[0].deviceId)
        }
      } catch (error) {
        console.error("Error getting devices:", error)
      }
    }
    getDevices()
  }, [])

  // Monitor input level
  useEffect(() => {
    if (!selectedDevice) return

    async function setupMonitoring() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedDevice },
        })
        streamRef.current = stream

        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser

        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        function updateLevel() {
          if (!analyserRef.current) return

          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setInputLevel(average / 255)

          animationFrameRef.current = requestAnimationFrame(updateLevel)
        }

        updateLevel()
      } catch (error) {
        console.error("Error setting up monitoring:", error)
      }
    }

    setupMonitoring()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [selectedDevice])

  const startRecording = async () => {
    try {
      if (!streamRef.current) return

      chunksRef.current = []

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "audio/webm",
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })

        try {
          const formData = new FormData()
          formData.append("file", blob, `recording-${Date.now()}.webm`)

          const response = await fetch("/api/upload-audio", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Failed to upload recording")
          }

          const data = await safeParse<{ url: string }>(response)
          if (!data?.url) {
            throw new Error("Invalid response from upload")
          }
          const { url } = data

          // Get duration
          const audioContext = new AudioContext()
          const arrayBuffer = await blob.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          const duration = audioBuffer.duration

          onRecordingComplete(url, duration)
          onClose()
        } catch (error) {
          console.error("Error uploading recording:", error)
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-6 bg-zinc-900 border-zinc-800">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">Gravação de Áudio</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {/* Input Device Selection */}
        <div className="space-y-2">
          <Label>Dispositivo de Entrada</Label>
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Selecionar microfone" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input Level Meter */}
        <div className="space-y-2">
          <Label>Nível de Entrada</Label>
          <div className="h-8 bg-zinc-800 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
              style={{ width: `${inputLevel * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono text-white mix-blend-difference">{Math.round(inputLevel * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Recording Time */}
        {isRecording && (
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-red-500 flex items-center justify-center gap-2">
              {isPaused ? <Pause className="w-6 h-6" /> : <Circle className="w-6 h-6 animate-pulse fill-current" />}
              {formatTime(recordingTime)}
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={!selectedDevice || isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg"
            >
              <Circle className="w-5 h-5 mr-2 fill-current" />
              Gravar
            </Button>
          ) : (
            <>
              <Button onClick={pauseRecording} variant="outline" className="border-zinc-700 px-6 py-6 bg-transparent">
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button onClick={stopRecording} className="bg-zinc-700 hover:bg-zinc-600 px-8 py-6 text-lg">
                <Square className="w-5 h-5 mr-2" />
                Parar
              </Button>
            </>
          )}
        </div>

        {isProcessing && <div className="text-center text-sm text-zinc-400">A processar gravação...</div>}
      </div>
    </Card>
  )
}

export const RecordingPanel = RecordingPanelComponent
