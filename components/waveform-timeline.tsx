"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface WaveformTimelineProps {
  audioUrl: string
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  color?: string
  className?: string
  zoom?: number
}

export function WaveformTimeline({
  audioUrl,
  currentTime,
  duration,
  onSeek,
  color = "rgb(34, 197, 94)",
  className,
  zoom = 1,
}: WaveformTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const generateWaveform = async () => {
      try {
        setIsLoading(true)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        const rawData = audioBuffer.getChannelData(0)
        const samples = 200 // Number of bars in waveform
        const blockSize = Math.floor(rawData.length / samples)
        const filteredData: number[] = []

        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i
          let sum = 0
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j])
          }
          filteredData.push(sum / blockSize)
        }

        const max = Math.max(...filteredData)
        const normalized = filteredData.map((n) => n / max)
        setWaveformData(normalized)
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Error generating waveform:", error)
        setIsLoading(false)
      }
    }

    if (audioUrl) {
      generateWaveform()
    }
  }, [audioUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || waveformData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()

    canvas.width = rect.width * dpr * zoom
    canvas.height = rect.height * dpr * zoom

    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width * zoom, rect.height * zoom)

    const barWidth = (rect.width * zoom) / waveformData.length
    const barGap = barWidth * 0.2
    const actualBarWidth = barWidth - barGap

    const progress = duration > 0 ? currentTime / duration : 0

    waveformData.forEach((value, index) => {
      const barHeight = value * rect.height * zoom * 0.9
      const x = index * barWidth
      const y = (rect.height * zoom - barHeight) / 2

      const barProgress = index / waveformData.length

      if (barProgress <= progress) {
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, color.replace("rgb", "rgba").replace(")", ", 0.6)"))
        ctx.fillStyle = gradient
      } else {
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.25)")
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")
        ctx.fillStyle = gradient
      }

      ctx.beginPath()
      const radius = Math.min(actualBarWidth / 2, 2)
      ctx.roundRect(x, y, actualBarWidth, barHeight, radius)
      ctx.fill()
    })

    const playheadX = progress * rect.width * zoom

    ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
    ctx.shadowBlur = 10
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, rect.height * zoom)
    ctx.stroke()

    ctx.shadowBlur = 0
  }, [waveformData, currentTime, duration, color, zoom])

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || duration === 0) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickWidth = rect.width

    if (clickWidth === 0) {
      console.error("[v0] Invalid canvas width for seek calculation")
      return
    }

    const progress = Math.max(0, Math.min(1, x / clickWidth))
    const newTime = progress * duration

    if (!isFinite(newTime) || newTime < 0) {
      console.error("[v0] Invalid seek time calculated:", newTime)
      return
    }

    onSeek(newTime)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    handleSeek(e)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleSeek(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "w-full h-full transition-all duration-200 hover:brightness-110",
          isDragging ? "cursor-grabbing" : "cursor-pointer",
        )}
        style={{ display: "block", transform: `scale(${1 / zoom})`, transformOrigin: "left center" }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            <div className="text-[10px] text-zinc-400 font-light tracking-wide">A carregar waveform...</div>
          </div>
        </div>
      )}
    </div>
  )
}
