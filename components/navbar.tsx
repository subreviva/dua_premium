"use client"

import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { supabaseClient } from "@/lib/supabase"
import { getLoginRedirect } from "@/lib/route-protection"
import { CreditsDisplay } from "@/components/ui/credits-display"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [credits, setCredits] = useState<number>(0)
  const { scrollY } = useScroll()

  const navBackground = useTransform(scrollY, [0, 100], ["rgba(10, 10, 10, 0)", "rgba(10, 10, 10, 0.85)"])

  const navBorder = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.15)"])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser()
      setIsAuthenticated(!!authUser)
      setUser(authUser)
      
      if (authUser) {
        // Carregar avatar e créditos da tabela users (fonte única da verdade)
        const { data: balanceData } = await supabaseClient
          .from('duaia_user_balances')
          .select('servicos_creditos')
          .eq('user_id', authUser.id)
          .single();

        // Se existir balance, usar como fonte de verdade
        if (balanceData && balanceData.servicos_creditos !== undefined) {
          setCredits(balanceData.servicos_creditos ?? 0)
        } else {
          // Fallback para users.creditos_servicos
          const { data: userData } = await supabaseClient
            .from('users')
            .select('avatar_url, creditos_servicos')
            .eq('id', authUser.id)
            .single()

          if (userData?.avatar_url) {
            setAvatarUrl(userData.avatar_url)
          }
          if (userData?.creditos_servicos !== undefined) {
            setCredits(userData.creditos_servicos)
          }
        }
      }
    }
    checkAuth()

    // Realtime channel para updates de credits (será criado se houver user)
    let channel: any = null;

    const setupRealtime = async (userId?: string) => {
      try {
        // Limpar canal antigo se existir
        if (channel) {
          await supabaseClient.removeChannel(channel);
          channel = null;
        }

        const uid = userId;
        if (!uid) return;

        channel = supabaseClient
          .channel(`credits-user-${uid}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'duaia_user_balances', filter: `user_id=eq.${uid}` },
            (payload: any) => {
              const newVal = payload.new?.servicos_creditos ?? payload.record?.servicos_creditos;
              if (newVal !== undefined && newVal !== null) {
                setCredits(newVal);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Erro ao configurar realtime credits channel:', err);
      }
    };

    // Inicializar canal realtime após checkAuth
    (async () => {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();
      if (authUser) await setupRealtime(authUser.id);
    })();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session?.user)
      setUser(session?.user || null)

      if (session?.user) {
        // Ao iniciar sessão, carregar o balance real
        const { data: balanceData } = await supabaseClient
          .from('duaia_user_balances')
          .select('servicos_creditos')
          .eq('user_id', session.user.id)
          .single();

        if (balanceData && balanceData.servicos_creditos !== undefined) {
          setCredits(balanceData.servicos_creditos ?? 0)
        } else {
          const { data: userData } = await supabaseClient
            .from('users')
            .select('avatar_url, creditos_servicos')
            .eq('id', session.user.id)
            .single()

          if (userData?.avatar_url) setAvatarUrl(userData.avatar_url)
          if (userData?.creditos_servicos !== undefined) setCredits(userData.creditos_servicos)
        }
        // configurar realtime para o novo user
        await setupRealtime(session.user.id);
      } else {
        setAvatarUrl("")
        setCredits(0)
        // limpar canal quando logout
        if (channel) {
          await supabaseClient.removeChannel(channel);
          channel = null;
        }
      }
    })

    return () => {
      subscription.unsubscribe();
      if (channel) supabaseClient.removeChannel(channel);
    }
  }, [])

  const handleProtectedNavigation = (href: string, label: string) => {
    if (!isAuthenticated && href !== '/community') {
      // Redirecionar para página de acesso com código
      router.push(getLoginRedirect(href))
    } else {
      router.push(href)
    }
    setIsOpen(false)
  }

  const getAvatarUrl = () => {
    if (avatarUrl) return avatarUrl
    const email = user?.email || 'user'
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
  }

  const getInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'DU'
  }

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut()
      setIsOpen(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const navLinks = [
    { label: "Chat", href: "/chat", protected: true },
    { label: "Cinema", href: "/videostudio", protected: true },
    { label: "Design", href: "/designstudio", protected: true },
    { label: "Music", href: "/musicstudio", protected: true },
    { label: "Imagem", href: "/imagestudio", protected: true },
    { label: "Comunidade", href: "/community", protected: false },
  ]

  return (
    <>
      <motion.nav
        style={{
          backgroundColor: navBackground,
          borderColor: navBorder,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-2xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.push("/")}
              className="text-3xl font-extralight text-white tracking-tight hover:text-white/80 transition-colors duration-300"
            >
              DUA
            </motion.button>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:flex items-center gap-8"
            >
              {navLinks.map((link, index) => (
                <button
                  key={link.href}
                  onClick={() => handleProtectedNavigation(link.href, link.label)}
                  className="text-white/70 hover:text-white font-light transition-colors duration-300 text-sm"
                >
                  {link.label}
                </button>
              ))}
            </motion.div>

            {/* Desktop Auth Buttons / User Avatar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex items-center gap-3"
            >
              {isAuthenticated && (
                <>
                  <CreditsDisplay variant="compact" />
                  <Button
                    onClick={() => router.push('/comprar')}
                    className="bg-white/[0.08] hover:bg-white/[0.15] text-white/90 hover:text-white border border-white/15 hover:border-white/25 transition-all duration-300 rounded-full px-5 h-10 text-sm font-medium backdrop-blur-xl active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Comprar
                  </Button>
                </>
              )}
              <div className="hidden lg:block">
                <UserAvatar />
              </div>

              {/* Avatar Mobile - Show on small screens */}
              <div className="lg:hidden">
                <UserAvatar />
              </div>
            </motion.div>

            {/* Mobile Menu Button - Avatar se logado, Menu se não logado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:hidden"
            >
              {isAuthenticated ? (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="relative group outline-none focus:outline-none"
                >
                  <Avatar className="w-10 h-10 border border-white/15 group-hover:border-white/30 transition-all duration-300 cursor-pointer ring-0 group-hover:ring-1 group-hover:ring-white/20 shadow-sm hover:shadow-md">
                    <AvatarImage src={getAvatarUrl()} alt={user?.email || "User"} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white/90 font-medium text-sm backdrop-blur-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-white/90 hover:text-white transition-colors duration-200 active:scale-95 p-2 rounded-2xl hover:bg-white/10"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - REVOLUT/APPLE STYLE PREMIUM */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 right-0 bottom-0 z-40 lg:hidden"
      >
        {/* Backdrop elegante */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-md" 
          onClick={() => setIsOpen(false)} 
        />
        
        <div className="relative h-full flex items-start justify-end pt-20 px-4">
          {/* Container Premium - Como Revolut/Apple */}
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ 
              opacity: isOpen ? 1 : 0, 
              y: isOpen ? 0 : -10,
              scale: isOpen ? 1 : 0.95
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-80 bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header com Avatar e Info (se autenticado) - MINIMALISTA ABSOLUTO */}
            {isAuthenticated && (
              <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3.5 mb-3.5">
                  <Avatar className="w-14 h-14 border-2 border-white/15">
                    <AvatarImage src={getAvatarUrl()} alt={user?.email || "User"} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white font-semibold text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white tracking-tight truncate">
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                    </p>
                    <p className="text-xs text-white/40 truncate tracking-wide">{user?.email}</p>
                  </div>
                </div>
                
                {/* Créditos Card - ULTRA CLEAN */}
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 bg-white/[0.06] px-4 py-3 rounded-2xl border border-white/[0.08]">
                    <p className="text-white/40 text-[11px] font-medium tracking-wider uppercase mb-0.5">Créditos</p>
                    <p className="text-white font-bold text-lg tracking-tight">{credits}</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      router.push('/comprar')
                      setIsOpen(false)
                    }}
                    className="px-5 py-3 bg-white/10 hover:bg-white/[0.15] rounded-2xl text-white text-[15px] font-semibold whitespace-nowrap transition-all border border-white/[0.12]"
                  >
                    Comprar
                  </motion.button>
                </div>
              </div>
            )}

            {/* Menu Items - ULTRA MINIMALISTA */}
            <div className="py-2.5">
              {/* Navegação Principal - Apenas Texto Premium */}
              <div className="px-3 space-y-0.5">
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProtectedNavigation('/chat', 'Chat IA')}
                  className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/90 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                >
                  Chat IA
                </motion.button>
                
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProtectedNavigation('/video-studio', 'Vídeo Studio')}
                  className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/90 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                >
                  Vídeo Studio
                </motion.button>
                
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProtectedNavigation('/design-studio', 'Design Studio')}
                  className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/90 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                >
                  Design Studio
                </motion.button>
                
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProtectedNavigation('/music-studio', 'Music Studio')}
                  className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/90 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                >
                  Music Studio
                </motion.button>
                
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProtectedNavigation('/image-studio', 'Image Studio')}
                  className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/90 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                >
                  Image Studio
                </motion.button>
                
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProtectedNavigation('/comunidade', 'Comunidade')}
                  className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/90 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                >
                  Comunidade
                </motion.button>
              </div>

              {/* Perfil Section (se autenticado) - ULTRA CLEAN */}
              {isAuthenticated && (
                <>
                  <div className="h-px bg-white/[0.06] my-2" />
                  <div className="px-3 space-y-0.5">
                    <motion.button
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        router.push('/perfil')
                        setIsOpen(false)
                      }}
                      className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/80 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                    >
                      Meu Perfil
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        router.push('/configuracoes')
                        setIsOpen(false)
                      }}
                      className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/80 hover:text-white font-medium text-[15px] transition-all tracking-tight"
                    >
                      Configurações
                    </motion.button>
                  </div>
                </>
              )}

              {/* Bottom Section - MINIMALISTA ABSOLUTO */}
              <div className="h-px bg-white/[0.06] my-2" />
              <div className="px-3 pb-3 space-y-0.5">
                <motion.button
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
                    if (isIOS) {
                      alert('Para instalar:\n1. Toque no botão compartilhar (📤)\n2. Selecione "Adicionar à Tela de Início"')
                    }
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/60 hover:text-white/90 text-[15px] font-medium transition-all tracking-tight"
                >
                  Instalar App
                </motion.button>

                {/* Logout (se autenticado) */}
                {isAuthenticated && (
                  <motion.button
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3.5 rounded-2xl hover:bg-white/[0.07] active:bg-white/[0.04] text-white/60 hover:text-white/90 text-[15px] font-medium transition-all tracking-tight"
                  >
                    Sair
                  </motion.button>
                )}

                {/* Botões de Acesso (não autenticados) - CLEAN & BOLD */}
                {!isAuthenticated && (
                  <div className="space-y-2 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        router.push('/acesso')
                        setIsOpen(false)
                      }}
                      className="w-full bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.12] rounded-2xl h-11 text-[15px] font-semibold transition-all tracking-tight"
                    >
                      Obter Acesso
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        router.push('/registo')
                        setIsOpen(false)
                      }}
                      className="w-full bg-white text-black hover:bg-white/95 rounded-2xl h-11 text-[15px] font-bold transition-all shadow-2xl shadow-white/20 tracking-tight"
                    >
                      Criar Conta
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
