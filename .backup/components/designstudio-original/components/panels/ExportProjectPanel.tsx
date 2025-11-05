
import React from 'react';
import { CanvasContent, ImageObject } from '@/types/designstudio';
import Button from '../ui/Button';
import { useToast } from '@/hooks/useToast';

interface ExportProjectPanelProps {
  sessionGallery: ImageObject[];
  history: CanvasContent[];
}

const ExportProjectPanel: React.FC<ExportProjectPanelProps> = ({ sessionGallery, history }) => {
  const { addToast } = useToast();

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
  };

  const handleDownloadImage = (image: ImageObject, index: number) => {
    const a = document.createElement('a');
    a.href = image.src;
    a.download = `dua-design-imagem-${index + 1}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Exportar Projeto</h2>
        <p className="text-sm text-gray-400">Descarregue os ativos e o resumo da sua sessão de design atual.</p>
      </div>

      <div className="p-4 bg-gray-700/30 rounded-lg space-y-4">
        <h3 className="font-semibold text-white">Resumo do Projeto</h3>
        <Textarea
          id="project-summary"
          label=""
          value={generateSummary()}
          readOnly
          rows={8}
        />
        <Button onClick={handleCopySummary} className="w-full text-sm py-2">
          Copiar Resumo
        </Button>
      </div>

      {sessionGallery.length > 0 && (
        <div className="p-4 bg-gray-700/30 rounded-lg space-y-4">
          <h3 className="font-semibold text-white">Ativos da Galeria ({sessionGallery.length})</h3>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            {sessionGallery.map((image, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-md">
                <div className="flex items-center space-x-3">
                  <img src={image.src} className="w-10 h-10 rounded-md object-cover" />
                  <span className="text-sm text-gray-300">Imagem {index + 1}</span>
                </div>
                <Button onClick={() => handleDownloadImage(image, index)} className="px-2 py-1 text-xs">
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
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-300 text-xs font-mono focus:ring-blue-500 focus:border-blue-500 transition"
    {...props}
  />
);

export default ExportProjectPanel;
