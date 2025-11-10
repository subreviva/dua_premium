'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PremiumPanelHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
}

export default function PremiumPanelHeader({ 
  icon: Icon, 
  title, 
  description,
  gradient = 'from-blue-500/20 to-purple-500/20'
}: PremiumPanelHeaderProps) {
  return (
    <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 backdrop-blur-sm overflow-hidden`}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      {/* Icon decoration */}
      <div className="absolute top-4 right-4 opacity-10">
        <Icon className="w-24 h-24" strokeWidth={1} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-white/70 leading-relaxed max-w-md">
          {description}
        </p>
      </div>
    </div>
  );
}
