"use client"

import { useEffect, useRef } from "react"

interface EQCurveVisualizerProps {
  lowGain: number
  midGain: number
  highGain: number
}

export function EQCurveVisualizer({ lowGain, midGain, highGain }: EQCurveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = (width / 4) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw center line (0dB)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    // Draw EQ curve
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, "#3b82f6") // blue for low
    gradient.addColorStop(0.5, "#10b981") // green for mid
    gradient.addColorStop(1, "#f59e0b") // orange for high

    ctx.strokeStyle = gradient
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Calculate curve points
    const points: { x: number; y: number }[] = []
    const segments = 100

    for (let i = 0; i <= segments; i++) {
      const x = (width / segments) * i
      const freq = i / segments // 0 to 1

      let gain = 0

      // Low frequency (0 - 0.33)
      if (freq < 0.33) {
        const t = freq / 0.33
        gain = lowGain * (1 - t) + midGain * t
      }
      // Mid frequency (0.33 - 0.66)
      else if (freq < 0.66) {
        const t = (freq - 0.33) / 0.33
        gain = midGain * (1 - t) + highGain * t
      }
      // High frequency (0.66 - 1)
      else {
        gain = highGain
      }

      // Convert gain (-12 to +12) to y position
      const normalizedGain = (gain + 12) / 24 // 0 to 1
      const y = height - normalizedGain * height

      points.push({ x, y })
    }

    // Draw the curve
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.stroke()

    // Draw glow effect
    ctx.shadowBlur = 10
    ctx.shadowColor = "rgba(59, 130, 246, 0.5)"
    ctx.stroke()
    ctx.shadowBlur = 0

    // Draw frequency labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.font = "10px monospace"
    ctx.textAlign = "center"
    ctx.fillText("LOW", width * 0.16, height - 5)
    ctx.fillText("MID", width * 0.5, height - 5)
    ctx.fillText("HIGH", width * 0.84, height - 5)

    // Draw gain labels
    ctx.textAlign = "right"
    ctx.fillText("+12", width - 5, 12)
    ctx.fillText("0", width - 5, height / 2 + 4)
    ctx.fillText("-12", width - 5, height - 5)
  }, [lowGain, midGain, highGain])

  return (
    <div className="relative w-full h-24 bg-black/40 rounded border border-zinc-800/50 overflow-hidden">
      <canvas ref={canvasRef} width={400} height={96} className="w-full h-full" />
    </div>
  )
}
