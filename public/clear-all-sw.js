// 🔥 REMOVER TODOS OS SERVICE WORKERS - SEM AUTO-RELOAD
console.log('🔥 Limpando Service Workers e caches...');

// 1. Unregister ALL service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    if (registrations.length > 0) {
      registrations.forEach(function(registration) {
        registration.unregister();
        console.log('✅ SW removido:', registration.scope);
      });
      console.log('✅ Todos os Service Workers removidos! Recarregue manualmente (Ctrl+Shift+R)');
    }
  });
}

// 2. Delete ALL caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    if (cacheNames.length > 0) {
      cacheNames.forEach(function(cacheName) {
        caches.delete(cacheName);
        console.log('✅ Cache removido:', cacheName);
      });
    }
  });
}
