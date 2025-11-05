"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowUpIcon,
  Paperclip,
  Mic,
  Music,
  Palette,
  ImageIcon,
  Video,
  MessageSquare,
  Search,
  Youtube,
  FileText,
  Sparkles,
  User,
  Bot,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AutoResizeProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
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
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY))
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`
  }, [minHeight])

  return { textareaRef, adjustHeight }
}

export default function EnhancedChat() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  })
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    adjustHeight(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm processing your request. This is a demo response.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // console.log("[v0] Voice recording:", !isRecording)
  }

  const studios = [
    { icon: Music, label: "Music Studio", path: "/musicstudio", color: "text-purple-400" },
    { icon: Palette, label: "Design Studio", path: "/designstudio", color: "text-pink-400" },
    { icon: ImageIcon, label: "Image Studio", path: "/imagestudio", color: "text-blue-400" },
    { icon: Video, label: "Video Studio", path: "/videostudio", color: "text-orange-400" },
  ]

  const quickActions = [
    { icon: MessageSquare, label: "Conversa", action: () => console.log("Chat") },
    { icon: ImageIcon, label: "Imagens", action: () => console.log("Images") },
    { icon: Youtube, label: "YouTube", action: () => console.log("YouTube") },
    { icon: Mic, label: "Voz", action: () => toggleRecording() },
    { icon: FileText, label: "Docs", action: () => console.log("Docs") },
    { icon: Search, label: "Google", action: () => console.log("Google") },
    { icon: Sparkles, label: "Conhecimento", action: () => console.log("Knowledge") },
  ]

  return (
    <div className="relative w-full h-screen flex flex-col bg-gradient-to-br from-black via-neutral-900 to-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">DUA IA</h1>
              <p className="text-neutral-400 text-sm sm:text-base">
                Build something amazing — just start typing below.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 w-full max-w-2xl">
              {studios.map((studio, index) => (
                <Button
                  key={index}
                  onClick={() => router.push(studio.path)}
                  className="flex flex-col items-center gap-2 h-auto py-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <studio.icon className={cn("w-6 h-6", studio.color)} />
                  <span className="text-xs text-white">{studio.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  <action.icon className="w-3 h-3 mr-1.5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    msg.role === "user" ? "bg-white/10 text-white" : "bg-white/5 text-white border border-white/10",
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className="text-xs text-neutral-500 mt-1 block">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 pb-6">
        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={cn(
              "w-full px-4 py-3 resize-none border-none",
              "bg-transparent text-white text-sm",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-500 min-h-[48px]",
            )}
            style={{ overflow: "hidden" }}
          />

          <div className="flex items-center justify-between p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                className={cn(
                  "h-8 w-8 transition-colors",
                  isRecording ? "text-red-500 hover:bg-red-500/10 bg-red-500/20" : "text-white hover:bg-white/10",
                )}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className={cn(
                "h-8 w-8 rounded-full p-0 transition-all duration-300",
                message.trim()
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                  : "bg-neutral-700 text-neutral-400 cursor-not-allowed",
              )}
            >
              <ArrowUpIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
