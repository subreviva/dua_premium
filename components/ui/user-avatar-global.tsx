"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";

const supabase = supabaseClient;

interface UserAvatarGlobalProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function UserAvatarGlobal({ 
  size = "md", 
  className = "",
  showBorder = true 
}: UserAvatarGlobalProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userId, setUserId] = useState<string | null>(null);

  // ⚡ CRITICAL: Carregar avatar ao montar
  useEffect(() => {
    loadUserAvatar();
  }, []);

  // ⚡ CRITICAL: Atualizar avatar quando usuário mudar (login/logout)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AVATAR] Auth event:', event, 'User:', session?.user?.id?.slice(0, 8));
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        loadUserAvatar();
      } else if (event === 'SIGNED_OUT') {
        setAvatarUrl(null);
        setUserName('User');
        setUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ⚡ CRITICAL: Refresh a cada 30 segundos para pegar mudanças de avatar
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        loadUserAvatar();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [userId]);

  const loadUserAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('[AVATAR] Nenhum usuário autenticado');
        setAvatarUrl(null);
        setUserName('User');
        setUserId(null);
        return;
      }

      console.log(`[AVATAR] Carregando avatar do usuário ${user.id.slice(0, 8)}...`);
      setUserId(user.id);

      const { data: userData, error } = await supabase
        .from('users')
        .select('avatar_url, name, username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[AVATAR] Erro ao carregar dados:', error);
        
        // Fallback para user metadata
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'User');
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      } else if (userData) {
        console.log(`[AVATAR] Avatar carregado:`, userData.avatar_url ? 'SIM' : 'NÃO');
        setAvatarUrl(userData.avatar_url);
        setUserName(userData.name || userData.username || user.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('[AVATAR] Erro geral:', error);
    }
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar 
      className={`
        ${sizeClasses[size]} 
        ${showBorder ? 'border-2 border-white/20 hover:border-white/40' : ''} 
        transition-all duration-300 cursor-pointer ring-2 ring-transparent hover:ring-purple-500/50
        ${className}
      `}
    >
      <AvatarImage 
        src={avatarUrl || undefined} 
        alt={userName}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
        {avatarUrl ? (
          <User className={iconSizes[size]} />
        ) : (
          getInitials()
        )}
      </AvatarFallback>
    </Avatar>
  );
}
