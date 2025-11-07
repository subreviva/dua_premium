"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface AdvancedEffectsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stemName: string
  effects: {
    compressor: {
      enabled: boolean
      threshold: number
      ratio: number
      attack: number
      release: number
      knee: number
    }
    gate: {
      enabled: boolean
      threshold: number
      ratio: number
      attack: number
      release: number
    }
    distortion: {
      enabled: boolean
      amount: number
      mix: number
    }
    chorus: {
      enabled: boolean
      rate: number
      depth: number
      mix: number
    }
    flanger: {
      enabled: boolean
      rate: number
      depth: number
      feedback: number
      mix: number
    }
    phaser: {
      enabled: boolean
      rate: number
      depth: number
      stages: number
      mix: number
    }
  }
  onEffectChange: (effect: string, param: string, value: number | boolean) => void
}

export function AdvancedEffectsModal({
  open,
  onOpenChange,
  stemName,
  effects,
  onEffectChange,
}: AdvancedEffectsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Efeitos Avançados - {stemName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="compressor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compressor">Compressor</TabsTrigger>
            <TabsTrigger value="gate">Gate</TabsTrigger>
            <TabsTrigger value="distortion">Distortion</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-3 mt-2">
            <TabsTrigger value="chorus">Chorus</TabsTrigger>
            <TabsTrigger value="flanger">Flanger</TabsTrigger>
            <TabsTrigger value="phaser">Phaser</TabsTrigger>
          </TabsList>

          {/* Compressor */}
          <TabsContent value="compressor" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Ativar Compressor</Label>
              <Switch
                checked={effects.compressor.enabled}
                onCheckedChange={(checked) => onEffectChange("compressor", "enabled", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-4 opacity-100">
              <div>
                <Label>Threshold: {effects.compressor.threshold.toFixed(1)} dB</Label>
                <Slider
                  value={[effects.compressor.threshold]}
                  onValueChange={([value]) => onEffectChange("compressor", "threshold", value)}
                  min={-60}
                  max={0}
                  step={1}
                  disabled={!effects.compressor.enabled}
                />
              </div>
              <div>
                <Label>Ratio: {effects.compressor.ratio.toFixed(1)}:1</Label>
                <Slider
                  value={[effects.compressor.ratio]}
                  onValueChange={([value]) => onEffectChange("compressor", "ratio", value)}
                  min={1}
                  max={20}
                  step={0.5}
                  disabled={!effects.compressor.enabled}
                />
              </div>
              <div>
                <Label>Attack: {effects.compressor.attack.toFixed(3)} s</Label>
                <Slider
                  value={[effects.compressor.attack]}
                  onValueChange={([value]) => onEffectChange("compressor", "attack", value)}
                  min={0}
                  max={1}
                  step={0.001}
                  disabled={!effects.compressor.enabled}
                />
              </div>
              <div>
                <Label>Release: {effects.compressor.release.toFixed(2)} s</Label>
                <Slider
                  value={[effects.compressor.release]}
                  onValueChange={([value]) => onEffectChange("compressor", "release", value)}
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={!effects.compressor.enabled}
                />
              </div>
              <div>
                <Label>Knee: {effects.compressor.knee.toFixed(1)} dB</Label>
                <Slider
                  value={[effects.compressor.knee]}
                  onValueChange={([value]) => onEffectChange("compressor", "knee", value)}
                  min={0}
                  max={40}
                  step={1}
                  disabled={!effects.compressor.enabled}
                />
              </div>
            </div>
          </TabsContent>

          {/* Gate */}
          <TabsContent value="gate" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Ativar Gate</Label>
              <Switch
                checked={effects.gate.enabled}
                onCheckedChange={(checked) => onEffectChange("gate", "enabled", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label>Threshold: {effects.gate.threshold.toFixed(1)} dB</Label>
                <Slider
                  value={[effects.gate.threshold]}
                  onValueChange={([value]) => onEffectChange("gate", "threshold", value)}
                  min={-60}
                  max={0}
                  step={1}
                  disabled={!effects.gate.enabled}
                />
              </div>
              <div>
                <Label>Ratio: {effects.gate.ratio.toFixed(1)}:1</Label>
                <Slider
                  value={[effects.gate.ratio]}
                  onValueChange={([value]) => onEffectChange("gate", "ratio", value)}
                  min={1}
                  max={20}
                  step={0.5}
                  disabled={!effects.gate.enabled}
                />
              </div>
              <div>
                <Label>Attack: {effects.gate.attack.toFixed(3)} s</Label>
                <Slider
                  value={[effects.gate.attack]}
                  onValueChange={([value]) => onEffectChange("gate", "attack", value)}
                  min={0}
                  max={0.1}
                  step={0.001}
                  disabled={!effects.gate.enabled}
                />
              </div>
              <div>
                <Label>Release: {effects.gate.release.toFixed(2)} s</Label>
                <Slider
                  value={[effects.gate.release]}
                  onValueChange={([value]) => onEffectChange("gate", "release", value)}
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={!effects.gate.enabled}
                />
              </div>
            </div>
          </TabsContent>

          {/* Distortion */}
          <TabsContent value="distortion" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Ativar Distortion</Label>
              <Switch
                checked={effects.distortion.enabled}
                onCheckedChange={(checked) => onEffectChange("distortion", "enabled", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label>Amount: {effects.distortion.amount.toFixed(0)}</Label>
                <Slider
                  value={[effects.distortion.amount]}
                  onValueChange={([value]) => onEffectChange("distortion", "amount", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.distortion.enabled}
                />
              </div>
              <div>
                <Label>Mix: {effects.distortion.mix.toFixed(0)}%</Label>
                <Slider
                  value={[effects.distortion.mix]}
                  onValueChange={([value]) => onEffectChange("distortion", "mix", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.distortion.enabled}
                />
              </div>
            </div>
          </TabsContent>

          {/* Chorus */}
          <TabsContent value="chorus" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Ativar Chorus</Label>
              <Switch
                checked={effects.chorus.enabled}
                onCheckedChange={(checked) => onEffectChange("chorus", "enabled", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label>Rate: {effects.chorus.rate.toFixed(2)} Hz</Label>
                <Slider
                  value={[effects.chorus.rate]}
                  onValueChange={([value]) => onEffectChange("chorus", "rate", value)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  disabled={!effects.chorus.enabled}
                />
              </div>
              <div>
                <Label>Depth: {effects.chorus.depth.toFixed(0)}%</Label>
                <Slider
                  value={[effects.chorus.depth]}
                  onValueChange={([value]) => onEffectChange("chorus", "depth", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.chorus.enabled}
                />
              </div>
              <div>
                <Label>Mix: {effects.chorus.mix.toFixed(0)}%</Label>
                <Slider
                  value={[effects.chorus.mix]}
                  onValueChange={([value]) => onEffectChange("chorus", "mix", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.chorus.enabled}
                />
              </div>
            </div>
          </TabsContent>

          {/* Flanger */}
          <TabsContent value="flanger" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Ativar Flanger</Label>
              <Switch
                checked={effects.flanger.enabled}
                onCheckedChange={(checked) => onEffectChange("flanger", "enabled", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label>Rate: {effects.flanger.rate.toFixed(2)} Hz</Label>
                <Slider
                  value={[effects.flanger.rate]}
                  onValueChange={([value]) => onEffectChange("flanger", "rate", value)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  disabled={!effects.flanger.enabled}
                />
              </div>
              <div>
                <Label>Depth: {effects.flanger.depth.toFixed(0)}%</Label>
                <Slider
                  value={[effects.flanger.depth]}
                  onValueChange={([value]) => onEffectChange("flanger", "depth", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.flanger.enabled}
                />
              </div>
              <div>
                <Label>Feedback: {effects.flanger.feedback.toFixed(0)}%</Label>
                <Slider
                  value={[effects.flanger.feedback]}
                  onValueChange={([value]) => onEffectChange("flanger", "feedback", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.flanger.enabled}
                />
              </div>
              <div>
                <Label>Mix: {effects.flanger.mix.toFixed(0)}%</Label>
                <Slider
                  value={[effects.flanger.mix]}
                  onValueChange={([value]) => onEffectChange("flanger", "mix", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.flanger.enabled}
                />
              </div>
            </div>
          </TabsContent>

          {/* Phaser */}
          <TabsContent value="phaser" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Ativar Phaser</Label>
              <Switch
                checked={effects.phaser.enabled}
                onCheckedChange={(checked) => onEffectChange("phaser", "enabled", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label>Rate: {effects.phaser.rate.toFixed(2)} Hz</Label>
                <Slider
                  value={[effects.phaser.rate]}
                  onValueChange={([value]) => onEffectChange("phaser", "rate", value)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  disabled={!effects.phaser.enabled}
                />
              </div>
              <div>
                <Label>Depth: {effects.phaser.depth.toFixed(0)}%</Label>
                <Slider
                  value={[effects.phaser.depth]}
                  onValueChange={([value]) => onEffectChange("phaser", "depth", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.phaser.enabled}
                />
              </div>
              <div>
                <Label>Stages: {effects.phaser.stages}</Label>
                <Slider
                  value={[effects.phaser.stages]}
                  onValueChange={([value]) => onEffectChange("phaser", "stages", value)}
                  min={2}
                  max={12}
                  step={2}
                  disabled={!effects.phaser.enabled}
                />
              </div>
              <div>
                <Label>Mix: {effects.phaser.mix.toFixed(0)}%</Label>
                <Slider
                  value={[effects.phaser.mix]}
                  onValueChange={([value]) => onEffectChange("phaser", "mix", value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!effects.phaser.enabled}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
