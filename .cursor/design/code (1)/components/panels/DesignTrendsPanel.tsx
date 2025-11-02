
import React, { useState } from 'react';
import { ApiFunctions, TrendResult } from '../../types';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Spinner from '../ui/Spinner';

interface DesignTrendsPanelProps {
  api: ApiFunctions;
}

const DesignTrendsPanel: React.FC<DesignTrendsPanelProps> = ({ api }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !api.researchTrends) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await api.researchTrends(query);
    if (response) {
      setResult(response);
    } else {
      setError('Não foi possível concluir a pesquisa. Tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Pesquisa de Tendências</h2>
        <p className="text-sm text-gray-400">Faça uma pergunta sobre design, e a DUA irá pesquisar na web para lhe dar uma resposta atualizada.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          id="trend-query"
          label="A sua pergunta"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Quais são as tendências de design de logótipos para 2024?"
          rows={3}
          disabled={isLoading}
          required
        />
        <Button type="submit" disabled={isLoading || !query.trim()} className="w-full">
          {isLoading ? 'A pesquisar...' : 'Pesquisar Tendências'}
        </Button>
      </form>

      {isLoading && <div className="flex justify-center"><Spinner /></div>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">Resposta da DUA:</h3>
            <div className="p-3 bg-gray-700/50 rounded-lg text-gray-300 text-sm whitespace-pre-wrap">
              {result.text}
            </div>
          </div>
          {result.sources && result.sources.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-2">Fontes:</h3>
              <ul className="space-y-2 text-xs">
                {result.sources.map((source, index) => (
                  <li key={index} className="truncate">
                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignTrendsPanel;
