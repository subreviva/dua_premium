import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseClient } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || '2 LADOS <dua@2lados.pt>';

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email } = await request.json();

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: 'userId, name e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se Resend está configurado
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY não configurada - email não será enviado');
      return NextResponse.json(
        { message: 'Email service not configured' },
        { status: 200 }
      );
    }

    // Enviar email de boas-vindas
    const welcomeEmail = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bem-vindo ao ecossistema 2 LADOS',
      html: createWelcomeEmailTemplate(name)
    });

    // Atualizar flag de email enviado
    const supabase = supabaseClient;
    await supabase
      .from('users')
      .update({ welcome_email_sent: true })
      .eq('id', userId);

    console.log('✅ Email de boas-vindas enviado:', welcomeEmail.data?.id);

    return NextResponse.json({
      success: true,
      emailId: welcomeEmail.data?.id,
      message: 'Email de boas-vindas enviado com sucesso'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}

function createWelcomeEmailTemplate(name: string): string {
  const firstName = name.split(' ')[0];
  
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao 2 LADOS</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
  <div style="max-width: 600px; margin: 0 auto; background: #000; border: 1px solid rgba(255,255,255,0.1);">
    
    <!-- Header com Logo -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; color: #fff; font-size: 42px; font-weight: 800; letter-spacing: -1px;">
        2 LADOS
      </h1>
      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
        Ecossistema Criativo Independente
      </p>
    </div>

    <!-- Conteúdo Principal -->
    <div style="padding: 40px 30px;">
      
      <p style="color: #fff; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
        Olá, <strong>${firstName}</strong>
      </p>

      <h2 style="color: #fff; font-size: 28px; font-weight: 700; margin: 0 0 20px; line-height: 1.2;">
        Bem-vindo ao ecossistema <span style="background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">2 LADOS</span>.
      </h2>

      <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.8; margin: 0 0 25px;">
        Aqui a criatividade não fica presa em gavetas. Tens acesso a ferramentas reais, inteligência artificial que trabalha contigo, estúdios completos, distribuição musical (KYNTAL), DUA Coin, bolsas criativas e uma comunidade que está a construir o futuro da cultura lusófona de forma independente.
      </p>

      <!-- Cards de Benefícios -->
      <div style="margin: 30px 0;">
        
        <!-- Card 1: Estúdios -->
        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 24px; margin-right: 10px;">🎨</span>
            <h3 style="color: #6366f1; margin: 0; font-size: 18px; font-weight: 600;">Estúdios Completos</h3>
          </div>
          <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; line-height: 1.6;">
            Music Studio, Video Studio, Image Studio e Design Studio - tudo em um só lugar.
          </p>
        </div>

        <!-- Card 2: DUA IA -->
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 24px; margin-right: 10px;">🤖</span>
            <h3 style="color: #8b5cf6; margin: 0; font-size: 18px; font-weight: 600;">DUA - Inteligência Artificial</h3>
          </div>
          <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; line-height: 1.6;">
            IA que trabalha contigo para criar música, vídeo, imagens e designs profissionais.
          </p>
        </div>

        <!-- Card 3: KYNTAL -->
        <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 24px; margin-right: 10px;">🎵</span>
            <h3 style="color: #ec4899; margin: 0; font-size: 18px; font-weight: 600;">KYNTAL - Distribuição Musical</h3>
          </div>
          <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; line-height: 1.6;">
            Distribui a tua música em Spotify, Apple Music e todas as plataformas digitais.
          </p>
        </div>

        <!-- Card 4: DUA Coin -->
        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 24px; margin-right: 10px;">💎</span>
            <h3 style="color: #fbbf24; margin: 0; font-size: 18px; font-weight: 600;">DUA Coin</h3>
          </div>
          <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; line-height: 1.6;">
            Criptomoeda que alimenta o ecossistema, financia projetos e bolsas criativas.
          </p>
        </div>
      </div>

      <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.8; margin: 30px 0 25px;">
        Seguimos juntos. Qualquer dúvida, ideia ou projeto que queiras tirar do papel, estás à vontade para responder a este email.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://dua.2lados.pt" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899); color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
          Começar a Criar
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: rgba(255,255,255,0.03); border-top: 1px solid rgba(255,255,255,0.1); padding: 30px; text-align: center;">
      <p style="color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 600; margin: 0 0 10px;">
        2 LADOS
      </p>
      <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0; font-style: italic;">
        Criar com intenção. Construir com verdade.
      </p>
      
      <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} 2 LADOS. Todos os direitos reservados.
        </p>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 10px 0 0;">
          <a href="https://2lados.pt" style="color: rgba(255,255,255,0.5); text-decoration: none;">2lados.pt</a> • 
          <a href="https://duacoin.2lados.pt" style="color: rgba(255,255,255,0.5); text-decoration: none;">DUA Coin</a> • 
          <a href="https://kyntal.pt" style="color: rgba(255,255,255,0.5); text-decoration: none;">KYNTAL</a>
        </p>
      </div>
    </div>

  </div>
</body>
</html>
  `.trim();
}
