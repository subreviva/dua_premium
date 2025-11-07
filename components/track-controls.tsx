"use client"

import { Button } from "@/components/ui/button"

const onOpenEffects = () => {
  // Function implementation here
}

const onOpenAdvancedEffects = () => {
  // Function implementation here
}

const variant = "ghost"
const size = "sm"
const className =
  "w-full h-6 text-[10px] text-zinc-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
const FX = "FX"

const TrackControls = () => {
  return (
    <div>
      <Button variant={variant} size={size} onClick={onOpenEffects} className={className}>
        {FX}
      </Button>

      <Button variant={variant} size={size} onClick={onOpenAdvancedEffects} className={className}>
        FX+
      </Button>
    </div>
  )
}

export default TrackControls
