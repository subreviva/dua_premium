'use client';

import React, { useState } from 'react';
import { Wand2, Image as ImageIcon, Package, Grid3x3, Share2, Zap, Coffee, Dumbbell, Rocket, Heart, Gamepad2, Music, Camera, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Template {
  id: string;
  name: string;
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  category: 'logo' | 'social' | 'pattern' | 'icon' | 'image';
  icon?: React.ReactNode;
  preview?: string;
  tags?: string[];
}

export const PREMIUM_TEMPLATES: Template[] = [
  // LOGOS
  {
    id: 'logo-tech',
    name: 'Logo Tech Moderna',
    prompt: 'minimalist technology logo with gradient, sleek design, modern aesthetic, blue and purple colors',
    aspectRatio: '1:1',
    category: 'logo',
    icon: <Zap className="w-5 h-5" />,
    tags: ['tecnologia', 'startup', 'moderno']
  },
  {
    id: 'logo-cafe',
    name: 'Café Artesanal',
    prompt: 'warm coffee shop logo, vintage style, cozy atmosphere, brown and cream colors, coffee bean illustration',
    aspectRatio: '1:1',
    category: 'logo',
    icon: <Coffee className="w-5 h-5" />,
    tags: ['café', 'vintage', 'artesanal']
  },
  {
    id: 'logo-fitness',
    name: 'Fitness Premium',
    prompt: 'dynamic fitness logo, energetic design, strong athletic aesthetic, bold typography, red and black',
    aspectRatio: '1:1',
    category: 'logo',
    icon: <Dumbbell className="w-5 h-5" />,
    tags: ['fitness', 'saúde', 'energia']
  },
  {
    id: 'logo-startup',
    name: 'Startup Inovadora',
    prompt: 'innovative startup logo, rocket or upward arrow, professional yet creative, vibrant colors',
    aspectRatio: '1:1',
    category: 'logo',
    icon: <Rocket className="w-5 h-5" />,
    tags: ['startup', 'inovação', 'negócios']
  },

  // SOCIAL MEDIA
  {
    id: 'social-instagram',
    name: 'Post Instagram',
    prompt: 'vibrant social media post design, eye-catching colors, modern layout, space for text overlay',
    aspectRatio: '1:1',
    category: 'social',
    icon: <Camera className="w-5 h-5" />,
    tags: ['instagram', 'social', 'vibrante']
  },
  {
    id: 'social-story',
    name: 'Story Vertical',
    prompt: 'engaging instagram story design, vertical layout, dynamic composition, trendy aesthetic',
    aspectRatio: '9:16',
    category: 'social',
    icon: <Share2 className="w-5 h-5" />,
    tags: ['story', 'vertical', 'engagement']
  },
  {
    id: 'social-youtube',
    name: 'Thumbnail YouTube',
    prompt: 'eye-catching youtube thumbnail, bold text space, high contrast, professional quality',
    aspectRatio: '16:9',
    category: 'social',
    icon: <ImageIcon className="w-5 h-5" />,
    tags: ['youtube', 'thumbnail', 'video']
  },

  // PADRÕES
  {
    id: 'pattern-geometric',
    name: 'Geométrico Moderno',
    prompt: 'modern geometric pattern, clean lines, minimalist design, seamless tileable, blue and white',
    aspectRatio: '1:1',
    category: 'pattern',
    icon: <Grid3x3 className="w-5 h-5" />,
    tags: ['geométrico', 'minimalista', 'pattern']
  },
  {
    id: 'pattern-floral',
    name: 'Floral Delicado',
    prompt: 'delicate floral pattern, watercolor style, soft pastel colors, organic flowing design',
    aspectRatio: '1:1',
    category: 'pattern',
    icon: <Heart className="w-5 h-5" />,
    tags: ['floral', 'delicado', 'aquarela']
  },
  {
    id: 'pattern-tech',
    name: 'Tech Futurista',
    prompt: 'futuristic tech pattern, circuit board inspired, neon accents, dark background, cyberpunk',
    aspectRatio: '1:1',
    category: 'pattern',
    icon: <Gamepad2 className="w-5 h-5" />,
    tags: ['tech', 'futurista', 'cyberpunk']
  },

  // ÍCONES
  {
    id: 'icon-music',
    name: 'Ícone Música',
    prompt: 'music app icon, headphones or note symbol, modern flat design, vibrant gradient',
    aspectRatio: '1:1',
    category: 'icon',
    icon: <Music className="w-5 h-5" />,
    tags: ['música', 'app', 'icon']
  },
  {
    id: 'icon-shopping',
    name: 'Ícone Compras',
    prompt: 'shopping bag icon, e-commerce style, clean minimalist design, friendly colors',
    aspectRatio: '1:1',
    category: 'icon',
    icon: <ShoppingBag className="w-5 h-5" />,
    tags: ['compras', 'ecommerce', 'icon']
  },
  {
    id: 'icon-package',
    name: 'Ícone Pacote',
    prompt: 'package delivery icon, box with ribbon, modern 3D style, professional look',
    aspectRatio: '1:1',
    category: 'icon',
    icon: <Package className="w-5 h-5" />,
    tags: ['delivery', 'pacote', 'icon']
  },

  // IMAGENS
  {
    id: 'image-hero',
    name: 'Hero Banner',
    prompt: 'professional hero banner image, modern abstract background, premium quality, space for text',
    aspectRatio: '16:9',
    category: 'image',
    icon: <ImageIcon className="w-5 h-5" />,
    tags: ['hero', 'banner', 'web']
  },
  {
    id: 'image-product',
    name: 'Product Showcase',
    prompt: 'clean product showcase background, minimal aesthetic, soft lighting, professional photography style',
    aspectRatio: '4:3',
    category: 'image',
    icon: <Package className="w-5 h-5" />,
    tags: ['produto', 'showcase', 'profissional']
  },
];

const CATEGORY_CONFIG = {
  logo: { label: 'Logos', icon: <Wand2 className="w-5 h-5" strokeWidth={0.75} />, color: 'from-orange-500 to-orange-600' },
  social: { label: 'Social Media', icon: <Share2 className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
  pattern: { label: 'Padrões', icon: <Grid3x3 className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
  icon: { label: 'Ícones', icon: <Package className="w-5 h-5" />, color: 'from-orange-500 to-red-500' },
  image: { label: 'Imagens', icon: <ImageIcon className="w-5 h-5" />, color: 'from-indigo-500 to-purple-500' },
};

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
  currentCategory?: 'logo' | 'social' | 'pattern' | 'icon' | 'image';
}

export default function TemplateGallery({ onSelectTemplate, currentCategory }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof currentCategory>(currentCategory || 'logo');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = PREMIUM_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    const matchesSearch = searchQuery 
      ? template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header com Search */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-5 h-5 text-orange-400" strokeWidth={0.75} />
          <h3 className="text-white font-semibold">Templates Premium</h3>
        </div>
        
        <input
          type="text"
          placeholder="Buscar templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-white/10 overflow-x-auto scrollbar-none">
        {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((category) => {
          const config = CATEGORY_CONFIG[category];
          const isActive = selectedCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap",
                isActive
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {config.icon}
              <span className="text-sm font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <Wand2 className="w-12 h-12 mb-3 opacity-20" strokeWidth={0.75} />
            <p className="text-sm">Nenhum template encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  "group relative p-4 rounded-xl border transition-all text-left",
                  "bg-gradient-to-br from-white/5 to-white/0 hover:from-white/10 hover:to-white/5",
                  "border-white/10 hover:border-white/20",
                  "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {/* Icon Badge */}
                <div className={cn(
                  "absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity",
                  CATEGORY_CONFIG[template.category].color
                )}>
                  {template.icon}
                </div>

                {/* Template Info */}
                <h4 className="text-white font-semibold mb-2 pr-10">{template.name}</h4>
                <p className="text-white/60 text-xs mb-3 line-clamp-2">{template.prompt}</p>
                
                {/* Tags */}
                {template.tags && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-white/10 rounded text-white/50 text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Aspect Ratio Badge */}
                {template.aspectRatio && (
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/50 rounded text-white/60 text-[10px]">
                    {template.aspectRatio}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
