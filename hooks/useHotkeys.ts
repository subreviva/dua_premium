"use client";

import { useEffect, useCallback } from 'react';

export interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd no Mac, Win no Windows
  action: () => void;
  description: string;
}

export interface HotkeyOptions {
  enableOnFormTags?: boolean; // Permitir em inputs, textareas, etc
}

/**
 * Hook para gerenciar atalhos de teclado globais
 * Detecta automaticamente Mac/Windows para usar Cmd ou Ctrl
 */
export function useHotkeys(
  hotkeys: HotkeyConfig[],
  options: HotkeyOptions = {}
) {
  const { enableOnFormTags = false } = options;

  // Detectar se é Mac
  const isMac = typeof navigator !== 'undefined' 
    ? /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    : false;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar se estiver em input/textarea (a menos que enableOnFormTags seja true)
    if (!enableOnFormTags) {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
    }

    // Procurar hotkey correspondente
    for (const hotkey of hotkeys) {
      const keyMatches = event.key.toLowerCase() === hotkey.key.toLowerCase();
      
      // Verificar modificadores (DEVE ser exato, não "no mínimo")
      const ctrlMatches = hotkey.ctrl ? event.ctrlKey : !event.ctrlKey;
      const shiftMatches = hotkey.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = hotkey.alt ? event.altKey : !event.altKey;
      
      // No Mac, meta = Cmd; no Windows/Linux, ctrl = Ctrl
      const metaMatches = hotkey.meta 
        ? (isMac ? event.metaKey : event.ctrlKey)
        : (isMac ? !event.metaKey : !event.ctrlKey);

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault();
        hotkey.action();
        break;
      }
    }
  }, [hotkeys, enableOnFormTags, isMac]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Retornar helper para mostrar label do atalho
  const getHotkeyLabel = useCallback((hotkey: HotkeyConfig): string => {
    const parts: string[] = [];
    
    if (hotkey.meta) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    } else if (hotkey.ctrl) {
      parts.push('Ctrl');
    }
    
    if (hotkey.shift) parts.push('Shift');
    if (hotkey.alt) parts.push('Alt');
    parts.push(hotkey.key.toUpperCase());
    
    return parts.join(' + ');
  }, [isMac]);

  return { isMac, getHotkeyLabel };
}

/**
 * Atalhos pré-definidos comuns
 */
export const commonHotkeys = {
  newChat: (action: () => void): HotkeyConfig => ({
    key: 'k',
    meta: true,
    action,
    description: 'Nova conversa'
  }),
  
  toggleHistory: (action: () => void): HotkeyConfig => ({
    key: 'h',
    meta: true,
    shift: true,
    action,
    description: 'Abrir/fechar histórico'
  }),
  
  search: (action: () => void): HotkeyConfig => ({
    key: 'f',
    meta: true,
    action,
    description: 'Buscar conversas'
  }),
  
  escape: (action: () => void): HotkeyConfig => ({
    key: 'Escape',
    action,
    description: 'Fechar modal/sidebar'
  }),
  
  help: (action: () => void): HotkeyConfig => ({
    key: '/',
    meta: true,
    action,
    description: 'Mostrar atalhos'
  }),
  
  delete: (action: () => void): HotkeyConfig => ({
    key: 'Backspace',
    meta: true,
    shift: true,
    action,
    description: 'Deletar conversa atual'
  }),
  
  nextConversation: (action: () => void): HotkeyConfig => ({
    key: ']',
    meta: true,
    action,
    description: 'Próxima conversa'
  }),
  
  previousConversation: (action: () => void): HotkeyConfig => ({
    key: '[',
    meta: true,
    action,
    description: 'Conversa anterior'
  })
};
