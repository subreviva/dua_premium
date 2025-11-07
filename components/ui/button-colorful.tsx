import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: LucideIcon
  iconClassName?: string
}

export function ButtonColorful({
  className,
  label = "Explore Components",
  icon: Icon,
  iconClassName,
  ...props
}: ButtonColorfulProps) {
  const IconComponent = Icon || ArrowUpRight

  return (
    <Button
      className={cn(
        "relative h-10 px-4 overflow-hidden",
        "bg-zinc-900 dark:bg-zinc-100",
        "transition-all duration-200",
        "group",
        className,
      )}
      {...props}
    >
      {/* Gradient background effect */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
          "opacity-40 group-hover:opacity-80 group-active:opacity-90",
          "blur transition-opacity duration-500",
        )}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        <span className="text-white dark:text-zinc-900">{label}</span>
        <IconComponent className={cn("w-3.5 h-3.5 text-white/90 dark:text-zinc-900/90", iconClassName)} />
      </div>
    </Button>
  )
}
