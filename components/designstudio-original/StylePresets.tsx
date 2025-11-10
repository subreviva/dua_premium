'use client';

import React, { useState } from 'react';
import { 
  Palette, Sparkles, Zap, Paintbrush, Frame, Pen, Droplet, Flower,
  Zap as Lightning, Box, Grid3x3, Gamepad2, Diamond, Camera, Film,
  Focus, User, Mountain, Rainbow, Circle, Moon, Star, Radio, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StylePreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  suffix: string;
  preview?: string;
  category: 'artistic' | 'digital' | 'mood' | 'photography';
}

export const STYLE_PRESETS: StylePreset[] = [
  // ARTÍSTICO
  { id: 'watercolor', name: 'Aquarela', icon: <Paintbrush className="w-5 h-5" />, suffix: 'watercolor painting style, soft blended colors', category: 'artistic' },
  { id: 'oil', name: 'Óleo', icon: <Frame className="w-5 h-5" />, suffix: 'oil painting on canvas, textured brushstrokes, classical art', category: 'artistic' },
  { id: 'sketch', name: 'Sketch', icon: <Pen className="w-5 h-5" />, suffix: 'pencil sketch, detailed linework, artistic drawing', category: 'artistic' },
  { id: 'ink', name: 'Tinta', icon: <Droplet className="w-5 h-5" />, suffix: 'ink illustration, bold black lines, traditional art', category: 'artistic' },
  { id: 'pastel', name: 'Pastel', icon: <Flower className="w-5 h-5" />, suffix: 'soft pastel colors, delicate blending, gentle aesthetic', category: 'artistic' },

  // DIGITAL
  { id: 'cyberpunk', name: 'Cyberpunk', icon: <Lightning className="w-5 h-5" />, suffix: 'neon cyberpunk aesthetic, futuristic city, purple and cyan lights', category: 'digital' },
  { id: '3d-render', name: '3D Render', icon: <Box className="w-5 h-5" />, suffix: 'photorealistic 3D render, high quality CGI, perfect lighting', category: 'digital' },
  { id: 'flat', name: 'Flat Design', icon: <Grid3x3 className="w-5 h-5" />, suffix: 'modern flat design, clean vectors, minimalist style', category: 'digital' },
  { id: 'pixel', name: 'Pixel Art', icon: <Gamepad2 className="w-5 h-5" />, suffix: 'pixel art style, retro gaming aesthetic, 16-bit graphics', category: 'digital' },
  { id: 'isometric', name: 'Isométrico', icon: <Box className="w-5 h-5" />, suffix: 'isometric perspective, clean geometric design', category: 'digital' },
  { id: 'glassmorphism', name: 'Glass', icon: <Diamond className="w-5 h-5" />, suffix: 'glassmorphism design, frosted glass effect, translucent', category: 'digital' },

  // FOTOGRAFIA
  { id: 'photo-realistic', name: 'Fotorrealista', icon: <Camera className="w-5 h-5" />, suffix: 'photorealistic, high resolution photography, professional quality', category: 'photography' },
  { id: 'cinematic', name: 'Cinematográfico', icon: <Film className="w-5 h-5" />, suffix: 'cinematic lighting, movie scene aesthetic, dramatic composition', category: 'photography' },
  { id: 'macro', name: 'Macro', icon: <Focus className="w-5 h-5" />, suffix: 'macro photography, extreme close-up, detailed textures', category: 'photography' },
  { id: 'portrait', name: 'Retrato', icon: <User className="w-5 h-5" />, suffix: 'professional portrait photography, studio lighting, shallow depth of field', category: 'photography' },
  { id: 'landscape', name: 'Paisagem', icon: <Mountain className="w-5 h-5" />, suffix: 'stunning landscape photography, golden hour, expansive view', category: 'photography' },

  // MOOD/ATMOSFERA
  { id: 'vibrant', name: 'Vibrante', icon: <Rainbow className="w-5 h-5" />, suffix: 'vibrant and colorful, high saturation, energetic mood', category: 'mood' },
  { id: 'minimal', name: 'Minimalista', icon: <Circle className="w-5 h-5" />, suffix: 'minimal clean design, lots of white space, simple elegant', category: 'mood' },
  { id: 'dark', name: 'Dark Mode', icon: <Moon className="w-5 h-5" />, suffix: 'dark moody atmosphere, dramatic shadows, noir aesthetic', category: 'mood' },
  { id: 'pastel-mood', name: 'Pastel Suave', icon: <Star className="w-5 h-5" />, suffix: 'soft pastel colors, dreamy aesthetic, kawaii vibes', category: 'mood' },
  { id: 'vintage', name: 'Vintage', icon: <Radio className="w-5 h-5" />, suffix: 'vintage retro style, aged aesthetic, nostalgic feel', category: 'mood' },
  { id: 'luxury', name: 'Luxo', icon: <Crown className="w-5 h-5" />, suffix: 'luxury premium aesthetic, gold accents, elegant sophistication', category: 'mood' },
];

const CATEGORY_LABELS = {
  artistic: 'Artístico',
  digital: 'Digital',
  photography: 'Fotografia',
  mood: 'Atmosfera'
};

interface StylePresetsProps {
  onSelectStyle: (style: StylePreset) => void;
  selectedStyles?: string[];
  allowMultiple?: boolean;
  compact?: boolean;
}

export default function StylePresets({ 
  onSelectStyle, 
  selectedStyles = [],
  allowMultiple = true,
  compact = false 
}: StylePresetsProps) {
  const [activeCategory, setActiveCategory] = useState<StylePreset['category']>('artistic');

  const filteredPresets = STYLE_PRESETS.filter(preset => preset.category === activeCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!compact && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Estilos Visuais</h3>
          </div>
          <p className="text-white/50 text-xs">
            {allowMultiple ? 'Clique para adicionar estilos (múltiplos)' : 'Escolha um estilo'}
          </p>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-white/10 overflow-x-auto scrollbar-none">
        {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((category) => {
          const isActive = activeCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm font-medium",
                isActive
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      {/* Styles Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={cn(
          "grid gap-2",
          compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        )}>
          {filteredPresets.map((preset) => {
            const isSelected = selectedStyles.includes(preset.id);
            
            return (
              <button
                key={preset.id}
                onClick={() => onSelectStyle(preset)}
                className={cn(
                  "relative p-3 rounded-xl border transition-all",
                  "hover:scale-105 active:scale-95",
                  isSelected
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20"
                    : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                )}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  {preset.icon}
                </div>
                
                {/* Name */}
                <div className="text-white text-sm font-medium mb-1">
                  {preset.name}
                </div>
                
                {/* Description (não mostrar em compact) */}
                {!compact && (
                  <div className="text-white/40 text-[10px] line-clamp-2">
                    {preset.suffix}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Styles Summary */}
      {allowMultiple && selectedStyles.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 text-xs font-medium">
              {selectedStyles.length} {selectedStyles.length === 1 ? 'estilo selecionado' : 'estilos selecionados'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {selectedStyles.map((styleId) => {
              const style = STYLE_PRESETS.find(s => s.id === styleId);
              if (!style) return null;
              
              return (
                <span
                  key={styleId}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-white/90 text-xs"
                >
                  <span className="text-white/60">{style.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook para gerenciar estilos selecionados
export function useStylePresets() {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleStyle = (style: StylePreset) => {
    setSelectedStyles(prev => 
      prev.includes(style.id)
        ? prev.filter(id => id !== style.id)
        : [...prev, style.id]
    );
  };

  const clearStyles = () => setSelectedStyles([]);

  const getStyleSuffixes = () => {
    return selectedStyles
      .map(id => STYLE_PRESETS.find(s => s.id === id)?.suffix)
      .filter(Boolean)
      .join(', ');
  };

  return {
    selectedStyles,
    toggleStyle,
    clearStyles,
    getStyleSuffixes
  };
}
