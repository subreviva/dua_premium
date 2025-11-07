"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Upload, Coins, FileText, Tag, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PublicarItemModalProps {
  onClose: () => void
  onSuccess: () => void
}

const categorias = [
  { id: 'beat', nome: 'Beat' },
  { id: 'imagem', nome: 'Imagem' },
  { id: 'quadro', nome: 'Quadro' },
  { id: 'video', nome: 'Vídeo' },
  { id: 'capa', nome: 'Capa' },
  { id: 'arte', nome: 'Arte' },
  { id: 'template', nome: 'Template' },
  { id: 'outro', nome: 'Outro' },
]

export function PublicarItemModal({ onClose, onSuccess }: PublicarItemModalProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('beat')
  const [preco, setPreco] = useState(10)
  const [ficheiro, setFicheiro] = useState<File | null>(null)
  const [preview, setPreview] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFicheiroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Ficheiro muito grande. Máximo 50MB')
        return
      }
      setFicheiro(file)
    }
  }

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que é imagem
      if (!file.type.startsWith('image/')) {
        toast.error('Preview deve ser uma imagem')
        return
      }
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem de preview muito grande. Máximo 5MB')
        return
      }
      setPreview(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titulo || !ficheiro || !categoria) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (preco < 0) {
      toast.error('Preço deve ser maior ou igual a 0')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente')
        return
      }

      // 1. Upload do ficheiro principal
      const ficheiroPath = `${session.user.id}/${Date.now()}_${ficheiro.name}`
      setUploadProgress(30)

      const { data: ficheiroData, error: ficheiroError } = await supabase.storage
        .from('mercado')
        .upload(ficheiroPath, ficheiro, {
          cacheControl: '3600',
          upsert: false
        })

      if (ficheiroError) throw ficheiroError

      const { data: { publicUrl: ficheiroUrl } } = supabase.storage
        .from('mercado')
        .getPublicUrl(ficheiroPath)

      setUploadProgress(60)

      // 2. Upload do preview (se existir)
      let previewUrl = ''
      if (preview) {
        const previewPath = `${session.user.id}/preview_${Date.now()}_${preview.name}`
        
        const { data: previewData, error: previewError } = await supabase.storage
          .from('mercado')
          .upload(previewPath, preview, {
            cacheControl: '3600',
            upsert: false
          })

        if (previewError) throw previewError

        const { data: { publicUrl } } = supabase.storage
          .from('mercado')
          .getPublicUrl(previewPath)
        
        previewUrl = publicUrl
      }

      setUploadProgress(80)

      // 3. Criar registo na base de dados
      const { error: dbError } = await supabase
        .from('mercado_itens')
        .insert({
          user_id: session.user.id,
          titulo,
          descricao,
          categoria,
          preco,
          ficheiro_url: ficheiroUrl,
          preview_url: previewUrl || ficheiroUrl,
          ativo: true
        })

      if (dbError) throw dbError

      setUploadProgress(100)

      toast.success('Item publicado com sucesso!', {
        description: 'O seu conteúdo já está disponível no mercado'
      })

      onSuccess()
    } catch (error: any) {
      console.error('Erro ao publicar:', error)
      toast.error('Erro ao publicar item', {
        description: error.message
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white">Publicar Conteúdo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/90">
              <FileText className="w-4 h-4 text-cyan-400" />
              Título *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Beat Trap Melódico - Estilo Português"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/90">
              <FileText className="w-4 h-4 text-purple-400" />
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o seu conteúdo..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/90">
              <Tag className="w-4 h-4 text-pink-400" />
              Categoria *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition-colors"
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#0a0a0a]">
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/90">
              <Coins className="w-4 h-4 text-yellow-400" />
              Preço (DUA Coins) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={preco}
                onChange={(e) => setPreco(parseInt(e.target.value) || 0)}
                min="0"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                DUA
              </div>
            </div>
            <p className="text-xs text-white/50">
              💡 Defina 0 para disponibilizar gratuitamente
            </p>
          </div>

          {/* Upload Ficheiro */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/90">
              <Upload className="w-4 h-4 text-emerald-400" />
              Ficheiro *
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFicheiroChange}
                required
                className="hidden"
                id="ficheiro-upload"
                accept="audio/*,video/*,image/*,.zip,.rar,.pdf"
              />
              <label
                htmlFor="ficheiro-upload"
                className="flex items-center justify-center gap-3 w-full px-4 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-white/10 transition-all"
              >
                <Upload className="w-6 h-6 text-emerald-400" />
                <div className="text-center">
                  <p className="text-white/90 font-medium">
                    {ficheiro ? ficheiro.name : 'Clique para fazer upload'}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    Máximo 50MB • Áudio, Vídeo, Imagem, ZIP, PDF
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Upload Preview */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/90">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              Imagem de Preview (opcional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handlePreviewChange}
                className="hidden"
                id="preview-upload"
                accept="image/*"
              />
              <label
                htmlFor="preview-upload"
                className="flex items-center justify-center gap-3 w-full px-4 py-6 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-white/10 transition-all"
              >
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <div className="text-center">
                  <p className="text-sm text-white/90">
                    {preview ? preview.name : 'Upload de imagem (opcional)'}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    Máximo 5MB • JPG, PNG, WEBP
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">A carregar...</span>
                <span className="text-cyan-400 font-semibold">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-cyan-500/30"
              disabled={isUploading}
            >
              {isUploading ? 'A publicar...' : 'Publicar Conteúdo'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
