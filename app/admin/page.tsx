"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient, getAdminClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Coins, Activity, Shield, Plus, Loader2, Edit, Trash2, RefreshCw, 
  Lock, Unlock, Search, TrendingUp, Database, Clock, Download, FileText,
  History, Eye, ChevronDown, ChevronUp, Calendar, Filter, CheckSquare,
  Square, BarChart3, Zap, AlertCircle, CheckCircle, XCircle, Info,
  Home, MessageSquare, ArrowLeft, Wallet, Ticket
} from "lucide-react";
import { clientCheckAdmin } from "@/lib/admin-check-db";
import AdminCreditsPanel from "@/components/admin/AdminCreditsPanel";
import AdminInviteCodesPanel from "@/components/admin/AdminInviteCodesPanel";

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

interface AuditLog {
  id: string;
  action: string;
  user_id?: string;
  details?: any;
  created_at: string;
  admin_email?: string;
}

interface UserStats {
  conversations_count: number;
  messages_count: number;
  projects_count: number;
  transactions_count: number;
  total_balance?: number;
  last_activity?: string;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const supabase = supabaseClient;
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [processing, setProcessing] = useState(false);
  
  // Filtros básicos
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState<'created' | 'email' | 'tokens' | 'usage'>('created');
  
  // Filtros avançados
  const [filterAccess, setFilterAccess] = useState<'all' | 'active' | 'blocked'>('all');
  const [filterTokenRange, setFilterTokenRange] = useState<'all' | '0-100' | '100-500' | '500+'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Bulk operations
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'tokens' | 'tier' | 'access' | null>(null);
  const [bulkTokens, setBulkTokens] = useState(100);
  const [bulkTier, setBulkTier] = useState<string>('premium');
  
  // Modais e painéis
  const [selectedUserDetail, setSelectedUserDetail] = useState<string | null>(null);
  const [userDetailData, setUserDetailData] = useState<UserStats | null>(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState<string | null>(null);
  
  // Analytics
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Real-time
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newUsersCount, setNewUsersCount] = useState(0);
  
  // Injeção/Edição
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tokensToAdd, setTokensToAdd] = useState(100);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // Gestão de Créditos
  const [showCreditsPanel, setShowCreditsPanel] = useState(false);
  
  // Gestão de Códigos de Acesso
  const [showCodesPanel, setShowCodesPanel] = useState(false);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allUsers, searchTerm, filterTier, filterAccess, filterTokenRange, dateRange, sortBy]);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkAdminAndLoadData(true);
      }, 30000); // 30 segundos
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // / for search focus
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById('admin-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkAdminAndLoadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const adminCheck = await clientCheckAdmin(supabase);
      
      if (!adminCheck.isAdmin || adminCheck.error) {
        toast.error('Access denied - administrators only');
        router.push('/chat');
        return;
      }
      
      setCurrentUser(adminCheck.user);
      setIsAdmin(true);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        toast.error('Error loading users');
      } else if (usersData) {
        setAllUsers(usersData);
        setLastUpdate(new Date());
        
        // Check for new users (created in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const newUsers = usersData.filter(u => new Date(u.created_at) > fiveMinutesAgo);
        setNewUsersCount(newUsers.length);
      }
    } catch (error) {
      toast.error('Error loading admin panel');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allUsers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tier filter
    if (filterTier !== 'all') {
      filtered = filtered.filter(user => user.subscription_tier === filterTier);
    }

    // Access filter
    if (filterAccess !== 'all') {
      filtered = filtered.filter(user => 
        filterAccess === 'active' ? user.has_access : !user.has_access
      );
    }

    // Token range filter
    if (filterTokenRange !== 'all') {
      filtered = filtered.filter(user => {
        const tokens = user.total_tokens || 0;
        switch (filterTokenRange) {
          case '0-100': return tokens >= 0 && tokens <= 100;
          case '100-500': return tokens > 100 && tokens <= 500;
          case '500+': return tokens > 500;
          default: return true;
        }
      });
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(user => {
        const createdDate = new Date(user.created_at);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;
        
        if (start && createdDate < start) return false;
        if (end && createdDate > end) return false;
        return true;
      });
    }

    // Sort
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
      toast.error('Select a user and valid amount');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('inject_tokens', {
        user_id: selectedUserId,
        tokens_amount: tokensToAdd
      });

      if (error) throw error;

      toast.success(`${tokensToAdd} tokens added successfully`);
      await checkAdminAndLoadData();
      setSelectedUserId(null);
      setTokensToAdd(100);
    } catch (error: any) {
      toast.error('Error adding tokens: ' + error.message);
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

      toast.success('User updated successfully');
      await checkAdminAndLoadData();
      setEditingUser(null);
      setEditForm({});
    } catch (error: any) {
      toast.error('Error updating: ' + error.message);
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

      toast.success(`Access ${!currentAccess ? 'granted' : 'revoked'}`);
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`CONFIRM DELETION of ${userEmail}?`)) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted');
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleResetTokens = async (userId: string) => {
    if (!confirm('Reset tokens_used to 0?')) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ tokens_used: 0 })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Tokens reset');
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ======== AUDIT LOGS ========
  const loadAuditLogs = useCallback(async () => {
    try {
      const adminClient = getAdminClient();
      let query = adminClient
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditFilter && auditFilter !== 'all') {
        query = query.eq('action', auditFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error: any) {
      toast.error('Error loading audit logs: ' + error.message);
    }
  }, [auditFilter]);

  // ======== USER DETAILS ========
  const loadUserDetails = useCallback(async (userId: string) => {
    try {
      const adminClient = getAdminClient();
      
      const [conversations, messages, projects, transactions, profile] = await Promise.all([
        adminClient.from('duaia_conversations').select('id').eq('user_id', userId),
        adminClient.from('duaia_messages').select('id').eq('user_id', userId),
        adminClient.from('duaia_projects').select('id').eq('user_id', userId),
        adminClient.from('duacoin_transactions').select('amount').eq('user_id', userId),
        adminClient.from('duacoin_profiles').select('*').eq('user_id', userId).single()
      ]);

      const totalBalance = transactions.data?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
      
      // Last activity from messages
      const lastMsg = await adminClient
        .from('duaia_messages')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setUserDetailData({
        conversations_count: conversations.data?.length || 0,
        messages_count: messages.data?.length || 0,
        projects_count: projects.data?.length || 0,
        transactions_count: transactions.data?.length || 0,
        total_balance: totalBalance,
        last_activity: lastMsg.data?.created_at || null
      });
    } catch (error: any) {
      toast.error('Error loading user details: ' + error.message);
    }
  }, []);

  // ======== ANALYTICS ========
  const loadAnalytics = useCallback(async () => {
    try {
      const adminClient = getAdminClient();
      
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [users7d, users30d, messagesData, premiumUsers] = await Promise.all([
        adminClient.from('users').select('id').gte('created_at', last7Days.toISOString()),
        adminClient.from('users').select('id').gte('created_at', last30Days.toISOString()),
        adminClient.from('duaia_messages').select('created_at, user_id'),
        adminClient.from('users').select('id').in('subscription_tier', ['premium', 'ultimate'])
      ]);

      const totalUsers = allUsers.length;
      const conversionRate = totalUsers > 0 ? ((premiumUsers.data?.length || 0) / totalUsers) * 100 : 0;

      setAnalyticsData({
        growth7d: users7d.data?.length || 0,
        growth30d: users30d.data?.length || 0,
        messagesPerDay: messagesData.data?.length ? Math.floor(messagesData.data.length / 30) : 0,
        conversionRate: conversionRate.toFixed(1)
      });
    } catch (error: any) {
      toast.error('Error loading analytics: ' + error.message);
    }
  }, [allUsers]);

  // Load audit logs when modal opens
  useEffect(() => {
    if (showAuditLogs) {
      loadAuditLogs();
    }
  }, [showAuditLogs, auditFilter, loadAuditLogs]);

  // Load analytics when modal opens
  useEffect(() => {
    if (showAnalytics) {
      loadAnalytics();
    }
  }, [showAnalytics, loadAnalytics]);

  // ======== BULK OPERATIONS ========
  const handleBulkInjectTokens = async () => {
    if (selectedUserIds.size === 0 || !bulkTokens) {
      toast.error('Select users and specify token amount');
      return;
    }

    setProcessing(true);
    try {
      const promises = Array.from(selectedUserIds).map(userId =>
        supabase.rpc('inject_tokens', { user_id: userId, tokens_amount: bulkTokens })
      );
      await Promise.all(promises);
      
      toast.success(`${bulkTokens} tokens added to ${selectedUserIds.size} users`);
      setSelectedUserIds(new Set());
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Bulk inject error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkChangeTier = async () => {
    if (selectedUserIds.size === 0 || !bulkTier) {
      toast.error('Select users and tier');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: bulkTier })
        .in('id', Array.from(selectedUserIds));

      if (error) throw error;

      toast.success(`${selectedUserIds.size} users changed to ${bulkTier}`);
      setSelectedUserIds(new Set());
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Bulk tier change error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkToggleAccess = async () => {
    if (selectedUserIds.size === 0) {
      toast.error('Select users');
      return;
    }

    setProcessing(true);
    try {
      // Get current access status of selected users
      const selectedUsers = allUsers.filter(u => selectedUserIds.has(u.id));
      
      // Determine action based on majority (if most have access, revoke; otherwise grant)
      const usersWithAccess = selectedUsers.filter(u => u.has_access).length;
      const newAccessState = usersWithAccess < selectedUsers.length / 2;
      
      const { error } = await supabase
        .from('users')
        .update({ has_access: newAccessState })
        .in('id', Array.from(selectedUserIds));

      if (error) throw error;

      toast.success(`Access ${newAccessState ? 'granted' : 'revoked'} for ${selectedUserIds.size} users`);
      setSelectedUserIds(new Set());
      await checkAdminAndLoadData();
    } catch (error: any) {
      toast.error('Bulk access toggle error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Full Name', 'Tier', 'Tokens', 'Tokens Used', 'Access', 'Created'];
    const rows = filteredUsers.map(u => [
      u.email,
      u.full_name || '',
      u.subscription_tier,
      u.total_tokens || 0,
      u.tokens_used || 0,
      u.has_access ? 'Yes' : 'No',
      new Date(u.created_at).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dua-users-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      free: "bg-gray-500/80",
      basic: "bg-blue-500/80",
      premium: "bg-purple-500/80",
      ultimate: "bg-yellow-500/80"
    };
    return colors[tier as keyof typeof colors] || colors.free;
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Não é admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/60 mb-4">Administrators only</p>
          <Button onClick={() => router.push('/chat')}>
            Back to Chat
          </Button>
        </div>
      </div>
    );
  }

  // PAINEL ADMIN
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Back Navigation - Mobile Friendly */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {currentUser?.email} · {currentUser?.role?.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="border-white/10 hover:bg-white/5"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/chat')}
              className="border-white/10 hover:bg-white/5"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkAdminAndLoadData()}
              className="border-white/10 hover:bg-white/5"
              disabled={processing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Users</p>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold">{allUsers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Tokens</p>
                <Coins className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold">
                {(allUsers.reduce((sum, u) => sum + (u.total_tokens || 0), 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">Distributed tokens</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Content Generated</p>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold">
                {allUsers.reduce((sum, u) => sum + (u.total_generated_content || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total items</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-6 hover:border-pink-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Premium</p>
                <Shield className="w-5 h-5 text-pink-400" />
              </div>
              <p className="text-3xl font-bold">
                {allUsers.filter(u => u.subscription_tier !== 'free').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {allUsers.length > 0 ? ((allUsers.filter(u => u.subscription_tier !== 'free').length / allUsers.length) * 100).toFixed(1) : 0}% conversion
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuditLogs(true)}
              className="border-white/10 hover:bg-white/5"
            >
              <History className="w-4 h-4 mr-2" />
              Audit Logs
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(true)}
              className="border-white/10 hover:bg-white/5"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="border-white/10 hover:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-white/10 hover:bg-white/5"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreditsPanel(!showCreditsPanel)}
              className="border-white/10 hover:bg-white/5"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Credits Management
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodesPanel(!showCodesPanel)}
              className="border-white/10 hover:bg-white/5"
            >
              <Ticket className="w-4 h-4 mr-2" />
              Invite Codes
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-black/50"
                />
                Auto-refresh (30s)
              </label>
              {lastUpdate && (
                <span className="text-xs text-gray-500">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                  Access Status
                </label>
                <select
                  value={filterAccess}
                  onChange={(e) => setFilterAccess(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                  Token Range
                </label>
                <select
                  value={filterTokenRange}
                  onChange={(e) => setFilterTokenRange(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Ranges</option>
                  <option value="0-100">0-100 tokens</option>
                  <option value="100-500">100-500 tokens</option>
                  <option value="500+">500+ tokens</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Credits Management Panel */}
        {showCreditsPanel && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <AdminCreditsPanel />
          </div>
        )}

        {/* Token Injection */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Coins className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Token Management</h2>
              <p className="text-xs text-gray-400">Add tokens to user accounts</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                Select User
              </label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                disabled={processing}
              >
                <option value="">Choose user...</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.total_tokens || 0} tokens)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                Amount
              </label>
              <div className="space-y-3">
                <Input
                  type="number"
                  value={tokensToAdd}
                  onChange={(e) => setTokensToAdd(Number(e.target.value))}
                  className="w-full bg-black/50 border-white/10 text-white focus:border-purple-500/50 h-11"
                  disabled={processing}
                  min={1}
                  placeholder="Enter amount"
                />
                
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map(amount => (
                    <Button 
                      key={amount}
                      size="sm" 
                      variant="outline" 
                      onClick={() => setTokensToAdd(amount)} 
                      className="border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 text-xs"
                      disabled={processing}
                    >
                      {amount >= 1000 ? `${amount/1000}K` : amount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleInjectTokens}
            disabled={!selectedUserId || processing}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 font-medium"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Tokens
              </>
            )}
          </Button>
        </div>

        {/* Users List */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Users Management</h2>
              <p className="text-xs text-gray-400 mt-1">{filteredUsers.length} of {allUsers.length} users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="admin-search"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border-white/10 pl-10 h-11 focus:border-purple-500/50"
              />
            </div>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-purple-500/50 outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="ultimate">Ultimate</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-purple-500/50 outline-none"
            >
              <option value="created">Recent First</option>
              <option value="email">Email (A-Z)</option>
              <option value="tokens">Most Tokens</option>
              <option value="usage">Most Usage</option>
            </select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUserIds.size > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">
                  {selectedUserIds.size} user{selectedUserIds.size > 1 ? 's' : ''} selected
                </span>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bulkTokens}
                    onChange={(e) => setBulkTokens(Number(e.target.value))}
                    placeholder="Tokens"
                    className="w-24 h-8 bg-black/50 border-white/10 text-white text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleBulkInjectTokens}
                    disabled={processing}
                    className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 h-8 text-xs"
                  >
                    <Coins className="w-3 h-3 mr-1" />
                    Inject
                  </Button>
                </div>

                <select
                  value={bulkTier}
                  onChange={(e) => setBulkTier(e.target.value)}
                  className="h-8 bg-black/50 border border-white/10 rounded px-2 text-xs text-white"
                >
                  <option value="">Select tier...</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="ultimate">Ultimate</option>
                </select>
                <Button
                  size="sm"
                  onClick={handleBulkChangeTier}
                  disabled={processing || !bulkTier}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 h-8 text-xs"
                >
                  Change Tier
                </Button>

                <Button
                  size="sm"
                  onClick={handleBulkToggleAccess}
                  disabled={processing}
                  className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30 h-8 text-xs"
                >
                  Toggle Access
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUserIds(new Set())}
                  className="ml-auto h-8 text-xs"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-black/30 border border-white/5 rounded-lg p-4 hover:bg-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <button
                      onClick={() => {
                        const newSet = new Set(selectedUserIds);
                        if (newSet.has(user.id)) {
                          newSet.delete(user.id);
                        } else {
                          newSet.add(user.id);
                        }
                        setSelectedUserIds(newSet);
                      }}
                      className="w-5 h-5 rounded border-2 border-white/20 flex items-center justify-center hover:border-purple-500/50 transition-colors"
                    >
                      {selectedUserIds.has(user.id) ? (
                        <CheckSquare className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.email}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.full_name || 'No name set'}
                          {user.display_name && ` · @${user.display_name}`}
                        </p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-gray-400">Tokens:</span>
                        <span className="font-medium">{user.total_tokens || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-gray-400">Used:</span>
                        <span className="font-medium">{user.tokens_used || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge 
                        className={`${getTierBadge(user.subscription_tier || 'free')} text-xs px-2 py-0.5`}
                      >
                        {(user.subscription_tier || 'free').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedUserDetail(user.id);
                        loadUserDetails(user.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-purple-500/20"
                      disabled={processing}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

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
                      disabled={processing}
                      title="Edit user"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResetTokens(user.id)}
                      className="h-8 w-8 p-0 hover:bg-yellow-500/20"
                      disabled={processing}
                      title="Reset tokens"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleAccess(user.id, user.has_access)}
                      className="h-8 w-8 p-0 hover:bg-green-500/20"
                      disabled={processing}
                      title={user.has_access ? "Revoke access" : "Grant access"}
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
                      className="h-8 w-8 p-0 hover:bg-red-500/20"
                      disabled={processing}
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Edit Form */}
                {editingUser === user.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Full name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        className="bg-black/50 border-white/10 h-10 text-sm"
                        disabled={processing}
                      />
                      <Input
                        placeholder="Display name"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                        className="bg-black/50 border-white/10 h-10 text-sm"
                        disabled={processing}
                      />
                      <select
                        value={editForm.subscription_tier}
                        onChange={(e) => setEditForm({...editForm, subscription_tier: e.target.value})}
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm h-10 outline-none focus:border-purple-500/50"
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
                        className="bg-black/50 border-white/10 h-10 text-sm"
                        disabled={processing}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingUser(null); setEditForm({}); }}
                        className="border-white/10 h-9"
                        disabled={processing}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUpdateUser}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-9"
                        disabled={processing}
                      >
                        {processing && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Database className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No users found</p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUserDetail && userDetailData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900/95 backdrop-blur">
              <h3 className="text-xl font-bold">User Details</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedUserDetail(null);
                  setUserDetailData(null);
                }}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-gray-400">Conversations</p>
                  </div>
                  <p className="text-2xl font-bold">{userDetailData.conversations_count}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-gray-400">Messages</p>
                  </div>
                  <p className="text-2xl font-bold">{userDetailData.messages_count}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-gray-400">Projects</p>
                  </div>
                  <p className="text-2xl font-bold">{userDetailData.projects_count}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-gray-400">Transactions</p>
                  </div>
                  <p className="text-2xl font-bold">{userDetailData.transactions_count}</p>
                </div>
              </div>

              {userDetailData.total_balance !== undefined && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Balance</p>
                  <p className="text-3xl font-bold text-purple-400">{userDetailData.total_balance} DUA</p>
                </div>
              )}

              {userDetailData.last_activity && (
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Last Activity</p>
                  <p className="text-lg">{new Date(userDetailData.last_activity).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Audit Logs</h3>
                <p className="text-xs text-gray-400 mt-1">Admin actions history</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={auditFilter || 'all'}
                  onChange={(e) => setAuditFilter(e.target.value === 'all' ? null : e.target.value)}
                  className="bg-black/50 border border-white/10 rounded px-3 py-1 text-sm"
                >
                  <option value="all">All Actions</option>
                  <option value="inject_tokens">Token Injections</option>
                  <option value="update_user">User Updates</option>
                  <option value="toggle_access">Access Changes</option>
                  <option value="delete_user">User Deletions</option>
                </select>
                <Button
                  size="sm"
                  onClick={loadAuditLogs}
                  className="bg-purple-500/20 hover:bg-purple-500/30"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAuditLogs(false)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-white/5 rounded-lg p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                          {log.action}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.admin_email && (
                        <p className="text-xs text-gray-400">By: {log.admin_email}</p>
                      )}
                      {log.details && (
                        <p className="text-xs text-gray-300 mt-1">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No audit logs found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analyticsData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900/95 backdrop-blur">
              <div>
                <h3 className="text-xl font-bold">Analytics Dashboard</h3>
                <p className="text-xs text-gray-400 mt-1">Platform growth and usage metrics</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAnalytics(false)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-gray-400">7-Day Growth</p>
                  </div>
                  <p className="text-4xl font-bold text-green-400">{analyticsData.growth7d}</p>
                  <p className="text-xs text-gray-500 mt-2">New users in last 7 days</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <p className="text-sm text-gray-400">30-Day Growth</p>
                  </div>
                  <p className="text-4xl font-bold text-blue-400">{analyticsData.growth30d}</p>
                  <p className="text-xs text-gray-500 mt-2">New users in last 30 days</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <p className="text-sm text-gray-400">Messages/Day</p>
                  </div>
                  <p className="text-4xl font-bold text-purple-400">{analyticsData.messagesPerDay}</p>
                  <p className="text-xs text-gray-500 mt-2">Average daily messages</p>
                </div>

                <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-pink-400" />
                    <p className="text-sm text-gray-400">Conversion Rate</p>
                  </div>
                  <p className="text-4xl font-bold text-pink-400">{analyticsData.conversionRate}%</p>
                  <p className="text-xs text-gray-500 mt-2">Free to Premium conversion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Painel de Códigos de Acesso */}
      {showCodesPanel && (
        <div className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Ticket className="w-6 h-6 text-purple-400" />
              Gestão de Códigos de Acesso
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCodesPanel(false)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
          <AdminInviteCodesPanel />
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
