/**
 * Design Studio Types
 * Tipos TypeScript para o Design Studio
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
  icon: React.ReactNode;
  description: string;
  category: 'create' | 'edit' | 'analyze' | 'export';
}

export type CanvasContent = 
  | { type: 'empty' }
  | { type: 'image'; src: string; mimeType: string; prompt: string; }
  | { type: 'svg'; code: string; prompt: string; }
  | { type: 'text-result'; content: string; };

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type Color = {
  hex: string;
  name: string;
};

export type ImageObject = {
  src: string;
  mimeType: string;
  prompt?: string;
  timestamp: number;
};

export type GenerationStyle = 
  | 'realistic'
  | 'artistic'
  | 'minimalist'
  | 'abstract'
  | 'cartoon'
  | 'professional';

export interface GenerationParams {
  prompt: string;
  aspectRatio: AspectRatio;
  style?: GenerationStyle;
  negativePrompt?: string;
  seed?: number;
}

export interface DesignSession {
  id: string;
  createdAt: number;
  updatedAt: number;
  gallery: ImageObject[];
  history: CanvasContent[];
}
