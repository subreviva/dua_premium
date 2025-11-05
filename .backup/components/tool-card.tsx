"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
  onClick?: () => void
}

export default function ToolCard({ icon: Icon, title, description, delay = 0, onClick }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className={cn(
        "relative group p-6 rounded-2xl",
        "bg-card/50 backdrop-blur-sm border border-border",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:bg-card/70 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="p-3 rounded-xl bg-primary/10 w-fit transition-colors group-hover:bg-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
