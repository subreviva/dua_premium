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

// Galeria de avatares predefinidos premium
const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Princess",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Star",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Nova",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Aurora",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Cosmic",
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
          className="relative"
        >
          <Avatar className="w-32 h-32 border-4 border-purple-500/20 shadow-2xl shadow-purple-500/20">
            <AvatarImage src={selectedAvatar} alt="Avatar" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
              <UserIcon className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                <span className="text-xs text-white font-medium">{uploadProgress}%</span>
              </div>
            </div>
          )}
        </motion.div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">Escolha seu Avatar</h3>
          <p className="text-sm text-neutral-400">Selecione um avatar ou faça upload de sua foto</p>
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

      {/* Preset Avatars Grid */}
      <div className="grid grid-cols-4 gap-3">
        {PRESET_AVATARS.map((avatarUrl, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePresetSelect(avatarUrl)}
            className={`relative rounded-xl overflow-hidden transition-all ${
              selectedAvatar === avatarUrl
                ? "ring-4 ring-purple-500 shadow-lg shadow-purple-500/50"
                : "ring-2 ring-white/10 hover:ring-purple-500/50"
            }`}
          >
            <Avatar className="w-full h-full">
              <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
              <AvatarFallback>
                <UserIcon className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            
            <AnimatePresence>
              {selectedAvatar === avatarUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 bg-purple-600/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
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
