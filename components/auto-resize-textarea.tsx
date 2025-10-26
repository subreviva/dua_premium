"use client"

import { useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface AutoResizeTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  className?: string
}

export function AutoResizeTextarea({
  value,
  onChange,
  placeholder = "Digite sua solicitação...",
  minHeight = 48,
  maxHeight = 150,
  className,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight))
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`
    }
  }, [minHeight])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
        adjustHeight()
      }}
      placeholder={placeholder}
      className={cn(
        "w-full px-0 py-0 resize-none border-none",
        "bg-transparent text-white text-lg",
        "focus-visible:ring-0 focus-visible:outline-none",
        "placeholder:text-white/30",
        className,
      )}
      style={{ overflow: "hidden", minHeight: `${minHeight}px` }}
    />
  )
}
