"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Music4 } from "lucide-react"

interface MetronomeProps {
  bpm: number
  onBpmChange: (bpm: number) => void
  isPlaying: boolean
}

export function Metronome({ bpm, onBpmChange, isPlaying }: MetronomeProps) {
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(50)
  const audioContextRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const timerIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (enabled && isPlaying) {
      startMetronome()
    } else {
      stopMetronome()
    }

    return () => stopMetronome()
  }, [enabled, isPlaying, bpm])

  const playClick = (time: number, isDownbeat: boolean) => {
    const audioContext = audioContextRef.current
    if (!audioContext) return

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Downbeat is higher pitch
    oscillator.frequency.value = isDownbeat ? 1000 : 800
    gainNode.gain.value = (volume / 100) * 0.3

    oscillator.start(time)
    oscillator.stop(time + 0.05)
  }

  const scheduler = () => {
    const audioContext = audioContextRef.current
    if (!audioContext) return

    const scheduleAheadTime = 0.1
    const currentTime = audioContext.currentTime

    while (nextNoteTimeRef.current < currentTime + scheduleAheadTime) {
      const beatNumber = Math.floor((nextNoteTimeRef.current * bpm) / 60) % 4
      playClick(nextNoteTimeRef.current, beatNumber === 0)
      nextNoteTimeRef.current += 60 / bpm
    }

    timerIdRef.current = window.setTimeout(scheduler, 25)
  }

  const startMetronome = () => {
    const audioContext = audioContextRef.current
    if (!audioContext) return

    nextNoteTimeRef.current = audioContext.currentTime
    scheduler()
  }

  const stopMetronome = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current)
      timerIdRef.current = null
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={enabled ? "default" : "ghost"}
        size="sm"
        onClick={() => setEnabled(!enabled)}
        className="h-7 gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Music4 className="h-3 w-3" />
        Click
      </Button>

      {enabled && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono">VOL</span>
            <div className="w-16">
              <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} className="w-full" />
            </div>
            <span className="text-[10px] text-zinc-400 tabular-nums w-8">{volume}%</span>
          </div>
        </>
      )}
    </div>
  )
}
