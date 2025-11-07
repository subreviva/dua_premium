"use client"

import { useEffect, useRef } from "react"

interface ProfessionalVUMeterProps {
  level: number
  peakHold?: boolean
}

export function ProfessionalVUMeter({ level, peakHold = true }: ProfessionalVUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const peakRef = useRef(0)
  const peakHoldTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Update peak hold
    if (level > peakRef.current) {
      peakRef.current = level
      peakHoldTimeRef.current = Date.now()
    } else if (Date.now() - peakHoldTimeRef.current > 1500) {
      peakRef.current = Math.max(0, peakRef.current - 0.5)
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = "rgba(39, 39, 42, 0.5)"
    ctx.fillRect(0, 0, width, height)

    // Calculate bar height
    const barHeight = (level / 100) * height

    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, "#10b981") // Green
    gradient.addColorStop(0.6, "#eab308") // Yellow
    gradient.addColorStop(0.85, "#f97316") // Orange
    gradient.addColorStop(1, "#ef4444") // Red

    // Draw level bar
    ctx.fillStyle = gradient
    ctx.fillRect(0, height - barHeight, width, barHeight)

    // Draw peak hold line
    if (peakHold && peakRef.current > 0) {
      const peakY = height - (peakRef.current / 100) * height
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, peakY - 1, width, 2)
    }

    // Draw scale marks
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [level, peakHold])

  return <canvas ref={canvasRef} width={24} height={120} className="rounded-sm" />
}
