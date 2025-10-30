'use client'

import { useState } from 'react'
import { Play, Pause, Download, Share2, Music2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface MusicCardProps {
  id: string
  title: string
  imageUrl: string
  audioUrl: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  duration?: number
  model: string
  style?: string
  createdAt: string
  onPlay?: () => void
  onDownload?: () => void
  onShare?: () => void
  onExtend?: () => void
}

export function MusicCard({
  id,
  title,
  imageUrl,
  audioUrl,
  status,
  duration,
  model,
  style,
  createdAt,
  onPlay,
  onDownload,
  onShare,
  onExtend
}: MusicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    onPlay?.()
  }

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    complete: 'bg-green-500/10 text-green-500 border-green-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  const statusLabels = {
    pending: 'Pendente',
    processing: 'A processar',
    complete: 'Concluída',
    error: 'Erro'
  }

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Music2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute left-2 top-2">
            <Badge className={`${statusColors[status]} border`}>
              {statusLabels[status]}
            </Badge>
          </div>

          {/* Play Button Overlay */}
          {status === 'complete' && (
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Button
                size="lg"
                variant="secondary"
                className="h-16 w-16 rounded-full"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </div>
          )}

          {/* Processing Spinner */}
          {(status === 'pending' || status === 'processing') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-3">
          {/* Title & Model */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{title || 'Sem título'}</h3>
            <p className="text-sm text-muted-foreground">Modelo: {model}</p>
          </div>

          {/* Style & Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {style && (
              <Badge variant="outline" className="text-xs">
                {style}
              </Badge>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString('pt-PT', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </p>

          {/* Actions */}
          {status === 'complete' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Descarregar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {status === 'error' && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full"
              onClick={() => {}}
            >
              Tentar novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
