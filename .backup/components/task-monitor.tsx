"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"

interface Task {
  taskId: string
  type: string
  status: "pending" | "processing" | "complete" | "error"
  progress?: number
  result?: any
}

export function TaskMonitor() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // Poll for task updates every 5 seconds
    const interval = setInterval(() => {
      tasks.forEach(async (task) => {
        if (task.status === "pending" || task.status === "processing") {
          try {
            const response = await fetch(`/api/suno/details/${task.taskId}`)
            const data = await response.json()

            if (data.code === 200) {
              setTasks((prev) =>
                prev.map((t) => (t.taskId === task.taskId ? { ...t, status: data.data.status, result: data.data } : t)),
              )
            }
          } catch (error) {
            // console.error("[v0] Task polling error:", error)
          }
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [tasks])

  const addTask = (taskId: string, type: string) => {
    setTasks((prev) => [...prev, { taskId, type, status: "pending" }])
  }

  if (tasks.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Tasks</CardTitle>
        <CardDescription>Monitor your music generation tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.taskId} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0">
              {task.status === "pending" && <Clock className="h-5 w-5 text-muted-foreground" />}
              {task.status === "processing" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              {task.status === "complete" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {task.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{task.type}</span>
                <Badge variant={task.status === "complete" ? "default" : "secondary"}>{task.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{task.taskId}</p>
              {task.status === "processing" && task.progress !== undefined && (
                <Progress value={task.progress} className="h-2" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
