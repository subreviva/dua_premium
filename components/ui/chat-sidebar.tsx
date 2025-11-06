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
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from 'framer-motion'

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
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null)

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
  const totalConversations = conversations.length

  if (!isOpen) return null

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out z-60 flex flex-col pt-20",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 premium-scrollbar">
        {sidebarItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.action}
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            {!isCollapsed && item.badge && <span className="text-xs text-white/40">{item.badge}</span>}
          </Button>
        ))}

        {/* Studios Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-2">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Studios</span>
            </div>
          </div>
        )}

        {studioItems.map((item, index) => (
          <Link key={index} href={item.href || "#"}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
                isCollapsed
                  ? "h-10 px-0 flex items-center justify-center"
                  : "h-10 px-3 flex items-center justify-start gap-3",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            </Button>
          </Link>
        ))}

        {/* Community Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-2">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Comunidade</span>
            </div>
          </div>
        )}

        {communityItems.map((item, index) => (
          <Link key={index} href={item.href || "#"}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
                isCollapsed
                  ? "h-10 px-0 flex items-center justify-center"
                  : "h-10 px-3 flex items-center justify-start gap-3",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            </Button>
          </Link>
        ))}

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

          {/* Date Groups */}
          {!isCollapsed && isHistoryExpanded && (
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
        </div>
      </div>

      {/* Settings Button - Redireciona para página de configurações */}
      <div className="border-t border-white/5 p-2">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-left text-sm">Definições</span>}
          </Button>
        </Link>
      </div>

      {/* User Profile */}
      <div className="border-t border-white/5 p-2">
        <Link href="/profile/maria_silva">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors",
              isCollapsed
                ? "h-10 px-0 flex items-center justify-center"
                : "h-10 px-3 flex items-center justify-start gap-3",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && <span className="flex-1 text-left text-sm">Perfil</span>}
          </Button>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-white/5 p-2">
        <Button
          onClick={handleToggleCollapsed}
          variant="ghost"
          size="icon"
          className="w-full text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  )
}
