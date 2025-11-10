
import React, { useState } from 'react';
import { CanvasContent, ImageObject } from '@/types/designstudio';
import Button from '../ui/Button';
import { useToast } from '@/hooks/useToast';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { Download, Copy, Check, FileText } from 'lucide-react';

interface ExportProjectPanelProps {
  sessionGallery: ImageObject[];
  history: CanvasContent[];
  templatePrompt?: string;
  styleSuffixes?: string;
}

const ExportProjectPanel: React.FC<ExportProjectPanelProps> = ({ 
  sessionGallery, 
  history,
  templatePrompt = '',
  styleSuffixes = ''
}) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const generateSummary = () => {
    let summary = `# Resumo do Projeto DUA Design\n\n`;
    summary += `## Imagens Geradas (${sessionGallery.length})\n\n`;
    
    const imagePrompts = history.filter(item => item.type === 'image' && item.prompt);
    
    if (imagePrompts.length > 0) {
      summary += "### Instruções Utilizadas:\n";
      imagePrompts.forEach((item, index) => {
        if (item.type === 'image') {
          summary += `${index + 1}. ${item.prompt}\n`;
        }
      });
    } else {
      summary += "Nenhuma instrução de imagem registada nesta sessão.\n";
    }
    
    return summary;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateSummary());
    addToast("Resumo do projeto copiado!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = (image: ImageObject, index: number) => {
    const a = document.createElement('a');
    a.href = image.src;
    a.download = `dua-design-imagem-${index + 1}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <PremiumPanelHeader
        icon={Download}
        title="Exportar Projeto"
        description="Descarregue os seus ativos e obtenha um resumo completo da sessão de design."
        gradient="from-emerald-500/20 to-teal-500/20"
      />

      <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumo do Projeto
          </h3>
          <span className="text-xs text-white/50 font-mono">{sessionGallery.length} imagens</span>
        </div>
        <SimpleTextarea
          id="project-summary"
          value={generateSummary()}
          readOnly
          rows={8}
        />
        <Button 
          onClick={handleCopySummary} 
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 font-medium flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Resumo</span>
            </>
          )}
        </Button>
      </div>

      {sessionGallery.length > 0 && (
        <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4" />
              Ativos da Galeria
            </h3>
            <span className="text-xs text-white/50 font-mono">{sessionGallery.length} itens</span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            {sessionGallery.map((image, index) => (
              <div key={index} className="group flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20">
                    <img src={image.src} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={`Imagem ${index + 1}`} />
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                    Imagem {index + 1}
                  </span>
                </div>
                <Button 
                  onClick={() => handleDownloadImage(image, index)} 
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descarregar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// A simple Textarea component for display within this panel
const SimpleTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    className="w-full p-4 bg-gray-900/50 border border-white/10 rounded-xl text-white/80 text-xs font-mono focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
    {...props}
  />
);

export default ExportProjectPanel;
