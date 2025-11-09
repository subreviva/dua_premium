"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Music, Film, Palette, Sparkles, User, Bell, Zap, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

const tabs = [
  { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat", gradient: "from-blue-500 to-cyan-500" },
  { id: "music", label: "Música", icon: Music, path: "/studio", gradient: "from-purple-500 to-pink-500" },
  { id: "video", label: "Vídeo", icon: Film, path: "/videostudio", gradient: "from-orange-500 to-red-500" },
  { id: "design", label: "Design", icon: Palette, path: "/design-studio", gradient: "from-green-500 to-emerald-500" },
]

const quickActions = [
  { title: "Nova Conversa", icon: MessageCircle, path: "/chat", color: "blue" },
  { title: "Criar Música", icon: Music, path: "/studio/criar", color: "purple" },
  { title: "Gerar Vídeo", icon: Film, path: "/videostudio/criar", color: "orange" },
  { title: "Design AI", icon: Palette, path: "/design-studio", color: "green" },
]

const recentActivity = [
  { type: "chat", title: "Conversa sobre IA", time: "2h atrás" },
  { type: "music", title: "Track Eletrônico", time: "5h atrás" },
  { type: "video", title: "Vídeo Cinematográfico", time: "1d atrás" },
]

export default function MobileHomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("chat")
  const [showProfile, setShowProfile] = useState(false)

  // Prevenir scroll bounce no iOS
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header com Safe Area */}
      <div className="bg-gradient-to-b from-black via-black/95 to-transparent pt-safe pb-4 px-6 border-b border-white/5 backdrop-blur-xl relative z-50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">DUA AI</h1>
              <p className="text-xs text-white/40">Bem-vindo de volta</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-6">
        {/* Quick Actions */}
        <div className="py-6">
          <h2 className="text-sm font-medium text-white/60 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(action.path)}
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all active:scale-95"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br from-${action.color}-500/20 to-${action.color}-600/20 border border-${action.color}-500/20 mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-white text-left">
                  {action.title}
                </h3>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/60">Recentes</h2>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Ver tudo
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl active:bg-white/10 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {item.type === 'chat' && <MessageCircle className="w-5 h-5 text-blue-400" />}
                  {item.type === 'music' && <Music className="w-5 h-5 text-purple-400" />}
                  {item.type === 'video' && <Film className="w-5 h-5 text-orange-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white">{item.title}</h3>
                  <p className="text-xs text-white/40">{item.time}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="py-6 mb-6"
        >
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"></div>
            <Sparkles className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">
              IA de Última Geração
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Chat, música, vídeo e design - tudo em um lugar
            </p>
            <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all">
              Explorar recursos
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/5 backdrop-blur-2xl pb-safe z-50">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  router.push(tab.path)
                }}
                className="relative flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all active:scale-95"
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-20 rounded-2xl`}
                    transition={{ type: "spring", duration: 0.6 }}
                  />
                )}

                {/* Icon */}
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-white' : 'text-white/40'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r ${tab.gradient} rounded-full`}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Profile Drawer */}
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-black border-l border-white/10 z-50 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Perfil</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-6 right-6 text-white/60 hover:text-white"
              >
                ✕
              </button>
              {/* Profile content */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
