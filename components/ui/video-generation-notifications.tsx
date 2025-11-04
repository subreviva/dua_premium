"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useVideoGeneration } from "@/contexts/video-generation-context"
import { cn } from "@/lib/utils"
import { 
  Video, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Eye,
  Clock,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function VideoGenerationNotifications() {
  const { jobs, removeJob, getActiveJobs } = useVideoGeneration()
  const [isMinimized, setIsMinimized] = useState(false)
  const activeJobs = getActiveJobs()

  // Auto-expand when new jobs are added
  useEffect(() => {
    if (activeJobs.length > 0) {
      setIsMinimized(false)
    }
  }, [activeJobs.length])

  if (jobs.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className="fixed bottom-6 right-6 z-50 w-80"
    >
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-t-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Video Studio</h3>
              <p className="text-gray-400 text-xs">
                {activeJobs.length > 0 
                  ? `${activeJobs.length} gerando...` 
                  : "Todas as gerações concluídas"
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            {isMinimized ? (
              <motion.div
                initial={{ rotate: 180 }}
                animate={{ rotate: 0 }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <motion.div
                animate={{ rotate: isMinimized ? 0 : 180 }}
                className="w-4 h-4"
              >
                ↓
              </motion.div>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/95 backdrop-blur-xl border-x border-b border-white/10 rounded-b-2xl overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto p-4 space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <JobItem key={job.id} job={job} onRemove={removeJob} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function JobItem({ 
  job, 
  onRemove 
}: { 
  job: any
  onRemove: (id: string) => void 
}) {
  const getStatusIcon = () => {
    switch (job.status) {
      case "processing":
        return (
          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        )
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />
    }
  }

  const getStatusColor = () => {
    switch (job.status) {
      case "processing":
        return "bg-purple-500/20 border-purple-500/30"
      case "completed":
        return "bg-green-500/20 border-green-500/30"
      case "error":
        return "bg-red-500/20 border-red-500/30"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "p-3 rounded-xl border backdrop-blur-sm",
        getStatusColor()
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {job.prompt}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {job.model}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">
              {job.status === "processing" && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.progress}%
                </span>
              )}
              {job.status === "completed" && "Concluído"}
              {job.status === "error" && "Erro"}
            </span>
          </div>
          
          {/* Progress Bar for Processing */}
          {job.status === "processing" && (
            <div className="mt-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${job.progress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {job.status === "completed" && job.videoUrl && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => window.open(job.videoUrl, '_blank')}
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = job.videoUrl!
                  link.download = `video-${job.id}.mp4`
                  link.click()
                }}
              >
                <Download className="w-3 h-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={() => onRemove(job.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}