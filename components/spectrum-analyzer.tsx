"use client"

import { useEffect, useRef } from "react"

interface SpectrumAnalyzerProps {
  analyser: AnalyserNode | null
  className?: string
}

export function SpectrumAnalyzer({ analyser, className = "" }: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.fillStyle = "hsl(var(--background))"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, "rgb(34, 197, 94)")
        gradient.addColorStop(0.5, "rgb(234, 179, 8)")
        gradient.addColorStop(1, "rgb(239, 68, 68)")

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)

        x += barWidth
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

  return <canvas ref={canvasRef} width={400} height={80} className={`w-full rounded ${className}`} />
}
