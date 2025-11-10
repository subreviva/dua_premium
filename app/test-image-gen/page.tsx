'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function TestImageGenPage() {
  const [prompt, setPrompt] = useState('a beautiful sunset over mountains');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGeneration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Teste: Enviando requisição...');
      
      const response = await fetch('/api/imagen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: 'imagen-4.0-generate-001',
          config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
          }
        }),
      });

      console.log('📥 Status:', response.status);
      
      const data = await response.json();
      console.log('📦 Dados:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `Erro ${response.status}`);
      }

      setResult(data);
    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Teste de Geração de Imagens</h1>

        <div className="space-y-4 mb-8">
          <div>
            <label className="block mb-2 text-sm font-medium">Prompt:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border-white/10"
              rows={3}
            />
          </div>

          <Button 
            onClick={testGeneration}
            disabled={loading}
            className="w-full"
          >
            {loading ? '⏳ Gerando...' : '🚀 Testar Geração'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-red-500 mb-2">❌ Erro:</h3>
            <pre className="text-sm text-red-400 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-green-500 mb-4">✅ Sucesso!</h3>
            
            {result.images?.map((img: any, i: number) => (
              <div key={i} className="mb-4">
                <p className="text-sm text-white/60 mb-2">Imagem {i + 1}:</p>
                <img 
                  src={img.url} 
                  alt={`Generated ${i}`}
                  className="w-full max-w-md rounded-lg border border-white/10"
                />
              </div>
            ))}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-white/60">Ver dados completos</summary>
              <pre className="text-xs text-white/40 mt-2 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="font-bold mb-2">📝 Instruções:</h3>
          <ol className="text-sm text-white/60 space-y-2">
            <li>1. Verifique o console do navegador (F12)</li>
            <li>2. Clique em "Testar Geração"</li>
            <li>3. Observe os logs no console</li>
            <li>4. Se der erro, copie a mensagem completa</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
