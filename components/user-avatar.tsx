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
import { ShoppingCart } from "lucide-react";

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

    // Não logado - mostra botões premium ultra elegantes
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="border-white/20 bg-white/[0.05] text-white/90 hover:bg-white/[0.12] hover:border-white/30 backdrop-blur-2xl transition-all duration-300 rounded-full px-6 h-11 font-medium active:scale-[0.97] shadow-sm hover:shadow-md hidden sm:flex"
          onClick={() => router.push("/acesso")}
        >
          Obter Acesso
        </Button>
        <Button
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-7 h-11 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.97]"
          onClick={() => router.push("/registo")}
        >
          Começar
        </Button>
      </div>
    );
  }

  // Logado - mostra avatar premium com dropdown ultra elegante e profissional
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group outline-none focus:outline-none focus-visible:outline-none">
          <Avatar className="w-10 h-10 border border-white/15 group-hover:border-white/30 transition-all duration-300 cursor-pointer ring-0 group-hover:ring-1 group-hover:ring-white/20 group-hover:ring-offset-1 group-hover:ring-offset-transparent group-active:scale-95 shadow-sm hover:shadow-md">
            <AvatarImage src={getAvatarUrl()} alt={user.email} className="object-cover" />
            <AvatarFallback className="bg-white/10 text-white/90 font-medium text-sm backdrop-blur-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {(isAdmin || isSuperAdmin) && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white/90 rounded-full border border-black/50 shadow-sm flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-black/70" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-[calc(100vw-32px)] sm:w-80 bg-gradient-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-2xl border border-white/15 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-[28px] p-0 mt-3 max-h-[85vh] overflow-y-auto"
        sideOffset={14}
      >
        {/* Header do Perfil - Ultra Premium */}
        <DropdownMenuLabel className="p-0 mb-0 sticky top-0 z-50 bg-gradient-to-b from-white/[0.08] to-transparent">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3.5">
              <div className="relative flex-shrink-0">
                <Avatar className="w-14 h-14 border-2 border-white/25 shadow-lg">
                  <AvatarImage src={getAvatarUrl()} alt={user.email} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-white/15 to-white/5 text-white font-semibold backdrop-blur-xl text-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {(isAdmin || isSuperAdmin) && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/95 rounded-full border-2 border-black/40 shadow-md flex items-center justify-center">
                    <Shield className="w-2.5 h-2.5 text-black/70" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/95 truncate leading-tight tracking-tight">{getDisplayName()}</p>
                <p className="text-xs text-white/45 truncate mt-1 font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <div className="bg-gradient-to-r from-white/5 via-white/8 to-white/5 h-px border-0" />
        
        {/* Menu Items - Ultra Premium Minimal */}
        <div className="space-y-1 px-2 py-2">
          {/* Perfil */}
          <DropdownMenuItem 
            onClick={() => router.push('/perfil')}
            className="text-white/80 hover:text-white/95 hover:bg-white/[0.08] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.08] backdrop-blur-xl group data-[highlighted]:bg-white/[0.08]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.05] flex items-center justify-center transition-all duration-200 border border-white/10 flex-shrink-0">
              <User className="w-4.5 h-4.5 text-white/70" />
            </div>
            <span className="font-semibold text-sm text-white/85">Meu Perfil</span>
          </DropdownMenuItem>
          
          {/* Painel Admin (se for admin) */}
          {(isAdmin || isSuperAdmin) && (
            <DropdownMenuItem 
              onClick={() => router.push('/admin')}
              className="text-white/80 hover:text-white/95 hover:bg-white/[0.08] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.08] backdrop-blur-xl group data-[highlighted]:bg-white/[0.08]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.05] flex items-center justify-center transition-all duration-200 border border-white/10 flex-shrink-0">
                <Shield className="w-4.5 h-4.5 text-white/70" />
              </div>
              <span className="font-semibold text-sm text-white/85">Painel Admin</span>
            </DropdownMenuItem>
          )}
          
          {/* Configurações */}
          <DropdownMenuItem 
            onClick={() => router.push('/settings')}
            className="text-white/80 hover:text-white/95 hover:bg-white/[0.08] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.08] backdrop-blur-xl group data-[highlighted]:bg-white/[0.08]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.05] flex items-center justify-center transition-all duration-200 border border-white/10 flex-shrink-0">
              <Settings className="w-4.5 h-4.5 text-white/70" />
            </div>
            <span className="font-semibold text-sm text-white/85">Configurações</span>
          </DropdownMenuItem>
          
          {/* Comprar Créditos */}
          <DropdownMenuItem 
            onClick={() => router.push('/comprar')}
            className="text-white/80 hover:text-white/95 hover:bg-white/[0.08] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.08] backdrop-blur-xl group data-[highlighted]:bg-white/[0.08]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-white/[0.12] group-hover:to-white/[0.05] flex items-center justify-center transition-all duration-200 border border-white/10 flex-shrink-0">
              <ShoppingCart className="w-4.5 h-4.5 text-white/70" />
            </div>
            <span className="font-semibold text-sm text-white/85">Comprar Créditos</span>
          </DropdownMenuItem>
        </div>
        
        <div className="bg-gradient-to-r from-white/5 via-white/8 to-white/5 h-px border-0 mx-2" />
        
        {/* Logout - Premium Minimal */}
        <div className="px-2 py-2">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-white/70 hover:text-white/90 hover:bg-white/[0.06] cursor-pointer flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all duration-200 active:scale-[0.95] focus:bg-white/[0.06] backdrop-blur-xl group data-[highlighted]:bg-white/[0.06]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.01] group-hover:from-white/[0.10] group-hover:to-white/[0.03] flex items-center justify-center transition-all duration-200 border border-white/8 flex-shrink-0">
              <LogOut className="w-4.5 h-4.5 text-white/65" />
            </div>
            <span className="font-semibold text-sm text-white/75">Sair da Conta</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
