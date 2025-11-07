"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  ShoppingCart, 
  Download, 
  Music, 
  ImageIcon, 
  Video, 
  Palette,
  TrendingUp,
  Clock,
  Coins,
  Filter,
  Search
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { PublicarItemModal } from "@/components/mercado/publicar-item-modal"
import { ItemCard } from "@/components/mercado/item-card"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface MercadoItem {
  id: string
  titulo: string
  descricao: string
  categoria: string
  preco: number
  preview_url: string
  ficheiro_url: string
  downloads: number
  vendas: number
  criado_em: string
  vendedor_nome: string
  vendedor_avatar: string
}

const categorias = [
  { id: 'todos', nome: 'Todos', icon: TrendingUp },
  { id: 'beat', nome: 'Beats', icon: Music },
  { id: 'imagem', nome: 'Imagens', icon: ImageIcon },
  { id: 'quadro', nome: 'Quadros', icon: Palette },
  { id: 'video', nome: 'Vídeos', icon: Video },
  { id: 'capa', nome: 'Capas', icon: ImageIcon },
  { id: 'arte', nome: 'Arte', icon: Palette },
]

export default function MercadoPage() {
  const [itens, setItens] = useState<MercadoItem[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')
  const [isLoading, setIsLoading] = useState(true)
  const [showPublicarModal, setShowPublicarModal] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkAuth()
    carregarItens()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
    
    if (session) {
      const { data } = await supabase
        .from('users')
        .select('credits')
        .eq('id', session.user.id)
        .single()
      
      if (data) setUserCredits(data.credits)
    }
  }

  const carregarItens = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .rpc('listar_itens_mercado', {
          p_categoria: categoriaAtiva === 'todos' ? null : categoriaAtiva,
          p_limite: 50,
          p_offset: 0
        })

      if (error) throw error
      setItens(data || [])
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
      toast.error('Erro ao carregar itens do mercado')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarItens()
  }, [categoriaAtiva])

  const itensFiltrados = itens.filter(item =>
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      
      <PremiumNavbar 
        showBackButton 
        backLink="/" 
        variant="solid"
        credits={isAuthenticated ? userCredits : undefined}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                DUA Creative <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Market</span>
              </h1>
              <p className="text-white/70 text-lg">
                Marketplace de conteúdos digitais criados pela comunidade
              </p>
            </div>

            {isAuthenticated && (
              <Button
                onClick={() => setShowPublicarModal(true)}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Publicar Conteúdo
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-medium">Total de Itens</span>
              </div>
              <p className="text-2xl font-bold text-white">{itens.length}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Download className="w-4 h-4" />
                <span className="text-xs font-medium">Downloads</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {itens.reduce((acc, item) => acc + item.downloads, 0)}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-pink-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Vendas</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {itens.reduce((acc, item) => acc + item.vendas, 0)}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-xs font-medium">Seus Créditos</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {isAuthenticated ? userCredits : '---'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Pesquisar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categorias.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                variant="ghost"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                  ${categoriaAtiva === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }
                `}
              >
                <cat.icon className="w-4 h-4" />
                {cat.nome}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Grid de Itens */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-80 animate-pulse"
              />
            ))}
          </div>
        ) : itensFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-white/60">
              {searchTerm ? 'Tente uma pesquisa diferente' : 'Seja o primeiro a publicar nesta categoria!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {itensFiltrados.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                userCredits={userCredits}
                isAuthenticated={isAuthenticated}
                onCompraRealizada={() => {
                  checkAuth()
                  carregarItens()
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal de Publicação */}
      <AnimatePresence>
        {showPublicarModal && (
          <PublicarItemModal
            onClose={() => setShowPublicarModal(false)}
            onSuccess={() => {
              setShowPublicarModal(false)
              carregarItens()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
