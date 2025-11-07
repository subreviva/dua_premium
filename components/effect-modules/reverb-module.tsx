"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { EffectPresets, type EffectPreset } from "./effect-presets"

interface ReverbModuleProps {
  value: number
  onChange: (value: number) => void
  bypassed?: boolean
  onBypassToggle?: () => void
}

const REVERB_FACTORY_PRESETS: EffectPreset[] = [
  { name: "Off", settings: { value: 0 } },
  { name: "Small Room", settings: { value: 20 } },
  { name: "Medium Room", settings: { value: 35 } },
  { name: "Large Room", settings: { value: 50 } },
  { name: "Hall", settings: { value: 65 } },
  { name: "Cathedral", settings: { value: 80 } },
  { name: "Ambient", settings: { value: 90 } },
]

export function ReverbModule({ value, onChange, bypassed = false, onBypassToggle }: ReverbModuleProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleLoadPreset = (settings: Record<string, number>) => {
    onChange(settings.value)
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
              bypassed ? "text-zinc-600" : "text-green-500"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                bypassed ? "bg-zinc-700" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"
              }`}
            />
          </Button>
          <span className="text-[10px] font-mono text-zinc-300 tracking-wider">REVERB</span>
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
          {/* Mix */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">MIX</span>
              <span className="text-[9px] text-zinc-400 tabular-nums">{value}%</span>
            </div>
            <Slider value={[value]} onValueChange={(v) => onChange(v[0])} max={100} disabled={bypassed} />
          </div>

          {/* Visual indicator */}
          <div className="h-1 bg-zinc-800/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                bypassed ? "bg-zinc-700" : "bg-gradient-to-r from-green-500 to-emerald-500"
              }`}
              style={{ width: `${bypassed ? 0 : value}%` }}
            />
          </div>

          {/* Presets section */}
          <EffectPresets
            effectType="reverb"
            currentSettings={{ value }}
            onLoadPreset={handleLoadPreset}
            factoryPresets={REVERB_FACTORY_PRESETS}
          />
        </div>
      )}
    </div>
  )
}
