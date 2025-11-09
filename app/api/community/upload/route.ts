// ===================================================
// 🚀 API: UPLOAD PARA COMUNIDADE (Firebase Storage)
// ===================================================
// POST /api/community/upload
// 
// Upload de mídia (imagem/música/vídeo) para Firebase Storage
// e criação de post na comunidade (Supabase)
// 
// FEATURES:
// - Upload para Firebase Storage (5GB grátis)
// - Validação rigorosa de arquivos
// - Compressão automática de imagens
// - Metadata no Supabase
// - Rate limiting
// - Error handling profissional
// ===================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadToFirebase, validateFile, getFileSize } from '@/lib/firebase-upload';
import type { MediaType } from '@/lib/firebase';

// ===================================================
// CONFIGURAÇÃO
// ===================================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Rate limiting (10 uploads por hora por usuário)
const uploadLimits = new Map<string, number[]>();
const MAX_UPLOADS_PER_HOUR = 10;

// ===================================================
// VERIFICAR RATE LIMIT
// ===================================================
function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Obter uploads do usuário na última hora
  const userUploads = uploadLimits.get(userId) || [];
  const recentUploads = userUploads.filter(timestamp => timestamp > oneHourAgo);

  // Atualizar lista
  uploadLimits.set(userId, recentUploads);

  const allowed = recentUploads.length < MAX_UPLOADS_PER_HOUR;
  const remaining = Math.max(0, MAX_UPLOADS_PER_HOUR - recentUploads.length);

  return { allowed, remaining };
}

// ===================================================
// POST: Upload de Arquivo
// ===================================================
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [Upload API] Recebendo requisição...');

    // -----------------------------------------------
    // 1. AUTENTICAÇÃO
    // -----------------------------------------------
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ [Upload API] Sem autorização');
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ [Upload API] Falha na autenticação:', authError);
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log(`✅ [Upload API] Usuário autenticado: ${user.id}`);

    // -----------------------------------------------
    // 2. RATE LIMITING
    // -----------------------------------------------
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      console.warn(`⚠️  [Upload API] Rate limit excedido para ${user.id}`);
      return NextResponse.json(
        { 
          error: 'Limite de uploads excedido',
          message: 'Você atingiu o limite de 10 uploads por hora. Tente novamente mais tarde.',
          retryAfter: 3600
        },
        { status: 429 }
      );
    }

    console.log(`✅ [Upload API] Rate limit OK (${rateLimit.remaining} restantes)`);

    // -----------------------------------------------
    // 3. PARSE DO FORMULÁRIO
    // -----------------------------------------------
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string)?.toLowerCase() as MediaType;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Validar campos obrigatórios
    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    if (!type || !['image', 'music', 'video', 'design'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de mídia inválido' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Título obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📋 [Upload API] Dados recebidos:`, {
      fileName: file.name,
      fileSize: getFileSize(file.size),
      fileType: file.type,
      mediaType: type,
      title: title.substring(0, 50)
    });

    // -----------------------------------------------
    // 4. VALIDAR ARQUIVO
    // -----------------------------------------------
    const validation = validateFile(file, type);
    if (!validation.isValid) {
      console.error(`❌ [Upload API] Validação falhou:`, validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    console.log(`✅ [Upload API] Arquivo validado`);

    // -----------------------------------------------
    // 5. UPLOAD PARA FIREBASE STORAGE
    // -----------------------------------------------
    console.log(`📤 [Upload API] Enviando para Firebase Storage...`);
    
    const uploadResult = await uploadToFirebase(file, type, user.id, {
      compress: type === 'image', // Comprimir apenas imagens
      metadata: {
        title,
        description: description || '',
        uploadSource: 'community'
      }
    });

    if (!uploadResult.success || !uploadResult.url) {
      console.error(`❌ [Upload API] Upload falhou:`, uploadResult.error);
      return NextResponse.json(
        { error: uploadResult.error || 'Falha no upload' },
        { status: 500 }
      );
    }

    console.log(`✅ [Upload API] Arquivo enviado: ${uploadResult.url}`);

    // -----------------------------------------------
    // 6. CRIAR POST NO SUPABASE
    // -----------------------------------------------
    console.log(`💾 [Upload API] Criando post na comunidade...`);

    const { data: post, error: dbError } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        type,
        title: title.trim(),
        description: description?.trim() || null,
        media_url: uploadResult.url,
        firebase_path: uploadResult.path
      })
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (dbError) {
      console.error(`❌ [Upload API] Erro ao criar post:`, dbError);
      
      // TODO: Tentar deletar arquivo do Firebase em caso de erro
      // await deleteFromFirebase(uploadResult.path!);
      
      return NextResponse.json(
        { error: 'Erro ao criar publicação' },
        { status: 500 }
      );
    }

    console.log(`✅ [Upload API] Post criado: ${post.id}`);

    // -----------------------------------------------
    // 7. ATUALIZAR RATE LIMIT
    // -----------------------------------------------
    const userUploads = uploadLimits.get(user.id) || [];
    userUploads.push(Date.now());
    uploadLimits.set(user.id, userUploads);

    // -----------------------------------------------
    // 8. RESPOSTA DE SUCESSO
    // -----------------------------------------------
    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        type: post.type,
        title: post.title,
        description: post.description,
        media_url: post.media_url,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        created_at: post.created_at,
        author: post.profiles
      },
      upload: {
        url: uploadResult.url,
        path: uploadResult.path,
        size: file.size
      },
      rateLimit: {
        remaining: rateLimit.remaining - 1,
        resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [Upload API] Erro inesperado:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// ===================================================
// GET: Status da API
// ===================================================
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'Community Upload API',
    storage: 'Firebase Storage',
    database: 'Supabase',
    rateLimit: {
      maxUploadsPerHour: MAX_UPLOADS_PER_HOUR
    },
    supportedTypes: ['image', 'music', 'video', 'design']
  });
}
