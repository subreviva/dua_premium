
import { Chat } from '@google/genai';

export type ToolId = 'generate-image' | 'edit-image' | 'generate-logo' | 'generate-icon' | 'color-palette' | 'product-mockup' | 'generate-pattern' | 'generate-variations' | 'generate-svg' | 'analyze-image' | 'design-trends' | 'design-assistant' | 'export-project' | 'remove-background' | 'upscale-image' | 'gemini-flash-image';

export interface Tool {
  id: ToolId;
  name: string;
  icon: JSX.Element;
  description: string;
}

export type CanvasContent = 
  | { type: 'empty' }
  | { type: 'image'; src: string; mimeType: string; prompt: string; }
  | { type: 'svg'; code: string; prompt: string; }
  | { type: 'text-result' };

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type Color = {
  hex: string;
  name: string;
};

export type ImageObject = {
  src: string;
  mimeType: string;
};

export type GroundingChunk = {
  web: {
    uri: string;
    title: string;
  }
}

export type TrendResult = {
  text: string;
  sources: GroundingChunk[];
}

export type ChatMessage = {
    id: number;
    role: 'user' | 'model';
    text: string;
};

export type GenerationConfig = {
    temperature?: number;
    seed?: number;
    negativePrompt?: string;
}

export type ApiFunctions = {
  generateImage: (prompt: string, aspectRatio: AspectRatio, config?: GenerationConfig) => Promise<ImageObject | null>;
  editImage: (base64ImageData: string, mimeType: string, prompt: string) => Promise<ImageObject | null>;
  extractColorPalette: (base64ImageData: string, mimeType: string) => Promise<Color[] | null>;
  generateVariations: (base64ImageData: string, mimeType: string) => Promise<ImageObject[] | null>;
  enhancePrompt: (idea: string) => Promise<string | null>;
  generateSvgCode: (prompt: string) => Promise<string | null>;
  analyzeImage: (base64ImageData: string, mimeType: string) => Promise<string | null>;
  researchTrends: (query: string) => Promise<TrendResult | null>;
  removeBackground: (base64ImageData: string, mimeType: string) => Promise<ImageObject | null>;
  upscaleImage: (base64ImageData: string, mimeType: string, factor: number) => Promise<ImageObject | null>;
  startChat: () => Chat;
  sendMessageStream: (chat: Chat, message: string, onChunk: (chunk: string) => void) => Promise<void>;
};
