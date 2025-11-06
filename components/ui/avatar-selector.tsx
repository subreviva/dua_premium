"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Check, User as UserIcon, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Galeria de avatares predefinidos premium - Estilos 3D modernos
const PRESET_AVATARS = [
  // Avataaars 3D - Personagens realistas
  "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50",
  "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Aneka&backgroundColor=ffdfbf,ffd5dc,c0aede&radius=50",
  "https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Princess&backgroundColor=d1d4f9,ffd5dc,ffdfbf&radius=50",
  
  // Lorelei - Estilo 3D elegante
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Luna&backgroundColor=b6e3f4&radius=50&backgroundType=gradientLinear",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Nova&backgroundColor=ffd5dc&radius=50&backgroundType=gradientLinear",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Aurora&backgroundColor=c0aede&radius=50&backgroundType=gradientLinear",
  
  // Notionists - Estilo minimalista 3D
  "https://api.dicebear.com/9.x/notionists/svg?seed=Max&backgroundColor=ffdfbf&radius=50",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Charlie&backgroundColor=d1d4f9&radius=50",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Bella&backgroundColor=b6e3f4&radius=50",
  
  // Adventurer - Personagens de aventura 3D
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Star&backgroundColor=ffd5dc&radius=50",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Cosmic&backgroundColor=c0aede&radius=50",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Galaxy&backgroundColor=ffdfbf&radius=50",
  
  // Big Smile - Avatares felizes e coloridos
  "https://api.dicebear.com/9.x/big-smile/svg?seed=Happy&backgroundColor=b6e3f4&radius=50",
  "https://api.dicebear.com/9.x/big-smile/svg?seed=Joy&backgroundColor=ffd5dc&radius=50",
  "https://api.dicebear.com/9.x/big-smile/svg?seed=Smile&backgroundColor=d1d4f9&radius=50",
  
  // Fun Emoji - Emojis 3D divertidos
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Cool&backgroundColor=c0aede&radius=50",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Party&backgroundColor=ffdfbf&radius=50",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Vibe&backgroundColor=b6e3f4&radius=50",
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  userId: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export function AvatarSelector({ currentAvatar, userId, onAvatarUpdate }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || PRESET_AVATARS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetSelect = async (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (error) throw error;

      onAvatarUpdate(avatarUrl);
      toast.success("Avatar atualizado! ✨", {
        description: "Seu avatar foi alterado com sucesso"
      });
    } catch (error) {
      // PRODUCTION: Removed console.error
      toast.error("Erro ao atualizar avatar", {
        description: "Tente novamente"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Arquivo inválido", {
        description: "Por favor, selecione uma imagem"
      });
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: "A imagem deve ter no máximo 5MB"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload para Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      setUploadProgress(100);

      // Atualizar avatar no banco de dados
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSelectedAvatar(publicUrl);
      onAvatarUpdate(publicUrl);

      toast.success("Foto enviada com sucesso! 🎉", {
        description: "Seu avatar personalizado foi aplicado"
      });

    } catch (error: any) {
      // PRODUCTION: Removed console.error
      toast.error("Erro ao fazer upload", {
        description: error.message || "Tente novamente"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative group"
        >
          {/* Glow effect 3D */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur-2xl transition-all duration-500 animate-pulse" />
          
          <Avatar className="w-36 h-36 border-4 border-purple-500/30 shadow-2xl shadow-purple-500/30 relative z-10 transform group-hover:scale-105 transition-all duration-300">
            <AvatarImage 
              src={selectedAvatar} 
              alt="Avatar"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white text-3xl">
              <UserIcon className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>
          
          {/* Badge 3D effect */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full p-3 shadow-lg z-20 border-4 border-neutral-900"
          >
            <Camera className="w-4 h-4 text-white" />
          </motion.div>
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full backdrop-blur-md z-30">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                <span className="text-xs text-white font-bold">{uploadProgress}%</span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Escolha seu Avatar
          </h3>
          <p className="text-sm text-neutral-400">Selecione um estilo 3D ou faça upload</p>
        </div>
      </div>

      {/* Upload Button */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading}
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all"
        >
          {isUploading ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Enviando... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Fazer Upload de Foto
            </>
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-2 text-neutral-500">ou escolha um avatar</span>
          </div>
        </div>
      </div>

      {/* Preset Avatars Grid - 3D Gallery */}
      <div className="grid grid-cols-6 gap-3">
        {PRESET_AVATARS.map((avatarUrl, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePresetSelect(avatarUrl)}
            className={`relative rounded-2xl overflow-hidden transition-all group ${
              selectedAvatar === avatarUrl
                ? "ring-4 ring-purple-500 shadow-xl shadow-purple-500/50 scale-105"
                : "ring-2 ring-white/10 hover:ring-purple-400/50 hover:shadow-lg hover:shadow-purple-400/30"
            }`}
          >
            {/* 3D Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Avatar className="w-full h-full aspect-square">
              <AvatarImage 
                src={avatarUrl} 
                alt={`Avatar ${index + 1}`}
                className="object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <AvatarFallback className="bg-gradient-to-br from-neutral-800 to-neutral-900">
                <UserIcon className="w-6 h-6 text-neutral-600" />
              </AvatarFallback>
            </Avatar>
            
            {/* Selected Badge with 3D effect */}
            <AnimatePresence>
              {selectedAvatar === avatarUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-pink-600/90 to-purple-600/90 backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={3} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Hover shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
```
          </motion.button>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <ImageIcon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-purple-300">
          <p className="font-medium mb-1">Dica:</p>
          <p className="text-purple-400/80">
            Para melhores resultados, use imagens quadradas com fundo claro. Tamanho máximo: 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
