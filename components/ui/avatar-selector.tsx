"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Check, User as UserIcon, Loader2, Image as ImageIcon, Sparkles, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/lib/supabase";

const supabase = supabaseClient;

// Coleções premium de avatares com personagens ultra elegantes
const CHARACTER_ICON_PACKS = [
  {
    id: "neon-legends",
    name: "Neon Legends",
    description: "Personagens futuristas com brilho cyberpunk",
    accent: "from-cyan-400 to-purple-600",
    icon: Zap,
    avatars: [
      "https://api.dicebear.com/9.x/adventurer/svg?seed=NeonPulse&backgroundColor=020617,0f172a&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=ByteQueen&backgroundColor=0f172a,1e1b4b&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=CyberNova&backgroundColor=0b1120,1d4ed8&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=PixelKnight&backgroundColor=111827,0ea5e9&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/adventurer/svg?seed=VoidRunner&backgroundColor=1e1b4b,581c87&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=ElectricSoul&backgroundColor=0f172a,1d4ed8&backgroundType=gradientLinear&radius=50",
    ],
  },
  {
    id: "lunar-royalty",
    name: "Lunar Royalty",
    description: "Avatares com joias e traços de luxo espacial",
    accent: "from-amber-300 to-pink-500",
    icon: Crown,
    avatars: [
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Celestia&backgroundColor=0f172a,312e81&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Empress&backgroundColor=1f2937,581c87&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Seraphine&backgroundColor=0f172a,831843&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Lunara&backgroundColor=111827,db2777&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Aurora&backgroundColor=312e81,7c3aed&backgroundType=gradientLinear&radius=50",
      "https://api.dicebear.com/9.x/lorelei/svg?seed=Stellar&backgroundColor=581c87,c026d3&backgroundType=gradientLinear&radius=50",
    ],
  },
  {
    id: "pastel-aura",
    name: "Pastel Aura",
    description: "Personagens suaves com estética editorial",
    accent: "from-rose-300 to-indigo-300",
    icon: Sparkles,
    avatars: [
      "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Muse&backgroundColor=fce7f3,ede9fe&radius=50",
      "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Bloom&backgroundColor=ede9fe,c7d2fe&radius=50",
      "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Iris&backgroundColor=e0e7ff,faf5ff&radius=50",
      "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Halo&backgroundColor=fdf2f8,e0e7ff&radius=50",
      "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Pearl&backgroundColor=fce7f3,fae8ff&radius=50",
      "https://api.dicebear.com/9.x/notionists-neutral/svg?seed=Dream&backgroundColor=ede9fe,ddd6fe&radius=50",
    ],
  },
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  userId: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export function AvatarSelector({ currentAvatar, userId, onAvatarUpdate }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || CHARACTER_ICON_PACKS[0].avatars[0]);
  const [activeTab, setActiveTab] = useState(CHARACTER_ICON_PACKS[0].id);
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
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
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
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enviando... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Fazer Upload
            </>
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-2 text-neutral-500">ou escolha uma coleção premium</span>
          </div>
        </div>
      </div>

      {/* Premium Character Packs - Tab Navigation */}
      <div className="space-y-5">
        {/* Tab Buttons */}
        <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
          {CHARACTER_ICON_PACKS.map((pack) => {
            const Icon = pack.icon;
            const isActive = activeTab === pack.id;
            
            return (
              <motion.button
                key={pack.id}
                onClick={() => setActiveTab(pack.id)}
                className={`flex-1 relative px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${pack.accent} rounded-xl`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{pack.name}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <AnimatePresence mode="wait">
          {CHARACTER_ICON_PACKS.map((pack) => {
            if (pack.id !== activeTab) return null;
            
            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-xl"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Coleção premium</p>
                    <h4 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                      <span className={`inline-flex h-2 w-2 rounded-full bg-gradient-to-r ${pack.accent} animate-pulse`} />
                      {pack.name}
                    </h4>
                    <p className="text-sm text-white/60 mt-1">{pack.description}</p>
                  </div>
                  <span className="px-4 py-2 rounded-full text-xs font-bold text-black bg-gradient-to-r from-white to-white/90 shadow-lg shadow-black/20 self-start md:self-auto">
                    Exclusivo DUA
                  </span>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {pack.avatars.map((avatarUrl, index) => (
                    <motion.button
                      key={`${pack.id}-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePresetSelect(avatarUrl)}
                      className={`relative rounded-2xl overflow-hidden transition-all group ${
                        selectedAvatar === avatarUrl
                          ? "ring-4 ring-white shadow-2xl shadow-white/40 scale-105"
                          : "ring-2 ring-white/10 hover:ring-white/40 hover:shadow-lg hover:shadow-white/20"
                      }`}
                    >
                      {/* Hover Gradient Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${pack.accent} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

                      <Avatar className="w-full h-full aspect-square">
                        <AvatarImage
                          src={avatarUrl}
                          alt={`${pack.name} ${index + 1}`}
                          className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-neutral-900 to-neutral-800">
                          <UserIcon className="w-6 h-6 text-neutral-500" />
                        </AvatarFallback>
                      </Avatar>

                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {selectedAvatar === avatarUrl && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
                          >
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="flex flex-col items-center gap-1"
                            >
                              <Check className="w-10 h-10 text-white" strokeWidth={3} />
                              <span className="text-[10px] uppercase tracking-[0.2em] text-white/90 font-bold">Ativo</span>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
