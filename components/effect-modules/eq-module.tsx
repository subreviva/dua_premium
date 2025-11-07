"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { EQCurveVisualizer } from "./eq-curve-visualizer"
import { EffectPresets, type EffectPreset } from "./effect-presets"

interface EQModuleProps {
  low: number
  mid: number
  high: number
  onLowChange: (value: number) => void
  onMidChange: (value: number) => void
  onHighChange: (value: number) => void
  bypassed?: boolean
  onBypassToggle?: () => void
}

const EQ_FACTORY_PRESETS: EffectPreset[] = [
  { name: "Flat", settings: { low: 0, mid: 0, high: 0 } },
  { name: "Bass Boost", settings: { low: 6, mid: 0, high: -2 } },
  { name: "Treble Boost", settings: { low: -2, mid: 0, high: 6 } },
  { name: "Vocal Enhance", settings: { low: -3, mid: 4, high: 2 } },
  { name: "Warm", settings: { low: 4, mid: 2, high: -2 } },
  { name: "Bright", settings: { low: -2, mid: 2, high: 4 } },
  { name: "Smiley", settings: { low: 5, mid: -3, high: 5 } },
]

export function EQModule({
  low,
  mid,
  high,
  onLowChange,
  onMidChange,
  onHighChange,
  bypassed = false,
  onBypassToggle,
}: EQModuleProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleLoadPreset = (settings: Record<string, number>) => {
    onLowChange(settings.low)
    onMidChange(settings.mid)
    onHighChange(settings.high)
  }

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
              bypassed ? "text-zinc-600" : "text-purple-500"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                bypassed ? "bg-zinc-700" : "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse"
              }`}
            />
          </Button>
          <span className="text-[10px] font-mono text-zinc-300 tracking-wider">EQ</span>
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
          {/* EQ curve visualizer */}
          <EQCurveVisualizer lowGain={low} midGain={mid} highGain={high} />

          {/* Low */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">LOW (200Hz)</span>
              <span className="text-[9px] text-zinc-400 tabular-nums">
                {low > 0 ? "+" : ""}
                {low}dB
              </span>
            </div>
            <Slider
              value={[low]}
              onValueChange={(v) => onLowChange(v[0])}
              min={-12}
              max={12}
              step={1}
              disabled={bypassed}
            />
          </div>

          {/* Mid */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">MID (1kHz)</span>
              <span className="text-[9px] text-zinc-400 tabular-nums">
                {mid > 0 ? "+" : ""}
                {mid}dB
              </span>
            </div>
            <Slider
              value={[mid]}
              onValueChange={(v) => onMidChange(v[0])}
              min={-12}
              max={12}
              step={1}
              disabled={bypassed}
            />
          </div>

          {/* High */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">HIGH (3kHz)</span>
              <span className="text-[9px] text-zinc-400 tabular-nums">
                {high > 0 ? "+" : ""}
                {high}dB
              </span>
            </div>
            <Slider
              value={[high]}
              onValueChange={(v) => onHighChange(v[0])}
              min={-12}
              max={12}
              step={1}
              disabled={bypassed}
            />
          </div>

          {/* Visual EQ bars */}
          <div className="flex items-end justify-between gap-1 h-12 pt-2">
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="flex-1 w-full bg-zinc-800/50 rounded-sm overflow-hidden flex flex-col-reverse">
                <div
                  className={`w-full transition-all duration-300 ${
                    bypassed ? "bg-zinc-700" : "bg-gradient-to-t from-orange-500 to-orange-400"
                  }`}
                  style={{ height: `${((low + 12) / 24) * 100}%` }}
                />
              </div>
              <span className="text-[8px] text-zinc-600 font-mono">L</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="flex-1 w-full bg-zinc-800/50 rounded-sm overflow-hidden flex flex-col-reverse">
                <div
                  className={`w-full transition-all duration-300 ${
                    bypassed ? "bg-zinc-700" : "bg-gradient-to-t from-yellow-500 to-yellow-400"
                  }`}
                  style={{ height: `${((mid + 12) / 24) * 100}%` }}
                />
              </div>
              <span className="text-[8px] text-zinc-600 font-mono">M</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="flex-1 w-full bg-zinc-800/50 rounded-sm overflow-hidden flex flex-col-reverse">
                <div
                  className={`w-full transition-all duration-300 ${
                    bypassed ? "bg-zinc-700" : "bg-gradient-to-t from-cyan-500 to-cyan-400"
                  }`}
                  style={{ height: `${((high + 12) / 24) * 100}%` }}
                />
              </div>
              <span className="text-[8px] text-zinc-600 font-mono">H</span>
            </div>
          </div>

          {/* Presets section */}
          <EffectPresets
            effectType="eq"
            currentSettings={{ low, mid, high }}
            onLoadPreset={handleLoadPreset}
            factoryPresets={EQ_FACTORY_PRESETS}
          />
        </div>
      )}
    </div>
  )
}
