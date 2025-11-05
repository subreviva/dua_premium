"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
  editable?: boolean
  onUpload?: (file: File) => void
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
}

export function UserAvatar({
  src,
  alt = "User avatar",
  fallback = "U",
  size = "md",
  editable = false,
  onUpload,
  className,
}: UserAvatarProps) {
  const [preview, setPreview] = useState<string | undefined>(src)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onUpload?.(file)
    }
  }

  const handleClick = () => {
    if (editable) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn("relative group", className)}>
      <Avatar className={cn(sizeClasses[size], "cursor-pointer transition-all")} onClick={handleClick}>
        <AvatarImage src={preview || "/placeholder.svg"} alt={alt} />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <>
          <div
            className={cn(
              "absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer",
              sizeClasses[size],
            )}
            onClick={handleClick}
          >
            <Camera className="w-5 h-5 text-white" />
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </>
      )}
    </div>
  )
}
