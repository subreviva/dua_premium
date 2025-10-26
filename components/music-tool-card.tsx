"use client"

import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MusicToolCardProps {
  icon: LucideIcon
  title: string
  description: string
  credits: string
  category: "create" | "separate" | "improve" | "transform"
  delay?: number
  onClick?: () => void
}

const categoryColors = {
  create: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  separate: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  improve: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  transform: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
}

const categoryGlow = {
  create: "group-hover:shadow-purple-500/20",
  separate: "group-hover:shadow-blue-500/20",
  improve: "group-hover:shadow-green-500/20",
  transform: "group-hover:shadow-orange-500/20",
}

export default function MusicToolCard({
  icon: Icon,
  title,
  description,
  credits,
  category,
  delay = 0,
  onClick,
}: MusicToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group"
    >
      <div
        onClick={onClick}
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 cursor-pointer",
          "bg-gradient-to-br backdrop-blur-xl",
          "border transition-all duration-500",
          "hover:shadow-2xl",
          categoryColors[category],
          categoryGlow[category],
        )}
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 group-hover:border-primary/50 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
              {credits}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  )
}
