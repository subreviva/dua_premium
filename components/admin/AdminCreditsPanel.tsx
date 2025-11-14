'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ServiceCostsConfig from '@/components/admin/ServiceCostsConfig';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Plus,
  Minus,
  RefreshCw,
  Download,
  History,
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Settings,
} from 'lucide-react';

interface GlobalStats {
  totalCredits: number;
  totalDuacoin: number;
  usersWithCredits: number;
  totalUsers: number;
  last30Days: {
    creditsSpent: number;
    creditsAdded: number;
    netChange: number;
    transactionCount: number;
  };
  topOperations: Array<{ operation: string; count: number }>;
}

interface UserBalance {
  user_id: string;
  servicos_creditos: number;
  duacoin_balance: number;
  user?: {
    email: string;
    full_name?: string;
    display_name?: string;
  };
}

interface Transaction {
  id: string;
  user_id: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  metadata?: any;
  created_at: string;
  status: string;
}

export default function AdminCreditsPanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'zero' | 'negative'>('all');
  const [sortBy, setSortBy] = useState<'credits' | 'email' | 'updated'>('credits');
  
  // Ações
  const [actionAmount, setActionAmount] = useState(100);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Bulk
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'distribute' | 'costs'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada');
        return;
      }

      const token = session.access_token;

      // Carregar estatísticas globais
      const statsRes = await fetch('/api/admin/credits?action=global-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const contentType = statsRes.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await statsRes.json();
          setStats(data.stats);
        }
      }

      // Carregar saldos de todos usuários
      const balancesRes = await fetch('/api/admin/credits?action=all-users-balances', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (balancesRes.ok) {
        const contentType = balancesRes.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await balancesRes.json();
          setBalances(data.balances);
        }
      }

      // Carregar atividade recente
      const activityRes = await fetch('/api/admin/credits?action=recent-activity', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (activityRes.ok) {
        const contentType = activityRes.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await activityRes.json();
          setRecentActivity(data.transactions);
        }
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/admin/credits?action=user-credits&userId=${userId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await res.json();
          setSelectedUserData(data);
          setSelectedUserId(userId);
        }
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar usuário: ${error.message}`);
    }
  };

  const executeAction = async (action: 'add-credits' | 'deduct-credits' | 'set-credits', userId: string) => {
    if (actionAmount <= 0 && action !== 'set-credits') {
      toast.error('Quantidade deve ser positiva');
      return;
    }

    setProcessing(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada');
        return;
      }

      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action,
          userId,
          amount: actionAmount,
          reason: actionReason || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        await loadData();
        if (selectedUserId === userId) {
          await loadUserDetails(userId);
        }
        setActionAmount(100);
        setActionReason('');
      } else {
        toast.error(data.error || 'Erro na operação');
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const executeBulkAction = async () => {
    if (selectedUserIds.size === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    if (actionAmount <= 0) {
      toast.error('Quantidade deve ser positiva');
      return;
    }

    setProcessing(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada');
        return;
      }

      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'bulk-add-credits',
          userIds: Array.from(selectedUserIds),
          amount: actionAmount,
          reason: actionReason || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        await loadData();
        setSelectedUserIds(new Set());
        setShowBulkPanel(false);
        setActionAmount(100);
        setActionReason('');
      } else {
        toast.error(data.error || 'Erro na operação');
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredBalances = balances.filter(balance => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesEmail = balance.user?.email?.toLowerCase().includes(search);
      const matchesName = balance.user?.full_name?.toLowerCase().includes(search);
      const matchesDisplay = balance.user?.display_name?.toLowerCase().includes(search);
      if (!matchesEmail && !matchesName && !matchesDisplay) return false;
    }

    // Type filter
    if (filterType === 'positive' && balance.servicos_creditos <= 0) return false;
    if (filterType === 'zero' && balance.servicos_creditos !== 0) return false;
    if (filterType === 'negative' && balance.servicos_creditos >= 0) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'credits') {
      return b.servicos_creditos - a.servicos_creditos;
    } else if (sortBy === 'email') {
      return (a.user?.email || '').localeCompare(b.user?.email || '');
    }
    return 0;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOperationName = (op: string) => {
    const names: Record<string, string> = {
      music_generate_v5: 'Música (Suno V5)',
      image_fast: 'Imagem Rápida',
      image_standard: 'Imagem Standard',
      image_ultra: 'Imagem Ultra',
      video_gen4_5s: 'Vídeo 5s',
      video_gen4_10s: 'Vídeo 10s',
      design_generate_image: 'Design: Imagem',
      design_generate_logo: 'Design: Logo',
      design_edit_image: 'Design: Edição',
      chat_advanced: 'Chat Avançado',
      live_audio_1min: 'Áudio 1min',
    };
    return names[op] || op;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-white/60">Carregando dados de créditos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Coins className="w-7 h-7 text-yellow-400" />
            Gestão de Créditos
          </h2>
          <p className="text-white/60 mt-1">Controle total de distribuição e uso de créditos</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'activity', label: 'Atividade', icon: Activity },
          { id: 'distribute', label: 'Distribuir', icon: Zap },
          { id: 'costs', label: 'Custos de Serviços', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/60 hover:text-white/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Coins className="w-8 h-8 text-yellow-400" />
                <Badge variant="outline" className="text-xs">Total</Badge>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalCredits.toLocaleString()}</div>
              <div className="text-sm text-white/60 mt-1">Créditos no Sistema</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-green-400" />
                <Badge variant="outline" className="text-xs">Ativos</Badge>
              </div>
              <div className="text-3xl font-bold text-white">{stats.usersWithCredits}</div>
              <div className="text-sm text-white/60 mt-1">Usuários com Créditos</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-8 h-8 text-red-400" />
                <Badge variant="outline" className="text-xs">30 dias</Badge>
              </div>
              <div className="text-3xl font-bold text-white">{stats.last30Days.creditsSpent.toLocaleString()}</div>
              <div className="text-sm text-white/60 mt-1">Créditos Gastos</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <Badge variant="outline" className="text-xs">30 dias</Badge>
              </div>
              <div className="text-3xl font-bold text-white">{stats.last30Days.creditsAdded.toLocaleString()}</div>
              <div className="text-sm text-white/60 mt-1">Créditos Adicionados</div>
            </div>
          </div>

          {/* Net Change */}
          <div className="bg-black/40 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Balanço (30 dias)</h3>
                <p className="text-sm text-white/60">
                  {stats.last30Days.transactionCount} transações
                </p>
              </div>
              <div className={`text-3xl font-bold ${
                stats.last30Days.netChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.last30Days.netChange >= 0 ? '+' : ''}
                {stats.last30Days.netChange.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Top Operations */}
          <div className="bg-black/40 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Top 10 Operações (30 dias)
            </h3>
            <div className="space-y-2">
              {stats.topOperations.map((op, idx) => (
                <div key={op.operation} className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 font-mono text-sm w-6">#{idx + 1}</span>
                    <span className="text-white">{getOperationName(op.operation)}</span>
                  </div>
                  <Badge variant="outline">{op.count} usos</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
            >
              <option value="all">Todos</option>
              <option value="positive">Com Créditos</option>
              <option value="zero">Sem Créditos</option>
              <option value="negative">Negativos</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
            >
              <option value="credits">Ordenar por Créditos</option>
              <option value="email">Ordenar por Email</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUserIds.size > 0 && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
              <span className="text-white">
                {selectedUserIds.size} usuário(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowBulkPanel(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Distribuir Créditos
                </Button>
                <Button
                  onClick={() => setSelectedUserIds(new Set())}
                  variant="outline"
                  size="sm"
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.size === filteredBalances.length && filteredBalances.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds(new Set(filteredBalances.map(b => b.user_id)));
                          } else {
                            setSelectedUserIds(new Set());
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Usuário</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Créditos</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">DuaCoin</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/60 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBalances.map((balance) => (
                    <tr 
                      key={balance.user_id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(balance.user_id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedUserIds);
                            if (e.target.checked) {
                              newSet.add(balance.user_id);
                            } else {
                              newSet.delete(balance.user_id);
                            }
                            setSelectedUserIds(newSet);
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">{balance.user?.email || 'N/A'}</div>
                          {balance.user?.full_name && (
                            <div className="text-sm text-white/60">{balance.user.full_name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant="outline"
                          className={
                            balance.servicos_creditos > 0 ? 'text-green-400 border-green-400/30' :
                            balance.servicos_creditos < 0 ? 'text-red-400 border-red-400/30' :
                            'text-white/60'
                          }
                        >
                          {balance.servicos_creditos.toLocaleString()} créditos
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/80">
                          {balance.duacoin_balance.toFixed(2)} DUA
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => loadUserDetails(balance.user_id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <History className="w-4 h-4" />
                          Gerenciar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-sm text-white/60 text-center">
            Mostrando {filteredBalances.length} de {balances.length} usuários
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase">Descrição</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/60 uppercase">Créditos</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-white/60 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentActivity.slice(0, 50).map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white/80">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-white/40" />
                          {formatDate(tx.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant="outline"
                          className={tx.type === 'credit' ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'}
                        >
                          {tx.type === 'credit' ? (
                            <><Plus className="w-3 h-3 inline mr-1" />Crédito</>
                          ) : (
                            <><Minus className="w-3 h-3 inline mr-1" />Débito</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {tx.description}
                        {tx.metadata?.operation && (
                          <div className="text-xs text-white/60 mt-1">
                            {getOperationName(tx.metadata.operation)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${
                          tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {tx.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400 inline" />}
                        {tx.status === 'failed' && <XCircle className="w-4 h-4 text-red-400 inline" />}
                        {tx.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-400 inline" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Distribute Tab */}
      {activeTab === 'distribute' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-400" />
              Adicionar Créditos
            </h3>
            <p className="text-sm text-white/60 mb-4">
              Distribua créditos para um ou múltiplos usuários
            </p>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Quantidade de créditos"
                value={actionAmount}
                onChange={(e) => setActionAmount(Number(e.target.value))}
                min={1}
              />
              <Input
                placeholder="Motivo (opcional)"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
              <p className="text-xs text-white/60">
                Dica: Selecione usuários na aba "Usuários" e use distribuição em massa
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setActionAmount(100);
                  setActionReason('Bônus de boas-vindas');
                }}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Plus className="w-4 h-4" />
                Bônus: 100 créditos
              </Button>
              <Button
                onClick={() => {
                  setActionAmount(500);
                  setActionReason('Promoção especial');
                }}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Zap className="w-4 h-4" />
                Promoção: 500 créditos
              </Button>
              <Button
                onClick={() => {
                  setActionAmount(1000);
                  setActionReason('Recompensa VIP');
                }}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Coins className="w-4 h-4" />
                VIP: 1000 créditos
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUserId && selectedUserData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Gerenciar Créditos</h3>
              <Button
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedUserData(null);
                }}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Balance */}
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Saldo Atual</div>
                <div className="text-3xl font-bold text-white">
                  {selectedUserData.balance.servicos_creditos} créditos
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => executeAction('add-credits', selectedUserId)}
                    disabled={processing}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                  <Button
                    onClick={() => executeAction('deduct-credits', selectedUserId)}
                    disabled={processing}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    Deduzir
                  </Button>
                </div>
                <Input
                  placeholder="Motivo (opcional)"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="font-semibold text-white mb-3">Histórico de Transações</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedUserData.transactions.map((tx: Transaction) => (
                    <div key={tx.id} className="bg-black/40 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-white">{tx.description}</div>
                        <div className="text-xs text-white/60 mt-1">{formatDate(tx.created_at)}</div>
                      </div>
                      <span className={`font-medium ${
                        tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Distribution Modal */}
      {showBulkPanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-white/10 max-w-md w-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Distribuição em Massa</h3>
              <Button
                onClick={() => setShowBulkPanel(false)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-white/80 mb-2">
                  Distribuir créditos para <span className="font-bold text-green-400">{selectedUserIds.size}</span> usuário(s)
                </p>
              </div>

              <Input
                type="number"
                placeholder="Créditos por usuário"
                value={actionAmount}
                onChange={(e) => setActionAmount(Number(e.target.value))}
                min={1}
              />

              <Input
                placeholder="Motivo (opcional)"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-sm text-white/80">
                Total a distribuir: <span className="font-bold text-blue-400">
                  {(actionAmount * selectedUserIds.size).toLocaleString()} créditos
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={executeBulkAction}
                  disabled={processing}
                  className="flex-1 gap-2"
                >
                  {processing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Distribuir
                </Button>
                <Button
                  onClick={() => setShowBulkPanel(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === 'costs' && (
        <ServiceCostsConfig />
      )}
    </div>
  );
}
