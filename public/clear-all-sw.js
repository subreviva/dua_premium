// 🔥 REMOVER TODOS OS SERVICE WORKERS - ULTRA AGRESSIVO
console.log('🔥 Limpando TODOS os Service Workers e caches...');

// 1. Unregister ALL service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    registrations.forEach(function(registration) {
      registration.unregister();
      console.log('✅ SW removido:', registration.scope);
    });
  });
}

// 2. Delete ALL caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    cacheNames.forEach(function(cacheName) {
      caches.delete(cacheName);
      console.log('✅ Cache removido:', cacheName);
    });
  });
}

// 3. Clear localStorage
localStorage.clear();
console.log('✅ localStorage limpo');

// 4. Clear sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpo');

// 5. Force reload (no cache)
console.log('🔄 Recarregando sem cache em 2 segundos...');
setTimeout(() => {
  window.location.reload(true);
}, 2000);
