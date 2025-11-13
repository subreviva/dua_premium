'use client';

import React from 'react';
import { Download, Share2, Copy, ZoomIn, Scissors, Wand2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  color: string;
  action: () => void;
}

interface QuickActionsBarProps {
  imageUrl: string;
  onRemoveBackground: () => void;
  onUpscale: () => void;
  onGenerateVariations: () => void;
  onDownload: () => void;
  onShare: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export default function QuickActionsBar({
  imageUrl,
  onRemoveBackground,
  onUpscale,
  onGenerateVariations,
  onDownload,
  onShare,
  onDelete,
  isLoading = false
}: QuickActionsBarProps) {
  
  const actions: QuickAction[] = [
    {
      id: 'remove-bg',
      label: 'Remover Fundo',
      icon: <Scissors className="w-4 h-4" strokeWidth={0.75} />,
      color: 'from-orange-500 to-orange-600',
      action: onRemoveBackground
    },
    {
      id: 'upscale',
      label: 'HD',
      icon: <ZoomIn className="w-4 h-4" strokeWidth={0.75} />,
      color: 'from-orange-500 to-orange-600',
      action: onUpscale
    },
    {
      id: 'variations',
      label: '3 Variações',
      icon: <Copy className="w-4 h-4" strokeWidth={0.75} />,
      shortcut: '⌘V',
      color: 'from-orange-500 to-orange-600',
      action: onGenerateVariations
    },
    {
      id: 'download',
      label: 'Download',
      icon: <Download className="w-4 h-4" strokeWidth={0.75} />,
      shortcut: '⌘D',
      color: 'from-orange-500 to-orange-600',
      action: onDownload
    },
    {
      id: 'share',
      label: 'Compartilhar',
      icon: <Share2 className="w-4 h-4" strokeWidth={0.75} />,
      color: 'from-orange-500 to-orange-600',
      action: onShare
    },
  ];

  // Adicionar Delete se fornecido
  if (onDelete) {
    actions.push({
      id: 'delete',
      label: 'Deletar',
      icon: <Trash2 className="w-4 h-4" strokeWidth={0.75} />,
      color: 'from-red-500 to-red-600',
      action: onDelete
    });
  }

  return (
    <div className="flex items-center justify-center gap-1.5 p-2 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/[0.08]">
      {actions.map((action, index) => (
        <React.Fragment key={action.id}>
          <button
            onClick={action.action}
            disabled={isLoading}
            title={action.label + (action.shortcut ? ` (${action.shortcut})` : '')}
            className={cn(
              "group relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
              "hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "bg-transparent hover:bg-white/[0.03]"
            )}
          >
            {/* Icon simples sem gradiente */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "bg-transparent transition-all",
              "group-hover:scale-110 text-orange-500"
            )}>
              {action.icon}
            </div>
            
            {/* Label */}
            <span className="text-white/60 text-[10px] font-medium whitespace-nowrap">
              {action.label}
            </span>

            {/* Shortcut Badge */}
            {action.shortcut && (
              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-black/90 rounded text-white/40 text-[8px] border border-white/[0.06]">
                {action.shortcut}
              </span>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </button>

          {/* Divider (não após último item) */}
          {index < actions.length - 1 && (
            <div className="w-px h-8 bg-white/[0.06]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Componente versão compacta para mobile
export function QuickActionsBarCompact({
  imageUrl,
  onRemoveBackground,
  onUpscale,
  onGenerateVariations,
  onDownload,
  onShare,
  isLoading = false
}: Omit<QuickActionsBarProps, 'onDelete'>) {
  
  const actions = [
    { id: 'bg', icon: <Scissors className="w-5 h-5" strokeWidth={0.75} />, action: onRemoveBackground, color: 'from-orange-500 to-orange-600' },
    { id: 'hd', icon: <ZoomIn className="w-5 h-5" strokeWidth={0.75} />, action: onUpscale, color: 'from-orange-500 to-orange-600' },
    { id: '3x', icon: <Copy className="w-5 h-5" strokeWidth={0.75} />, action: onGenerateVariations, color: 'from-orange-500 to-orange-600' },
    { id: 'dl', icon: <Download className="w-5 h-5" strokeWidth={0.75} />, action: onDownload, color: 'from-orange-500 to-orange-600' },
    { id: 'share', icon: <Share2 className="w-5 h-5" strokeWidth={0.75} />, action: onShare, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-2xl rounded-full border border-white/[0.08]">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.action}
          disabled={isLoading}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            "hover:scale-110 active:scale-90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-transparent hover:bg-white/[0.05] text-orange-500"
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          ) : (
            action.icon
          )}
        </button>
      ))}
    </div>
  );
}
