"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, FolderOpen, X } from "lucide-react"

export interface EffectPreset {
  name: string
  settings: Record<string, number>
}

interface EffectPresetsProps {
  effectType: "eq" | "delay" | "reverb"
  currentSettings: Record<string, number>
  onLoadPreset: (settings: Record<string, number>) => void
  factoryPresets: EffectPreset[]
}

export function EffectPresets({ effectType, currentSettings, onLoadPreset, factoryPresets }: EffectPresetsProps) {
  const [showPresets, setShowPresets] = useState(false)
  const [customPresets, setCustomPresets] = useState<EffectPreset[]>([])
  const [presetName, setPresetName] = useState("")
  const [showSave, setShowSave] = useState(false)

  const savePreset = () => {
    if (!presetName.trim()) return

    const newPreset: EffectPreset = {
      name: presetName,
      settings: { ...currentSettings },
    }

    setCustomPresets([...customPresets, newPreset])
    setPresetName("")
    setShowSave(false)
  }

  const loadPreset = (preset: EffectPreset) => {
    onLoadPreset(preset.settings)
    setShowPresets(false)
  }

  const deletePreset = (index: number) => {
    setCustomPresets(customPresets.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSave(!showSave)}
          className="flex-1 h-7 text-xs bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPresets(!showPresets)}
          className="flex-1 h-7 text-xs bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700"
        >
          <FolderOpen className="w-3 h-3 mr-1" />
          Load
        </Button>
      </div>

      {showSave && (
        <div className="p-2 bg-black/40 rounded border border-zinc-800/50 space-y-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full px-2 py-1 text-xs bg-zinc-900/50 border border-zinc-800 rounded focus:outline-none focus:border-zinc-700"
            onKeyDown={(e) => e.key === "Enter" && savePreset()}
          />
          <Button size="sm" onClick={savePreset} disabled={!presetName.trim()} className="w-full h-6 text-xs">
            Save Preset
          </Button>
        </div>
      )}

      {showPresets && (
        <div className="p-2 bg-black/40 rounded border border-zinc-800/50 space-y-1 max-h-48 overflow-y-auto">
          {factoryPresets.length > 0 && (
            <>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Factory</div>
              {factoryPresets.map((preset, index) => (
                <button
                  key={`factory-${index}`}
                  onClick={() => loadPreset(preset)}
                  className="w-full px-2 py-1 text-xs text-left bg-zinc-900/50 hover:bg-zinc-800 rounded transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </>
          )}

          {customPresets.length > 0 && (
            <>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 mt-2">Custom</div>
              {customPresets.map((preset, index) => (
                <div
                  key={`custom-${index}`}
                  className="flex items-center gap-1 bg-zinc-900/50 hover:bg-zinc-800 rounded transition-colors"
                >
                  <button onClick={() => loadPreset(preset)} className="flex-1 px-2 py-1 text-xs text-left">
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deletePreset(index)}
                    className="px-2 py-1 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </>
          )}

          {factoryPresets.length === 0 && customPresets.length === 0 && (
            <div className="text-xs text-zinc-500 text-center py-2">No presets available</div>
          )}
        </div>
      )}
    </div>
  )
}
