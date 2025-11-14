'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Play, Music, Image as ImageIcon, Globe, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LinkPreviewProps {
  url: string;
  className?: string;
  compact?: boolean;
}

interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  type?: 'video' | 'music' | 'article' | 'website';
  provider?: string;
  embedUrl?: string;
  author?: string;
}

export function LinkPreview({ url, className, compact = false }: LinkPreviewProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, [url]);

  async function fetchMetadata() {
    try {
      setLoading(true);
      setError(false);

      console.log('🔍 LinkPreview - Fetching metadata for:', url);

      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        console.error('❌ API error:', response.status, response.statusText);
        throw new Error('Failed to fetch metadata');
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        console.error('❌ Response is not JSON:', contentType);
        throw new Error('Invalid response format');
      }

      const data = await response.json();
      console.log('✅ Metadata received:', data);
      console.log('🖼️ Image URL:', data.image);
      setMetadata(data);

      // Determinar imagem inicial (prioriza fallback YouTube se provider for YouTube para garantir miniatura)
      const fallback = deriveFallbackThumbnail(url, data);
      const chosen = (data.provider === 'YouTube' && fallback) ? fallback : (data.image || fallback || null);
      setImageUrl(chosen);
      console.log('🖼️ Final imageUrl escolhido:', chosen, 'provider:', data.provider);
    } catch (err) {
      console.error('❌ Link preview error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Extrair videoId e gerar fallback para YouTube se necessário
  function deriveFallbackThumbnail(originalUrl: string, data?: Partial<LinkMetadata>) {
    try {
      const u = new URL(originalUrl);
      const host = u.hostname.replace('www.', '');
      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        let videoId: string | null = null;
        if (host.includes('youtu.be')) {
          videoId = u.pathname.slice(1);
        } else {
          videoId = u.searchParams.get('v');
          if (!videoId && u.pathname.startsWith('/shorts/')) {
            videoId = u.pathname.split('/shorts/')[1];
          }
        }
        if (videoId && videoId.length >= 8) {
          const ytThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          console.log('🧩 Fallback YouTube thumbnail gerado:', ytThumb);
          return ytThumb;
        }
      }
    } catch (e) {
      console.warn('⚠️ Erro ao gerar fallback YouTube:', e);
    }
    // Outros providers – aqui poderíamos adicionar futuros fallbacks
    return null;
  }

  const getProviderIcon = () => {
    if (!metadata?.provider) return <Globe className="w-4 h-4" />;

    switch (metadata.provider) {
      case 'YouTube':
      case 'Vimeo':
        return <Play className="w-4 h-4" />;
      case 'Spotify':
      case 'SoundCloud':
        return <Music className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getProviderColor = () => {
    switch (metadata?.provider) {
      case 'YouTube':
        return 'from-red-500 to-red-600';
      case 'Spotify':
        return 'from-green-500 to-green-600';
      case 'Twitter':
        return 'from-blue-400 to-blue-500';
      case 'SoundCloud':
        return 'from-orange-500 to-orange-600';
      case 'Vimeo':
        return 'from-blue-500 to-blue-600';
      case 'GitHub':
        return 'from-gray-700 to-gray-800';
      default:
        return 'from-purple-500 to-purple-600';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'group relative overflow-hidden rounded-xl border border-white/10',
          'bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm',
          compact ? 'p-3' : 'p-4',
          className
        )}
      >
        {/* Skeleton Loading */}
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/10 rounded" />
            <div className="h-3 bg-white/10 rounded w-24" />
          </div>
          {!compact && (
            <>
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-32 bg-white/10 rounded-lg" />
            </>
          )}
        </div>
      </motion.div>
    );
  }

  if (error || !metadata) {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'group relative overflow-hidden rounded-xl border border-white/10',
          'bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm',
          'hover:border-white/20 transition-all duration-300',
          'p-3 flex items-center gap-3',
          className
        )}
      >
        <div className="flex-shrink-0 p-2 rounded-lg bg-white/5">
          <ExternalLink className="w-4 h-4 text-white/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/70 truncate">{url}</p>
        </div>
      </motion.a>
    );
  }

  // Renderizar embed (YouTube, Spotify)
  if (showEmbed && metadata.embedUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn('relative overflow-hidden rounded-xl', className)}
      >
        <button
          onClick={() => setShowEmbed(false)}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          aria-label="Fechar embed"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <iframe
          src={metadata.embedUrl}
          className="w-full aspect-video rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={(e) => {
            console.error('❌ Erro no iframe embed (código 153?), abrindo no YouTube:', metadata.url);
            // Se embed falhar (erro 153), abrir diretamente no YouTube
            setShowEmbed(false);
            window.open(metadata.url, '_blank', 'noopener,noreferrer');
          }}
        />
      </motion.div>
    );
  }

  // Handler para clique/tecla: abre embed (se houver) ou link externo
  const handleOpen = (e?: React.UIEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation?.();
    }
    
    // Para YouTube, sempre abrir diretamente no YouTube para evitar erro 153
    if (metadata?.provider === 'YouTube') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Para outros providers, tentar embed
    if (metadata?.embedUrl) {
      setShowEmbed(true);
    } else if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/10',
        'bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm',
        'hover:border-white/20 hover:shadow-xl hover:shadow-white/5',
        'transition-all duration-300',
        className
      )}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen(e);
        }
      }}
    >
      {/* Gradiente de fundo animado */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500',
          'bg-gradient-to-br',
          getProviderColor()
        )}
      />

      <div className={cn('relative', compact ? 'p-3' : 'p-4')}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center justify-center w-6 h-6 rounded-md',
              'bg-gradient-to-br',
              getProviderColor()
            )}>
              {getProviderIcon()}
            </div>
            <div className="flex items-center gap-2">
              {metadata.favicon && (
                <Image
                  src={metadata.favicon}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded opacity-70"
                />
              )}
              <span className="text-xs font-medium text-white/50">
                {metadata.siteName || metadata.provider}
              </span>
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            onClick={(e) => e.stopPropagation()}
            aria-label="Abrir link em nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white/40 hover:text-white/70 transition-colors" />
          </a>
        </div>

        {/* Image */}
        {imageUrl && !compact && (
          <div
            className="relative w-full aspect-video mb-3 rounded-lg overflow-hidden bg-white/5 cursor-pointer group/image"
            onClick={(e) => {
              e.stopPropagation();
              console.log('🎨 Clicou na imagem:', imageUrl);
              handleOpen();
            }}
          >
            {/* Usando <img> + fallback YouTube */}
            <img
              src={imageUrl}
              alt={metadata.title || 'Preview'}
              className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
              onLoad={() => console.log('✅ Imagem carregada:', imageUrl)}
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem principal:', imageUrl, e);
                // Se falhou imagem principal e temos possibilidade de fallback YouTube que ainda não foi usado
                if (metadata) {
                  const fallback = deriveFallbackThumbnail(metadata.url, metadata);
                  if (fallback && fallback !== imageUrl) {
                    console.log('🔄 Aplicando fallback thumbnail:', fallback);
                    setImageUrl(fallback);
                    return;
                  }
                  // Tentar via proxy
                  if (imageUrl && imageUrl.startsWith('http')) {
                    const proxied = `/api/link-preview/image?url=${encodeURIComponent(imageUrl)}`;
                    console.log('🛰️ Tentando imagem via proxy:', proxied);
                    setImageUrl(proxied);
                    return;
                  }
                }
                // Marcar erro total
                setError(true);
              }}
            />
            {metadata.embedUrl && metadata.provider !== 'YouTube' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity">
                <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
            {metadata.provider === 'YouTube' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity">
                <div className="p-4 rounded-full bg-red-600/80 backdrop-blur-sm">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-1.5">
          {metadata.title && (
            <h4 className={cn(
              'font-semibold text-white/90 leading-snug',
              compact ? 'text-sm line-clamp-1' : 'text-base line-clamp-2'
            )}>
              {metadata.title}
            </h4>
          )}
          {metadata.description && !compact && (
            <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
              {metadata.description}
            </p>
          )}
          {metadata.author && (
            <p className="text-xs text-white/40">
              por {metadata.author}
            </p>
          )}
        </div>

        {/* Footer Badge */}
        {metadata.type && (
          <div className="mt-3 flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
              'text-xs font-medium',
              'bg-gradient-to-r',
              getProviderColor(),
              'text-white/90'
            )}>
              {metadata.type === 'video' && <Play className="w-3 h-3" />}
              {metadata.type === 'music' && <Music className="w-3 h-3" />}
              {metadata.type}
            </span>
          </div>
        )}
      </div>

      {/* Borda animada */}
      <motion.div
        className="absolute inset-0 rounded-xl border-2 border-transparent opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, var(--tw-gradient-stops)) border-box`,
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Hint de interação */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-[11px] px-2 py-1 rounded-full bg-black/30 text-white/80 backdrop-blur-sm">
          {metadata?.provider === 'YouTube' ? 'Abrir no YouTube' : 'Clique para abrir'}
        </span>
      </div>
    </motion.div>
  );
}
