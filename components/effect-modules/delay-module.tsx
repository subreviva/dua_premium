"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { EffectPresets, type EffectPreset } from "./effect-presets"

interface DelayModuleProps {
  time: number
  feedback: number
  mix: number
  onTimeChange: (value: number) => void
  onFeedbackChange: (value: number) => void
  onMixChange: (value: number) => void
  bypassed?: boolean
  onBypassToggle?: () => void
}

export function DelayModule({
  time,
  feedback,
  mix,
  onTimeChange,
  onFeedbackChange,
  onMixChange,
  bypassed = false,
  onBypassToggle,
}: DelayModuleProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleLoadPreset = (settings: Record<string, number>) => {
    onTimeChange(settings.time)
    onFeedbackChange(settings.feedback)
    onMixChange(settings.mix)
  }

  const DELAY_FACTORY_PRESETS: EffectPreset[] = [
    { name: "Off", settings: { time: 0, feedback: 0, mix: 0 } },
    { name: "Slap", settings: { time: 100, feedback: 20, mix: 30 } },
    { name: "Short", settings: { time: 250, feedback: 30, mix: 40 } },
    { name: "Medium", settings: { time: 500, feedback: 40, mix: 50 } },
    { name: "Long", settings: { time: 750, feedback: 50, mix: 50 } },
    { name: "Ambient", settings: { time: 1000, feedback: 60, mix: 60 } },
    { name: "Ping Pong", settings: { time: 375, feedback: 45, mix: 55 } },
  ]

  return (
    <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-800/50 bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBypassToggle}
            className={`h-6 w-6 transition-all duration-200 hover:scale-110 active:scale-95 ${
              bypassed ? "text-zinc-600" : "text-blue-500"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                bypassed ? "bg-zinc-700" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"
              }`}
            />
          </Button>
          <span className="text-[10px] font-mono text-zinc-300 tracking-wider">DELAY</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-6 w-6 text-zinc-400 hover:text-white transition-all duration-200"
        >
          {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </Button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-3 space-y-3 animate-in fade-in duration-200">
          {/* Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">TIME</span>
              <span className="text-[9px] text-zinc-400 tabular-nums">{time}ms</span>
            </div>
            <Slider value={[time]} onValueChange={(v) => onTimeChange(v[0])} max={1000} step={10} disabled={bypassed} />
          </div>

          {/* Feedback */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">FEEDBACK</span>
              <span className="text-[9px] text-zinc-400 tabular-nums">{feedback}%</span>
            </div>
            <Slider value={[feedback]} onValueChange={(v) => onFeedbackChange(v[0])} max={100} disabled={bypassed} />
          </div>

          {/* Mix */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">MIX</span>
              <span className="text-[9px] text-zinc-400 tabular-nums">{mix}%</span>
            </div>
            <Slider value={[mix]} onValueChange={(v) => onMixChange(v[0])} max={100} disabled={bypassed} />
          </div>

          {/* Visual indicator */}
          <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                bypassed ? "bg-zinc-700" : "bg-gradient-to-r from-blue-500 to-cyan-500"
              }`}
              style={{ width: `${bypassed ? 0 : mix}%` }}
            />
          </div>

          <EffectPresets
            effectType="delay"
            currentSettings={{ time, feedback, mix }}
            onLoadPreset={handleLoadPreset}
            factoryPresets={DELAY_FACTORY_PRESETS}
          />
        </div>
      )}
    </div>
  )
}
