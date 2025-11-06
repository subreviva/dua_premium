"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface UserData {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  display_name?: string;
  total_tokens: number;
  tokens_used: number;
  subscription_tier: string;
  has_access: boolean;
  invite_code_used?: string;
  total_projects: number;
  total_generated_content: number;
  created_at: string;
  last_login?: string;
}

interface TokenPackage {
  id: number;
  name: string;
  tokens_amount: number;
  price: number;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [tokensToAdd, setTokensToAdd] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser();
      
      if (error || !user) {
        router.push('/login');
        return;
      }

      // Verificar se é admin (email específico ou role)
      const adminEmails = ['admin@dua.pt', 'subreviva@gmail.com', 'dev@dua.pt', 'dev@dua.com'];
      
      if (!adminEmails.includes(user.email || '')) {
        toast.error('Acesso Negado', {
          description: 'Você não tem permissão para acessar este painel'
        });
        router.push('/');
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      // console.error('Erro ao verificar acesso:', error);
      router.push('/');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar usuários
      const { data: usersData, error: usersError } = await supabaseClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw usersError;
      }

      // Carregar pacotes de tokens
      const { data: packagesData, error: packagesError } = await supabaseClient
        .from('token_packages')
        .select('id, name, tokens_amount, price')
        .eq('is_active', true)
        .order('sort_order');

      if (packagesError) {
        throw packagesError;
      }

      setUsers(usersData || []);
      setTokenPackages(packagesData || []);
    } catch (error) {
      // console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const injectTokens = async (userId: string, tokens: number) => {
    if (!tokens || tokens <= 0) {
      toast.error('Quantidade inválida', {
        description: 'Digite uma quantidade válida de tokens'
      });
      return;
    }

    try {
      setProcessing(true);

      // Primeiro, buscar o usuário atual para somar os tokens
      const { data: currentUser, error: fetchError } = await supabaseClient
        .from('users')
        .select('total_tokens')
        .eq('id', userId)
        .single();

      if (fetchError || !currentUser) {
        throw new Error('Usuário não encontrado');
      }

      // Atualizar tokens do usuário
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({
          total_tokens: currentUser.total_tokens + tokens,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Registrar a injeção no log
      const { error: logError } = await supabaseClient
        .from('token_usage_log')
        .insert({
          user_id: userId,
          action_type: 'admin_injection',
          tokens_used: -tokens, // Negativo porque é adição
          content_generated: `Admin injection: +${tokens} tokens`,
          metadata: {
            admin_action: true,
            injected_tokens: tokens,
            timestamp: new Date().toISOString()
          }
        });

      if (logError) {
        // console.warn('Erro ao registrar log:', logError);
      }

      // Recarregar dados
      await loadData();
      
      setSelectedUser(null);
      setTokensToAdd(0);

      toast.success('Tokens injetados com sucesso!', {
        description: `${tokens} tokens adicionados à conta do usuário`
      });
    } catch (error) {
      // console.error('Erro ao injetar tokens:', error);
      toast.error('Erro ao injetar tokens');
    } finally {
      setProcessing(false);
    }
  };

  const resetUserTokens = async (userId: string) => {
    try {
      const { error } = await supabaseClient
        .from('users')
        .update({
          tokens_used: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      await loadData();
      toast.success('Tokens de uso resetados!');
    } catch (error) {
      // console.error('Erro ao resetar tokens:', error);
      toast.error('Erro ao resetar tokens');
    }
  };

  const toggleUserAccess = async (userId: string, currentAccess: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('users')
        .update({
          has_access: !currentAccess,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      await loadData();
      toast.success(`Acesso ${!currentAccess ? 'concedido' : 'removido'}!`);
    } catch (error) {
      // console.error('Erro ao alterar acesso:', error);
      toast.error('Erro ao alterar acesso');
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-400"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            href="/" 
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🔧 Painel de Administrador
          </h1>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Total de Usuários</div>
            <div className="text-xl font-bold text-purple-400">
              {users.length}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="text-2xl font-bold text-green-400">
              {users.filter(u => u.has_access).length}
            </div>
            <div className="text-sm text-gray-400">Usuários com Acesso</div>
          </div>
          
          <div className="bg-gradient-to-r from-slate-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="text-2xl font-bold text-orange-400">
              {users.reduce((sum, u) => sum + u.total_tokens, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total de Tokens</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400">
              {users.reduce((sum, u) => sum + u.tokens_used, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Tokens Usados</div>
          </div>
          
          <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="text-2xl font-bold text-pink-400">
              {users.reduce((sum, u) => sum + u.total_generated_content, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Conteúdos Gerados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-slate-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar usuários por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all"
              />
            </div>
            
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all"
            >
              <option value="all">Todos os Planos</option>
              <option value="free">Plano Gratuito</option>
              <option value="premium">Premium</option>
              <option value="pro">Professional</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gradient-to-r from-slate-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-bold text-white">
              Usuários Registrados ({filteredUsers.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-300">Usuário</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-300">Tokens</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-300">Plano</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-purple-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-purple-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">
                          {user.display_name || user.full_name || user.name || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        <div className="text-xs text-gray-500">
                          Registrado: {new Date(user.created_at).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-green-400 font-medium">
                          {user.total_tokens.toLocaleString()} total
                        </div>
                        <div className="text-orange-400 text-sm">
                          {user.tokens_used.toLocaleString()} usados
                        </div>
                        <div className="text-purple-400 text-sm">
                          {(user.total_tokens - user.tokens_used).toLocaleString()} disponíveis
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        user.subscription_tier === 'free' 
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {user.subscription_tier === 'free' ? 'Gratuito' : user.subscription_tier}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        user.has_access 
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {user.has_access ? 'Ativo' : 'Sem Acesso'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
                        >
                          💰 Tokens
                        </button>
                        
                        <button
                          onClick={() => resetUserTokens(user.id)}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-all"
                        >
                          🔄 Reset
                        </button>
                        
                        <button
                          onClick={() => toggleUserAccess(user.id, user.has_access)}
                          className={`px-3 py-1 text-white text-sm rounded-lg transition-all ${
                            user.has_access 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {user.has_access ? '🚫 Bloquear' : '✅ Liberar'}
                        </button>
                      </div>
                      
                      {selectedUser === user.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-3 bg-black/30 rounded-lg border border-purple-500/20"
                        >
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              min="1"
                              value={tokensToAdd || ''}
                              onChange={(e) => setTokensToAdd(Number(e.target.value))}
                              placeholder="Quantidade"
                              className="flex-1 px-3 py-2 bg-slate-800/50 border border-purple-500/20 rounded text-white text-sm"
                            />
                            <button
                              onClick={() => injectTokens(user.id, tokensToAdd)}
                              disabled={processing || !tokensToAdd}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white text-sm rounded transition-all"
                            >
                              {processing ? '⏳ Processando...' : '💉 Injetar'}
                            </button>
                          </div>
                          
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {tokenPackages.map((pkg) => (
                              <button
                                key={pkg.id}
                                onClick={() => setTokensToAdd(pkg.tokens_amount)}
                                className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs rounded transition-all"
                              >
                                {pkg.tokens_amount}
                              </button>
                            ))}
                            <button
                              onClick={() => setTokensToAdd(1000)}
                              className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs rounded transition-all"
                            >
                              1000
                            </button>
                            <button
                              onClick={() => setTokensToAdd(10000)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded transition-all"
                            >
                              10K
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              Nenhum usuário encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;