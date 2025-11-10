// ===================================================
// 🔥 FIREBASE CONFIGURATION - DUA IA
// ===================================================
// Storage otimizado para comunidade (5GB grátis)
// Integração profissional com validação e error handling
// ===================================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// ===================================================
// 🔐 SEGURANÇA - FIREBASE API KEY
// ===================================================
// ✅ NEXT_PUBLIC_FIREBASE_API_KEY pode ser pública porque:
//
// 1. 🎯 DESIGN: Firebase foi projetado para client-side (browser)
//    - Todas as apps Firebase expõem a API key no código do cliente
//    - É um IDENTIFICADOR, não uma credencial secreta
//
// 2. 🛡️ PROTEÇÃO REAL: Firebase Security Rules (server-side)
//    - Regras controlam quem pode ler/escrever no Storage
//    - Ver arquivo: storage.rules
//    - Apenas usuários autenticados podem fazer upload
//    - Limite de 10MB por arquivo
//    - Apenas imagens permitidas
//
// 3. 🌐 HTTP REFERRER RESTRICTIONS:
//    - Configurado em: https://console.cloud.google.com/apis/credentials
//    - Apenas domínios autorizados podem usar a key:
//      * *.vercel.app/*
//      * *.github.dev/*
//    - Tentativas de outros domínios = BLOQUEADAS
//
// 4. 📊 MONITORAMENTO:
//    - Quotas e alertas configurados no Firebase Console
//    - Notificações se houver uso anormal
//
// 5. ✅ PADRÃO DA INDÚSTRIA:
//    - Supabase usa mesma abordagem (NEXT_PUBLIC_SUPABASE_ANON_KEY)
//    - Documentação oficial recomenda NEXT_PUBLIC_*
//
// ⚠️ NÃO confundir com NEXT_PUBLIC_GOOGLE_API_KEY (Gemini):
//    - Gemini API NÃO foi feita para client-side → REMOVIDA
//    - Firebase API FOI feita para client-side → SEGURA (com proteções)
//
// 📚 Mais info: FIREBASE_SECURITY_SETUP.md
// ===================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // ✅ Seguro (ver explicação acima)
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dua-ia.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Opcional
};

// ===================================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ===================================================
function validateFirebaseConfig(): boolean {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ] as const;

  const missing = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    console.error('🔥 Firebase: Configuração incompleta!');
    console.error('❌ Faltando:', missing.join(', '));
    console.error('💡 Adicione as variáveis ao .env.local');
    return false;
  }

  console.log('✅ Firebase: Configuração válida');
  return true;
}

// ===================================================
// INICIALIZAÇÃO (Singleton Pattern)
// ===================================================
let app: FirebaseApp;
let storage: FirebaseStorage;

function initializeFirebase(): { app: FirebaseApp; storage: FirebaseStorage } {
  try {
    // Prevenir múltiplas instâncias
    if (getApps().length > 0) {
      app = getApps()[0];
      storage = getStorage(app);
      console.log('✅ Firebase: Usando instância existente');
      return { app, storage };
    }

    // Validar configuração antes de inicializar
    if (!validateFirebaseConfig()) {
      throw new Error('Configuração Firebase inválida');
    }

    // Inicializar Firebase
    app = initializeApp(firebaseConfig);
    storage = getStorage(app);

    console.log('✅ Firebase inicializado com sucesso');
    console.log(`📦 Storage bucket: ${firebaseConfig.storageBucket}`);

    return { app, storage };
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    throw error;
  }
}

// ===================================================
// EXPORTS
// ===================================================
const { app: firebaseApp, storage: firebaseStorage } = initializeFirebase();

export { firebaseApp as app, firebaseStorage as storage };
export default firebaseApp;

// ===================================================
// TIPOS E CONSTANTES
// ===================================================
export const FIREBASE_STORAGE_PATHS = {
  COMMUNITY_IMAGES: 'community/images',
  COMMUNITY_MUSIC: 'community/music',
  COMMUNITY_VIDEOS: 'community/videos',
  COMMUNITY_DESIGNS: 'community/designs',
  USER_AVATARS: 'users/avatars',
  TEMP: 'temp'
} as const;

export const MAX_FILE_SIZES = {
  IMAGE: 10 * 1024 * 1024,    // 10MB
  MUSIC: 50 * 1024 * 1024,    // 50MB
  VIDEO: 100 * 1024 * 1024,   // 100MB
  DESIGN: 20 * 1024 * 1024    // 20MB
} as const;

export const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MUSIC: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  DESIGN: ['image/png', 'image/jpeg', 'image/svg+xml']
} as const;

export type MediaType = 'image' | 'music' | 'video' | 'design';
