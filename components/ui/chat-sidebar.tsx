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
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface SidebarItem {
  icon: React.ElementType
  label: string
  href?: string
  action?: () => void
  badge?: string
}

interface HistoryItem {
  id: string
  title: string
  date: string
}

interface ChatSidebarProps {
  isOpen?: boolean
  isCollapsed: boolean
  onToggleOpen?: (open: boolean) => void
  onToggleCollapsed?: (collapsed: boolean) => void
}

export function ChatSidebar({
  isOpen = true,
  isCollapsed: externalCollapsed = false,
  onToggleOpen,
  onToggleCollapsed,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [settings, setSettings] = useState({
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    language: "pt",
    voiceEnabled: true,
    autoSave: true,
    streamResponse: true,
  })

  useEffect(() => {
    setIsCollapsed(externalCollapsed)
  }, [externalCollapsed])

  useEffect(() => {
    const savedSettings = localStorage.getItem("chatSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("chatSettings", JSON.stringify(newSettings))
  }

  const handleToggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onToggleCollapsed?.(newCollapsed)
  }

  const sidebarItems: SidebarItem[] = [
    { icon: Search, label: "Buscar", action: () => console.log("[v0] Search"), badge: "⌘K" },
    { icon: MessageSquarePlus, label: "Nova conversa", action: () => window.location.reload() },
    { icon: Mic, label: "Voz", action: () => console.log("[v0] Voice") },
  ]

  const studioItems: SidebarItem[] = [
    { icon: Music, label: "DUA MUSIC", href: "/musicstudio" },
    { icon: Palette, label: "DUA DESIGN", href: "/designstudio" },
    { icon: ImageIcon, label: "DUA IMAGEM", href: "/imagestudio" },
    { icon: Video, label: "DUA CINEMA", href: "/videostudio" },
  ]

  const communityItems: SidebarItem[] = [{ icon: Users, label: "Comunidade", href: "/community" }]

  const historyItems: HistoryItem[] = [
    { id: "1", title: "Hoje", date: "Today" },
    { id: "2", title: "Últimas notícias de 24 de outubro", date: "Yesterday" },
  ]

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

        {/* History Section */}
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
            {!isCollapsed && <span className="flex-1 text-left text-sm">Histórico</span>}
          </Button>

          {!isCollapsed && isHistoryExpanded && (
            <div className="ml-8 mt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => console.log("[v0] History item:", item.id)}
                  className="w-full text-left px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.title}
                </button>
              ))}
              <button
                onClick={() => console.log("[v0] View all history")}
                className="w-full text-left px-3 py-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-colors"
              >
                Ver todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <div className="border-t border-white/5 p-2">
        <Dialog>
          <DialogTrigger asChild>
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
          </DialogTrigger>
          <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Definições do Chat</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Configure a experiência do seu chat premium
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium">
                  Modelo de IA
                </Label>
                <Select value={settings.model} onValueChange={(value) => updateSettings("model", value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 text-white">
                    <SelectItem value="gpt-4">GPT-4 (Mais inteligente)</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5 (Mais rápido)</SelectItem>
                    <SelectItem value="claude-3">Claude 3 (Criativo)</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro (Versátil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature/Creativity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Criatividade</Label>
                  <span className="text-xs text-neutral-400">{settings.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([value]) => updateSettings("temperature", value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-neutral-500">
                  Menor = mais preciso e focado | Maior = mais criativo e variado
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Tamanho da Resposta</Label>
                  <span className="text-xs text-neutral-400">{settings.maxTokens} tokens</span>
                </div>
                <Slider
                  value={[settings.maxTokens]}
                  onValueChange={([value]) => updateSettings("maxTokens", value)}
                  min={500}
                  max={4000}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">
                  Idioma
                </Label>
                <Select value={settings.language} onValueChange={(value) => updateSettings("language", value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 text-white">
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Enabled */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Entrada de Voz</Label>
                  <p className="text-xs text-neutral-500">Ativar gravação de áudio</p>
                </div>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => updateSettings("voiceEnabled", checked)}
                />
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Guardar Automaticamente</Label>
                  <p className="text-xs text-neutral-500">Salvar conversas automaticamente</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSettings("autoSave", checked)}
                />
              </div>

              {/* Stream Response */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Resposta em Tempo Real</Label>
                  <p className="text-xs text-neutral-500">Ver resposta enquanto é gerada</p>
                </div>
                <Switch
                  checked={settings.streamResponse}
                  onCheckedChange={(checked) => updateSettings("streamResponse", checked)}
                />
              </div>

              {/* Keyboard Shortcuts */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="text-sm font-medium">Atalhos de Teclado</Label>
                <div className="space-y-2 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>Abrir/Fechar Barra Lateral</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl+B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Nova Conversa</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl+N</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Buscar</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded">⌘K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Enviar Mensagem</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Nova Linha</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded">Shift+Enter</kbd>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
