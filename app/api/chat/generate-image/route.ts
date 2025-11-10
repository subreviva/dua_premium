import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import Replicate from 'replicate';
import { cookies } from 'next/headers';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const CREDITO_IMAGEM_CHAT = 1; // 1 crédito por imagem após as 2 grátis
const IMAGENS_GRATIS_POR_USUARIO = 2;

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const cookieStore = await cookies();

    // Verificar autenticação via cookie
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Não autenticado - faça login' },
        { status: 401 }
      );
    }

    // Buscar usuário pelo token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt inválido' },
        { status: 400 }
      );
    }

    // Buscar informações do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('creditos_servicos, chat_images_generated, role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados do usuário' },
        { status: 500 }
      );
    }

    const creditosAtuais = userData?.creditos_servicos || 0;
    const imagensGeradas = userData?.chat_images_generated || 0;
    const isAdmin = userData?.role === 'admin';

    // 🎯 ADMIN: Geração ilimitada sem cobrar créditos
    if (isAdmin) {
      console.log('👑 Admin detectado - geração ilimitada sem cobrança');
    }

    // Verificar se precisa de créditos (apenas para não-admins)
    const precisaCobrar = !isAdmin && imagensGeradas >= IMAGENS_GRATIS_POR_USUARIO;
    
    if (precisaCobrar && creditosAtuais < CREDITO_IMAGEM_CHAT) {
      return NextResponse.json(
        { 
          error: 'Créditos insuficientes',
          message: `Você já usou suas ${IMAGENS_GRATIS_POR_USUARIO} imagens grátis. Precisa de ${CREDITO_IMAGEM_CHAT} crédito para gerar mais imagens.`,
          freeImagesUsed: imagensGeradas,
          creditsRequired: CREDITO_IMAGEM_CHAT,
          creditsAvailable: creditosAtuais
        },
        { status: 402 }
      );
    }

    // Gerar imagem com Replicate (FLUX-FAST)
    console.log('🎨 Gerando imagem com FLUX-FAST:', prompt);
    
    const input = {
      prompt: prompt,
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "jpg",
      output_quality: 80,
    };

    const output = await replicate.run("prunaai/flux-fast", { input }) as any;

    // Output é um array de URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error('Nenhuma imagem foi gerada');
    }

    console.log('✅ Imagem gerada:', imageUrl);

    // Atualizar contador de imagens e cobrar créditos (apenas para não-admins)
    const novoContador = imagensGeradas + 1;
    const novosCreditos = precisaCobrar 
      ? creditosAtuais - CREDITO_IMAGEM_CHAT 
      : creditosAtuais;

    // Admin não atualiza contador nem cobra créditos
    if (!isAdmin) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          chat_images_generated: novoContador,
          creditos_servicos: novosCreditos,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar créditos:', updateError);
        // Não retornar erro, a imagem foi gerada
      }

      // Registrar transação se cobrou créditos
      if (precisaCobrar) {
        const { error: transactionError } = await supabase
          .from('duaia_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'debit',
            amount: -CREDITO_IMAGEM_CHAT,
            balance_before: creditosAtuais,
            balance_after: novosCreditos,
            operation: 'chat_image_generation',
            description: 'Geração de imagem no chat',
            metadata: {
              prompt: prompt.substring(0, 100),
              model: 'prunaai/flux-fast',
              image_number: novoContador,
            }
          });

        if (transactionError) {
          console.error('Erro ao registrar transação:', transactionError);
        }
      }
    } else {
      console.log('👑 Admin - sem cobrança de créditos');
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      creditsCharged: isAdmin ? 0 : (precisaCobrar ? CREDITO_IMAGEM_CHAT : 0),
      creditsRemaining: novosCreditos,
      imagesGenerated: isAdmin ? imagensGeradas : novoContador,
      freeImagesRemaining: isAdmin ? 999 : Math.max(0, IMAGENS_GRATIS_POR_USUARIO - novoContador),
      isFree: isAdmin ? true : !precisaCobrar,
      isAdmin: isAdmin,
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar imagem:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao gerar imagem',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
