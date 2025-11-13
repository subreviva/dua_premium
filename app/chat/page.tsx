"use client"

import { motion, AnimatePresence, Variants } from "framer-motion";
import type React from "react"
import { useChat } from "ai/react";

import { useState, useRef, useCallback, useEffect } from "react"
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
import { supabaseClient } from "@/lib/supabase";
import Image from "next/image";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { ChatImage } from "@/components/chat/ChatImage";

const supabase = supabaseClient;

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "image"
  imageUrl?: string
  imagePrompt?: string
  isFreeImage?: boolean
  creditsCharged?: number
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
  // Persistir somente mensagens com papel suportado pelo sistema de histórico (user/assistant)
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      const filtered = messages.filter((m: any) => m.role === 'user' || m.role === 'assistant');
      // Evitar salvar se não houver mensagens elegíveis
      if (filtered.length > 0) {
        // mapear para shape esperado se necessário (remove campos extras)
        saveMessages(filtered as any);
      }
    }
  }, [messages, isLoaded, saveMessages]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showRealTimeChat, setShowRealTimeChat] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSendEffect, setShowSendEffect] = useState(false);
  const isMobile = useIsMobile()

  // Hook de geração de imagens
  const { isGenerating, detectImageRequest, generateImage } = useImageGeneration();

  // Sistema de sons premium melhorado
  const playSound = useCallback((type: 'send' | 'receive' | 'error' | 'success' | 'typing') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const sounds = {
        send: () => {
          // Som mais agradável com duas frequências
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          osc1.frequency.value = 880; // A5
          osc2.frequency.value = 1100; // Harmônico
          osc1.type = 'sine';
          osc2.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          
          osc1.start(audioContext.currentTime);
          osc2.start(audioContext.currentTime);
          osc1.stop(audioContext.currentTime + 0.15);
          osc2.stop(audioContext.currentTime + 0.15);
        },
        receive: () => {
          // Som suave em cascata
          const frequencies = [660, 880, 1100];
          frequencies.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            const startTime = audioContext.currentTime + (i * 0.05);
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            osc.start(startTime);
            osc.stop(startTime + 0.2);
          });
        },
        typing: () => {
          // Som sutil de digitação
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.value = 1200;
          osc.type = 'sine';
          
          gain.gain.setValueAtTime(0.03, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.05);
        },
        error: () => {
          // Som mais distintivo para erro
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.value = 250;
          osc.type = 'sawtooth';
          
          gain.gain.setValueAtTime(0.08, audioContext.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.25);
        },
        success: () => {
          // Acorde de sucesso (C-E-G)
          const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
          chord.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            const startTime = audioContext.currentTime + (i * 0.03);
            gain.gain.setValueAtTime(0.06, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            
            osc.start(startTime);
            osc.stop(startTime + 0.4);
          });
        },
      };
      
      sounds[type]();
    } catch (error) {
      console.log('Sound playback not available');
    }
  }, [soundEnabled]);

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

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Você');
          
          // Buscar avatar do perfil
          const { data: profile } = await supabase
            .from('users')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          
          if (profile?.avatar_url) {
            setUserAvatar(profile.avatar_url);
          } else if (user.user_metadata?.avatar_url) {
            setUserAvatar(user.user_metadata.avatar_url);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

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

  // Solicitar permissão para notificações no mobile
  useEffect(() => {
    if (isMobile && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast.success('Notificações ativadas', {
              description: 'Receberá alertas de novas mensagens',
            });
            playSound('success');
          }
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, playSound]);

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

  // Detectar novas mensagens e tocar sons + notificações melhoradas
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const isNewMessage = messages.length > 1;
    
    if (isNewMessage && lastMessage.role === 'assistant') {
      // Som de recebimento
      playSound('receive');
      
      // Vibração tripla elegante
      if (navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
      
      // Notificação Push melhorada
      if (isMobile && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        const preview = lastMessage.content.length > 120 
          ? lastMessage.content.substring(0, 120) + '...' 
          : lastMessage.content;
        
        const notification = new Notification('DUA IA respondeu', {
          body: preview,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'dua-message',
          requireInteraction: false,
          silent: false,
        });
        
        // Focar app ao clicar na notificação
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        // Auto-fechar após 5 segundos
        setTimeout(() => notification.close(), 5000);
      }
    }
  }, [messages, playSound, isMobile]);

    const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // MÁXIMO RIGOR: Detectar pedidos de imagem ANTES de enviar ao chat
    const imagePrompt = detectImageRequest(input);
    
    if (imagePrompt) {
      // É um pedido de imagem - processar separadamente
      console.log('🎨 Imagem detectada:', imagePrompt);
      
      // Som de envio melhorado
      playSound('send');
      
      // Feedback háptico
      if (navigator.vibrate) {
        navigator.vibrate([10, 30, 10]);
      }
      
      try {
        // Gerar imagem via API
        const result = await generateImage(imagePrompt);
        
        if (result) {
          // Adicionar mensagem do usuário
          const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user' as const,
            content: input,
            timestamp: new Date(),
            type: 'text' as const,
          };
          
          // Adicionar mensagem da imagem
          const imageMessage = {
            id: `image-${Date.now()}`,
            role: 'assistant' as const,
            content: `Imagem gerada: "${imagePrompt}"`,
            timestamp: new Date(),
            type: 'image' as const,
            imageUrl: result.imageUrl,
            imagePrompt: imagePrompt,
            isFreeImage: result.isFree,
            creditsCharged: result.creditsCharged,
          };
          
          setMessages([...messages, userMessage, imageMessage]);
          
          // Som de recebimento
          playSound('receive');
          
          // Limpar input
          handleInputChange({ target: { value: '' } } as any);
        }
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        playSound('error');
      }
      
      // ⚠️ NÃO ENVIAR PARA CHAT NORMAL - imagem já processada
      return;
    }
    
    // Fluxo normal do chat (texto)
    
    // Feedback háptico melhorado
    if (navigator.vibrate) {
      navigator.vibrate([10, 30, 10]); // Padrão mais satisfatório
    }
    
    // Reset scroll para fazer auto-scroll quando enviar mensagem
    setUserScrolled(false);
    
    // Som de envio melhorado
    playSound('send');
    
    // Efeito visual de envio
    setShowSendEffect(true);
    setTimeout(() => setShowSendEffect(false), 300);
    
    if (selectedImage) {
      handleSubmit(e, { body: { image: selectedImage } });
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
      <div className="fixed inset-0 flex flex-col bg-black overflow-hidden">
        {/* Premium Background - Ultra Elegant */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60"
            style={{
              backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
            }}
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[60px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

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

        {/* Main Chat Container - Premium */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Fade Gradient - ChatGPT Style */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none z-10" />

          {/* Messages Container */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overscroll-none px-4 pt-4 min-h-0"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              paddingBottom: 'max(160px, calc(env(safe-area-inset-bottom) + 160px))',
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>

            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center h-full px-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center shadow-2xl"
                >
                  <Bot className="w-8 h-8 text-white/90" />
                </motion.div>
              </motion.div>
            ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((msg: any, index: number) => {
                    const isLastMessage = index === messages.length - 1;
                    return (
                    <motion.div 
                      key={msg.id}
                      initial={isLastMessage ? { opacity: 0, y: 20, scale: 0.95 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.16, 1, 0.3, 1],
                        delay: isLastMessage ? 0.1 : 0 
                      }}
                      className="group"
                    >
                      <div
                        className={cn(
                          "flex items-start gap-3 w-full",
                          msg.role === "user" && "justify-end"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <motion.div 
                            className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/[0.12] to-white/[0.06] border border-white/[0.12] flex items-center justify-center flex-shrink-0 mt-0.5 backdrop-blur-xl shadow-lg"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.08, type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <Bot className="w-4 h-4 text-white/80" />
                          </motion.div>
                        )}
                        
                        <div className="relative flex-1 max-w-[82%]">
                          <motion.div
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className={cn(
                              "px-4 py-3 text-[15px] leading-[1.5] relative overflow-hidden",
                              msg.role === "user"
                                ? "bg-white/[0.12] text-white rounded-[20px] rounded-br-md shadow-lg shadow-black/10 backdrop-blur-xl border border-white/[0.15]"
                                : "bg-white/[0.06] text-white/95 backdrop-blur-2xl border border-white/[0.08] rounded-[20px] rounded-bl-md shadow-xl"
                            )}
                            style={{
                              WebkitFontSmoothing: 'antialiased',
                              MozOsxFontSmoothing: 'grayscale',
                            }}
                          >
                            {/* Efeito de brilho premium para mensagens do assistente */}
                            {msg.role === "assistant" && isLastMessage && (
                              <motion.div
                                initial={{ x: '-100%', opacity: 0 }}
                                animate={{ x: '200%', opacity: [0, 0.3, 0] }}
                                transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                                style={{ width: '50%' }}
                              />
                            )}
                            
                            {/* MÁXIMO RIGOR: Renderizar imagens geradas */}
                            {(msg as any).type === 'image' && (msg as any).imageUrl && (
                              <div className="mt-3">
                                <ChatImage
                                  imageUrl={(msg as any).imageUrl}
                                  prompt={(msg as any).imagePrompt || ''}
                                  isFree={(msg as any).isFreeImage}
                                  creditsCharged={(msg as any).creditsCharged || 0}
                                />
                              </div>
                            )}
                            
                            {/* Usar MessageContent para mensagens de texto */}
                            {(!(msg as any).type || (msg as any).type === 'text') && (
                              <MessageContent content={msg.content} />
                            )}
                            
                            {/* Timestamp - ChatGPT/Gemini Style */}
                            <div className={cn(
                              "text-[11px] mt-1.5 font-light",
                              msg.role === "user" ? "text-white/50" : "text-white/30"
                            )}>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString('pt-PT', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            
                            {/* Copy/Actions Button - Gemini Style */}
                            {msg.role === "assistant" && (
                              <div className="absolute -bottom-9 right-0 opacity-0 group-active:opacity-100 transition-opacity duration-200">
                                <MessageActions 
                                  content={msg.content} 
                                  messageId={msg.id}
                                  onRegenerate={reload}
                                  isRegenerating={isLoading}
                                />
                              </div>
                            )}
                          </motion.div>
                        </div>
                        
                        {msg.role === "user" && (
                          <motion.div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg overflow-hidden border border-white/20"
                            style={{
                              background: userAvatar ? 'transparent' : 'linear-gradient(135deg, #ffffff15 0%, #ffffff25 100%)'
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.08, type: "spring", stiffness: 500, damping: 25 }}
                          >
                            {userAvatar ? (
                              <Image
                                src={userAvatar}
                                alt={userName || 'User'}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            ) : userName ? (
                              <span className="text-white text-xs font-semibold uppercase">
                                {userName.substring(0, 2)}
                              </span>
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )})}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4"
                    >
                      <motion.div 
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/[0.12] to-white/[0.06] border border-white/[0.12] flex items-center justify-center flex-shrink-0 backdrop-blur-xl shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Bot className="w-4 h-4 text-white/80" />
                      </motion.div>
                      <div className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] rounded-[20px] px-4 py-3">
                        <motion.div
                          className="w-2 h-2 bg-white/60 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-white/60 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-white/60 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {!isLoading && messages.length > 0 && <div className="h-2" />}
                </div>
              )}
            <div ref={messagesEndRef} className="h-20" />
          </div>

          {/* Bottom Fade Gradient - Premium */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />

          {/* Input Bar - ChatGPT/Gemini Premium Style */}
          <div 
            className="relative z-20 flex-shrink-0 px-4 py-4 bg-black/95 backdrop-blur-2xl"
            style={{ 
              paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
            }}
          >
            {/* Efeito visual de envio */}
            <AnimatePresence>
              {showSendEffect && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 2.5, opacity: [0, 0.3, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-radial from-white/20 via-white/5 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>
            
            {/* Image Preview */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-3"
                >
                  <div className="relative inline-block overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="max-w-[140px] max-h-[140px] object-cover"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={removeImage}
                      className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-black/90 hover:bg-black border border-white/20 text-white shadow-2xl active:scale-90 transition-transform"
                    >
                      <span className="text-[11px] font-bold">✕</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MÁXIMO RIGOR: Indicador de geração de imagem (Mobile) */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-3 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl"
                >
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-pink-400"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-purple-400"
                    />
                  </div>
                  <span className="text-sm text-white/90 font-medium">
                    Gerando imagem...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Container */}
            <form onSubmit={handleFormSubmit} className="flex items-end gap-2.5">
              <div className={cn(
                "flex-1 flex items-center gap-2 backdrop-blur-2xl rounded-[24px] px-3 py-2.5 shadow-2xl transition-all duration-300",
                input.trim() 
                  ? "bg-white/[0.10] border border-white/[0.20] shadow-white/5" 
                  : "bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.15]"
              )}>
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
                    "text-white/50 hover:text-white/90 h-8 w-8 hover:bg-white/10 rounded-full flex-shrink-0 active:scale-90 transition-all duration-200",
                    selectedImage && "text-white/90 bg-white/15"
                  )}
                >
                  <Paperclip className="w-[18px] h-[18px]" />
                </Button>
                
                <Textarea
                  value={input}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Som sutil de digitação (apenas a cada 3 caracteres para não ser excessivo)
                    if (e.target.value.length % 3 === 0 && e.target.value.length > input.length) {
                      playSound('typing');
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? "DUA está a responder..." : "Mensagem DUA..."}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-white/30 resize-none overflow-y-hidden py-1 px-1 text-[16px] leading-[1.4] font-normal min-h-0 transition-opacity",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ 
                    fontSize: '16px',
                    WebkitAppearance: 'none',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                  }}
                  rows={1}
                />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full flex-shrink-0 transition-all duration-200 active:scale-90 hover:bg-white/10 text-white/50 hover:text-white/90"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    setShowRealTimeChat(true);
                  }}
                  title="Voz"
                >
                  <Mic className="w-[18px] h-[18px]" />
                </Button>
              </div>
              
              {/* Send/Stop Button - Premium */}
              <motion.div
                animate={{ 
                  scale: input.trim() || isLoading ? 1 : 0.95,
                  opacity: input.trim() || isLoading ? 1 : 0.6,
                }}
                whileTap={{ scale: 0.90 }}
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className="flex-shrink-0"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Button 
                      size="icon"
                      onClick={() => {
                        stop();
                        if (navigator.vibrate) navigator.vibrate(10);
                        toast.info("Parado");
                      }}
                      className="rounded-full w-10 h-10 shadow-2xl bg-red-500 hover:bg-red-400 border-0 active:scale-90 transition-all relative overflow-hidden"
                    >
                      {/* Efeito de pulso */}
                      <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 bg-red-400 rounded-full"
                      />
                      <StopCircle className="w-[19px] h-[19px] text-white relative z-10" />
                    </Button>
                  </motion.div>
                ) : (
                  <Button 
                    type="submit"
                    size="icon" 
                    className={cn(
                      "rounded-full w-10 h-10 shadow-2xl border-0 transition-all duration-200",
                      input.trim()
                        ? "bg-white/90 text-black hover:bg-white active:scale-90 shadow-white/30"
                        : "bg-white/10 text-white/40 opacity-60 cursor-not-allowed"
                    )}
                    disabled={!input.trim()}
                  >
                    <ArrowUpIcon className="w-5 h-5 font-bold" strokeWidth={2.5} />
                  </Button>
                )}
              </motion.div>
            </form>
          </div>
        </div>

        {/* Voice Chat */}
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
          "fixed top-20 lg:top-24 z-[90] transition-all duration-300",
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
          "relative z-10 flex-1 flex flex-col transition-all duration-300 min-h-0",
          isSidebarOpen ? (isSidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-64") : "ml-0",
        )}
      >
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 premium-scrollbar-chat min-h-0"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center space-y-6 sm:space-y-8">
                {/* Ultra Premium DUA Logo - Mobile First */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="text-[72px] sm:text-[96px] md:text-[120px] lg:text-[140px] font-extralight text-white tracking-[-0.04em] leading-none"
                    style={{ 
                      fontFamily: 'var(--font-geist-sans)',
                      textShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}
                  >
                    DUA
                  </h1>
                </motion.div>
                
                {/* Subtitle - Ultra Refined */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-white/60 text-base sm:text-lg lg:text-xl max-w-md mx-auto font-light tracking-tight leading-relaxed"
                >
                  Construa algo incrível — comece a digitar abaixo.
                </motion.p>
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
                        "rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xl relative overflow-hidden",
                        msg.role === "user"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-black/40 text-white border border-white/10 pr-12",
                      )}
                    >
                      {/* Efeito de brilho premium para desktop */}
                      {msg.role === "assistant" && messages[messages.length - 1]?.id === msg.id && (
                        <motion.div
                          initial={{ x: '-100%', opacity: 0 }}
                          animate={{ x: '200%', opacity: [0, 0.2, 0] }}
                          transition={{ duration: 2, delay: 0.3, ease: 'easeInOut' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
                          style={{ width: '50%' }}
                        />
                      )}
                      
                      {/* MÁXIMO RIGOR: Renderizar imagens geradas (Desktop) */}
                      {(msg as any).type === 'image' && (msg as any).imageUrl && (
                        <div className="mb-3">
                          <ChatImage
                            imageUrl={(msg as any).imageUrl}
                            prompt={(msg as any).imagePrompt || ''}
                            isFree={(msg as any).isFreeImage}
                            creditsCharged={(msg as any).creditsCharged || 0}
                          />
                        </div>
                      )}
                      
                      {/* Renderizar conteúdo com previews de links para user e assistant */}
                      {(!(msg as any).type || (msg as any).type === 'text') && (
                        <MessageContent content={msg.content} className="text-sm sm:text-base" />
                      )}
                      
                      {/* Timestamp Desktop */}
                      <div className="text-[10px] text-white/30 mt-1.5 font-light">
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString('pt-PT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
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
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden border border-white/20"
                      style={{
                        background: userAvatar ? 'transparent' : 'linear-gradient(135deg, #ffffff15 0%, #ffffff25 100%)'
                      }}
                    >
                      {userAvatar ? (
                        <Image
                          src={userAvatar}
                          alt={userName || 'User'}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : userName ? (
                        <span className="text-white text-[10px] sm:text-xs font-semibold uppercase">
                          {userName.substring(0, 2)}
                        </span>
                      ) : (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing indicator desktop - Melhorado */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <motion.div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5">
                    <motion.div
                      className="w-2 h-2 bg-white/70 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-white/70 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-white/70 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                    <span className="text-xs text-white/60 ml-1">Digitando</span>
                  </div>
                </motion.div>
              )}
              
              {/* MÁXIMO RIGOR: Indicador de geração de imagem (Desktop) */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <motion.div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl px-4 py-2.5">
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-pink-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                    <span className="text-xs text-white/90 ml-1 font-medium">Gerando imagem</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
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
                    title="Modo Voz Premium - Como ChatGPT"
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
                    <h2 className="text-xl font-bold text-white mb-1">Atalhos de Teclado</h2>
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
