"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { ChatSidebar } from "@/components/ui/chat-sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, Paperclip, Mic, User, Bot, PanelLeftClose, PanelLeft } from "lucide-react"
import AuroraWaves from "@/components/ui/aurora-waves"
import { useIsMobile } from "@/lib/hooks"

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

export default function ChatPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedSidebarOpen = localStorage.getItem("sidebarOpen")
    const savedSidebarCollapsed = localStorage.getItem("sidebarCollapsed")

    if (savedSidebarOpen !== null) {
      setIsSidebarOpen(savedSidebarOpen === "true" && !isMobile)
    } else {
      setIsSidebarOpen(!isMobile)
    }

    if (savedSidebarCollapsed !== null) setIsSidebarCollapsed(savedSidebarCollapsed === "true")
  }, [isMobile])

  useEffect(() => {
    localStorage.setItem("sidebarOpen", isSidebarOpen.toString())
  }, [isSidebarOpen])

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.toString())
  }, [isSidebarCollapsed])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        setIsSidebarOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Estou processando o seu pedido. Esta é uma resposta de demonstração.",
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
    console.log("[v0] Voice recording:", !isRecording)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  if (isMobile) {
    return (
      <div className="relative w-full h-screen flex flex-col overflow-hidden bg-[#0a0a0a]">
        {/* Image Background - Super Elegant & Blurred */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-80"
            style={{
              backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
            }}
          />
          <div className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-[40px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        </div>

        <div className="fixed top-0 left-0 right-0 h-[45vh] bg-gradient-to-b from-[#0a0a0a]/95 via-[#0a0a0a]/70 to-transparent z-10 pointer-events-none" />

        <PremiumNavbar
          className="relative z-50 pt-safe"
          credits={250}
          variant="transparent"
          showSidebarToggle={true}
          onSidebarToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-300 animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <ChatSidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onToggleOpen={setIsSidebarOpen}
          onToggleCollapsed={setIsSidebarCollapsed}
        />

        <div className="relative z-10 flex-1 flex flex-col overflow-hidden pt-[72px]">
          <div className="flex-1 overflow-y-auto px-6 pt-28 pb-6 premium-scrollbar-chat">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">DUA IA</h1>
                  <p className="text-neutral-300 text-base max-w-md mx-auto leading-relaxed">
                    Construa algo incrível — comece a digitar abaixo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-full space-y-4 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[68%] rounded-2xl px-4 py-3 backdrop-blur-xl",
                        msg.role === "user"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-black/40 text-white border border-white/10",
                      )}
                    >
                      <p className="text-base leading-relaxed break-words">{msg.content}</p>
                      <span className="text-xs text-neutral-400 mt-1.5 block">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="w-full px-6 pb-safe-offset-4 pt-2">
            <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  adjustHeight()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className={cn(
                  "w-full px-4 py-3.5 resize-none border-none",
                  "bg-transparent text-white",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-neutral-500 min-h-[48px]",
                  "text-[16px]",
                )}
                style={{ overflow: "hidden" }}
              />

              <div className="flex items-center justify-between p-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 h-10 w-10 rounded-lg active:scale-95"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    className={cn(
                      "h-10 w-10 rounded-lg transition-colors active:scale-95",
                      isRecording ? "text-red-500 hover:bg-red-500/10 bg-red-500/20" : "text-white hover:bg-white/10",
                    )}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={cn(
                    "h-10 w-10 rounded-full p-0 transition-all duration-300 active:scale-95",
                    message.trim()
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                      : "bg-neutral-700 text-neutral-400 cursor-not-allowed",
                  )}
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-[#0a0a0a]">
      {/* Image Background - Super Elegant & Blurred */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-80"
          style={{
            backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
          }}
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-[40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      </div>

      <div className="fixed top-0 left-0 right-0 h-[45vh] z-10 bg-gradient-to-b from-[#0a0a0a]/95 via-[#0a0a0a]/85 to-transparent pointer-events-none" />

      <PremiumNavbar className="relative z-50" credits={250} variant="transparent" />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 lg:hidden transition-all duration-300 animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <ChatSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleOpen={setIsSidebarOpen}
        onToggleCollapsed={setIsSidebarCollapsed}
      />

      <Button
        onClick={toggleSidebar}
        className={cn(
          "fixed top-20 lg:top-24 z-50 transition-all duration-300",
          "bg-black/70 backdrop-blur-xl border border-white/20 hover:bg-black/90",
          "text-white shadow-xl hover:shadow-2xl",
          "w-11 h-11 lg:w-10 lg:h-10 p-0 rounded-full",
          "active:scale-95",
          isSidebarOpen ? (isSidebarCollapsed ? "left-20" : "left-4 lg:left-[272px]") : "left-4",
        )}
        size="icon"
      >
        {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
      </Button>

      <div
        className={cn(
          "relative z-10 flex-1 flex flex-col transition-all duration-300",
          isSidebarOpen ? (isSidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-64") : "ml-0",
        )}
      >
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 premium-scrollbar-chat">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                  DUA IA
                </h1>
                <p className="text-neutral-300 text-sm sm:text-base lg:text-lg max-w-md mx-auto leading-relaxed">
                  Construa algo incrível — comece a digitar abaixo.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xl",
                      msg.role === "user"
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-black/40 text-white border border-white/10",
                    )}
                  >
                    <p className="text-sm sm:text-base leading-relaxed break-words">{msg.content}</p>
                    <span className="text-xs text-neutral-400 mt-1 block">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4 lg:pb-6">
          <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                adjustHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className={cn(
                "w-full px-3 sm:px-4 py-3 sm:py-3.5 resize-none border-none",
                "bg-transparent text-white text-sm sm:text-base",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-neutral-500 min-h-[48px]",
              )}
              style={{ overflow: "hidden" }}
            />

            <div className="flex items-center justify-between p-2.5 sm:p-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-9 w-9 sm:h-8 sm:w-8 rounded-lg active:scale-95"
                >
                  <Paperclip className="w-4 h-4 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  className={cn(
                    "h-9 w-9 sm:h-8 sm:w-8 rounded-lg transition-colors active:scale-95",
                    isRecording ? "text-red-500 hover:bg-red-500/10 bg-red-500/20" : "text-white hover:bg-white/10",
                  )}
                >
                  <Mic className="w-4 h-4 sm:w-4 sm:h-4" />
                </Button>
              </div>

              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className={cn(
                  "h-9 w-9 sm:h-8 sm:w-8 rounded-full p-0 transition-all duration-300 active:scale-95",
                  message.trim()
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed",
                )}
              >
                <ArrowUpIcon className="w-4 h-4 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
