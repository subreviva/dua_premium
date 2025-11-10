
import React from 'react';
import { ToolId, CanvasContent, ApiFunctions } from '@/types/designstudio';
import WelcomePanel from './panels/WelcomePanel';
import GenerateImagePanel from './panels/GenerateImagePanel';
import EditImagePanel from './panels/EditImagePanel';
import GenerateLogoPanel from './panels/GenerateLogoPanel';
import GenerateIconPanel from './panels/GenerateIconPanel';
import ColorPalettePanel from './panels/ColorPalettePanel';
import ProductMockupPanel from './panels/ProductMockupPanel';
import GeneratePatternPanel from './panels/GeneratePatternPanel';
import GenerateVariationsPanel from './panels/GenerateVariationsPanel';
import GenerateSvgPanel from './panels/GenerateSvgPanel';
import AnalyzeImagePanel from './panels/AnalyzeImagePanel';
import DesignTrendsPanel from './panels/DesignTrendsPanel';
import DesignAssistantPanel from './panels/DesignAssistantPanel';
import ExportProjectPanel from './panels/ExportProjectPanel';

interface ControlPanelProps {
  activeTool: ToolId | null;
  canvasContent: CanvasContent;
  onContentUpdate: (content: CanvasContent) => void;
  api: ApiFunctions;
  isLoading: boolean;
  sessionGallery: any[]; // Pass sessionGallery for export
  history: CanvasContent[]; // Pass history for export
  styleSuffixes?: string; // Estilos selecionados para adicionar aos prompts
}

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const { activeTool, styleSuffixes = '' } = props;

  switch (activeTool) {
    case 'generate-image':
      return <GenerateImagePanel {...props} />;
    case 'edit-image':
      return <EditImagePanel {...props} />;
    case 'generate-logo':
      return <GenerateLogoPanel {...props} />;
    case 'generate-icon':
      return <GenerateIconPanel {...props} />;
    case 'color-palette':
      return <ColorPalettePanel {...props} />;
    case 'product-mockup':
      return <ProductMockupPanel {...props} />;
    case 'generate-pattern':
      return <GeneratePatternPanel {...props} />;
    case 'generate-variations':
      return <GenerateVariationsPanel {...props} />;
    case 'generate-svg':
      return <GenerateSvgPanel {...props} />;
    case 'analyze-image':
      return <AnalyzeImagePanel {...props} />;
    case 'design-trends':
      return <DesignTrendsPanel {...props} />;
    case 'design-assistant':
      return <DesignAssistantPanel {...props} />;
    case 'export-project':
      return <ExportProjectPanel {...props} />;
    default:
      return <WelcomePanel />;
  }
};

export default ControlPanel;
