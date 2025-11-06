"use client";

import { useEffect } from 'react';

/**
 * Stagewise Toolbar Initializer
 * 
 * Componente client-side que inicializa a toolbar do @21st-extension
 * apenas em modo desenvolvimento para ferramentas premium de debugging
 * mobile/desktop
 */
export function StagewiseToolbar() {
  useEffect(() => {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // Importação dinâmica para não incluir em produção
      import('@21st-extension/toolbar')
        .then(({ initToolbar }) => {
          const stagewiseConfig = {
            plugins: [],
          };
          
          initToolbar(stagewiseConfig);
          // console.log('✅ Stagewise Toolbar initialized');
        })
        .catch((error) => {
          // console.error('❌ Failed to initialize Stagewise Toolbar:', error);
        });
    }
  }, []);

  // Componente não renderiza nada visualmente
  return null;
}
