"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { 
  Download, 
  ShoppingCart, 
  Music, 
  ImageIcon, 
  Video, 
  Palette,
  User,
  Coins,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabaseClient } from '@/lib/supabase';
import { toast } from 'sonner'

const supabase = supabaseClient;

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

interface ItemCardProps {
  item: MercadoItem
  index: number
  userCredits: number
  isAuthenticated: boolean
  onCompraRealizada: () => void
}

const categoriaIcons: Record<string, any> = {
  beat: Music,
  imagem: ImageIcon,
  video: Video,
  quadro: Palette,
  capa: ImageIcon,
  arte: Palette,
}

export function ItemCard({ item, index, userCredits, isAuthenticated, onCompraRealizada }: ItemCardProps) {
  const [isComprandoLoading, setIsComprandoLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const IconeCategoria = categoriaIcons[item.categoria] || Palette

  const handleComprar = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para comprar')
      return
    }

    if (userCredits < item.preco) {
      toast.error(`Créditos insuficientes. Precisa de ${item.preco} DUA Coins`)
      return
    }

    try {
      setIsComprandoLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente')
        return
      }

      const { data, error } = await supabase
        .rpc('processar_compra_mercado', {
          p_item_id: item.id,
          p_comprador_id: session.user.id
        })

      if (error) throw error

      if (data.sucesso) {
        toast.success(`Compra realizada! ${item.preco} DUA Coins debitados`, {
          description: 'A fazer download...'
        })

        // Fazer download
        window.open(data.download_url, '_blank')

        // Atualizar estado
        onCompraRealizada()
      } else {
        toast.error(data.erro || 'Erro ao processar compra')
      }
    } catch (error: any) {
      console.error('Erro ao comprar:', error)
      toast.error(error.message || 'Erro ao processar compra')
    } finally {
      setIsComprandoLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20"
    >
      {/* Preview */}
      <div className="relative aspect-square overflow-hidden bg-black/40">
        {item.preview_url ? (
          <img
            src={item.preview_url}
            alt={item.titulo}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconeCategoria className="w-20 h-20 text-white/20" />
          </div>
        )}

        {/* Overlay com info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            {item.descricao && (
              <p className="text-sm text-white/90 line-clamp-2">
                {item.descricao}
              </p>
            )}
          </div>
        </div>

        {/* Badge categoria */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/60 backdrop-blur-xl border-white/20 text-white text-xs flex items-center gap-1">
            <IconeCategoria className="w-3 h-3" />
            {item.categoria}
          </Badge>
        </div>

        {/* Stats */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {item.vendas > 0 && (
            <Badge className="bg-black/60 backdrop-blur-xl border-white/20 text-white text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {item.vendas}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {item.titulo}
        </h3>

        {/* Vendedor */}
        <div className="flex items-center gap-2">
          {item.vendedor_avatar ? (
            <img
              src={item.vendedor_avatar}
              alt={item.vendedor_nome}
              className="w-6 h-6 rounded-full border border-white/20"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-3 h-3 text-white/60" />
            </div>
          )}
          <span className="text-sm text-white/60">{item.vendedor_nome}</span>
        </div>

        {/* Preço e Botão */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{item.preco}</span>
            <span className="text-sm text-white/60">DUA</span>
          </div>

          <Button
            onClick={handleComprar}
            disabled={isComprandoLoading || !isAuthenticated}
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isComprandoLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Comprar
              </>
            )}
          </Button>
        </div>

        {/* Info adicional */}
        {item.downloads > 0 && (
          <div className="flex items-center gap-1 text-xs text-white/40 pt-1">
            <Download className="w-3 h-3" />
            {item.downloads} downloads
          </div>
        )}
      </div>
    </motion.div>
  )
}
