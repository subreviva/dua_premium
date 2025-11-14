/**
 * Custom Storage Adapter for Supabase in Development
 * 
 * Resolve problemas de persistência em GitHub Codespaces
 */

export class SupabaseStorageAdapter {
  private storageKey: string;
  
  constructor(storageKey: string = 'supabase.auth.token') {
    this.storageKey = storageKey;
  }

  getItem(key: string): string | null {
    try {
      // Tentar localStorage primeiro
      const item = localStorage.getItem(key);
      if (item) {
        console.log('[Storage] ✅ Found in localStorage:', key);
        return item;
      }

      // Fallback para sessionStorage
      const sessionItem = sessionStorage.getItem(key);
      if (sessionItem) {
        console.log('[Storage] ✅ Found in sessionStorage:', key);
        return sessionItem;
      }

      console.log('[Storage] ❌ Not found:', key);
      return null;
    } catch (error) {
      console.error('[Storage] Error getting item:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      // Salvar em ambos para garantir
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
      console.log('[Storage] ✅ Saved to localStorage & sessionStorage:', key);
    } catch (error) {
      console.error('[Storage] Error setting item:', error);
      // Fallback apenas sessionStorage
      try {
        sessionStorage.setItem(key, value);
        console.log('[Storage] ✅ Saved to sessionStorage only:', key);
      } catch (e) {
        console.error('[Storage] Failed to save:', e);
      }
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log('[Storage] ✅ Removed from both storages:', key);
    } catch (error) {
      console.error('[Storage] Error removing item:', error);
    }
  }
}
