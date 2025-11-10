"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Ticket, Plus, Search, RefreshCw, Download, Copy, Check,
  Filter, Calendar, User, Clock, AlertCircle, CheckCircle,
  Trash2, Eye, EyeOff, ChevronDown, ChevronUp
} from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  active: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface CodeStats {
  total: number;
  active: number;
  used: number;
  usageRate: number;
}

export default function AdminInviteCodesPanel() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "used">("all");
  const [sortBy, setSortBy] = useState<"code" | "created" | "used">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Geração de códigos
  const [showGenerator, setShowGenerator] = useState(false);
  const [quantityToGenerate, setQuantityToGenerate] = useState(10);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [showGeneratedCodes, setShowGeneratedCodes] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<CodeStats>({
    total: 0,
    active: 0,
    used: 0,
    usageRate: 0
  });
  
  // Detalhes expandidos
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [codes, searchTerm, filterStatus, sortBy, sortOrder]);

  const loadCodes = async () => {
    setLoading(true);
    try {
      // Buscar códigos com informação do usuário (se usado)
      const { data: codesData, error } = await supabaseClient
        .from('invite_codes')
        .select(`
          *,
          user:users!invite_codes_used_by_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar dados
      const processedCodes = codesData.map((code: any) => ({
        id: code.id,
        code: code.code,
        active: code.active,
        used_by: code.used_by,
        used_at: code.used_at,
        created_at: code.created_at,
        user_name: code.user?.name,
        user_email: code.user?.email
      }));

      setCodes(processedCodes);

      // Calcular estatísticas
      const total = processedCodes.length;
      const active = processedCodes.filter(c => c.active).length;
      const used = processedCodes.filter(c => !c.active).length;
      const usageRate = total > 0 ? (used / total) * 100 : 0;

      setStats({ total, active, used, usageRate });
    } catch (error: any) {
      console.error('Erro ao carregar códigos:', error);
      toast.error('Erro ao carregar códigos', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...codes];

    // Filtro de pesquisa
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(code =>
        code.code.toLowerCase().includes(search) ||
        code.user_name?.toLowerCase().includes(search) ||
        code.user_email?.toLowerCase().includes(search)
      );
    }

    // Filtro de status
    if (filterStatus === "active") {
      filtered = filtered.filter(code => code.active);
    } else if (filterStatus === "used") {
      filtered = filtered.filter(code => !code.active);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "code":
          comparison = a.code.localeCompare(b.code);
          break;
        case "created":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "used":
          if (!a.used_at && !b.used_at) comparison = 0;
          else if (!a.used_at) comparison = 1;
          else if (!b.used_at) comparison = -1;
          else comparison = new Date(a.used_at).getTime() - new Date(b.used_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredCodes(filtered);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `DUA-${part1}-${part2}`;
  };

  const handleGenerateCodes = async () => {
    if (quantityToGenerate < 1 || quantityToGenerate > 100) {
      toast.error('Quantidade inválida', {
        description: 'Gera entre 1 e 100 códigos de cada vez'
      });
      return;
    }

    setProcessing(true);
    try {
      // Gerar códigos únicos
      const newCodes: string[] = [];
      const existingCodes = new Set(codes.map(c => c.code));

      while (newCodes.length < quantityToGenerate) {
        const code = generateCode();
        if (!existingCodes.has(code) && !newCodes.includes(code)) {
          newCodes.push(code);
        }
      }

      // Inserir na base de dados
      const { data, error } = await supabaseClient
        .from('invite_codes')
        .insert(newCodes.map(code => ({ code, active: true })))
        .select();

      if (error) throw error;

      setGeneratedCodes(newCodes);
      setShowGeneratedCodes(true);
      toast.success(`${quantityToGenerate} códigos gerados!`, {
        description: 'Códigos criados com sucesso'
      });

      // Recarregar lista
      await loadCodes();
      setShowGenerator(false);
    } catch (error: any) {
      console.error('Erro ao gerar códigos:', error);
      toast.error('Erro ao gerar códigos', {
        description: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!', {
      description: code
    });
  };

  const copyAllCodes = () => {
    const codesList = filteredCodes.map(c => c.code).join('\n');
    navigator.clipboard.writeText(codesList);
    toast.success(`${filteredCodes.length} códigos copiados!`);
  };

  const downloadCodes = () => {
    const csvContent = [
      'Código,Status,Usado Por,Email,Data de Uso,Data de Criação',
      ...filteredCodes.map(c => 
        `${c.code},${c.active ? 'Ativo' : 'Usado'},${c.user_name || '-'},${c.user_email || '-'},${c.used_at ? new Date(c.used_at).toLocaleString('pt-PT') : '-'},${new Date(c.created_at).toLocaleString('pt-PT')}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `codigos-acesso-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const deleteCode = async (codeId: string, code: string) => {
    if (!confirm(`Tem a certeza que quer eliminar o código ${code}?`)) return;

    setProcessing(true);
    try {
      const { error } = await supabaseClient
        .from('invite_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast.success('Código eliminado');
      await loadCodes();
    } catch (error: any) {
      toast.error('Erro ao eliminar código', {
        description: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleExpanded = (codeId: string) => {
    setExpandedCodeId(expandedCodeId === codeId ? null : codeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase">Total</p>
            <Ticket className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Códigos criados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase">Ativos</p>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          <p className="text-xs text-gray-500 mt-1">Disponíveis</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase">Usados</p>
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.used}</p>
          <p className="text-xs text-gray-500 mt-1">Registos feitos</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase">Taxa de Uso</p>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.usageRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Conversão</p>
        </div>
      </div>

      {/* Ações Principais */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => setShowGenerator(!showGenerator)}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Gerar Novos Códigos
        </Button>
        
        <Button
          onClick={loadCodes}
          variant="outline"
          className="border-white/10 hover:bg-white/5"
          disabled={processing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>

        <Button
          onClick={downloadCodes}
          variant="outline"
          className="border-white/10 hover:bg-white/5"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>

        <Button
          onClick={copyAllCodes}
          variant="outline"
          className="border-white/10 hover:bg-white/5"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar Todos
        </Button>
      </div>

      {/* Gerador de Códigos */}
      {showGenerator && (
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" />
            Gerar Novos Códigos de Acesso
          </h3>
          
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Quantidade</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={quantityToGenerate}
                onChange={(e) => setQuantityToGenerate(parseInt(e.target.value) || 1)}
                className="bg-black/20 border-white/10"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo: 100 códigos por vez</p>
            </div>
            
            <Button
              onClick={handleGenerateCodes}
              disabled={processing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  A gerar...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Gerar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Códigos Gerados Recentemente */}
      {showGeneratedCodes && generatedCodes.length > 0 && (
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Códigos Gerados ({generatedCodes.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGeneratedCodes(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {generatedCodes.map((code, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2"
              >
                <code className="text-xs font-mono text-green-400 flex-1">{code}</code>
                <button
                  onClick={() => copyCode(code)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-black/20 border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Pesquisar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Código, nome ou email..."
                className="pl-10 bg-black/20 border-white/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos ({stats.total})</option>
              <option value="active">Ativos ({stats.active})</option>
              <option value="used">Usados ({stats.used})</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Ordenar Por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="created">Data de Criação</option>
              <option value="code">Código</option>
              <option value="used">Data de Uso</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Ordem</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"
            >
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigos</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          A mostrar {filteredCodes.length} de {codes.length} códigos
        </div>
      </div>

      {/* Lista de Códigos */}
      <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Usado Por
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Data de Uso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                  Criado Em
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCodes.map((code) => (
                <>
                  <tr
                    key={code.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => toggleExpanded(code.id)}
                  >
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono text-purple-400 font-semibold">
                        {code.code}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {code.active ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <User className="w-3 h-3 mr-1" />
                          Usado
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {code.user_name ? (
                        <div>
                          <p className="text-sm font-medium">{code.user_name}</p>
                          <p className="text-xs text-gray-500">{code.user_email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {code.used_at ? (
                        <div className="text-sm">
                          <p>{new Date(code.used_at).toLocaleDateString('pt-PT')}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(code.used_at).toLocaleTimeString('pt-PT')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="text-sm">
                        <p>{new Date(code.created_at).toLocaleDateString('pt-PT')}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(code.created_at).toLocaleTimeString('pt-PT')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCode(code.code);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {code.active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCode(code.id, code.code);
                            }}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          {expandedCodeId === code.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details (Mobile) */}
                  {expandedCodeId === code.id && (
                    <tr className="bg-white/5 md:hidden">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Usado Por:</p>
                            {code.user_name ? (
                              <div className="mt-1">
                                <p className="font-medium">{code.user_name}</p>
                                <p className="text-xs text-gray-500">{code.user_email}</p>
                              </div>
                            ) : (
                              <p className="text-gray-500 mt-1">-</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Data de Uso:</p>
                            <p className="mt-1">
                              {code.used_at
                                ? new Date(code.used_at).toLocaleString('pt-PT')
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Criado Em:</p>
                            <p className="mt-1">
                              {new Date(code.created_at).toLocaleString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCodes.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum código encontrado</p>
            <p className="text-sm text-gray-500 mt-1">
              Ajusta os filtros ou gera novos códigos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
