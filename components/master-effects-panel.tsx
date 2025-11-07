"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Power } from "lucide-react"

interface MasterEffectsProps {
  masterEQ: {
    low: number
    mid: number
    high: number
  }
  masterCompressor: {
    threshold: number
    ratio: number
    attack: number
    release: number
  }
  onMasterEQChange: (band: "low" | "mid" | "high", value: number) => void
  onMasterCompressorChange: (param: "threshold" | "ratio" | "attack" | "release", value: number) => void
  masterEQEnabled: boolean
  masterCompressorEnabled: boolean
  onMasterEQToggle: () => void
  onMasterCompressorToggle: () => void
}

export function MasterEffectsPanel({
  masterEQ,
  masterCompressor,
  onMasterEQChange,
  onMasterCompressorChange,
  masterEQEnabled,
  masterCompressorEnabled,
  onMasterEQToggle,
  onMasterCompressorToggle,
}: MasterEffectsProps) {
  const [eqExpanded, setEqExpanded] = useState(true)
  const [compressorExpanded, setCompressorExpanded] = useState(true)

  return (
    <div className="space-y-2">
      {/* Master EQ */}
      <div className="rounded-lg border border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className={`h-6 w-6 p-0 transition-all ${
                masterEQEnabled ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800/50 text-zinc-600"
              }`}
              onClick={onMasterEQToggle}
            >
              <Power className="h-3 w-3" />
            </Button>
            <span className="text-xs font-mono text-zinc-400">MASTER EQ</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEqExpanded(!eqExpanded)}>
            {eqExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {eqExpanded && (
          <div className="p-3 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500">LOW</label>
                <span className="text-[10px] font-mono text-zinc-400">{masterEQ.low.toFixed(1)} dB</span>
              </div>
              <Slider
                value={[masterEQ.low]}
                onValueChange={(value) => onMasterEQChange("low", value[0])}
                min={-12}
                max={12}
                step={0.1}
                disabled={!masterEQEnabled}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500">MID</label>
                <span className="text-[10px] font-mono text-zinc-400">{masterEQ.mid.toFixed(1)} dB</span>
              </div>
              <Slider
                value={[masterEQ.mid]}
                onValueChange={(value) => onMasterEQChange("mid", value[0])}
                min={-12}
                max={12}
                step={0.1}
                disabled={!masterEQEnabled}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500">HIGH</label>
                <span className="text-[10px] font-mono text-zinc-400">{masterEQ.high.toFixed(1)} dB</span>
              </div>
              <Slider
                value={[masterEQ.high]}
                onValueChange={(value) => onMasterEQChange("high", value[0])}
                min={-12}
                max={12}
                step={0.1}
                disabled={!masterEQEnabled}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Master Compressor */}
      <div className="rounded-lg border border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className={`h-6 w-6 p-0 transition-all ${
                masterCompressorEnabled ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800/50 text-zinc-600"
              }`}
              onClick={onMasterCompressorToggle}
            >
              <Power className="h-3 w-3" />
            </Button>
            <span className="text-xs font-mono text-zinc-400">MASTER COMP</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setCompressorExpanded(!compressorExpanded)}
          >
            {compressorExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {compressorExpanded && (
          <div className="p-3 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500">THRESHOLD</label>
                <span className="text-[10px] font-mono text-zinc-400">{masterCompressor.threshold.toFixed(1)} dB</span>
              </div>
              <Slider
                value={[masterCompressor.threshold]}
                onValueChange={(value) => onMasterCompressorChange("threshold", value[0])}
                min={-40}
                max={0}
                step={0.1}
                disabled={!masterCompressorEnabled}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500">RATIO</label>
                <span className="text-[10px] font-mono text-zinc-400">{masterCompressor.ratio.toFixed(1)}:1</span>
              </div>
              <Slider
                value={[masterCompressor.ratio]}
                onValueChange={(value) => onMasterCompressorChange("ratio", value[0])}
                min={1}
                max={20}
                step={0.1}
                disabled={!masterCompressorEnabled}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500">ATTACK</label>
                <span className="text-[10px] font-mono text-zinc-400">{masterCompressor.attack.toFixed(0)} ms</span>
              </div>
              <Slider
                value={[masterCompressor.attack]}
                onValueChange={(value) => onMasterCompressorChange("attack", value[0])}
                min={0}
                max={100}
                step={1}
                disabled={!masterCompressorEnabled}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500">RELEASE</label>
                <span className="text-[10px] font-mono text-zinc-400">{masterCompressor.release.toFixed(0)} ms</span>
              </div>
              <Slider
                value={[masterCompressor.release]}
                onValueChange={(value) => onMasterCompressorChange("release", value[0])}
                min={0}
                max={1000}
                step={10}
                disabled={!masterCompressorEnabled}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
