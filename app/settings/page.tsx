"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/ui/chat-sidebar"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Settings, 
  Bell, 
  Lock, 
  Menu, 
  User, 
  CreditCard, 
  Trash2, 
  LogOut,
  CheckCircle,

  Shield,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { supabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

// Admin emails list
const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com'
]

// User data interface with all subscription details
interface UserData {
  id: string
  email: string
  display_name: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  total_tokens: number
  tokens_used: number
  subscription_tier: string
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  profile_visibility: string
  created_at: string
  last_login: string | null
}

// Tier features configuration
const TIER_FEATURES = {
  free: [
    "100 tokens iniciais",
    "Acesso básico aos modelos",
    "Geração de músicas standard",
    "Perfil público",
  ],
  basic: [
    "500 tokens/mês",
    "Todos os recursos Free",
    "Modelos avançados",
    "Geração prioritária",
    "Histórico de 30 dias",
  ],
  premium: [
    "2000 tokens/mês",
    "Todos os recursos Basic",
    "Acesso a modelos premium",
    "Geração ultra-rápida",
    "Histórico ilimitado",
    "Suporte prioritário",
  ],
  pro: [
    "5000 tokens/mês",
    "Todos os recursos Premium",
    "API access",
    "Modelos experimentais",
    "Suporte dedicado 24/7",
    "Análises avançadas",
  ],
}

export default function SettingsPage() {
  const router = useRouter()
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Admin check
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // User data state - NO MORE MOCK DATA
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form state for editable fields
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState("public")
  
  // UI states
  const [saving, setSaving] = useState(false)

  // Check admin access first
  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      
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

      // If admin, load data
      loadUserData()
    } catch (error) {
      // PRODUCTION: Removed console.error('Erro ao verificar acesso:', error)
      toast.error("Erro de autenticação")
      router.push('/login')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  // Fetch real user data from Supabase
  async function loadUserData() {
    try {
      setLoading(true)
      
      // Get current session
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch user data
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      if (data) {
        setUserData(data)
        // Populate form fields
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
        setEmailNotifications(data.email_notifications ?? true)
        setPushNotifications(data.push_notifications ?? true)
        setMarketingEmails(data.marketing_emails ?? false)
        setProfileVisibility(data.profile_visibility || 'public')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!userData) return

    try {
      setSaving(true)

      const { error } = await supabaseClient
        .from('users')
        .update({
          display_name: displayName,
          bio: bio,
        })
        .eq('id', userData.id)

      if (error) throw error

      // Reload data
      await loadUserData()
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveNotifications() {
    if (!userData) return

    try {
      setSaving(true)

      const { error } = await supabaseClient
        .from('users')
        .update({
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          marketing_emails: marketingEmails,
        })
        .eq('id', userData.id)

      if (error) throw error

      await loadUserData()
      alert('Notificações atualizadas com sucesso!')
    } catch (error) {
      console.error('Error saving notifications:', error)
      alert('Erro ao salvar notificações')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePrivacy() {
    if (!userData) return

    try {
      setSaving(true)

      const { error } = await supabaseClient
        .from('users')
        .update({
          profile_visibility: profileVisibility,
        })
        .eq('id', userData.id)

      if (error) throw error

      await loadUserData()
      alert('Privacidade atualizada com sucesso!')
    } catch (error) {
      console.error('Error saving privacy:', error)
      alert('Erro ao salvar privacidade')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoutThisDevice() {
    try {
      await supabaseClient.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  async function handleLogoutAllDevices() {
    try {
      // Sign out globally (invalidates all sessions)
      await supabaseClient.auth.signOut({ scope: 'global' })
      router.push('/login')
    } catch (error) {
      console.error('Error logging out all devices:', error)
    }
  }

  async function handleDeleteAccount() {
    if (!userData) return
    
    const confirmed = window.confirm(
      'TEM CERTEZA? Esta ação é IRREVERSÍVEL e apagará:\n\n' +
      '• Todos os seus dados\n' +
      '• Todas as suas criações\n' +
      '• Todo o seu histórico\n' +
      '• Sua subscrição\n\n' +
      'Digite "ELIMINAR" para confirmar'
    )
    
    if (confirmed) {
      const confirmText = window.prompt('Digite ELIMINAR para confirmar:')
      if (confirmText === 'ELIMINAR') {
        try {
          // Call admin API to delete user (needs to be implemented)
          const response = await fetch('/api/admin/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userData.id })
          })

          if (response.ok) {
            await supabaseClient.auth.signOut()
            router.push('/')
          } else {
            alert('Erro ao eliminar conta')
          }
        } catch (error) {
          console.error('Error deleting account:', error)
          alert('Erro ao eliminar conta')
        }
      }
    }
  }

  function getTierBadgeColor(tier: string) {
    switch (tier) {
      case 'pro':
        return 'from-yellow-500 to-orange-500'
      case 'premium':
        return 'from-purple-500 to-pink-500'
      case 'basic':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  function getTierName(tier: string) {
    switch (tier) {
      case 'pro':
        return 'DUA Pro'
      case 'premium':
        return 'DUA Premium'
      case 'basic':
        return 'DUA Basic'
      default:
        return 'DUA Free'
    }
  }

  function calculateRenewalDate() {
    if (!userData) return ''
    const created = new Date(userData.created_at)
    const nextMonth = new Date(created)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  function getAvatarUrl(email: string) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-white/60">
            {isCheckingAuth ? 'Verificando acesso...' : 'Carregando dados...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin || !userData) {
    return null
  }

  const availableTokens = userData.total_tokens - userData.tokens_used
  const tierFeatures = TIER_FEATURES[userData.subscription_tier as keyof typeof TIER_FEATURES] || TIER_FEATURES.free

  return (
    <div className="relative flex h-screen overflow-hidden bg-black">
      <BeamsBackground />
      
      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleOpen={setIsSidebarOpen}
        onToggleCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarOpen ? (isSidebarCollapsed ? 'ml-16' : 'ml-80') : 'ml-0'
      }`}>
        
        {/* Navbar */}
        <PremiumNavbar />

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-5xl mx-auto p-6 md:p-10 space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Definições</h1>
                <p className="text-white/60">Gerir a sua conta e preferências</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>

            {/* Subscription Card - ChatGPT Plus Style */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge className={`bg-gradient-to-r ${getTierBadgeColor(userData.subscription_tier)} text-white px-4 py-1.5 text-base`}>
                        {getTierName(userData.subscription_tier)}
                      </Badge>
                      {userData.subscription_tier !== 'free' && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <CardTitle className="text-2xl text-white">
                      Subscrição Ativa
                    </CardTitle>
                    {userData.subscription_tier !== 'free' ? (
                      <CardDescription className="text-white/70 text-base">
                        O seu plano renova a {calculateRenewalDate()}
                      </CardDescription>
                    ) : (
                      <CardDescription className="text-white/70 text-base">
                        Atualize para desbloquear recursos premium
                      </CardDescription>
                    )}
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    P
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tokens Display */}
                <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Tokens Disponíveis</span>
                    <span className="text-2xl font-bold text-white">{availableTokens}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${(availableTokens / userData.total_tokens) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-white/50">
                    <span>{userData.tokens_used} usados</span>
                    <span>{userData.total_tokens} total</span>
                  </div>
                </div>

                {/* Features List */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Recursos Incluídos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tierFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-white/70 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manage Subscription Button */}
                <div className="flex gap-3">
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex-1"
                    onClick={() => router.push('/comprar')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {userData.subscription_tier === 'free' ? 'Fazer Upgrade' : 'Gerir Subscrição'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10 p-1">
                <TabsTrigger value="profile" className="data-[state=active]:bg-white/10">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="privacy" className="data-[state=active]:bg-white/10">
                  <Lock className="h-4 w-4 mr-2" />
                  Privacidade
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-white/10">
                  <Settings className="h-4 w-4 mr-2" />
                  Conta
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Informações do Perfil</CardTitle>
                    <CardDescription className="text-white/60">
                      Atualize os seus dados pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="space-y-2">
                      <Label className="text-white">Foto de Perfil</Label>
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          src={userData.avatar_url || getAvatarUrl(userData.email)}
                          fallback={userData.email[0].toUpperCase()}
                          size="xl"
                        />
                        <div className="text-sm text-white/70">
                          <p>Avatar gerado automaticamente</p>
                          <p className="text-xs text-white/50">Baseado no seu email</p>
                        </div>
                      </div>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        disabled
                        className="bg-white/5 border-white/10 text-white/50"
                      />
                      <p className="text-xs text-white/50">O email não pode ser alterado</p>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-white">Nome de Exibição</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Como quer ser chamado?"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-white">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                        placeholder="Conte-nos sobre você..."
                      />
                    </div>

                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {saving ? 'Guardando...' : 'Guardar Alterações'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Preferências de Notificações</CardTitle>
                    <CardDescription className="text-white/60">
                      Escolha como quer ser notificado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-white">Email Notifications</Label>
                        <p className="text-sm text-white/60">Receber notificações por email</p>
                      </div>
                      <Switch 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-white">Push Notifications</Label>
                        <p className="text-sm text-white/60">Notificações do navegador</p>
                      </div>
                      <Switch 
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-white">Marketing Emails</Label>
                        <p className="text-sm text-white/60">Novidades e ofertas especiais</p>
                      </div>
                      <Switch 
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>

                    <Button 
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {saving ? 'Guardando...' : 'Guardar Preferências'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Privacidade e Segurança</CardTitle>
                    <CardDescription className="text-white/60">
                      Controle a visibilidade do seu perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-white">Visibilidade do Perfil</Label>
                      <select
                        value={profileVisibility}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2"
                      >
                        <option value="public">Público - Visível para todos</option>
                        <option value="private">Privado - Apenas você</option>
                      </select>
                    </div>

                    <Button 
                      onClick={handleSavePrivacy}
                      disabled={saving}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {saving ? 'Guardando...' : 'Guardar Alterações'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Tab - ChatGPT Plus Style */}
              <TabsContent value="account">
                <div className="space-y-6">
                  
                  {/* Session Management */}
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        Gestão de Sessões
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Termine sessões ativas nos seus dispositivos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        variant="outline"
                        onClick={handleLogoutThisDevice}
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Terminar Sessão Neste Dispositivo
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={handleLogoutAllDevices}
                        className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Terminar Sessão em Todos os Dispositivos
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Payment Management */}
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Pagamento
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Gerir métodos de pagamento e faturas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => router.push('/comprar')}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        Gerir Pagamentos
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Account Deletion - Danger Zone */}
                  <Card className="bg-red-500/10 backdrop-blur-xl border-red-500/20">
                    <CardHeader>
                      <CardTitle className="text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Zona de Perigo
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Ações irreversíveis na sua conta
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Eliminar Conta</h4>
                        <p className="text-white/70 text-sm mb-4">
                          Esta ação é permanente e irá eliminar:
                        </p>
                        <ul className="text-white/60 text-sm space-y-1 mb-4 list-disc list-inside">
                          <li>Todos os seus dados pessoais</li>
                          <li>Todo o histórico de criações</li>
                          <li>Tokens e subscrição</li>
                          <li>Acesso à plataforma</li>
                        </ul>
                        <Button 
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar Conta Permanentemente
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

          </div>
        </div>
      </div>
    </div>
  )
}
