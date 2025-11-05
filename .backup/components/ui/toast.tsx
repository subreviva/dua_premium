"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast, onClose])

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  }

  const colors = {
    success: "bg-green-900/90 border-green-700",
    error: "bg-red-900/90 border-red-700",
    warning: "bg-yellow-900/90 border-yellow-700",
    info: "bg-blue-900/90 border-blue-700"
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border backdrop-blur-xl shadow-lg",
        "animate-in slide-in-from-right duration-300",
        colors[toast.type]
      )}
    >
      <span className="text-xl">{icons[toast.type]}</span>
      <p className="flex-1 text-sm text-white">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/60 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = "info", duration?: number) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return {
    toasts,
    showToast,
    closeToast,
    success: (message: string, duration?: number) => showToast(message, "success", duration),
    error: (message: string, duration?: number) => showToast(message, "error", duration),
    warning: (message: string, duration?: number) => showToast(message, "warning", duration),
    info: (message: string, duration?: number) => showToast(message, "info", duration),
  }
}
