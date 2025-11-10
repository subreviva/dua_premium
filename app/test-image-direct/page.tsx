'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TestImageDirect() {
  const youtubeThumb = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-400">Teste Direto de Imagem do YouTube</h1>
        
        {/* Teste com Next/Image */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10 space-y-4">
          <h2 className="text-xl font-semibold">Next/Image Component:</h2>
          <div className="relative w-full aspect-video bg-white/5 rounded-lg overflow-hidden">
            <Image
              src={youtubeThumb}
              alt="YouTube Thumbnail"
              fill
              className="object-cover"
              unoptimized
              onLoad={() => {
                setImageLoaded(true);
                console.log('✅ Imagem carregou com sucesso!');
              }}
              onError={(e) => {
                setImageError(true);
                console.error('❌ Erro ao carregar imagem:', e);
              }}
            />
          </div>
          <div className="text-sm">
            {imageLoaded && <p className="text-green-400">✅ Imagem carregou!</p>}
            {imageError && <p className="text-red-400">❌ Erro ao carregar imagem</p>}
            {!imageLoaded && !imageError && <p className="text-yellow-400">⏳ Carregando...</p>}
          </div>
        </div>

        {/* Teste com img tag normal */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10 space-y-4">
          <h2 className="text-xl font-semibold">Tag &lt;img&gt; Normal:</h2>
          <div className="relative w-full aspect-video bg-white/5 rounded-lg overflow-hidden">
            <img
              src={youtubeThumb}
              alt="YouTube Thumbnail"
              className="w-full h-full object-cover"
              onLoad={() => console.log('✅ <img> carregou')}
              onError={() => console.error('❌ <img> erro')}
            />
          </div>
        </div>

        {/* URL da imagem */}
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60 mb-2">URL da thumbnail:</p>
          <code className="text-xs text-green-400 break-all block p-2 bg-black/40 rounded">
            {youtubeThumb}
          </code>
        </div>

        {/* Link direto */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <a href={youtubeThumb} target="_blank" rel="noopener noreferrer" className="underline">
              🔗 Abrir imagem em nova aba
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
