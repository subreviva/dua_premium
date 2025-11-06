"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users,
  ExternalLink,
  Sparkles,
  Shield,
  Crown
} from "lucide-react";

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

      // UPSERT: Inserir ou atualizar perfil (resolve problema se registro não existir)
      const { error } = await supabase
        .from('users')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        // Se ainda houver erro de schema, mostrar mensagem específica
        if (error.message.includes('schema cache')) {
          toast.error("Erro de configuração", {
            description: "Execute o script SQL fix-users-table-complete.sql no Supabase"
          });
        } else {
          throw error;
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
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/chat')}
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Meu Perfil
                {isAdmin && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </h1>
              <p className="text-sm text-neutral-400">Personalize sua experiência</p>
            </div>
          </div>
          
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-neutral-900/80 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Avatar
              </CardTitle>
              <CardDescription>
                Escolha um avatar ou faça upload de sua foto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarSelector
                currentAvatar={avatarUrl}
                userId={user?.id || ''}
                onAvatarUpdate={handleAvatarUpdate}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-neutral-900/80 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-purple-500" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Configure seu nome e username
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12"
                />
              </div>

              {/* Email (readonly) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-black/30 border-white/5 text-neutral-500 h-12 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-500">O email não pode ser alterado</p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-neutral-300 flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Username (opcional)
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="seuusername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 h-12"
                />
                <p className="text-xs text-neutral-500">
                  Usado para criar seu link público: dua.pt/@{username || 'username'}
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-neutral-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Bio (opcional)
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre você..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-black/50 border-white/10 text-white placeholder:text-neutral-500 focus:border-purple-500 min-h-[100px] resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-neutral-500 text-right">
                  {bio.length}/200 caracteres
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Community Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-purple-400" />
                Comunidade DUA
              </CardTitle>
              <CardDescription>
                Junte-se à nossa comunidade e fique por dentro das novidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-neutral-300">
                Conecte-se com outros usuários, compartilhe criações e receba suporte direto da nossa equipe.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.open('https://discord.gg/dua-community', '_blank')}
                  className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Entrar no Discord
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={() => window.open('https://t.me/dua_community', '_blank')}
                  className="flex-1 bg-[#0088cc] hover:bg-[#006699] text-white h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627c-.168.9-.5 1.201-.820 1.230c-.697.064-1.226-.461-1.901-.903c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.230c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345c-.479.329-.913.489-1.302.481c-.428-.008-1.252-.241-1.865-.44c-.752-.244-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635c.099-.002.321.023.465.141c.121.099.155.232.171.326c.016.093.036.306.020.472z"/>
                  </svg>
                  Entrar no Telegram
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mt-4">
                <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-purple-300">
                  <p className="font-medium mb-1">Benefícios da Comunidade:</p>
                  <ul className="list-disc list-inside text-purple-400/80 space-y-0.5">
                    <li>Suporte prioritário da equipe</li>
                    <li>Acesso antecipado a novos recursos</li>
                    <li>Dicas e tutoriais exclusivos</li>
                    <li>Networking com outros criadores</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Badge */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-500 flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Administrador
                    </h3>
                    <p className="text-sm text-yellow-600">
                      Você possui acesso administrativo completo à plataforma
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}
