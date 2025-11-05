"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
} from "lucide-react";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default function AdminPanel() {
  const [codes, setCodes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCodes: 0, activeCodes: 0, totalUsers: 0, usersWithAccess: 0 });
  const [newCodeQuantity, setNewCodeQuantity] = useState(5);
  const [newCredits, setNewCredits] = useState(30);
  const [loading, setLoading] = useState(false);

  // Buscar dados
  const fetchData = async () => {
    setLoading(true);
    try {
      // Códigos
      const { data: codesData } = await supabaseAdmin.from('invite_codes').select('*').order('created_at', { ascending: false });
      setCodes(codesData || []);

      // Usuários
      const { data: usersData } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
      setUsers(usersData || []);

      // Estatísticas
      const totalCodes = codesData?.length || 0;
      const activeCodes = codesData?.filter(c => c.active).length || 0;
      const totalUsers = usersData?.length || 0;
      const usersWithAccess = usersData?.filter(u => u.has_access).length || 0;

      setStats({ totalCodes, activeCodes, totalUsers, usersWithAccess });
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Gerar novos códigos
  const generateCodes = async () => {
    setLoading(true);
    try {
      const newCodes = [];
      for (let i = 0; i < newCodeQuantity; i++) {
        const code = generateCode();
        newCodes.push({
          code,
          active: true,
          credits: newCredits,
          created_at: new Date().toISOString()
        });
      }

      const { error } = await supabaseAdmin.from('invite_codes').insert(newCodes);
      
      if (error) throw error;
      
      toast.success(`${newCodeQuantity} códigos gerados!`);
      fetchData();
    } catch (error) {
      toast.error("Erro ao gerar códigos");
    } finally {
      setLoading(false);
    }
  };

  // Deletar código
  const deleteCode = async (code: string) => {
    try {
      const { error } = await supabaseAdmin.from('invite_codes').delete().eq('code', code);
      if (error) throw error;
      
      toast.success("Código deletado");
      fetchData();
    } catch (error) {
      toast.error("Erro ao deletar código");
    }
  };

  // Ativar/desativar código
  const toggleCode = async (code: string, active: boolean) => {
    try {
      const { error } = await supabaseAdmin.from('invite_codes').update({ active: !active }).eq('code', code);
      if (error) throw error;
      
      toast.success(active ? "Código desativado" : "Código ativado");
      fetchData();
    } catch (error) {
      toast.error("Erro ao alterar código");
    }
  };

  // Gerar código aleatório
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Crown className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400">DEV ACCESS</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Códigos</CardTitle>
              <Ticket className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCodes}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Códigos Ativos</CardTitle>
              <Shield className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeCodes}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Usuários</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Com Acesso</CardTitle>
              <Eye className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.usersWithAccess}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="codes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 border-white/10">
            <TabsTrigger value="codes" className="text-white">Códigos de Convite</TabsTrigger>
            <TabsTrigger value="users" className="text-white">Usuários</TabsTrigger>
          </TabsList>

          {/* Códigos Tab */}
          <TabsContent value="codes" className="space-y-4">
            <Card className="bg-black/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Gerar Novos Códigos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm text-white">Quantidade</label>
                    <Input
                      type="number"
                      value={newCodeQuantity}
                      onChange={(e) => setNewCodeQuantity(Number(e.target.value))}
                      className="bg-black/50 border-white/10 text-white w-24"
                      min="1"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white">Créditos por código</label>
                    <Input
                      type="number"
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="bg-black/50 border-white/10 text-white w-32"
                      min="1"
                      max="1000"
                    />
                  </div>
                  <Button 
                    onClick={generateCodes}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Códigos
                  </Button>
                  <Button 
                    onClick={fetchData}
                    disabled={loading}
                    variant="outline"
                    className="border-white/20 text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Códigos Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {codes.map((code) => (
                    <div key={code.code} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <code className="text-lg font-mono text-white bg-black/50 px-3 py-1 rounded">
                          {code.code}
                        </code>
                        <Badge variant={code.active ? "default" : "secondary"}>
                          {code.active ? "Ativo" : "Usado"}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {code.credits} créditos
                        </span>
                        {code.used_by && (
                          <span className="text-xs text-gray-500">
                            Usado por: {code.used_by}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCode(code.code, code.active)}
                          className="border-white/20 text-white"
                        >
                          {code.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCode(code.code)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuários Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="bg-black/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Usuários Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-white font-medium">{user.email}</div>
                          <div className="text-sm text-gray-400">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                        <Badge variant={user.has_access ? "default" : "secondary"}>
                          {user.has_access ? "Com Acesso" : "Sem Acesso"}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {user.credits} créditos
                        </span>
                        {user.invite_code_used && (
                          <code className="text-xs bg-black/50 px-2 py-1 rounded text-white">
                            {user.invite_code_used}
                          </code>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}