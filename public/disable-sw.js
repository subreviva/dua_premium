// 🔧 Desabilitar Service Worker em Desenvolvimento
// Este script desregistra todos os service workers para evitar conflitos com GitHub Codespaces

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(success) {
        console.log('✅ Service Worker desregistrado:', success);
      }).catch(function(error) {
        console.warn('⚠️ Erro ao desregistrar SW:', error);
      });
    }
  });
  
  // Limpar cache do service worker
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  console.log('🔧 Service Worker desabilitado - modo desenvolvimento');
}
