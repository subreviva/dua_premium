/**
 * Design Studio Types - Complete
 * Based on original DUA Design Studio
 */

export type ToolId = 
  | 'generate-image'
  | 'edit-image'
  | 'generate-logo'
  | 'generate-icon'
  | 'color-palette'
  | 'product-mockup'
  | 'generate-pattern'
  | 'generate-variations'
  | 'generate-svg'
  | 'analyze-image'
  | 'design-trends'
  | 'design-assistant'
  | 'export-project';

export interface Tool {
  id: ToolId;
  name: string;
  icon: any;
  description: string;
}

export type CanvasContent = 
  | { type: 'empty' }
  | { type: 'image'; src: string; mimeType: string; prompt: string }
  | { type: 'svg'; code: string; prompt: string }
  | { type: 'text-result' };

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface Color {
  hex: string;
  name: string;
}

export interface ImageObject {
  src: string;
  mimeType: string;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}

export interface TrendResult {
  text: string;
  sources: GroundingChunk[];
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'model';
  text: string;
}

export interface GenerationConfig {
  temperature?: number;
  seed?: number;
  negativePrompt?: string;
}

export interface ApiFunctions {
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  generateImage: (prompt: string, aspectRatio: AspectRatio, config?: GenerationConfig) => Promise<ImageObject | null>;
  editImage: (base64ImageData: string, mimeType: string, prompt: string) => Promise<ImageObject | null>;
  extractColorPalette: (base64ImageData: string, mimeType: string) => Promise<Color[] | null>;
  generateVariations: (base64ImageData: string, mimeType: string) => Promise<ImageObject[] | null>;
  enhancePrompt: (idea: string) => Promise<string | null>;
  generateSvgCode: (prompt: string) => Promise<string | null>;
  analyzeImage: (base64ImageData: string, mimeType: string) => Promise<string | null>;
  researchTrends: (query: string) => Promise<TrendResult | null>;
  startChat?: () => any;
  sendMessageStream?: (chat: any, message: string, onChunk: (chunk: string) => void) => Promise<void>;
}
