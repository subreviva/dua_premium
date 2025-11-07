"use client"

import type React from "react"

import { useState } from "react"

interface LoopRegionControlProps {
  duration: number
  loopStart: number
  loopEnd: number
  loopEnabled: boolean
  onLoopStartChange: (value: number) => void
  onLoopEndChange: (value: number) => void
  onLoopToggle: () => void
  className?: string
}

export function LoopRegionControl({
  duration,
  loopStart,
  loopEnd,
  loopEnabled,
  onLoopStartChange,
  onLoopEndChange,
  onLoopToggle,
  className = "",
}: LoopRegionControlProps) {
  const [dragging, setDragging] = useState<"start" | "end" | null>(null)

  const handleMouseDown = (type: "start" | "end") => (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(type)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const progress = Math.max(0, Math.min(1, x / rect.width))
    const time = progress * duration

    if (dragging === "start") {
      onLoopStartChange(Math.min(time, loopEnd - 1))
    } else {
      onLoopEndChange(Math.max(time, loopStart + 1))
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const startPercent = (loopStart / duration) * 100
  const endPercent = (loopEnd / duration) * 100

  return (
    <div className={`relative ${className}`}>
      {/* Loop region overlay */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none transition-opacity duration-200"
        style={{
          left: `${startPercent}%`,
          right: `${100 - endPercent}%`,
          backgroundColor: loopEnabled ? "rgba(59, 130, 246, 0.1)" : "transparent",
          borderLeft: loopEnabled ? "2px solid rgb(59, 130, 246)" : "none",
          borderRight: loopEnabled ? "2px solid rgb(59, 130, 246)" : "none",
        }}
      />

      {/* Draggable handles */}
      {loopEnabled && (
        <div
          className="absolute inset-0 cursor-col-resize"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Start handle */}
          <div
            className="absolute top-0 bottom-0 w-2 -ml-1 cursor-ew-resize hover:bg-blue-500/50 transition-colors group"
            style={{ left: `${startPercent}%` }}
            onMouseDown={handleMouseDown("start")}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* End handle */}
          <div
            className="absolute top-0 bottom-0 w-2 -ml-1 cursor-ew-resize hover:bg-blue-500/50 transition-colors group"
            style={{ left: `${endPercent}%` }}
            onMouseDown={handleMouseDown("end")}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}
    </div>
  )
}
