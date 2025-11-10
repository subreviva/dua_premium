'use client';

import { MessageContent } from '@/components/ui/message-content';
import { useState } from 'react';

export default function TestPreviewFinal() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(message);
  };

  const examples = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Veja este vídeo: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Múltiplos: https://www.youtube.com/watch?v=test e https://open.spotify.com/track/123',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Teste Final - Link Preview
          </h1>
          <p className="text-white/60">
            Digite um link e veja o preview aparecer
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <label className="block text-sm font-medium text-white/80">
              Digite ou cole um link:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20 min-h-[100px]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-medium transition-all"
              >
                Testar Preview
              </button>
              <button
                type="button"
                onClick={() => { setMessage(''); setSubmitted(''); }}
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Examples */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm font-medium text-white/60 mb-2">Exemplos rápidos:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(ex)}
                  className="px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/20 transition-all"
                >
                  Exemplo {i + 1}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Result */}
        {submitted && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resultado:</h2>
            
            {/* Input mostrado */}
            <div className="p-4 rounded-lg bg-black/40 border border-white/10">
              <p className="text-xs text-white/40 mb-2">Texto enviado:</p>
              <code className="text-sm text-green-400 break-all">{submitted}</code>
            </div>

            {/* Preview renderizado */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/40 mb-4">Preview renderizado:</p>
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <MessageContent content={submitted} />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <h3 className="font-semibold text-blue-300 mb-2">💡 Como usar:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-200/80">
            <li>Cole um link do YouTube, Spotify, GitHub, etc</li>
            <li>Clique em "Testar Preview"</li>
            <li>Veja o preview aparecer abaixo com miniatura</li>
            <li>Clique no preview para abrir o embed (YouTube/Spotify)</li>
          </ol>
        </div>

        {/* Debug Info */}
        <details className="p-4 rounded-lg bg-white/5 border border-white/10">
          <summary className="cursor-pointer text-sm font-medium text-white/60 hover:text-white/80">
            🔍 Debug Info (clique para expandir)
          </summary>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-white/40">
              • MessageContent: Componente que detecta links e renderiza previews
            </p>
            <p className="text-xs text-white/40">
              • useLinkDetection: Hook que extrai URLs do texto
            </p>
            <p className="text-xs text-white/40">
              • LinkPreview: Componente que busca metadados e mostra o card
            </p>
            <p className="text-xs text-white/40">
              • API: /api/link-preview busca título, descrição e thumbnail
            </p>
            <p className="text-xs text-white/60 mt-2">
              ✅ Abra o Console do Browser (F12) para ver logs de debug
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
