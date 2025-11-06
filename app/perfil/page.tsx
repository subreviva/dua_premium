"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AvatarSelector } from "@/components/ui/avatar-selector";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Loader2, 
  User, 
  Mail, 
  AtSign, 
  MessageSquare, 
  Save, 
  ArrowLeft,
  Shield
} from "lucide-react";
import { PremiumNavbar } from "@/components/ui/premium-navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com'
];

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sessão expirada", {
          description: "Faça login para continuar"
        });
        router.push('/login');
        return;
      }

      const userId = session.user.id;
      const userEmail = session.user.email || '';
      
      setUser(session.user);
      setIsAdmin(ADMIN_EMAILS.includes(userEmail));

      // Carregar dados do perfil
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PRODUCTION: Removed console.error
        toast.error("Erro ao carregar perfil");
        return;
      }

      if (userData) {
        setName(userData.name || '');
        setUsername(userData.username || '');
        setBio(userData.bio || '');
        setAvatarUrl(userData.avatar_url || '');
      }

    } catch (error) {
      // PRODUCTION: Removed console.error
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!name.trim()) {
      toast.error("Nome obrigatório", {
        description: "Por favor, insira seu nome"
      });
      return;
    }

    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error("Username inválido", {
        description: "Use apenas letras, números e underscore"
      });
      return;
    }

    setSaving(true);

    try {
      // Verificar se username já existe (se foi alterado)
      if (username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          toast.error("Username já existe", {
            description: "Escolha outro username"
          });
          setSaving(false);
          return;
        }
      }

      // Preparar dados do perfil
      const profileData = {
        id: user.id,
        email: user.email,
        name: name.trim(),
        username: username.toLowerCase().trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString()
      };

      console.log('📤 Salvando perfil:', profileData);

      // UPSERT: Inserir ou atualizar perfil (resolve problema se registro não existir)
      // Nota: onConflict deve ser o nome da coluna, não um parâmetro de objeto
      const { data, error } = await supabase
        .from('users')
        .upsert(profileData)
        .select();

      console.log('📥 Resposta Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro detalhado:', error);
        // Se ainda houver erro de schema, mostrar mensagem específica
        if (error.message.includes('schema cache') || error.message.includes('column')) {
          toast.error("Erro de schema do banco", {
            description: `${error.message}. Verifique se todas as colunas existem na tabela users.`
          });
        } else {
          toast.error("Erro ao salvar", {
            description: error.message
          });
        }
        return;
      }

      toast.success("Perfil atualizado! ✨", {
        description: "Suas alterações foram salvas"
      });

    } catch (error: any) {
      toast.error("Erro ao salvar perfil", {
        description: error.message || "Tente novamente"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
            style={{
              backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
            }}
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[80px]" />
        </div>
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Carregando perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/dreamina-2025-10-27-1290-fundo%20com%20estas%20cores%20-%20para%20hero%20de%20web....jpeg)'
          }}
        />
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[80px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      {/* Navbar */}
      <div className="relative z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <PremiumNavbar variant="solid" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 space-y-8">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Perfil
          </h1>
          <p className="text-neutral-400 text-sm">
            Configure sua identidade na plataforma
          </p>
          {isAdmin && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <Shield className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-500">ADMIN</span>
            </div>
          )}
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2 className="text-xl font-semibold text-white">Avatar</h2>
          </div>
          <AvatarSelector
            currentAvatar={avatarUrl}
            userId={user?.id || ''}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </motion.div>

        {/* Profile Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2 className="text-xl font-semibold text-white">Informações</h2>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-300 text-sm font-medium">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/60 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl transition-all"
              />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-black/30 border-white/5 text-neutral-500 h-12 rounded-xl cursor-not-allowed"
              />
              <p className="text-xs text-neutral-600">Email não pode ser alterado</p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-300 text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                  @
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="seuusername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="bg-black/60 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 h-12 rounded-xl pl-8 transition-all"
                />
              </div>
              <p className="text-xs text-neutral-600">
                URL pública: dua.pt/@{username || 'username'}
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-neutral-300 text-sm font-medium">
                Sobre você
              </Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-black/60 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 min-h-[120px] rounded-xl resize-none transition-all"
                maxLength={200}
              />
              <p className="text-xs text-neutral-600 text-right">
                {bio.length}/200 caracteres
              </p>
            </div>
          </div>
        </motion.div>

        {/* Community Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-2xl border border-purple-500/20 rounded-3xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2 className="text-xl font-semibold text-white">Comunidade</h2>
          </div>

          <p className="text-sm text-neutral-300 mb-6">
            Conecte-se com outros usuários e fique por dentro das novidades
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => window.open('https://discord.gg/dua-community', '_blank')}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white h-12 rounded-xl font-medium transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord
            </Button>

            <Button
              onClick={() => window.open('https://t.me/dua_community', '_blank')}
              className="bg-[#0088cc] hover:bg-[#006699] text-white h-12 rounded-xl font-medium transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627c-.168.9-.5 1.201-.820 1.230c-.697.064-1.226-.461-1.901-.903c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.230c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345c-.479.329-.913.489-1.302.481c-.428-.008-1.252-.241-1.865-.44c-.752-.244-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635c.099-.002.321.023.465.141c.121.099.155.232.171.326c.016.093.036.306.020.472z"/>
              </svg>
              Telegram
            </Button>
          </div>
        </motion.div>

        {/* Save Button - Fixed Bottom Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="sticky bottom-4 md:relative md:bottom-0"
        >
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-14 rounded-xl font-semibold text-base shadow-lg shadow-purple-500/20 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Perfil
              </>
            )}
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
