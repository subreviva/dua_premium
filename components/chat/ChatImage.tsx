"use client";

import { motion } from "framer-motion";
import { Download, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface ChatImageProps {
  imageUrl: string;
  prompt: string;
  isFree?: boolean;
  creditsCharged?: number;
  className?: string;
}

export function ChatImage({ 
  imageUrl, 
  prompt, 
  isFree = false, 
  creditsCharged = 0,
  className = "" 
}: ChatImageProps) {
  
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dua-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download iniciado', {
        description: 'A imagem foi baixada com sucesso.',
      });
    } catch (error) {
      toast.error('Erro ao baixar', {
        description: 'Não foi possível baixar a imagem.',
      });
    }
  };

  const handleOpenNew = () => {
    window.open(imageUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={`group relative ${className}`}
    >
      {/* Badge de status */}
      {isFree && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute -top-3 -left-3 z-10 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Grátis
            </span>
          </div>
        </motion.div>
      )}

      {creditsCharged > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute -top-3 -left-3 z-10 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg"
        >
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {creditsCharged} Crédito{creditsCharged > 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {/* Container da imagem */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl">
        {/* Efeito de brilho animado */}
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '200%', opacity: [0, 0.3, 0] }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10"
          style={{ width: '50%' }}
        />

        {/* Imagem */}
        <div className="relative aspect-square w-full max-w-md">
          <Image
            src={imageUrl}
            alt={prompt}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>

        {/* Overlay com ações (visível no hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            {/* Prompt */}
            <div className="text-white/90 text-sm line-clamp-2 font-medium">
              {prompt}
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleOpenNew}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading shimmer effect (opcional) */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none rounded-2xl" />
    </motion.div>
  );
}
