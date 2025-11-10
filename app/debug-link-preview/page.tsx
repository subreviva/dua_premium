'use client';

import { useState, useEffect } from 'react';
import { LinkPreview } from '@/components/ui/link-preview';

export default function DebugLinkPreview() {
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl })
      });
      const data = await response.json();
      console.log('📦 API Response:', data);
      setApiData(data);
    } catch (error) {
      console.error('❌ Error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-red-400">🐛 Debug: Link Preview</h1>

        {/* API Response */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4">1. Resposta da API:</h2>
          {loading && <p className="text-yellow-400">⏳ Carregando...</p>}
          {apiData && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/40">URL:</p>
                <code className="text-green-400 text-sm">{apiData.url}</code>
              </div>
              <div>
                <p className="text-xs text-white/40">Title:</p>
                <code className="text-green-400 text-sm">{apiData.title}</code>
              </div>
              <div>
                <p className="text-xs text-white/40">Image URL:</p>
                <code className="text-green-400 text-sm break-all">{apiData.image}</code>
              </div>
              <div>
                <p className="text-xs text-white/40">Provider:</p>
                <code className="text-green-400 text-sm">{apiData.provider}</code>
              </div>
              
              {/* Teste direto da imagem */}
              <div className="mt-4 p-4 bg-black/40 rounded">
                <p className="text-xs text-white/40 mb-2">Teste Imagem (img tag):</p>
                {apiData.image ? (
                  <img 
                    src={apiData.image} 
                    alt="Test" 
                    className="w-full max-w-md rounded"
                    onLoad={() => console.log('✅ IMG tag carregou!')}
                    onError={(e) => console.error('❌ IMG tag erro:', e)}
                  />
                ) : (
                  <p className="text-red-400">❌ Sem URL de imagem</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* LinkPreview Component */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4">2. Componente LinkPreview:</h2>
          <LinkPreview url={testUrl} />
        </div>

        {/* JSON completo */}
        <details className="p-4 bg-white/5 rounded-lg border border-white/10">
          <summary className="cursor-pointer font-semibold">Ver JSON completo</summary>
          <pre className="mt-4 text-xs text-white/60 overflow-auto">
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </details>

        {/* Instruções */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="font-semibold text-blue-300 mb-2">🔍 O que verificar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-200/80">
            <li>Abra o Console (F12)</li>
            <li>Verifique se aparece "✅ IMG tag carregou!"</li>
            <li>Veja se a imagem aparece na seção "Teste Imagem"</li>
            <li>Compare com o componente LinkPreview abaixo</li>
            <li>Se a IMG tag funciona mas o LinkPreview não, o problema é no componente</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
