"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Shield, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UserAvatar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const supabase = supabaseClient;

  useEffect(() => {
    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminStatus(session.user.id);
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAvatarUrl("");
        setUserName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      // Verificar se é super admin através dos metadados
      const { data: profile } = await supabase
        .from('users')
        .select('role, full_access')
        .eq('id', userId)
        .single();

      if (profile) {
        const isSuperAdminUser = profile.role === 'super_admin' && profile.full_access === true;
        setIsSuperAdmin(isSuperAdminUser);
        setIsAdmin(isSuperAdminUser || profile.role === 'admin');
      }
    } catch (error) {
      // PRODUCTION: Removed console.error
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('avatar_url, name')
        .eq('id', userId)
        .single();

      if (!error && userData) {
        setAvatarUrl(userData.avatar_url || '');
        setUserName(userData.name || '');
      }
    } catch (error) {
      // PRODUCTION: Removed console.error
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        await checkAdminStatus(authUser.id);
        await loadUserData(authUser.id);
      }
    } catch (error) {
      // PRODUCTION: Removed console.error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Mostrar feedback imediato
      toast.loading("A sair...", { id: "logout" });
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Erro ao sair", {
          description: error.message,
          id: "logout"
        });
        return;
      }
      
      // Limpar estado local
      setUser(null);
      setIsAdmin(false);
      
      // Feedback de sucesso
      toast.success("Sessão encerrada", {
        description: "Até breve!",
        id: "logout"
      });
      
      // Redirecionar para home
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error("Erro ao sair", {
        description: "Tente novamente",
        id: "logout"
      });
    }
  };

  const getAvatarUrl = () => {
    // Usar avatar_url da tabela users (personalizado ou predefinido)
    if (avatarUrl) {
      return avatarUrl;
    }
    // Fallback: gerar avatar baseado no email
    const email = user?.email || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
  };

  const getInitials = () => {
    // Usar nome da tabela users
    if (userName) {
      return userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    // Fallback: usar metadata ou email
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'DU';
  };

  const getDisplayName = () => {
    return userName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  // Não logado - mostra botão de acesso exclusivo
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all"
          onClick={() => router.push("/acesso")}
        >
          Obter Acesso
        </Button>
        <Button
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-6"
          onClick={() => router.push("/registo")}
        >
          Começar
        </Button>
      </div>
    );
  }

  // Logado - mostra avatar com dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group">
          <Avatar className="w-10 h-10 border-2 border-white/20 group-hover:border-white/40 transition-all cursor-pointer ring-2 ring-transparent group-hover:ring-purple-500/50">
            <AvatarImage src={getAvatarUrl()} alt={user.email} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {(isAdmin || isSuperAdmin) && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-black flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-black" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-xl border border-white/10">
        <DropdownMenuLabel className="text-white">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{getDisplayName()}</p>
            <p className="text-xs text-white/60 truncate">{user.email}</p>
            {isSuperAdmin && (
              <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3" />
                Super Administrador
              </span>
            )}
            {isAdmin && !isSuperAdmin && (
              <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3" />
                Administrador
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        {/* Link para Perfil - todos os usuários */}
        <DropdownMenuItem 
          onClick={() => router.push('/perfil')}
          className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Meu Perfil
        </DropdownMenuItem>
        
        {(isAdmin || isSuperAdmin) && (
          // Admin - link adicional para painel
          <>
            <DropdownMenuItem 
              onClick={() => router.push('/admin')}
              className="text-yellow-400 hover:bg-yellow-500/10 cursor-pointer flex items-center gap-2 font-semibold"
            >
              <Shield className="w-4 h-4" />
              Painel Administrador
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem 
          onClick={() => router.push('/settings')}
          className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
