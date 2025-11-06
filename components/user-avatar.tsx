"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
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

const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com'
];

export function UserAvatar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(ADMIN_EMAILS.includes(session.user.email || ''));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        setIsAdmin(ADMIN_EMAILS.includes(authUser.email || ''));
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    const email = user?.email || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
  };

  const getInitials = () => {
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

  // Loading state
  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  // Não logado - mostra botão de login
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => router.push("/login")}
        >
          Entrar
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
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-black flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-black" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-xl border border-white/10">
        <DropdownMenuLabel className="text-white">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.user_metadata?.name || 'Usuário'}</p>
            <p className="text-xs text-white/60 truncate">{user.email}</p>
            {isAdmin && (
              <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3" />
                Administrador
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        {isAdmin ? (
          // Admin - vai para /admin
          <>
            <DropdownMenuItem 
              onClick={() => router.push('/admin')}
              className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Painel Admin
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push('/profile')}
              className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Meu Perfil
            </DropdownMenuItem>
          </>
        ) : (
          // Usuário normal - vai para /profile
          <DropdownMenuItem 
            onClick={() => router.push('/profile')}
            className="text-white hover:bg-white/10 cursor-pointer flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Meu Perfil
          </DropdownMenuItem>
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
