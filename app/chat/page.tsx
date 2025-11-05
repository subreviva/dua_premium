"use client"

import { motion, AnimatePresence, Variants } from "framer-motion";
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
import GeminiLiveVoiceChat from '@/components/GeminiLiveVoiceChat';
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"

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
  const [showRealTimeChat, setShowRealTimeChat] = useState(false); // Novo estado
  const isMobile = useIsMobile()

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 1 }, // Start with opacity 1 to avoid flicker
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

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

  // Mobile Ultra-Premium iOS Experience
  if (isMobile) {
    const [isLoading, setIsLoading] = useState(false);

    const handleMobileSend = () => {
      if (!message.trim()) return;
      
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setIsLoading(true);

      // Simular resposta da API
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Estou processando o seu pedido. Esta é uma resposta de demonstração.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    };

    return (
      <>
        <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
          {/* Safe area superior - iOS notch/Dynamic Island */}
          <div className="h-safe-top bg-black" />
          
          <ChatHeader />
          
          <ChatMessages 
            className="flex-1" 
            messages={messages}
            isLoading={isLoading}
          />

          {/* Input com safe area inferior - iOS home indicator */}
          <div className="bg-black/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 pt-3 pb-safe-bottom">
              <ChatInput 
                value={message}
                onChange={setMessage}
                onSubmit={handleMobileSend}
                isLoading={isLoading}
                placeholder="Mensagem..."
              />
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {showRealTimeChat && <GeminiLiveVoiceChat onClose={() => setShowRealTimeChat(false)} />}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Version (unchanged)
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-black">
        {/* Image Background - More Subtle */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-50" // Reduced opacity
            style={{
              backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
            }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[50px]" /> {/* Increased blur */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        <div className="fixed top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-black/90 via-black/60 to-transparent z-10 pointer-events-none" />

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
          <div className="flex-1 overflow-y-auto px-4 pt-28 pb-6 premium-scrollbar-chat">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.90 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center h-full px-4"
                >
                  <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-white drop-shadow-lg">DUA</h1>
                    <p className="text-neutral-300 text-base max-w-md mx-auto leading-relaxed">
                      Comece uma conversa ou toque no microfone para falar.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="messages"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {messages.map((msg) => (
                    <motion.div key={msg.id} variants={messageVariants}>
                      <div
                        className={cn(
                          "flex items-start gap-3 w-full",
                          msg.role === "user" && "justify-end"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-neutral-400" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "p-3 rounded-2xl max-w-[80%] text-white leading-relaxed",
                            msg.role === "user"
                              ? "bg-blue-600 rounded-br-lg"
                              : "bg-neutral-800/80 rounded-bl-lg"
                          )}
                        >
                          {msg.content}
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-neutral-400" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Premium Input Bar */}
          <motion.div 
            className="relative z-20 p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-2 bg-neutral-800/80 rounded-2xl p-2">
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  adjustHeight()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Mensagem..."
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-neutral-500 resize-none overflow-y-hidden p-2 text-base"
                rows={1}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "text-neutral-400 hover:text-white transition-all duration-200",
                  "hover:bg-blue-500/20 hover:text-blue-400",
                  "active:scale-95 group"
                )}
                onClick={() => setShowRealTimeChat(true)}
                title="Conversar por Voz (Premium)"
              >
                <Mic className="w-5 h-5 group-hover:animate-pulse" />
              </Button>
              <Button 
                size="icon" 
                className="bg-blue-600 hover:bg-blue-500 rounded-full w-9 h-9"
                onClick={handleSend}
                disabled={!message.trim()}
              >
                <ArrowUpIcon className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showRealTimeChat && (
            <GeminiLiveVoiceChat onClose={() => setShowRealTimeChat(false)} />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // --- DESKTOP VIEW ---
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
                  onClick={() => setShowRealTimeChat(true)}
                  className={cn(
                    "h-9 w-9 sm:h-8 sm:w-8 rounded-lg transition-all duration-200 group",
                    "text-white hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-purple-500/20",
                    "hover:text-blue-400 active:scale-95 hover:shadow-lg hover:shadow-blue-500/25"
                  )}
                  title="🎙️ Modo Voz Premium - Como ChatGPT"
                >
                  <Mic className="w-4 h-4 sm:w-4 sm:h-4 group-hover:animate-pulse" />
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
      <AnimatePresence>
        {showRealTimeChat && <GeminiLiveVoiceChat onClose={() => setShowRealTimeChat(false)} />}
      </AnimatePresence>
    </div>
  )
}