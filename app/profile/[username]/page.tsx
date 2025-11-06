"use client"

import { useState } from "react"
import { ChatSidebar } from "@/components/ui/chat-sidebar"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Music,
  ImageIcon,
  Video,
  PanelLeftClose,
  PanelLeft,
  Github,
  Linkedin,
  Twitter,
  Award,
  Trophy,
  Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BeamsBackground } from "@/components/ui/beams-background"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { InteractionBar } from "@/components/ui/interaction-bar"
import { GlassmorphismProfileCard } from "@/components/ui/glassmorphism-profile-card"
import { useRouter } from "next/navigation"

const mockUserData = {
  username: "maria_silva",
  displayName: "Maria Silva",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  title: "Artista Digital & Criadora",
  bio: "Criadora de arte digital e fotografia gerada por IA. Apaixonada por explorar novos estilos visuais e técnicas inovadoras.",
  stats: {
    generations: 1234,
    likes: 45678,
    followers: 892,
    following: 234,
  },
  badges: [
    { id: "1", name: "Criador Premium", icon: Award, color: "from-yellow-500 to-orange-500" },
    { id: "2", name: "Top Contribuidor", icon: Trophy, color: "from-purple-500 to-pink-500" },
    { id: "3", name: "Pioneiro", icon: Rocket, color: "from-blue-500 to-cyan-500" },
  ],
  portfolio: [
    {
      id: "1",
      type: "image",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      title: "Cidade Cyberpunk",
      likes: 234,
      comments: 45,
    },
    {
      id: "2",
      type: "image",
      url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
      title: "Retrato Artístico",
      likes: 567,
      comments: 89,
    },
    {
      id: "3",
      type: "image",
      url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
      title: "Paisagem Abstrata",
      likes: 892,
      comments: 123,
    },
    {
      id: "4",
      type: "image",
      url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80",
      title: "Arte Abstrata",
      likes: 456,
      comments: 67,
    },
    {
      id: "5",
      type: "image",
      url: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80",
      title: "Natureza Digital",
      likes: 678,
      comments: 89,
    },
    {
      id: "6",
      type: "image",
      url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
      title: "Espaço Sideral",
      likes: 345,
      comments: 56,
    },
  ],
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const router = useRouter()

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <GlassmorphismProfileCard
                  avatarUrl={mockUserData.avatar}
                  name={mockUserData.displayName}
                  title={mockUserData.title}
                  bio={mockUserData.bio}
                  socialLinks={[
                    { id: "github", icon: Github, label: "GitHub", href: "#" },
                    { id: "linkedin", icon: Linkedin, label: "LinkedIn", href: "#" },
                    { id: "twitter", icon: Twitter, label: "Twitter", href: "#" },
                  ]}
                  actionButton={{
                    text: isFollowing ? "Seguindo" : "Seguir",
                    href: "#",
                  }}
                />

                <div className="mt-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 hover:border-white/20 transition-all">
                  <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-2xl font-bold text-white">{mockUserData.stats.generations}</div>
                      <div className="text-xs text-white/60 mt-1">Gerações</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-2xl font-bold text-white">{mockUserData.stats.likes}</div>
                      <div className="text-xs text-white/60 mt-1">Likes</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-2xl font-bold text-white">{mockUserData.stats.followers}</div>
                      <div className="text-xs text-white/60 mt-1">Seguidores</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-2xl font-bold text-white">{mockUserData.stats.following}</div>
                      <div className="text-xs text-white/60 mt-1">Seguindo</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 hover:border-white/20 transition-all">
                  <h3 className="text-lg font-semibold text-white">Conquistas</h3>
                  <div className="flex flex-col gap-3">
                    {mockUserData.badges.map((badge) => (
                      <Badge
                        key={badge.id}
                        className={`bg-gradient-to-r ${badge.color} text-white border-0 gap-2 py-2 px-4 justify-start hover:scale-105 transition-transform cursor-pointer`}
                      >
                        <badge.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{badge.name}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/settings")}
                  variant="outline"
                  className="w-full mt-6 border-white/10 hover:bg-white/10 bg-transparent text-white gap-2 hover:border-white/20 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Portfolio</h2>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="bg-black/40 backdrop-blur-xl border border-white/10 w-full justify-start">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="images" className="gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Imagens
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="gap-2">
                      <Video className="w-4 h-4" />
                      Vídeos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mockUserData.portfolio.map((item) => (
                        <div
                          key={item.id}
                          className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
                        >
                          <AspectRatio ratio={1}>
                            <img
                              src={item.url || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </AspectRatio>
                          <div className="p-4 space-y-2">
                            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                            <InteractionBar likes={item.likes} comments={item.comments} shares={0} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mockUserData.portfolio.map((item) => (
                        <div
                          key={item.id}
                          className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
                        >
                          <AspectRatio ratio={1}>
                            <img
                              src={item.url || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </AspectRatio>
                          <div className="p-4 space-y-2">
                            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                            <InteractionBar likes={item.likes} comments={item.comments} shares={0} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="videos" className="mt-6">
                    <div className="text-center py-12 text-white/60">Nenhum vídeo ainda</div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
