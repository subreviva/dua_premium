
import React, { useState } from 'react';
import { CanvasContent, ApiFunctions } from '@/types/designstudio';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { ScanEye, AlertTriangle, Copy, Check } from 'lucide-react';

interface AnalyzeImagePanelProps {
  canvasContent: CanvasContent;
  api: ApiFunctions;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const AnalyzeImagePanel: React.FC<AnalyzeImagePanelProps> = ({ 
  canvasContent, 
  api,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isImageOnCanvas = canvasContent.type === 'image';

  const handleCopy = () => {
    if (description) {
      navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAnalyze = async () => {
    if (!isImageOnCanvas || !api.analyzeImage) return;
    
    setIsLoading(true);
    setError(null);
    setDescription(null);

    const base64Data = canvasContent.src.split(',')[1];
    const result = await api.analyzeImage(base64Data, canvasContent.mimeType);

    if (result) {
      setDescription(result);
    } else {
      setError('Não foi possível analisar a imagem. Tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <PremiumPanelHeader
        icon={ScanEye}
        title="Analisador de Imagem"
        description="Gere descrições detalhadas e alt-text profissional para acessibilidade e SEO."
        gradient="from-teal-500/20 to-cyan-500/20"
      />
      
      {!isImageOnCanvas && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-300">Imagem Necessária</p>
              <p className="text-xs text-yellow-400/80">
                Gere uma imagem primeiro para poder analisá-la com IA.
              </p>
            </div>
          </div>
        </div>
      )}

      <Button 
        onClick={handleAnalyze} 
        disabled={isLoading || !isImageOnCanvas} 
        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 font-semibold tracking-wide shadow-lg shadow-teal-500/25"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            A Analisar Imagem...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ScanEye className="w-4 h-4" />
            Analisar Imagem na Tela
          </span>
        )}
      </Button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {description && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ScanEye className="w-4 h-4" />
              Descrição Gerada
            </h3>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all flex items-center gap-2 group"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">
                    Copiar
                  </span>
                </>
              )}
            </button>
          </div>
          <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeImagePanel;
