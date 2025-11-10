
import React, { useState } from 'react';
import { ApiFunctions, TrendResult } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Spinner from '../ui/Spinner';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { TrendingUp, ExternalLink } from 'lucide-react';

interface DesignTrendsPanelProps {
  api: ApiFunctions;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const DesignTrendsPanel: React.FC<DesignTrendsPanelProps> = ({ 
  api,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [query, setQuery] = useState(templatePrompt || '');
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar query quando templatePrompt ou styleSuffixes mudar
  React.useEffect(() => {
    if (templatePrompt) {
      const combined = styleSuffixes 
        ? `${templatePrompt}, ${styleSuffixes}`
        : templatePrompt;
      setQuery(combined);
    }
  }, [templatePrompt, styleSuffixes]);

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
      <PremiumPanelHeader
        icon={TrendingUp}
        title="Pesquisa de Tendências"
        description="Descubra as últimas tendências de design com pesquisa web alimentada por IA."
        gradient="from-sky-500/20 to-blue-500/20"
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="trend-query" className="block text-sm font-medium text-white/90">
            A Sua Pergunta
          </label>
          <Textarea
            id="trend-query"
            label=""
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Quais são as tendências de design de logótipos para 2025?&#10;Ex: Cores populares em UI design moderno&#10;Ex: Tipografia trending para branding minimalista"
            rows={4}
            disabled={isLoading}
            required
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()} 
          className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 font-semibold tracking-wide shadow-lg shadow-sky-500/25"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              A Pesquisar na Web...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pesquisar Tendências
            </span>
          )}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Resposta da DUA
            </h3>
            <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{result.text}</p>
            </div>
          </div>
          {result.sources && result.sources.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Fontes ({result.sources.length})
              </h3>
              <ul className="space-y-2">
                {result.sources.map((source, index) => (
                  <li key={index} className="group">
                    <a 
                      href={source.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="text-white/70 group-hover:text-white truncate transition-colors">
                        {source.web.title || source.web.uri}
                      </span>
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
