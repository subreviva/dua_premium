"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MasterEffectsPanel } from "@/components/master-effects-panel"
import { StereoMeters } from "@/components/stereo-meters"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface MasterEffectsModalProps {
  isOpen: boolean
  onClose: () => void
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
  masterEQEnabled: boolean
  masterCompressorEnabled: boolean
  limiterEnabled: boolean
  limiterThreshold: number
  onMasterEQChange: (band: string, value: number) => void
  onMasterCompressorChange: (param: string, value: number) => void
  onMasterEQToggle: () => void
  onMasterCompressorToggle: () => void
  onLimiterToggle: () => void
  onLimiterThresholdChange: (value: number) => void
  audioContext: AudioContext | null
  sourceNode: GainNode | null
}

export function MasterEffectsModal({
  isOpen,
  onClose,
  masterEQ,
  masterCompressor,
  masterEQEnabled,
  masterCompressorEnabled,
  limiterEnabled,
  limiterThreshold,
  onMasterEQChange,
  onMasterCompressorChange,
  onMasterEQToggle,
  onMasterCompressorToggle,
  onLimiterToggle,
  onLimiterThresholdChange,
  audioContext,
  sourceNode,
}: MasterEffectsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white font-light">Master Effects & Metering</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Stereo Meters */}
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
            <h3 className="text-sm text-zinc-400 mb-3">Stereo Field</h3>
            <StereoMeters audioContext={audioContext} sourceNode={sourceNode} />
          </div>

          {/* Limiter */}
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-zinc-400">Master Limiter</h3>
              <Button
                variant={limiterEnabled ? "default" : "ghost"}
                size="sm"
                onClick={onLimiterToggle}
                className="h-7 w-16 text-xs transition-all duration-200"
              >
                {limiterEnabled ? "ON" : "OFF"}
              </Button>
            </div>
            {limiterEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Threshold</span>
                  <span className="text-xs text-zinc-400 tabular-nums">{limiterThreshold}dB</span>
                </div>
                <Slider
                  value={[limiterThreshold]}
                  onValueChange={(value) => onLimiterThresholdChange(value[0])}
                  min={-12}
                  max={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Master EQ & Compressor */}
          <MasterEffectsPanel
            masterEQ={masterEQ}
            masterCompressor={masterCompressor}
            onMasterEQChange={onMasterEQChange}
            onMasterCompressorChange={onMasterCompressorChange}
            masterEQEnabled={masterEQEnabled}
            masterCompressorEnabled={masterCompressorEnabled}
            onMasterEQToggle={onMasterEQToggle}
            onMasterCompressorToggle={onMasterCompressorToggle}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
