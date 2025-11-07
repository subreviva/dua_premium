"use client"

import { useStems } from "@/contexts/stems-context"
import { Music2, Monitor } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function StemsIndicator() {
  const { tasks, isProcessing, markNotificationShown } = useStems()
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(false)
  const [completedTask, setCompletedTask] = useState<{ id: string; trackId: string } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const newCompletedTask = tasks.find((task) => task.status === "completed" && !task.notificationShown)
    if (newCompletedTask) {
      setCompletedTask({ id: newCompletedTask.id, trackId: newCompletedTask.trackId })
      setShowNotification(true)
      markNotificationShown(newCompletedTask.id)
    }
  }, [tasks, markNotificationShown])

  const processingTask = tasks.find((task) => task.status === "processing")

  if (processingTask && !isMobile) {
    return (
      <button
        onClick={() => router.push(`/stems/${processingTask.trackId}`)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-pink-500/30 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-fuchsia-500/20 shadow-lg shadow-pink-500/20 backdrop-blur-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-pink-500/30 md:bottom-6"
        aria-label="Stem separation in progress"
      >
        <div className="relative">
          <Music2 className="h-6 w-6 text-pink-500" />
          <div className="absolute inset-0 animate-ping rounded-full bg-pink-500/30" />
        </div>
      </button>
    )
  }

  return (
    <Dialog open={showNotification} onOpenChange={setShowNotification}>
      <DialogContent className="max-w-sm border-pink-500/20 bg-gradient-to-br from-background via-background to-pink-500/5">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-fuchsia-500/20">
            {isMobile ? <Monitor className="h-8 w-8 text-pink-500" /> : <Music2 className="h-8 w-8 text-pink-500" />}
          </div>
          <DialogTitle className="text-center text-xl">Stems Prontos!</DialogTitle>
          <DialogDescription className="text-center">
            {isMobile
              ? "A separação de stems foi concluída. Os stems estão disponíveis nos detalhes da faixa."
              : "A separação de stems foi concluída com sucesso. Suas faixas estão prontas para usar."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {isMobile ? (
            <>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                <p className="text-sm text-amber-500/90 font-light">
                  Para melhor experiência, aceda esta página num computador
                </p>
              </div>
              <Button
                onClick={() => setShowNotification(false)}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 hover:opacity-90"
              >
                Ver Stems nos Detalhes
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setShowNotification(false)
                  if (completedTask) {
                    router.push(`/stems/${completedTask.trackId}`)
                  }
                }}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 hover:opacity-90"
              >
                Abrir Estúdio de Stems
              </Button>
              <Button onClick={() => setShowNotification(false)} variant="ghost" className="w-full">
                Fechar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
