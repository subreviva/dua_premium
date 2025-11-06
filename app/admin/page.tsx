"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Coins, Activity, Trophy, Plus, Loader2, 
  Edit, Trash2, RefreshCw, Lock, Unlock, Search, Filter
} from "lucide-react";

// ⚠️ WHITELIST DE ADMINS
const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com'
];

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  subscription_tier: string;
  total_tokens?: number;
  tokens_used?: number;
  total_generated_content?: number;
  has_access: boolean;
  created_at: string;
  avatar_url?: string;
  bio?: string;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [processing, setProcessing] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState<'created' | 'email' | 'tokens' | 'usage'>('created');
  
  // Injeção de tokens
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tokensToAdd, setTokensToAdd] = useState(100);
  
  // Edição
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allUsers, searchTerm, filterTier, sortBy]);

  const checkAdminAndLoadData = async () => {
    try {
      // 1. Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      console.log('🔍 Auth User:', user?.email);
      
      if (authError || !user) {
        console.error('❌ Não autenticado');
        toast.error('Você precisa fazer login');
        router.push('/login');
        return;
      }

      setCurrentUser(user);

      // 2. Verificar se é admin
      const adminStatus = ADMIN_EMAILS.includes(user.email || '');
      console.log('🔐 Is Admin?', adminStatus, 'Email:', user.email);
      console.log('📋 Admin Emails:', ADMIN_EMAILS);
      
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        console.error('❌ Não é admin');
        toast.error('Acesso negado - apenas administradores');
        router.push('/chat');
        return;
      }

      // 3. Carregar todos os usuários
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Users loaded:', usersData?.length);

      if (usersError) {
        console.error('❌ Erro ao carregar usuários:', usersError);
        toast.error('Erro ao carregar usuários');
      } else if (usersData) {
        setAllUsers(usersData);
      }

    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast.error('Erro ao carregar painel admin');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allUsers];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de tier
    if (filterTier !== 'all') {
      filtered = filtered.filter(user => user.subscription_tier === filterTier);
    }

    // Ordenação
    filtered.sort((a, b) => {
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

    setFilteredUsers(filtered);
  };

  const handleInjectTokens = async () => {
    if (!selectedUserId || tokensToAdd <= 0) {
      toast.error('Selecione um usuário e quantidade válida');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('inject_tokens', {
        user_id: selectedUserId,
        tokens_amount: tokensToAdd
      });

      if (error) throw error;

      toast.success(`${tokensToAdd} tokens adicionados!`);
      await checkAdminAndLoadData();
      setSelectedUserId(null);
      setTokensToAdd(100);
    } catch (error: any) {
      toast.error('Erro ao injetar tokens: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          display_name: editForm.display_name,
          subscription_tier: editForm.subscription_tier,
          bio: editForm.bio
        })
        .eq('id', editingUser);

      if (error) throw error;

      toast.success('Usuário atualizado!');
      await checkAdminAndLoadData();
      setEditingUser(null);
      setEditForm({});
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ has_access: !currentAccess })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Acesso ${!currentAccess ? 'ativado' : 'desativado'}!`);
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`⚠️ CONFIRMA EXCLUSÃO de ${userEmail}?`)) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuário excluído!');
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleResetTokens = async (userId: string) => {
    if (!confirm('Resetar tokens_used para 0?')) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ tokens_used: 0 })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Tokens resetados!');
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      free: "bg-gray-500",
      basic: "bg-blue-500",
      premium: "bg-purple-500",
      ultimate: "bg-yellow-500"
    };
    return colors[tier as keyof typeof colors] || colors.free;
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Não é admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-white/60 mb-4">Apenas administradores podem acessar</p>
          <Button onClick={() => router.push('/chat')}>
            Voltar ao Chat
          </Button>
        </div>
      </div>
    );
  }

  // PAINEL ADMIN
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6">
          <h1 className="text-3xl font-bold mb-2">🔧 Painel Administrativo</h1>
          <p className="text-white/80">Logado como: {currentUser?.email}</p>
        </div>

        {/* Stats */}
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
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white"
                disabled={processing}
              >
                <option value="">Escolha um usuário...</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.total_tokens || 0} tokens)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Quantidade</label>
              <Input
                type="number"
                value={tokensToAdd}
                onChange={(e) => setTokensToAdd(Number(e.target.value))}
                className="bg-black/50 border-white/20 text-white"
                disabled={processing}
                min={1}
              />
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => setTokensToAdd(100)} className="border-white/20">
                  +100
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTokensToAdd(500)} className="border-white/20">
                  +500
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTokensToAdd(1000)} className="border-white/20">
                  +1000
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTokensToAdd(5000)} className="border-white/20">
                  +5000
                </Button>
              </div>

              <Button
                onClick={handleInjectTokens}
                disabled={!selectedUserId || processing}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
                Injetar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Gerenciar Usuários ({filteredUsers.length})</h2>
            
            <div className="flex items-center gap-3">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/50 border-white/20 pl-10 w-64"
                />
              </div>

              {/* Filtro Tier */}
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm"
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
                className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                <option value="created">Mais Recentes</option>
                <option value="email">Email (A-Z)</option>
                <option value="tokens">Mais Tokens</option>
                <option value="usage">Mais Usados</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-black/30 border border-white/5 rounded-lg p-4 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-white/60">{user.full_name || 'Nome não definido'}</p>
                    {user.display_name && (
                      <p className="text-xs text-purple-400">@{user.display_name}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-white/60">Tokens</p>
                      <p className="font-bold">{user.total_tokens || 0}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-white/60">Usados</p>
                      <p className="font-bold">{user.tokens_used || 0}</p>
                    </div>

                    <Badge className={getTierBadge(user.subscription_tier)}>
                      {user.subscription_tier}
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-1">
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
                        className="h-8 w-8 p-0"
                        title="Editar"
                        disabled={processing}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResetTokens(user.id)}
                        className="h-8 w-8 p-0"
                        title="Reset tokens"
                        disabled={processing}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleAccess(user.id, user.has_access)}
                        className="h-8 w-8 p-0"
                        title={user.has_access ? "Remover acesso" : "Dar acesso"}
                        disabled={processing}
                      >
                        {user.has_access ? (
                          <Unlock className="w-4 h-4 text-green-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-red-400" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="h-8 w-8 p-0"
                        title="Excluir"
                        disabled={processing}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Form de Edição */}
                {editingUser === user.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Nome completo"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        className="bg-black/50 border-white/20"
                        disabled={processing}
                      />
                      <Input
                        placeholder="Display name"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                        className="bg-black/50 border-white/20"
                        disabled={processing}
                      />
                      <select
                        value={editForm.subscription_tier}
                        onChange={(e) => setEditForm({...editForm, subscription_tier: e.target.value})}
                        className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm"
                        disabled={processing}
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="ultimate">Ultimate</option>
                      </select>
                      <Input
                        placeholder="Bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="bg-black/50 border-white/20"
                        disabled={processing}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingUser(null); setEditForm({}); }}
                        className="border-white/20"
                        disabled={processing}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateUser}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled={processing}
                      >
                        {processing && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        Salvar
                      </Button>
                    </div>
                  </div>
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
