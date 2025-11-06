"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  useEffect(() => {
    loadUserAvatar();
  }, []);

  const loadUserAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('avatar_url, name, username')
          .eq('id', user.id)
          .single();

        if (userData) {
          setAvatarUrl(userData.avatar_url);
          setUserName(userData.name || userData.username || user.email?.split('@')[0] || 'User');
        }
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
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
