/**
 * Stagewise Toolbar Configuration
 * 
 * Configuração da toolbar @21st-extension para desenvolvimento
 * Melhora experiência mobile/desktop com ferramentas premium
 */

import { initToolbar } from '@21st-extension/toolbar';

// Configuração da toolbar
const stagewiseConfig = {
  plugins: [],
  // Adicionar configurações específicas aqui se necessário
};

/**
 * Inicializa a toolbar apenas em modo desenvolvimento
 * Framework-agnostic - funciona com Next.js e outras frameworks
 */
export function setupStagewise() {
  // Apenas inicializa uma vez e apenas em desenvolvimento
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    try {
      initToolbar(stagewiseConfig);
      // console.log('✅ Stagewise Toolbar initialized');
    } catch (error) {
      // console.error('❌ Failed to initialize Stagewise Toolbar:', error);
    }
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  setupStagewise();
}
