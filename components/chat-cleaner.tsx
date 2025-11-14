"use client";

import { useEffect } from 'react';

/**
 * Componente que limpa mensagens inválidas do localStorage
 * Executa apenas uma vez quando a página carrega
 */
export function ChatCleaner() {
  useEffect(() => {
    // Procurar e limpar todas as chaves de chat
    const keysToClean: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('dua-chat-history')) {
        keysToClean.push(key);
      }
    }
    
    if (keysToClean.length === 0) return;
    
    console.log('[CHAT CLEANER] Verificando', keysToClean.length, 'conversas');
    
    let totalCleaned = 0;
    
    keysToClean.forEach(key => {
      try {
        const saved = localStorage.getItem(key);
        if (!saved) return;
        
        const parsed = JSON.parse(saved);
        const before = parsed.length;
        
        // Filtrar mensagens inválidas
        const cleaned = parsed.filter((msg: any) => {
          // Manter apenas user e assistant
          if (msg.role !== 'user' && msg.role !== 'assistant') return false;
          // Remover vazias
          if (!msg.content || msg.content.trim() === '') return false;
          // Remover boas-vindas automáticas
          if (typeof msg.content === 'string') {
            if (msg.content.includes('Tava a sonhar')) return false;
            if (msg.content.includes('beat perfeito')) return false;
            if (msg.content.includes('já acordei')) return false;
          }
          return true;
        });
        
        const after = cleaned.length;
        
        if (before !== after) {
          localStorage.setItem(key, JSON.stringify(cleaned));
          totalCleaned += (before - after);
          console.log(`[CHAT CLEANER] ${key}: ${before} → ${after} mensagens (removidas ${before - after})`);
        }
      } catch (error) {
        console.error('[CHAT CLEANER] Erro ao limpar', key, error);
        // Se houver erro, remover a chave completamente
        localStorage.removeItem(key);
      }
    });
    
    if (totalCleaned > 0) {
      console.log(`[CHAT CLEANER] ✅ Total de mensagens inválidas removidas: ${totalCleaned}`);
    }
  }, []);
  
  return null; // Componente invisível
}
