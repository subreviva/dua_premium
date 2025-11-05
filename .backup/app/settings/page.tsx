"use client"

import { useState } from "react"
import { ChatSidebar } from "@/components/ui/chat-sidebar"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Lock, Palette, PanelLeftClose, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { BeamsBackground } from "@/components/ui/beams-background"

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [avatar, setAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=User")
  const [displayName, setDisplayName] = useState("Maria Silva")
  const [username, setUsername] = useState("maria_silva")
  const [bio, setBio] = useState("Artista digital e criadora de conteúdo")
  const [email, setEmail] = useState("maria@example.com")

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleAvatarUpload = (file: File) => {
    // console.log("[v0] Avatar uploaded:", file.name)
    // In a real app, upload to server and get URL
  }

  return (
    <div className="relative w-full min-h-screen">
      <div className="fixed inset-0 z-0">
        <BeamsBackground intensity="subtle" />
      </div>

      <PremiumNavbar className="relative z-50" credits={250} />

      <ChatSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleOpen={setIsSidebarOpen}
        onToggleCollapsed={setIsSidebarCollapsed}
      />

      <Button
        onClick={toggleSidebar}
        className={cn(
          "fixed top-20 z-50 transition-all duration-300",
          "bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-black/80",
          "text-white shadow-lg hover:shadow-xl",
          "w-10 h-10 p-0 rounded-full",
          isSidebarOpen ? (isSidebarCollapsed ? "left-20" : "left-[272px]") : "left-4",
        )}
        size="icon"
      >
        {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
      </Button>

      <div
        className={cn(
          "relative z-10 transition-all duration-300 min-h-screen pt-20",
          isSidebarOpen ? (isSidebarCollapsed ? "ml-16" : "ml-0 lg:ml-64") : "ml-0",
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Definições</h1>
            <p className="text-white/70">Gerencie sua conta e preferências</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-black/40 backdrop-blur-xl border border-white/10">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Lock className="w-4 h-4" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="w-4 h-4" />
                Aparência
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-white">Foto de Perfil</Label>
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      src={avatar}
                      fallback={displayName[0]}
                      size="xl"
                      editable
                      onUpload={handleAvatarUpload}
                    />
                    <div className="text-sm text-white/70">
                      <p>Clique na imagem para alterar</p>
                      <p className="text-xs text-white/50">JPG, PNG ou GIF. Máx 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">
                    Nome de Exibição
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">
                    Nome de Utilizador
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">
                    Biografia
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    placeholder="Conte-nos sobre você..."
                  />
                </div>

                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Guardar Alterações
                </Button>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Novos Seguidores</Label>
                    <p className="text-sm text-white/60">Receber notificações de novos seguidores</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Likes e Comentários</Label>
                    <p className="text-sm text-white/60">Notificações de interações nas suas criações</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Menções</Label>
                    <p className="text-sm text-white/60">Quando alguém menciona você</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Atualizações da Plataforma</Label>
                    <p className="text-sm text-white/60">Novidades e recursos</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Perfil Público</Label>
                    <p className="text-sm text-white/60">Permitir que outros vejam seu perfil</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Mostrar Estatísticas</Label>
                    <p className="text-sm text-white/60">Exibir contadores de likes e visualizações</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Criações Públicas por Padrão</Label>
                    <p className="text-sm text-white/60">Novas criações são públicas automaticamente</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Modo Escuro</Label>
                    <p className="text-sm text-white/60">Sempre ativado para melhor experiência</p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Animações</Label>
                    <p className="text-sm text-white/60">Efeitos visuais e transições</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Efeitos de Fundo</Label>
                    <p className="text-sm text-white/60">Backgrounds animados premium</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
