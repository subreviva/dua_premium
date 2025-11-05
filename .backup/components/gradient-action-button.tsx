"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface GradientActionButtonProps {
  icon: LucideIcon
  label: string
  gradientFrom: string
  gradientTo: string
  onClick?: () => void
}

export function GradientActionButton({
  icon: Icon,
  label,
  gradientFrom,
  gradientTo,
  onClick,
}: GradientActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={
        {
          "--gradient-from": gradientFrom,
          "--gradient-to": gradientTo,
        } as React.CSSProperties
      }
      className={cn(
        "relative w-[60px] h-[60px] bg-white/5 backdrop-blur-md shadow-lg rounded-full",
        "flex items-center justify-center transition-all duration-500",
        "hover:w-[180px] hover:shadow-none group cursor-pointer",
        "border border-white/10 hover:border-transparent",
      )}
    >
      {/* Gradient background on hover */}
      <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-500 group-hover:opacity-100" />

      {/* Blur glow */}
      <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50" />

      {/* Icon */}
      <span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
        <Icon className="w-6 h-6 text-white" />
      </span>

      {/* Label */}
      <span className="absolute text-white uppercase tracking-wide text-sm font-medium transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
        {label}
      </span>
    </button>
  )
}
