"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface SpeedControlProps {
  onClose: () => void
}

export function SpeedControl({ onClose }: SpeedControlProps) {
  const [speed, setSpeed] = useState(1.0)
  const [keepPitch, setKeepPitch] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Playback Speed</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Song Info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded flex items-center justify-center">
            <span className="text-2xl">▶️</span>
          </div>
          <div>
            <div className="font-medium text-sm">Ashes in the Wind</div>
            <div className="text-xs text-neutral-400">00:00 / 04:38</div>
          </div>
        </div>

        {/* Waveform */}
        <div className="relative h-20 bg-neutral-950 rounded-lg mb-6 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
            {Array.from({ length: 100 }).map((_, i) => {
              const height = Math.random() * 60 + 10
              return (
                <rect key={i} x={i * 4} y={(80 - height) / 2} width="3" height={height} fill="#525252" opacity={0.6} />
              )
            })}
          </svg>
        </div>

        {/* Speed Display */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold">{speed.toFixed(2)}x</div>
        </div>

        {/* Speed Slider */}
        <div className="relative mb-6">
          <input
            type="range"
            min="0.25"
            max="4.00"
            step="0.01"
            value={speed}
            onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-2">
            <span>0.25x</span>
            <span>4.00x</span>
          </div>
        </div>

        {/* Keep Pitch Toggle */}
        <button
          onClick={() => setKeepPitch(!keepPitch)}
          className="flex items-center justify-between w-full p-3 bg-neutral-800 rounded-lg hover:bg-neutral-750 transition-colors"
        >
          <span className="text-sm font-medium">Keep Pitch</span>
          <div
            className={`w-11 h-6 rounded-full transition-colors relative ${
              keepPitch ? "bg-purple-600" : "bg-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                keepPitch ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {/* Save Button */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
          <button className="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 text-sm font-medium flex items-center gap-2">
            💾 Save to...
          </button>
          <span className="text-sm text-neutral-400">My Workspace</span>
        </div>
      </div>
    </div>
  )
}
