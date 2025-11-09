import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email do admin para receber notificações
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@2lados.pt';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'DUA <dua@2lados.pt>';

export async function POST(request: NextRequest) {
  try {
    const { name, email, position, subscribedAt, source, utmSource } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se Resend está configurado
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  RESEND_API_KEY não configurada - emails não serão enviados');
      return NextResponse.json(
        { message: 'Email service not configured' },
        { status: 200 }
      );
    }

    const results = {
      client: null as any,
      admin: null as any,
      errors: [] as string[]
    };

    // ============================================================
    // 1. EMAIL PARA O CLIENTE (Ultra Premium)
    // ============================================================
    try {
      const clientEmail = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Registo Confirmado - DUA',
        html: createClientEmailTemplate(name, position || 1)
      });

      results.client = {
        id: clientEmail.data?.id,
        status: 'sent'
      };

      console.log('✅ Email cliente enviado:', clientEmail.data?.id);
    } catch (error: any) {
      console.error('❌ Erro ao enviar email para cliente:', error);
      results.errors.push(`Cliente: ${error.message}`);
    }

    // ============================================================
    // 2. EMAIL PARA O ADMIN (Notificação com Dados)
    // ============================================================
    try {
      const adminEmail = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🎯 Nova Subscrição #${position || '?'} - ${name}`,
        html: createAdminEmailTemplate({
          name,
          email,
          position: position || 0,
          subscribedAt: subscribedAt || new Date().toISOString(),
          source: source || 'website',
          utmSource: utmSource || 'direct'
        })
      });

      results.admin = {
        id: adminEmail.data?.id,
        status: 'sent'
      };

      console.log('✅ Email admin enviado:', adminEmail.data?.id);
    } catch (error: any) {
      console.error('❌ Erro ao enviar email para admin:', error);
      results.errors.push(`Admin: ${error.message}`);
    }

    // Retornar resultado
    if (results.errors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Alguns emails falharam',
          results,
          errors: results.errors
        },
        { status: 207 } // Multi-Status
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Emails enviados com sucesso',
        results
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Erro no endpoint de email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar emails', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// TEMPLATE EMAIL CLIENTE (Ultra Premium Minimalista)
// ============================================================
function createClientEmailTemplate(name: string, position: number): string {
  return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registo Confirmado - DUA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #000000 0%, #0a0a0a 100%);">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #000000;">
    
    <!-- Header -->
    <tr>
      <td style="padding: 60px 40px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <h1 style="margin: 0; font-size: 48px; font-weight: 100; letter-spacing: 0.1em; color: #ffffff;">
          DUA
        </h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 60px 40px;">
        
        <!-- Title -->
        <h2 style="margin: 0 0 24px; font-size: 24px; font-weight: 300; color: #ffffff; letter-spacing: -0.02em;">
          Registo Confirmado
        </h2>
        
        <!-- Greeting -->
        <p style="margin: 0 0 32px; font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.6;">
          Olá <span style="color: #ffffff; font-weight: 400;">${name}</span>,
        </p>
        
        <!-- Message -->
        <p style="margin: 0 0 40px; font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.6;">
          O teu registo na lista de espera foi confirmado com sucesso.
        </p>
        
        <!-- Position Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 40px; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; backdrop-filter: blur(10px);">
          <tr>
            <td style="padding: 32px; text-align: center;">
              <div style="font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px;">
                Posição na Fila
              </div>
              <div style="font-size: 48px; font-weight: 200; color: #ffffff; letter-spacing: -0.02em;">
                #${position}
              </div>
            </td>
          </tr>
        </table>
        
        <!-- Info -->
        <p style="margin: 0 0 32px; font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.7); line-height: 1.6;">
          Serás notificado assim que o acesso à plataforma estiver disponível.
        </p>
        
        <!-- Link -->
        <p style="margin: 0; font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.5); line-height: 1.6;">
          Já tens código de convite? 
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/acesso" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.3);">
            Aceder agora
          </a>
        </p>
        
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
        <p style="margin: 0; font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.4); line-height: 1.6;">
          DUA - Plataforma de Criação com IA
        </p>
        <p style="margin: 8px 0 0; font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.3);">
          ${new Date().getFullYear()} © Todos os direitos reservados
        </p>
      </td>
    </tr>
    
  </table>
  
</body>
</html>
  `.trim();
}

// ============================================================
// TEMPLATE EMAIL ADMIN (Notificação com Dados Completos)
// ============================================================
interface AdminEmailData {
  name: string;
  email: string;
  position: number;
  subscribedAt: string;
  source: string;
  utmSource: string;
}

function createAdminEmailTemplate(data: AdminEmailData): string {
  const formattedDate = new Date(data.subscribedAt).toLocaleString('pt-PT', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Subscrição - DUA Admin</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    
    <!-- Header Admin -->
    <tr>
      <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-bottom: 3px solid #4CAF50;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
          🎯 Nova Subscrição
        </h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.7);">
          Lista de Espera DUA
        </p>
      </td>
    </tr>
    
    <!-- Alert -->
    <tr>
      <td style="padding: 24px 32px;">
        <div style="padding: 16px; background: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2e7d32;">
            Novo registo recebido com sucesso!
          </p>
        </div>
      </td>
    </tr>
    
    <!-- Data Section -->
    <tr>
      <td style="padding: 0 32px 32px;">
        
        <!-- Subscriber Info -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <tr>
            <td colspan="2" style="padding: 16px; background: #fafafa; border-bottom: 1px solid #e0e0e0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #333333;">
                Dados do Subscriber
              </h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; width: 140px; font-size: 13px; font-weight: 600; color: #666666; border-bottom: 1px solid #f5f5f5;">
              Nome
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #333333; border-bottom: 1px solid #f5f5f5;">
              ${data.name}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #666666; border-bottom: 1px solid #f5f5f5;">
              Email
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #333333; border-bottom: 1px solid #f5f5f5;">
              <a href="mailto:${data.email}" style="color: #1976d2; text-decoration: none;">
                ${data.email}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #666666; border-bottom: 1px solid #f5f5f5;">
              Posição
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #333333; border-bottom: 1px solid #f5f5f5;">
              <strong style="color: #4CAF50;">#${data.position}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #666666;">
              Data/Hora
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #333333;">
              ${formattedDate}
            </td>
          </tr>
        </table>
        
        <!-- Tracking Info -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <tr>
            <td colspan="2" style="padding: 16px; background: #fafafa; border-bottom: 1px solid #e0e0e0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #333333;">
                Informações de Tracking
              </h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; width: 140px; font-size: 13px; font-weight: 600; color: #666666; border-bottom: 1px solid #f5f5f5;">
              Source
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #333333; border-bottom: 1px solid #f5f5f5;">
              ${data.source}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #666666;">
              UTM Source
            </td>
            <td style="padding: 12px 16px; font-size: 14px; color: #333333;">
              ${data.utmSource || '(direct)'}
            </td>
          </tr>
        </table>
        
        <!-- Quick Actions -->
        <div style="padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #333333;">
            Ações Rápidas
          </p>
          <a href="https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/editor" 
             style="display: inline-block; padding: 12px 24px; background: #1976d2; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; margin-right: 8px;">
            Ver no Supabase
          </a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/waitlist" 
             style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
            Gerir Waitlist
          </a>
        </div>
        
      </td>
    </tr>
    
    <!-- Footer Admin -->
    <tr>
      <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e0e0e0; background: #fafafa;">
        <p style="margin: 0; font-size: 13px; color: #666666;">
          DUA Admin Notifications
        </p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #999999;">
          Este email foi enviado automaticamente pelo sistema
        </p>
      </td>
    </tr>
    
  </table>
  
</body>
</html>
  `.trim();
}
