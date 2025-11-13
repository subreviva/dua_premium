"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Music, CheckCircle2, AlertCircle, X, Play, Download, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface GenerationTask {
  taskId: string
  status: string
  progress: number
  statusMessage: string
  tracks: any[]
  error?: string
  prompt: string
  model: string
  startTime: number
}

interface GenerationSidebarProps {
  tasks: GenerationTask[]
  onRemoveTask: (taskId: string) => void
  onViewTrack: (track: any) => void
}

export function GenerationSidebar({ tasks, onRemoveTask, onViewTrack }: GenerationSidebarProps) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (tasks.length === 0) return null

  const getStatusIcon = (status: string, progress: number) => {
    if (status === "SUCCESS") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
      )
    }
    if (status.includes("FAILED") || status.includes("ERROR")) {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
      )
    }
    return (
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        <Music className="h-4 w-4 text-blue-500" />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1 text-xs">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            Queued
          </Badge>
        )
      case "TEXT_SUCCESS":
        return (
          <Badge className="gap-1 bg-blue-500 text-xs">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Generating Audio
          </Badge>
        )
      case "FIRST_SUCCESS":
        return (
          <Badge className="gap-1 bg-purple-500 text-xs">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Creating Variations
          </Badge>
        )
      case "SUCCESS":
        return (
          <Badge className="bg-emerald-500 text-xs">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Complete
          </Badge>
        )
      default:
        if (status.includes("FAILED") || status.includes("ERROR")) {
          return (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              Failed
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  const getElapsedTime = (startTime: number) => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const mins = Math.floor(elapsed / 60)
    const secs = elapsed % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={`hidden md:block fixed right-0 top-0 z-30 h-screen border-l border-border/50 bg-background/98 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-full sm:w-96"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Generating Music</h2>
                  <p className="text-xs text-muted-foreground">
                    {tasks.length} active {tasks.length === 1 ? "task" : "tasks"}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-secondary/80"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {tasks.map((task) => (
                <Card
                  key={task.taskId}
                  className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm transition-all hover:shadow-lg"
                >
                  <div className="p-3 sm:p-4">
                    {/* Task Header */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(task.status, task.progress)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 mb-2">{task.prompt}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(task.status)}
                            <Badge variant="outline" className="text-xs">
                              {task.model}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {(task.status === "SUCCESS" || task.error) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-secondary/80"
                          onClick={() => onRemoveTask(task.taskId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {task.status !== "SUCCESS" && !task.error && (
                      <div className="mb-3 space-y-2">
                        <div className="relative h-2 overflow-hidden rounded-full bg-secondary/50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] shadow-lg shadow-blue-500/20 transition-all duration-500 animate-gradient"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">{task.statusMessage}</span>
                          <span className="font-mono text-muted-foreground">{getElapsedTime(task.startTime)}</span>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {task.error && (
                      <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-500 font-medium">{task.error}</p>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {task.status === "SUCCESS" && (
                      <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <p className="text-xs text-emerald-500 font-medium">
                            Generation complete! Tracks saved to library
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Generated Tracks */}
                    {task.tracks.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {task.tracks.length} {task.tracks.length === 1 ? "Variation" : "Variations"}
                          </p>
                          {task.status === "SUCCESS" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs rounded-full hover:bg-secondary/80"
                              onClick={() => router.push("/musicstudio/library")}
                            >
                              View in Library
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {task.tracks.slice(0, 2).map((track, index) => (
                            <div
                              key={index}
                              className="group flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-2 transition-all hover:bg-secondary/50 hover:shadow-md"
                            >
                              <div
                                className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cover bg-center shadow-sm ring-1 ring-border/30"
                                style={{
                                  backgroundImage: track.imageUrl ? `url(${track.imageUrl})` : "none",
                                  backgroundColor: !track.imageUrl ? "hsl(var(--primary) / 0.2)" : undefined,
                                }}
                              >
                                {!track.imageUrl && <Music className="h-5 w-5 text-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{track.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{Math.floor(track.duration)}s</span>
                                  {track.tags && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">{track.tags.split(",")[0]}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                  onClick={() => onViewTrack(track)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                                  onClick={() => {
                                    const link = document.createElement("a")
                                    link.href = track.audioUrl
                                    link.download = `${track.title}.mp3`
                                    link.target = "_blank"
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {task.tracks.length > 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 rounded-lg border-border/50 bg-secondary/30 text-xs hover:bg-secondary/60"
                              onClick={() => router.push("/musicstudio/library")}
                            >
                              View {task.tracks.length - 2} more{" "}
                              {task.tracks.length - 2 === 1 ? "variation" : "variations"}
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {isCollapsed && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20">
              <span className="text-2xl font-bold text-white">{tasks.length}</span>
            </div>
            <div className="h-px w-8 bg-border/50" />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-secondary/80"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
