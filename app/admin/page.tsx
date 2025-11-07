"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Coins, Activity, Trophy, Plus, Loader2, 
  Edit, Trash2, RefreshCw, Lock, Unlock, Search, Filter
} from "lucide-react";
import { clientCheckAdmin } from "@/lib/admin-check-db";

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
  role?: string;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const supabase = supabaseClient;
  
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
      // 1. Verificar se é admin via database
      console.log('🔍 Verificando acesso admin via database...');
      
      const adminCheck = await clientCheckAdmin(supabase);
      
      console.log('� Admin Check Result:', adminCheck);
      
      if (!adminCheck.isAdmin || adminCheck.error) {
        console.error('❌ Não é admin:', adminCheck.error);
        toast.error('Acesso negado - apenas administradores');
        router.push('/chat');
        return;
      }

      console.log('✅ Acesso admin confirmado!');
      console.log('   Email:', adminCheck.user?.email);
      console.log('   Role:', adminCheck.role);
      
      setCurrentUser(adminCheck.user);
      setIsAdmin(true);

      // 2. Carregar todos os usuários
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
    <div className="min-h-screen bg-black text-white">
      {/* Container com padding responsivo */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">🔧 Painel Admin</h1>
          <p className="text-sm sm:text-base text-white/80 truncate">{currentUser?.email}</p>
        </div>

        {/* Stats - Grid Responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-white/60 truncate">Usuários</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{allUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg shrink-0">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-white/60 truncate">Tokens</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">
                  {(allUsers.reduce((sum, u) => sum + (u.total_tokens || 0), 0) / 1000).toFixed(1)}k
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-white/60 truncate">Gerados</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">
                  {allUsers.reduce((sum, u) => sum + (u.total_generated_content || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-pink-500/20 rounded-lg shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-white/60 truncate">Premium</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">
                  {allUsers.filter(u => u.subscription_tier !== 'free').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Injeção de Tokens - Mobile Optimized */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Injetar Tokens
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Select de usuário - Full width mobile */}
            <div>
              <label className="text-xs sm:text-sm text-white/60 mb-2 block">Usuário</label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white appearance-none"
                disabled={processing}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="">Escolha um usuário...</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email.length > 30 ? user.email.substring(0, 30) + '...' : user.email} ({user.total_tokens || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade - Mobile friendly */}
            <div>
              <label className="text-xs sm:text-sm text-white/60 mb-2 block">Quantidade</label>
              <Input
                type="number"
                value={tokensToAdd}
                onChange={(e) => setTokensToAdd(Number(e.target.value))}
                className="w-full bg-black/50 border-white/20 text-white text-base sm:text-base h-11 sm:h-12"
                disabled={processing}
                min={1}
              />
              
              {/* Botões rápidos - Grid 2x2 mobile */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setTokensToAdd(100)} 
                  className="border-white/20 hover:bg-white/10 h-9 sm:h-10 text-xs sm:text-sm"
                  disabled={processing}
                >
                  +100
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setTokensToAdd(500)} 
                  className="border-white/20 hover:bg-white/10 h-9 sm:h-10 text-xs sm:text-sm"
                  disabled={processing}
                >
                  +500
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setTokensToAdd(1000)} 
                  className="border-white/20 hover:bg-white/10 h-9 sm:h-10 text-xs sm:text-sm"
                  disabled={processing}
                >
                  +1K
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setTokensToAdd(5000)} 
                  className="border-white/20 hover:bg-white/10 h-9 sm:h-10 text-xs sm:text-sm"
                  disabled={processing}
                >
                  +5K
                </Button>
              </div>

              {/* Botão de injeção - Destaque */}
              <Button
                onClick={handleInjectTokens}
                disabled={!selectedUserId || processing}
                className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg shadow-purple-500/25"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                )}
                Adicionar Tokens
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Usuários - Mobile Optimized */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          {/* Header com filtros */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold">Usuários ({filteredUsers.length})</h2>
              
              {/* Refresh button */}
              <Button
                size="sm"
                variant="outline"
                onClick={checkAdminAndLoadData}
                className="border-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                disabled={processing}
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${processing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Busca - Full width mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border-white/20 pl-10 pr-3 h-11 text-sm sm:text-base"
              />
            </div>

            {/* Filtros - Stack mobile, inline desktop */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2.5 text-sm appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="all">📊 Todas as Tiers</option>
                <option value="free">🆓 Free</option>
                <option value="basic">🔵 Basic</option>
                <option value="premium">💜 Premium</option>
                <option value="ultimate">⭐ Ultimate</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2.5 text-sm appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="created">🕐 Mais Recentes</option>
                <option value="email">📧 Email (A-Z)</option>
                <option value="tokens">💰 Mais Tokens</option>
                <option value="usage">📈 Mais Usados</option>
              </select>
            </div>
          </div>

          {/* Lista de usuários - Scrollable */}
          <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-1 -mr-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-black/30 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/5 transition-all"
              >
                {/* Mobile: Stack vertical | Desktop: Horizontal */}
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  {/* Info do usuário */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{user.email}</p>
                    <p className="text-xs sm:text-sm text-white/60 truncate">{user.full_name || 'Nome não definido'}</p>
                    {user.display_name && (
                      <p className="text-xs text-purple-400 truncate">@{user.display_name}</p>
                    )}
                  </div>

                  {/* Stats + Badge - Mobile: Grid | Desktop: Flex */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-center sm:text-right">
                      <p className="text-xs text-white/60">Tokens</p>
                      <p className="font-bold text-sm sm:text-base">{user.total_tokens || 0}</p>
                    </div>

                    <div className="text-center sm:text-right">
                      <p className="text-xs text-white/60">Usados</p>
                      <p className="font-bold text-sm sm:text-base">{user.tokens_used || 0}</p>
                    </div>

                    <Badge className={`${getTierBadge(user.subscription_tier)} text-xs px-2 py-0.5`}>
                      {user.subscription_tier}
                    </Badge>
                  </div>
                </div>

                {/* Actions - Mobile: Full width grid | Desktop: Inline */}
                <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-0 sm:pt-3 sm:border-t sm:border-white/5">
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
                    className="flex-1 sm:flex-none h-9 sm:h-8 sm:w-8 sm:p-0 text-xs sm:text-sm hover:bg-blue-500/20"
                    disabled={processing}
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-0 mr-1.5" />
                    <span className="sm:hidden">Editar</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResetTokens(user.id)}
                    className="flex-1 sm:flex-none h-9 sm:h-8 sm:w-8 sm:p-0 text-xs sm:text-sm hover:bg-yellow-500/20"
                    disabled={processing}
                  >
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-0 mr-1.5" />
                    <span className="sm:hidden">Reset</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleAccess(user.id, user.has_access)}
                    className="flex-1 sm:flex-none h-9 sm:h-8 sm:w-8 sm:p-0 text-xs sm:text-sm hover:bg-green-500/20"
                    disabled={processing}
                  >
                    {user.has_access ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 sm:mr-0 mr-1.5" />
                        <span className="sm:hidden">Ativo</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 sm:mr-0 mr-1.5" />
                        <span className="sm:hidden">Bloq</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    className="flex-1 sm:flex-none h-9 sm:h-8 sm:w-8 sm:p-0 text-xs sm:text-sm hover:bg-red-500/20"
                    disabled={processing}
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 sm:mr-0 mr-1.5" />
                    <span className="sm:hidden">Excluir</span>
                  </Button>
                </div>

                {/* Form de Edição - Responsivo */}
                {editingUser === user.id && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Nome completo"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        className="bg-black/50 border-white/20 h-11 text-sm"
                        disabled={processing}
                      />
                      <Input
                        placeholder="Display name"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                        className="bg-black/50 border-white/20 h-11 text-sm"
                        disabled={processing}
                      />
                      <select
                        value={editForm.subscription_tier}
                        onChange={(e) => setEditForm({...editForm, subscription_tier: e.target.value})}
                        className="bg-black/50 border border-white/20 rounded-lg px-3 py-2.5 text-sm h-11"
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
                        className="bg-black/50 border-white/20 h-11 text-sm"
                        disabled={processing}
                      />
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingUser(null); setEditForm({}); }}
                        className="flex-1 sm:flex-none border-white/20 h-10"
                        disabled={processing}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateUser}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 h-10"
                        disabled={processing}
                      >
                        {processing && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                        Salvar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 sm:py-16 text-white/40">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-base">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>

        {/* Safe area bottom - iOS */}
        <div className="h-6 sm:h-0" />
      </div>
    </div>
  );
}
