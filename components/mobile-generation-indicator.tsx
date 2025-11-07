"use client"

import { useEffect, useState } from "react"

interface MobileGenerationIndicatorProps {
  taskCount: number
}

export function MobileGenerationIndicator({ taskCount }: MobileGenerationIndicatorProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (taskCount === 0) return

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 100)

    return () => clearInterval(interval)
  }, [taskCount])

  if (taskCount === 0) return null

  return (
    <div className="fixed bottom-[92px] right-5 z-30 md:hidden">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Animated circular progress */}
        <svg className="absolute inset-0 h-16 w-16 -rotate-90 transform">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-slate-800/40"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            className="transition-all duration-100 ease-linear"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content with elegant gradient */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-xl shadow-purple-500/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50">
            <span className="text-base font-bold bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {taskCount}
            </span>
          </div>
        </div>

        {/* Subtle pulsing ring effect */}
        <div
          className="absolute inset-0 animate-ping rounded-full bg-purple-500/20"
          style={{ animationDuration: "3s" }}
        />
      </div>
    </div>
  )
}
