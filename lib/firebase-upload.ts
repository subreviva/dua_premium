// ===================================================
// 🚀 FIREBASE STORAGE UPLOAD UTILITIES
// ===================================================
// Sistema profissional de upload com:
// - Validação rigorosa de arquivos
// - Compressão automática
// - Progress tracking
// - Error handling robusto
// - Metadata management
// ===================================================

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage, FIREBASE_STORAGE_PATHS, MAX_FILE_SIZES, ALLOWED_MIME_TYPES, MediaType } from './firebase';

// ===================================================
// TIPOS
// ===================================================
export interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  compress?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

// ===================================================
// VALIDAÇÃO DE ARQUIVOS
// ===================================================
export function validateFile(file: File, type: MediaType): FileValidation {
  // 1. Verificar se o arquivo existe
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo fornecido' };
  }

  // 2. Verificar tamanho
  const maxSize = MAX_FILE_SIZES[type.toUpperCase() as keyof typeof MAX_FILE_SIZES];
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Arquivo muito grande (${fileSizeMB}MB). Máximo permitido: ${maxSizeMB}MB`
    };
  }

  // 3. Verificar tipo MIME
  const allowedTypes = ALLOWED_MIME_TYPES[type.toUpperCase() as keyof typeof ALLOWED_MIME_TYPES] as readonly string[];
  if (!(allowedTypes as string[]).includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`
    };
  }

  // 4. Verificar extensão
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions: Record<MediaType, string[]> = {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    music: ['mp3', 'wav', 'ogg'],
    video: ['mp4', 'webm', 'mov'],
    design: ['png', 'jpg', 'jpeg', 'svg']
  };

  if (extension && !validExtensions[type].includes(extension)) {
    return {
      isValid: false,
      error: `Extensão não permitida. Permitidas: ${validExtensions[type].join(', ')}`
    };
  }

  return { isValid: true };
}

// ===================================================
// COMPRESSÃO DE IMAGENS
// ===================================================
async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para blob (WebP para melhor compressão)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao comprimir imagem'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem'));

    // Carregar imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ===================================================
// GERAR NOME DE ARQUIVO ÚNICO
// ===================================================
function generateUniqueFileName(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const sanitizedName = originalName
    .split('.')[0]
    .replace(/[^a-zA-Z0-9]/g, '-')
    .substring(0, 30);
  
  return `${userId}_${timestamp}_${randomStr}_${sanitizedName}.${extension}`;
}

// ===================================================
// UPLOAD SIMPLES (Sem progress tracking)
// ===================================================
export async function uploadToFirebase(
  file: File,
  type: MediaType,
  userId: string,
  options: Omit<UploadOptions, 'onProgress'> = {}
): Promise<UploadResult> {
  try {
    // 1. Validar arquivo
    const validation = validateFile(file, type);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // 2. Preparar arquivo (comprimir se necessário)
    let fileToUpload: Blob | File = file;
    
    if (options.compress && type === 'image') {
      try {
        fileToUpload = await compressImage(file);
        console.log(`✅ Imagem comprimida: ${file.size} → ${fileToUpload.size} bytes`);
      } catch (error) {
        console.warn('⚠️  Falha ao comprimir, usando original:', error);
      }
    }

    // 3. Gerar caminho e referência
    const basePath = FIREBASE_STORAGE_PATHS[`COMMUNITY_${type.toUpperCase()}` as keyof typeof FIREBASE_STORAGE_PATHS];
    const fileName = generateUniqueFileName(userId, file.name);
    const filePath = `${basePath}/${fileName}`;
    const storageRef = ref(storage, filePath);

    // 4. Preparar metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        originalSize: file.size.toString(),
        ...options.metadata
      }
    };

    // 5. Upload
    console.log(`📤 Uploading ${type} to Firebase: ${filePath}`);
    await uploadBytes(storageRef, fileToUpload, metadata);

    // 6. Obter URL pública
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`✅ Upload concluído: ${downloadURL}`);

    // 7. Callback de sucesso
    if (options.onSuccess) {
      options.onSuccess(downloadURL);
    }

    return {
      success: true,
      url: downloadURL,
      path: filePath
    };

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    if (options.onError) {
      options.onError(error instanceof Error ? error : new Error(errorMessage));
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

// ===================================================
// UPLOAD COM PROGRESS TRACKING
// ===================================================
export function uploadToFirebaseWithProgress(
  file: File,
  type: MediaType,
  userId: string,
  options: UploadOptions = {}
): UploadTask {
  // 1. Validar arquivo
  const validation = validateFile(file, type);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 2. Gerar caminho e referência
  const basePath = FIREBASE_STORAGE_PATHS[`COMMUNITY_${type.toUpperCase()}` as keyof typeof FIREBASE_STORAGE_PATHS];
  const fileName = generateUniqueFileName(userId, file.name);
  const filePath = `${basePath}/${fileName}`;
  const storageRef = ref(storage, filePath);

  // 3. Preparar metadata
  const metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      originalSize: file.size.toString(),
      ...options.metadata
    }
  };

  // 4. Iniciar upload resumable
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  // 5. Monitorar progresso
  uploadTask.on(
    'state_changed',
    (snapshot: UploadTaskSnapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`📊 Upload progress: ${progress.toFixed(1)}%`);
      
      if (options.onProgress) {
        options.onProgress(progress);
      }
    },
    (error) => {
      console.error('❌ Erro no upload:', error);
      if (options.onError) {
        options.onError(error);
      }
    },
    async () => {
      try {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log(`✅ Upload concluído: ${downloadURL}`);
        
        if (options.onSuccess) {
          options.onSuccess(downloadURL);
        }
      } catch (error) {
        console.error('❌ Erro ao obter URL:', error);
        if (options.onError) {
          options.onError(error instanceof Error ? error : new Error('Erro ao obter URL'));
        }
      }
    }
  );

  return uploadTask;
}

// ===================================================
// DELETAR ARQUIVO
// ===================================================
export async function deleteFromFirebase(filePath: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    console.log(`🗑️  Arquivo deletado: ${filePath}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar:', error);
    return false;
  }
}

// ===================================================
// UTILITÁRIOS
// ===================================================
export function getFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getMediaTypeFromMime(mimeType: string): MediaType | null {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'music';
  if (mimeType.startsWith('video/')) return 'video';
  return null;
}
