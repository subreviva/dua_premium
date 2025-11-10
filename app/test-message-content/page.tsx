'use client';

import { MessageContent } from '@/components/ui/message-content';

export default function TestMessageContent() {
  const testMessages = [
    'Veja este vídeo do YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'Ouça no Spotify: https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
    'Confira este link: https://github.com/vercel/next.js',
    'Múltiplos links:\nhttps://www.youtube.com/watch?v=example\nhttps://open.spotify.com/track/123',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Teste de MessageContent</h1>
          <p className="text-white/60">Testando detecção e preview de links</p>
        </div>

        <div className="space-y-6">
          {testMessages.map((msg, i) => (
            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/40 mb-3">Mensagem {i + 1}:</div>
              <div className="p-4 rounded-lg bg-black/20 mb-4">
                <code className="text-xs text-green-400">{msg}</code>
              </div>
              <MessageContent content={msg} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
