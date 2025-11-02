
import React from 'react';
import { CanvasContent, ImageObject } from '../types';

interface SessionGalleryProps {
  gallery: ImageObject[];
  onSelect: (content: CanvasContent) => void;
}

const SessionGallery: React.FC<SessionGalleryProps> = ({ gallery, onSelect }) => {
  if (gallery.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Galeria da Sessão</h2>
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
        {gallery.map((image, index) => (
          <button 
            key={index} 
            onClick={() => onSelect({ ...image, type: 'image', prompt: 'Da galeria' })}
            className="aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-blue-500 focus:border-blue-500 focus:outline-none transition"
            title="Selecionar esta imagem"
          >
            <img src={image.src} alt={`Imagem da galeria ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SessionGallery;
