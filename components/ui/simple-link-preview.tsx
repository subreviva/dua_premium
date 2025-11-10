'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Play } from 'lucide-react';

export function SimpleLinkPreview({ url }: { url: string }) {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔍 Fetching:', url);
        const res = await fetch('/api/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        console.log('✅ Data:', data);
        setMetadata(data);
      } catch (error) {
        console.error('❌ Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [url]);

  if (loading) {
    return (
      <div className="p-4 bg-white/5 rounded-lg border border-white/10 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-3"></div>
        <div className="h-32 bg-white/10 rounded mb-3"></div>
        <div className="h-3 bg-white/10 rounded w-2/3"></div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400">❌ Erro ao carregar preview</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-red-500/10 to-red-600/10">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-white/50">
              {metadata.provider || 'Link'}
            </span>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Image - USANDO IMG TAG NORMAL */}
        {metadata.image && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white/5">
            <img
              src={metadata.image}
              alt={metadata.title || 'Preview'}
              className="w-full h-full object-cover"
              onLoad={() => console.log('✅ Imagem carregou:', metadata.image)}
              onError={(e) => {
                console.error('❌ Erro ao carregar:', metadata.image);
                console.error('❌ Event:', e);
              }}
            />
          </div>
        )}

        {/* Title */}
        {metadata.title && (
          <h4 className="font-semibold text-white/90 leading-snug line-clamp-2">
            {metadata.title}
          </h4>
        )}

        {/* Description */}
        {metadata.description && (
          <p className="text-sm text-white/60 line-clamp-2">
            {metadata.description}
          </p>
        )}

        {/* Debug Info */}
        <details className="text-xs">
          <summary className="cursor-pointer text-white/40">Debug</summary>
          <pre className="mt-2 text-white/60 overflow-auto text-xs">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
