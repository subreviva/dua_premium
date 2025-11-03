
import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// Helper function to get environment variables with robust error handling
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`A variável de ambiente obrigatória "${name}" não está definida.`);
  }
  return value;
}

// Initialize Google Auth
// This should be done outside of the handler function to be reused across invocations.
const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
  // If you have a service account key file, you can specify its path here:
  // keyFile: getEnvVar('GOOGLE_APPLICATION_CREDENTIALS'),
});

/**
 * @swagger
 * /api/auth/ephemeral-token:
 *   get:
 *     summary: Gera um token de acesso efêmero do Google Cloud.
 *     description: |
 *       Este endpoint gera um token de acesso OAuth2 de curta duração que pode ser usado
 *       pelo cliente para autenticar diretamente com as APIs do Google Cloud, como a API Gemini Live.
 *       O token é gerado usando as credenciais do ambiente de serviço (Application Default Credentials).
 *     tags:
 *       - Autenticação
 *     responses:
 *       200:
 *         description: Token de acesso gerado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: O token de acesso OAuth2.
 *                   example: "ya29.c.b0-v2..."
 *                 expires_in:
 *                   type: number
 *                   description: O tempo de vida do token em segundos (geralmente 3600).
 *                   example: 3599
 *       500:
 *         description: Erro interno do servidor ao tentar gerar o token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: A mensagem de erro.
 *                   example: "Não foi possível obter o token de acesso."
 */
export async function GET(req: NextRequest) {
  try {
    // Get an access token
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      console.error('Falha ao obter o token de acesso da Google Auth.');
      return NextResponse.json(
        { error: 'Não foi possível obter o token de acesso.' },
        { status: 500 }
      );
    }

    // The token object contains the token itself and its expiration time.
    // We return it to the client.
    return NextResponse.json({
      token: accessToken.token,
      expires_in: accessToken.res?.data.expires_in || 3599, // Default to slightly less than 1 hour
    });

  } catch (error) {
    console.error('Erro ao gerar o token efêmero:', error);
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    return NextResponse.json(
      { error: 'Erro interno do servidor ao gerar o token.', details: errorMessage },
      { status: 500 }
    );
  }
}
