"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Search,
  MessageSquarePlus,
  Mic,
  History,
  ChevronLeft,
  ChevronRight,
  User,
  Music,
  Palette,
  ImageIcon,
  Video,
  Settings,
  Users,
  Trash2,
  MessageSquare,
  Clock,
  Database,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from 'framer-motion'
import { useChatSessions } from "@/hooks/useChatSessions"

interface SidebarItem {
  icon: React.ElementType
  label: string
  href?: string
  action?: () => void
  badge?: string
}

export interface Conversation {
  id: string
  title: string
  messages: any[]
  createdAt: Date
  updatedAt: Date
}

export interface GroupedConversations {
  hoje: Conversation[]
  ontem: Conversation[]
  semana: Conversation[]
  mes: Conversation[]
  antigos: Conversation[]
}

interface ChatSidebarProps {
  isOpen?: boolean
  isCollapsed: boolean
  onToggleOpen?: (open: boolean) => void
  onToggleCollapsed?: (collapsed: boolean) => void
  conversations?: Conversation[]
  currentConversationId?: string | null
  onSelectConversation?: (id: string) => void
  onDeleteConversation?: (id: string) => void
  onNewConversation?: () => void
  groupConversationsByDate?: () => GroupedConversations
  useDatabase?: boolean // Nova prop para habilitar integração com banco de dados
}

export function ChatSidebar({
  isOpen = true,
  isCollapsed: externalCollapsed = false,
  onToggleOpen,
  onToggleCollapsed,
  conversations = [],
  currentConversationId = null,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  groupConversationsByDate,
  useDatabase = false,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null)
  const [showDatabaseHistory, setShowDatabaseHistory] = useState(false)
  
  // Hook para integração com banco de dados
  const {
    sessions: dbSessions,
    currentSession: dbCurrentSession,
    isLoading: dbLoading,
    loadUserSessions: dbLoadSessions,
    switchToSession: dbSwitchSession,
    deleteSession: dbDeleteSession,
    createNewSession: dbCreateSession,
  } = useChatSessions()

  useEffect(() => {
    setIsCollapsed(externalCollapsed)
  }, [externalCollapsed])

  const handleToggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onToggleCollapsed?.(newCollapsed)
  }

  const handleNewConversation = () => {
    if (onNewConversation) {
      onNewConversation()
    } else {
      window.location.reload()
    }
  }

  // Agrupar conversas por data
  const groupedConversations = groupConversationsByDate?.() || {
    hoje: [],
    ontem: [],
    semana: [],
    mes: [],
    antigos: []
  }

  // Função para agrupar sessões do banco de dados por data
  const groupDatabaseSessionsByDate = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const grouped = {
      hoje: [] as typeof dbSessions,
      ontem: [] as typeof dbSessions,
      semana: [] as typeof dbSessions,
      mes: [] as typeof dbSessions,
      antigos: [] as typeof dbSessions,
    }

    dbSessions.forEach((session) => {
      const sessionDate = new Date(session.updatedAt)
      
      if (sessionDate >= today) {
        grouped.hoje.push(session)
      } else if (sessionDate >= yesterday) {
        grouped.ontem.push(session)
      } else if (sessionDate >= weekAgo) {
        grouped.semana.push(session)
      } else if (sessionDate >= monthAgo) {
        grouped.mes.push(session)
      } else {
        grouped.antigos.push(session)
      }
    })

    return grouped
  }

  const groupedDbSessions = groupDatabaseSessionsByDate()

  // Cores dos grupos
  const groupColors = {
    hoje: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300',
    ontem: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300',
    semana: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-300',
    mes: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-300',
    antigos: 'from-zinc-500/20 to-zinc-600/20 border-zinc-500/30 text-zinc-300'
  }

  const groupLabels = {
    hoje: 'Hoje',
    ontem: 'Ontem',
    semana: 'Últimos 7 dias',
    mes: 'Últimos 30 dias',
    antigos: 'Mais antigos'
  }

  const sidebarItems: SidebarItem[] = [
    { icon: Search, label: "Buscar", action: () => console.log("[v0] Search"), badge: "⌘K" },
    { icon: MessageSquarePlus, label: "Nova conversa", action: handleNewConversation },
    { icon: Mic, label: "Voz", action: () => console.log("[v0] Voice") },
  ]

  const studioItems: SidebarItem[] = [
    { icon: Music, label: "DUA MUSIC", href: "/musicstudio" },
    { icon: Palette, label: "DUA DESIGN", href: "/designstudio" },
    { icon: ImageIcon, label: "DUA IMAGEM", href: "/imagestudio" },
    { icon: Video, label: "DUA CINEMA", href: "/videostudio" },
  ]

  const communityItems: SidebarItem[] = [{ icon: Users, label: "Comunidade", href: "/community" }]

  // Total de conversas
  const totalConversations = showDatabaseHistory 
    ? dbSessions.length 
    : conversations.length

  const mobileActionCards = [
    {
      icon: MessageSquarePlus,
      title: "Nova ideia",
      subtitle: "Começar agora",
      onClick: handleNewConversation,
    },
    {
      icon: History,
      title: "Histórico",
      subtitle: `${totalConversations || 0} sessões`,
      onClick: () => setIsHistoryExpanded((prev) => !prev),
    },
  ]

  if (!isOpen) return null

  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "fixed left-0 h-[100dvh] bg-gradient-to-br from-black/95 via-black/90 to-black/95 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ease-in-out flex flex-col shadow-2xl",
        // Mobile: sobrepõe navbar (z-100, top-0, pt-16)
        "top-0 z-[100] pt-16",
        // Desktop: abaixo da navbar (z-40, top-16, pt-0)
        "md:top-16 md:z-40 md:pt-0 md:h-[calc(100vh-4rem)]",
        !isCollapsed && "md:w-72 w-[min(340px,90vw)]",
        isCollapsed && "md:w-16 w-16",
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 right-0 w-40 h-40 bg-purple-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-10 -left-10 w-44 h-44 bg-blue-500/10 blur-3xl" aria-hidden="true" />
        </div>
        {/* Header da Sidebar - Ultra Elegante */}
        <div className="relative pt-6 pb-4 px-4 border-b border-white/10">
          {/* Botão Fechar Mobile */}
          <motion.button
            onClick={() => onToggleOpen?.(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center active:scale-95 transition-all duration-200 hover:bg-white/[0.12] hover:border-white/[0.18]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              className="w-4 h-4 text-white/90" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </motion.button>

          {!isCollapsed && (
            <>
              <div className="md:hidden flex justify-center pt-1 pb-2">
                <span className="h-1 w-12 rounded-full bg-white/20" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white tracking-tight">DUA</h2>
                <p className="text-white/50 text-xs mt-1">Sua assistente criativa</p>
              </motion.div>
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="md:hidden px-3 py-3 border-b border-white/5">
            <div className="flex items-center justify-between text-white/50 text-[10px] uppercase tracking-[0.3em] mb-2">
              <span>Quick Actions</span>
            </div>
            <div className="flex gap-2">
              {mobileActionCards.map((card) => (
                <motion.button
                  key={card.title}
                  onClick={card.onClick}
                  className="group relative flex-1 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-2 py-2.5 text-center text-white/70 overflow-hidden active:scale-95 transition-transform"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <card.icon className="relative z-10 h-4 w-4 text-white/90" />
                  <span className="relative z-10 text-[10px] font-medium leading-tight">{card.title}</span>
                  <span className="relative z-10 text-[9px] text-white/40">{card.subtitle}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 premium-scrollbar">
        {sidebarItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Button
              onClick={item.action}
              variant="ghost"
              className={cn(
                "w-full text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 rounded-xl",
                isCollapsed
                  ? "h-11 px-0 flex items-center justify-center"
                  : "h-11 px-4 flex items-center justify-start gap-3",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 text-left text-sm font-medium">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </Button>
          </motion.div>
        ))}

        {/* Studios Section */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="pt-6 pb-2"
          >
            <div className="px-4 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Studios Criativos</span>
            </div>
          </motion.div>
        )}

        {studioItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (index + 3) * 0.05, duration: 0.3 }}
          >
            <Link href={item.href || "#"}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 rounded-xl group",
                  isCollapsed
                    ? "h-11 px-0 flex items-center justify-center"
                    : "h-11 px-4 flex items-center justify-start gap-3",
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                {!isCollapsed && <span className="flex-1 text-left text-sm font-medium">{item.label}</span>}
              </Button>
            </Link>
          </motion.div>
        ))}

        {/* Community Section */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="pt-6 pb-2"
          >
            <div className="px-4 mb-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Comunidade</span>
            </div>
          </motion.div>
        )}

        {communityItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
          >
            <Link href={item.href || "#"}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 rounded-xl group",
                  isCollapsed
                    ? "h-11 px-0 flex items-center justify-center"
                    : "h-11 px-4 flex items-center justify-start gap-3",
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                {!isCollapsed && <span className="flex-1 text-left text-sm font-medium">{item.label}</span>}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

        {/* History Section with Date Groups */}
        <div className="pt-2">
          <Button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <History className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">Histórico</span>
                {totalConversations > 0 && (
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                    {totalConversations}
                  </span>
                )}
              </>
            )}
          </Button>

          {/* Toggle entre localStorage e Database */}
          {!isCollapsed && isHistoryExpanded && (
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setShowDatabaseHistory(false)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    !showDatabaseHistory
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/50 hover:text-white/70"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Local
                </button>
                <button
                  onClick={() => setShowDatabaseHistory(true)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    showDatabaseHistory
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/50 hover:text-white/70"
                  )}
                >
                  <Database className="w-3.5 h-3.5" />
                  Nuvem
                  {dbLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                </button>
              </div>
            </div>
          )}

          {/* Date Groups - localStorage */}
          {!isCollapsed && isHistoryExpanded && !showDatabaseHistory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-4 max-h-[50vh] overflow-y-auto premium-scrollbar"
            >
              <AnimatePresence mode="popLayout">
                {(Object.keys(groupedConversations) as Array<keyof GroupedConversations>).map((groupKey, groupIndex) => {
                  const group = groupedConversations[groupKey]
                  if (group.length === 0) return null

                  return (
                    <motion.div
                      key={groupKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: groupIndex * 0.05 }}
                      className="space-y-2"
                    >
                      {/* Group Header */}
                      <div className={cn(
                        "mx-2 px-3 py-2 rounded-lg border bg-gradient-to-r backdrop-blur-sm",
                        groupColors[groupKey]
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold uppercase tracking-wider">
                              {groupLabels[groupKey]}
                            </span>
                          </div>
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                            {group.length}
                          </span>
                        </div>
                      </div>

                      {/* Conversations in Group */}
                      <div className="ml-2 mr-1 space-y-1">
                        {group.map((conv, index) => (
                          <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (groupIndex * 0.05) + (index * 0.02) }}
                            className="relative"
                            onMouseEnter={() => setHoveredConvId(conv.id)}
                            onMouseLeave={() => setHoveredConvId(null)}
                          >
                            <button
                              onClick={() => onSelectConversation?.(conv.id)}
                              className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                "hover:bg-white/5 hover:scale-[1.02]",
                                currentConversationId === conv.id
                                  ? "bg-white/10 text-white shadow-lg"
                                  : "text-white/60"
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">
                                    {conv.title || 'Nova conversa'}
                                  </p>
                                  <p className="text-xs text-white/40 mt-0.5">
                                    {new Date(conv.updatedAt).toLocaleTimeString('pt-PT', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </button>

                            {/* Delete Button */}
                            <AnimatePresence>
                              {hoveredConvId === conv.id && (
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteConversation?.(conv.id)
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {totalConversations === 0 && (
                <div className="text-center py-8 text-white/40 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa ainda</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Date Groups - Database */}
          {!isCollapsed && isHistoryExpanded && showDatabaseHistory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-4 max-h-[50vh] overflow-y-auto premium-scrollbar"
            >
              {dbLoading ? (
                <div className="text-center py-8 text-white/40 text-sm">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                  <p>Carregando histórico...</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {(Object.keys(groupedDbSessions) as Array<keyof typeof groupedDbSessions>).map((groupKey, groupIndex) => {
                    const group = groupedDbSessions[groupKey]
                    if (group.length === 0) return null

                    return (
                      <motion.div
                        key={groupKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: groupIndex * 0.05 }}
                        className="space-y-2"
                      >
                        {/* Group Header */}
                        <div className={cn(
                          "mx-2 px-3 py-2 rounded-lg border bg-gradient-to-r backdrop-blur-sm",
                          groupColors[groupKey]
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Database className="w-3.5 h-3.5" />
                              <span className="text-xs font-semibold uppercase tracking-wider">
                                {groupLabels[groupKey]}
                              </span>
                            </div>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                              {group.length}
                            </span>
                          </div>
                        </div>

                        {/* Sessions in Group */}
                        <div className="ml-2 mr-1 space-y-1">
                          {group.map((session, index) => (
                            <motion.div
                              key={session.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (groupIndex * 0.05) + (index * 0.02) }}
                              className="relative"
                              onMouseEnter={() => setHoveredConvId(session.id)}
                              onMouseLeave={() => setHoveredConvId(null)}
                            >
                              <button
                                onClick={() => dbSwitchSession(session.id)}
                                className={cn(
                                  "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                  "hover:bg-white/5 hover:scale-[1.02]",
                                  dbCurrentSession?.id === session.id
                                    ? "bg-white/10 text-white shadow-lg"
                                    : "text-white/60"
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">
                                      {session.title || 'Nova conversa'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-xs text-white/40">
                                        {new Date(session.updatedAt).toLocaleTimeString('pt-PT', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                      <span className="text-xs text-white/30">•</span>
                                      <p className="text-xs text-white/30">
                                        {session.messageCount} msg
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </button>

                              {/* Delete Button */}
                              <AnimatePresence>
                                {hoveredConvId === session.id && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm(`Excluir conversa "${session.title}"?`)) {
                                        dbDeleteSession(session.id)
                                      }
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </motion.button>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}

              {!dbLoading && dbSessions.length === 0 && (
                <div className="text-center py-8 text-white/40 text-sm">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma sessão salva na nuvem</p>
                  <p className="text-xs mt-2">Suas conversas serão sincronizadas automaticamente</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

      {/* Settings Button - Redireciona para página de configurações */}
      <div className="border-t border-white/10 p-3">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 rounded-xl",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left text-sm">Configurações</span>}
          </Button>
        </Link>
      </div>
    </motion.aside>
  )
}
