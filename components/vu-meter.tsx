"use client"

import { useEffect, useRef } from "react"

interface VUMeterProps {
  analyser: AnalyserNode | null
  className?: string
}

export function VUMeter({ analyser, className = "" }: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)

      // Calculate average level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      const level = average / 255 // Normalize to 0-1

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "hsl(var(--muted))"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw level bar
      const barHeight = level * canvas.height

      // Create gradient based on level
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0)
      if (level < 0.6) {
        gradient.addColorStop(0, "rgb(34, 197, 94)") // green
        gradient.addColorStop(1, "rgb(34, 197, 94)")
      } else if (level < 0.85) {
        gradient.addColorStop(0, "rgb(34, 197, 94)") // green
        gradient.addColorStop(0.7, "rgb(234, 179, 8)") // yellow
        gradient.addColorStop(1, "rgb(234, 179, 8)")
      } else {
        gradient.addColorStop(0, "rgb(34, 197, 94)") // green
        gradient.addColorStop(0.6, "rgb(234, 179, 8)") // yellow
        gradient.addColorStop(0.85, "rgb(239, 68, 68)") // red
        gradient.addColorStop(1, "rgb(239, 68, 68)")
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight)

      // Draw scale lines
      ctx.strokeStyle = "hsl(var(--border))"
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const y = (i / 10) * canvas.height
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [analyser])

  return <canvas ref={canvasRef} width={24} height={120} className={`rounded ${className}`} />
}
