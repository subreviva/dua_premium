'use client';

import { useEffect, useState } from 'react';

// Importar diretamente o regex e lógica
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export default function TestRegexDirect() {
  const [testUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    // Testar DIRETAMENTE sem hooks
    URL_REGEX.lastIndex = 0;
    const found = testUrl.match(URL_REGEX);
    console.log('🧪 TESTE DIRETO:');
    console.log('Input:', testUrl);
    console.log('Regex:', URL_REGEX);
    console.log('Matches:', found);
    
    if (found) {
      setMatches(found);
    }
  }, [testUrl]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-green-400">Teste Regex DIRETO</h1>
        
        <div className="p-6 bg-white/5 rounded-lg border border-white/10 space-y-4">
          <div>
            <p className="text-sm text-white/60 mb-2">URL de teste:</p>
            <code className="text-green-400 block p-3 bg-black/40 rounded">
              {testUrl}
            </code>
          </div>

          <div>
            <p className="text-sm text-white/60 mb-2">Regex usado:</p>
            <code className="text-blue-400 block p-3 bg-black/40 rounded text-xs">
              /(https?:\/\/[^\s]+)/gi
            </code>
          </div>

          <div>
            <p className="text-sm text-white/60 mb-2">Resultado:</p>
            {matches.length > 0 ? (
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded">
                <p className="text-green-400 font-semibold mb-2">
                  ✅ {matches.length} link(s) detectado(s)!
                </p>
                <ul className="space-y-1">
                  {matches.map((m, i) => (
                    <li key={i} className="text-sm text-green-300">
                      {i + 1}. {m}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded">
                <p className="text-red-400">❌ Nenhum link detectado</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/40">
              💡 Abra o Console (F12) para ver os logs detalhados
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Este teste usa o regex DIRETAMENTE</strong> sem passar pelo hook useLinkDetection.
            Se funcionar aqui mas não no hook, há um problema no hook.
          </p>
        </div>
      </div>
    </div>
  );
}
