'use client';

import { useState, useEffect } from 'react';
import { LinkPreview } from '@/components/ui/link-preview';
import { useRichLinkDetection } from '@/hooks/useLinkDetection';

export default function SimpleTest() {
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const testMessage = `Veja: ${testUrl}`;
  
  const { links, hasLinks } = useRichLinkDetection(testMessage);

  useEffect(() => {
    console.log('=== TESTE SIMPLES ===');
    console.log('Message:', testMessage);
    console.log('Has Links:', hasLinks);
    console.log('Links:', links);
  }, [testMessage, hasLinks, links]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Teste Ultra Simples</h1>
        
        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60 mb-2">Mensagem de teste:</p>
          <code className="text-green-400">{testMessage}</code>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-white/60 mb-2">Resultado da detecção:</p>
          <pre className="text-xs text-white/80">
            {JSON.stringify({ hasLinks, linkCount: links.length, links }, null, 2)}
          </pre>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preview Direto (sem MessageContent):</h2>
          <LinkPreview url={testUrl} />
        </div>

        {hasLinks && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Previews Detectados ({links.length}):</h2>
            {links.map((link, i) => (
              <div key={i}>
                <p className="text-xs text-white/40 mb-2">Link {i+1}: {link.url}</p>
                <LinkPreview url={link.url} />
              </div>
            ))}
          </div>
        )}

        {!hasLinks && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">❌ Nenhum link detectado!</p>
            <p className="text-sm text-red-300/60 mt-2">
              O hook useLinkDetection não está encontrando o link na mensagem.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
