"use client"

import { motion, AnimatePresence, Variants } from "framer-motion";
import type React from "react"
import { useChat } from "ai/react";

import { useState, useRef, useCallback, useEffect } from "react"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { ChatSidebar } from "@/components/ui/chat-sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, Paperclip, Mic, User, Bot, PanelLeftClose, PanelLeft, StopCircle } from "lucide-react"
import AuroraWaves from "@/components/ui/aurora-waves"
import { useIsMobile } from "@/lib/hooks"
import GeminiLiveVoiceChat from '@/components/GeminiLiveVoiceChat';
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { MessageContent } from "@/components/ui/message-content";
import { MessageActions } from "@/components/ui/message-actions";
import { toast } from "sonner";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { useConversations } from "@/hooks/useConversations";
import { useHotkeys, commonHotkeys } from "@/hooks/useHotkeys";
import ConversationHistory from "@/components/ConversationHistory";

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
  // Persistência de conversas
  const { initialMessages, isLoaded, saveMessages, clearHistory } = useChatPersistence();

  // Integração real com Gemini via Vercel AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages, reload, stop } = useChat({
    api: '/api/chat',
    initialMessages: isLoaded ? initialMessages : undefined,
    onError: (error: Error) => {
      // console.error('Chat error:', error);
      toast.error("Erro ao enviar mensagem", {
        description: error.message || "Não foi possível processar sua mensagem. Tente novamente.",
      });
    },
  });

  // Auto-save mensagens
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, isLoaded, saveMessages]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showRealTimeChat, setShowRealTimeChat] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const isMobile = useIsMobile()

  // Sistema de múltiplas conversas (Sprint 2)
  const {
    conversations,
    currentConversationId,
    groupConversationsByDate,
    selectConversation,
    deleteConversation,
  } = useConversations();

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleNewChat = () => {
    clearHistory();
    setMessages([]);
    setSelectedImage(null);
    toast.success("Nova conversa iniciada", {
      description: "Histórico limpo com sucesso",
    });
  };

  // Hotkeys globais (Sprint 2)
  const { isMac, getHotkeyLabel } = useHotkeys([
    commonHotkeys.newChat(handleNewChat),
    commonHotkeys.toggleHistory(() => setIsSidebarOpen(prev => !prev)),
    commonHotkeys.escape(() => {
      if (isSidebarOpen) setIsSidebarOpen(false);
      if (showHelpModal) setShowHelpModal(false);
    }),
    commonHotkeys.help(() => setShowHelpModal(true)),
  ]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Arquivo inválido", {
        description: "Por favor selecione uma imagem (JPG, PNG, etc.)",
      });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande", {
        description: "O tamanho máximo é 5MB",
      });
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      toast.success("Imagem selecionada", {
        description: "Agora você pode enviar com sua mensagem",
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Scroll automático inteligente - só faz scroll se user estiver no bottom
  const scrollToBottom = () => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Detecta se user scrollou manualmente para cima
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setUserScrolled(!isAtBottom);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Auto-scroll quando há novas mensagens (se user não scrollou)
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(10);
    
    // Se houver imagem, enviar como body extra
    if (selectedImage) {
      handleSubmit(e, {
        body: {
          image: selectedImage,
        },
      });
      // Limpar imagem após enviar
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      handleSubmit(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleFormSubmit(e as any)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  if (isMobile) {
    return (
      <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden bg-black">
        {/* Image Background - More Subtle */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-50"
            style={{
              backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
            }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[50px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Navbar with iOS safe area */}
        <div className="relative z-50 pt-safe">
          <PremiumNavbar
            className="relative"
            credits={250}
            variant="transparent"
            showSidebarToggle={true}
            onSidebarToggle={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Gradient Fade Overlay - Efeito de conversa subindo */}
        <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/60 to-transparent z-40 pointer-events-none pt-safe" />

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
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onNewConversation={handleNewChat}
          groupConversationsByDate={groupConversationsByDate}
        />

        {/* Main Content Area - iOS App Style */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {/* Messages Area com scroll otimizado */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 pt-6 pb-2 premium-scrollbar-chat"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center h-full px-4 relative"
                >
                  {/* Background Video */}
                  <div className="absolute inset-0 overflow-hidden">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    >
                      <source
                        src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-2225-ultra%20premium%20loop%20para%20hero%20-%20sem%20objet....mp4"
                        type="video/mp4"
                      />
                    </video>
                    {/* Gradient overlay para melhor legibilidade */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                  </div>

                  <div className="text-center space-y-3 relative z-10">
                    <motion.h1 
                      className="text-5xl font-bold text-white drop-shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      DUA
                    </motion.h1>
                    <motion.p 
                      className="text-neutral-300 text-base max-w-md mx-auto leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Comece uma conversa ou toque no microfone para falar.
                    </motion.p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="messages"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4 pb-4"
                >
                  {messages.map((msg: any, index: number) => (
                    <motion.div 
                      key={msg.id} 
                      variants={messageVariants}
                      custom={index}
                      className="group relative"
                    >
                      <div
                        className={cn(
                          "flex items-start gap-2.5 w-full",
                          msg.role === "user" && "justify-end"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <motion.div 
                            className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 shadow-lg mt-0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                          >
                            <Bot className="w-4 h-4 text-neutral-400" />
                          </motion.div>
                        )}
                        <div className="relative flex-1 max-w-[75%]">
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className={cn(
                              "px-4 py-2.5 rounded-3xl text-white leading-relaxed shadow-lg text-[15px] relative",
                              msg.role === "user"
                                ? "bg-blue-600 rounded-br-md"
                                : "bg-neutral-800/90 backdrop-blur-sm rounded-bl-md pr-12"
                            )}
                          >
                            {msg.role === "assistant" ? (
                              <MessageContent content={msg.content} />
                            ) : (
                              msg.content
                            )}
                          </motion.div>
                          
                          {/* Copy button apenas para mensagens da DUA - posicionado dentro do bubble */}
                          {msg.role === "assistant" && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <MessageActions 
                                content={msg.content} 
                                messageId={msg.id}
                                onRegenerate={reload}
                                isRegenerating={isLoading}
                              />
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <motion.div 
                            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                          >
                            <User className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator quando está carregando */}
                  {isLoading && <TypingIndicator />}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Premium Input Bar - iOS Style com safe area bottom */}
          <motion.div 
            className="relative z-20 px-4 pt-3 pb-safe bg-black/40 backdrop-blur-2xl border-t border-white/5"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            {/* Image Preview */}
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-3 relative inline-block"
              >
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="max-w-[200px] max-h-[200px] rounded-xl border border-white/10 shadow-2xl object-cover"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <span className="text-xs">✕</span>
                </Button>
              </motion.div>
            )}

            <div className="flex items-end gap-2.5 mb-3">
              {/* Input Container - iOS iMessage Style */}
              <div className="flex-1 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-xl rounded-[24px] p-2 shadow-2xl border border-white/5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "text-neutral-400 hover:text-white h-8 w-8 hover:bg-white/5 rounded-full shrink-0 active:scale-90 transition-transform",
                    selectedImage && "text-blue-400 bg-blue-400/10"
                  )}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Mensagem..."
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-neutral-500 resize-none overflow-y-hidden py-2 text-[16px] leading-tight"
                  style={{ 
                    fontSize: '16px', // Prevents iOS zoom on focus
                    WebkitAppearance: 'none',
                  }}
                  rows={1}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 rounded-full shrink-0 transition-all duration-200 active:scale-90",
                    "hover:bg-blue-500/10 hover:text-blue-400 text-neutral-400"
                  )}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    setShowRealTimeChat(true);
                  }}
                  title="Conversar por Voz"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Send/Stop Button - iOS Style */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isLoading ? (
                  <Button 
                    size="icon"
                    onClick={() => {
                      stop();
                      toast.info("Geração interrompida");
                    }}
                    className="rounded-full w-10 h-10 shadow-xl bg-red-600 hover:bg-red-500 active:scale-90 transition-all duration-200 shrink-0"
                  >
                    <StopCircle className="w-5 h-5 text-white" />
                  </Button>
                ) : (
                  <Button 
                    size="icon" 
                    className={cn(
                      "rounded-full w-10 h-10 shadow-xl transition-all duration-200 shrink-0",
                      input.trim()
                        ? "bg-blue-600 hover:bg-blue-500 active:scale-90"
                        : "bg-neutral-800 opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      if (navigator.vibrate) navigator.vibrate(10);
                      handleFormSubmit(e as any);
                    }}
                    disabled={!input.trim()}
                  >
                    <ArrowUpIcon className="w-5 h-5 text-white" />
                  </Button>
                )}
              </motion.div>
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

      <PremiumNavbar 
        className="relative z-50" 
        credits={250} 
        variant="transparent"
        showSidebarToggle={true}
        onSidebarToggle={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onNewChat={handleNewChat}
      />

      {/* Gradient Fade Overlay - Efeito de conversa subindo (Desktop) */}
      <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent z-40 pointer-events-none" />

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
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewConversation={handleNewChat}
        groupConversationsByDate={groupConversationsByDate}
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
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 premium-scrollbar-chat"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 relative">
              {/* Background Video */}
              <div className="absolute inset-0 overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                >
                  <source
                    src="https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-2225-ultra%20premium%20loop%20para%20hero%20-%20sem%20objet....mp4"
                    type="video/mp4"
                  />
                </video>
                {/* Gradient overlay para melhor legibilidade */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
              </div>

              <div className="text-center space-y-3 sm:space-y-4 relative z-10">
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
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={cn(
                    "group flex gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                  <div className="relative max-w-[85%] sm:max-w-[80%]">
                    <div
                      className={cn(
                        "rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xl",
                        msg.role === "user"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-black/40 text-white border border-white/10 pr-12",
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <MessageContent content={msg.content} className="text-sm sm:text-base" />
                      ) : (
                        <p className="text-sm sm:text-base leading-relaxed break-words">{msg.content}</p>
                      )}
                    </div>
                    
                    {/* Copy button para desktop */}
                    {msg.role === "assistant" && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <MessageActions 
                          content={msg.content} 
                          messageId={msg.id}
                          onRegenerate={reload}
                          isRegenerating={isLoading}
                        />
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator desktop */}
              {isLoading && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4 lg:pb-6">
          <form onSubmit={handleFormSubmit}>
            <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <Textarea
                value={input}
                onChange={handleInputChange}
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

                {isLoading ? (
                  <Button
                    type="button"
                    onClick={() => {
                      stop();
                      toast.info("Geração interrompida");
                    }}
                    className="h-9 w-9 sm:h-8 sm:w-8 rounded-full p-0 bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/50 active:scale-95 transition-all duration-300"
                  >
                    <StopCircle className="w-4 h-4 sm:w-4 sm:h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "h-9 w-9 sm:h-8 sm:w-8 rounded-full p-0 transition-all duration-300 active:scale-95",
                      input.trim()
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50"
                        : "bg-neutral-700 text-neutral-400 cursor-not-allowed",
                    )}
                  >
                    <ArrowUpIcon className="w-4 h-4 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      <AnimatePresence>
        {showRealTimeChat && <GeminiLiveVoiceChat onClose={() => setShowRealTimeChat(false)} />}
      </AnimatePresence>

      {/* Help Modal - Keyboard Shortcuts (Sprint 2) */}
      <AnimatePresence>
        {showHelpModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
            >
              <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-black border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative p-6 border-b border-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10" />
                  <div className="relative">
                    <h2 className="text-xl font-bold text-white mb-1">⌨️ Atalhos de Teclado</h2>
                    <p className="text-sm text-zinc-400">Navegue mais rápido com esses comandos</p>
                  </div>
                </div>

                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                  {[
                    { key: 'K', modifiers: isMac ? '⌘' : 'Ctrl', desc: 'Nova conversa' },
                    { key: 'H', modifiers: isMac ? '⌘ + Shift' : 'Ctrl + Shift', desc: 'Abrir/fechar histórico' },
                    { key: '/', modifiers: isMac ? '⌘' : 'Ctrl', desc: 'Mostrar esta ajuda' },
                    { key: 'Esc', modifiers: '', desc: 'Fechar modal/sidebar' },
                  ].map((hotkey, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
                    >
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                        {hotkey.desc}
                      </span>
                      <div className="flex items-center gap-1">
                        {hotkey.modifiers && (
                          <>
                            <kbd className="px-2 py-1 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 rounded shadow-sm">
                              {hotkey.modifiers}
                            </kbd>
                            <span className="text-zinc-600">+</span>
                          </>
                        )}
                        <kbd className="px-2 py-1 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 rounded shadow-sm">
                          {hotkey.key}
                        </kbd>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
