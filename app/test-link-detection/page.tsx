'use client';

import { useState } from 'react';
import { useRichLinkDetection } from '@/hooks/useLinkDetection';
import { LinkPreview } from '@/components/ui/link-preview';

export default function TestLinkDetection() {
  const [text, setText] = useState('Veja este vídeo: https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const { links, hasLinks, textParts, linkCount } = useRichLinkDetection(text);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Test Link Detection</h1>
        
        <div>
          <label className="block text-sm mb-2">Digite uma mensagem com link:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
            rows={3}
          />
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h2 className="font-semibold mb-2">Debug Info:</h2>
          <pre className="text-xs text-white/60">
            {JSON.stringify({ hasLinks, linkCount, links }, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h2 className="font-semibold mb-2">Text Parts:</h2>
          <pre className="text-xs text-white/60">
            {JSON.stringify(textParts, null, 2)}
          </pre>
        </div>

        {hasLinks && (
          <div className="space-y-4">
            <h2 className="font-semibold">Previews ({linkCount}):</h2>
            {links.map((link, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs text-white/40">Link {i + 1}: {link.url}</p>
                <LinkPreview url={link.url} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
