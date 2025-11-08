"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface MusicStudioHeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  className?: string
}

export function MusicStudioHeader({
  title = "Music Studio",
  subtitle,
  showBackButton = true,
  className,
}: MusicStudioHeaderProps) {
  const router = useRouter()

  return (
    <div className={cn("flex items-center gap-4 px-6 py-4", className)}>
      {/* Back Button */}
      {showBackButton && (
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-sidebar-accent/50 transition-all duration-200 hover:scale-110"
          aria-label="Voltar para página anterior"
          title="Voltar (Alt + ←)"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Title & Subtitle */}
      <div className="flex-1">
        {title && <h1 className="text-lg font-light text-foreground">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground/60">{subtitle}</p>}
      </div>

      {/* Quick Exit Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-xs hover:bg-sidebar-accent/50 transition-all duration-200"
          aria-label="Ir para página inicial"
          title="Home (Alt + H)"
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Home</span>
        </Button>

        <Button
          onClick={() => router.push("/chat")}
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-xs hover:bg-sidebar-accent/50 transition-all duration-200"
          aria-label="Ir para chat"
          title="Chat (Alt + C)"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chat</span>
        </Button>
      </div>
    </div>
  )
}
