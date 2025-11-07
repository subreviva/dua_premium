"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EQModule } from "@/components/effect-modules/eq-module"
import { DelayModule } from "@/components/effect-modules/delay-module"
import { ReverbModule } from "@/components/effect-modules/reverb-module"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface TrackEffectsModalProps {
  isOpen: boolean
  onClose: () => void
  trackName: string
  trackColor: string
  effects: {
    reverb: number
    delay: {
      time: number
      feedback: number
      mix: number
    }
    eq: {
      low: number
      mid: number
      high: number
    }
  }
  effectsBypassed: {
    reverb: boolean
    delay: boolean
    eq: boolean
  }
  onEffectsChange: (effects: any) => void
  onEffectBypassToggle: (effect: "reverb" | "delay" | "eq") => void
}

export function TrackEffectsModal({
  isOpen,
  onClose,
  trackName,
  trackColor,
  effects,
  effectsBypassed,
  onEffectsChange,
  onEffectBypassToggle,
}: TrackEffectsModalProps) {
  const [advancedEffects, setAdvancedEffects] = useState({
    compressor: {
      enabled: false,
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      knee: 30,
    },
    gate: {
      enabled: false,
      threshold: -50,
      ratio: 12,
    },
    distortion: {
      enabled: false,
      amount: 50,
      mix: 50,
    },
    chorus: {
      enabled: false,
      rate: 1.5,
      depth: 0.5,
      mix: 50,
    },
    flanger: {
      enabled: false,
      rate: 0.5,
      depth: 0.5,
      feedback: 0.5,
      mix: 50,
    },
    phaser: {
      enabled: false,
      rate: 0.5,
      depth: 0.5,
      stages: 4,
      mix: 50,
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: trackColor }} />
            <span className="text-white font-light">{trackName} - Efeitos</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger value="basic">Efeitos Básicos</TabsTrigger>
            <TabsTrigger value="advanced">Efeitos Avançados</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
            {/* EQ Module */}
            <EQModule
              low={effects.eq.low}
              mid={effects.eq.mid}
              high={effects.eq.high}
              onLowChange={(value) =>
                onEffectsChange({
                  ...effects,
                  eq: { ...effects.eq, low: value },
                })
              }
              onMidChange={(value) =>
                onEffectsChange({
                  ...effects,
                  eq: { ...effects.eq, mid: value },
                })
              }
              onHighChange={(value) =>
                onEffectsChange({
                  ...effects,
                  eq: { ...effects.eq, high: value },
                })
              }
              bypassed={effectsBypassed.eq}
              onBypassToggle={() => onEffectBypassToggle("eq")}
            />

            {/* Delay Module */}
            <DelayModule
              time={effects.delay.time}
              feedback={effects.delay.feedback}
              mix={effects.delay.mix}
              onTimeChange={(value) =>
                onEffectsChange({
                  ...effects,
                  delay: { ...effects.delay, time: value },
                })
              }
              onFeedbackChange={(value) =>
                onEffectsChange({
                  ...effects,
                  delay: { ...effects.delay, feedback: value },
                })
              }
              onMixChange={(value) =>
                onEffectsChange({
                  ...effects,
                  delay: { ...effects.delay, mix: value },
                })
              }
              bypassed={effectsBypassed.delay}
              onBypassToggle={() => onEffectBypassToggle("delay")}
            />

            {/* Reverb Module */}
            <ReverbModule
              value={effects.reverb}
              onChange={(value) =>
                onEffectsChange({
                  ...effects,
                  reverb: value,
                })
              }
              bypassed={effectsBypassed.reverb}
              onBypassToggle={() => onEffectBypassToggle("reverb")}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
            {/* Compressor */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-white">Compressor</Label>
                <Switch
                  checked={advancedEffects.compressor.enabled}
                  onCheckedChange={(checked) =>
                    setAdvancedEffects({
                      ...advancedEffects,
                      compressor: { ...advancedEffects.compressor, enabled: checked },
                    })
                  }
                />
              </div>
              {advancedEffects.compressor.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Threshold: {advancedEffects.compressor.threshold}dB</Label>
                    <Slider
                      value={[advancedEffects.compressor.threshold]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          compressor: { ...advancedEffects.compressor, threshold: value },
                        })
                      }
                      min={-60}
                      max={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Ratio: {advancedEffects.compressor.ratio}:1</Label>
                    <Slider
                      value={[advancedEffects.compressor.ratio]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          compressor: { ...advancedEffects.compressor, ratio: value },
                        })
                      }
                      min={1}
                      max={20}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-zinc-400">
                        Attack: {(advancedEffects.compressor.attack * 1000).toFixed(1)}ms
                      </Label>
                      <Slider
                        value={[advancedEffects.compressor.attack * 1000]}
                        onValueChange={([value]) =>
                          setAdvancedEffects({
                            ...advancedEffects,
                            compressor: { ...advancedEffects.compressor, attack: value / 1000 },
                          })
                        }
                        min={0}
                        max={100}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400">
                        Release: {(advancedEffects.compressor.release * 1000).toFixed(0)}ms
                      </Label>
                      <Slider
                        value={[advancedEffects.compressor.release * 1000]}
                        onValueChange={([value]) =>
                          setAdvancedEffects({
                            ...advancedEffects,
                            compressor: { ...advancedEffects.compressor, release: value / 1000 },
                          })
                        }
                        min={0}
                        max={1000}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Gate */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-white">Gate</Label>
                <Switch
                  checked={advancedEffects.gate.enabled}
                  onCheckedChange={(checked) =>
                    setAdvancedEffects({
                      ...advancedEffects,
                      gate: { ...advancedEffects.gate, enabled: checked },
                    })
                  }
                />
              </div>
              {advancedEffects.gate.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Threshold: {advancedEffects.gate.threshold}dB</Label>
                    <Slider
                      value={[advancedEffects.gate.threshold]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          gate: { ...advancedEffects.gate, threshold: value },
                        })
                      }
                      min={-80}
                      max={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Distortion */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-white">Distortion</Label>
                <Switch
                  checked={advancedEffects.distortion.enabled}
                  onCheckedChange={(checked) =>
                    setAdvancedEffects({
                      ...advancedEffects,
                      distortion: { ...advancedEffects.distortion, enabled: checked },
                    })
                  }
                />
              </div>
              {advancedEffects.distortion.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Amount: {advancedEffects.distortion.amount}%</Label>
                    <Slider
                      value={[advancedEffects.distortion.amount]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          distortion: { ...advancedEffects.distortion, amount: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Mix: {advancedEffects.distortion.mix}%</Label>
                    <Slider
                      value={[advancedEffects.distortion.mix]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          distortion: { ...advancedEffects.distortion, mix: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Chorus */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-white">Chorus</Label>
                <Switch
                  checked={advancedEffects.chorus.enabled}
                  onCheckedChange={(checked) =>
                    setAdvancedEffects({
                      ...advancedEffects,
                      chorus: { ...advancedEffects.chorus, enabled: checked },
                    })
                  }
                />
              </div>
              {advancedEffects.chorus.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Rate: {advancedEffects.chorus.rate.toFixed(2)}Hz</Label>
                    <Slider
                      value={[advancedEffects.chorus.rate]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          chorus: { ...advancedEffects.chorus, rate: value },
                        })
                      }
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">
                      Depth: {(advancedEffects.chorus.depth * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[advancedEffects.chorus.depth * 100]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          chorus: { ...advancedEffects.chorus, depth: value / 100 },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Mix: {advancedEffects.chorus.mix}%</Label>
                    <Slider
                      value={[advancedEffects.chorus.mix]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          chorus: { ...advancedEffects.chorus, mix: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Flanger */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-white">Flanger</Label>
                <Switch
                  checked={advancedEffects.flanger.enabled}
                  onCheckedChange={(checked) =>
                    setAdvancedEffects({
                      ...advancedEffects,
                      flanger: { ...advancedEffects.flanger, enabled: checked },
                    })
                  }
                />
              </div>
              {advancedEffects.flanger.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Rate: {advancedEffects.flanger.rate.toFixed(2)}Hz</Label>
                    <Slider
                      value={[advancedEffects.flanger.rate]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          flanger: { ...advancedEffects.flanger, rate: value },
                        })
                      }
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">
                      Depth: {(advancedEffects.flanger.depth * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[advancedEffects.flanger.depth * 100]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          flanger: { ...advancedEffects.flanger, depth: value / 100 },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">
                      Feedback: {(advancedEffects.flanger.feedback * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[advancedEffects.flanger.feedback * 100]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          flanger: { ...advancedEffects.flanger, feedback: value / 100 },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Mix: {advancedEffects.flanger.mix}%</Label>
                    <Slider
                      value={[advancedEffects.flanger.mix]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          flanger: { ...advancedEffects.flanger, mix: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Phaser */}
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-white">Phaser</Label>
                <Switch
                  checked={advancedEffects.phaser.enabled}
                  onCheckedChange={(checked) =>
                    setAdvancedEffects({
                      ...advancedEffects,
                      phaser: { ...advancedEffects.phaser, enabled: checked },
                    })
                  }
                />
              </div>
              {advancedEffects.phaser.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-zinc-400">Rate: {advancedEffects.phaser.rate.toFixed(2)}Hz</Label>
                    <Slider
                      value={[advancedEffects.phaser.rate]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          phaser: { ...advancedEffects.phaser, rate: value },
                        })
                      }
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">
                      Depth: {(advancedEffects.phaser.depth * 100).toFixed(0)}%
                    </Label>
                    <Slider
                      value={[advancedEffects.phaser.depth * 100]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          phaser: { ...advancedEffects.phaser, depth: value / 100 },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Stages: {advancedEffects.phaser.stages}</Label>
                    <Slider
                      value={[advancedEffects.phaser.stages]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          phaser: { ...advancedEffects.phaser, stages: value },
                        })
                      }
                      min={2}
                      max={12}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-400">Mix: {advancedEffects.phaser.mix}%</Label>
                    <Slider
                      value={[advancedEffects.phaser.mix]}
                      onValueChange={([value]) =>
                        setAdvancedEffects({
                          ...advancedEffects,
                          phaser: { ...advancedEffects.phaser, mix: value },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
