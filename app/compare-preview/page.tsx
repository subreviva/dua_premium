'use client';

import { SimpleLinkPreview } from '@/components/ui/simple-link-preview';
import { LinkPreview } from '@/components/ui/link-preview';

export default function ComparePreview() {
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-yellow-400">Comparação: Componentes</h1>

        {/* Simple (com img tag) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-green-400">
              1. SimpleLinkPreview
            </h2>
            <span className="text-sm text-green-400/60">(usando &lt;img&gt; tag)</span>
          </div>
          <SimpleLinkPreview url={testUrl} />
        </div>

        {/* Original (com Next/Image) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-blue-400">
              2. LinkPreview Original
            </h2>
            <span className="text-sm text-blue-400/60">(usando Next/Image)</span>
          </div>
          <LinkPreview url={testUrl} />
        </div>

        {/* Instruções */}
        <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <h3 className="font-semibold text-yellow-300 mb-3">🎯 Teste:</h3>
          <ul className="space-y-2 text-sm text-yellow-200/80">
            <li><strong>Se o #1 mostra a imagem:</strong> O problema é no Next/Image component</li>
            <li><strong>Se o #2 mostra a imagem:</strong> Tudo está funcionando!</li>
            <li><strong>Se nenhum mostra:</strong> Problema de CORS ou bloqueio do YouTube</li>
          </ul>
          <p className="mt-4 text-xs text-yellow-300/60">
            💡 Abra o Console (F12) para ver logs detalhados de carregamento
          </p>
        </div>
      </div>
    </div>
  );
}
