"use client"

import { useState, useEffect } from "react"
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
  Loader2,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BeamsBackground } from "@/components/ui/beams-background"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { InteractionBar } from "@/components/ui/interaction-bar"
import { GlassmorphismProfileCard } from "@/components/ui/glassmorphism-profile-card"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Admin emails list
const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com'
]

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  total_tokens: number
  tokens_used: number
  tier: string
  created_at: string
}

interface Generation {
  id: string
  user_id: string
  type: string
  prompt: string
  result_url: string | null
  created_at: string
  likes_count: number
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [generations, setGenerations] = useState<Generation[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [params.username])

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error("Acesso negado", { description: "Faça login para continuar" })
        router.push('/login')
        return
      }

      const userEmail = session.user.email || ''
      const adminStatus = ADMIN_EMAILS.includes(userEmail)
      
      setIsAdmin(adminStatus)
      
      if (!adminStatus) {
        toast.error("Acesso restrito", { description: "Esta página é exclusiva para administradores" })
        router.push('/chat')
        return
      }

      // If admin, load profile data
      loadProfileData()
    } catch (error) {
      // PRODUCTION: Removed console.error
      toast.error("Erro de autenticação")
      router.push('/login')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const loadProfileData = async () => {
    try {
      setLoading(true)

      // Get user by display_name or username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`display_name.eq.${params.username},email.ilike.%${params.username}%`)
        .single()

      if (userError) {
        toast.error('Usuário não encontrado')
        router.push('/chat')
        return
      }

      setUserProfile(userData)

      // Load user generations
      const { data: genData, error: genError } = await supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!genError && genData) {
        setGenerations(genData)
      }

    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const getAvatarUrl = (email: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  }

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { name: "Membro", icon: Award, color: "from-gray-500 to-gray-600" },
      basic: { name: "Básico", icon: Award, color: "from-blue-500 to-blue-600" },
      premium: { name: "Premium", icon: Trophy, color: "from-yellow-500 to-orange-500" },
      pro: { name: "Profissional", icon: Rocket, color: "from-purple-500 to-pink-500" }
    }
    return badges[tier as keyof typeof badges] || badges.free
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <BeamsBackground intensity="subtle" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="text-white/60 text-lg">
            {isCheckingAuth ? 'Verificando acesso...' : 'Carregando perfil...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin || !userProfile) {
    return null
  }

  const totalGenerations = generations.length
  const totalLikes = generations.reduce((acc, gen) => acc + (gen.likes_count || 0), 0)
  const tierBadge = getTierBadge(userProfile.tier)
  const availableTokens = userProfile.total_tokens - userProfile.tokens_used

  return (
    <div className="relative w-full min-h-screen">
      <div className="fixed inset-0 z-0">
        <BeamsBackground intensity="subtle" />
      </div>

      <PremiumNavbar className="relative z-50" credits={availableTokens} />

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
                  avatarUrl={userProfile.avatar_url || getAvatarUrl(userProfile.email)}
                  name={userProfile.display_name || userProfile.full_name || userProfile.email}
                  title={`Membro ${tierBadge.name}`}
                  bio={userProfile.bio || "Criador na plataforma DUA"}
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
                      <div className="text-2xl font-bold text-white">{totalGenerations}</div>
                      <div className="text-xs text-white/60 mt-1">Gerações</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-2xl font-bold text-white">{totalLikes}</div>
                      <div className="text-xs text-white/60 mt-1">Likes</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-2xl font-bold text-white">{availableTokens}</div>
                      <div className="text-xs text-white/60 mt-1">Tokens</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                      <div className="text-2xl font-bold text-white">{userProfile.tier.toUpperCase()}</div>
                      <div className="text-xs text-white/60 mt-1">Plano</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 hover:border-white/20 transition-all">
                  <h3 className="text-lg font-semibold text-white">Conquista</h3>
                  <div className="flex flex-col gap-3">
                    <Badge
                      className={`bg-gradient-to-r ${tierBadge.color} text-white border-0 gap-2 py-2 px-4 justify-start hover:scale-105 transition-transform cursor-pointer`}
                    >
                      <tierBadge.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tierBadge.name}</span>
                    </Badge>
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
                      {generations.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-white/60">
                          Nenhuma geração ainda
                        </div>
                      ) : (
                        generations.map((item) => (
                          <div
                            key={item.id}
                            className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
                          >
                            <AspectRatio ratio={1}>
                              {item.result_url ? (
                                <img
                                  src={item.result_url}
                                  alt={item.prompt.substring(0, 50)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                  <ImageIcon className="w-12 h-12 text-white/40" />
                                </div>
                              )}
                            </AspectRatio>
                            <div className="p-4 space-y-2">
                              <h3 className="text-sm font-semibold text-white line-clamp-1">
                                {item.prompt.substring(0, 50)}...
                              </h3>
                              <InteractionBar likes={item.likes_count || 0} comments={0} shares={0} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {generations.filter(g => g.type === 'image').length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-white/60">
                          Nenhuma imagem ainda
                        </div>
                      ) : (
                        generations.filter(g => g.type === 'image').map((item) => (
                          <div
                            key={item.id}
                            className="bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
                          >
                            <AspectRatio ratio={1}>
                              {item.result_url ? (
                                <img
                                  src={item.result_url}
                                  alt={item.prompt.substring(0, 50)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                  <ImageIcon className="w-12 h-12 text-white/40" />
                                </div>
                              )}
                            </AspectRatio>
                            <div className="p-4 space-y-2">
                              <h3 className="text-sm font-semibold text-white line-clamp-1">
                                {item.prompt.substring(0, 50)}...
                              </h3>
                              <InteractionBar likes={item.likes_count || 0} comments={0} shares={0} />
                            </div>
                          </div>
                        ))
                      )}
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
