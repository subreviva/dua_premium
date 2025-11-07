"use client"

import { useEffect, useRef } from "react"

interface StereoMetersProps {
  audioContext: AudioContext | null
  sourceNode: AudioNode | null
}

export function StereoMeters({ audioContext, sourceNode }: StereoMetersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!audioContext || !sourceNode || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create analyser
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    sourceNode.connect(analyser)
    analyserRef.current = analyser

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyser || !ctx) return

      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate stereo width (simplified visualization)
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength
      const normalized = average / 255

      // Draw stereo field
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) / 2 - 10

      // Background circle
      ctx.strokeStyle = "#27272a"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Stereo field visualization
      ctx.fillStyle = `rgba(59, 130, 246, ${normalized * 0.5})`
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * normalized, 0, Math.PI * 2)
      ctx.fill()

      // Center dot
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
      ctx.fill()

      // Labels
      ctx.fillStyle = "#71717a"
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.fillText("L", 15, centerY + 4)
      ctx.fillText("R", canvas.width - 15, centerY + 4)
      ctx.fillText("M", centerX, 15)
      ctx.fillText("S", centerX, canvas.height - 5)

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect()
      }
    }
  }, [audioContext, sourceNode])

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl p-3">
      <div className="text-[10px] font-mono text-zinc-500 mb-2">STEREO FIELD</div>
      <canvas ref={canvasRef} width={120} height={120} className="w-full h-auto" />
    </div>
  )
}
