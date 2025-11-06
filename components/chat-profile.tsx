"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Award, 
  Trophy, 
  Rocket, 
  ImageIcon, 
  Video,
  Loader2,
  Coins,
  Users,
  Activity,
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Grid3x3,
  List,
  ArrowUpDown,
  MinusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  total_tokens: number;
  tokens_used: number;
  subscription_tier: string;
  total_projects: number;
  total_generated_content: number;
  created_at: string;
}

interface AdminData extends UserData {
  has_access: boolean;
  invite_code_used?: string;
  last_login?: string;
}

const ADMIN_EMAILS = ['admin@dua.pt', 'subreviva@gmail.com', 'dev@dua.pt', 'dev@dua.com'];

export function ChatProfile() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [allUsers, setAllUsers] = useState<AdminData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tokensToAdd, setTokensToAdd] = useState<number>(100);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'created' | 'tokens' | 'usage' | 'email'>('created');
  const [filterTier, setFilterTier] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // Verificar se é admin
      const adminStatus = ADMIN_EMAILS.includes(user.email || '');
      setIsAdmin(adminStatus);

      // Carregar dados do usuário atual
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userError && userData) {
        setCurrentUser(userData);
      }

      // Se for admin, carregar todos os usuários
      if (adminStatus) {
        const { data: usersData, error: usersError } = await supabaseClient
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!usersError && usersData) {
          setAllUsers(usersData);
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleInjectTokens = async () => {
    if (!selectedUserId || tokensToAdd <= 0) {
      toast.error('Selecione um usuário e digite quantidade válida');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabaseClient.rpc('inject_tokens', {
        user_id: selectedUserId,
        tokens_amount: tokensToAdd
      });

      if (error) throw error;

      toast.success(`${tokensToAdd} tokens adicionados com sucesso!`);
      await loadUserData();
      setSelectedUserId(null);
      setTokensToAdd(100);
    } catch (error) {
      toast.error('Erro ao injetar tokens');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveTokens = async (userId: string, amount: number) => {
    if (amount <= 0) {
      toast.error('Digite quantidade válida');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabaseClient.rpc('inject_tokens', {
        user_id: userId,
        tokens_amount: -amount
      });

      if (error) throw error;

      toast.success(`${amount} tokens removidos com sucesso!`);
      await loadUserData();
    } catch (error) {
      toast.error('Erro ao remover tokens');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setProcessing(true);
    try {
      const { error } = await supabaseClient
        .from('users')
        .update({
          full_name: editForm.full_name,
          display_name: editForm.display_name,
          subscription_tier: editForm.subscription_tier,
          bio: editForm.bio
        })
        .eq('id', editingUser);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso!');
      await loadUserData();
      setEditingUser(null);
      setEditForm({});
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Confirma exclusão de ${userEmail}?`)) return;

    setProcessing(true);
    try {
      const { error } = await supabaseClient
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário excluído com sucesso!');
      await loadUserData();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    setProcessing(true);
    try {
      const { error } = await supabaseClient
        .from('users')
        .update({ has_access: !currentAccess })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Acesso ${!currentAccess ? 'ativado' : 'desativado'} com sucesso!`);
      await loadUserData();
    } catch (error) {
      toast.error('Erro ao alterar acesso');
    } finally {
      setProcessing(false);
    }
  };

  const handleResetTokens = async (userId: string) => {
    if (!confirm('Resetar contador de tokens usados para 0?')) return;

    setProcessing(true);
    try {
      const { error } = await supabaseClient
        .from('users')
        .update({ tokens_used: 0 })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Tokens usados resetados para 0!');
      await loadUserData();
    } catch (error) {
      toast.error('Erro ao resetar tokens');
    } finally {
      setProcessing(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      free: "from-gray-500 to-gray-600",
      basic: "from-blue-500 to-blue-600",
      premium: "from-purple-500 to-pink-500",
      ultimate: "from-yellow-500 to-orange-500"
    };
    return colors[tier as keyof typeof colors] || colors.free;
  };

  const getAvatarUrl = (user: UserData) => {
    if (user.avatar_url) return user.avatar_url;
    const name = user.display_name || user.full_name || user.email;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  const filteredUsers = allUsers
    .filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;
      
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'tokens':
          return (b.total_tokens || 0) - (a.total_tokens || 0);
        case 'usage':
          return (b.tokens_used || 0) - (a.tokens_used || 0);
        case 'created':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-white">Erro ao carregar perfil</p>
      </div>
    );
  }

  // PAINEL DE ADMINISTRADOR
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Admin */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6">
            <h1 className="text-3xl font-bold mb-2">🔧 Painel de Administrador</h1>
            <p className="text-white/80">Gerencie usuários e injete tokens</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Usuários</p>
                  <p className="text-2xl font-bold">{allUsers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Coins className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Tokens Distribuídos</p>
                  <p className="text-2xl font-bold">
                    {allUsers.reduce((sum, u) => sum + (u.total_tokens || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Conteúdo Gerado</p>
                  <p className="text-2xl font-bold">
                    {allUsers.reduce((sum, u) => sum + (u.total_generated_content || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Premium Users</p>
                  <p className="text-2xl font-bold">
                    {allUsers.filter(u => u.subscription_tier !== 'free').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Injeção de Tokens */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Injetar Tokens
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-white/60 mb-2 block">Selecionar Usuário</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/50 border-white/10 text-white"
                  />
                </div>
                
                <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                  {filteredUsers.slice(0, 10).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all",
                        selectedUserId === user.id
                          ? "bg-purple-500/20 border border-purple-500"
                          : "bg-black/30 border border-white/5 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-white/60">
                            {user.total_tokens || 0} tokens • {user.subscription_tier}
                          </p>
                        </div>
                        {selectedUserId === user.id && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Quantidade de Tokens</label>
                  <Input
                    type="number"
                    min="1"
                    value={tokensToAdd}
                    onChange={(e) => setTokensToAdd(Number(e.target.value))}
                    className="bg-black/50 border-white/10 text-white text-center text-2xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setTokensToAdd(100)}
                    variant="outline"
                    className="border-white/20"
                  >
                    +100
                  </Button>
                  <Button
                    onClick={() => setTokensToAdd(500)}
                    variant="outline"
                    className="border-white/20"
                  >
                    +500
                  </Button>
                  <Button
                    onClick={() => setTokensToAdd(1000)}
                    variant="outline"
                    className="border-white/20"
                  >
                    +1000
                  </Button>
                  <Button
                    onClick={() => setTokensToAdd(5000)}
                    variant="outline"
                    className="border-white/20"
                  >
                    +5000
                  </Button>
                </div>

                <Button
                  onClick={handleInjectTokens}
                  disabled={!selectedUserId || processing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  {processing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</>
                  ) : (
                    <><Coins className="w-4 h-4 mr-2" />Injetar Tokens</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Usuários com Controles Avançados */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Todos os Usuários</h2>
              
              {/* Filtros e Ordenação */}
              <div className="flex items-center gap-3">
                {/* Filtro por Tier */}
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todas as Tiers</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="ultimate">Ultimate</option>
                </select>

                {/* Ordenação */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="created">Mais Recentes</option>
                  <option value="email">Email (A-Z)</option>
                  <option value="tokens">Mais Tokens</option>
                  <option value="usage">Mais Usados</option>
                </select>

                {/* Busca */}
                <Input
                  type="text"
                  placeholder="🔍 Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/50 border-white/20 w-64"
                />
              </div>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-black/30 border border-white/5 rounded-lg p-4 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.email}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-white/60">
                          {user.full_name || 'Nome não definido'}
                        </p>
                        {user.display_name && (
                          <p className="text-xs text-purple-400">@{user.display_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-white/60">Tokens</p>
                        <p className="font-bold text-lg">{user.total_tokens || 0}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-white/60">Usados</p>
                        <p className="font-bold text-lg">{user.tokens_used || 0}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-white/60">Gerado</p>
                        <p className="font-bold text-sm">{user.total_generated_content || 0}</p>
                      </div>

                      <Badge className={cn("bg-gradient-to-r", getTierBadge(user.subscription_tier))}>
                        {user.subscription_tier}
                      </Badge>

                      {/* Actions Menu */}
                      <div className="flex gap-1">
                        {/* Editar */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingUser(user.id);
                            setEditForm({
                              full_name: user.full_name || '',
                              display_name: user.display_name || '',
                              subscription_tier: user.subscription_tier,
                              bio: user.bio || ''
                            });
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-500/20"
                          title="Editar usuário"
                          disabled={processing}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        {/* Reset Tokens */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResetTokens(user.id)}
                          className="h-8 w-8 p-0 hover:bg-yellow-500/20"
                          title="Resetar tokens usados"
                          disabled={processing}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>

                        {/* Toggle Access */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleAccess(user.id, user.has_access)}
                          className="h-8 w-8 p-0 hover:bg-green-500/20"
                          title={user.has_access ? "Remover acesso" : "Dar acesso"}
                          disabled={processing}
                        >
                          {user.has_access ? (
                            <Unlock className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </Button>

                        {/* Deletar */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20"
                          title="Excluir usuário"
                          disabled={processing}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Form de Edição Inline (Expandido) */}
                  {editingUser === user.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Nome Completo</label>
                          <Input
                            value={editForm.full_name || ''}
                            onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                            className="bg-black/50 border-white/20 h-9"
                            disabled={processing}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Display Name</label>
                          <Input
                            value={editForm.display_name || ''}
                            onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                            className="bg-black/50 border-white/20 h-9"
                            disabled={processing}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Tier</label>
                          <select
                            value={editForm.subscription_tier || 'free'}
                            onChange={(e) => setEditForm({...editForm, subscription_tier: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 rounded-lg px-3 h-9 text-sm focus:outline-none focus:border-purple-500"
                            disabled={processing}
                          >
                            <option value="free">Free</option>
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="ultimate">Ultimate</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Bio</label>
                          <Input
                            value={editForm.bio || ''}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            className="bg-black/50 border-white/20 h-9"
                            placeholder="Bio do usuário..."
                            disabled={processing}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(null);
                            setEditForm({});
                          }}
                          className="border-white/20"
                          disabled={processing}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleUpdateUser}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                          disabled={processing}
                        >
                          {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                          Salvar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-white/40">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PAINEL DE USUÁRIO NORMAL (IGUAL AO MOCK)
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <img
              src={getAvatarUrl(currentUser)}
              alt={currentUser.display_name || currentUser.full_name || 'User'}
              className="w-32 h-32 rounded-full border-4 border-purple-500"
            />

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold">
                  {currentUser.display_name || currentUser.full_name || currentUser.email}
                </h1>
                <p className="text-white/60">
                  {currentUser.bio || 'Criador de conteúdo IA'}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold">{currentUser.total_generated_content || 0}</p>
                  <p className="text-sm text-white/60">Gerações</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentUser.total_projects || 0}</p>
                  <p className="text-sm text-white/60">Projetos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentUser.total_tokens || 0}</p>
                  <p className="text-sm text-white/60">Tokens</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={cn("bg-gradient-to-r", getTierBadge(currentUser.subscription_tier))}>
                  <Award className="w-3 h-3 mr-1" />
                  {currentUser.subscription_tier}
                </Badge>
                {currentUser.total_generated_content > 100 && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Trophy className="w-3 h-3 mr-1" />
                    Top Criador
                  </Badge>
                )}
                {new Date(currentUser.created_at).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000 && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Rocket className="w-3 h-3 mr-1" />
                    Pioneiro
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tokens Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 mb-1">Tokens Disponíveis</p>
              <p className="text-4xl font-bold">{currentUser.total_tokens - currentUser.tokens_used}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 mb-1">Tokens Usados</p>
              <p className="text-2xl font-bold">{currentUser.tokens_used}</p>
            </div>
          </div>
          
          <div className="mt-4 bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all"
              style={{ 
                width: `${Math.min(100, (currentUser.tokens_used / currentUser.total_tokens) * 100)}%` 
              }}
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 w-full justify-start">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              Vídeos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
                <ImageIcon className="w-10 h-10 text-white/40" />
              </div>
              <p className="text-white/60">Nenhum conteúdo ainda</p>
              <p className="text-sm text-white/40 mt-2">
                Comece a criar para ver suas gerações aqui
              </p>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <div className="text-center py-20 text-white/60">Nenhuma imagem ainda</div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="text-center py-20 text-white/60">Nenhum vídeo ainda</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
