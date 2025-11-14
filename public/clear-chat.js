/**
 * Script para limpar mensagens antigas do chat
 * Execute este script no console do browser para limpar o histórico
 */

// Limpar todas as chaves relacionadas ao chat DUA
const keysToRemove = [];

for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('dua-chat') || key.includes('chat-history'))) {
    keysToRemove.push(key);
  }
}

console.log('🧹 Limpando chaves:', keysToRemove);

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('✅ Removido:', key);
});

console.log('✨ Chat limpo! Recarregue a página.');
