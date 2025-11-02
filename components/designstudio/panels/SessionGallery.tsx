'use client';

import React from 'react';
import { ImageObject, CanvasContent } from '@/types/designstudio-full';
import { Images } from 'lucide-react';

interface SessionGalleryProps {
  gallery: ImageObject[];
  onSelect: (content: CanvasContent) => void;
}

const SessionGallery: React.FC<SessionGalleryProps> = ({ gallery, onSelect }) => {
  if (gallery.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        <Images className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">A galeria está vazia.</p>
        <p className="text-xs mt-1">As imagens geradas aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Galeria da Sessão</h3>
      <div className="grid grid-cols-2 gap-2">
        {gallery.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect({ type: 'image', src: item.src, mimeType: item.mimeType, prompt: '' })}
            className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 transition-all hover:scale-105"
          >
            <img src={item.src} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SessionGallery;
