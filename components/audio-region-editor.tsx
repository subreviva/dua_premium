"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Scissors, Trash2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Region {
  id: string
  start: number
  end: number
  label?: string
}

interface AudioRegionEditorProps {
  stemId: string
  stemName: string
  duration: number
  currentTime: number
  regions: Region[]
  onUpdateRegions: (regions: Region[]) => void
}

export function AudioRegionEditor({
  stemId,
  stemName,
  duration,
  currentTime,
  regions,
  onUpdateRegions,
}: AudioRegionEditorProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [showAddMarker, setShowAddMarker] = useState(false)
  const [markerLabel, setMarkerLabel] = useState("")

  // Split region at current time
  const handleSplit = () => {
    if (!selectedRegionId) return

    const region = regions.find((r) => r.id === selectedRegionId)
    if (!region) return

    // Check if current time is within the region
    if (currentTime <= region.start || currentTime >= region.end) {
      alert("O tempo atual deve estar dentro da região selecionada")
      return
    }

    // Create two new regions
    const newRegions = regions.filter((r) => r.id !== selectedRegionId)
    newRegions.push(
      {
        id: `${stemId}-region-${Date.now()}-1`,
        start: region.start,
        end: currentTime,
        label: region.label ? `${region.label} (1)` : undefined,
      },
      {
        id: `${stemId}-region-${Date.now()}-2`,
        start: currentTime,
        end: region.end,
        label: region.label ? `${region.label} (2)` : undefined,
      },
    )

    onUpdateRegions(newRegions.sort((a, b) => a.start - b.start))
    setSelectedRegionId(null)
  }

  // Delete selected region
  const handleDelete = () => {
    if (!selectedRegionId) return

    const newRegions = regions.filter((r) => r.id !== selectedRegionId)
    onUpdateRegions(newRegions)
    setSelectedRegionId(null)
  }

  // Add section marker at current time
  const handleAddMarker = () => {
    if (!markerLabel.trim()) return

    // Find the region that contains the current time
    const containingRegion = regions.find((r) => currentTime >= r.start && currentTime <= r.end)

    if (containingRegion) {
      // Update the label of the containing region
      const newRegions = regions.map((r) => (r.id === containingRegion.id ? { ...r, label: markerLabel } : r))
      onUpdateRegions(newRegions)
    } else {
      // Create a new region from current time to end
      const newRegion: Region = {
        id: `${stemId}-region-${Date.now()}`,
        start: currentTime,
        end: duration,
        label: markerLabel,
      }
      onUpdateRegions([...regions, newRegion].sort((a, b) => a.start - b.start))
    }

    setMarkerLabel("")
    setShowAddMarker(false)
  }

  // Trim region start
  const handleTrimStart = (regionId: string, newStart: number) => {
    const newRegions = regions.map((r) =>
      r.id === regionId ? { ...r, start: Math.max(0, Math.min(newStart, r.end - 0.1)) } : r,
    )
    onUpdateRegions(newRegions)
  }

  // Trim region end
  const handleTrimEnd = (regionId: string, newEnd: number) => {
    const newRegions = regions.map((r) =>
      r.id === regionId ? { ...r, end: Math.min(duration, Math.max(newEnd, r.start + 0.1)) } : r,
    )
    onUpdateRegions(newRegions)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      {/* Editing tools */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSplit}
          disabled={!selectedRegionId}
          size="sm"
          variant="outline"
          className="gap-2 bg-transparent"
        >
          <Scissors className="h-4 w-4" />
          Dividir
        </Button>

        <Button
          onClick={handleDelete}
          disabled={!selectedRegionId}
          size="sm"
          variant="outline"
          className="gap-2 bg-transparent"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>

        <Button onClick={() => setShowAddMarker(true)} size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Marcador
        </Button>
      </div>

      {/* Regions list */}
      <div className="space-y-2">
        <Label className="text-xs text-zinc-400">Regiões de {stemName}</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {regions.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhuma região. O áudio completo será reproduzido.</p>
          ) : (
            regions.map((region) => (
              <div
                key={region.id}
                onClick={() => setSelectedRegionId(region.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRegionId === region.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{region.label || "Sem nome"}</span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {formatTime(region.start)} - {formatTime(region.end)}
                  </span>
                </div>

                {selectedRegionId === region.id && (
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <Label className="text-[10px] text-zinc-500">Início</Label>
                      <Input
                        type="number"
                        value={region.start.toFixed(2)}
                        onChange={(e) => handleTrimStart(region.id, Number.parseFloat(e.target.value))}
                        step="0.1"
                        min="0"
                        max={region.end}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-zinc-500">Fim</Label>
                      <Input
                        type="number"
                        value={region.end.toFixed(2)}
                        onChange={(e) => handleTrimEnd(region.id, Number.parseFloat(e.target.value))}
                        step="0.1"
                        min={region.start}
                        max={duration}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add marker dialog */}
      <Dialog open={showAddMarker} onOpenChange={setShowAddMarker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Marcador de Secção</DialogTitle>
            <DialogDescription>Adicione um marcador no tempo atual ({formatTime(currentTime)})</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome da Secção</Label>
              <Input
                value={markerLabel}
                onChange={(e) => setMarkerLabel(e.target.value)}
                placeholder="ex: Intro, Verso 1, Refrão, Ponte, Outro"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddMarker()
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddMarker} disabled={!markerLabel.trim()} className="flex-1">
                Adicionar
              </Button>
              <Button onClick={() => setShowAddMarker(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
